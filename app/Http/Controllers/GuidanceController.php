<?php

namespace App\Http\Controllers;

use App\Models\Analytic;
use App\Models\Guidance;
use App\Models\LearningContent;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GuidanceController extends Controller
{
    public function index(Request $request)
    {
        // Students who have analytics data (attempted quizzes),
        // optionally filtered by course and at-risk flag
        $query = User::where('role', User::ROLE_STUDENT)
            ->whereHas('analytics')
            ->with([
                'analytics' => fn ($q) =>
                    $request->filled('course_id')
                        ? $q->where('course_id', $request->course_id)
                        : $q,
            ]);

        if ($request->filled('course_id')) {
            $query->whereHas('analytics', fn ($q) =>
                $q->where('course_id', $request->course_id)
            );
        }

        if ($request->boolean('at_risk')) {
            $query->whereHas('analytics', fn ($q) =>
                $q->where('risk_flag', true)
            );
        }

        $students = $query->get()->map(function ($student) use ($request) {
            $analytics = $student->analytics;

            return [
                'id'               => $student->id,
                'name'             => $student->name,
                'email'            => $student->email,
                'course_title'     => $analytics->first()?->course?->title ?? '—',
                'average_score'    => round($analytics->avg('average_score') ?? 0, 2),
                'topics_attempted' => $analytics->count(),
                'is_at_risk'       => $analytics->contains('risk_flag', true),
            ];
        });

        $courses = LearningContent::select('id', 'title')
            ->whereHas('topics.analytics')
            ->get();

        return Inertia::render('Teacher/FeedbackAndGuidance/index', [
            'students'         => $students,
            'courses'          => $courses,
            'selectedCourseId' => $request->course_id,
            'showAtRisk'       => $request->boolean('at_risk'),
        ]);
    }

    public function show(User $student)
    {
        // All topics this student has attempted (has analytics)
        $analytics = Analytic::where('student_id', $student->id)
            ->with('topic:topicID,name', 'course:id,title')
            ->get()
            ->map(fn ($a) => [
                'topic_name'      => $a->topic?->name,
                'course_title'    => $a->course?->title,
                'average_score'   => $a->average_score,
                'completion_rate' => $a->completion_rate,
                'is_at_risk'      => $a->risk_flag,
            ]);

        // Only this teacher's guidance for this student
        $guidances = Guidance::where('teacher_id', auth()->id())
            ->where('student_id', $student->id)
            ->latest()
            ->get()
            ->map(fn ($g) => [
                'id'         => $g->id,
                'comment'    => $g->comment,
                'is_read'    => $g->is_read,
                'created_at' => $g->created_at?->format('Y-m-d H:i'),
            ]);

        return Inertia::render('Teacher/FeedbackAndGuidance/show', [
            'student'   => [
                'id'    => $student->id,
                'name'  => $student->name,
                'email' => $student->email,
            ],
            'analytics' => $analytics,
            'guidances' => $guidances,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'student_id' => ['required', 'exists:users,id'],
            'topic_id'   => ['nullable', 'integer'],
            'comment'    => ['required', 'string', 'max:2000'],
        ]);

        Guidance::create([
            'teacher_id' => auth()->id(),
            'student_id' => $data['student_id'],
            'topic_id'   => $data['topic_id'] ?? null,
            'comment'    => $data['comment'],
        ]);

        return back()->with('success', 'Feedback sent to student.');
    }

    public function markRead(Guidance $guidance)
    {
        // Only the recipient student can mark as read
        abort_unless($guidance->student_id === auth()->id(), 403);

        $guidance->update(['is_read' => true]);

        return back();
    }

    public function destroy(Guidance $guidance)
    {
        abort_unless($guidance->teacher_id === auth()->id(), 403);

        $guidance->delete();

        return back()->with('success', 'Guidance removed.');
    }
}