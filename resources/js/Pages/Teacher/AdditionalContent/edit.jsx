import TeacherLayout from '@/Layouts/TeacherLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ auth, material, layout, courses }) {
    const { data, setData, put, processing, errors } = useForm({
        title: material?.title || '',
        description: material?.description || '',
        type: material?.type || 'Document',
        url: material?.url || '',
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
                        Edit Additional Learning Content
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
            <Head title="Edit Additional Learning Content" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-600 overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6 text-gray-900 dark:text-white">
                            {material && (
                                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        <strong>Course:</strong> {material.course?.title}
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        <strong>Topic:</strong> {material.topic?.name}
                                    </p>
                                </div>
                            )}

                            <div className="mb-4">
                                <label htmlFor="title" className="block text-sm font-medium mb-2">
                                    Title <span className="text-red-500">*</span>
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
                                    Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="type"
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                >
                                    <option value="Document">Document</option>
                                    <option value="Video">Video</option>
                                    <option value="Link">Link</option>
                                    <option value="Presentation">Presentation</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.type && <div className="text-red-500 text-sm mt-1">{errors.type}</div>}
                            </div>

                            {data.type === 'Link' && (
                                <div className="mb-6">
                                    <label htmlFor="url" className="block text-sm font-medium mb-2">
                                        URL <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="url"
                                        id="url"
                                        value={data.url}
                                        onChange={(e) => setData('url', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                        placeholder="https://example.com/resource"
                                    />
                                    {errors.url && <div className="text-red-500 text-sm mt-1">{errors.url}</div>}
                                </div>
                            )}

                            {data.type !== 'Link' && (
                                <>
                                    {material?.file_path && (
                                        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Current File:
                                            </p>
                                            <a
                                                href={`/storage/${material.file_path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                                            >
                                                {material.file_path.split('/').pop()}
                                            </a>
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <label htmlFor="file" className="block text-sm font-medium mb-2">
                                            Replace File (optional)
                                        </label>
                                        <input
                                            type="file"
                                            id="file"
                                            onChange={(e) => setData('file', e.target.files[0])}
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Supported formats: PDF, DOC, DOCX, JPG, PNG, WEBP (Max 10MB)
                                        </p>
                                        {errors.file && <div className="text-red-500 text-sm mt-1">{errors.file}</div>}
                                    </div>
                                </>
                            )}

                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                                >
                                    {processing ? 'Updating...' : 'Update Material'}
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