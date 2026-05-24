<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Models\LearningContent;
use Inertia\Inertia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\LearningPath;
use Illuminate\Pagination\LengthAwarePaginator;

class EnrollmentController extends Controller
{
    /**
     * Enroll a student in a course.
     */
    public function enroll(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'courseID' => 'required|integer|exists:learning_contents,id',
        ]);

        $studentID = auth()->id();
        $courseID = $validated['courseID'];

        // Get or create active learning path for the student
        $learningPath = LearningPath::where('studentID', $studentID)
            ->where('status', 'Active')
            ->first();

        if (!$learningPath) {
            // Create a default learning path if none exists
            $learningPath = LearningPath::create([
                'studentID' => $studentID,
                'pathName' => 'My Learning Path',
                'status' => 'Active',
                'complexityLevel' => 'Beginner',
            ]);
        }

        // Add course to learning path (if not already added)
        if (!$learningPath->courses()->where('courseID', $courseID)->exists()) {
            $maxOrder = $learningPath->courses()->max('order') ?? -1;
            $learningPath->courses()->attach($courseID, ['order' => $maxOrder + 1]);
        }

        // Create or update enrollment
        $enrollment = Enrollment::updateOrCreate(
            [
                'studentID' => $studentID,
                'courseID' => $courseID,
            ],
            [
                'pathID' => $learningPath->pathID,
                'status' => 'active',
                'progress' => 0,
                'enrolled_at' => now(),
            ]
        );

        return response()->json([
            'message' => 'Successfully enrolled in the course!',
            'enrollment' => $enrollment->load('course'),
            'learning_path' => $learningPath->load('courses'),
        ], 201);
    }

    /**
     * Get all enrollments for the authenticated student.
     */
    public function myEnrollments(Request $request): JsonResponse
    {
        $enrollments = Enrollment::where('studentID', auth()->id())
            ->with('course')
            ->latest('enrolled_at')
            ->get();

        return response()->json([
            'enrollments' => $enrollments,
        ]);
    }

    /**
     * Check if student is enrolled in a specific course.
     */
    public function check(Request $request, $courseID): JsonResponse
    {
        $enrollment = Enrollment::where('studentID', auth()->id())
            ->where('courseID', $courseID)
            ->first();

        return response()->json([
            'enrolled' => $enrollment ? true : false,
            'enrollment' => $enrollment,
        ]);
    }

    /**
     * Drop/unenroll from a course.
     */
    public function drop(Request $request, $enrollmentID): JsonResponse
    {
        $enrollment = Enrollment::where('studentID', auth()->id())
            ->findOrFail($enrollmentID);

        $enrollment->update(['status' => 'dropped']);

        return response()->json([
            'message' => 'Successfully dropped the course.',
        ]);
    }

    /**
     * Get enrollment history for the authenticated student (all statuses, paginated).
     */
    public function history(Request $request)
    {
        $enrollments = Enrollment::where('studentID', auth()->id())
            ->with('course')  // eager load course details
            ->orderBy('enrolled_at', 'desc')
            ->paginate(10);   // 10 per page

        return Inertia::render('Student/Enrollment/history', [
            'enrollments' => $enrollments->through(function ($enrollment) {
                return [
                    'id' => $enrollment->id,
                    'course_id' => $enrollment->courseID,
                    'course_title' => $enrollment->course->title ?? 'Unknown Course',
                    'status' => $enrollment->status,
                    'progress' => $enrollment->progress,
                    'enrolled_at' => $enrollment->enrolled_at ? $enrollment->enrolled_at->format('Y-m-d H:i') : null,
                    'completed_at' => $enrollment->completed_at ? $enrollment->completed_at->format('Y-m-d H:i') : null,
                    'course_url' => route('student.learning-content.show', $enrollment->courseID),
                ];
            }),
        ]);
    }
}