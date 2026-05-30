<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LearningContentController;
use App\Http\Controllers\LearningPathController;
use App\Http\Controllers\AdditionalLearningContentController;
use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\CodingExerciseController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\EnrollmentController;
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
        Route::get('/learning-content/{course}/{topic}', [LearningContentController::class, 'topic'])
            ->whereNumber('course')
            ->whereNumber('topic')
            ->name('learning-content.topic.show');

        // UC010: Enroll in Courses
        Route::get('/enrollment', function () {
            $courses = \App\Models\LearningContent::query()
                ->where('type', 'course')
                ->whereNull('parent_id')
                ->with(['children' => fn ($query) => $query->where('type', 'topic')->orderBy('title')])
                ->orderBy('title')
                ->get()
                ->map(function ($course) {
                    return [
                        'id' => $course->id,
                        'title' => $course->title,
                        'description' => $course->description,
                        'difficulty' => $course->difficulty_level ?? 'Beginner',
                        'estimated_hours' => $course->estimated_hours,
                        'keywords' => $course->keywords,
                        'topics' => $course->children->map(fn ($topic) => $topic->title)->values()->all(),
                    ];
                })
                ->values();

            return Inertia::render('Student/Enrollment/index', [
                'courses' => $courses,
            ]);
        })->name('enrollment.index');

        Route::post('/enrollment/enroll', [EnrollmentController::class, 'enroll'])->name('enrollment.enroll');
        Route::get('/enrollment/my-courses', [EnrollmentController::class, 'myEnrollments'])->name('enrollment.my-courses');
        Route::get('/enrollment/check/{courseID}', [EnrollmentController::class, 'check'])->name('enrollment.check');
        Route::delete('/enrollment/{enrollmentID}/drop', [EnrollmentController::class, 'drop'])->name('enrollment.drop');
        // Enrollment history page
        Route::get('/enrollment/history', [EnrollmentController::class, 'history'])
            ->name('enrollment.history');

        
        // UC008: Manage Learning Path
        Route::get('/learning-path', function () {
            return Inertia::render('Student/LearningPath/index');
        })->name('learning-path.index');

        // UC008: Manage Learning Path - API endpoints
        Route::prefix('/learning-path')->name('learning-path.')->group(function () 
        {
        Route::get('/api', [LearningPathController::class, 'show'])->name('api.show');
        Route::put('/reorder', [LearningPathController::class, 'reorder'])->name('api.reorder');
        Route::delete('/api', [LearningPathController::class, 'destroy'])->name('api.destroy');
        Route::post('/generate', [LearningPathController::class, 'generateFromSurvey'])->name('api.generate');
        Route::post('/{path}/activate', [LearningPathController::class, 'activateGeneratedPath'])
            ->whereNumber('path')
            ->name('api.activate');
        });

        // UC007: Attempt Gamified Quizzes and Coding Exercises
        Route::get('/assessment', function () {
            return app(AssessmentController::class)->index();
        })->name('assessment.index');
        Route::get('/assessment/{course}', [AssessmentController::class, 'showCourse'])
            ->whereNumber('course')
            ->name('assessment.show');
        Route::get('/assessment/{course}/quizzes/{quiz}', [AssessmentController::class, 'showQuiz'])
            ->whereNumber('course')
            ->whereNumber('quiz')
            ->name('assessment.quiz.show');
        Route::post('/assessment/{course}/quizzes/{quiz}', [AssessmentController::class, 'storeQuizAttempt'])
            ->whereNumber('course')
            ->whereNumber('quiz')
            ->name('assessment.quiz.store');
        Route::get('/assessment/{course}/coding-exercises/{codingExercise}', [AssessmentController::class, 'showCodingExercise'])
            ->whereNumber('course')
            ->whereNumber('codingExercise')
            ->name('assessment.coding-exercise.show');
        Route::post('/assessment/{course}/coding-exercises/{codingExercise}', [AssessmentController::class, 'storeCodingExerciseAttempt'])
            ->whereNumber('course')
            ->whereNumber('codingExercise')
            ->name('assessment.coding-exercise.store');

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
        Route::get('/topics', function () {
            return Inertia::render('Teacher/Topics/index');
        })->name('topics.index');
        Route::get('/topics/{course}', function ($course) {
            return Inertia::render('Teacher/Topics/content', ['courseId' => $course]);
        })->name('topics.show');
        Route::get('/topics/{course}/{topic}', function ($course, $topic) {
            abort_unless((int)$topic !== 0, 404);
            return Inertia::render('Teacher/Topics/show', ['topicId' => $topic, 'courseId' => $course]);
        })->name('topics.topic.show');

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
        Route::get('/topics/{course}', function ($course) {
            return Inertia::render('Admin/Topics/content', ['courseId' => $course]);
        })->name('topics.show');
        Route::get('/topics/{course}/{topic}', function ($course, $topic) {
            abort_unless((int)$topic !== 0, 404);
            return Inertia::render('Admin/Topics/show', ['topicId' => $topic, 'courseId' => $course]);
        })->name('topics.topic.show');

        // Admin: view a topic under a specific learning-content (course)
        Route::get('/learning-content/{course}/{topic}', [LearningContentController::class, 'topic'])
            ->whereNumber('course')
            ->whereNumber('topic')
            ->name('learning-content.topic.show');

        // Admin: explicit edit route for topics to avoid ID collisions with learning_contents
        Route::get('/learning-content/topic/{topic}/edit', [LearningContentController::class, 'editTopic'])
            ->whereNumber('topic')
            ->name('learning-content.topic.edit');

            // Admin: explicit delete route for topics to avoid collisions with learning_contents
            Route::delete('/learning-content/topic/{topic}', [LearningContentController::class, 'destroyTopic'])
                ->whereNumber('topic')
                ->name('learning-content.topic.destroy');

        // UC004: Manage Learning Content
        Route::resource('learning-content', LearningContentController::class);
        Route::post('/learning-content/editor-image', [LearningContentController::class, 'uploadEditorImage'])
            ->name('learning-content.editor-image');

        // UC009: Manage Quizzes
        Route::resource('quizzes', QuizController::class);
        // UC009: Manage Coding Exercises
        Route::resource('coding-exercises', CodingExerciseController::class);

    });

});

require __DIR__.'/auth.php';