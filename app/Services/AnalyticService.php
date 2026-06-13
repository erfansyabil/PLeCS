<?php

namespace App\Services;

use App\Models\Analytic;
use App\Models\QuizAttempt;
use App\Models\Topic;

class AnalyticsService
{
    /**
     * MAIN ENTRY: update analytics after any quiz attempt
     */
    public function updateTopicAnalytics(int $studentId, int $topicId, int $courseId): void
    {
        $attempts = QuizAttempt::where('student_id', $studentId)
            ->whereHas('quiz', fn ($q) => $q->where('topic_id', $topicId))
            ->get();

        if ($attempts->isEmpty()) {
            return;
        }

        // ----------------------------
        // SCORE CALCULATION
        // ----------------------------
        $scores = $attempts->map(function ($a) {
            return ($a->score / max($a->max_score, 1)) * 100;
        });

        $averageScore = $scores->avg();

        $completionRate = $attempts->where('passed', true)->count()
            / max($attempts->count(), 1) * 100;

        // ----------------------------
        // RISK LOGIC
        // ----------------------------
        $riskFlag = $averageScore < 50;

        // ----------------------------
        // WEAK TOPIC LOGIC
        // ----------------------------
        $weakTopics = [];

        if ($averageScore < 60) {
            $topic = Topic::find($topicId);
            if ($topic) {
                $weakTopics[] = $topic->name;
            }
        }

        // ----------------------------
        // MASTERy PREDICTION (simple ML-like formula)
        // ----------------------------
        $trendFactor = $this->calculateTrend($scores);

        $predictedDays = match (true) {
            $averageScore >= 80 => 3,
            $averageScore >= 60 => 7,
            $averageScore >= 40 => 14,
            default => 30,
        };

        if ($trendFactor < 0) {
            $predictedDays += 7; // slowing down
        }

        // ----------------------------
        // SAVE / UPDATE ANALYTICS
        // ----------------------------
        Analytic::updateOrCreate(
            [
                'student_id' => $studentId,
                'topic_id'   => $topicId,
            ],
            [
                'course_id' => $courseId,
                'completion_rate' => round($completionRate, 2),
                'average_score' => round($averageScore, 2),
                'risk_flag' => $riskFlag,
                'weak_topics' => $weakTopics,
                'predicted_mastery_date' => now()->addDays($predictedDays),
            ]
        );
    }

    /**
     * Simple trend detection (improving or declining)
     */
    private function calculateTrend($scores): float
    {
        if ($scores->count() < 2) {
            return 0;
        }

        $firstHalf = $scores->take((int) ($scores->count() / 2))->avg();
        $secondHalf = $scores->skip((int) ($scores->count() / 2))->avg();

        return $secondHalf - $firstHalf;
    }
}