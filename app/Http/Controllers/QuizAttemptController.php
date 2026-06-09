<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Services\QuizScoringService;
use App\Services\StudentProgressService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class QuizAttemptController extends Controller
{
    public function __construct(
        private QuizScoringService $scoringService,
        private StudentProgressService $progressService,
    ) {}

    /**
     * Show all quizzes available for a student's enrolled courses.
     * UC007 – Attempt Gamified Quizzes (step 1: navigate to quiz section)
     */
    public function index()
    {
        $student = Auth::user();

        // Get course IDs the student is enrolled in
        $enrolledCourseIds = $student->enrollments()
            ->pluck('learning_content_id');

        $quizzes = Quiz::query()
            ->whereIn('course_id', $enrolledCourseIds)
            ->where('is_published', true)
            ->with('course:id,title')
            ->get()
            ->map(function (Quiz $quiz) use ($student) {
                // Find most recent attempt by this student
                $lastAttempt = $quiz->attempts()
                    ->where('student_id', $student->id)
                    ->latest('submitted_at')
                    ->first();

                return [
                    'id'               => $quiz->id,
                    'title'            => $quiz->title,
                    'description'      => $quiz->description,
                    'difficulty_level' => $quiz->difficulty_level,
                    'points'           => $quiz->points,
                    'question_count'   => count($quiz->questions ?? []),
                    'course'           => [
                        'id'    => $quiz->course?->id,
                        'title' => $quiz->course?->title,
                    ],
                    'last_attempt' => $lastAttempt ? [
                        'score'        => $lastAttempt->score,
                        'max_score'    => $lastAttempt->max_score,
                        'passed'       => $lastAttempt->passed,
                        'submitted_at' => $lastAttempt->submitted_at?->diffForHumans(),
                    ] : null,
                ];
            });

        return Inertia::render('Student/Quizzes/index', [
            'quizzes'       => $quizzes,
            'studentPoints' => $student->points ?? 0,
            'streak'        => $this->progressService->getCurrentStreak($student->id),
        ]);
    }

    /**
     * Show a single quiz ready to attempt.
     * UC007 – step 2: load gamified quiz interface
     */
    public function show(Quiz $quiz)
    {
        $student = Auth::user();

        // Ensure student is enrolled in this quiz's course
        $isEnrolled = $student->enrollments()
            ->where('learning_content_id', $quiz->course_id)
            ->exists();

        if (! $isEnrolled || ! $quiz->is_published) {
            return redirect()->route('student.quizzes.index')
                ->with('error', 'You do not have access to this quiz.');
        }

        // Strip correct_index before sending to the client so answers
        // cannot be read from page source.
        $safeQuestions = collect($quiz->questions ?? [])->map(fn ($q, $i) => [
            'index'   => $i,
            'question' => $q['question'],
            'options'  => $q['options'],
            // points per question (fall back to quiz-level points / count)
            'points'   => $q['points'] ?? intdiv($quiz->points, max(count($quiz->questions ?? []), 1)),
        ])->values();

        $previousAttempts = $quiz->attempts()
            ->where('student_id', $student->id)
            ->latest('submitted_at')
            ->take(5)
            ->get()
            ->map(fn ($a) => [
                'score'        => $a->score,
                'max_score'    => $a->max_score,
                'passed'       => $a->passed,
                'submitted_at' => $a->submitted_at?->format('d M Y, H:i'),
            ]);

        return Inertia::render('Student/Quizzes/show', [
            'quiz' => [
                'id'               => $quiz->id,
                'title'            => $quiz->title,
                'description'      => $quiz->description,
                'difficulty_level' => $quiz->difficulty_level,
                'points'           => $quiz->points,
                'course'           => [
                    'id'    => $quiz->course?->id,
                    'title' => $quiz->course?->title,
                ],
                'questions'        => $safeQuestions,
            ],
            'previousAttempts' => $previousAttempts,
        ]);
    }

    /**
     * Submit quiz answers, score them server-side, update student points/streak.
     * UC007 – step 4 & 5: immediate feedback + award points/badges
     */
    public function submit(Request $request, Quiz $quiz)
    {
        $student = Auth::user();

        $validated = $request->validate([
            // answers is a flat array keyed by question index: { "0": 2, "1": 0, ... }
            'answers'   => ['required', 'array'],
            'answers.*' => ['required', 'integer', 'min:0'],
        ]);

        // Score the attempt using the service (keeps controller thin)
        $result = $this->scoringService->score($quiz, $validated['answers']);

        // Persist the attempt
        $attempt = QuizAttempt::create([
            'quiz_id'      => $quiz->id,
            'student_id'   => $student->id,
            'answers'      => $validated['answers'],
            'score'        => $result['score'],
            'max_score'    => $result['max_score'],
            'passed'       => $result['passed'],
            'feedback'     => $result['feedback'],
            'submitted_at' => now(),
        ]);

        // Award / deduct points on the student record and update streak
        $this->progressService->recordAttempt(
            studentId: $student->id,
            pointsEarned: $result['points_earned'],
            passed: $result['passed'],
        );

        return back()->with('attempt_result', [
            'attempt_id'   => $attempt->id,
            'score'        => $result['score'],
            'max_score'    => $result['max_score'],
            'passed'       => $result['passed'],
            'points_earned' => $result['points_earned'],
            'feedback'     => $result['feedback'],
            'percentage'   => $result['percentage'],
        ]);
    }

    /**
     * Leaderboard filtered by form level (FR029).
     */
    public function leaderboard(Request $request)
    {
        $formLevel = $request->query('form_level'); // e.g. "Form 3", "Form 4"

        $query = \App\Models\User::query()
            ->where('role', 'student')
            ->orderByDesc('points')
            ->take(50);

        if ($formLevel) {
            $query->where('form_level', $formLevel);
        }

        $leaderboard = $query->get()->map(fn ($u, $rank) => [
            'rank'        => $rank + 1,
            'name'        => $u->name,
            'points'      => $u->points ?? 0,
            'form_level'  => $u->form_level,
            'is_current'  => $u->id === Auth::id(),
        ]);

        return Inertia::render('Student/Quizzes/leaderboard', [
            'leaderboard' => $leaderboard,
            'formLevel'   => $formLevel,
        ]);
    }
}