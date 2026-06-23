import AdministratorLayout from '@/Layouts/AdministratorLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

const emptyTestCase = () => ({ label: '', must_contain: [''], points: 10 });

const inputClass =
    'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30';
const labelClass = 'block text-sm font-medium text-slate-700';

function parseTestCases(json) {
    try {
        const parsed = JSON.parse(json || '[]');
        if (!Array.isArray(parsed) || parsed.length === 0) return [emptyTestCase()];
        return parsed.map((tc) => ({
            label: tc.label ?? '',
            must_contain: Array.isArray(tc.must_contain) && tc.must_contain.length > 0
                ? tc.must_contain
                : [''],
            points: Number(tc.points) || 10,
        }));
    } catch {
        return [emptyTestCase()];
    }
}

export default function Edit({ codingExercise, courses = [] }) {
    const [testCases, setTestCases] = useState(() => parseTestCases(codingExercise.test_cases_json));

    const { data, setData, put, processing, errors } = useForm({
        title:            codingExercise.title ?? '',
        description:      codingExercise.description ?? '',
        course_id:        codingExercise.course_id ?? courses[0]?.id ?? '',
        difficulty_level: codingExercise.difficulty_level ?? 'Beginner',
        instructions:     codingExercise.instructions ?? '',
        starter_code:     codingExercise.starter_code ?? '',
        is_published:     !!codingExercise.is_published,
        points:           codingExercise.points ?? 10,
        test_cases_json:  codingExercise.test_cases_json ?? '[]',
    });

    const applyTestCases = (newTcs) => {
        setTestCases(newTcs);
        const clean = newTcs.map((tc) => ({
            label: tc.label,
            must_contain: tc.must_contain.filter((s) => s.trim()),
            points: Number(tc.points) || 1,
        }));
        setData('test_cases_json', JSON.stringify(clean));
        setData('points', Math.max(1, clean.reduce((sum, tc) => sum + tc.points, 0)));
    };

    const addTestCase = () => applyTestCases([...testCases, emptyTestCase()]);

    const removeTestCase = (i) => applyTestCases(testCases.filter((_, idx) => idx !== i));

    const updateField = (i, field, value) => {
        applyTestCases(testCases.map((tc, idx) => (idx === i ? { ...tc, [field]: value } : tc)));
    };

    const addSnippet = (i) => {
        applyTestCases(
            testCases.map((tc, idx) =>
                idx === i ? { ...tc, must_contain: [...tc.must_contain, ''] } : tc,
            ),
        );
    };

    const removeSnippet = (tcIdx, sIdx) => {
        applyTestCases(
            testCases.map((tc, idx) =>
                idx === tcIdx
                    ? { ...tc, must_contain: tc.must_contain.filter((_, si) => si !== sIdx) }
                    : tc,
            ),
        );
    };

    const updateSnippet = (tcIdx, sIdx, value) => {
        applyTestCases(
            testCases.map((tc, idx) => {
                if (idx !== tcIdx) return tc;
                const snippets = [...tc.must_contain];
                snippets[sIdx] = value;
                return { ...tc, must_contain: snippets };
            }),
        );
    };

    const totalPoints = testCases.reduce((sum, tc) => sum + (Number(tc.points) || 0), 0);

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.coding-exercises.update', codingExercise.id));
    };

    return (
        <AdministratorLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Edit Coding Exercise</h2>
                        <p className="mt-0.5 text-sm text-slate-500">{codingExercise.title}</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href={route('admin.coding-exercises.show', codingExercise.id)}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            View
                        </Link>
                        <Link
                            href={route('admin.coding-exercises.index')}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Back
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Edit — ${codingExercise.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="space-y-6">

                        {/* ── Basic info ── */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-700 space-y-5">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Basic Info
                            </h3>

                            <div>
                                <label className={labelClass}>Title</label>
                                <input
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className={inputClass}
                                />
                                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                            </div>

                            <div>
                                <label className={labelClass}>Description <span className="font-normal text-gray-400">(optional)</span></label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={2}
                                    className={inputClass}
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <label className={labelClass}>Course</label>
                                    <select
                                        value={data.course_id}
                                        onChange={(e) => setData('course_id', e.target.value)}
                                        className={inputClass}
                                    >
                                        {courses.map((c) => (
                                            <option key={c.id} value={c.id}>{c.title}</option>
                                        ))}
                                    </select>
                                    {errors.course_id && <p className="mt-1 text-xs text-red-600">{errors.course_id}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Difficulty</label>
                                    <select
                                        value={data.difficulty_level}
                                        onChange={(e) => setData('difficulty_level', e.target.value)}
                                        className={inputClass}
                                    >
                                        <option>Beginner</option>
                                        <option>Intermediate</option>
                                        <option>Advanced</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Total points</label>
                                    <div className="mt-1 flex h-9 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                        {totalPoints} pts (from test cases)
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Content ── */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-700 space-y-5">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Content
                            </h3>

                            <div>
                                <label className={labelClass}>Instructions</label>
                                <textarea
                                    value={data.instructions}
                                    onChange={(e) => setData('instructions', e.target.value)}
                                    rows={6}
                                    className={inputClass}
                                />
                                {errors.instructions && <p className="mt-1 text-xs text-red-600">{errors.instructions}</p>}
                            </div>

                            <div>
                                <label className={labelClass}>Starter code <span className="font-normal text-gray-400">(optional)</span></label>
                                <textarea
                                    value={data.starter_code}
                                    onChange={(e) => setData('starter_code', e.target.value)}
                                    rows={6}
                                    spellCheck={false}
                                    className={`${inputClass} font-mono`}
                                />
                            </div>
                        </div>

                        {/* ── Test cases ── */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-700 space-y-5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    Test Cases
                                </h3>
                                <button
                                    type="button"
                                    onClick={addTestCase}
                                    className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                                >
                                    + Add test case
                                </button>
                            </div>

                            {errors.test_cases_json && (
                                <p className="text-xs text-red-600">{errors.test_cases_json}</p>
                            )}

                            <div className="space-y-4">
                                {testCases.map((tc, tcIdx) => (
                                    <div
                                        key={tcIdx}
                                        className="rounded-xl border border-gray-200 p-4 dark:border-gray-600 space-y-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                Test Case {tcIdx + 1}
                                            </span>
                                            {testCases.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTestCase(tcIdx)}
                                                    className="text-xs text-red-500 hover:text-red-700"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Label</label>
                                                <input
                                                    value={tc.label}
                                                    onChange={(e) => updateField(tcIdx, 'label', e.target.value)}
                                                    placeholder="e.g. Must use a for loop"
                                                    className={inputClass}
                                                />
                                            </div>
                                            <div className="sm:w-24">
                                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Points</label>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={tc.points}
                                                    onChange={(e) => updateField(tcIdx, 'points', e.target.value)}
                                                    className={inputClass}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Required snippets{' '}
                                                <span className="font-normal">(submission must contain each, case-insensitive)</span>
                                            </label>
                                            <div className="mt-2 space-y-2">
                                                {tc.must_contain.map((snippet, sIdx) => (
                                                    <div key={sIdx} className="flex gap-2">
                                                        <input
                                                            value={snippet}
                                                            onChange={(e) => updateSnippet(tcIdx, sIdx, e.target.value)}
                                                            placeholder="e.g. for, print, return"
                                                            className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                                                        />
                                                        {tc.must_contain.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeSnippet(tcIdx, sIdx)}
                                                                className="rounded-lg px-2 text-gray-400 hover:text-red-500"
                                                            >
                                                                ×
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => addSnippet(tcIdx)}
                                                    className="mt-1 text-xs text-emerald-600 hover:underline dark:text-emerald-400"
                                                >
                                                    + Add snippet
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                Total exercise points: {totalPoints}
                            </div>
                        </div>

                        {/* ── Publish & submit ── */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-700 flex items-center justify-between">
                            <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                                <input
                                    type="checkbox"
                                    checked={data.is_published}
                                    onChange={(e) => setData('is_published', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                Published
                            </label>

                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Save exercise'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </AdministratorLayout>
    );
}
