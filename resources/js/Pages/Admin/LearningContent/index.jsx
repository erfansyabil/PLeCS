import AdministratorLayout from '@/Layouts/AdministratorLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function LearningContentIndex({ contents }) {
    const materialsList = Array.isArray(contents) ? contents : [];

    const deleteCourse = (courseId) => {
        if (!confirm('Are you sure you want to delete this course? This will also delete all topics under it.')) {
            return;
        }

        router.delete(route('admin.learning-content.destroy', courseId), {
            preserveScroll: true,
        });
    };

    return (
        <AdministratorLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">Learning Content</h2>
                        <p className="mt-0.5 text-sm text-slate-400">Manage courses and topics for students</p>
                    </div>
                    <Link
                        href={route('admin.learning-content.create')}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Content
                    </Link>
                </div>
            }
        >
            <Head title="Learning Content" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-sm">
                        {materialsList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-900/40">
                                    <svg className="h-7 w-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <p className="mb-1 text-sm font-medium text-slate-300">No learning content yet</p>
                                <p className="mb-6 text-sm text-slate-400">Get started by creating your first course.</p>
                                <Link
                                    href={route('admin.learning-content.create')}
                                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                                >
                                    Add Your First Course
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-800">
                                    <thead className="bg-slate-800">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                Title
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                Created
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800 bg-slate-900">
                                        {materialsList.map((material) => (
                                            <tr key={material.id} className="hover:bg-slate-800 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-semibold text-slate-100">
                                                        {material.title}
                                                    </div>
                                                    <div className="mt-0.5 text-xs text-slate-400">
                                                        {material.description && material.description.length > 60
                                                            ? `${material.description.substring(0, 60)}...`
                                                            : material.description || 'No description'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${material.type === 'course' ? 'bg-indigo-900/50 text-indigo-300' : 'bg-cyan-900/50 text-cyan-300'}`}>
                                                        {material.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-400">
                                                    {new Date(material.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-4 text-sm">
                                                        <Link
                                                            href={route('admin.learning-content.show', material.id)}
                                                            className="font-medium text-indigo-400 hover:text-indigo-300"
                                                        >
                                                            View
                                                        </Link>
                                                        <Link
                                                            href={route('admin.learning-content.edit', material.id)}
                                                            className="font-medium text-slate-400 hover:text-slate-100"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => deleteCourse(material.id)}
                                                            className="font-medium text-red-400 hover:text-red-300"
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
        </AdministratorLayout>
    );
}
