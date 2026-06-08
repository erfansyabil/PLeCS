import TeacherLayout from '@/Layouts/TeacherLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Show({ auth, material, layout }) {
    const { delete: deleteResource, processing } = useForm();

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this material?')) {
            deleteResource(route('teacher.additional-content.destroy', material.id), {
                onSuccess: () => {
                    // Material deleted successfully
                },
            });
        }
    };

    if (!material) {
        return (
            <TeacherLayout>
                <div className="py-12">
                    <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                        <p>Material not found.</p>
                    </div>
                </div>
            </TeacherLayout>
        );
    }

    return (
        <TeacherLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Additional Learning Content Details
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
            <Head title="Additional Learning Content Details" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-600 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-white">
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold mb-2">{material.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">{material.description || 'No description'}</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <strong>Type:</strong> {material.type}
                                    </div>
                                    <div>
                                        <strong>Created:</strong> {new Date(material.created_at).toLocaleDateString()}
                                    </div>
                                    <div>
                                        <strong>Course:</strong> {material.course?.title || 'N/A'}
                                    </div>
                                    <div>
                                        <strong>Topic:</strong> {material.topic?.name || 'N/A'}
                                    </div>
                                </div>

                                {material.type === 'Link' && material.url && (
                                    <div className="mb-6">
                                        <strong>URL:</strong>
                                        <a
                                            href={material.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 ml-2 break-all"
                                        >
                                            {material.url}
                                        </a>
                                    </div>
                                )}

                                {material.type !== 'Link' && material.file_path && (
                                    <div className="mb-6">
                                        <strong>File:</strong>
                                        <a
                                            href={`/storage/${material.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 ml-2"
                                        >
                                            {material.file_path.split('/').pop()}
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="flex space-x-4">
                                <Link
                                    href={route('teacher.additional-content.edit', material.id)}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={handleDelete}
                                    disabled={processing}
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                                >
                                    Delete
                                </button>
                                <Link
                                    href={route('teacher.additional-content.index')}
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Back to List
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
}