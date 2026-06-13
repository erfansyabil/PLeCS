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
        // Students with risk flags, optionally filtered by course
        $query = User::where('role', 'student')
            ->whereHas('analytics', fn ($q) => $q->where('risk_flag', true))
            ->with([
                'analytics' => fn ($q) => $q->where('risk_flag', true)->with('topic:topicID,name'),
            ]);

        if ($request->filled('course_id')) {
            $query->whereHas('analytics', fn ($q) =>
                $q->where('course_id', $request->course_id)
            );
        }

        $students = $query->get()->map(fn ($student) => [
            'id'          => $student->id,
            'name'        => $student->name,
            'email'       => $student->email,
            'weak_topics' => $student->analytics->map(fn ($a) => [
                'topic_id'     => $a->topic_id,
                'topic_name'   => $a->topic?->name,
                'average_score'=> $a->average_score,
            ]),
        ]);

        $courses = LearningContent::select('id', 'title')->get();

        return Inertia::render('Teacher/Guidance/Index', [
            'students'         => $students,
            'courses'          => $courses,
            'selectedCourseId' => $request->course_id,
        ]);
    }

    public function show(User $student)
    {
        $analytics = Analytic::where('student_id', $student->id)
            ->with('topic:topicID,name', 'course:id,title')
            ->get();

        $guidances = Guidance::where('student_id', $student->id)
            ->where('teacher_id', auth()->id())
            ->with('topic:topicID,name')
            ->latest()
            ->get();

        return Inertia::render('Teacher/Guidance/Show', [
            'student'   => ['id' => $student->id, 'name' => $student->name],
            'analytics' => $analytics,
            'guidances' => $guidances,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'student_id' => ['required', 'exists:users,id'],
            'topic_id'   => ['required', 'integer'],
            'comment'    => ['required', 'string', 'max:2000'],
        ]);

        Guidance::create([
            'teacher_id' => auth()->id(),
            'student_id' => $data['student_id'],
            'topic_id'   => $data['topic_id'],
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