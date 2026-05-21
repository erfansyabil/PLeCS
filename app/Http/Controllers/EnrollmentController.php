<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Models\LearningContent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    /**
     * Enroll a student in a course.
     */
    public function enroll(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'courseID' => 'required|integer|exists:learning_contents,id',
            'pathID' => 'nullable|integer|exists:learning_paths,pathID',
        ]);

        $studentID = auth()->id();

        // Check if already enrolled
        $existing = Enrollment::where('studentID', $studentID)
            ->where('courseID', $validated['courseID'])
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'You are already enrolled in this course.',
                'enrollment' => $existing->load('course'),
            ], 200);
        }

        // Create enrollment
        $enrollment = Enrollment::create([
            'studentID' => $studentID,
            'courseID' => $validated['courseID'],
            'pathID' => $validated['pathID'] ?? null,
            'status' => 'active',
            'progress' => 0,
            'enrolled_at' => now(),
        ]);

        return response()->json([
            'message' => 'Successfully enrolled in the course!',
            'enrollment' => $enrollment->load('course'),
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