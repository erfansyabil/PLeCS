import AdministratorLayout from '@/Layouts/AdministratorLayout';
import RichTextEditor from '@/Components/RichTextEditor';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ content, courses = [] }) {
    const materialData = content;

    const mapBlocksFromContent = () => {
        const existingBlocks = Array.isArray(materialData.blocks) ? materialData.blocks : [];
        if (existingBlocks.length > 0) {
            return existingBlocks.map((block, index) => ({
                type: block.type,
                title: block.title || '',
                content: block.content || '',
                url: block.url || '',
                file: null,
                existing_file_path: block.file_path || '',
                sort_order: block.sort_order ?? (index + 1) * 1,
            }));
        }

        const legacyBlocks = [];

        if (materialData.content) {
            legacyBlocks.push({
                type: 'text',
                title: '',
                content: materialData.content,
                url: '',
                file: null,
                existing_file_path: '',
                sort_order: 10,
            });
        }

        if (materialData.resource_type === 'youtube' && materialData.resource_url) {
            legacyBlocks.push({
                type: 'youtube',
                title: 'Video Resource',
                content: '',
                url: materialData.resource_url,
                file: null,
                existing_file_path: '',
                sort_order: 20,
            });
        }

        if (materialData.resource_type === 'pdf' && materialData.resource_path) {
            legacyBlocks.push({
                type: 'pdf',
                title: 'PDF Resource',
                content: '',
                url: '',
                file: null,
                existing_file_path: materialData.resource_path,
                sort_order: 20,
            });
        }

        if (legacyBlocks.length > 0) {
            return legacyBlocks;
        }

        return [{
            type: 'text',
            title: '',
            content: '',
            url: '',
            file: null,
            existing_file_path: '',
            sort_order: 10,
        }];
    };

    const initialPrerequisites = Array.isArray(materialData.prerequisites) ? materialData.prerequisites.map((p) => p.id) : [];

    const { data, setData, post, processing, errors } = useForm({
        title: materialData.title,
        description: materialData.description,
        content: materialData.content || '',
        type: materialData.type,
        difficultyLevel: materialData.difficulty_level || 'Beginner',
        estimated_hours: materialData.estimated_hours || '',
        keywords: materialData.keywords || '',
        parent_id: materialData.parent_id || '',
        resource_type: materialData.resource_type || 'none',
        resource_url: materialData.resource_url || '',
        resource_file: null,
        blocks: materialData.type === 'topic' ? mapBlocksFromContent() : [],
        prerequisites: initialPrerequisites,
        _method: 'put',
    });

    const updateBlock = (index, field, value) => {
        const nextBlocks = [...data.blocks];
        nextBlocks[index] = {
            ...nextBlocks[index],
            [field]: value,
        };
        setData('blocks', nextBlocks);
    };

    const updateBlockType = (index, type) => {
        const nextBlocks = [...data.blocks];
        nextBlocks[index] = {
            type,
            title: nextBlocks[index]?.title ?? '',
            content: '',
            url: '',
            file: null,
            existing_file_path: '',
            sort_order: nextBlocks[index]?.sort_order ?? (index + 1) * 1,
        };
        setData('blocks', nextBlocks);
    };

    const addBlock = () => {
        setData('blocks', [
            ...data.blocks,
            {
                type: 'text',
                title: '',
                content: '',
                url: '',
                file: null,
                existing_file_path: '',
                sort_order: (data.blocks.length + 1) * 1,
            },
        ]);
    };

    const removeBlock = (index) => {
        setData('blocks', data.blocks.filter((_, currentIndex) => currentIndex !== index));
    };

    const submit = (e) => {
        e.preventDefault();
        const submitRoute = materialData.type === 'topic'
            ? route('admin.learning-content.topic.update', materialData.id)
            : route('admin.learning-content.update', materialData.id);

        post(submitRoute, {
            forceFormData: true,
        });
    };

    return (
        <AdministratorLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">Edit Learning Content</h2>
                        <p className="mt-0.5 text-sm text-slate-400">Update course or topic details</p>
                    </div>
                    <Link
                        href={route('admin.learning-content.index')}
                        className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                    >
                        Back
                    </Link>
                </div>
            }
        >
            <Head title="Edit Learning Content" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-sm">
                        <form onSubmit={submit} className="p-6 text-slate-100">
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-sm font-medium mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                                {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="description" className="block text-sm font-medium mb-2">
                                    Description
                                </label>
                                <RichTextEditor
                                    value={data.description}
                                    onChange={(value) => setData('description', value)}
                                    placeholder="Write a brief description..."
                                />
                                {/* <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows="4"
                                    className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                /> */}
                                {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="type" className="block text-sm font-medium mb-2">
                                    Type
                                </label>
                                <select
                                    id="type"
                                    value={data.type}
                                    disabled
                                    className="w-full px-3 py-2 border border-slate-700 rounded-md shadow-sm bg-slate-800/60 text-slate-400"
                                >
                                    <option value="course">Course</option>
                                    <option value="topic">Topic</option>
                                </select>
                                <p className="text-xs text-slate-400 mt-1">
                                    Type is fixed after creation. Create a new item to add a course or topic.
                                </p>
                                {errors.type && <div className="text-red-500 text-sm mt-1">{errors.type}</div>}
                            </div>

                            {(data.type === 'course' || data.type === 'topic') && (
                                <div className="mb-4">
                                    <label htmlFor="difficultyLevel" className="block text-sm font-medium mb-2">
                                        Difficulty Level
                                    </label>
                                    <select
                                        id="difficultyLevel"
                                        value={data.difficultyLevel}
                                        onChange={(e) => setData('difficultyLevel', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                    {errors.difficultyLevel && <div className="text-red-500 text-sm mt-1">{errors.difficultyLevel}</div>}
                                </div>
                            )}

                            {data.type === 'course' && (
                                <div className="mb-4">
                                    <label htmlFor="estimated_hours" className="block text-sm font-medium mb-2">
                                        Estimated Completion Hours
                                    </label>
                                    <input
                                        type="number"
                                        id="estimated_hours"
                                        min="1"
                                        max="2000"
                                        value={data.estimated_hours}
                                        onChange={(e) => setData('estimated_hours', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    {errors.estimated_hours && <div className="text-red-500 text-sm mt-1">{errors.estimated_hours}</div>}
                                </div>
                            )}

                            {data.type === 'course' && (
                                <div className="mb-4">
                                    <label htmlFor="keywords" className="block text-sm font-medium mb-2">
                                        Keywords (comma separated)
                                    </label>
                                    <input
                                        type="text"
                                        id="keywords"
                                        value={data.keywords}
                                        onChange={(e) => setData('keywords', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="python, loops, fundamentals"
                                    />
                                    {errors.keywords && <div className="text-red-500 text-sm mt-1">{errors.keywords}</div>}
                                </div>
                            )}

                            {data.type === 'course' && (
                                <div className="mb-4">
                                    <label htmlFor="prerequisites" className="block text-sm font-medium mb-2">
                                        Prerequisite Courses
                                    </label>
                                    <select
                                        id="prerequisites"
                                        multiple
                                        value={data.prerequisites}
                                        onChange={(e) => setData('prerequisites', Array.from(e.target.selectedOptions, (o) => o.value))}
                                        className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {courses
                                            .filter((c) => c.id !== materialData.id)
                                            .map((course) => (
                                                <option key={course.id} value={course.id}>{course.title}</option>
                                            ))}
                                    </select>
                                    <p className="text-xs text-slate-400 mt-1">Select any prerequisite courses required before enrolling.</p>
                                    {errors.prerequisites && <div className="text-red-500 text-sm mt-1">{errors.prerequisites}</div>}
                                </div>
                            )}

                            {data.type === 'topic' && (
                                <div className="mb-4">
                                    <label htmlFor="parent_id" className="block text-sm font-medium mb-2">
                                        Parent Course
                                    </label>
                                    <select
                                        id="parent_id"
                                        value={data.parent_id}
                                        onChange={(e) => setData('parent_id', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="">Select a course</option>
                                        {courses.map((course) => (
                                            <option key={course.id} value={course.id}>{course.title}</option>
                                        ))}
                                    </select>
                                    {errors.parent_id && <div className="text-red-500 text-sm mt-1">{errors.parent_id}</div>}
                                </div>
                            )}

                            {data.type === 'topic' && (
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium">
                                            Ordered Topic Blocks
                                        </label>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-3">
                                        Use sort order to control final page flow.
                                    </p>

                                    <div className="space-y-4">
                                        {data.blocks.map((block, index) => (
                                            <div key={index} className="rounded-lg border border-slate-700 p-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">Type</label>
                                                        <select
                                                            value={block.type}
                                                            onChange={(e) => updateBlockType(index, e.target.value)}
                                                            className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        >
                                                            <option value="text">Text</option>
                                                            <option value="youtube">YouTube</option>
                                                            <option value="pdf">PDF</option>
                                                            <option value="image">Image</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">Title (Optional)</label>
                                                        <input
                                                            type="text"
                                                            value={block.title}
                                                            onChange={(e) => updateBlock(index, 'title', e.target.value)}
                                                            className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">Sort Order</label>
                                                        <input
                                                            type="number"
                                                            min=""
                                                            value={block.sort_order}
                                                            onChange={(e) => updateBlock(index, 'sort_order', e.target.value)}
                                                            className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                    </div>
                                                </div>

                                                {block.type === 'text' && (
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">Text Content</label>
                                                        <RichTextEditor
                                                            value={block.content}
                                                            onChange={(value) => updateBlock(index, 'content', value)}
                                                            placeholder="Write text for this block..."
                                                        />
                                                    </div>
                                                )}

                                                {block.type === 'youtube' && (
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">YouTube URL</label>
                                                        <input
                                                            type="url"
                                                            value={block.url}
                                                            onChange={(e) => updateBlock(index, 'url', e.target.value)}
                                                            placeholder="https://www.youtube.com/watch?v=..."
                                                            className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                    </div>
                                                )}

                                                {(block.type === 'pdf' || block.type === 'image') && (
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">
                                                            {block.type === 'pdf' ? 'PDF File' : 'Image File'}
                                                        </label>
                                                        <input
                                                            type="file"
                                                            accept={block.type === 'pdf' ? 'application/pdf' : 'image/*'}
                                                            onChange={(e) => updateBlock(index, 'file', e.target.files?.[0] ?? null)}
                                                            className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                        {block.existing_file_path && (
                                                            <p className="text-xs mt-1 text-slate-400">
                                                                Existing file will be kept if you do not upload a replacement.
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="mt-3 flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeBlock(index)}
                                                        className="text-sm text-red-400 hover:text-red-300"
                                                    >
                                                        Remove Block
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-3 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={addBlock}
                                            className="text-sm text-indigo-400 hover:text-indigo-300"
                                        >
                                            Add Block
                                        </button>
                                    </div>

                                    {errors.blocks && <div className="text-red-500 text-sm mt-2">{errors.blocks}</div>}
                                </div>
                            )}

                            {data.type === 'course' && (
                                <div className="mb-6">
                                    <label htmlFor="content" className="block text-sm font-medium mb-2">
                                        Content
                                    </label>
                                    <RichTextEditor
                                        value={data.content}
                                        onChange={(value) => setData('content', value)}
                                        placeholder="Update formatted course content here..."
                                    />
                                    {errors.content && <div className="text-red-500 text-sm mt-1">{errors.content}</div>}
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {processing ? 'Updating…' : 'Update Content'}
                                </button>
                                <Link
                                    href={
                                        materialData.type === 'topic' && materialData.parent_id
                                            ? route('admin.learning-content.topic.show', [materialData.parent_id, materialData.id])
                                            : route('admin.learning-content.show', materialData.id)
                                    }
                                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdministratorLayout>
    );
}