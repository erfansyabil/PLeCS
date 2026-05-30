<?php

namespace Tests\Feature;

use App\Models\CodingExercise;
use App\Models\Enrollment;
use App\Models\LearningContent;
use App\Models\Quiz;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssessmentFeatureTest extends TestCase
{
    use RefreshDatabase;

    private function createPublishedCourse(): LearningContent
    {
        return LearningContent::create([
            'title' => 'Web Development',
            'description' => 'Build websites and interactive interfaces.',
            'content' => 'Course content',
            'type' => 'course',
            'difficulty_level' => 'Beginner',
            'estimated_hours' => 12,
            'keywords' => 'html, css, javascript',
            'parent_id' => null,
            'resource_type' => 'none',
            'resource_url' => null,
            'resource_path' => null,
        ]);
    }

    public function test_enrolled_student_can_view_course_assessments(): void
    {
        $student = User::factory()->student()->create();
        $course = $this->createPublishedCourse();

        Enrollment::create([
            'studentID' => $student->id,
            'courseID' => $course->id,
            'pathID' => null,
            'status' => 'active',
            'progress' => 0,
            'enrolled_at' => now(),
        ]);

        Quiz::create([
            'course_id' => $course->id,
            'title' => 'HTML Basics',
            'description' => 'Test your HTML knowledge.',
            'difficulty_level' => 'Beginner',
            'points' => 10,
            'questions' => [
                [
                    'question' => 'What does HTML stand for?',
                    'options' => ['HyperText Markup Language', 'Hot Mail', 'Home Tool Markup Language'],
                    'correct_index' => 0,
                    'points' => 10,
                ],
            ],
            'is_published' => true,
            'published_at' => now(),
        ]);

        CodingExercise::create([
            'course_id' => $course->id,
            'title' => 'Return a Value',
            'description' => 'Write a function that returns a value.',
            'difficulty_level' => 'Beginner',
            'points' => 10,
            'instructions' => 'Return any value from the function.',
            'starter_code' => 'function answer() {\n    // TODO\n}',
            'test_cases' => [
                [
                    'label' => 'Contains return',
                    'must_contain' => ['return'],
                    'points' => 10,
                ],
            ],
            'is_published' => true,
            'published_at' => now(),
        ]);

        $response = $this->actingAs($student)->get(route('student.assessment.show', $course->id));

        $response->assertOk();
    }

    public function test_student_cannot_access_unenrolled_assessment(): void
    {
        $student = User::factory()->student()->create();
        $course = $this->createPublishedCourse();

        $quiz = Quiz::create([
            'course_id' => $course->id,
            'title' => 'HTML Basics',
            'description' => 'Test your HTML knowledge.',
            'difficulty_level' => 'Beginner',
            'points' => 10,
            'questions' => [
                [
                    'question' => 'What does HTML stand for?',
                    'options' => ['HyperText Markup Language', 'Hot Mail', 'Home Tool Markup Language'],
                    'correct_index' => 0,
                    'points' => 10,
                ],
            ],
            'is_published' => true,
            'published_at' => now(),
        ]);

        $response = $this->actingAs($student)->get(route('student.assessment.quiz.show', [$course->id, $quiz->id]));

        $response->assertStatus(403);
    }

    public function test_student_can_submit_quiz_attempt_and_score_it(): void
    {
        $student = User::factory()->student()->create();
        $course = $this->createPublishedCourse();

        Enrollment::create([
            'studentID' => $student->id,
            'courseID' => $course->id,
            'pathID' => null,
            'status' => 'active',
            'progress' => 0,
            'enrolled_at' => now(),
        ]);

        $quiz = Quiz::create([
            'course_id' => $course->id,
            'title' => 'HTML Basics',
            'description' => 'Test your HTML knowledge.',
            'difficulty_level' => 'Beginner',
            'points' => 10,
            'questions' => [
                [
                    'question' => 'What does HTML stand for?',
                    'options' => ['HyperText Markup Language', 'Hot Mail', 'Home Tool Markup Language'],
                    'correct_index' => 0,
                    'points' => 10,
                ],
            ],
            'is_published' => true,
            'published_at' => now(),
        ]);

        $response = $this->actingAs($student)->post(route('student.assessment.quiz.store', [$course->id, $quiz->id]), [
            'answers' => [0 => 0],
        ]);

        $response->assertRedirect(route('student.assessment.quiz.show', [$course->id, $quiz->id]));

        $this->assertDatabaseHas('quiz_attempts', [
            'quiz_id' => $quiz->id,
            'student_id' => $student->id,
            'score' => 10,
            'max_score' => 10,
            'passed' => 1,
        ]);
    }

    public function test_student_can_submit_coding_exercise_attempt_and_score_it(): void
    {
        $student = User::factory()->student()->create();
        $course = $this->createPublishedCourse();

        Enrollment::create([
            'studentID' => $student->id,
            'courseID' => $course->id,
            'pathID' => null,
            'status' => 'active',
            'progress' => 0,
            'enrolled_at' => now(),
        ]);

        $exercise = CodingExercise::create([
            'course_id' => $course->id,
            'title' => 'Return a Value',
            'description' => 'Write a function that returns a value.',
            'difficulty_level' => 'Beginner',
            'points' => 10,
            'instructions' => 'Return any value from the function.',
            'starter_code' => 'function answer() {\n    // TODO\n}',
            'test_cases' => [
                [
                    'label' => 'Contains return',
                    'must_contain' => ['return'],
                    'points' => 10,
                ],
            ],
            'is_published' => true,
            'published_at' => now(),
        ]);

        $response = $this->actingAs($student)->post(route('student.assessment.coding-exercise.store', [$course->id, $exercise->id]), [
            'submission_code' => 'function answer() { return true; }',
        ]);

        $response->assertRedirect(route('student.assessment.coding-exercise.show', [$course->id, $exercise->id]));

        $this->assertDatabaseHas('coding_exercise_attempts', [
            'coding_exercise_id' => $exercise->id,
            'student_id' => $student->id,
            'score' => 10,
            'max_score' => 10,
            'passed' => 1,
        ]);
    }
}
