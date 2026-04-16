import TeacherLayout from '@/Layouts/TeacherLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ auth, material, layout }) {
    // Placeholder data since model isn't implemented yet
    const placeholderMaterial = {
        id: 1,
        title: 'Sample Additional Material',
        description: 'This is a sample additional learning material for students.',
        type: 'Document',
        url: 'https://example.com/material.pdf',
        created_at: '2024-01-01',
    };

    const materialData = material || placeholderMaterial;

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
                                <h3 className="text-2xl font-bold mb-2">{materialData.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">{materialData.description}</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <strong>Type:</strong> {materialData.type}
                                    </div>
                                    <div>
                                        <strong>Created:</strong> {new Date(materialData.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                {materialData.url && (
                                    <div className="mb-6">
                                        <strong>URL:</strong>
                                        <a
                                            href={materialData.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 ml-2"
                                        >
                                            {materialData.url}
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="flex space-x-4">
                                <Link
                                    href={route('teacher.additional-content.edit', materialData.id)}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Edit
                                </Link>
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