<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_cannot_access_teacher_routes(): void
    {
        $student = User::factory()->create(['role' => 'student']);

        $response = $this->actingAs($student)->get('/manage-additional-content');

        $response->assertStatus(403);
    }

    public function test_teacher_can_access_teacher_routes(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);

        $response = $this->actingAs($teacher)->get('/manage-additional-content');

        $response->assertStatus(200);
    }

    public function test_administrator_can_access_teacher_routes(): void
    {
        $admin = User::factory()->create(['role' => 'administrator']);

        $response = $this->actingAs($admin)->get('/manage-additional-content');

        $response->assertStatus(200);
    }

    public function test_student_can_access_learning_content(): void
    {
        $student = User::factory()->create(['role' => 'student']);

        $response = $this->actingAs($student)->get('/learning-content');

        $response->assertStatus(200);
    }

    public function test_unauthenticated_user_cannot_access_protected_routes(): void
    {
        $response = $this->get('/manage-additional-content');

        $response->assertRedirect('/login');
    }
}