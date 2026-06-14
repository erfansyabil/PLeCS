<?php

namespace App\Http\Controllers;

use App\Models\Analytic;
use App\Models\Enrollment;
use App\Models\Guidance;
use App\Models\LearningContent;
use App\Models\QuizAttempt;
use App\Models\User;
use App\Services\StudentProgressService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        private readonly StudentProgressService $progress,
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();

        $layout = match ($user->role) {
            'student'       => 'StudentLayout',
            'teacher'       => 'TeacherLayout',
            'administrator' => 'AdministratorLayout',
            default         => 'StudentLayout',
        };

        $dashboardData = match ($user->role) {
            'student'       => $this->studentData($user),
            'teacher'       => $this->teacherData($user),
            'administrator' => $this->adminData(),
            default         => [],
        };

        return Inertia::render('Dashboard', [
            'layout' => $layout,
            ...$dashboardData,
        ]);
    }

    // -------------------------------------------------------------------------
    // Student
    // -------------------------------------------------------------------------

    private function studentData(User $student): array
    {
        // Enrolled courses with progress
        $enrollments = Enrollment::where('studentID', $student->id)
            ->where('status', 'active')
            ->with('course:id,title,description')
            ->latest('enrolled_at')
            ->get()
            ->map(fn ($e) => [
                'course_id'    => $e->courseID,
                'course_title' => $e->course?->title,
                'progress'     => $e->progress,
                'enrolled_at'  => $e->enrolled_at?->format('Y-m-d'),
            ]);

        // Recent quiz attempts (last 5)
        $recentAttempts = QuizAttempt::where('student_id', $student->id)
            ->with('quiz:id,title,topic_id')
            ->latest('submitted_at')
            ->take(5)
            ->get()
            ->map(fn ($a) => [
                'quiz_title'   => $a->quiz?->title,
                'score'        => $a->score,
                'max_score'    => $a->max_score,
                'passed'       => $a->passed,
                'submitted_at' => $a->submitted_at?->format('Y-m-d H:i'),
            ]);

        // Analytics — weak topics (risk flagged)
        $weakTopics = Analytic::where('student_id', $student->id)
            ->where('risk_flag', true)
            ->with('topic:topicID,name', 'course:id,title')
            ->get()
            ->map(fn ($a) => [
                'topic_name'    => $a->topic?->name,
                'course_title'  => $a->course?->title,
                'average_score' => $a->average_score,
            ]);

        // Analytics — all topics for radar chart
        $analytics = Analytic::where('student_id', $student->id)
            ->with('topic:topicID,name')
            ->get()
            ->map(fn ($a) => [
                'topic_name'      => $a->topic?->name,
                'average_score'   => $a->average_score,
                'completion_rate' => $a->completion_rate,
            ]);

        // Class averages per topic
        $classAverages = Analytic::selectRaw('topic_id, AVG(average_score) as class_avg')
            ->groupBy('topic_id')
            ->get()
            ->map(fn ($a) => [
                'topic_id'  => $a->topic_id,
                'class_avg' => round($a->class_avg, 2),
            ]);

        return [
            'enrollments'    => $enrollments,
            'recentAttempts' => $recentAttempts,
            'weakTopics'     => $weakTopics,
            'analytics'      => $analytics,
            'classAverages'  => $classAverages,
            'streak'         => $this->progress->getCurrentStreak($student->id),
            'points'         => $student->points ?? 0,
            'badges'         => $student->badges ?? [],
        ];
    }

    // -------------------------------------------------------------------------
    // Teacher
    // -------------------------------------------------------------------------

    private function teacherData(User $teacher): array
    {
        // Students with risk flags
        $atRiskStudents = Analytic::where('risk_flag', true)
            ->with('student:id,name,email', 'topic:topicID,name', 'course:id,title')
            ->latest('updated_at')
            ->take(10)
            ->get()
            ->map(fn ($a) => [
                'student_name'  => $a->student?->name,
                'student_id'    => $a->student_id,
                'topic_name'    => $a->topic?->name,
                'course_title'  => $a->course?->title,
                'average_score' => $a->average_score,
            ]);

        // Recent guidance sent by this teacher
        $recentGuidance = Guidance::where('teacher_id', $teacher->id)
            ->with('student:id,name', 'topic:topicID,name')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn ($g) => [
                'student_name' => $g->student?->name,
                'topic_name'   => $g->topic?->name,
                'comment'      => $g->comment,
                'created_at'   => $g->created_at?->format('Y-m-d H:i'),
            ]);

        // Total enrolled students (unique)
        $totalStudents = Enrollment::where('status', 'active')
            ->distinct('studentID')
            ->count('studentID');

        return [
            'atRiskStudents' => $atRiskStudents,
            'recentGuidance' => $recentGuidance,
            'totalStudents'  => $totalStudents,
        ];
    }

    // -------------------------------------------------------------------------
    // Admin
    // -------------------------------------------------------------------------

    private function adminData(): array
    {
        $totalStudents = User::where('role', User::ROLE_STUDENT)->count();
        $totalTeachers = User::where('role', User::ROLE_TEACHER)->count();
        $totalCourses  = LearningContent::count();

        // Courses with lowest average score
        $lowPerformingCourses = Analytic::selectRaw('course_id, AVG(average_score) as avg_score')
            ->groupBy('course_id')
            ->orderBy('avg_score')
            ->take(5)
            ->with('course:id,title')
            ->get()
            ->map(fn ($a) => [
                'course_title' => $a->course?->title,
                'avg_score'    => round($a->avg_score, 2),
            ]);

        // Most attempted quizzes
        $topQuizzes = QuizAttempt::selectRaw('quiz_id, COUNT(*) as attempt_count')
            ->groupBy('quiz_id')
            ->orderByDesc('attempt_count')
            ->take(5)
            ->with('quiz:id,title')
            ->get()
            ->map(fn ($a) => [
                'quiz_title'    => $a->quiz?->title,
                'attempt_count' => $a->attempt_count,
            ]);

        return [
            'totalStudents'       => $totalStudents,
            'totalTeachers'       => $totalTeachers,
            'totalCourses'        => $totalCourses,
            'lowPerformingCourses'=> $lowPerformingCourses,
            'topQuizzes'          => $topQuizzes,
        ];
    }
}