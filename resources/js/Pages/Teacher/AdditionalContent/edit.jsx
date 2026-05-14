import TeacherLayout from '@/Layouts/TeacherLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ material, topics = [] }) {

    const { data, setData, put, processing, errors } = useForm({
        topic_id: material?.topic_id || '',
        title: material?.title || '',
        type: material?.type || 'pdf',
        sort_order: material?.sort_order ?? 0,
        file: null,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('teacher.additional-content.update', material.id), {
            forceFormData: true,
        });
    };

    return (
        <TeacherLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Edit Additional File
                    </h2>
                    <Link
                        href={route('teacher.additional-content.index')}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Back to List
                    </Link>
                </div>
            }
        >
            <Head title="Edit Additional File" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-600 overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6 text-gray-900 dark:text-white">
                            <div className="mb-4">
                                <label htmlFor="topic_id" className="block text-sm font-medium mb-2">
                                    Topic
                                </label>
                                <select
                                    id="topic_id"
                                    value={data.topic_id}
                                    onChange={(e) => setData('topic_id', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                    required
                                >
                                    <option value="">Select a topic</option>
                                    {topics.map((topic) => (
                                        <option key={topic.id} value={topic.id}>
                                            {topic.course_title} - {topic.title}
                                        </option>
                                    ))}
                                </select>
                                {errors.topic_id && <div className="text-red-500 text-sm mt-1">{errors.topic_id}</div>}
                            </div>

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
                                />
                                {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
                            </div>

                            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="type" className="block text-sm font-medium mb-2">
                                        Type
                                    </label>
                                    <select
                                        id="type"
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                    >
                                        <option value="pdf">PDF</option>
                                        <option value="image">Image</option>
                                    </select>
                                    {errors.type && <div className="text-red-500 text-sm mt-1">{errors.type}</div>}
                                </div>

                                <div>
                                    <label htmlFor="sort_order" className="block text-sm font-medium mb-2">
                                        Sort Order
                                    </label>
                                    <input
                                        type="number"
                                        id="sort_order"
                                        min="0"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    {errors.sort_order && <div className="text-red-500 text-sm mt-1">{errors.sort_order}</div>}
                                </div>
                            </div>

                            <div className="mb-6">
                                <label htmlFor="file" className="block text-sm font-medium mb-2">
                                    Replace File (optional)
                                </label>
                                <input
                                    type="file"
                                    id="file"
                                    accept="application/pdf,image/*"
                                    onChange={(e) => setData('file', e.target.files?.[0] ?? null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                />
                                {material?.file_url && (
                                    <p className="text-xs text-gray-500 dark:text-gray-300 mt-2">
                                        Current file:{' '}
                                        <a href={material.file_url} className="text-blue-600 hover:text-blue-800" target="_blank" rel="noopener noreferrer">
                                            Open file
                                        </a>
                                    </p>
                                )}
                                {errors.file && <div className="text-red-500 text-sm mt-1">{errors.file}</div>}
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                                >
                                    {processing ? 'Updating...' : 'Update File'}
                                </button>
                                <Link
                                    href={route('teacher.additional-content.show', material.id)}
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
}