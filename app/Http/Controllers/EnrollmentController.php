<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Models\LearningContent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\LearningPath;

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

        // Get or create the student's active learning path
        $learningPath = LearningPath::where('studentID', $studentID)
            ->where('status', 'Active')
            ->first();

        if (!$learningPath) {
            // Create a new active path if none exists
            $learningPath = LearningPath::create([
                'studentID' => $studentID,
                'pathName' => 'My Learning Path',
                'complexityLevel' => 'Beginner',
                'status' => 'Active',
            ]);
        }

        // Add course to the path (if not already present)
        $learningPath->addCourse($validated['courseID']);

        // Create or update enrollment
        $enrollment = Enrollment::updateOrCreate(
            [
                'studentID' => $studentID,
                'courseID' => $validated['courseID'],
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
}