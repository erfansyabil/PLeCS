import TeacherLayout from '@/Layouts/TeacherLayout';
import { Head, Link } from '@inertiajs/react';

export default function AdditionalContentIndex({materials}) {
    // Placeholder data since model isn't implemented yet
    const placeholderMaterials = [
        {
            id: 1,
            title: 'AI Ethics Guidelines',
            description: 'Comprehensive guidelines for ethical AI development and deployment.',
            type: 'Document',
            url: 'https://example.com/ai-ethics.pdf',
            created_at: '2024-01-15',
        },
        {
            id: 2,
            title: 'Cybersecurity Best Practices Video',
            description: 'Video tutorial on implementing security best practices.',
            type: 'Video',
            url: 'https://example.com/cybersecurity-video',
            created_at: '2024-01-20',
        },
        {
            id: 3,
            title: 'Web Development Resources',
            description: 'Curated list of useful resources for web development learning.',
            type: 'Link',
            url: 'https://example.com/web-dev-resources',
            created_at: '2024-01-25',
        },
    ];

    const materialsList = materials || placeholderMaterials;

    return (
        <TeacherLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Additional Learning Content
                    </h2>
                    <Link
                        href={route('teacher.additional-content.create')}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Add New Material
                    </Link>
                </div>
            }
        >
            <Head title="Additional Learning Content" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-600 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-white">
                            <p className="mb-6">
                                Manage additional learning materials for students. These materials provide supplementary resources to enhance their learning experience.
                            </p>

                            {materialsList.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">No additional materials found.</p>
                                    <Link
                                        href={route('teacher.additional-content.create')}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Add Your First Material
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Title
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Created
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-600 divide-y divide-gray-200 dark:divide-gray-700">
                                            {materialsList.map((material) => (
                                                <tr key={material.id} className="hover:bg-gray-50 dark:hover:bg-gray-500">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {material.title}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-300">
                                                            {material.description.length > 50
                                                                ? `${material.description.substring(0, 50)}...`
                                                                : material.description}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                            {material.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                        {new Date(material.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end space-x-2">
                                                            <Link
                                                                href={route('teacher.additional-content.show', material.id)}
                                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                            >
                                                                View
                                                            </Link>
                                                            <Link
                                                                href={route('teacher.additional-content.edit', material.id)}
                                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                            >
                                                                Edit
                                                            </Link>
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm('Are you sure you want to delete this material?')) {
                                                                        // Handle delete - would use Inertia delete method
                                                                        console.log('Delete material', material.id);
                                                                    }
                                                                }}
                                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
}
