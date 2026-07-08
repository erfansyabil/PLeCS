import AdministratorLayout from '@/Layouts/AdministratorLayout';
import Modal from '@/Components/ui/Modal';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const difficultyBadge = {
    Beginner:     'bg-emerald-900/50 text-emerald-300',
    Intermediate: 'bg-amber-900/50 text-amber-300',
    Advanced:     'bg-red-900/50 text-red-300',
};

export default function Index({ quizzes = [] }) {
    const [quizPendingDeletion, setQuizPendingDeletion] = useState(null);

    const confirmDelete = (quiz) => setQuizPendingDeletion(quiz);
    const cancelDelete = () => setQuizPendingDeletion(null);

    const deleteQuiz = () => {
        if (!quizPendingDeletion) {
            return;
        }

        router.delete(route('admin.quizzes.destroy', quizPendingDeletion.id), {
            preserveScroll: true,
            onFinish: () => setQuizPendingDeletion(null),
        });
    };

    return (
        <AdministratorLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">Quiz Management</h2>
                        <p className="mt-0.5 text-sm text-slate-400">Create and manage course quizzes</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href={route('admin.coding-exercises.index')}
                            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                        >
                            Coding Exercises
                        </Link>
                        <Link
                            href={route('admin.quizzes.create')}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Quiz
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Quiz Management" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-sm">
                        {quizzes.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-700 m-6 p-12 text-center">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-900/40">
                                    <svg className="h-6 w-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <p className="text-sm text-slate-400">No quizzes have been created yet.</p>
                                <Link href={route('admin.quizzes.create')} className="mt-3 inline-block text-sm font-medium text-indigo-400 hover:text-indigo-300">
                                    Create the first quiz →
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-800">
                                    <thead className="bg-slate-800">
                                        <tr>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Title</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Course</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Difficulty</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Points</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
                                            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800 bg-slate-900">
                                        {quizzes.map((quiz) => (
                                            <tr key={quiz.id} className="hover:bg-slate-800 transition-colors">
                                                <td className="px-5 py-4">
                                                    <div className="font-medium text-slate-100">{quiz.title}</div>
                                                    <div className="mt-0.5 text-xs text-slate-400">{quiz.description ?? 'No description provided.'}</div>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-slate-400">{quiz.course?.title ?? <span className="italic text-slate-400">Unassigned</span>}</td>
                                                <td className="px-5 py-4">
                                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${difficultyBadge[quiz.difficulty_level] ?? 'bg-slate-800 text-slate-300'}`}>
                                                        {quiz.difficulty_level}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-sm font-medium text-slate-300">{quiz.points} pts</td>
                                                <td className="px-5 py-4">
                                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${quiz.is_published ? 'bg-emerald-900/50 text-emerald-300' : 'bg-slate-800 text-slate-300'}`}>
                                                        {quiz.is_published ? 'Published' : 'Draft'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-4 text-sm">
                                                        <Link href={route('admin.quizzes.show', quiz.id)} className="font-medium text-indigo-400 hover:text-indigo-300">View</Link>
                                                        <Link href={route('admin.quizzes.edit', quiz.id)} className="font-medium text-slate-400 hover:text-slate-100">Edit</Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => confirmDelete(quiz)}
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

            <Modal show={quizPendingDeletion !== null} onClose={cancelDelete}>
                <div className="bg-slate-900 p-6">
                    <h2 className="text-lg font-medium text-slate-100">
                        Delete "{quizPendingDeletion?.title}"?
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                        This will permanently delete the quiz and all associated student attempts. This action cannot be undone.
                    </p>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={cancelDelete}
                            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={deleteQuiz}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
                        >
                            Delete Quiz
                        </button>
                    </div>
                </div>
            </Modal>
        </AdministratorLayout>
    );
}
