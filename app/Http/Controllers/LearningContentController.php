<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Models\LearningContent;
use App\Models\LearningContentAttachment;
use App\Models\LearningContentBlock;
use App\Models\Topic;

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
            'resource_type' => 'none',
            'resource_url' => null,
            'resource_path' => null,
            'blocks' => [],
            'created_at' => now()->toDateString(),
        ];
    }

    /**
     * Persist ordered topic blocks and handle file uploads/replacements.
     */
    private function syncTopicBlocks(Request $request, LearningContent|Topic $topic): void
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

    // Legacy course mirror removed: `courses` table is no longer maintained here.

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
            $contents = LearningContent::where('type', 'course')
                ->whereNull('parent_id')
                ->orderBy('title')
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

            return Inertia::render('Student/LearningContent/index', [
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
            $content = LearningContent::findOrFail($id);
            $topics = Topic::where('courseID', $content->id)->orderBy('name')->get();
            return Inertia::render('Admin/LearningContent/show', [
                'content' => $content,
                'topics' => $topics,
                'layout' => $this->layoutForRole($request->user()->role),
            ]);
        } elseif ($request->user()->role === 'student') {
            $content = LearningContent::findOrFail($id);
            $topics = Topic::where('courseID', $content->id)->orderBy('name')->get();

            return Inertia::render('Student/LearningContent/content', [
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
    public function topic(Request $request, \App\Models\LearningContent $course, \App\Models\Topic $topic)
    {
        if ($request->user()->role === 'administrator') {
            // Enforce that the topic belongs to the requested course
            if ($topic->courseID !== $course->id) {
                abort(404);
            }

            $topic = Topic::with([
                'attachments' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
                'blocks' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
            ])->findOrFail($topic->topicID);

            return Inertia::render('Admin/LearningContent/topic', [
                'topic' => $topic,
                'layout' => $this->layoutForRole($request->user()->role),
            ]);
        } elseif ($request->user()->role === 'student') {
            // Enforce that the topic belongs to the requested course
            if ($topic->courseID !== $course->id) {
                abort(404);
            }

            $topic = Topic::with([
                'attachments' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
                'blocks' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
            ])->findOrFail($topic->topicID);

            return Inertia::render('Student/LearningContent/topic', [
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
        $courses = LearningContent::where('type', 'course')
            ->orderBy('title')
            ->get();

        $topicCounts = Topic::query()
            ->selectRaw('courseID, COUNT(*) as aggregate')
            ->groupBy('courseID')
            ->pluck('aggregate', 'courseID');

        $courses->each(function ($course) use ($topicCounts): void {
            $course->children_count = (int) ($topicCounts[$course->id] ?? 0);
        });

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
                Rule::exists('learning_contents', 'id')->where(fn ($query) => $query
                    ->where('type', 'course')
                    ->whereNull('parent_id')),
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

        $payload = [
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'content' => $validated['content'] ?? null,
            'type' => $validated['type'],
            'parent_id' => $validated['type'] === 'topic' ? ($validated['parent_id'] ?? null) : null,
            'resource_type' => 'none',
            'resource_url' => null,
            'resource_path' => null,
            'difficulty_level' => $validated['type'] === 'course' ? ($validated['difficultyLevel'] ?? 'Beginner') : null,
        ];

        if ($payload['type'] === 'topic') {
            $payload['resource_type'] = $validated['resource_type'] ?? 'none';

            if ($payload['resource_type'] === 'youtube') {
                $payload['resource_url'] = $validated['resource_url'];
            }

            if ($payload['resource_type'] === 'pdf' && $request->hasFile('resource_file')) {
                $payload['resource_path'] = $request->file('resource_file')->store('learning-content/pdfs', 'public');
            }
        }

        if ($payload['type'] === 'course') {
            $course = LearningContent::create($payload);
            return redirect()->route('admin.learning-content.index');
        }

        $course = LearningContent::where('type', 'course')->findOrFail((int) $validated['parent_id']);

        $topic = Topic::create([
            'courseID' => $course->id,
            'name' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'prerequisites' => null,
            'difficultyLevel' => 'Beginner',
            'orderIndex' => (int) Topic::where('courseID', $course->id)->max('orderIndex') + 1,
            'isActive' => true,
        ]);

        if ($request->has('blocks')) {
            $this->syncTopicBlocks($request, $topic);
        }

        foreach ($request->input('attachments', []) as $index => $attachmentData) {
            if (!$request->hasFile("attachments.$index.file")) {
                continue;
            }

            $storedPath = $request->file("attachments.$index.file")->store('learning-content/attachments', 'public');

            LearningContentAttachment::create([
                'learning_content_id' => null,
                'topic_id' => $topic->topicID,
                'title' => $attachmentData['title'] ?? null,
                'type' => $attachmentData['type'],
                'file_path' => $storedPath,
                'sort_order' => (int) ($attachmentData['sort_order'] ?? 0),
            ]);
        }

        return redirect()->route('admin.learning-content.index');
    }

    /**
     * Display the specified learning content.
     */
    public function show(Request $request, int $id)
    {
        if ($request->user()->role === 'administrator') {
            $learningContent = LearningContent::with([
                'attachments' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
                'blocks' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
            ])->find($id);

            if ($learningContent) {
                $topics = Topic::where('courseID', $learningContent->id)->orderBy('name')->get();

                return Inertia::render('Admin/LearningContent/show', [
                    'content' => $learningContent,
                    'topics' => $topics,
                    'layout' => $this->layoutForRole($request->user()->role),
                ]);
            }

            $topic = Topic::with([
                'attachments' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
                'blocks' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
            ])->find($id);

            if ($topic) {
                return Inertia::render('Admin/LearningContent/show', [
                    'content' => $topic,
                    'topics' => [],
                    'layout' => $this->layoutForRole($request->user()->role),
                ]);
            }

            return Inertia::render('Admin/LearningContent/show', [
                'content' => $this->placeholderContent($id),
                'topics' => [],
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
        $learningContent = LearningContent::with([
            'attachments' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
            'blocks' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
        ])->find($id);

        if (!$learningContent) {
            $topic = Topic::with([
                'attachments' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
                'blocks' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
            ])->find($id);

            return Inertia::render('Admin/LearningContent/edit', [
                'layout' => $this->layoutForRole($request->user()->role),
                'content' => $topic ?? $this->placeholderContent($id),
                'courses' => $courses,
            ]);
        }

        return Inertia::render('Admin/LearningContent/edit', [
            'layout' => $this->layoutForRole($request->user()->role),
            'content' => $learningContent ?? $this->placeholderContent($id),
            'courses' => $courses,
        ]);
    }

    /**
     * Explicit editor for Topic records to avoid collisions with LearningContent IDs.
     */
    // (duplicate implementation removed — using the topic loader below)

    /**
     * Show the form for editing a topic by topicID.
     */
    public function editTopic(Request $request, \App\Models\Topic $topic)
    {
        $courses = LearningContent::where('type', 'course')->get();

        $topic->load([
            'attachments' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
            'blocks' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
        ]);

        return Inertia::render('Admin/LearningContent/edit', [
            'layout' => $this->layoutForRole($request->user()->role),
            'content' => $topic,
            'courses' => $courses,
        ]);
    }

    /**
     * Delete a Topic record and its media assets.
     */
    public function destroyTopic(Request $request, \App\Models\Topic $topic)
    {
        $this->deleteTopicAssets($topic);

        $topic->attachments()->delete();
        $topic->blocks()->delete();
        $topic->delete();

        return redirect()->route('admin.learning-content.index');
    }

    /**
     * Update the specified learning content.
     */
    public function update(Request $request, int $id)
    {
        $learningContent = LearningContent::find($id);
        $topic = $learningContent ? null : Topic::with(['attachments', 'blocks'])->findOrFail($id);
        $currentType = $learningContent?->type ?? 'topic';

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content' => 'nullable|string',
            'type' => [
                'required',
                Rule::in([$currentType]),
            ],
            'parent_id' => [
                'required_if:type,topic',
                'nullable',
                Rule::exists('learning_contents', 'id')->where(fn ($query) => $query
                    ->where('type', 'course')
                    ->whereNull('parent_id')
                    ->where('id', '!=', $id)),
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

        if ($learningContent) {
            $payload = [
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'content' => $validated['content'] ?? null,
                'type' => $validated['type'],
                'parent_id' => $validated['type'] === 'topic' ? ($validated['parent_id'] ?? null) : null,
                'resource_type' => 'none',
                'resource_url' => null,
            ];

            if ($payload['type'] === 'topic') {
                $payload['resource_type'] = $validated['resource_type'] ?? 'none';

                if ($payload['resource_type'] === 'youtube') {
                    $payload['resource_url'] = $validated['resource_url'];
                    if ($learningContent->resource_path) {
                        Storage::disk('public')->delete($learningContent->resource_path);
                        $payload['resource_path'] = null;
                    }
                }

                if ($payload['resource_type'] === 'pdf') {
                    if ($request->hasFile('resource_file')) {
                        if ($learningContent->resource_path) {
                            Storage::disk('public')->delete($learningContent->resource_path);
                        }
                        $payload['resource_path'] = $request->file('resource_file')->store('learning-content/pdfs', 'public');
                    } else {
                        $payload['resource_path'] = $learningContent->resource_path;
                    }
                }

                if ($payload['resource_type'] === 'none') {
                    if ($learningContent->resource_path) {
                        Storage::disk('public')->delete($learningContent->resource_path);
                    }
                    $payload['resource_path'] = null;
                    $payload['resource_url'] = null;
                }
            } else {
                if ($learningContent->resource_path) {
                    Storage::disk('public')->delete($learningContent->resource_path);
                }
                $payload['resource_path'] = null;
            }

            $learningContent->update($payload);

            if ($payload['type'] === 'topic' && $request->has('blocks')) {
                $this->syncTopicBlocks($request, $learningContent);
            } elseif ($payload['type'] !== 'topic') {
                $existingBlockPaths = $learningContent->blocks()->whereNotNull('file_path')->pluck('file_path')->all();
                $learningContent->blocks()->delete();
                foreach ($existingBlockPaths as $filePath) {
                    Storage::disk('public')->delete($filePath);
                }
            }

            if ($request->has('attachments')) {
                foreach ($learningContent->attachments as $existingAttachment) {
                    Storage::disk('public')->delete($existingAttachment->file_path);
                    $existingAttachment->delete();
                }

                foreach ($request->input('attachments', []) as $index => $attachmentData) {
                    if (!$request->hasFile("attachments.$index.file")) {
                        continue;
                    }

                    $storedPath = $request->file("attachments.$index.file")->store('learning-content/attachments', 'public');

                    LearningContentAttachment::create([
                        'learning_content_id' => $learningContent->id,
                        'title' => $attachmentData['title'] ?? null,
                        'type' => $attachmentData['type'],
                        'file_path' => $storedPath,
                        'sort_order' => (int) ($attachmentData['sort_order'] ?? 0),
                    ]);
                }
            }

            if ($payload['type'] === 'course') {
                // No-op: legacy `courses` mirror removed.
            }
        } else {
            $course = LearningContent::where('type', 'course')->findOrFail((int) $validated['parent_id']);
            // No-op: legacy `courses` mirror removed.

            $topic->update([
                'courseID' => $course->id,
                'name' => $validated['title'],
                'description' => $validated['description'] ?? null,
            ]);

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
                        'learning_content_id' => null,
                        'topic_id' => $topic->topicID,
                        'title' => $attachmentData['title'] ?? null,
                        'type' => $attachmentData['type'],
                        'file_path' => $storedPath,
                        'sort_order' => (int) ($attachmentData['sort_order'] ?? 0),
                    ]);
                }
            }
        }

        return redirect()->route('admin.learning-content.index');
    }

    /**
     * Remove the specified learning content.
     */
    public function destroy(Request $request, int $id)
    {
        $learningContent = LearningContent::with(['attachments', 'blocks'])->find($id);
        if ($learningContent) {
            if ($learningContent->type === 'course') {
                $topics = Topic::with(['attachments', 'blocks'])->where('courseID', $learningContent->id)->get();
                foreach ($topics as $topic) {
                    $this->deleteTopicAssets($topic);
                    $topic->attachments()->delete();
                    $topic->blocks()->delete();
                    $topic->delete();
                }
            }

            $this->deleteLearningContentAssets($learningContent);

            $learningContent->delete();

            return redirect()->route('admin.learning-content.index');
        }

        $topic = Topic::with(['attachments', 'blocks'])->find($id);
        if ($topic) {
            $this->deleteTopicAssets($topic);
            $topic->attachments()->delete();
            $topic->blocks()->delete();
            $topic->delete();
        }

        return redirect()->route('admin.learning-content.index');
    }
}
