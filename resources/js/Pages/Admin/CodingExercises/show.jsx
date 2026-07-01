import AdministratorLayout from '@/Layouts/AdministratorLayout';
import { Head, Link, router } from '@inertiajs/react';

const difficultyBadge = {
    Beginner:     'bg-emerald-900/50 text-emerald-300',
    Intermediate: 'bg-amber-900/50 text-amber-300',
    Advanced:     'bg-red-900/50 text-red-300',
};

export default function Show({ codingExercise }) {
    const handleDelete = () => {
        if (!window.confirm(`Delete "${codingExercise.title}"? This cannot be undone.`)) return;
        router.delete(route('admin.coding-exercises.destroy', codingExercise.id));
    };

    return (
        <AdministratorLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">Coding Exercise</h2>
                        <p className="mt-0.5 text-sm text-slate-400">{codingExercise.title}</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href={route('admin.coding-exercises.edit', codingExercise.id)}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                            Edit
                        </Link>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="rounded-lg border border-red-800 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-900/30"
                        >
                            Delete
                        </button>
                        <Link
                            href={route('admin.coding-exercises.index')}
                            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                        >
                            Back
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={codingExercise.title} />

            <div className="py-8">
                <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* Header card */}
                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-sm">
                        <div className="mb-3 flex items-start justify-between gap-4">
                            <h1 className="text-2xl font-bold text-slate-100">{codingExercise.title}</h1>
                            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${codingExercise.is_published ? 'bg-emerald-900/50 text-emerald-300' : 'bg-slate-800 text-slate-300'}`}>
                                {codingExercise.is_published ? 'Published' : 'Draft'}
                            </span>
                        </div>

                        <p className="mb-4 text-sm text-slate-400">{codingExercise.description ?? 'No description provided.'}</p>

                        <div className="flex flex-wrap items-center gap-3 border-t border-slate-800 pt-4 text-sm">
                            <span className="text-slate-400">
                                Course: <strong className="text-slate-200">{codingExercise.course?.title ?? 'Unassigned'}</strong>
                            </span>
                            <span className="text-slate-600">·</span>
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${difficultyBadge[codingExercise.difficulty_level] ?? 'bg-slate-800 text-slate-300'}`}>
                                {codingExercise.difficulty_level}
                            </span>
                            <span className="text-slate-600">·</span>
                            <span className="text-slate-400">
                                <strong className="text-slate-200">{codingExercise.points}</strong> points
                            </span>
                            {codingExercise.published_at && (
                                <>
                                    <span className="text-slate-600">·</span>
                                    <span className="text-slate-400">Published {codingExercise.published_at}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-sm">
                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Instructions</h3>
                        <p className="whitespace-pre-line text-sm text-slate-300">{codingExercise.instructions}</p>
                    </div>

                    {/* Starter code */}
                    {codingExercise.starter_code && (
                        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-sm">
                            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Starter Code</h3>
                            <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-100 leading-relaxed">
                                {codingExercise.starter_code}
                            </pre>
                        </div>
                    )}

                    {/* Test cases */}
                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-sm">
                        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Test Cases ({codingExercise.test_cases?.length ?? 0})
                        </h3>

                        {codingExercise.test_cases?.length > 0 ? (
                            <div className="space-y-3">
                                {codingExercise.test_cases.map((tc, i) => (
                                    <div key={i} className="rounded-lg border border-slate-700 p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="font-medium text-slate-100">
                                                {i + 1}. {tc.label || `Test Case ${i + 1}`}
                                            </span>
                                            <span className="shrink-0 rounded-full bg-indigo-900/50 px-2.5 py-0.5 text-xs font-medium text-indigo-300">
                                                {tc.points} pts
                                            </span>
                                        </div>

                                        {tc.must_contain?.length > 0 && (
                                            <div className="mt-3">
                                                <p className="mb-1.5 text-xs font-medium text-slate-400">Required snippets:</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {tc.must_contain.map((snippet, si) => (
                                                        <code key={si} className="rounded bg-slate-800 px-2 py-0.5 font-mono text-xs text-slate-300">
                                                            {snippet}
                                                        </code>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400">No test cases defined.</p>
                        )}
                    </div>
                </div>
            </div>
        </AdministratorLayout>
    );
}
