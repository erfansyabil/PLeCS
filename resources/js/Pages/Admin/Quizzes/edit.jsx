import AdministratorLayout from '@/Layouts/AdministratorLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import RichTextEditor from '@/Components/RichTextEditor';
import PrimaryButton from '@/Components/ui/PrimaryButton';
import { useState } from 'react';

export default function Edit({ quiz, topics = [] }) {

    const { data, setData, put, processing, errors } = useForm({
        title: quiz.title ?? '',
        description: quiz.description ?? '',
        topic_id: quiz.topic_id ?? topics[0]?.id ?? '',
        difficulty_level: quiz.difficulty_level ?? 'Beginner',
        points: quiz.points ?? 10,
        is_published: !!quiz.is_published,

        // IMPORTANT: decode questions array (NOT JSON TEXT)
        questions: quiz.questions ? JSON.parse(JSON.stringify(quiz.questions)) : [],
    });

    const totalPoints = (data.questions || []).reduce((sum, q) => {
        return sum + (parseInt(q.points ?? 0));
    }, 0);

    const addOption = (qIndex, type = 'text') => {
        console.log("ADDING OPTION TYPE:", type);
        const updated = [...data.questions];

        updated[qIndex].options.push({
            id: crypto.randomUUID(),
            type: type,
            value: '',
            file: null,
            url: type === 'image' ? '' : null,
        });

        setData('questions', updated);
    };

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

    const removeOption = (qIndex, oIndex) => {
        const updated = [...data.questions];
        updated[qIndex].options.splice(oIndex, 1);
        setData('questions', updated);
    };

    const handleQuestionChange = (qIndex, field, value) => {
        const updated = [...data.questions];
        updated[qIndex][field] = value;
        setData('questions', updated);
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const updated = [...data.questions];
        updated[qIndex].options[oIndex].value = value;
        setData('questions', updated);
    };

    const handleOptionImage = (qIndex, oIndex, file) => {
        const key = `${qIndex}-${oIndex}`;

        setFiles(prev => ({
            ...prev,
            [key]: file
        }));

        const updated = [...data.questions];

        updated[qIndex].options[oIndex].url = URL.createObjectURL(file);

        setData('questions', updated);
    };

    const [files, setFiles] = useState({});

    const submit = (e) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append('_method', 'PUT');

        formData.append('title', data.title);
        formData.append('description', data.description ?? '');
        formData.append('topic_id', data.topic_id);
        formData.append('difficulty_level', data.difficulty_level);
        formData.append('points', data.points ?? 0);
        formData.append('is_published', data.is_published ? 1 : 0);

        // ✅ STEP 1: clean questions (NO FILES inside JSON)
        const cleanQuestions = data.questions.map((q) => ({
            id: q.id,
            type: q.type,
            question: q.question,
            points: q.points,
            correct_option_id: q.correct_option_id,
            options: q.options.map((opt) => ({
                id: opt.id,
                type: opt.type,
                value: opt.value,
                url: opt.url ?? null,
            })),
        }));

        formData.append('questions', JSON.stringify(cleanQuestions));

        // ✅ STEP 2: attach ONLY real File objects
        data.questions.forEach((q, qIndex) => {
            q.options.forEach((opt, oIndex) => {
                if (opt.file instanceof File) {
                    formData.append(
                        `files[${qIndex}-${oIndex}]`,
                        opt.file
                    );
                }
            });
        });

        router.post(route('admin.quizzes.update', quiz.id), formData, {
            forceFormData: true,
        });
    };

    return (
        <AdministratorLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Edit Quiz</h2>
                        <p className="mt-0.5 text-sm text-slate-500">{quiz.title}</p>
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
            <Head title="Edit Quiz" />

            <div className="py-10">
                <div className="mx-auto max-w-5xl px-4">

                    <form onSubmit={submit} className="space-y-6">

                        {/* TITLE */}
                        <input
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                        />

                        {/* DESCRIPTION */}
                        <textarea
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        />

                        {/* TOPIC */}
                        <select
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                            value={data.topic_id}
                            onChange={(e) => setData('topic_id', e.target.value)}
                        >
                            {topics.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>

                        {/* QUESTIONS */}
                        <div className="space-y-6">

                            <div className="flex justify-between items-center">
                                <h3 className="font-bold">Questions</h3>

                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="text-sm px-3 py-1 bg-blue-600 text-white rounded"
                                >
                                    + Add Question
                                </button>
                            </div>

                            {data.questions.map((q, qIndex) => (
                                <div key={q.id} className="border p-4 rounded space-y-4">

                                    {/* QUESTION */}
                                    <RichTextEditor
                                        value={q.question}
                                        onChange={(val) =>
                                            handleQuestionChange(qIndex, 'question', val)
                                        }
                                    />

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Points for this question
                                        </label>

                                        <input
                                            type="number"
                                            min="1"
                                            value={q.points}
                                            onChange={(e) =>
                                                handleQuestionChange(
                                                    qIndex,
                                                    'points',
                                                    Number(e.target.value)
                                                )
                                            }
                                            className="border rounded p-2 w-32"
                                        />
                                    </div>

                                    {/* OPTIONS */}
                                    <div className="space-y-2">

                                        {q.options?.map((opt, oIndex) => {

                                            const isCorrect =
                                                q.correct_option_id === opt.id;

                                            return (
                                                <div
                                                    key={opt.id}
                                                    className={`flex gap-2 items-center border p-2 rounded
                                                        ${isCorrect ? 'bg-green-100' : ''}`}
                                                >

                                                    {/* correct selector */}
                                                    <input
                                                        type="radio"
                                                        checked={isCorrect}
                                                        onChange={() =>
                                                            handleQuestionChange(
                                                                qIndex,
                                                                'correct_option_id',
                                                                opt.id
                                                            )
                                                        }
                                                    />

                                                    {/* TEXT OPTION */}
                                                    {opt.type === 'text' && (
                                                        <input
                                                            className="border p-1 flex-1"
                                                            value={opt.value}
                                                            onChange={(e) =>
                                                                handleOptionChange(
                                                                    qIndex,
                                                                    oIndex,
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    )}

                                                    {/* IMAGE OPTION */}
                                                    {opt.type === 'image' && (
                                                        <div className="flex flex-col gap-2">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) =>
                                                                    handleOptionImage(
                                                                        qIndex,
                                                                        oIndex,
                                                                        e.target.files[0]
                                                                    )
                                                                }
                                                            />

                                                            {opt.url && (
                                                                <img
                                                                    src={opt.url}
                                                                    className="w-20 h-20 object-cover rounded"
                                                                />
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* DELETE */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeOption(qIndex, oIndex)
                                                        }
                                                        className="text-red-500"
                                                    >
                                                        X
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* ADD OPTIONS */}
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                addOption(qIndex, 'text')
                                            }
                                        >
                                            + Text
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                addOption(qIndex, 'image')
                                            }
                                        >
                                            + Image
                                        </button>
                                    </div>

                                </div>
                            ))}
                        </div>

                        {/* SUBMIT */}
                        <PrimaryButton
                            type="submit"
                            size="md"
                            variant="primary"
                        >
                            Save Quiz
                        </PrimaryButton>

                        <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700">
                            Total quiz points: <span className="font-bold">{totalPoints}</span>
                        </div>

                    </form>
                </div>
            </div>
        </AdministratorLayout>
    );
}