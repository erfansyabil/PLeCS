<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\LearningContent;

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
     * Provide placeholder content when no record exists yet.
     */
    private function placeholderContent(int $id): array
    {
        return [
            'id' => $id,
            'title' => 'Sample Learning Content',
            'description' => 'This is placeholder learning content while persistence is being implemented.',
            'content' => 'No content has been saved for this item yet.',
            'type' => 'course',
            'parent_id' => null,
            'created_at' => now()->toDateString(),
        ];
    }

    /**
     * Display the learning content index.
     */
    public function index(Request $request)
    {
        if ($request->user()->role === 'administrator') {
            $contents = LearningContent::whereNull('parent_id')->get(); // courses
            return Inertia::render('Admin/LearningContent/index', [
                'layout' => $this->layoutForRole($request->user()->role),
                'contents' => $contents,
            ]);
        } elseif ($request->user()->role === 'student') {
            return Inertia::render('Student/LearningContent/index', [
                'layout' => $this->layoutForRole($request->user()->role),
            ]);
        } else {
            abort(403, 'Access denied');
        }
    }

    /**
     * Display a specific course page.
     */
    public function content(Request $request, int $id)
    {
        if ($request->user()->role === 'administrator') {
            $content = LearningContent::findOrFail($id);
            $topics = $content->children;
            return Inertia::render('Admin/LearningContent/show', [
                'content' => $content,
                'topics' => $topics,
                'layout' => $this->layoutForRole($request->user()->role),
            ]);
        } elseif ($request->user()->role === 'student') {
            return Inertia::render('Student/LearningContent/content', [
                'courseId' => $id,
                'layout' => $this->layoutForRole($request->user()->role),
            ]);
        } else {
            abort(403, 'Access denied');
        }
    }

    /**
     * Display a learning content topic page.
     */
    public function topic(Request $request, int $id)
    {
        if ($request->user()->role === 'administrator') {
            $topic = LearningContent::findOrFail($id);
            return Inertia::render('Admin/LearningContent/topic', [
                'topic' => $topic,
                'layout' => $this->layoutForRole($request->user()->role),
            ]);
        } elseif ($request->user()->role === 'student') {
            return Inertia::render('Student/LearningContent/topic', [
                'topicId' => $id,
                'layout' => $this->layoutForRole($request->user()->role),
            ]);
        } else {
            abort(403, 'Access denied');
        }
    }

    /**
     * Show the form for creating a new learning content.
     */
    public function create(Request $request)
    {
        $courses = LearningContent::where('type', 'course')->get();
        return Inertia::render('Admin/LearningContent/create', [
            'layout' => $this->layoutForRole($request->user()->role),
            'courses' => $courses,
        ]);
    }

    /**
     * Store a newly created learning content.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content' => 'nullable|string',
            'type' => 'required|in:course,topic',
            'parent_id' => 'nullable|exists:learning_contents,id',
        ]);

        LearningContent::create($validated);

        return redirect()->route('admin.learning-content.index');
    }

    /**
     * Display the specified learning content.
     */
    public function show(Request $request, int $id)
    {
        if ($request->user()->role === 'administrator') {
            $learningContent = LearningContent::find($id);
            $topics = $learningContent?->children ?? [];

            return Inertia::render('Admin/LearningContent/show', [
                'content' => $learningContent ?? $this->placeholderContent($id),
                'topics' => $topics,
                'layout' => $this->layoutForRole($request->user()->role),
            ]);
        }

        abort(403, 'Access denied');
    }

    /**
     * Show the form for editing the specified learning content.
     */
    public function edit(Request $request, int $id)
    {
        $courses = LearningContent::where('type', 'course')->get();
        $learningContent = LearningContent::find($id);

        return Inertia::render('Admin/LearningContent/edit', [
            'layout' => $this->layoutForRole($request->user()->role),
            'content' => $learningContent ?? $this->placeholderContent($id),
            'courses' => $courses,
        ]);
    }

    /**
     * Update the specified learning content.
     */
    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content' => 'nullable|string',
            'type' => 'required|in:course,topic',
            'parent_id' => 'nullable|exists:learning_contents,id',
        ]);

        $learningContent = LearningContent::find($id);
        if ($learningContent) {
            $learningContent->update($validated);
        }

        return redirect()->route('admin.learning-content.index');
    }

    /**
     * Remove the specified learning content.
     */
    public function destroy(Request $request, int $id)
    {
        $learningContent = LearningContent::find($id);
        if ($learningContent) {
            $learningContent->delete();
        }

        return redirect()->route('admin.learning-content.index');
    }
}
