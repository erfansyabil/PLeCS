import TeacherLayout from '@/Layouts/TeacherLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ material }) {

    return (
        <TeacherLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Additional File Details
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
            <Head title="Additional File Details" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-600 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-white">
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold mb-2">{material?.title || 'Untitled File'}</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <strong>Type:</strong> {String(material?.type || '').toUpperCase()}
                                    </div>
                                    <div>
                                        <strong>Created:</strong>{' '}
                                        {material?.created_at ? new Date(material.created_at).toLocaleDateString() : '-'}
                                    </div>
                                    <div>
                                        <strong>Course:</strong> {material?.course_title || '-'}
                                    </div>
                                    <div>
                                        <strong>Topic:</strong> {material?.topic_title || '-'}
                                    </div>
                                </div>

                                {material?.file_url && (
                                    <div className="mb-6">
                                        <strong>File:</strong>
                                        <a
                                            href={material.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 ml-2"
                                        >
                                            Open file
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