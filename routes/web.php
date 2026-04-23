<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LearningContentController;
use App\Http\Controllers\LearningPathController;
use App\Http\Controllers\AdditionalLearningContentController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\Auth\GoogleController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Google Authentication
Route::get('/auth/google/redirect', [GoogleController::class, 'redirect'])->name('auth.google.redirect');
Route::get('/auth/google/callback', [GoogleController::class, 'callback'])->name('auth.google.callback');


/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {

    Route::post('/api/recommendations', [LearningPathController::class, 'recommend'])
        ->name('recommendations.store');

    // Dashboard - DashboardController handles role-based redirect
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Profile - shared across all roles (UC001)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');


    /*
    |----------------------------------------------------------------------
    | Student Routes
    |----------------------------------------------------------------------
    */

    Route::prefix('student')->name('student.')->group(function () {

        // UC002: Access Personalized Learning Content
        // UC003: View Topics (student view)
        Route::get('/learning-content', [LearningContentController::class, 'index'])
            ->name('learning-content.index');
        Route::get('/learning-content/{id}', [LearningContentController::class, 'content'])
            ->name('learning-content.show');
        Route::get('/learning-content/topic/{id}', [LearningContentController::class, 'topic'])
            ->name('learning-content.topic.show');

        // UC010: Enroll in Courses
        Route::get('/enrollment', function () {
            return Inertia::render('Student/Enrollment/index');
        })->name('enrollment.index');

        // UC008: Manage Learning Path
        Route::get('/learning-path', function () {
            return Inertia::render('Student/LearningPath/index');
        })->name('learning-path.index');

        // UC007: Attempt Gamified Quizzes
        Route::get('/assessment', function () {
            return Inertia::render('Student/Assessment/index');
        })->name('assessment.index');
        Route::get('/assessment/{courseId}', function ($courseId) {
            return Inertia::render('Student/Assessment/quiz', ['courseId' => $courseId]);
        })->name('assessment.show');

        // UC011: View Performance Analytics
        Route::get('/progress', function () {
            return Inertia::render('Student/Progress/index');
        })->name('progress.index');
        Route::get('/progress/{id}', function ($id) {
            return Inertia::render('Student/Progress/show', ['courseId' => $id]);
        })->name('progress.show');

        // UC012: Provide Feedback on Learning Modules
        Route::get('/feedback', function () {
            return Inertia::render('Student/Feedback/index');
        })->name('feedback.index');
        Route::get('/feedback/form', function () {
            return Inertia::render('Student/Feedback/form');
        })->name('feedback.form');

    });


    /*
    |----------------------------------------------------------------------
    | Teacher Routes
    |----------------------------------------------------------------------
    */

    Route::prefix('teacher')->name('teacher.')->middleware('role:teacher')->group(function () {

        // UC003: View Topics (teacher view)
        Route::get('/topics', [LearningContentController::class, 'index'])
            ->name('topics.index');
        Route::get('/topics/topic/{id}', [LearningContentController::class, 'topic'])
            ->whereNumber('id')
            ->name('topics.topic');
        Route::get('/topics/{id}', [LearningContentController::class, 'content'])
            ->whereNumber('id')
            ->name('topics.show');

        // UC005: Manage Additional Materials
        Route::resource('additional-content', AdditionalLearningContentController::class);

        // UC013: Provide Feedback and Guidance
        Route::get('/guidance', function () {
            return Inertia::render('Teacher/FeedbackAndGuidance/index');
        })->name('guidance.index');

    });


    /*
    |----------------------------------------------------------------------
    | Administrator Routes
    |----------------------------------------------------------------------
    */

    Route::prefix('admin')->name('admin.')->middleware('role:administrator')->group(function () {

        // UC003: View Topics (admin view)
        Route::get('/topics', function () {
            return Inertia::render('Admin/Topics/index');
        })->name('topics.index');
        Route::get('/topics/{id}', function ($id) {
            return Inertia::render('Admin/Topics/show', ['topicId' => $id]);
        })->name('topics.show');

        // UC004: Manage Learning Content
        Route::resource('learning-content', LearningContentController::class);
        Route::post('/learning-content/editor-image', [LearningContentController::class, 'uploadEditorImage'])
            ->name('learning-content.editor-image');

        // UC009: Manage Quizzes and Coding Exercises
        Route::resource('quizzes', QuizController::class);

    });

});

require __DIR__.'/auth.php';