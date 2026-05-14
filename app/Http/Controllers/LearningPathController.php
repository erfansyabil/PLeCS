<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\LearningPath;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
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
            ->with([
                'topics' => fn ($query) => $query->where('isActive', true)->orderBy('orderIndex'),
            ])
            ->orderBy('courseName')
            ->get()
            ->map(function (Course $course): array {
                return [
                    'course_id' => $course->courseID,
                    'course_title' => $course->courseName,
                    'description' => (string) ($course->description ?? ''),
                    'difficulty' => (string) ($course->difficultyLevel ?? 'Beginner'),
                    'topics' => $course->topics->map(function ($topic): array {
                        return [
                            'name' => (string) $topic->name,
                            'description' => (string) ($topic->description ?? ''),
                            'difficulty' => (string) ($topic->difficultyLevel ?? 'Beginner'),
                        ];
                    })->values()->all(),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * Try to match a Space recommendation back to a database course.
     *
     * @param array<int, array<string, mixed>> $catalog
     */
    private function matchCatalogCourse(string $needle, array $catalog): ?array
    {
        $normalizedNeedle = strtolower(trim($needle));

        foreach ($catalog as $course) {
            $haystacks = array_filter([
                strtolower((string) ($course['course_title'] ?? '')),
                strtolower((string) ($course['description'] ?? '')),
                strtolower(implode(' ', Arr::pluck($course['topics'] ?? [], 'name'))),
                strtolower(implode(' ', Arr::pluck($course['topics'] ?? [], 'description'))),
            ]);

            foreach ($haystacks as $haystack) {
                if ($haystack !== '' && str_contains($haystack, $normalizedNeedle)) {
                    return $course;
                }
            }
        }

        return null;
    }

    /**
     * Normalize response payloads from the Space into enrollable recommendations.
     *
     * @param array<string, mixed> $responseData
     * @param array<int, array<string, mixed>> $catalog
     * @return array<int, array<string, mixed>>
     */
    private function resolveRecommendations(array $responseData, array $catalog): array
    {
        $items = data_get($responseData, 'learning_path')
            ?? data_get($responseData, 'recommendations')
            ?? data_get($responseData, 'recommended_courses')
            ?? [];

        return collect(is_array($items) ? $items : [])
            ->map(function (mixed $item) use ($catalog): ?array {
                if (! is_array($item)) {
                    return null;
                }

                $courseId = data_get($item, 'course_id') ?? data_get($item, 'id');
                $matchedCourse = null;

                if (is_numeric($courseId)) {
                    foreach ($catalog as $course) {
                        if ((int) $course['course_id'] === (int) $courseId) {
                            $matchedCourse = $course;
                            break;
                        }
                    }
                }

                if (! $matchedCourse) {
                    $candidateTitle = (string) (data_get($item, 'course_title') ?? data_get($item, 'topic') ?? data_get($item, 'title') ?? '');
                    if ($candidateTitle !== '') {
                        $matchedCourse = $this->matchCatalogCourse($candidateTitle, $catalog);
                    }
                }

                if (! $matchedCourse) {
                    return null;
                }

                return [
                    'course_id' => $matchedCourse['course_id'],
                    'course_title' => $matchedCourse['course_title'],
                    'difficulty' => data_get($item, 'difficulty', $matchedCourse['difficulty']),
                    'topics' => $matchedCourse['topics'],
                    'reason' => (string) data_get($item, 'reason', ''),
                    'score' => data_get($item, 'score'),
                    'enroll_url' => route('student.learning-content.show', ['id' => $matchedCourse['course_id']]),
                ];
            })
            ->filter()
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

        try {
            $response = $http->post($spaceUrl, $payload);
        } catch (ConnectionException $exception) {
            return response()->json([
                'message' => 'Unable to connect to Hugging Face Space.',
                'error' => $exception->getMessage(),
            ], 502);
        }

        if (! $response->successful()) {
            return response()->json([
                'message' => 'Unable to fetch recommendations from Hugging Face Space.',
                'status' => $response->status(),
                'error' => $response->body(),
            ], 502);
        }

        $responseData = $response->json();
        $recommendations = $this->resolveRecommendations($responseData, $catalog);

        LearningPath::create([
            'user_id' => auth()->id(),
            'path_data' => [
                'survey' => $validated,
                'space_payload' => $payload,
                'space_response' => $responseData,
                'catalog' => $catalog,
                'resolved_recommendations' => $recommendations,
            ],
        ]);

        return response()->json([
            'message' => 'Recommendations generated successfully.',
            'recommendations' => $recommendations,
            'raw' => $responseData,
        ]);
    }
}