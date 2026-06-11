<?php

namespace App\Http\Controllers;

use App\Models\LearningContent;
use App\Models\Quiz;
use App\Models\Topic;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;

class QuizController extends Controller
{
    /**
     * Topics grouped by course for the create/edit dropdowns.
     * Returns: [ ['id' => 1, 'name' => 'Intro to AI', 'course_title' => 'AI Fundamentals'], ... ]
     */
    private function topicOptions(): \Illuminate\Support\Collection
    {
        return Topic::query()
            ->where('isActive', true)
            ->with('course:id,title')
            ->orderBy('courseID')
            ->orderBy('orderIndex')
            ->get()
            ->map(fn (Topic $topic) => [
                'id'           => $topic->topicID,
                'name'         => $topic->name,
                'course_id'    => $topic->courseID,
                'course_title' => $topic->course?->title ?? 'Unknown course',
            ]);
    }

    private function decodeQuestions(string $questionsJson): array
    {
        $decoded = json_decode($questionsJson, true);

        return is_array($decoded) ? $decoded : [];
    }

    // -------------------------------------------------------------------------
    // CRUD
    // -------------------------------------------------------------------------

    public function index()
    {
        $quizzes = Quiz::query()
            ->with('topic.course:id,title')   // topic → course in one eager load
            ->latest()
            ->get()
            ->map(fn (Quiz $quiz) => [
                'id'               => $quiz->id,
                'title'            => $quiz->title,
                'description'      => $quiz->description,
                'difficulty_level' => $quiz->difficulty_level,
                'points'           => $quiz->points,
                'is_published'     => $quiz->is_published,
                'topic'            => [
                    'id'    => $quiz->topic?->topicID,
                    'name'  => $quiz->topic?->name,
                ],
                'course'           => [
                    'id'    => $quiz->topic?->course?->id,
                    'title' => $quiz->topic?->course?->title,
                ],
                'created_at'       => optional($quiz->created_at)?->format('Y-m-d H:i'),
            ])
            ->values();

        return Inertia::render('Admin/Quizzes/index', [
            'quizzes' => $quizzes,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Quizzes/create', [
            'topics' => $this->topicOptions(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required'],
            'description' => ['nullable'],
            'topic_id' => ['required'],
            'difficulty_level' => ['required'],
            'points' => ['nullable'],
            'questions' => ['required', 'array'],
            'is_published' => ['boolean'],
        ]);

        $topic = Topic::findOrFail($validated['topic_id']);

        $questions = $validated['questions'];

        $totalPoints = collect($questions)->sum(function ($q) {
            return (int) ($q['points'] ?? 0);
        });

        foreach ($questions as $qIndex => $question) {

            foreach ($question['options'] as $oIndex => $option) {

                // IF IMAGE OPTION WITH FILE
                if (isset($option['file']) && $option['file']) {

                    $path = $option['file']->store('quiz-options', 'public');

                    $questions[$qIndex]['options'][$oIndex]['url'] =
                        asset('storage/' . $path);

                    unset($questions[$qIndex]['options'][$oIndex]['file']);
                }
            }
        }

        Quiz::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'topic_id' => $validated['topic_id'],
            'course_id' => $topic->courseID,
            'difficulty_level' => $validated['difficulty_level'],
            'points' => $totalPoints,
            'questions' => $questions,
            'is_published' => (bool) ($validated['is_published'] ?? false),
            'published_at' => now(),
        ]);

        return redirect()->route('admin.quizzes.index');
    }

    public function show(Quiz $quiz)
    {
        $quiz->load('topic.course:id,title');

        return Inertia::render('Admin/Quizzes/show', [
            'quiz' => [
                'id'               => $quiz->id,
                'title'            => $quiz->title,
                'description'      => $quiz->description,
                'topic'            => [
                    'id'   => $quiz->topic?->topicID,
                    'name' => $quiz->topic?->name,
                ],
                'course'           => [
                    'id'    => $quiz->topic?->course?->id,
                    'title' => $quiz->topic?->course?->title,
                ],
                'difficulty_level' => $quiz->difficulty_level,
                'points'           => $quiz->points,
                'questions'        => $quiz->questions ?? [],
                'is_published'     => $quiz->is_published,
                'published_at'     => optional($quiz->published_at)?->format('Y-m-d H:i'),
            ],
        ]);
    }

    public function edit(Quiz $quiz)
    {
        $quiz->load('topic:topicID,name');

        return Inertia::render('Admin/Quizzes/edit', [
            'topics' => $this->topicOptions(),
            'quiz'   => [
                'id'               => $quiz->id,
                'title'            => $quiz->title,
                'description'      => $quiz->description,
                'topic_id'         => $quiz->topic_id,
                'difficulty_level' => $quiz->difficulty_level,
                'points'           => $quiz->points,
                'questions' => $quiz->questions ?? [],
                'is_published'     => $quiz->is_published,
            ],
        ]);
    }

    public function update(Request $request, Quiz $quiz)
    {
        $validated = $request->validate([
            'title'            => ['required'],
            'description'      => ['nullable'],
            'topic_id'         => ['required'],
            'difficulty_level' => ['required'],
            'points'           => ['required'],
            'questions'        => ['required'],
            'is_published'     => ['boolean'],
        ]);

        // ✅ Decode JSON safely
        $questions = json_decode($request->input('questions'), true) ?? [];

        // ✅ Handle uploaded files
        if ($request->hasFile('files')) {

            foreach ($request->file('files') as $key => $file) {

                [$qIndex, $oIndex] = explode('-', $key);

                $path = $file->store('quiz-options', 'public');

                $questions[$qIndex]['options'][$oIndex]['url'] =
                    asset('storage/' . $path);

                // ensure type stays image
                $questions[$qIndex]['options'][$oIndex]['type'] = 'image';

                // remove temp file field if exists
                unset($questions[$qIndex]['options'][$oIndex]['file']);
            }
        }

        // ✅ recalculate total points
        $totalPoints = collect($questions)->sum(fn ($q) =>
            (int) ($q['points'] ?? 0)
        );

        // ✅ update quiz
        $quiz->update([
            'title'            => $validated['title'],
            'description'      => $validated['description'] ?? null,
            'topic_id'         => $validated['topic_id'],
            'difficulty_level' => $validated['difficulty_level'],
            'points'           => $totalPoints,
            'questions'        => $questions,
            'is_published'     => (bool) ($validated['is_published'] ?? false),
            'published_at'     => ($validated['is_published'] ?? false)
                ? ($quiz->published_at ?? now())
                : null,
        ]);

        return redirect()->route('admin.quizzes.index');
    }

    public function destroy(Quiz $quiz)
    {
        $quiz->delete();

        return redirect()->route('admin.quizzes.index');
    }
}