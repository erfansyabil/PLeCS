<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Models\AdditionalLearningResource;
use App\Models\Topic;
use App\Models\LearningContent;

class AdditionalLearningContentController extends Controller
{
    /**
     * Get topics for a specific course (API endpoint)
     */
    public function getTopicsForCourse($courseId)
    {
        $topics = Topic::where('courseID', $courseId)
            ->where('isActive', true)
            ->orderBy('orderIndex')
            ->get(['topicID', 'name', 'courseID']);

        return response()->json($topics);
    }

    /**
     * Display a listing of additional content materials.
     */
    public function index(Request $request)
    {
        $topicId = $request->query('topic_id');

        $query = AdditionalLearningResource::where('is_active', true);

        if ($topicId) {
            $query->where('topic_id', $topicId);
        }

        $materials = $query->with(['topic', 'course', 'creator'])
            ->orderBy('order_index')
            ->orderByDesc('created_at')
            ->paginate(15);

        return Inertia::render('Teacher/AdditionalContent/index', [
            'layout' => 'TeacherLayout',
            'materials' => $materials,
            'topicId' => $topicId,
        ]);
    }

    /**
     * Show the form for creating a new additional content material.
     */
    public function create(Request $request)
    {
        $topicId = $request->query('topic_id');

        $topic = null;
        $course = null;

        if ($topicId) {
            $topic = Topic::findOrFail($topicId);
            $course = LearningContent::findOrFail($topic->courseID);
        }

        $courses = LearningContent::where('type', 'course')
            ->whereNull('parent_id')
            ->get(['id', 'title']);

        return Inertia::render('Teacher/AdditionalContent/create', [
            'layout' => 'TeacherLayout',
            'topic' => $topic,
            'course' => $course,
            'courses' => $courses,
        ]);
    }

    /**
     * Store a newly created additional content material.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'topic_id' => 'required|integer|exists:topics,topicID',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:Document,Video,Link,Presentation,Other',
            'url' => 'nullable|url',
            'file' => 'nullable|file|max:10240|mimetypes:application/pdf,image/jpeg,image/png,image/webp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ]);

        $topic = Topic::findOrFail($validated['topic_id']);
        $courseId = $topic->courseID;

        $filePath = null;
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('learning-resources', $filename, 'public');
        }

        $resource = AdditionalLearningResource::create([
            'topic_id' => $validated['topic_id'],
            'course_id' => $courseId,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'url' => $validated['url'] ?? null,
            'file_path' => $filePath,
            'order_index' => 0,
            'is_active' => true,
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('teacher.additional-content.show', $resource->id)
            ->with('success', 'Learning resource created successfully.');
    }

    /**
     * Display the specified additional content material.
     */
    public function show(Request $request, $id)
    {
        $material = AdditionalLearningResource::with(['topic', 'course', 'creator'])->findOrFail($id);

        return Inertia::render('Teacher/AdditionalContent/show', [
            'layout' => 'TeacherLayout',
            'material' => $material,
        ]);
    }

    /**
     * Show the form for editing the specified additional content material.
     */
    public function edit(Request $request, $id)
    {
        $material = AdditionalLearningResource::with(['topic', 'course'])->findOrFail($id);

        $this->authorize('update', $material);

        $courses = LearningContent::where('type', 'course')
            ->whereNull('parent_id')
            ->get(['id', 'title']);

        return Inertia::render('Teacher/AdditionalContent/edit', [
            'layout' => 'TeacherLayout',
            'material' => $material,
            'courses' => $courses,
        ]);
    }

    /**
     * Update the specified additional content material.
     */
    public function update(Request $request, $id)
    {
        $material = AdditionalLearningResource::findOrFail($id);

        $this->authorize('update', $material);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:Document,Video,Link,Presentation,Other',
            'url' => 'nullable|url',
            'file' => 'nullable|file|max:10240|mimetypes:application/pdf,image/jpeg,image/png,image/webp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ]);

        $updateData = [
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'url' => $validated['url'] ?? null,
        ];

        if ($request->hasFile('file')) {
            if ($material->file_path && Storage::disk('public')->exists($material->file_path)) {
                Storage::disk('public')->delete($material->file_path);
            }

            $file = $request->file('file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $updateData['file_path'] = $file->storeAs('learning-resources', $filename, 'public');
        }

        $material->update($updateData);

        return redirect()->route('teacher.additional-content.show', $material->id)
            ->with('success', 'Learning resource updated successfully.');
    }

    /**
     * Remove the specified additional content material.
     */
    public function destroy(Request $request, $id)
    {
        $material = AdditionalLearningResource::findOrFail($id);

        $this->authorize('delete', $material);

        if ($material->file_path && Storage::disk('public')->exists($material->file_path)) {
            Storage::disk('public')->delete($material->file_path);
        }

        $material->delete();

        return redirect()->route('teacher.additional-content.index')
            ->with('success', 'Learning resource deleted successfully.');
    }
}