import AdministratorLayout from '@/Layouts/AdministratorLayout';
import RichTextEditor from '@/Components/RichTextEditor';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ content, courses = [] }) {
    const materialData = content;

    const { data, setData, post, processing, errors } = useForm({
        title: materialData.title,
        description: materialData.description,
        content: materialData.content || '',
        type: materialData.type,
        parent_id: materialData.parent_id || '',
        resource_type: materialData.resource_type || 'none',
        resource_url: materialData.resource_url || '',
        resource_file: null,
        _method: 'put',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.learning-content.update', materialData.id), {
            forceFormData: true,
        });
    };

    return (
        <AdministratorLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Edit Learning Content
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
            <Head title="Edit Learning Content" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-600 overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6 text-gray-900 dark:text-white">
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
                                        {courses.map((course) => (
                                            <option key={course.id} value={course.id}>{course.title}</option>
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
                                    />
                                    <p className="text-xs mt-1 text-gray-500 dark:text-gray-300">Upload a new file only if you want to replace the current PDF.</p>
                                    {errors.resource_file && <div className="text-red-500 text-sm mt-1">{errors.resource_file}</div>}
                                </div>
                            )}

                            <div className="mb-6">
                                <label htmlFor="content" className="block text-sm font-medium mb-2">
                                    Content
                                </label>
                                <RichTextEditor
                                    value={data.content}
                                    onChange={(value) => setData('content', value)}
                                    placeholder="Update formatted topic content here..."
                                />
                                {errors.content && <div className="text-red-500 text-sm mt-1">{errors.content}</div>}
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                                >
                                    {processing ? 'Updating...' : 'Update Material'}
                                </button>
                                <Link
                                    href={route('admin.learning-content.show', materialData.id)}
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