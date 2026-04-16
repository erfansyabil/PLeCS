<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class QuizController extends Controller
{
    /**
     * Display a listing of quizzes and exercises and coding exercises.
     */
    public function index(Request $request)
    {
        // TODO: Load quizzes and exercises from a Quiz model when available.
        return Inertia::render('Admin/QuizzesAndExercises/index', [
            'layout' => 'AdministratorLayout',
            // 'quizzesandexercisesandexercises' => Quiz::all(),
        ]);
    }

    /**
     * Show the form for creating a new quiz.
     */
    public function create(Request $request)
    {
        return Inertia::render('Admin/QuizzesAndExercises/create', [
            'layout' => 'AdministratorLayout',
        ]);
    }

    /**
     * Store a newly created quiz.
     */
    public function store(Request $request)
    {
        // TODO: validate and persist the new quiz or coding exercise.
        // $validated = $request->validate([
        //     'title' => 'required|string|max:255',
        //     'description' => 'nullable|string',
        //     'type' => 'required|in:quiz,coding',
        //     'payload' => 'required|array',
        // ]);
        // Quiz::create($validated);

        return redirect()->route('admin.quizzesandexercises.index');
    }

    /**
     * Display the specified quiz.
     */
    public function show(Request $request, $id)
    {
        // $quiz = Quiz::findOrFail($id);
        return Inertia::render('Admin/QuizzesAndExercises/show', [
            'layout' => 'AdministratorLayout',
            'quizId' => $id,
            // 'quiz' => $quiz,
        ]);
    }

    /**
     * Show the form for editing the specified quiz.
     */
    public function edit(Request $request, $id)
    {
        // $quiz = Quiz::findOrFail($id);
        return Inertia::render('Admin/QuizzesAndExercises/edit', [
            'layout' => 'AdministratorLayout',
            'quizId' => $id,
            // 'quiz' => $quiz,
        ]);
    }

    /**
     * Update the specified quiz.
     */
    public function update(Request $request, $id)
    {
        // $quiz = Quiz::findOrFail($id);
        // $validated = $request->validate([
        //     'title' => 'required|string|max:255',
        //     'description' => 'nullable|string',
        //     'type' => 'required|in:quiz,coding',
        //     'payload' => 'required|array',
        // ]);
        // $quiz->update($validated);

        return redirect()->route('admin.quizzesandexercises.index');
    }

    /**
     * Remove the specified quiz.
     */
    public function destroy(Request $request, $id)
    {
        // $quiz = Quiz::findOrFail($id);
        // $quiz->delete();

        return redirect()->route('admin.quizzesandexercises.index');
    }
}
