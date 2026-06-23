import AdministratorLayout from '@/Layouts/AdministratorLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

const emptyTestCase = () => ({ label: '', must_contain: [''], points: 10 });

const inputClass =
    'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30';
const labelClass = 'block text-sm font-medium text-slate-700';

export default function Create({ courses = [] }) {
    const [testCases, setTestCases] = useState([emptyTestCase()]);

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        course_id: courses[0]?.id ?? '',
        difficulty_level: 'Beginner',
        instructions: '',
        starter_code: '',
        is_published: false,
        points: emptyTestCase().points,
        test_cases_json: JSON.stringify([{ label: '', must_contain: [], points: 10 }]),
    });

    // Keep useForm data in sync whenever testCases changes
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
        const updated = testCases.map((tc, idx) => (idx === i ? { ...tc, [field]: value } : tc));
        applyTestCases(updated);
    };

    const addSnippet = (i) => {
        const updated = testCases.map((tc, idx) =>
            idx === i ? { ...tc, must_contain: [...tc.must_contain, ''] } : tc,
        );
        applyTestCases(updated);
    };

    const removeSnippet = (tcIdx, sIdx) => {
        const updated = testCases.map((tc, idx) =>
            idx === tcIdx
                ? { ...tc, must_contain: tc.must_contain.filter((_, si) => si !== sIdx) }
                : tc,
        );
        applyTestCases(updated);
    };

    const updateSnippet = (tcIdx, sIdx, value) => {
        const updated = testCases.map((tc, idx) => {
            if (idx !== tcIdx) return tc;
            const snippets = [...tc.must_contain];
            snippets[sIdx] = value;
            return { ...tc, must_contain: snippets };
        });
        applyTestCases(updated);
    };

    const totalPoints = testCases.reduce((sum, tc) => sum + (Number(tc.points) || 0), 0);

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.coding-exercises.store'));
    };

    return (
        <AdministratorLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Create Coding Exercise</h2>
                        <p className="mt-0.5 text-sm text-slate-500">Add a new coding challenge for students</p>
                    </div>
                    <Link
                        href={route('admin.coding-exercises.index')}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        Back
                    </Link>
                </div>
            }
        >
            <Head title="Create Coding Exercise" />

            <div className="py-8">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="space-y-6">

                        {/* ── Basic info ── */}
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Basic Info
                            </h3>

                            <div>
                                <label className={labelClass}>Title</label>
                                <input
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g. Write a Loop in Python"
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
                                    <div className="mt-1 flex h-9 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
                                        {totalPoints} pts (from test cases)
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Instructions & starter code ── */}
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Content
                            </h3>

                            <div>
                                <label className={labelClass}>Instructions</label>
                                <textarea
                                    value={data.instructions}
                                    onChange={(e) => setData('instructions', e.target.value)}
                                    rows={6}
                                    placeholder="Describe what the student must write..."
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
                                    placeholder="# starter code shown to students"
                                    className={`${inputClass} font-mono`}
                                />
                            </div>
                        </div>

                        {/* ── Test cases ── */}
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Test Cases
                                </h3>
                                <button
                                    type="button"
                                    onClick={addTestCase}
                                    className="rounded-lg border border-indigo-300 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
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
                                        className="rounded-xl border border-slate-200 p-4 space-y-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-slate-700">
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
                                                <label className="text-xs font-medium text-slate-500">Label</label>
                                                <input
                                                    value={tc.label}
                                                    onChange={(e) => updateField(tcIdx, 'label', e.target.value)}
                                                    placeholder="e.g. Must use a for loop"
                                                    className={inputClass}
                                                />
                                            </div>
                                            <div className="sm:w-24">
                                                <label className="text-xs font-medium text-slate-500">Points</label>
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
                                            <label className="text-xs font-medium text-slate-500">
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
                                                            className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                                                        />
                                                        {tc.must_contain.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeSnippet(tcIdx, sIdx)}
                                                                className="rounded-lg px-2 text-slate-400 hover:text-red-500"
                                                            >
                                                                ×
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => addSnippet(tcIdx)}
                                                    className="mt-1 text-xs text-indigo-600 hover:underline"
                                                >
                                                    + Add snippet
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700">
                                Total exercise points: <span className="font-bold">{totalPoints}</span>
                            </div>
                        </div>

                        {/* ── Publish & submit ── */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
                            <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={data.is_published}
                                    onChange={(e) => setData('is_published', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                Publish immediately
                            </label>

                            <div className="flex gap-3">
                                <Link
                                    href={route('admin.coding-exercises.index')}
                                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {processing ? 'Creating…' : 'Create Exercise'}
                                </button>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </AdministratorLayout>
    );
}
