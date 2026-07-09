<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LearningContent;
use App\Models\LearningPath;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class LearningPathController extends Controller
{
    // ┌─────────────────────────────────────────────────────────────────────────┐
    // │                    Existing Methods (keep as is)                       │
    // └─────────────────────────────────────────────────────────────────────────┘

    /**
     * Parse comma-separated keywords into an array for recommendation payloads.
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
        if (Schema::hasTable('courses')) {
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
     */
    private function matchCatalogCourse(string $needle, array $catalog): ?array
    {
        $normalizedNeedle = strtolower(trim($needle));
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

                $tokens = preg_split('/[^a-z0-9]+/i', $normalizedNeedle, -1, PREG_SPLIT_NO_EMPTY);
                foreach ($tokens as $token) {
                    if ($token !== '' && str_contains($haystack, $token)) {
                        return $course;
                    }
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
     */
    private function resolveRecommendations(array $responseData, array $catalog): array
    {
        $items = data_get($responseData, 'learning_path')
            ?? data_get($responseData, 'recommendations')
            ?? data_get($responseData, 'recommended_courses')
            ?? [];

        $seenCourseIDs = [];

        return collect(is_array($items) ? $items : [])
            ->map(function (mixed $item) use ($catalog, &$seenCourseIDs): ?array {
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

    /**
     * Serialize a path for the student UI.
     */
    private function formatLearningPath(LearningPath $path): array
    {
        $path->loadMissing('courses');

        return [
            'pathID' => $path->pathID,
            'pathName' => $path->pathName,
            'status' => $path->status,
            'progress' => (float) $path->currentProgress,
            'courses' => $path->courses->map(function ($course) {
                $enrollment = Enrollment::where('studentID', auth()->id())
                    ->where('courseID', $course->id)
                    ->first();

                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'description' => $course->description,
                    'difficulty' => $course->difficulty_level ?? 'Beginner',
                    'order' => $course->pivot->order,
                    'progress' => $enrollment ? $enrollment->progress : 0,
                    'enroll_url' => route('student.learning-content.show', $course->id),
                ];
            })->sortBy('order')->values(),
        ];
    }

    /**
     * Serialize the next suggested course for a path.
     */
    private function formatNextCourse(?LearningContent $course): ?array
    {
        if (! $course) {
            return null;
        }

        return [
            'id' => $course->id,
            'title' => $course->title,
            'description' => $course->description,
            'difficulty' => $course->difficulty_level ?? 'Beginner',
            'enroll_url' => route('student.learning-content.show', $course->id),
        ];
    }

    /**
     * Recompute the path progress from enrolled courses.
     * Marks the path Completed when every course reaches 100%.
     */
    private function syncPathProgress(LearningPath $path): float
    {
        $courseIds = $path->courses()->pluck('courseID');

        if ($courseIds->isEmpty()) {
            $path->currentProgress = 0;
            $path->saveQuietly();

            return 0;
        }

        $progress = Enrollment::query()
            ->where('studentID', auth()->id())
            ->whereIn('courseID', $courseIds)
            ->avg('progress') ?? 0;

        $path->currentProgress = round((float) $progress, 2);

        if ($path->currentProgress >= 100 && $path->status === 'Active') {
            $path->status = 'Completed';
        }

        $path->saveQuietly();

        return $path->currentProgress;
    }

    /**
     * Core recommendation logic: call Hugging Face Space and return resolved courses.
     */
    private function getRecommendationsFromSpace(array $validated): array
    {
        $rawInterests = $validated['interests'] ?? [];
        if (is_string($rawInterests)) {
            $interestsString = $rawInterests;
        } elseif (is_array($rawInterests)) {
            $interestsString = implode(', ', $rawInterests);
        } else {
            $interestsString = '';
        }

        $learningGoal = $validated['learning_goal'] ?? $validated['career_goals'] ?? 'interest';
        $background = $validated['background'] ?? 'none';
        $formLevel = $validated['form_level'] ?? 'Form 1';

        $catalog = $this->courseCatalog();
        $catalogJson = json_encode($catalog);

        $baseUrl = 'https://ethe1k-plecs-recommender.hf.space';

        try {
            $submitResponse = Http::timeout(30)->post("{$baseUrl}/gradio_api/call/generate_learning_path", [
                'data' => [$formLevel, $interestsString, $background, $learningGoal, $catalogJson],
            ]);

            $eventId = $submitResponse->json('event_id');

            if (!$submitResponse->successful() || !$eventId) {
                Log::error('HF Space error', ['output' => $submitResponse->body()]);
                return [];
            }

            $streamResponse = Http::timeout(60)
                ->withHeaders(['Accept' => 'text/event-stream'])
                ->get("{$baseUrl}/gradio_api/call/generate_learning_path/{$eventId}");

            $responseData = $this->parseGradioEventStream($streamResponse->body());
        } catch (\Throwable $e) {
            Log::error('HF Space error', ['output' => $e->getMessage()]);
            return [];
        }

        if (!$responseData || isset($responseData['error']) || ($responseData['success'] ?? null) === false) {
            Log::error('HF Space error', ['output' => json_encode($responseData)]);
            return [];
        }

        if (isset($responseData['recommended_topics']) && is_array($responseData['recommended_topics'])) {
            $responseData['learning_path'] = array_map(fn($t) => ['topic' => (string) $t], $responseData['recommended_topics']);
        }

        return $this->resolveRecommendations($responseData, $catalog);
    }

    /**
     * Parse a Gradio queue SSE response body and decode the "complete" event's
     * payload back into the associative array the recommender returns.
     */
    private function parseGradioEventStream(string $raw): ?array
    {
        $event = null;

        foreach (explode("\n", $raw) as $line) {
            $line = rtrim($line, "\r");

            if (str_starts_with($line, 'event:')) {
                $event = trim(substr($line, 6));
                continue;
            }

            if (!str_starts_with($line, 'data:')) {
                continue;
            }

            $dataLine = trim(substr($line, 5));

            if ($event === 'complete') {
                $decoded = json_decode($dataLine, true);
                $result = is_array($decoded) ? ($decoded[0] ?? null) : null;

                return is_string($result) ? json_decode($result, true) : $result;
            }

            if ($event === 'error') {
                return ['success' => false, 'error' => $dataLine];
            }
        }

        return null;
    }

    /**
     * Existing recommend endpoint (kept for backward compatibility).
     */
    public function recommend(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'form_level' => ['sometimes', 'string'],
            'interests' => ['required'],
            'background' => ['sometimes', 'string'],
            'learning_goal' => ['sometimes', 'string'],
            'experience_level' => ['sometimes', 'string'],
            'learning_style' => ['sometimes', 'string'],
            'time_commitment' => ['sometimes', 'string'],
            'career_goals' => ['sometimes', 'string'],
        ]);

        $recommendations = $this->getRecommendationsFromSpace($validated);

        if (empty($recommendations)) {
            return response()->json(['message' => 'No recommendations could be generated.'], 422);
        }

        return response()->json([
            'message' => 'Recommendations generated successfully.',
            'recommendations' => $recommendations,
        ]);
    }

    // ┌─────────────────────────────────────────────────────────────────────────┐
    // │                   NEW METHODS FOR UC008 (Manage Learning Path)         │
    // └─────────────────────────────────────────────────────────────────────────┘

    /**
     * Get the current active learning path for the authenticated student.
     * GET /student/learning-path/api
     */
    public function show(Request $request): JsonResponse
    {
        $activePath = LearningPath::where('studentID', auth()->id())
            ->where('status', 'Active')
            ->with('courses')
            ->first();

        $draftPath = LearningPath::where('studentID', auth()->id())
            ->where('status', 'Paused')
            ->with('courses')
            ->latest('updated_at')
            ->first();

        if (! $activePath && ! $draftPath) {
            return response()->json([
                'learning_path' => null,
                'draft_learning_path' => null,
                'message' => 'No active learning path found. Start by enrolling in a course.',
            ]);
        }

        $learningPathPayload = null;

        if ($activePath) {
            $this->syncPathProgress($activePath);
            $learningPathPayload = $this->formatLearningPath($activePath);
            $learningPathPayload['next_course'] = $this->formatNextCourse($activePath->getNextRecommendedCourse());
        }

        $draftPathPayload = null;

        if ($draftPath) {
            $this->syncPathProgress($draftPath);
            $draftPathPayload = $this->formatLearningPath($draftPath);
            $draftPathPayload['next_course'] = null;
        }

        return response()->json([
            'learning_path' => $learningPathPayload,
            'draft_learning_path' => $draftPathPayload,
        ]);
    }

    /**
     * Reorder courses within the active learning path.
     * PUT /student/learning-path/reorder
     * Body: { "course_order": [45, 12, 78] }
     */
    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'course_order' => 'required|array',
            'course_order.*' => 'integer|exists:learning_contents,id',
        ]);

        $path = LearningPath::where('studentID', auth()->id())
            ->where('status', 'Active')
            ->first();

        if (! $path) {
            $path = LearningPath::where('studentID', auth()->id())
                ->where('status', 'Paused')
                ->latest('updated_at')
                ->firstOrFail();
        }

        $currentCourseIds = $path->courses()->pluck('courseID')->toArray();
        foreach ($validated['course_order'] as $courseId) {
            if (!in_array($courseId, $currentCourseIds)) {
                return response()->json(['message' => 'Invalid course ID in order list'], 422);
            }
        }

        foreach ($validated['course_order'] as $index => $courseId) {
            $path->courses()->updateExistingPivot($courseId, ['order' => $index]);
        }

        return response()->json([
            'message' => 'Course order updated successfully.',
            'course_order' => $validated['course_order'],
        ]);
    }

    /**
     * Clear the student's learning path state and drop linked enrollments.
     * DELETE /student/learning-path/api
     */
    public function destroy(Request $request): JsonResponse
    {
        $paths = LearningPath::where('studentID', auth()->id())
            ->whereIn('status', ['Active', 'Paused'])
            ->with('courses')
            ->get();

        if ($paths->isEmpty()) {
            return response()->json(['message' => 'No learning path to clear.'], 404);
        }

        DB::transaction(function () use ($paths) {
            $pathIds = $paths->pluck('pathID');

            Enrollment::where('studentID', auth()->id())
                ->whereIn('pathID', $pathIds)
                ->update(['status' => 'dropped']);

            foreach ($paths as $path) {
                $path->delete();
            }
        });

        return response()->json(['message' => 'Learning path cleared and linked enrollments dropped.']);
    }

    /**
     * Generate a new learning path from survey (AI via Hugging Face).
     * POST /student/learning-path/generate
     * Body: { form_level, interests, background, learning_goal }
     */
    public function generateFromSurvey(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'form_level' => 'sometimes|string',
            'interests' => 'required',
            'background' => 'sometimes|string',
            'learning_goal' => 'sometimes|string',
        ]);

        $recommendations = $this->getRecommendationsFromSpace($validated);

        if (empty($recommendations)) {
            return response()->json(['message' => 'No recommendations could be generated.'], 422);
        }

        // Replace any existing draft so only one pending draft exists at a time.
        LearningPath::where('studentID', auth()->id())
            ->where('status', 'Paused')
            ->delete();

        // Create a draft path so the student can review it before activation.
        $estimatedMinutes = collect($recommendations)->sum('estimated_hours') * 60;
        $newPath = LearningPath::create([
            'studentID' => auth()->id(),
            'pathName' => 'Draft Learning Path - ' . now()->format('d/m/Y H:i'),
            'complexityLevel' => 'Beginner',
            'isAdaptive' => true,
            'estimatedDuration' => $estimatedMinutes,
            'currentProgress' => 0,
            'status' => 'Paused',
            'path_data' => ['survey' => $validated, 'recommendations' => $recommendations],
        ]);

        // Attach courses in order; activation happens explicitly from the UI.
        foreach ($recommendations as $index => $rec) {
            $newPath->courses()->attach($rec['course_id'], ['order' => $index]);
        }

        return response()->json([
            'message' => 'Draft learning path generated successfully.',
            'learning_path' => $this->formatLearningPath($newPath),
        ]);
    }

    /**
     * Activate a draft learning path and sync enrollments.
     */
    public function activateGeneratedPath(Request $request, int $pathId): JsonResponse
    {
        $path = LearningPath::where('studentID', auth()->id())
            ->where('pathID', $pathId)
            ->where('status', 'Paused')
            ->with('courses')
            ->firstOrFail();

        DB::transaction(function () use ($path) {
            $currentActive = LearningPath::where('studentID', auth()->id())
                ->where('status', 'Active')
                ->first();

            if ($currentActive && $currentActive->pathID !== $path->pathID) {
                $currentActive->update(['status' => 'Paused']);
            }

            $path->update([
                'status' => 'Active',
                'currentProgress' => $path->currentProgress ?? 0,
            ]);

            foreach ($path->courses as $course) {
                $existingEnrollment = Enrollment::where('studentID', auth()->id())
                    ->where('courseID', $course->id)
                    ->first();

                Enrollment::updateOrCreate(
                    [
                        'studentID' => auth()->id(),
                        'courseID' => $course->id,
                    ],
                    [
                        'pathID' => $path->pathID,
                        'status' => 'active',
                        'progress' => $existingEnrollment?->progress ?? 0,
                        'enrolled_at' => $existingEnrollment?->enrolled_at ?? now(),
                    ]
                );
            }

            $this->syncPathProgress($path);
        });

        return response()->json([
            'message' => 'Draft learning path activated successfully.',
            'learning_path' => $this->formatLearningPath($path->fresh('courses')),
        ]);
    }
}