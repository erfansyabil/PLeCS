<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
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
            $topics = $content->children()->orderBy('title')->get();
            return Inertia::render('Admin/LearningContent/show', [
                'content' => $content,
                'topics' => $topics,
                'layout' => $this->layoutForRole($request->user()->role),
            ]);
        } elseif ($request->user()->role === 'student') {
            $content = LearningContent::findOrFail($id);
            $topics = $content->children()->orderBy('title')->get();

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
    public function topic(Request $request, int $id)
    {
        if ($request->user()->role === 'administrator') {
            $topic = LearningContent::with([
                'attachments' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
                'blocks' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
            ])->findOrFail($id);
            return Inertia::render('Admin/LearningContent/topic', [
                'topic' => $topic,
                'layout' => $this->layoutForRole($request->user()->role),
            ]);
        } elseif ($request->user()->role === 'student') {
            $topic = LearningContent::with([
                'attachments' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
                'blocks' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
            ])->findOrFail($id);
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
            ->withCount('children')
            ->orderBy('title')
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

        $topic = LearningContent::create($payload);
        if ($payload['type'] === 'topic' && $topic) {
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
        $learningContent = LearningContent::with([
            'attachments' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
            'blocks' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
        ])->find($id);

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
        $learningContent = LearningContent::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content' => 'nullable|string',
            'type' => [
                'required',
                Rule::in([$learningContent->type]),
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
            $this->deleteLearningContentAssets($learningContent);

            $learningContent->delete();
        }

        return redirect()->route('admin.learning-content.index');
    }
}
