<?php

namespace App\Http\Controllers;

use App\Models\Topic;
use Inertia\Inertia;

class FeedbackOverviewController extends Controller
{
    public function index()
    {
        $topics = Topic::where('isActive', true)
            ->with('course:id,title')
            ->withCount([
                'feedbacks as feedback_count' => fn ($q) => $q->where('skipped', false)->whereNotNull('rating'),
            ])
            ->withAvg([
                'feedbacks as avg_rating' => fn ($q) => $q->where('skipped', false)->whereNotNull('rating'),
            ], 'rating')
            ->having('feedback_count', '>', 0)
            ->get()
            ->map(fn ($topic) => [
                'id'           => $topic->topicID,
                'name'         => $topic->name,
                'course_title' => $topic->course?->title ?? '—',
                'avg_rating'   => round((float) $topic->avg_rating, 1),
                'count'        => (int) $topic->feedback_count,
                'needs_review' => (float) $topic->avg_rating < 3.0,
            ]);

        $needsReview = $topics->filter(fn ($t) => $t['needs_review'])->sortBy('avg_rating')->values();
        $allTopics   = $topics->sortByDesc('avg_rating')->values();

        $page = auth()->user()->role === 'administrator'
            ? 'Admin/FeedbackOverview/index'
            : 'Teacher/FeedbackOverview/index';

        return Inertia::render($page, [
            'needsReview' => $needsReview,
            'allTopics'   => $allTopics,
        ]);
    }
}
