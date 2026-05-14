import AdministratorLayout from '@/Layouts/AdministratorLayout';
import RichTextEditor from '@/Components/RichTextEditor';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ courses = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        content: '',
        type: 'course',
        difficultyLevel: 'Beginner',
        parent_id: '',
        resource_type: 'none',
        resource_url: '',
        resource_file: null,
        blocks: [],
        attachments: [],
    });

    const emptyBlock = (type = 'text', sortOrder = 10) => ({
        type,
        title: '',
        content: '',
        url: '',
        file: null,
        existing_file_path: '',
        sort_order: sortOrder,
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
            ...emptyBlock(type, nextBlocks[index]?.sort_order ?? (index + 1) * 10),
            title: nextBlocks[index]?.title ?? '',
        };
        setData('blocks', nextBlocks);
    };

    const addBlock = (type = 'text') => {
        const nextSortOrder = (data.blocks.length + 1) * 10;
        setData('blocks', [...data.blocks, emptyBlock(type, nextSortOrder)]);
    };

    const removeBlock = (index) => {
        setData('blocks', data.blocks.filter((_, currentIndex) => currentIndex !== index));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.learning-content.store'), {
            forceFormData: true,
        });
    };

    const sortedCourses = [...courses].sort((a, b) => a.title.localeCompare(b.title));

    return (
        <AdministratorLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Add Learning Content
                    </h2>
                    <Link
                        href={route('admin.learning-content.index')}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Back to List
                    </Link>
                </div>
            }
        >
            <Head title="Add Learning Content" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-600 overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6 text-gray-900 dark:text-white">
                            <div className="mb-6 p-4 rounded-md border border-blue-200 bg-blue-50 dark:bg-gray-700 dark:border-gray-500">
                                <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                                    Course and Topic Structure
                                </p>
                                <p className="text-sm text-blue-700 dark:text-blue-100">
                                    Example: Asas Sains Komputer Tingkatan 1 can have 4 topics, while Tingkatan 2 can have 3 topics.
                                    Create the course first, then add its topics by selecting Type = Topic and choosing the course.
                                </p>
                            </div>

                            {sortedCourses.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold mb-2">Current Courses</h3>
                                    <div className="rounded-md border border-gray-200 dark:border-gray-500 divide-y divide-gray-200 dark:divide-gray-500">
                                        {sortedCourses.map((course) => (
                                            <div key={course.id} className="px-3 py-2 text-sm flex justify-between">
                                                <span>{course.title}</span>
                                                <span className="text-gray-500 dark:text-gray-300">
                                                    {course.topics_count ?? 0} topic{(course.topics_count ?? 0) === 1 ? '' : 's'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mb-4">
                                <label htmlFor="title" className="block text-sm font-medium mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                    required
                                />
                                {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="description" className="block text-sm font-medium mb-2">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows="4"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                />
                                {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="type" className="block text-sm font-medium mb-2">
                                    Type
                                </label>
                                <select
                                    id="type"
                                    value={data.type}
                                    onChange={(e) => {
                                        const nextType = e.target.value;
                                        setData('type', nextType);
                                        if (nextType === 'course') {
                                            setData('course_id', '');
                                            setData('resource_type', 'none');
                                            setData('resource_url', '');
                                            setData('resource_file', null);
                                            setData('blocks', []);
                                            setData('attachments', []);
                                        }

                                        if (nextType === 'topic') {
                                            if (data.blocks.length === 0) {
                                                setData('blocks', [emptyBlock('text', 10)]);
                                            }

                                            if (data.attachments.length === 0) {
                                                setData('attachments', [emptyAttachment()]);
                                            }
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                >
                                    <option value="course">Course</option>
                                    <option value="topic">Topic</option>
                                </select>
                                {errors.type && <div className="text-red-500 text-sm mt-1">{errors.type}</div>}
                            </div>

                            {data.type === 'course' && (
                                <div className="mb-4">
                                    <label htmlFor="difficultyLevel" className="block text-sm font-medium mb-2">
                                        Difficulty Level
                                    </label>
                                    <select
                                        id="difficultyLevel"
                                        value={data.difficultyLevel}
                                        onChange={(e) => setData('difficultyLevel', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                    {errors.difficultyLevel && <div className="text-red-500 text-sm mt-1">{errors.difficultyLevel}</div>}
                                </div>
                            )}

                            {data.type === 'topic' && (
                                <div className="mb-4">
                                    <label htmlFor="course_id" className="block text-sm font-medium mb-2">
                                        Course
                                    </label>
                                    <select
                                        id="course_id"
                                        value={data.course_id}
                                        onChange={(e) => setData('course_id', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                        required
                                    >
                                        <option value="">Select a course</option>
                                        {sortedCourses.map((course) => (
                                            <option key={course.id} value={course.id}>
                                                {course.title} ({course.topics_count ?? 0} topic{(course.topics_count ?? 0) === 1 ? '' : 's'})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.course_id && <div className="text-red-500 text-sm mt-1">{errors.course_id}</div>}
                                </div>
                            )}

                            {data.type === 'topic' && (
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium">
                                            Ordered Topic Blocks
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => addBlock('text')}
                                            className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
                                        >
                                            Add Block
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-300 mb-3">
                                        Rearrange your lesson flow using sort order: text, video, text, PDF, and more.
                                    </p>

                                    <div className="space-y-4">
                                        {data.blocks.map((block, index) => (
                                            <div key={index} className="rounded-lg border border-gray-200 dark:border-gray-500 p-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">Type</label>
                                                        <select
                                                            value={block.type}
                                                            onChange={(e) => updateBlockType(index, e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
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
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">Sort Order</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={block.sort_order}
                                                            onChange={(e) => updateBlock(index, 'sort_order', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
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
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
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
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                                        />
                                                    </div>
                                                )}

                                                <div className="mt-3 flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeBlock(index)}
                                                        className="text-sm text-red-600 hover:text-red-800 dark:text-red-300 dark:hover:text-red-200"
                                                    >
                                                        Remove Block
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
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
                                        placeholder="Write formatted course content here..."
                                    />
                                    {errors.content && <div className="text-red-500 text-sm mt-1">{errors.content}</div>}
                                </div>
                            )}

                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                                >
                                    {processing ? 'Creating...' : 'Create Material'}
                                </button>
                                <Link
                                    href={route('admin.learning-content.index')}
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
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