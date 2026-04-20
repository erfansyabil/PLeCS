import AdministratorLayout from '@/Layouts/AdministratorLayout';
import RichTextEditor from '@/Components/RichTextEditor';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ courses = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        content: '',
        type: 'course',
        parent_id: '',
        resource_type: 'none',
        resource_url: '',
        resource_file: null,
        attachments: [],
    });

    const emptyAttachment = () => ({
        title: '',
        type: 'pdf',
        file: null,
        sort_order: 0,
    });

    const updateAttachment = (index, field, value) => {
        const nextAttachments = [...data.attachments];
        nextAttachments[index] = {
            ...nextAttachments[index],
            [field]: value,
        };
        setData('attachments', nextAttachments);
    };

    const addAttachment = () => {
        setData('attachments', [...data.attachments, emptyAttachment()]);
    };

    const removeAttachment = (index) => {
        setData('attachments', data.attachments.filter((_, currentIndex) => currentIndex !== index));
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
                                    Create the course first, then add its topics by selecting Type = Topic and choosing the parent course.
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
                                                    {course.children_count ?? 0} topic{(course.children_count ?? 0) === 1 ? '' : 's'}
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
                                            setData('parent_id', '');
                                            setData('resource_type', 'none');
                                            setData('resource_url', '');
                                            setData('resource_file', null);
                                            setData('attachments', []);
                                        }

                                        if (nextType === 'topic' && data.attachments.length === 0) {
                                            setData('attachments', [emptyAttachment()]);
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                >
                                    <option value="course">Course</option>
                                    <option value="topic">Topic</option>
                                </select>
                                {errors.type && <div className="text-red-500 text-sm mt-1">{errors.type}</div>}
                            </div>

                            {data.type === 'topic' && (
                                <div className="mb-4">
                                    <label htmlFor="resource_type" className="block text-sm font-medium mb-2">
                                        Topic Resource Type
                                    </label>
                                    <select
                                        id="resource_type"
                                        value={data.resource_type}
                                        onChange={(e) => {
                                            const nextResourceType = e.target.value;
                                            setData('resource_type', nextResourceType);
                                            if (nextResourceType !== 'youtube') {
                                                setData('resource_url', '');
                                            }
                                            if (nextResourceType !== 'pdf') {
                                                setData('resource_file', null);
                                            }
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                    >
                                        <option value="none">No media resource</option>
                                        <option value="pdf">PDF file</option>
                                        <option value="youtube">YouTube link</option>
                                    </select>
                                    {errors.resource_type && <div className="text-red-500 text-sm mt-1">{errors.resource_type}</div>}
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                        required
                                    >
                                        <option value="">Select a course</option>
                                        {sortedCourses.map((course) => (
                                            <option key={course.id} value={course.id}>
                                                {course.title} ({course.children_count ?? 0} topic{(course.children_count ?? 0) === 1 ? '' : 's'})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.parent_id && <div className="text-red-500 text-sm mt-1">{errors.parent_id}</div>}
                                </div>
                            )}

                            {data.type === 'topic' && data.resource_type === 'youtube' && (
                                <div className="mb-4">
                                    <label htmlFor="resource_url" className="block text-sm font-medium mb-2">
                                        YouTube URL
                                    </label>
                                    <input
                                        type="url"
                                        id="resource_url"
                                        value={data.resource_url}
                                        onChange={(e) => setData('resource_url', e.target.value)}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                        required
                                    />
                                    {errors.resource_url && <div className="text-red-500 text-sm mt-1">{errors.resource_url}</div>}
                                </div>
                            )}

                            {data.type === 'topic' && data.resource_type === 'pdf' && (
                                <div className="mb-4">
                                    <label htmlFor="resource_file" className="block text-sm font-medium mb-2">
                                        PDF File
                                    </label>
                                    <input
                                        type="file"
                                        id="resource_file"
                                        accept="application/pdf"
                                        onChange={(e) => setData('resource_file', e.target.files?.[0] ?? null)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                        required
                                    />
                                    <p className="text-xs mt-1 text-gray-500 dark:text-gray-300">Maximum file size: 10MB</p>
                                    {errors.resource_file && <div className="text-red-500 text-sm mt-1">{errors.resource_file}</div>}
                                </div>
                            )}

                            {data.type === 'topic' && (
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium">
                                            Additional Files
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addAttachment}
                                            className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
                                        >
                                            Add File
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-300 mb-3">
                                        Add multiple PDF or image files and sort them by number. Lower numbers show first.
                                    </p>

                                    <div className="space-y-4">
                                        {data.attachments.map((attachment, index) => (
                                            <div key={index} className="rounded-lg border border-gray-200 dark:border-gray-500 p-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">Title</label>
                                                        <input
                                                            type="text"
                                                            value={attachment.title}
                                                            onChange={(e) => updateAttachment(index, 'title', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">Type</label>
                                                        <select
                                                            value={attachment.type}
                                                            onChange={(e) => updateAttachment(index, 'type', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                                        >
                                                            <option value="pdf">PDF</option>
                                                            <option value="image">Image</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">Sort Order</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={attachment.sort_order}
                                                            onChange={(e) => updateAttachment(index, 'sort_order', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <label className="block text-sm font-medium mb-2">File</label>
                                                    <input
                                                        type="file"
                                                        accept="application/pdf,image/*"
                                                        onChange={(e) => updateAttachment(index, 'file', e.target.files?.[0] ?? null)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                                        required
                                                    />
                                                </div>

                                                <div className="mt-3 flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAttachment(index)}
                                                        className="text-sm text-red-600 hover:text-red-800 dark:text-red-300 dark:hover:text-red-200"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {errors.attachments && <div className="text-red-500 text-sm mt-2">{errors.attachments}</div>}
                                </div>
                            )}

                            <div className="mb-6">
                                <label htmlFor="content" className="block text-sm font-medium mb-2">
                                    Content
                                </label>
                                <RichTextEditor
                                    value={data.content}
                                    onChange={(value) => setData('content', value)}
                                    placeholder="Write formatted topic content here..."
                                />
                                {errors.content && <div className="text-red-500 text-sm mt-1">{errors.content}</div>}
                            </div>

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