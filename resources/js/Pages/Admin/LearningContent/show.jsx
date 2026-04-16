import AdministratorLayout from '@/Layouts/AdministratorLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ content, topics = [] }) {
    const materialData = content;

    return (
        <AdministratorLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Learning Content Details
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
            <Head title="Learning Content Details" />

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

                                {materialData.content && (
                                    <div className="mb-6">
                                        <strong>Content:</strong>
                                        <p className="mt-2 whitespace-pre-line">{materialData.content}</p>
                                    </div>
                                )}

                                {topics.length > 0 && (
                                    <div className="mb-6">
                                        <strong>Topics:</strong>
                                        <ul className="list-disc list-inside mt-2">
                                            {topics.map((topic) => (
                                                <li key={topic.id}>{topic.title}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="flex space-x-4">
                                <Link
                                    href={route('admin.learning-content.edit', materialData.id)}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Edit
                                </Link>
                                <Link
                                    href={route('admin.learning-content.index')}
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Back to List
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdministratorLayout>
    );
}