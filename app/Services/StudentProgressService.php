<?php

namespace App\Services;

use App\Models\QuizAttempt;
use App\Models\User;
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
}