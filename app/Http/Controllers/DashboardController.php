<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the dashboard based on user role.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Determine which layout to use based on role
        $layout = match($user->role) {
            'student' => 'StudentLayout',
            'teacher' => 'TeacherLayout',
            'administrator' => 'AdministratorLayout',
            default => 'StudentLayout', // fallback
        };

        return Inertia::render('Dashboard', [
            'layout' => $layout,
        ]);
    }
}
