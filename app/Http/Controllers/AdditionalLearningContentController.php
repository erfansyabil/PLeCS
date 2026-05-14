<?php

namespace App\Http\Controllers;

use App\Models\LearningContentAttachment;
use App\Models\Topic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AdditionalLearningContentController extends Controller
{
    /**
     * Determine which layout should be used for the current user.
     */
    private function layoutForRole(string $role): string
    {
        return match ($role) {
            'teacher' => 'TeacherLayout',
            'administrator' => 'AdministratorLayout',
            'student' => 'StudentLayout',
            default => 'AuthenticatedLayout',
        };
    }

    /**
     * Build the topic options used by create/edit forms.
     */
    private function topicOptions()
    {
        return Topic::query()
            ->join('learning_contents as courses', 'courses.id', '=', 'topics.courseID')
            ->select([
                'topics.topicID as id',
                'topics.name as title',
                'topics.courseID as course_id',
                'courses.title as course_title',
            ])
            ->where('topics.isActive', true)
            ->orderBy('courses.title')
            ->orderBy('topics.orderIndex')
            ->orderBy('topics.name')
            ->get();
    }

    /**
     * Normalize attachment rows for the teacher UI.
     */
    private function transformAttachment(LearningContentAttachment $attachment): array
    {
        return [
            'id' => $attachment->id,
            'title' => $attachment->title,
            'type' => $attachment->type,
            'sort_order' => $attachment->sort_order,
            'topic_id' => $attachment->topic_id,
            'topic_title' => $attachment->topic?->name,
            'course_title' => $attachment->topic?->course?->title,
            'file_path' => $attachment->file_path,
            'file_url' => $attachment->file_path ? Storage::url($attachment->file_path) : null,
            'created_at' => optional($attachment->created_at)->toDateString(),
        ];
    }

    /**
     * Display a listing of additional content materials.
     */
    public function index(Request $request)
    {
        $materials = LearningContentAttachment::query()
            ->with([
                'topic' => fn ($query) => $query->select('topicID', 'name', 'courseID'),
                'topic.course' => fn ($query) => $query->select('id', 'title'),
            ])
            ->whereNotNull('topic_id')
            ->orderByDesc('created_at')
            ->orderBy('sort_order')
            ->get()
            ->map(fn (LearningContentAttachment $attachment) => $this->transformAttachment($attachment));

        return Inertia::render('Teacher/AdditionalContent/index', [
            'layout' => $this->layoutForRole($request->user()->role),
            'materials' => $materials,
        ]);
    }

    /**
     * Show the form for creating a new additional content material.
     */
    public function create(Request $request)
    {
        return Inertia::render('Teacher/AdditionalContent/create', [
            'layout' => $this->layoutForRole($request->user()->role),
            'topics' => $this->topicOptions(),
        ]);
    }

    /**
     * Store a newly created additional content material.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'topic_id' => 'required|exists:topics,topicID',
            'attachments' => 'required|array|min:1',
            'attachments.*.title' => 'nullable|string|max:255',
            'attachments.*.type' => 'required|in:pdf,image',
            'attachments.*.file' => 'required|file|mimetypes:application/pdf,image/jpeg,image/png,image/webp|max:10240',
            'attachments.*.sort_order' => 'nullable|integer|min:0',
        ]);

        foreach ($request->input('attachments', []) as $index => $attachmentData) {
            if (!$request->hasFile("attachments.$index.file")) {
                continue;
            }

            $storedPath = $request->file("attachments.$index.file")->store('learning-content/attachments', 'public');

            LearningContentAttachment::create([
                'learning_content_id' => null,
                'topic_id' => (int) $validated['topic_id'],
                'title' => $attachmentData['title'] ?? null,
                'type' => $attachmentData['type'],
                'file_path' => $storedPath,
                'sort_order' => (int) ($attachmentData['sort_order'] ?? 0),
            ]);
        }

        return redirect()->route('teacher.additional-content.index');
    }

    /**
     * Display the specified additional content material.
     */
    public function show(Request $request, $id)
    {
        $material = LearningContentAttachment::query()
            ->with([
                'topic' => fn ($query) => $query->select('topicID', 'name', 'courseID'),
                'topic.course' => fn ($query) => $query->select('id', 'title'),
            ])
            ->findOrFail($id);

        return Inertia::render('Teacher/AdditionalContent/show', [
            'layout' => $this->layoutForRole($request->user()->role),
            'material' => $this->transformAttachment($material),
        ]);
    }

    /**
     * Show the form for editing the specified additional content material.
     */
    public function edit(Request $request, $id)
    {
        $material = LearningContentAttachment::query()
            ->with([
                'topic' => fn ($query) => $query->select('topicID', 'name', 'courseID'),
                'topic.course' => fn ($query) => $query->select('id', 'title'),
            ])
            ->findOrFail($id);

        return Inertia::render('Teacher/AdditionalContent/edit', [
            'layout' => $this->layoutForRole($request->user()->role),
            'material' => $this->transformAttachment($material),
            'topics' => $this->topicOptions(),
        ]);
    }

    /**
     * Update the specified additional content material.
     */
    public function update(Request $request, $id)
    {
        $material = LearningContentAttachment::findOrFail($id);

        $validated = $request->validate([
            'topic_id' => 'required|exists:topics,topicID',
            'title' => 'nullable|string|max:255',
            'type' => 'required|in:pdf,image',
            'sort_order' => 'nullable|integer|min:0',
            'file' => 'nullable|file|mimetypes:application/pdf,image/jpeg,image/png,image/webp|max:10240',
        ]);

        if ($request->hasFile('file')) {
            if ($material->file_path) {
                Storage::disk('public')->delete($material->file_path);
            }

            $material->file_path = $request->file('file')->store('learning-content/attachments', 'public');
        }

        $material->topic_id = (int) $validated['topic_id'];
        $material->learning_content_id = null;
        $material->title = $validated['title'] ?? null;
        $material->type = $validated['type'];
        $material->sort_order = (int) ($validated['sort_order'] ?? 0);
        $material->save();

        return redirect()->route('teacher.additional-content.index');
    }

    /**
     * Remove the specified additional content material.
     */
    public function destroy(Request $request, $id)
    {
        $material = LearningContentAttachment::findOrFail($id);

        if ($material->file_path) {
            Storage::disk('public')->delete($material->file_path);
        }

        $material->delete();

        return redirect()->route('teacher.additional-content.index');
    }
}