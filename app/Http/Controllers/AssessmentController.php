<?php

namespace App\Http\Controllers;

use App\Models\CodingExercise;
use App\Models\CodingExerciseAttempt;
use App\Models\Enrollment;
use App\Models\LearningContent;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\Topic;
use App\Services\StudentProgressService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssessmentController extends Controller
{
    public function __construct(
        private readonly StudentProgressService $progress,
    ) {}

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function ensureEnrollment(LearningContent $course): void
    {
        abort_unless(
            Enrollment::query()
                ->where('studentID', auth()->id())
                ->where('courseID', $course->id)
                ->whereIn('status', ['active', 'completed'])
                ->exists(),
            403
        );
    }

    private function gradeQuiz(Quiz $quiz, array $answers): array
    {
        $questions = $quiz->questions ?? [];
        $score     = 0;
        $maxScore  = 0;
        $feedback  = [];

        foreach ($questions as $index => $question) {
            $points   = (int) ($question['points'] ?? max(1, (int) floor($quiz->points / max(count($questions), 1))));
            $maxScore += $points;

            // Questions use correct_option_id (UUID), not correct_index
            $correctOptionId  = (string) ($question['correct_option_id'] ?? '');
            $selectedOptionId = isset($answers[$index]) ? (string) $answers[$index] : null;
            $isCorrect        = $selectedOptionId !== null && $selectedOptionId === $correctOptionId;

            if ($isCorrect) {
                $score += $points;
            }

            // Resolve display values for the result panel
            $options        = $question['options'] ?? [];
            $selectedOption = collect($options)->firstWhere('id', $selectedOptionId);
            $correctOption  = collect($options)->firstWhere('id', $correctOptionId);

            $feedback[] = [
                'question'           => $question['question'] ?? ('Question ' . ($index + 1)),
                'selected_option_id' => $selectedOptionId,
                'correct_option_id'  => $correctOptionId,
                'is_correct'         => $isCorrect,
                'points'             => $points,
                'explanation'        => $question['explanation'] ?? null,
                'options'            => $options,
                'selected_value'     => $selectedOption['value'] ?? $selectedOption['url'] ?? null,
                'correct_value'      => $correctOption['value'] ?? $correctOption['url'] ?? null,
            ];
        }

        $passed = $maxScore > 0 && $score >= (int) ceil($maxScore * 0.6);

        return [$score, $maxScore, $passed, $feedback];
    }

    private function gradeCodingExercise(CodingExercise $exercise, string $submissionCode): array
    {
        $testCases = $exercise->test_cases ?? [];
        $score     = 0;
        $maxScore  = 0;
        $feedback  = [];

        foreach ($testCases as $index => $testCase) {
            $points   = (int) ($testCase['points'] ?? max(1, (int) floor($exercise->points / max(count($testCases), 1))));
            $maxScore += $points;

            $requiredSnippets = collect($testCase['must_contain'] ?? [])
                ->filter()
                ->map(fn ($item) => (string) $item)
                ->values()
                ->all();

            $missingSnippets = [];
            foreach ($requiredSnippets as $snippet) {
                if (! str_contains(mb_strtolower($submissionCode), mb_strtolower($snippet))) {
                    $missingSnippets[] = $snippet;
                }
            }

            $isCorrect = empty($missingSnippets);

            if ($isCorrect) {
                $score += $points;
            }

            $feedback[] = [
                'label'             => $testCase['label'] ?? ('Test Case ' . ($index + 1)),
                'is_correct'        => $isCorrect,
                'required_snippets' => $requiredSnippets,
                'missing_snippets'  => $missingSnippets,
                'points'            => $points,
            ];
        }

        $passed = $maxScore > 0 && $score >= (int) ceil($maxScore * 0.6);

        return [$score, $maxScore, $passed, $feedback];
    }

    // -------------------------------------------------------------------------
    // Course list
    // -------------------------------------------------------------------------

    public function index()
    {
        $studentId = auth()->id();

        $courses = Enrollment::query()
            ->where('studentID', $studentId)
            ->where('status', 'active')
            ->with('course:id,title,description')
            ->orderByDesc('enrolled_at')
            ->get()
            ->map(function (Enrollment $enrollment) use ($studentId) {
                $course = $enrollment->course;

                if (! $course) {
                    return null;
                }

                // Quizzes now belong to topics, so count through topics
                $topicIds = Topic::where('courseID', $course->id)->pluck('topicID');

                $quizzesCount = Quiz::whereIn('topic_id', $topicIds)
                    ->where('is_published', true)
                    ->count();

                $codingExercisesCount = CodingExercise::where('course_id', $course->id)
                    ->where('is_published', true)
                    ->count();

                return [
                    'id'                     => $course->id,
                    'title'                  => $course->title,
                    'description'            => $course->description,
                    'quizzes_count'          => $quizzesCount,
                    'coding_exercises_count' => $codingExercisesCount,
                    'enrolled_at'            => optional($enrollment->enrolled_at)?->format('Y-m-d H:i'),
                ];
            })
            ->filter()
            ->values();

        return Inertia::render('Student/Assessment/index', [
            'courses'       => $courses,
            'studentPoints' => auth()->user()->points ?? 0,
            'streak'        => $this->progress->getCurrentStreak($studentId),
        ]);
    }

    // -------------------------------------------------------------------------
    // Course detail — topics with their quizzes
    // -------------------------------------------------------------------------

    public function showCourse(LearningContent $course)
    {
        $this->ensureEnrollment($course);

        $studentId = auth()->id();

        // Load topics with only published quizzes
        $topics = Topic::query()
            ->where('courseID', $course->id)
            ->where('isActive', true)
            ->orderBy('orderIndex')
            ->with(['quizzes' => fn ($q) => $q->where('is_published', true)->orderBy('title')])
            ->get()
            ->map(function (Topic $topic) use ($studentId) {
                $quizzes = $topic->quizzes->map(function (Quiz $quiz) use ($studentId) {
                    $latest = QuizAttempt::query()
                        ->where('quiz_id', $quiz->id)
                        ->where('student_id', $studentId)
                        ->latest('submitted_at')
                        ->first(['score', 'max_score', 'passed']);

                    return [
                        'id'               => $quiz->id,
                        'title'            => $quiz->title,
                        'description'      => $quiz->description,
                        'difficulty_level' => $quiz->difficulty_level,
                        'points'           => $quiz->points,
                        'questions_count'  => count($quiz->questions ?? []),
                        'latest_attempt'   => $latest ? [
                            'score'     => $latest->score,
                            'max_score' => $latest->max_score,
                            'passed'    => $latest->passed,
                        ] : null,
                    ];
                })->values();

                return [
                    'id'          => $topic->topicID,
                    'title'       => $topic->name,
                    'description' => $topic->description,
                    'quizzes'     => $quizzes,
                ];
            })
            ->values();

        $codingExercises = CodingExercise::query()
            ->where('course_id', $course->id)
            ->where('is_published', true)
            ->orderBy('title')
            ->get()
            ->map(function (CodingExercise $exercise) use ($studentId) {
                $latest = CodingExerciseAttempt::query()
                    ->where('coding_exercise_id', $exercise->id)
                    ->where('student_id', $studentId)
                    ->latest('submitted_at')
                    ->first(['score', 'max_score', 'passed']);

                return [
                    'id'               => $exercise->id,
                    'title'            => $exercise->title,
                    'description'      => $exercise->description,
                    'difficulty_level' => $exercise->difficulty_level,
                    'points'           => $exercise->points,
                    'test_cases_count' => count($exercise->test_cases ?? []),
                    'latest_attempt'   => $latest ? [
                        'score'     => $latest->score,
                        'max_score' => $latest->max_score,
                        'passed'    => $latest->passed,
                    ] : null,
                ];
            })
            ->values();

        return Inertia::render('Student/Assessment/course', [
            'course' => [
                'id'          => $course->id,
                'title'       => $course->title,
                'description' => $course->description,
            ],
            'topics'          => $topics,
            'codingExercises' => $codingExercises,
        ]);
    }

    // -------------------------------------------------------------------------
    // Quiz attempt
    // -------------------------------------------------------------------------

    public function showQuiz(LearningContent $course, Topic $topic, Quiz $quiz)
    {
        $this->ensureEnrollment($course);
        abort_unless((int) $topic->courseID === (int) $course->id, 404);
        abort_unless((int) $quiz->topic_id === (int) $topic->topicID, 404);
        abort_unless($quiz->is_published, 404);

        $latestAttempt = QuizAttempt::query()
            ->where('quiz_id', $quiz->id)
            ->where('student_id', auth()->id())
            ->latest('submitted_at')
            ->first();

        return Inertia::render('Student/Assessment/quiz', [
            'course' => [
                'id'    => $course->id,
                'title' => $course->title,
            ],
            // FIX 1: pass topic as its own prop so quiz.jsx can access it
            'topic' => [
                'id'   => $topic->topicID,
                'name' => $topic->name,
            ],
            'quiz' => [
                'id'               => $quiz->id,
                'title'            => $quiz->title,
                'description'      => $quiz->description,
                'difficulty_level' => $quiz->difficulty_level,
                'points'           => $quiz->points,
                'questions'        => $quiz->questions ?? [],
            ],
            'latestAttempt' => $latestAttempt ? [
                'score'        => $latestAttempt->score,
                'max_score'    => $latestAttempt->max_score,
                'passed'       => $latestAttempt->passed,
                'feedback'     => $latestAttempt->feedback ?? [],
                'submitted_at' => optional($latestAttempt->submitted_at)?->format('Y-m-d H:i'),
            ] : null,
        ]);
    }

    public function storeQuizAttempt(Request $request, LearningContent $course, Topic $topic, Quiz $quiz)
    {
        $this->ensureEnrollment($course);
        abort_unless((int) $topic->courseID === (int) $course->id, 404);
        abort_unless((int) $quiz->topic_id === (int) $topic->topicID, 404);
        abort_unless($quiz->is_published, 404);

        $validated = $request->validate([
            'answers' => ['required', 'array'],
        ]);

        [$score, $maxScore, $passed, $feedback] = $this->gradeQuiz($quiz, $validated['answers']);

        QuizAttempt::create([
            'quiz_id'      => $quiz->id,
            'student_id'   => auth()->id(),
            'answers'      => $validated['answers'],
            'score'        => $score,
            'max_score'    => $maxScore,
            'passed'       => $passed,
            'feedback'     => $feedback,
            'submitted_at' => now(),
        ]);

        $this->progress->recordAttempt(
            studentId:    auth()->id(),
            pointsEarned: $score,
            passed:       $passed,
        );

        $this->progress->recalculateAnalytics(auth()->id(), $topic->topicID);
        $this->progress->recomputeEnrollmentProgress(auth()->id(), $course->id);

        $redirect = redirect()->route('student.assessment.quiz.show', [
            'course' => $course->id,
            'topic'  => $topic->topicID,
            'quiz'   => $quiz->id,
        ]);

        if (! $passed) {
            $redirect->with('gap_warning', "Knowledge gap identified in \"{$quiz->title}\". Your score ({$score}/{$maxScore}) is below the passing threshold. Review the topic content and try again to strengthen your understanding.");
        }

        return $redirect;
    }

    // -------------------------------------------------------------------------
    // Coding exercise
    // -------------------------------------------------------------------------

    public function showCodingExercise(LearningContent $course, CodingExercise $codingExercise)
    {
        $this->ensureEnrollment($course);
        abort_unless((int) $codingExercise->course_id === (int) $course->id, 404);
        abort_unless($codingExercise->is_published, 404);

        $latestAttempt = CodingExerciseAttempt::query()
            ->where('coding_exercise_id', $codingExercise->id)
            ->where('student_id', auth()->id())
            ->latest('submitted_at')
            ->first();

        return Inertia::render('Student/Assessment/coding-exercise', [
            'course' => ['id' => $course->id, 'title' => $course->title],
            'codingExercise' => [
                'id'               => $codingExercise->id,
                'title'            => $codingExercise->title,
                'description'      => $codingExercise->description,
                'difficulty_level' => $codingExercise->difficulty_level,
                'points'           => $codingExercise->points,
                'instructions'     => $codingExercise->instructions,
                'starter_code'     => $codingExercise->starter_code,
                'test_cases'       => $codingExercise->test_cases ?? [],
            ],
            'latestAttempt' => $latestAttempt ? [
                'score'           => $latestAttempt->score,
                'max_score'       => $latestAttempt->max_score,
                'passed'          => $latestAttempt->passed,
                'feedback'        => $latestAttempt->feedback ?? [],
                'submitted_at'    => optional($latestAttempt->submitted_at)?->format('Y-m-d H:i'),
                'submission_code' => $latestAttempt->submission_code,
            ] : null,
        ]);
    }

    public function storeCodingExerciseAttempt(Request $request, LearningContent $course, CodingExercise $codingExercise)
    {
        $this->ensureEnrollment($course);
        abort_unless((int) $codingExercise->course_id === (int) $course->id, 404);
        abort_unless($codingExercise->is_published, 404);

        $validated = $request->validate([
            'submission_code' => ['required', 'string'],
        ]);

        [$score, $maxScore, $passed, $feedback] = $this->gradeCodingExercise($codingExercise, $validated['submission_code']);

        CodingExerciseAttempt::create([
            'coding_exercise_id' => $codingExercise->id,
            'student_id'         => auth()->id(),
            'submission_code'    => $validated['submission_code'],
            'score'              => $score,
            'max_score'          => $maxScore,
            'passed'             => $passed,
            'feedback'           => $feedback,
            'status'             => $passed ? 'passed' : 'submitted',
            'submitted_at'       => now(),
        ]);

        $this->progress->recordAttempt(
            studentId:    auth()->id(),
            pointsEarned: $score,
            passed:       $passed,
        );

        $this->progress->recomputeEnrollmentProgress(auth()->id(), $course->id);

        $redirect = redirect()->route('student.assessment.coding-exercise.show', [
            $course->id,
            $codingExercise->id,
        ]);

        if (! $passed) {
            $redirect->with('gap_warning', "Knowledge gap identified in \"{$codingExercise->title}\". Your score ({$score}/{$maxScore}) is below the passing threshold. Review the instructions and missing requirements, then try again.");
        }

        return $redirect;
    }
}