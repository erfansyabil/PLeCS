import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

// ─── Icons ────────────────────────────────────────────────────────────────────
function CheckIcon() {
    return (
        <svg className="h-5 w-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    );
}

function XIcon() {
    return (
        <svg className="h-5 w-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    );
}

// ─── Knowledge gap banner ──────────────────────────────────────────────────────
function KnowledgeGapBanner() {
    const { flash } = usePage().props;
    if (!flash?.gap_warning) return null;
    return (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20 p-4 flex gap-3">
            <svg className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Knowledge Gap Detected</p>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">{flash.gap_warning}</p>
            </div>
        </div>
    );
}

// ─── Result panel ─────────────────────────────────────────────────────────────
function ResultPanel({ attempt, exercise, course, onRetry }) {
    const percentage = attempt.max_score > 0
        ? Math.round((attempt.score / attempt.max_score) * 100)
        : 0;

    const scoreColor = attempt.passed
        ? 'text-green-600 dark:text-green-400'
        : 'text-red-600 dark:text-red-400';

    const badgeClass = attempt.passed
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';

    return (
        <div className="space-y-6">
            <KnowledgeGapBanner />

            {/* Score summary */}
            <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-700 text-center">
                <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {course.title}
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                    {exercise.title}
                </h3>

                <div className={`mt-6 text-6xl font-bold ${scoreColor}`}>
                    {percentage}%
                </div>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                    {attempt.score} / {attempt.max_score} points
                </p>

                <span className={`mt-4 inline-block rounded-full px-4 py-1 text-sm font-medium ${badgeClass}`}>
                    {attempt.passed ? 'Passed' : 'Needs work'}
                </span>

                <p className="mt-2 text-xs text-gray-400">
                    Submitted {attempt.submitted_at}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link
                        href={route('student.assessment.show', course.id)}
                        className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                        Back to course
                    </Link>
                    <button
                        type="button"
                        onClick={onRetry}
                        className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                        Try again
                    </button>
                </div>
            </div>

            {/* Per-test-case feedback */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Test Case Results
                </h4>

                {(attempt.feedback ?? []).map((item, i) => (
                    <div
                        key={i}
                        className={`rounded-2xl border bg-white p-5 shadow-sm dark:bg-gray-700 ${
                            item.is_correct
                                ? 'border-green-200 dark:border-green-700'
                                : 'border-red-200 dark:border-red-700'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            {item.is_correct ? <CheckIcon /> : <XIcon />}
                            <span className="font-medium text-gray-900 dark:text-white">
                                {item.label}
                            </span>
                            <span className="ml-auto text-xs text-gray-400">
                                {item.is_correct ? `+${item.points}` : `0 / ${item.points}`} pts
                            </span>
                        </div>

                        {item.required_snippets?.length > 0 && (
                            <div className="mt-3 pl-8">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Required:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {item.required_snippets.map((snippet, si) => {
                                        const missing = item.missing_snippets?.includes(snippet);
                                        return (
                                            <code
                                                key={si}
                                                className={`rounded px-2 py-0.5 text-xs ${
                                                    missing
                                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                                        : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                                }`}
                                            >
                                                {snippet}
                                            </code>
                                        );
                                    })}
                                </div>
                                {item.missing_snippets?.length > 0 && (
                                    <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                                        Missing: {item.missing_snippets.join(', ')}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Submitted code */}
            {attempt.submission_code && (
                <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Your submission</h4>
                    <pre className="mt-3 max-h-72 overflow-auto rounded-xl bg-gray-900 p-4 text-xs text-gray-100">
                        {attempt.submission_code}
                    </pre>
                </div>
            )}
        </div>
    );
}

// ─── Exercise form ─────────────────────────────────────────────────────────────
function ExerciseForm({ exercise, processing, data, setData, submit }) {
    return (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <form onSubmit={submit} className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-700 flex flex-col">
                <label htmlFor="submission_code" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Your solution
                </label>
                <textarea
                    id="submission_code"
                    rows={20}
                    value={data.submission_code}
                    onChange={(e) => setData('submission_code', e.target.value)}
                    spellCheck={false}
                    className="mt-3 flex-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-mono text-sm text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
                <button
                    type="submit"
                    disabled={processing || !data.submission_code.trim()}
                    className="mt-4 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                    {processing ? 'Submitting...' : 'Submit exercise'}
                </button>
            </form>

            <aside className="space-y-6">
                <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Instructions</h4>
                    <p className="mt-3 whitespace-pre-line text-sm text-gray-700 dark:text-gray-200">
                        {exercise.instructions}
                    </p>
                </div>

                {exercise.test_cases?.length > 0 && (
                    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-700">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                            Checks ({exercise.test_cases.length})
                        </h4>
                        <ul className="mt-3 space-y-2">
                            {exercise.test_cases.map((tc, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold dark:bg-gray-600 dark:text-gray-200">
                                        {i + 1}
                                    </span>
                                    {tc.label ?? `Test Case ${i + 1}`}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {exercise.starter_code && (
                    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-700">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Starter code</h4>
                        <pre className="mt-3 overflow-x-auto rounded-xl bg-gray-900 p-4 text-xs text-gray-100">
                            {exercise.starter_code}
                        </pre>
                    </div>
                )}
            </aside>
        </div>
    );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function CodingExercisePage({ course, codingExercise, latestAttempt }) {
    const [showResult, setShowResult] = useState(!!latestAttempt);

    const { data, setData, post, processing, reset } = useForm({
        submission_code: latestAttempt?.submission_code ?? codingExercise.starter_code ?? '',
    });

    const handleRetry = () => {
        setShowResult(false);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('student.assessment.coding-exercise.store', [course.id, codingExercise.id]), {
            onSuccess: () => setShowResult(true),
        });
    };

    return (
        <StudentLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {codingExercise.title}
                </h2>
            }
        >
            <Head title={codingExercise.title} />

            <div className="py-12">
                <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* Exercise header */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-700">
                        <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            {course.title}
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                            {codingExercise.title}
                        </h3>
                        {codingExercise.description && (
                            <p className="mt-3 text-gray-700 dark:text-gray-200">
                                {codingExercise.description}
                            </p>
                        )}
                        <div className="mt-4 flex gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <span>{codingExercise.difficulty_level}</span>
                            <span>·</span>
                            <span>{codingExercise.points} points</span>
                            <span>·</span>
                            <span>{codingExercise.test_cases?.length ?? 0} checks</span>
                        </div>
                    </div>

                    {showResult && latestAttempt ? (
                        <ResultPanel
                            attempt={latestAttempt}
                            exercise={codingExercise}
                            course={course}
                            onRetry={handleRetry}
                        />
                    ) : (
                        <ExerciseForm
                            exercise={codingExercise}
                            processing={processing}
                            data={data}
                            setData={setData}
                            submit={submit}
                        />
                    )}
                </div>
            </div>
        </StudentLayout>
    );
}
