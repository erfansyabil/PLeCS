<?php

namespace App\Services;

use App\Models\CodingExercise;
use App\Models\CodingExerciseAttempt;
use App\Models\Enrollment;
use App\Models\QuizAttempt;
use App\Models\StudentTopicView;
use App\Models\User;
use App\Models\Analytic;
use App\Models\Quiz;
use App\Models\Topic;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class StudentProgressService
{
    /**
     * Called after any quiz or coding exercise attempt is stored.
     *
     * Responsibilities:
     *   - Add earned points to student record           (FR026)
     *   - Update consecutive daily streak counter       (FR028)
     *   - Award badges when milestones are crossed      (UC007 step 5)
     *
     * @param  int  $studentId
     * @param  int  $pointsEarned   Raw score from gradeQuiz / gradeCodingExercise
     * @param  bool $passed
     */
    public function recordAttempt(int $studentId, int $pointsEarned, bool $passed): void
    {
        DB::transaction(function () use ($studentId, $pointsEarned, $passed) {
            /** @var User $student */
            $student = User::lockForUpdate()->findOrFail($studentId);

            // --- Points (FR026) ---
            // Only award points on pass to avoid grinding; tweak to always award if preferred.
            if ($passed && $pointsEarned > 0) {
                $student->points = ($student->points ?? 0) + $pointsEarned;
            }

            // --- Streak (FR028) ---
            $today    = Carbon::today();
            $lastDate = $student->last_quiz_date
                ? Carbon::parse($student->last_quiz_date)
                : null;

            if ($lastDate === null) {
                $student->streak_days = 1;
            } elseif ($lastDate->isYesterday()) {
                $student->streak_days = ($student->streak_days ?? 0) + 1;
            } elseif ($lastDate->isToday()) {
                // Already attempted today — streak stays the same
            } else {
                // Gap of more than one day — reset
                $student->streak_days = 1;
            }

            $student->last_quiz_date = $today;
            $student->save();

            // --- Badges ---
            $this->evaluateBadges($student);
        });
    }

    /**
     * Returns the live streak value, zeroing it out if the last attempt
     * was more than one day ago (streak is broken).
     */
    public function getCurrentStreak(int $studentId): int
    {
        $student = User::find($studentId);

        if (! $student || ! $student->last_quiz_date) {
            return 0;
        }

        $lastDate = Carbon::parse($student->last_quiz_date);

        // Streak is only "alive" if the student attempted today or yesterday
        if (! $lastDate->isToday() && ! $lastDate->isYesterday()) {
            return 0;
        }

        return (int) ($student->streak_days ?? 0);
    }

    /**
     * Award badges for milestone achievements.
     * Add new entries to $milestones without touching the controller.
     */
    private function evaluateBadges(User $student): void
    {
        $badges = $student->badges ?? [];

        $totalAttempts = fn () => QuizAttempt::where('student_id', $student->id)->count();

        $milestones = [
            'first_quiz'    => fn () => $totalAttempts() >= 1,
            'streak_3'      => fn () => ($student->streak_days ?? 0) >= 3,
            'streak_7'      => fn () => ($student->streak_days ?? 0) >= 7,
            'points_100'    => fn () => ($student->points ?? 0) >= 100,
            'points_500'    => fn () => ($student->points ?? 0) >= 500,
            'points_1000'   => fn () => ($student->points ?? 0) >= 1000,
            'perfect_score' => fn () => QuizAttempt::where('student_id', $student->id)
                ->whereColumn('score', 'max_score')
                ->where('max_score', '>', 0)
                ->exists(),
        ];

        $changed = false;
        foreach ($milestones as $badge => $check) {
            if (! in_array($badge, $badges, true) && $check()) {
                $badges[] = $badge;
                $changed  = true;
            }
        }

        if ($changed) {
            $student->badges = $badges;
            $student->saveQuietly(); // avoid firing observers/events twice
        }
    }


    /**
     * Record that a student has viewed a topic, then recompute enrollment progress
     * for the parent course as viewed_topics / total_active_topics * 100.
     */
    public function recordTopicView(int $studentId, int $topicId, int $courseId): void
    {
        StudentTopicView::firstOrCreate([
            'student_id' => $studentId,
            'topic_id'   => $topicId,
        ]);

        $this->recomputeEnrollmentProgress($studentId, $courseId);
    }

    /**
     * Recompute and persist enrollment progress for one student/course pair.
     * Progress = (viewed topics + passed quizzes + passed coding exercises)
     *          / (total active topics + total published quizzes + total published exercises) × 100.
     * Sets completed_at and status='completed' when progress first hits 100.
     */
    public function recomputeEnrollmentProgress(int $studentId, int $courseId): void
    {
        $topicIds = Topic::where('courseID', $courseId)
            ->where('isActive', true)
            ->pluck('topicID');

        $totalTopics  = $topicIds->count();
        $viewedTopics = $totalTopics > 0
            ? StudentTopicView::where('student_id', $studentId)
                ->whereIn('topic_id', $topicIds)
                ->count()
            : 0;

        $quizIds = Quiz::whereIn('topic_id', $topicIds)
            ->where('is_published', true)
            ->pluck('id');

        $totalQuizzes  = $quizIds->count();
        $passedQuizzes = $totalQuizzes > 0
            ? QuizAttempt::where('student_id', $studentId)
                ->whereIn('quiz_id', $quizIds)
                ->where('passed', true)
                ->distinct('quiz_id')
                ->count('quiz_id')
            : 0;

        $exerciseIds = CodingExercise::where('course_id', $courseId)
            ->where('is_published', true)
            ->pluck('id');

        $totalExercises  = $exerciseIds->count();
        $passedExercises = $totalExercises > 0
            ? CodingExerciseAttempt::where('student_id', $studentId)
                ->whereIn('coding_exercise_id', $exerciseIds)
                ->where('passed', true)
                ->distinct('coding_exercise_id')
                ->count('coding_exercise_id')
            : 0;

        $total = $totalTopics + $totalQuizzes + $totalExercises;
        if ($total === 0) {
            return;
        }

        $completed = $viewedTopics + $passedQuizzes + $passedExercises;
        $progress  = (int) round(($completed / $total) * 100);

        $enrollment = Enrollment::where('studentID', $studentId)
            ->where('courseID', $courseId)
            ->first();

        if (! $enrollment) {
            return;
        }

        $enrollment->progress = $progress;

        if ($progress >= 100 && ! $enrollment->completed_at) {
            $enrollment->completed_at = now();
            $enrollment->status = 'completed';
        }

        $enrollment->save();
    }

    public function recalculateAnalytics(int $studentId, int $topicId): void
    {
        // All quiz IDs under this topic
        $quizIds = Quiz::where('topic_id', $topicId)
            ->where('is_published', true)
            ->pluck('id');

        if ($quizIds->isEmpty()) return;

        // All attempts by this student for quizzes in this topic
        $attempts = QuizAttempt::where('student_id', $studentId)
            ->whereIn('quiz_id', $quizIds)
            ->get();

        if ($attempts->isEmpty()) return;

        // Average score as a percentage
        $avgScore = $attempts->avg(fn ($a) =>
            $a->max_score > 0 ? ($a->score / $a->max_score) * 100 : 0
        );

        // Completion rate: how many quizzes have at least one attempt
        $attemptedQuizIds = $attempts->pluck('quiz_id')->unique()->count();
        $completionRate   = ($attemptedQuizIds / $quizIds->count()) * 100;

        // Risk flag: average below 50%
        $riskFlag = $avgScore < 50;

        // Predicted mastery: estimate based on current pace
        // Simple heuristic: days remaining = (100 - avgScore) / avgScore * days elapsed
        $firstAttempt = $attempts->sortBy('submitted_at')->first();
        $daysElapsed  = now()->diffInDays($firstAttempt->submitted_at) ?: 1;
        $predictedDate = $avgScore > 0
            ? now()->addDays((int) ceil((100 - $avgScore) / $avgScore * $daysElapsed))
            : null;

        // Get course_id from topic
        $topic    = Topic::where('topicID', $topicId)->firstOrFail();
        $courseId = $topic->courseID;

        Analytic::updateOrCreate(
            ['student_id' => $studentId, 'topic_id' => $topicId],
            [
                'course_id'               => $courseId,
                'average_score'           => round($avgScore, 2),
                'completion_rate'         => round($completionRate, 2),
                'risk_flag'               => $riskFlag,
                'predicted_mastery_date'  => $predictedDate,
            ]
        );
    }
}