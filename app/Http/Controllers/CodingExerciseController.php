<?php

namespace App\Http\Controllers;

use App\Models\CodingExercise;
use App\Models\LearningContent;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CodingExerciseController extends Controller
{
    private function courseOptions()
    {
        return LearningContent::query()
            ->where('type', 'course')
            ->orderBy('title')
            ->get(['id', 'title']);
    }

    private function decodeTestCases(string $testCasesJson): array
    {
        $decoded = json_decode($testCasesJson, true);

        return is_array($decoded) ? $decoded : [];
    }

    public function index()
    {
        $codingExercises = CodingExercise::query()
            ->with('course:id,title')
            ->latest()
            ->get()
            ->map(fn (CodingExercise $exercise) => [
                'id' => $exercise->id,
                'title' => $exercise->title,
                'description' => $exercise->description,
                'difficulty_level' => $exercise->difficulty_level,
                'points' => $exercise->points,
                'is_published' => $exercise->is_published,
                'test_cases_count' => count($exercise->test_cases ?? []),
                'course' => [
                    'id' => $exercise->course?->id,
                    'title' => $exercise->course?->title,
                ],
                'created_at' => optional($exercise->created_at)?->format('Y-m-d H:i'),
            ])
            ->values();

        return Inertia::render('Admin/CodingExercises/index', [
            'codingExercises' => $codingExercises,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/CodingExercises/create', [
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
            'instructions' => ['required', 'string'],
            'starter_code' => ['nullable', 'string'],
            'test_cases_json' => ['required', 'json'],
            'is_published' => ['nullable', 'boolean'],
        ]);

        CodingExercise::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'course_id' => $validated['course_id'],
            'difficulty_level' => $validated['difficulty_level'],
            'points' => $validated['points'],
            'instructions' => $validated['instructions'],
            'starter_code' => $validated['starter_code'] ?? null,
            'test_cases' => $this->decodeTestCases($validated['test_cases_json']),
            'is_published' => (bool) ($validated['is_published'] ?? false),
            'published_at' => ($validated['is_published'] ?? false) ? now() : null,
        ]);

        return redirect()->route('admin.coding-exercises.index');
    }

    public function show(CodingExercise $codingExercise)
    {
        $codingExercise->load('course:id,title');

        return Inertia::render('Admin/CodingExercises/show', [
            'codingExercise' => [
                'id' => $codingExercise->id,
                'title' => $codingExercise->title,
                'description' => $codingExercise->description,
                'course' => [
                    'id' => $codingExercise->course?->id,
                    'title' => $codingExercise->course?->title,
                ],
                'difficulty_level' => $codingExercise->difficulty_level,
                'points' => $codingExercise->points,
                'instructions' => $codingExercise->instructions,
                'starter_code' => $codingExercise->starter_code,
                'test_cases' => $codingExercise->test_cases ?? [],
                'is_published' => $codingExercise->is_published,
                'published_at' => optional($codingExercise->published_at)?->format('Y-m-d H:i'),
            ],
        ]);
    }

    public function edit(CodingExercise $codingExercise)
    {
        $codingExercise->load('course:id,title');

        return Inertia::render('Admin/CodingExercises/edit', [
            'courses' => $this->courseOptions(),
            'codingExercise' => [
                'id' => $codingExercise->id,
                'title' => $codingExercise->title,
                'description' => $codingExercise->description,
                'course_id' => $codingExercise->course_id,
                'difficulty_level' => $codingExercise->difficulty_level,
                'points' => $codingExercise->points,
                'instructions' => $codingExercise->instructions,
                'starter_code' => $codingExercise->starter_code,
                'test_cases_json' => json_encode($codingExercise->test_cases ?? [], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
                'is_published' => $codingExercise->is_published,
            ],
        ]);
    }

    public function update(Request $request, CodingExercise $codingExercise)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'course_id' => ['required', 'integer', Rule::exists('learning_contents', 'id')->where('type', 'course')],
            'difficulty_level' => ['required', Rule::in(['Beginner', 'Intermediate', 'Advanced'])],
            'points' => ['required', 'integer', 'min:1'],
            'instructions' => ['required', 'string'],
            'starter_code' => ['nullable', 'string'],
            'test_cases_json' => ['required', 'json'],
            'is_published' => ['nullable', 'boolean'],
        ]);

        $codingExercise->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'course_id' => $validated['course_id'],
            'difficulty_level' => $validated['difficulty_level'],
            'points' => $validated['points'],
            'instructions' => $validated['instructions'],
            'starter_code' => $validated['starter_code'] ?? null,
            'test_cases' => $this->decodeTestCases($validated['test_cases_json']),
            'is_published' => (bool) ($validated['is_published'] ?? false),
            'published_at' => ($validated['is_published'] ?? false) ? ($codingExercise->published_at ?? now()) : null,
        ]);

        return redirect()->route('admin.coding-exercises.index');
    }

    public function destroy(CodingExercise $codingExercise)
    {
        $codingExercise->delete();

        return redirect()->route('admin.coding-exercises.index');
    }
}