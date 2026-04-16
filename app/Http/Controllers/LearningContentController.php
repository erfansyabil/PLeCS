<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class LearningContentController extends Controller
{
    /**
     * Determine which layout should be used for the current user.
     */
    private function layoutForRole(string $role): string
    {
        return match ($role) {
            'student' => 'StudentLayout',
            'teacher' => 'TeacherLayout',
            'administrator' => 'AdministratorLayout',
            default => 'AuthenticatedLayout',
        };
    }

    /**
     * Display the learning content index.
     */
    public function index(Request $request)
    {
        return Inertia::render('Student/LearningContent/index', [
            'layout' => $this->layoutForRole($request->user()->role),
        ]);
    }

    /**
     * Display a specific course page.
     */
    public function content(Request $request, int $id)
    {
        return Inertia::render('Student/LearningContent/content', [
            'courseId' => $id,
            'layout' => $this->layoutForRole($request->user()->role),
        ]);
    }

    /**
     * Display a learning content topic page.
     */
    public function topic(Request $request, int $id)
    {
        return Inertia::render('Student/LearningContent/topic', [
            'topicId' => $id,
            'layout' => $this->layoutForRole($request->user()->role),
        ]);
    }
}
