<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Models\Course;
use App\Models\LearningContent;
use App\Models\LearningContentAttachment;
use App\Models\LearningContentBlock;

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
            'course_id' => null,
            'resource_type' => 'none',
            'resource_url' => null,
            'resource_path' => null,
            'blocks' => [],
            'created_at' => now()->toDateString(),
        ];
    }

    /**
     * Determine whether the current route is topic-specific.
     */
    private function isTopicRoute(Request $request): bool
    {
        return $request->routeIs('admin.learning-content.topic.*', 'student.learning-content.topic.*');
    }

    /**
     * Delete media files for a single topic.
     */
    private function deleteTopicAssets(LearningContent $topic): void
    {
        $topic->loadMissing(['attachments', 'blocks']);

        if ($topic->resource_path) {
            Storage::disk('public')->delete($topic->resource_path);
        }

        foreach ($topic->attachments as $attachment) {
            Storage::disk('public')->delete($attachment->file_path);
        }

        foreach ($topic->blocks as $block) {
            if ($block->file_path) {
                Storage::disk('public')->delete($block->file_path);
            }
        }
    }

    /**
     * Delete media files for a course and all linked topics.
     */
    private function deleteCourseAssets(Course $course): void
    {
        $course->loadMissing(['topics.attachments', 'topics.blocks']);

        foreach ($course->topics as $topic) {
            $this->deleteTopicAssets($topic);
        }
    }

    /**
     * Persist ordered topic blocks and handle file uploads/replacements.
     */
    private function syncTopicBlocks(Request $request, LearningContent $topic): void
    {
        $incomingBlocks = $request->input('blocks', []);
        $existingPaths = $topic->blocks()
            ->whereNotNull('file_path')
            ->pluck('file_path')
            ->all();

        $keptPaths = [];
        $normalizedBlocks = [];

        foreach ($incomingBlocks as $index => $blockData) {
            $type = $blockData['type'] ?? 'text';
            $sortOrder = (int) ($blockData['sort_order'] ?? ($index + 1) * 10);
            $payload = [
                'type' => $type,
                'title' => $blockData['title'] ?? null,
                'content' => null,
                'url' => null,
                'file_path' => null,
                'sort_order' => $sortOrder,
            ];

            if ($type === 'text') {
                $payload['content'] = $blockData['content'] ?? null;
            }

            if ($type === 'youtube') {
                $payload['url'] = $blockData['url'] ?? null;
            }

            if (in_array($type, ['pdf', 'image'], true)) {
                if ($request->hasFile("blocks.$index.file")) {
                    $payload['file_path'] = $request->file("blocks.$index.file")->store('learning-content/blocks', 'public');
                } else {
                    $payload['file_path'] = $blockData['existing_file_path'] ?? null;
                    if ($payload['file_path']) {
                        $keptPaths[] = $payload['file_path'];
                    }
                }

                if (!$payload['file_path']) {
                    continue;
                }
            }

            $normalizedBlocks[] = $payload;
        }

        $topic->blocks()->delete();

        foreach ($normalizedBlocks as $blockPayload) {
            $topic->blocks()->create($blockPayload);
        }

        $pathsToDelete = array_diff($existingPaths, $keptPaths);
        foreach ($pathsToDelete as $filePath) {
            Storage::disk('public')->delete($filePath);
        }
    }

    /**
     * Ensure a legacy courses row exists for a learning_contents course id.
     */
    private function ensureLegacyCourseMirror(LearningContent $course): void
    {
        DB::table('courses')->updateOrInsert(
            ['courseID' => $course->id],
            [
                'courseName' => $course->title,
                'description' => $course->description,
                'difficultyLevel' => $course->difficulty_level ?? 'Beginner',
                'isActive' => true,
                'created_at' => $course->created_at ?? now(),
                'updated_at' => now(),
            ]
        );
    }

    /**
     * Delete media files attached to a topic.
     */
    private function deleteTopicAssets(Topic $topic): void
    {
        $topic->loadMissing(['attachments', 'blocks']);

        foreach ($topic->attachments as $attachment) {
            Storage::disk('public')->delete($attachment->file_path);
        }

        foreach ($topic->blocks as $block) {
            if ($block->file_path) {
                Storage::disk('public')->delete($block->file_path);
            }
        }
    }

    /**
     * Delete media files for this content and all nested topic children.
     */
    private function deleteLearningContentAssets(LearningContent $learningContent): void
    {
        $learningContent->loadMissing(['attachments', 'blocks', 'children.attachments', 'children.blocks']);

        if ($learningContent->resource_path) {
            Storage::disk('public')->delete($learningContent->resource_path);
        }

        foreach ($learningContent->attachments as $attachment) {
            Storage::disk('public')->delete($attachment->file_path);
        }

        foreach ($learningContent->blocks as $block) {
            if ($block->file_path) {
                Storage::disk('public')->delete($block->file_path);
            }
        }

        foreach ($learningContent->children as $child) {
            $this->deleteLearningContentAssets($child);
        }
    }

    /**
     * Upload an inline image for the rich text editor.
     */
    public function uploadEditorImage(Request $request)
    {
        $validated = $request->validate([
            'image' => 'required|file|image|max:5120',
        ]);

        $path = $validated['image']->store('learning-content/editor-images', 'public');

        return response()->json([
            'url' => '/storage/'.$path,
            'path' => $path,
        ]);
    }

    /**
     * Display the learning content index.
     */
    public function index(Request $request)
    {
        if ($request->user()->role === 'administrator') {
            $contents = Course::withCount('topics')
                ->orderBy('courseName')
                ->get();
            return Inertia::render('Admin/LearningContent/index', [
                'layout' => $this->layoutForRole($request->user()->role),
                'contents' => $contents,
            ]);
        } elseif ($request->user()->role === 'student') {
            $contents = LearningContent::where('type', 'course')
                ->whereNull('parent_id')
                ->orderBy('title')
                ->get();

            return Inertia::render($request->user()->role === 'teacher' ? 'Teacher/Topics/index' : 'Student/LearningContent/index', [
                'layout' => $this->layoutForRole($request->user()->role),
                'contents' => $contents,
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
            $content = Course::withCount('topics')->findOrFail($id);
            $topics = $content->topics()->orderBy('title')->get();
            return Inertia::render('Admin/LearningContent/show', [
                'content' => $content,
                'topics' => $topics,
                'layout' => $this->layoutForRole($request->user()->role),
            ]);
        } elseif ($request->user()->role === 'student') {
            $content = LearningContent::findOrFail($id);
            $topics = $content->children()->orderBy('title')->get();

            return Inertia::render($request->user()->role === 'teacher' ? 'Teacher/Topics/content' : 'Student/LearningContent/content', [
                'course' => $content,
                'topics' => $topics,
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
            $topic = LearningContent::with([
                'attachments' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
                'blocks' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
                'course',
            ])->findOrFail($id);
            return Inertia::render('Admin/LearningContent/show', [
                'content' => $topic,
                'topics' => [],
                'layout' => $this->layoutForRole($request->user()->role),
            ]);
        } elseif ($request->user()->role === 'student' || $request->user()->role === 'teacher') {
            $topic = LearningContent::with([
                'attachments' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
                'blocks' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
                'course',
            ])->findOrFail($id);
            return Inertia::render($request->user()->role === 'teacher' ? 'Teacher/Topics/topic' : 'Student/LearningContent/topic', [
                'topic' => $topic,
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
        $courses = Course::withCount('topics')
            ->orderBy('courseName')
            ->get();

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
            'difficultyLevel' => 'required_if:type,course|nullable|in:Beginner,Intermediate,Advanced',
            'parent_id' => [
                'required_if:type,topic',
                'nullable',
                Rule::exists('courses', 'courseID'),
            ],
            'resource_type' => 'nullable|in:none,pdf,youtube',
            'resource_url' => 'nullable|url|required_if:resource_type,youtube',
            'resource_file' => 'nullable|file|mimetypes:application/pdf|max:10240|required_if:resource_type,pdf',
            'blocks' => 'nullable|array',
            'blocks.*.type' => 'required_with:blocks|in:text,youtube,pdf,image',
            'blocks.*.title' => 'nullable|string|max:255',
            'blocks.*.content' => 'nullable|string',
            'blocks.*.url' => 'nullable|url',
            'blocks.*.file' => 'nullable|file|mimetypes:application/pdf,image/jpeg,image/png,image/webp|max:10240',
            'blocks.*.existing_file_path' => 'nullable|string',
            'blocks.*.sort_order' => 'nullable|integer|min:0',
            'attachments' => 'nullable|array',
            'attachments.*.title' => 'nullable|string|max:255',
            'attachments.*.type' => 'required_with:attachments|in:pdf,image',
            'attachments.*.file' => 'required_with:attachments|file|mimetypes:application/pdf,image/jpeg,image/png,image/webp|max:10240',
            'attachments.*.sort_order' => 'nullable|integer|min:0',
        ]);

        if ($validated['type'] === 'course') {
            Course::query()->create([
                'courseName' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'content' => $validated['content'] ?? null,
                'difficultyLevel' => 'Beginner',
                'isActive' => true,
            ]);

            return redirect()->route('admin.learning-content.index');
        }

        $topic = LearningContent::query()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'content' => $validated['content'] ?? null,
            'course_id' => $validated['course_id'],
            'resource_type' => $validated['resource_type'] ?? 'none',
            'resource_url' => $validated['resource_type'] === 'youtube' ? ($validated['resource_url'] ?? null) : null,
            'resource_path' => null,
            'difficulty_level' => $validated['type'] === 'course' ? ($validated['difficultyLevel'] ?? 'Beginner') : null,
        ]);

        if ($payload['type'] === 'topic') {
            $payload['resource_type'] = $validated['resource_type'] ?? 'none';

        if ($validated['resource_type'] === 'pdf' && $request->hasFile('resource_file')) {
            $topic->update([
                'resource_path' => $request->file('resource_file')->store('learning-content/pdfs', 'public'),
            ]);
        }

        if ($topic) {
            if ($request->has('blocks')) {
                $this->syncTopicBlocks($request, $topic);
            }

            foreach ($request->input('attachments', []) as $index => $attachmentData) {
                if (!$request->hasFile("attachments.$index.file")) {
                    continue;
                }

                $storedPath = $request->file("attachments.$index.file")->store('learning-content/attachments', 'public');

                LearningContentAttachment::create([
                    'learning_content_id' => $topic->id,
                    'title' => $attachmentData['title'] ?? null,
                    'type' => $attachmentData['type'],
                    'file_path' => $storedPath,
                    'sort_order' => (int) ($attachmentData['sort_order'] ?? 0),
                ]);
            }
        }

        return redirect()->route('admin.learning-content.index');
    }
    }

    /**
     * Display the specified learning content.
     */
    public function show(Request $request, int $id)
    {
        if ($request->user()->role === 'administrator') {
            $learningContent = Course::withCount('topics')->find($id);
            $topics = $learningContent
                ? $learningContent->topics()->orderBy('title')->get()
                : [];

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
        $courses = Course::withCount('topics')->orderBy('courseName')->get();
        $learningContent = $this->isTopicRoute($request)
            ? LearningContent::with([
                'attachments' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
                'blocks' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
                'course',
            ])->findOrFail($id)
            : Course::findOrFail($id);

        return Inertia::render('Admin/LearningContent/edit', [
            'layout' => $this->layoutForRole($request->user()->role),
            'content' => $learningContent,
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
            'type' => [
                'required',
                Rule::in(['course', 'topic']),
            ],
            'course_id' => [
                'required_if:type,topic',
                'nullable',
                Rule::exists('courses', 'courseID'),
            ],
            'resource_type' => 'nullable|in:none,pdf,youtube',
            'resource_url' => 'nullable|url|required_if:resource_type,youtube',
            'resource_file' => 'nullable|file|mimetypes:application/pdf|max:10240|required_if:resource_type,pdf',
            'blocks' => 'nullable|array',
            'blocks.*.type' => 'required_with:blocks|in:text,youtube,pdf,image',
            'blocks.*.title' => 'nullable|string|max:255',
            'blocks.*.content' => 'nullable|string',
            'blocks.*.url' => 'nullable|url',
            'blocks.*.file' => 'nullable|file|mimetypes:application/pdf,image/jpeg,image/png,image/webp|max:10240',
            'blocks.*.existing_file_path' => 'nullable|string',
            'blocks.*.sort_order' => 'nullable|integer|min:0',
            'attachments' => 'nullable|array',
            'attachments.*.title' => 'nullable|string|max:255',
            'attachments.*.type' => 'required_with:attachments|in:pdf,image',
            'attachments.*.file' => 'required_with:attachments|file|mimetypes:application/pdf,image/jpeg,image/png,image/webp|max:10240',
            'attachments.*.sort_order' => 'nullable|integer|min:0',
        ], [
            'type.in' => 'Type cannot be changed after creation. Create a new course or topic instead.',
        ]);

        if ($validated['type'] === 'course') {
            $course = Course::findOrFail($id);
            $course->update([
                'courseName' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'content' => $validated['content'] ?? null,
            ]);

            return redirect()->route('admin.learning-content.index');
        }

        $topic = LearningContent::with(['attachments', 'blocks'])->findOrFail($id);

        $payload = [
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'content' => $validated['content'] ?? null,
            'course_id' => $validated['course_id'] ?? null,
            'resource_type' => $validated['resource_type'] ?? 'none',
            'resource_url' => null,
            'resource_path' => null,
        ];

        if ($payload['resource_type'] === 'youtube') {
            $payload['resource_url'] = $validated['resource_url'];
            if ($topic->resource_path) {
                Storage::disk('public')->delete($topic->resource_path);
            }
        }

        if ($payload['resource_type'] === 'pdf') {
            if ($request->hasFile('resource_file')) {
                if ($topic->resource_path) {
                    Storage::disk('public')->delete($topic->resource_path);
                }
                $payload['resource_path'] = $request->file('resource_file')->store('learning-content/pdfs', 'public');
            } else {
                $payload['resource_path'] = $topic->resource_path;
            }
        }

        if ($payload['resource_type'] === 'none') {
            if ($topic->resource_path) {
                Storage::disk('public')->delete($topic->resource_path);
            }
        }

        $topic->update($payload);

        if ($request->has('blocks')) {
            $this->syncTopicBlocks($request, $topic);
        }

        if ($request->has('attachments')) {
            foreach ($topic->attachments as $existingAttachment) {
                Storage::disk('public')->delete($existingAttachment->file_path);
                $existingAttachment->delete();
            }

            foreach ($request->input('attachments', []) as $index => $attachmentData) {
                if (!$request->hasFile("attachments.$index.file")) {
                    continue;
                }

                $storedPath = $request->file("attachments.$index.file")->store('learning-content/attachments', 'public');

                LearningContentAttachment::create([
                    'learning_content_id' => $topic->id,
                    'title' => $attachmentData['title'] ?? null,
                    'type' => $attachmentData['type'],
                    'file_path' => $storedPath,
                    'sort_order' => (int) ($attachmentData['sort_order'] ?? 0),
                ]);
            }
        }

        return redirect()->route('admin.learning-content.index');
    }

    /**
     * Remove the specified learning content.
     */
    public function destroy(Request $request, int $id)
    {
        if ($this->isTopicRoute($request)) {
            $topic = LearningContent::with(['attachments', 'blocks'])->findOrFail($id);
            $this->deleteTopicAssets($topic);
            $topic->delete();

            return redirect()->route('admin.learning-content.index');
        }

        $course = Course::with(['topics.attachments', 'topics.blocks'])->findOrFail($id);
        $this->deleteCourseAssets($course);

        foreach ($course->topics as $topic) {
            $topic->delete();
        }

        $course->delete();

        return redirect()->route('admin.learning-content.index');
    }
}
