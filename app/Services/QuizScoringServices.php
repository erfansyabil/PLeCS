<?php

namespace App\Services;

use App\Models\Quiz;

class QuizScoringService
{
    /**
     * Score a student's submitted answers against the quiz's correct answers.
     *
     * Each question in quiz->questions has:
     *   - question: string
     *   - options: string[]
     *   - correct_index: int
     *   - points: int (optional, falls back to quiz->points / question count)
     *
     * Returns an array ready to be persisted into QuizAttempt and returned
     * to the client as immediate per-question feedback (FR027 / UC007 step 4).
     *
     * FR026: award points for correct answers
     * FR027: deduct points for wrong answers (capped at 0 to avoid negative totals)
     */
    public function score(Quiz $quiz, array $studentAnswers): array
    {
        $questions  = $quiz->questions ?? [];
        $totalQuestions = count($questions);

        if ($totalQuestions === 0) {
            return $this->emptyResult();
        }

        $defaultPointsPerQ = intdiv($quiz->points, $totalQuestions) ?: 1;
        // Deduction is half the question's worth, minimum 1
        $defaultDeduction  = max(1, intdiv($defaultPointsPerQ, 2));

        $score        = 0;
        $maxScore     = 0;
        $pointsEarned = 0;
        $feedback     = [];

        foreach ($questions as $i => $q) {
            $qPoints    = $q['points'] ?? $defaultPointsPerQ;
            $deduction  = $q['deduction'] ?? $defaultDeduction;
            $maxScore  += $qPoints;

            $studentAnswer = isset($studentAnswers[(string) $i])
                ? (int) $studentAnswers[(string) $i]
                : null;

            $correct = $studentAnswer === (int) $q['correct_index'];

            if ($correct) {
                $score        += $qPoints;
                $pointsEarned += $qPoints;   // FR026: award
            } else {
                $pointsEarned -= $deduction; // FR027: deduct
            }

            $feedback[$i] = [
                'question'       => $q['question'],
                'chosen_index'   => $studentAnswer,
                'correct_index'  => (int) $q['correct_index'],
                'correct'        => $correct,
                'points_awarded' => $correct ? $qPoints : -$deduction,
                'explanation'    => $q['explanation'] ?? null,
            ];
        }

        // Points earned cannot go below 0 for this attempt
        $pointsEarned = max(0, $pointsEarned);
        $percentage   = $maxScore > 0 ? round(($score / $maxScore) * 100, 1) : 0;

        // Passing threshold: 60%
        $passed = $percentage >= 60;

        return [
            'score'        => $score,
            'max_score'    => $maxScore,
            'passed'       => $passed,
            'percentage'   => $percentage,
            'points_earned' => $pointsEarned,
            'feedback'     => $feedback,
        ];
    }

    private function emptyResult(): array
    {
        return [
            'score'        => 0,
            'max_score'    => 0,
            'passed'       => false,
            'percentage'   => 0,
            'points_earned' => 0,
            'feedback'     => [],
        ];
    }
}