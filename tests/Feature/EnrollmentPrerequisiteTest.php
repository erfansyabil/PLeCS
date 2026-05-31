<?php

namespace Tests\Feature;

use App\Models\Enrollment;
use App\Models\LearningContent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EnrollmentPrerequisiteTest extends TestCase
{
    use RefreshDatabase;

    private function createCourse(string $title): LearningContent
    {
        return LearningContent::create([
            'title' => $title,
            'description' => $title.' description',
            'content' => $title.' content',
            'type' => 'course',
            'difficulty_level' => 'Beginner',
            'estimated_hours' => 8,
            'keywords' => strtolower(str_replace(' ', ', ', $title)),
            'parent_id' => null,
            'resource_type' => 'none',
            'resource_url' => null,
            'resource_path' => null,
        ]);
    }

    public function test_student_cannot_enroll_when_prerequisites_are_not_completed(): void
    {
        $student = User::factory()->student()->create();
        $introCourse = $this->createCourse('Introduction to Programming');
        $advancedCourse = $this->createCourse('Advanced Programming');

        $advancedCourse->prerequisites()->attach($introCourse->id);

        $response = $this->actingAs($student)->postJson(route('student.enrollment.enroll'), [
            'courseID' => $advancedCourse->id,
        ]);

        $response->assertStatus(422);
        $response->assertJsonPath('missing_prerequisites.0', $introCourse->title);

        $this->assertDatabaseMissing('enrollments', [
            'studentID' => $student->id,
            'courseID' => $advancedCourse->id,
        ]);
    }

    public function test_student_can_enroll_after_completing_prerequisites(): void
    {
        $student = User::factory()->student()->create();
        $introCourse = $this->createCourse('Introduction to Programming');
        $advancedCourse = $this->createCourse('Advanced Programming');

        $advancedCourse->prerequisites()->attach($introCourse->id);

        Enrollment::create([
            'studentID' => $student->id,
            'courseID' => $introCourse->id,
            'pathID' => null,
            'status' => 'completed',
            'progress' => 100,
            'enrolled_at' => now()->subDays(7),
            'completed_at' => now()->subDay(),
        ]);

        $response = $this->actingAs($student)->postJson(route('student.enrollment.enroll'), [
            'courseID' => $advancedCourse->id,
        ]);

        $response->assertCreated();
        $response->assertJsonPath('enrollment.courseID', $advancedCourse->id);

        $this->assertDatabaseHas('enrollments', [
            'studentID' => $student->id,
            'courseID' => $advancedCourse->id,
            'status' => 'active',
        ]);
    }
}