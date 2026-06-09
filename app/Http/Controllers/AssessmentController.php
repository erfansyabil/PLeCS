<?php

namespace App\Http\Controllers;

use App\Models\CodingExercise;
use App\Models\CodingExerciseAttempt;
use App\Models\Enrollment;
use App\Models\LearningContent;
use App\Models\Quiz;
use App\Models\QuizAttempt;
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
                ->where('status', 'active')
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

            $correctIndex   = (string) ($question['correct_index'] ?? '');
            $selectedAnswer = isset($answers[$index]) ? (string) $answers[$index] : null;
            $isCorrect      = $selectedAnswer !== null && $selectedAnswer === $correctIndex;

            if ($isCorrect) {
                $score += $points;
            }

            $feedback[] = [
                'question'        => $question['question'] ?? ('Question ' . ($index + 1)),
                'selected_answer' => $selectedAnswer,
                'correct_answer'  => $correctIndex,
                'is_correct'      => $isCorrect,
                'points'          => $points,
                'explanation'     => $question['explanation'] ?? null,
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
    // Read routes (unchanged logic, no side effects needed)
    // -------------------------------------------------------------------------

    public function index()
    {
        $courses = Enrollment::query()
            ->where('studentID', auth()->id())
            ->where('status', 'active')
            ->with('course:id,title,description')
            ->orderByDesc('enrolled_at')
            ->get()
            ->map(function (Enrollment $enrollment) {
                $course = $enrollment->course;

                if (! $course) {
                    return null;
                }

                $course->loadCount([
                    'quizzes as published_quizzes_count'                    => fn ($q) => $q->where('is_published', true),
                    'codingExercises as published_coding_exercises_count'   => fn ($q) => $q->where('is_published', true),
                ]);

                return [
                    'id'                      => $course->id,
                    'title'                   => $course->title,
                    'description'             => $course->description,
                    'quizzes_count'           => $course->published_quizzes_count,
                    'coding_exercises_count'  => $course->published_coding_exercises_count,
                    'enrolled_at'             => optional($enrollment->enrolled_at)?->format('Y-m-d H:i'),
                ];
            })
            ->filter()
            ->values();

        return Inertia::render('Student/Assessment/index', [
            'courses'       => $courses,
            'studentPoints' => auth()->user()->points ?? 0,
            'streak'        => $this->progress->getCurrentStreak(auth()->id()),
        ]);
    }

    public function showCourse(LearningContent $course)
    {
        $this->ensureEnrollment($course);

        $course->loadCount([
            'quizzes as published_quizzes_count'                    => fn ($q) => $q->where('is_published', true),
            'codingExercises as published_coding_exercises_count'   => fn ($q) => $q->where('is_published', true),
        ]);

        $studentId = auth()->id();

        $quizzes = Quiz::query()
            ->where('course_id', $course->id)
            ->where('is_published', true)
            ->orderBy('title')
            ->get()
            ->map(function (Quiz $quiz) use ($studentId) {
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
                    'is_published'     => $quiz->is_published,
                    // surface attempt status on the course overview card
                    'latest_attempt'   => $latest ? [
                        'score'     => $latest->score,
                        'max_score' => $latest->max_score,
                        'passed'    => $latest->passed,
                    ] : null,
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
                    'is_published'     => $exercise->is_published,
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
                'id'                     => $course->id,
                'title'                  => $course->title,
                'description'            => $course->description,
                'quizzes_count'          => $course->published_quizzes_count,
                'coding_exercises_count' => $course->published_coding_exercises_count,
            ],
            'quizzes'         => $quizzes,
            'codingExercises' => $codingExercises,
        ]);
    }

    public function showQuiz(LearningContent $course, Quiz $quiz)
    {
        $this->ensureEnrollment($course);
        abort_unless((int) $quiz->course_id === (int) $course->id, 404);
        abort_unless($quiz->is_published, 404);

        $latestAttempt = QuizAttempt::query()
            ->where('quiz_id', $quiz->id)
            ->where('student_id', auth()->id())
            ->latest('submitted_at')
            ->first();

        return Inertia::render('Student/Assessment/quiz', [
            'course' => ['id' => $course->id, 'title' => $course->title],
            'quiz'   => [
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
            'course'         => ['id' => $course->id, 'title' => $course->title],
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

    // -------------------------------------------------------------------------
    // Submit routes — only these two methods changed from your original
    // -------------------------------------------------------------------------

    public function storeQuizAttempt(Request $request, LearningContent $course, Quiz $quiz)
    {
        $this->ensureEnrollment($course);
        abort_unless((int) $quiz->course_id === (int) $course->id, 404);
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

        // Award points + update streak + evaluate badges
        $this->progress->recordAttempt(
            studentId:    auth()->id(),
            pointsEarned: $score,   // earn exactly what was scored
            passed:       $passed,
        );

        return redirect()->route('student.assessment.quiz.show', [$course->id, $quiz->id]);
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

        // Award points + update streak + evaluate badges
        $this->progress->recordAttempt(
            studentId:    auth()->id(),
            pointsEarned: $score,
            passed:       $passed,
        );

        return redirect()->route('student.assessment.coding-exercise.show', [$course->id, $codingExercise->id]);
    }
}