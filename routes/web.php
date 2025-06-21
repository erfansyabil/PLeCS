<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Learning Content module route
    Route::get('/learning-content', function () {
        return Inertia::render('LearningContent/index');
        })->middleware(['auth', 'verified'])->name('learning-content.index');

    Route::get('/learning-content/{id}', function ($id) {
        return Inertia::render('LearningContent/content', ['courseId' => $id]);
        })->middleware(['auth', 'verified'])->name('learning-content.show');

    Route::get('/learning-content/topic/{id}', function ($id) {
        return Inertia::render('LearningContent/topic', ['topicId' => $id]);
        })->middleware(['auth', 'verified'])->name('learning-content.topic.show');
    
    
    // Assessment module route
    Route::get('/assessment', function () {
        return Inertia::render('Assessment/index');
        })->middleware(['auth', 'verified'])->name('assessment.index');

    Route::get('/quiz/{course}', function ($course) {
        return Inertia::render('Assessment/quiz', [
        'courseId' => $course,
        ]);})->name('quiz.show');

    Route::get('/feedback', function () {
        return Inertia::render('Feedback/index');
        })->middleware(['auth', 'verified'])->name('feedback.index');
    
    Route::get('/feedback/form', function () {
        return Inertia::render('Feedback/form');
    })->middleware(['auth', 'verified'])->name('feedback.form');
});



require __DIR__.'/auth.php';
