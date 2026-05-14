<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\LearningPath;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class LearningPathController extends Controller
{
    /**
     * Build the active course catalog with topic metadata for the recommender.
     *
     * @return array<int, array<string, mixed>>
     */
    private function courseCatalog(): array
    {
        return Course::query()
            ->where('isActive', true)
            ->with(['topics' => function ($query) {
                $query->where('isActive', true)->orderBy('orderIndex')->orderBy('name');
            }])
            ->orderBy('courseName')
            ->get()
            ->map(function (Course $course) {
                $topics = $course->topics
                    ->pluck('name')
                    ->filter()
                    ->values()
                    ->all();

                return [
                    'id' => $course->courseID,
                    'title' => $course->courseName,
                    'description' => (string) ($course->description ?? ''),
                    'difficulty' => $course->difficultyLevel,
                    'topics' => $topics,
                    'search_text' => mb_strtolower(implode(' ', array_filter([
                        $course->courseName,
                        $course->description,
                        $course->difficultyLevel,
                        implode(' ', $topics),
                    ]))),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * Find the best matching course from the catalog when the Space returns a topic/title instead of an ID.
     *
     * @param array<int, array<string, mixed>> $catalog
     * @return array<string, mixed>|null
     */
    private function matchCatalogCourse(string $needle, array $catalog): ?array
    {
        $needle = mb_strtolower(trim($needle));

        if ($needle === '') {
            return null;
        }

        foreach ($catalog as $course) {
            $courseTopics = collect($course['topics'] ?? []);
            $courseText = mb_strtolower(implode(' ', array_filter([
                $course['title'] ?? '',
                $course['description'] ?? '',
                implode(' ', $courseTopics->all()),
            ])));

            if (str_contains($courseText, $needle) || str_contains($needle, mb_strtolower((string) ($course['title'] ?? '')))) {
                return $course;
            }

            foreach ($courseTopics as $topic) {
                $topic = mb_strtolower((string) $topic);

                if ($topic !== '' && (str_contains($needle, $topic) || str_contains($topic, $needle))) {
                    return $course;
                }
            }
        }

        return null;
    }

    /**
     * Resolve recommender output back to courses stored in the database.
     *
     * @param array<int, array<string, mixed>> $catalog
     * @return array<int, array<string, mixed>>
     */
    private function resolveRecommendations(array $responseData, array $catalog): array
    {
        $items = collect(data_get($responseData, 'recommendations', data_get($responseData, 'learning_path', [])));

        if ($items->isEmpty()) {
            $items = collect(data_get($responseData, 'recommended_courses', []));
        }

        $catalogById = collect($catalog)->keyBy('id');

        return $items
            ->map(function ($item) use ($catalog, $catalogById) {
                $courseId = data_get($item, 'course_id', data_get($item, 'id'));

                if (is_numeric($courseId) && $catalogById->has((int) $courseId)) {
                    $course = $catalogById->get((int) $courseId);
                } else {
                    $course = $this->matchCatalogCourse((string) data_get($item, 'course_title', data_get($item, 'title', data_get($item, 'topic', ''))), $catalog);
                }

                if (! $course) {
                    return null;
                }

                return [
                    'id' => $course['id'],
                    'title' => $course['title'],
                    'description' => $course['description'],
                    'difficulty' => $course['difficulty'],
                    'topics' => $course['topics'],
                    'reason' => (string) data_get($item, 'reason', data_get($item, 'note', 'Matched to your survey answers and database subjects.')),
                    'score' => data_get($item, 'score', data_get($item, 'match_score')),
                    'enroll_url' => route('student.learning-content.show', $course['id']),
                ];
            })
            ->filter()
            ->unique('id')
            ->values()
            ->all();
    }

    public function recommend(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'interests' => ['required', 'array', 'min:1'],
            'interests.*' => ['string'],
            'experience_level' => ['required', 'string'],
            'learning_style' => ['required', 'string'],
            'time_commitment' => ['required', 'string'],
            'career_goals' => ['required', 'string'],
        ]);

        $spaceUrl = config('services.huggingface.space_url');
        $apiToken = config('services.huggingface.api_token');

        if (! $spaceUrl) {
            return response()->json([
                'message' => 'Hugging Face Space URL is not configured.',
            ], 500);
        }

        $catalog = $this->courseCatalog();

        $payload = [
            'survey' => $validated,
            'weak_topics' => $validated['interests'],
            'strong_topics' => [],
            'interest' => $validated['career_goals'],
            'level' => $validated['experience_level'],
            'learning_pace' => $validated['time_commitment'],
            'catalog_subjects' => $catalog,
        ];

        $http = Http::timeout(20)->acceptJson();

        if (! empty($apiToken)) {
            $http = $http->withToken($apiToken);
        }

        $response = $http->post($spaceUrl, $payload);

        if (! $response->successful()) {
            return response()->json([
                'message' => 'Unable to fetch recommendations from Hugging Face Space.',
                'status' => $response->status(),
                'error' => $response->body(),
            ], 502);
        }

        $responseData = $response->json();
        $recommendations = $this->resolveRecommendations($responseData, $catalog);

        if ($recommendations === []) {
            $recommendations = collect($catalog)
                ->take(3)
                ->map(function (array $course) {
                    return [
                        'id' => $course['id'],
                        'title' => $course['title'],
                        'description' => $course['description'],
                        'difficulty' => $course['difficulty'],
                        'topics' => $course['topics'],
                        'reason' => 'Fallback recommendation from the current database catalog.',
                        'enroll_url' => route('student.learning-content.show', $course['id']),
                    ];
                })
                ->values()
                ->all();
        }

        LearningPath::create([
            'user_id' => auth()->id(),
            'path_data' => [
                'survey' => $validated,
                'space_payload' => $payload,
                'space_response' => $responseData,
                'catalog_subjects' => $catalog,
                'resolved_recommendations' => $recommendations,
            ],
        ]);

        return response()->json([
            'message' => 'Recommendations generated successfully.',
            'recommendations' => $recommendations,
            'catalog_subjects' => $catalog,
            'raw' => $responseData,
        ]);
    }

}
