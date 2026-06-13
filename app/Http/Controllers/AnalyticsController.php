<?php

namespace App\Http\Controllers;

use App\Models\Analytic;
use App\Models\Enrollment;
use App\Models\LearningContent;
use App\Models\QuizAttempt;
use App\Models\Topic;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function index()
    {
        $studentId = auth()->id();

        // One analytic record per topic — grouped by course
        $analytics = Analytic::where('student_id', $studentId)
            ->with(['topic:topicID,name,courseID', 'course:id,title'])
            ->get();

        // Class average per topic for radar chart comparison
        $classAverages = Analytic::selectRaw('topic_id, AVG(average_score) as class_avg')
            ->groupBy('topic_id')
            ->pluck('class_avg', 'topic_id');

        // Enrolled courses summary
        $enrollments = Enrollment::where('studentID', $studentId)
            ->where('status', 'active')
            ->with('course:id,title')
            ->get()
            ->map(fn ($e) => [
                'course_id'    => $e->courseID,
                'course_title' => $e->course?->title,
                'progress'     => $e->progress,
            ]);

        return Inertia::render('Student/Analytics/Index', [
            'analytics'     => $analytics,
            'classAverages' => $classAverages,
            'enrollments'   => $enrollments,
        ]);
    }

    public function show(LearningContent $course)
    {
        $studentId = auth()->id();

        // Verify enrollment using your existing pattern
        abort_unless(
            Enrollment::where('studentID', $studentId)
                ->where('courseID', $course->id)
                ->where('status', 'active')
                ->exists(),
            403
        );

        $topicIds = Topic::where('courseID', $course->id)
            ->pluck('topicID');

        $analytics = Analytic::where('student_id', $studentId)
            ->whereIn('topic_id', $topicIds)
            ->with('topic:topicID,name')
            ->get();

        // Class averages for topics in this course (radar chart)
        $classAverages = Analytic::selectRaw('topic_id, AVG(average_score) as class_avg')
            ->whereIn('topic_id', $topicIds)
            ->groupBy('topic_id')
            ->pluck('class_avg', 'topic_id');

        // Recent attempts for this course
        $recentAttempts = QuizAttempt::where('student_id', $studentId)
            ->whereHas('quiz', fn ($q) => $q->where('course_id', $course->id))
            ->with('quiz:id,title,topic_id')
            ->latest('submitted_at')
            ->take(10)
            ->get()
            ->map(fn ($a) => [
                'quiz_title'   => $a->quiz?->title,
                'score'        => $a->score,
                'max_score'    => $a->max_score,
                'passed'       => $a->passed,
                'submitted_at' => $a->submitted_at?->format('Y-m-d H:i'),
            ]);

        return Inertia::render('Student/Analytics/Show', [
            'course'        => ['id' => $course->id, 'title' => $course->title],
            'analytics'     => $analytics,
            'classAverages' => $classAverages,
            'recentAttempts'=> $recentAttempts,
        ]);
    }
}