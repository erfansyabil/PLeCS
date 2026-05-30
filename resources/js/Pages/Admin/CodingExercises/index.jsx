import AdministratorLayout from '@/Layouts/AdministratorLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ codingExercises = [] }) {
    return (
        <AdministratorLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Coding Exercise Management</h2>
                    <div className="flex gap-3">
                        <Link href={route('admin.quizzes.index')} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">Quizzes</Link>
                        <Link href={route('admin.coding-exercises.create')} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">New exercise</Link>
                    </div>
                </div>
            }
        >
            <Head title="Coding Exercise Management" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-gray-600">
                        <div className="p-6 text-gray-900 dark:text-white">
                            <p className="mb-6 text-sm text-gray-500 dark:text-gray-300">Manage coding exercises tied to a course and publish them for enrolled students.</p>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">Title</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">Course</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">Difficulty</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">Points</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">Status</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {codingExercises.map((exercise) => (
                                            <tr key={exercise.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/60">
                                                <td className="px-4 py-4">
                                                    <div className="font-medium text-gray-900 dark:text-white">{exercise.title}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-300">{exercise.description ?? 'No description provided.'}</div>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300">{exercise.course?.title ?? 'Unassigned'}</td>
                                                <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300">{exercise.difficulty_level}</td>
                                                <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300">{exercise.points}</td>
                                                <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300">{exercise.is_published ? 'Published' : 'Draft'}</td>
                                                <td className="px-4 py-4 text-right text-sm">
                                                    <div className="flex justify-end gap-3">
                                                        <Link href={route('admin.coding-exercises.show', exercise.id)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-300">View</Link>
                                                        <Link href={route('admin.coding-exercises.edit', exercise.id)} className="text-blue-600 hover:text-blue-900 dark:text-blue-300">Edit</Link>
                                                        <button type="button" onClick={() => router.delete(route('admin.coding-exercises.destroy', exercise.id), { preserveScroll: true })} className="text-red-600 hover:text-red-900 dark:text-red-300">Delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {codingExercises.length === 0 && <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-300">No coding exercises have been created yet.</div>}
                        </div>
                    </div>
                </div>
            </div>
        </AdministratorLayout>
    );
}
