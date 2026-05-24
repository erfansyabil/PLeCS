<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LearningContent;
use App\Models\LearningPath;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
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

        $tempFile = storage_path('app/temp_catalog_' . auth()->id() . '.json');
        file_put_contents($tempFile, $catalogJson);

        $scriptPath = base_path('storage/scripts/hf_recommend.py');
        $command = sprintf(
            'python %s %s %s %s %s %s 2>&1',
            escapeshellarg($scriptPath),
            escapeshellarg($formLevel),
            escapeshellarg($interestsString),
            escapeshellarg($background),
            escapeshellarg($learningGoal),
            escapeshellarg($tempFile)
        );

        $output = shell_exec($command);
        @unlink($tempFile);

        $outputLines = explode("\n", trim($output));
        $jsonLine = end($outputLines);
        $responseData = json_decode($jsonLine, true);

        if (!$responseData || isset($responseData['error']) || ($responseData['success'] ?? null) === false) {
            Log::error('HF Space error', ['output' => $output]);
            return [];
        }

        if (isset($responseData['recommended_topics']) && is_array($responseData['recommended_topics'])) {
            $responseData['learning_path'] = array_map(fn($t) => ['topic' => (string) $t], $responseData['recommended_topics']);
        }

        return $this->resolveRecommendations($responseData, $catalog);
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
        $path = LearningPath::where('studentID', auth()->id())
            ->where('status', 'Active')
            ->with('courses')
            ->first();

        if (!$path) {
            return response()->json([
                'learning_path' => null,
                'message' => 'No active learning path found. Start by enrolling in a course.',
            ]);
        }

        // Calculate overall progress based on average of enrolled courses' progress
        $totalProgress = $path->courses->avg(function ($course) {
            $enrollment = Enrollment::where('studentID', auth()->id())
                ->where('courseID', $course->id)
                ->first();
            return $enrollment ? $enrollment->progress : 0;
        }) ?? 0;

        $path->currentProgress = round($totalProgress, 2);
        $path->saveQuietly();

        return response()->json([
            'learning_path' => [
                'pathID' => $path->pathID,
                'pathName' => $path->pathName,
                'progress' => $path->currentProgress,
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
            ],
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
            ->firstOrFail();

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
     * Delete (soft delete) the active learning path and drop all enrollments.
     * DELETE /student/learning-path/api
     */
    public function destroy(Request $request): JsonResponse
    {
        $path = LearningPath::where('studentID', auth()->id())
            ->where('status', 'Active')
            ->with('courses')
            ->first();

        if (!$path) {
            return response()->json(['message' => 'No active learning path to delete.'], 404);
        }

        // Drop all enrollments for courses in this path
        foreach ($path->courses as $course) {
            $enrollment = Enrollment::where('studentID', auth()->id())
                ->where('courseID', $course->id)
                ->first();
            
            if ($enrollment && $enrollment->status !== 'dropped') {
                $enrollment->update(['status' => 'dropped']);
            }
        }

        // Soft delete the learning path
        $path->delete();

        return response()->json(['message' => 'Learning path cleared and all enrollments removed.']);
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

        // Deactivate current active path (soft delete)
        $currentPath = LearningPath::where('studentID', auth()->id())
            ->where('status', 'Active')
            ->first();
        if ($currentPath) {
            $currentPath->delete();
        }

        // Create new learning path
        $estimatedMinutes = collect($recommendations)->sum('estimated_hours') * 60;
        $newPath = LearningPath::create([
            'studentID' => auth()->id(),
            'pathName' => 'AI-Generated Path - ' . now()->format('d/m/Y H:i'),
            'complexityLevel' => 'Beginner',
            'isAdaptive' => true,
            'estimatedDuration' => $estimatedMinutes,
            'currentProgress' => 0,
            'status' => 'Active',
            'path_data' => ['survey' => $validated, 'recommendations' => $recommendations],
        ]);

        // Attach courses in order and create enrollments
        foreach ($recommendations as $index => $rec) {
            $newPath->courses()->attach($rec['course_id'], ['order' => $index]);

            Enrollment::updateOrCreate(
                [
                    'studentID' => auth()->id(),
                    'courseID' => $rec['course_id'],
                ],
                [
                    'pathID' => $newPath->pathID,
                    'status' => 'active',
                    'progress' => 0,
                    'enrolled_at' => now(),
                ]
            );
        }

        return response()->json([
            'message' => 'New learning path generated successfully.',
            'learning_path' => $newPath->load('courses'),
        ]);
    }
}