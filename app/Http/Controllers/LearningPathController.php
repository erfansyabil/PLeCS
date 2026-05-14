<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\LearningContent;
use App\Models\LearningPath;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;

class LearningPathController extends Controller
{
    /**
     * Parse comma-separated keywords into an array for recommendation payloads.
     *
     * @return array<int, string>
     */
    private function parseKeywords(?string $keywords): array
    {
        if (! $keywords) {
            return [];
        }

        return collect(explode(',', $keywords))
            ->map(fn ($item) => trim($item))
            ->filter()
            ->values()
            ->all();
    }

    /**
     * Build the active course catalog with topic metadata for the recommender.
     *
     * @return array<int, array<string, mixed>>
     */
    private function courseCatalog(): array
    {
        // Prefer the `courses` table if it exists (we may have migrated learning_contents into it).
        if (\Illuminate\Support\Facades\Schema::hasTable('courses')) {
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
                        'estimated_hours' => $course->estimatedHours,
                        'keywords' => $this->parseKeywords($course->keywords),
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

        // Fallback: read directly from the learning_contents table where type = 'course'.
        return LearningContent::query()
            ->where('type', 'course')
            ->whereNull('parent_id')
            ->orderBy('title')
            ->get()
            ->map(function (LearningContent $course): array {
                $topics = \App\Models\Topic::where('courseID', $course->id)
                    ->where('isActive', true)
                    ->orderBy('orderIndex')
                    ->get();

                return [
                    'course_id' => $course->id,
                    'course_title' => $course->title,
                    'description' => (string) ($course->description ?? ''),
                    'difficulty' => (string) ($course->difficulty_level ?? 'Beginner'),
                    'estimated_hours' => $course->estimated_hours,
                    'keywords' => $this->parseKeywords($course->keywords),
                    'topics' => $topics->map(function ($topic): array {
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
        // Lightweight synonyms mapping to help match English topic names to localized course titles/topics.
        $synonyms = [
            'comput' => ['komput', 'komputer', 'sains komputer', 'asas sains komputer', 'computing'],
            'python' => ['python'],
            'web' => ['web', 'html', 'css', 'javascript', 'pembangunan web', 'web development'],
            'network' => ['rangkaian', 'network', 'communication', 'komunikasi'],
            'cyber' => ['keselamatan', 'cyber', 'cybersecurity', 'keselamatan siber'],
            'data' => ['data', 'pangkalan data', 'database', 'sql'],
        ];

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

                // Try token-level and synonym matching for cross-language topics.
                $tokens = preg_split('/[^a-z0-9]+/i', $normalizedNeedle, -1, PREG_SPLIT_NO_EMPTY);
                foreach ($tokens as $token) {
                    // direct token
                    if ($token !== '' && str_contains($haystack, $token)) {
                        return $course;
                    }

                    // synonyms
                    foreach ($synonyms as $key => $alts) {
                        if (str_starts_with($token, $key)) {
                            foreach ($alts as $alt) {
                                if (str_contains($haystack, $alt)) {
                                    return $course;
                                }
                            }
                        }
                    }
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
                    'estimated_hours' => data_get($item, 'estimated_hours', $matchedCourse['estimated_hours'] ?? null),
                    'keywords' => data_get($item, 'keywords', $matchedCourse['keywords'] ?? []),
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
            // Support the Gradio-style form: form_level, interests (string), background, learning_goal
            'form_level' => ['sometimes', 'string'],
            'interests' => ['required'], // can be string (comma-separated) or array
            'background' => ['sometimes', 'string'],
            'learning_goal' => ['sometimes', 'string'],

            // Backwards-compatible fields (previous UI)
            'experience_level' => ['sometimes', 'string'],
            'learning_style' => ['sometimes', 'string'],
            'time_commitment' => ['sometimes', 'string'],
            'career_goals' => ['sometimes', 'string'],
        ]);

        // Normalize interests into an array for internal use
        $rawInterests = $validated['interests'] ?? [];
        if (is_string($rawInterests)) {
            $interestsArray = array_values(array_filter(array_map(fn($s) => trim($s), explode(',', $rawInterests))));
        } elseif (is_array($rawInterests)) {
            $interestsArray = array_values(array_filter($rawInterests));
        } else {
            $interestsArray = [];
        }

        // Determine learning goal and background with fallbacks to older keys
        $learningGoal = $validated['learning_goal'] ?? $validated['career_goals'] ?? null;
        $background = $validated['background'] ?? null;
        $experienceLevel = $validated['experience_level'] ?? null;

        $spaceUrl = config('services.huggingface.space_url');
        $apiToken = config('services.huggingface.api_token');

        if (! $spaceUrl) {
            return response()->json([
                'message' => 'Hugging Face Space URL is not configured.',
            ], 500);
        }

        $catalog = $this->courseCatalog();

        // Prepare survey copy for storage and ensure interests are normalized
        $surveyForSave = $validated;
        $surveyForSave['interests'] = $interestsArray;
        $surveyForSave['form_level'] = $validated['form_level'] ?? null;
        $surveyForSave['background'] = $background;
        $surveyForSave['learning_goal'] = $learningGoal;
        $surveyForSave['experience_level'] = $experienceLevel;

        // Build payload for the Space.
        // Gradio expects arguments as an array of strings matching the function signature:
        // generate_learning_path(form_level: str, interests: str, background: str, learning_goal: str)
        $interestsString = is_string($rawInterests) ? $rawInterests : implode(', ', $interestsArray);
        $formLevel = $validated['form_level'] ?? 'Form 1';
        $learningGoalStr = $learningGoal ?? 'interest';
        $backgroundStr = $background ?? 'none';

        // Payload as array of 4 string arguments for Gradio
        $payload = [
            'data' => [
                $formLevel,
                $interestsString,
                $backgroundStr,
                $learningGoalStr,
            ]
        ];

        $http = Http::timeout(20)->acceptJson();

        if (! empty($apiToken)) {
            $http = $http->withToken($apiToken);
        }

        try {
            $recommendUrl = rtrim($spaceUrl, '/') . '/recommend';
            \Log::info('HF Space request', [
                'url' => $recommendUrl,
                'payload' => $payload,
            ]);
            $response = $http->post($recommendUrl, $payload);
        } catch (ConnectionException $exception) {
            \Log::error('HF Space connection failed', ['error' => $exception->getMessage()]);
            return response()->json([
                'message' => 'Unable to connect to Hugging Face Space.',
                'error' => $exception->getMessage(),
            ], 502);
        }

        \Log::info('HF Space response', [
            'status' => $response->status(),
            'body' => $response->body(),
        ]);

        if (! $response->successful()) {
            \Log::error('HF Space returned error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return response()->json([
                'message' => 'Unable to fetch recommendations from Hugging Face Space.',
                'status' => $response->status(),
                'error' => $response->body(),
            ], 502);
        }

        // Attempt to normalize responses from different Space implementations.
        // Some Gradio-based Spaces return a structure like: ["{...json...}"] in the `data` array.
        $responseData = $response->json();

        // If Gradio returned a JSON string inside `data[0]`, decode it.
        if (is_array($responseData) && isset($responseData['data']) && is_array($responseData['data']) && isset($responseData['data'][0]) && is_string($responseData['data'][0])) {
            $maybeJson = json_decode($responseData['data'][0], true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($maybeJson)) {
                $responseData = $maybeJson;
            }
        }

        // If the Space returned a simple `recommended_topics` list (as in the Gradio demo),
        // normalize it to the `learning_path` shape expected by `resolveRecommendations()`
        if (isset($responseData['recommended_topics']) && is_array($responseData['recommended_topics'])) {
            $responseData['learning_path'] = array_map(fn($t) => ['topic' => (string) $t], $responseData['recommended_topics']);
        }

        $recommendations = $this->resolveRecommendations($responseData, $catalog);

        LearningPath::create([
            'user_id' => auth()->id(),
            'path_data' => [
                'survey' => $surveyForSave,
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