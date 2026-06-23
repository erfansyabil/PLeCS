import AdministratorLayout from '@/Layouts/AdministratorLayout';
import { Head, Link, router } from '@inertiajs/react';

const difficultyBadge = {
    Beginner:     'bg-emerald-100 text-emerald-700',
    Intermediate: 'bg-amber-100 text-amber-700',
    Advanced:     'bg-red-100 text-red-700',
};

export default function Index({ codingExercises = [] }) {
    const handleDelete = (exercise) => {
        if (!window.confirm(`Delete "${exercise.title}"? This cannot be undone.`)) return;
        router.delete(route('admin.coding-exercises.destroy', exercise.id), { preserveScroll: true });
    };

    return (
        <AdministratorLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Coding Exercises</h2>
                        <p className="mt-0.5 text-sm text-slate-500">Manage practical coding challenges for students</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href={route('admin.quizzes.index')}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Quizzes
                        </Link>
                        <Link
                            href={route('admin.coding-exercises.create')}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Exercise
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Coding Exercises" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        {codingExercises.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-100">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            {['Title', 'Course', 'Difficulty', 'Points', 'Checks', 'Status', ''].map((h) => (
                                                <th
                                                    key={h}
                                                    className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${h === '' ? 'text-right' : 'text-left'}`}
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {codingExercises.map((exercise) => (
                                            <tr key={exercise.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-5 py-4">
                                                    <div className="font-medium text-slate-900">{exercise.title}</div>
                                                    {exercise.description && (
                                                        <div className="mt-0.5 max-w-xs truncate text-xs text-slate-500">
                                                            {exercise.description}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-slate-600">
                                                    {exercise.course?.title ?? <span className="italic text-slate-400">Unassigned</span>}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${difficultyBadge[exercise.difficulty_level] ?? 'bg-slate-100 text-slate-600'}`}>
                                                        {exercise.difficulty_level}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-sm font-medium text-slate-700">
                                                    {exercise.points} pts
                                                </td>
                                                <td className="px-5 py-4 text-sm text-slate-600">
                                                    {exercise.test_cases_count ?? '—'}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${exercise.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                        {exercise.is_published ? 'Published' : 'Draft'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-4 text-sm">
                                                        <Link href={route('admin.coding-exercises.show', exercise.id)} className="font-medium text-indigo-600 hover:text-indigo-800">
                                                            View
                                                        </Link>
                                                        <Link href={route('admin.coding-exercises.edit', exercise.id)} className="font-medium text-slate-600 hover:text-slate-900">
                                                            Edit
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(exercise)}
                                                            className="font-medium text-red-600 hover:text-red-800"
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
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
                                    <svg className="h-7 w-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                </div>
                                <p className="mb-1 text-sm font-medium text-slate-700">No coding exercises yet</p>
                                <p className="mb-6 text-sm text-slate-500">Create the first coding challenge for students.</p>
                                <Link href={route('admin.coding-exercises.create')} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                                    Create First Exercise
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdministratorLayout>
    );
}
