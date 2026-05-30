import StudentLayout from '@/Layouts/StudentLayout';
import { Head, useForm } from '@inertiajs/react';

export default function CodingExerciseAttemptPage({ course, codingExercise, latestAttempt }) {
    const { data, setData, post, processing, errors } = useForm({
        submission_code: codingExercise.starter_code ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('student.assessment.coding-exercise.store', [course.id, codingExercise.id]));
    };

    return (
        <StudentLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">{codingExercise.title}</h2>}>
            <Head title={codingExercise.title} />

            <div className="py-12">
                <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-600">
                        <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-300">{course.title}</p>
                        <h3 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{codingExercise.title}</h3>
                        <p className="mt-3 text-gray-700 dark:text-gray-200">{codingExercise.description ?? 'No description provided.'}</p>
                        <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-300">
                            <span>{codingExercise.difficulty_level}</span>
                            <span>{codingExercise.points} points</span>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                        <form onSubmit={submit} className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-600">
                            <label htmlFor="submission_code" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Your solution
                            </label>
                            <textarea
                                id="submission_code"
                                rows="18"
                                value={data.submission_code}
                                onChange={(e) => setData('submission_code', e.target.value)}
                                className="mt-3 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-mono text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            />
                            {errors.submission_code && <p className="mt-2 text-sm text-red-600">{errors.submission_code}</p>}
                            <button type="submit" disabled={processing} className="mt-4 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50">
                                {processing ? 'Submitting...' : 'Submit exercise'}
                            </button>
                        </form>

                        <aside className="space-y-6">
                            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-600">
                                <h4 className="font-semibold text-gray-900 dark:text-white">Instructions</h4>
                                <p className="mt-3 whitespace-pre-line text-sm text-gray-700 dark:text-gray-200">{codingExercise.instructions}</p>
                            </div>

                            {codingExercise.starter_code && (
                                <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-600">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Starter Code</h4>
                                    <pre className="mt-3 overflow-x-auto rounded-xl bg-gray-900 p-4 text-sm text-gray-100">{codingExercise.starter_code}</pre>
                                </div>
                            )}

                            {latestAttempt && (
                                <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-600">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Latest Attempt</h4>
                                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">Score: {latestAttempt.score} / {latestAttempt.max_score}</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-200">Status: {latestAttempt.passed ? 'Passed' : 'Needs work'}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-300">Submitted {latestAttempt.submitted_at}</p>
                                    <pre className="mt-3 max-h-56 overflow-x-auto overflow-y-auto rounded-xl bg-gray-900 p-4 text-xs text-gray-100">{latestAttempt.submission_code}</pre>
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
