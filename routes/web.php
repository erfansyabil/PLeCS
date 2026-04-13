<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Auth\GoogleController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

//Google Authentication routes
Route::get('/auth/google/redirect', [GoogleController::class, 'redirect'])->name('auth.google.redirect');
Route::get('/auth/google/callback', [GoogleController::class, 'callback'])->name('auth.google.callback');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Learning Content module routes - accessible to students, teachers, and administrators
    Route::get('/learning-content', [\App\Http\Controllers\LearningContentController::class, 'index'])
        ->middleware(['auth', 'verified'])
        ->name('learning-content.index');

    Route::get('/learning-content/{id}', [\App\Http\Controllers\LearningContentController::class, 'content'])
        ->middleware(['auth', 'verified'])
        ->name('learning-content.show');

    Route::get('/learning-content/topic/{id}', [\App\Http\Controllers\LearningContentController::class, 'topic'])
        ->middleware(['auth', 'verified'])
        ->name('learning-content.topic.show');
    
    // Manage Additional Content module route - accessible to teachers and administrators only
    Route::get('/manage-additional-content', function () {
        return Inertia::render('AdditionalContent/index');
        })->middleware(['auth', 'verified', 'role:teacher,administrator'])->name('manage-additional-content.index');

    Route::get('/manage-additional-content/{id}', function ($id) {
        return Inertia::render('AdditionalContent/content', ['courseId' => $id]);
        })->middleware(['auth', 'verified'])->name('manage-additional-content.show');

    Route::get('/manage-additional-content/topic/{id}', function ($id) {
        return Inertia::render('AdditionalContent/topic', ['topicId' => $id]);
        })->middleware(['auth', 'verified'])->name('manage-additional-content.topic.show');


    // View Topics module route
    // Route::get('/view-topics', function () {
    //     return Inertia::render('Topics/index');
    //     })->middleware(['auth', 'verified'])->name('view-topics.index');

    // Route::get('/view-topics/{id}', function ($id) {
    //     return Inertia::render('Topics/show', ['topicId' => $id]);
    //     })->middleware(['auth', 'verified'])->name('view-topics.show');


    // Manage Learning Content module route (for administrators)
    Route::get('/manage-learning-content', function () {
        return Inertia::render('ManageLearningContent/index');
        })->middleware(['auth', 'verified'])->name('manage-learning-content.index');

    Route::get('/manage-learning-content/{id}', function ($id) {
        return Inertia::render('ManageLearningContent/show', ['contentId' => $id]);
        })->middleware(['auth', 'verified'])->name('manage-learning-content.show');


    // Manage Quizzes and Coding Exercises module route (for administrators)
    Route::get('/manage-quizzes-coding', function () {
        return Inertia::render('ManageQuizzesCoding/index');
        })->middleware(['auth', 'verified'])->name('manage-quizzes-coding.index');

    Route::get('/manage-quizzes-coding/{id}', function ($id) {
        return Inertia::render('ManageQuizzesCoding/show', ['quizId' => $id]);
        })->middleware(['auth', 'verified'])->name('manage-quizzes-coding.show');


    // Assessment module route
    Route::get('/assessment', function () {
        return Inertia::render('Assessment/index');
        })->middleware(['auth', 'verified'])->name('assessment.index');

    Route::get('/quiz/{course}', function ($course) {
        return Inertia::render('Assessment/quiz', [
        'courseId' => $course,
        ]);})->name('quiz.show');

    Route::get('/feedback', function (Request $request) {
        $user = $request->user();

        // Determine which layout to use based on role
        $layout = match($user->role) {
            'student' => 'StudentLayout',
            'teacher' => 'TeacherLayout',
            'administrator' => 'AdministratorLayout',
            default => 'AuthenticatedLayout', // fallback
        };

        return Inertia::render('Feedback/index', [
            'layout' => $layout,
        ]);
        })->middleware(['auth', 'verified'])->name('feedback.index');
    
    Route::get('/teacher-feedback', function () {
        return Inertia::render('Feedback/index', ['layout' => 'TeacherLayout']);
        })->middleware(['auth', 'verified'])->name('teacher-feedback.index');
    
    Route::get('/feedback/form', function (Request $request) {
        $user = $request->user();

        // Determine which layout to use based on role
        $layout = match($user->role) {
            'student' => 'StudentLayout',
            'teacher' => 'TeacherLayout',
            'administrator' => 'AdministratorLayout',
            default => 'AuthenticatedLayout', // fallback
        };

        return Inertia::render('Feedback/form', [
            'layout' => $layout,
        ]);
        })->middleware(['auth', 'verified'])->name('feedback.form');


    Route::get('/progress', function () {
        return Inertia::render('Progress/index');
        })->middleware(['auth', 'verified'])->name('progress.index');

    Route::get('/progress/{id}', function ($id) {
        // You can pass more data as needed
        return Inertia::render('Progress/show', ['courseId' => $id]);
        })->middleware(['auth', 'verified'])->name('progress.show');
});



require __DIR__.'/auth.php';
