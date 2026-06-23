<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Models\Feedback;
use App\Models\Topic;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeedbackController extends Controller
{
    public function index()
    {
        $studentId = auth()->id();

        // Get all course IDs the student is enrolled in
        $courseIds = Enrollment::where('studentID', $studentId)
            ->pluck('courseID');

        // Topics from enrolled courses with existing feedback for this student
        $topics = Topic::whereIn('courseID', $courseIds)
            ->where('isActive', true)
            ->with([
                'course:id,title',
                'feedbacks' => fn ($q) => $q->where('student_id', $studentId),
            ])
            ->withAvg([
                'feedbacks as avg_rating' => fn ($q) => $q->where('skipped', false)->whereNotNull('rating'),
            ], 'rating')
            ->withCount([
                'feedbacks as peer_count' => fn ($q) => $q->where('skipped', false)->whereNotNull('rating'),
            ])
            ->get()
            ->map(fn ($topic) => [
                'id'           => $topic->topicID,
                'name'         => $topic->name,
                'course_title' => $topic->course?->title,
                'feedback'     => $topic->feedbacks->first(),
                'avg_rating'   => $topic->avg_rating ? round((float) $topic->avg_rating, 1) : null,
                'peer_count'   => (int) $topic->peer_count,
            ]);

        // Separate into pending (no feedback or skipped) and reviewed
        $pending  = $topics->filter(fn ($t) => is_null($t['feedback']) || $t['feedback']['skipped'])->values();
        $reviewed = $topics->filter(fn ($t) => !is_null($t['feedback']) && !$t['feedback']['skipped'])->values();

        return Inertia::render('Student/Feedback/index', [
            'pendingTopics'  => $pending,
            'reviewedTopics' => $reviewed,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'topic_id' => ['required', 'integer'],
            'rating'   => ['required', 'integer', 'min:1', 'max:5'],
            'comment'  => ['nullable', 'string', 'max:1000'],
            'tags'     => ['nullable', 'array'],
            'tags.*'   => ['string'],
        ]);

        Feedback::updateOrCreate(
            [
                'student_id' => auth()->id(),
                'topic_id'   => $data['topic_id'],
            ],
            [
                'rating'  => $data['rating'],
                'comment' => $data['comment'] ?? null,
                'tags'    => $data['tags'] ?? null,
                'skipped' => false,
            ]
        );

        return back()->with('success', 'Feedback submitted successfully.');
    }

    public function skip(Request $request)
    {
        $request->validate([
            'topic_id' => ['required', 'integer'],
        ]);

        Feedback::updateOrCreate(
            [
                'student_id' => auth()->id(),
                'topic_id'   => $request->topic_id,
            ],
            ['skipped' => true]
        );

        return back();
    }

    public function form(Topic $topic)
    {
        $topic->load([
            'course:id,title',
            'feedbacks' => fn ($q) => $q->where('student_id', auth()->id()),
        ]);

        return Inertia::render('Student/Feedback/form', [
            'topic' => [
                'id'           => $topic->topicID,
                'name'         => $topic->name,
                'course_title' => $topic->course?->title,
                'feedback'     => $topic->feedbacks->first(),
            ],
        ]);
    }
}