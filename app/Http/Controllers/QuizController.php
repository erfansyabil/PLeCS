<?php

namespace App\Http\Controllers;

use App\Models\LearningContent;
use App\Models\Quiz;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class QuizController extends Controller
{
    private function courseOptions()
    {
        return LearningContent::query()
            ->where('type', 'course')
            ->orderBy('title')
            ->get(['id', 'title']);
    }

    private function decodeQuestions(string $questionsJson): array
    {
        $decoded = json_decode($questionsJson, true);

        return is_array($decoded) ? $decoded : [];
    }

    public function index()
    {
        $quizzes = Quiz::query()
            ->with('course:id,title')
            ->latest()
            ->get()
            ->map(fn (Quiz $quiz) => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'description' => $quiz->description,
                'difficulty_level' => $quiz->difficulty_level,
                'points' => $quiz->points,
                'is_published' => $quiz->is_published,
                'course' => [
                    'id' => $quiz->course?->id,
                    'title' => $quiz->course?->title,
                ],
                'created_at' => optional($quiz->created_at)?->format('Y-m-d H:i'),
            ])
            ->values();

        return Inertia::render('Admin/Quizzes/index', [
            'quizzes' => $quizzes,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Quizzes/create', [
            'courses' => $this->courseOptions(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'course_id' => ['required', 'integer', Rule::exists('learning_contents', 'id')->where('type', 'course')],
            'difficulty_level' => ['required', Rule::in(['Beginner', 'Intermediate', 'Advanced'])],
            'points' => ['required', 'integer', 'min:1'],
            'questions_json' => ['required', 'json'],
            'is_published' => ['nullable', 'boolean'],
        ]);

        Quiz::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'course_id' => $validated['course_id'],
            'difficulty_level' => $validated['difficulty_level'],
            'points' => $validated['points'],
            'questions' => $this->decodeQuestions($validated['questions_json']),
            'is_published' => (bool) ($validated['is_published'] ?? false),
            'published_at' => ($validated['is_published'] ?? false) ? now() : null,
        ]);

        return redirect()->route('admin.quizzes.index');
    }

    public function show(Quiz $quiz)
    {
        $quiz->load('course:id,title');

        return Inertia::render('Admin/Quizzes/show', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'description' => $quiz->description,
                'course' => [
                    'id' => $quiz->course?->id,
                    'title' => $quiz->course?->title,
                ],
                'difficulty_level' => $quiz->difficulty_level,
                'points' => $quiz->points,
                'questions' => $quiz->questions ?? [],
                'is_published' => $quiz->is_published,
                'published_at' => optional($quiz->published_at)?->format('Y-m-d H:i'),
            ],
        ]);
    }

    public function edit(Quiz $quiz)
    {
        $quiz->load('course:id,title');

        return Inertia::render('Admin/Quizzes/edit', [
            'courses' => $this->courseOptions(),
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'description' => $quiz->description,
                'course_id' => $quiz->course_id,
                'difficulty_level' => $quiz->difficulty_level,
                'points' => $quiz->points,
                'questions_json' => json_encode($quiz->questions ?? [], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
                'is_published' => $quiz->is_published,
            ],
        ]);
    }

    public function update(Request $request, Quiz $quiz)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'course_id' => ['required', 'integer', Rule::exists('learning_contents', 'id')->where('type', 'course')],
            'difficulty_level' => ['required', Rule::in(['Beginner', 'Intermediate', 'Advanced'])],
            'points' => ['required', 'integer', 'min:1'],
            'questions_json' => ['required', 'json'],
            'is_published' => ['nullable', 'boolean'],
        ]);

        $quiz->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'course_id' => $validated['course_id'],
            'difficulty_level' => $validated['difficulty_level'],
            'points' => $validated['points'],
            'questions' => $this->decodeQuestions($validated['questions_json']),
            'is_published' => (bool) ($validated['is_published'] ?? false),
            'published_at' => ($validated['is_published'] ?? false) ? ($quiz->published_at ?? now()) : null,
        ]);

        return redirect()->route('admin.quizzes.index');
    }

    public function destroy(Quiz $quiz)
    {
        $quiz->delete();

        return redirect()->route('admin.quizzes.index');
    }
}
