import AdministratorLayout from '@/Layouts/AdministratorLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import RichTextEditor from '@/Components/RichTextEditor';

const inputCls = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30';
const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5';

export default function Create({ topics = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        course_id: '',
        topic_id: topics[0]?.id ?? '',
        difficulty_level: 'Beginner',
        is_published: false,
        points: 10,
        questions: [
            {
                id: crypto.randomUUID(),
                type: 'mcq',
                question: '',
                image: null,
                options: [
                    { id: crypto.randomUUID(), type: 'text', value: '' },
                    { id: crypto.randomUUID(), type: 'text', value: '' },
                ],
                correct_option_id: null,
                points: 10,
            }
        ],
    });

    const courses = [...new Map(
        topics.map(t => [t.course_id, t.course_title])
    ).entries()];

    const totalPoints = data.questions.reduce((sum, q) => sum + Number(q.points || 0), 0);

    const addQuestion = () => {
        setData('questions', [
            ...data.questions,
            {
                id: crypto.randomUUID(),
                type: 'mcq',
                question: '',
                image: null,
                options: [
                    { id: crypto.randomUUID(), type: 'text', value: '', file: null, url: '' },
                    { id: crypto.randomUUID(), type: 'text', value: '', file: null, url: '' },
                ],
                correct_option_id: null,
                points: 10,
            }
        ]);
    };

    const removeQuestion = (qIndex) => {
        const updated = [...data.questions];
        updated.splice(qIndex, 1);
        setData('questions', updated);
    };

    const handleQuestionChange = (qIndex, field, value) => {
        const updated = [...data.questions];
        updated[qIndex][field] = value;
        setData('questions', updated);
    };

    const addOption = (qIndex, type = 'text') => {
        const updated = [...data.questions];
        updated[qIndex].options.push({ id: crypto.randomUUID(), type, value: '', file: null, url: '' });
        setData('questions', updated);
    };

    const removeOption = (qIndex, oIndex) => {
        const updated = [...data.questions];
        const removed = updated[qIndex].options.splice(oIndex, 1);
        if (removed[0]?.id === updated[qIndex].correct_option_id) {
            updated[qIndex].correct_option_id = null;
        }
        setData('questions', updated);
    };

    const handleOptionImage = (qIndex, oIndex, file) => {
        const updated = [...data.questions];
        updated[qIndex].options[oIndex].file = file;
        updated[qIndex].options[oIndex].url = URL.createObjectURL(file);
        setData('questions', updated);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.quizzes.store'), { ...data, points: totalPoints, forceFormData: true });
    };

    return (
        <AdministratorLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Create Quiz</h2>
                        <p className="mt-0.5 text-sm text-slate-500">Build a new quiz with questions and options</p>
                    </div>
                    <Link
                        href={route('admin.quizzes.index')}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        Back
                    </Link>
                </div>
            }
        >
            <Head title="Create Quiz" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl px-4">
                    <form onSubmit={submit} className="space-y-6">

                        {/* Basic info card */}
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quiz Details</h3>

                            <div>
                                <label className={labelCls}>Quiz Title</label>
                                <input
                                    className={inputCls}
                                    placeholder="e.g. Python Basics Quiz"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                />
                                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                            </div>

                            <div>
                                <label className={labelCls}>Description</label>
                                <textarea
                                    className={inputCls}
                                    rows={3}
                                    placeholder="Brief description of this quiz..."
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <label className={labelCls}>Course</label>
                                    <select
                                        value={data.course_id}
                                        onChange={(e) => { setData('course_id', e.target.value); setData('topic_id', ''); }}
                                        className={inputCls}
                                    >
                                        <option value="">Select Course</option>
                                        {courses.map(([id, title]) => (
                                            <option key={id} value={id}>{title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={labelCls}>Topic</label>
                                    <select
                                        value={data.topic_id}
                                        onChange={(e) => setData('topic_id', e.target.value)}
                                        disabled={!data.course_id}
                                        className={inputCls + ' disabled:bg-slate-50 disabled:text-slate-400'}
                                    >
                                        <option value="">Select Topic</option>
                                        {topics
                                            .filter(t => t.course_id === Number(data.course_id))
                                            .map(topic => (
                                                <option key={topic.id} value={topic.id}>{topic.name}</option>
                                            ))
                                        }
                                    </select>
                                </div>

                                <div>
                                    <label className={labelCls}>Difficulty</label>
                                    <select
                                        value={data.difficulty_level}
                                        onChange={(e) => setData('difficulty_level', e.target.value)}
                                        className={inputCls}
                                    >
                                        <option>Beginner</option>
                                        <option>Intermediate</option>
                                        <option>Advanced</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-3 pt-6">
                                    <label className="relative inline-flex cursor-pointer items-center">
                                        <input
                                            type="checkbox"
                                            className="peer sr-only"
                                            checked={data.is_published}
                                            onChange={(e) => setData('is_published', e.target.checked)}
                                        />
                                        <div className="h-5 w-9 rounded-full bg-slate-200 peer-checked:bg-indigo-600 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:after:translate-x-4" />
                                        <span className="ml-3 text-sm font-medium text-slate-700">Publish immediately</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Questions */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-slate-700">
                                    Questions
                                    <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">{data.questions.length}</span>
                                </h3>
                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-300 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Question
                                </button>
                            </div>

                            {data.questions.map((q, qIndex) => (
                                <div key={q.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                                            {qIndex + 1}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeQuestion(qIndex)}
                                            className="text-sm font-medium text-red-500 hover:text-red-700"
                                        >
                                            Remove
                                        </button>
                                    </div>

                                    <div>
                                        <label className={labelCls}>Question</label>
                                        <RichTextEditor
                                            value={q.question}
                                            onChange={(val) => handleQuestionChange(qIndex, 'question', val)}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelCls}>Points</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={q.points}
                                            onChange={(e) => handleQuestionChange(qIndex, 'points', Number(e.target.value))}
                                            className={inputCls + ' w-28'}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelCls}>Answer Options</label>
                                        <div className="space-y-2">
                                            {q.options.map((opt, oIndex) => (
                                                <div key={opt.id} className={`flex items-center gap-3 rounded-lg border p-3 ${q.correct_option_id === opt.id ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                                                    <input
                                                        type="radio"
                                                        className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                        checked={q.correct_option_id === opt.id}
                                                        onChange={() => handleQuestionChange(qIndex, 'correct_option_id', opt.id)}
                                                    />

                                                    {opt.type === 'text' && (
                                                        <input
                                                            className="flex-1 rounded border border-slate-300 bg-white px-2 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
                                                            value={opt.value}
                                                            onChange={(e) => {
                                                                const updated = [...data.questions];
                                                                updated[qIndex].options[oIndex].value = e.target.value;
                                                                setData('questions', updated);
                                                            }}
                                                            placeholder={`Option ${oIndex + 1}`}
                                                        />
                                                    )}

                                                    {opt.type === 'image' && (
                                                        <div className="flex flex-col gap-2">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="text-sm"
                                                                onChange={(e) => handleOptionImage(qIndex, oIndex, e.target.files[0])}
                                                            />
                                                            {opt.url && (
                                                                <img src={opt.url} className="h-20 w-20 rounded object-cover border border-slate-200" alt="" />
                                                            )}
                                                        </div>
                                                    )}

                                                    {q.correct_option_id === opt.id && (
                                                        <span className="shrink-0 text-xs font-semibold text-emerald-600">✓ Correct</span>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() => removeOption(qIndex, oIndex)}
                                                        className="ml-auto shrink-0 text-slate-400 hover:text-red-500"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-2 flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => addOption(qIndex, 'text')}
                                                className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                            >
                                                + Text option
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => addOption(qIndex, 'image')}
                                                className="text-sm font-medium text-violet-600 hover:text-violet-800"
                                            >
                                                + Image option
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="text-sm text-slate-600">
                                Total points: <span className="font-bold text-indigo-700">{totalPoints}</span>
                            </div>
                            <div className="flex gap-3">
                                <Link
                                    href={route('admin.quizzes.index')}
                                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {processing ? 'Saving…' : 'Create Quiz'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AdministratorLayout>
    );
}
