import AdministratorLayout from '@/Layouts/AdministratorLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import RichTextEditor from '@/Components/RichTextEditor';
import PrimaryButton from '@/Components/ui/PrimaryButton';

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
        const updated = [...data.questions];

        updated[qIndex].options.push({
            id: crypto.randomUUID(),
            type,
            value: '',
            file: null,
            url: ''
        });

        setData('questions', updated);
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
        const updated = [...data.questions];

        updated[qIndex].options[oIndex].file = file;
        updated[qIndex].options[oIndex].url = URL.createObjectURL(file);

        setData('questions', updated);
    };

    const submit = (e) => {
        e.preventDefault();

        put(route('admin.quizzes.update', quiz.id), data, {
            forceFormData: true,
        });
    };

    return (
        <AdministratorLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        Edit Quiz
                    </h2>

                    <Link
                        href={route('admin.quizzes.index')}
                        className="rounded-lg border px-4 py-2 text-sm"
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
                            className="w-full border p-2 rounded"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                        />

                        {/* DESCRIPTION */}
                        <textarea
                            className="w-full border p-2 rounded"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        />

                        {/* TOPIC */}
                        <select
                            className="w-full border p-2 rounded"
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

                            <h3 className="font-bold">Questions</h3>

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

                        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                            <div className="font-semibold">
                                Total Quiz Points: {totalPoints}
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </AdministratorLayout>
    );
}