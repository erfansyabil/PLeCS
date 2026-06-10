import AdministratorLayout from '@/Layouts/AdministratorLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import RichTextEditor from '@/Components/RichTextEditor';
import PrimaryButton from '@/Components/ui/PrimaryButton';

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

    const totalPoints = data.questions.reduce(
    (sum, q) => sum + Number(q.points || 0),
        0
    );
    
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

        updated[qIndex].options.push({
            id: crypto.randomUUID(),
            type: type, // MUST be image
            value: '',
            file: null,
            url: ''
        });

        setData('questions', updated);
    };

    const removeOption = (qIndex, oIndex) => {
        const updated = [...data.questions];
        const removed = updated[qIndex].options.splice(oIndex, 1);

        // reset correct answer if deleted option was correct
        if (removed[0]?.id === updated[qIndex].correct_option_id) {
            updated[qIndex].correct_option_id = null;
        }

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
        updated[qIndex].options[oIndex].url = URL.createObjectURL(file); // preview

        setData('questions', updated);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.quizzes.store'),  {
            ...data, 
            points:totalPoints,
            forceFormData: true,
        });
    };

    return (
        <AdministratorLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        Create Quiz
                    </h2>

                    <PrimaryButton
                        variant="secondary"
                        size="md"
                        href={route('admin.quizzes.index')}
                    >
                        Back
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Create Quiz" />

            <div className="py-10">
                <div className="mx-auto max-w-5xl px-4">

                    <form onSubmit={submit} className="space-y-6">

                        {/* Title */}
                        <input
                            className="w-full border p-2 rounded"
                            placeholder="Quiz Title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                        />

                        {/* Description */}
                        <textarea
                            className="w-full border p-2 rounded"
                            placeholder="Description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        />

                        {/* Course */}
                        <div>
                            <label className="block text-sm font-medium">Course</label>

                            <select
                                value={data.course_id}
                                onChange={(e) => {
                                    setData('course_id', e.target.value);
                                    setData('topic_id', '');
                                }}
                                className="w-full border p-2 rounded"
                            >
                                <option value="">Select Course</option>

                                {courses.map(([id, title]) => (
                                    <option key={id} value={id}>
                                        {title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Topic */}
                        <div>
                            <label className="block text-sm font-medium">Topic</label>

                            <select
                                value={data.topic_id}
                                onChange={(e) => setData('topic_id', e.target.value)}
                                disabled={!data.course_id}
                                className="w-full border p-2 rounded"
                            >
                                <option value="">Select Topic</option>

                                {topics
                                    .filter(t => t.course_id === Number(data.course_id))
                                    .map(topic => (
                                        <option key={topic.id} value={topic.id}>
                                            {topic.name}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>

                        {/* Questions */}
                        <div className="space-y-6">
                            <div className="flex justify-between">
                                <h3 className="font-bold">Questions</h3>

                                <PrimaryButton
                                    type="button"
                                    variant="secondary"
                                    size="md"
                                    onClick={addQuestion}
                                >
                                    + Add Question
                                </PrimaryButton>
                            </div>

                            {data.questions.map((q, qIndex) => (
                                <div key={q.id} className="border p-4 rounded space-y-4">

                                    {/* Remove Question */}
                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(qIndex)}
                                        className="text-red-500 text-sm"
                                    >
                                        Remove Question
                                    </button>

                                    {/* Rich Text Question */}
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

                                    {/* Options */}
                                    <div className="space-y-2">
                                        {q.options.map((opt, oIndex) => (
                                        <div key={opt.id} className="flex gap-2 items-center border p-2 rounded">

                                            {/* Correct answer */}
                                            <input
                                                type="radio"
                                                checked={q.correct_option_id === opt.id}
                                                onChange={() =>
                                                    handleQuestionChange(qIndex, 'correct_option_id', opt.id)
                                                }
                                            />

                                            {/* TEXT OPTION */}
                                            {opt.type === 'text' && (
                                                <input
                                                    className="border p-1 flex-1"
                                                    value={opt.value}
                                                    onChange={(e) => {
                                                        const updated = [...data.questions];
                                                        updated[qIndex].options[oIndex].value = e.target.value;
                                                        setData('questions', updated);
                                                    }}
                                                    placeholder="Text option"
                                                />
                                            )}

                                            {/* IMAGE OPTION */}
                                            {opt.type === 'image' && (
                                                <div className="flex flex-col gap-2">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) =>
                                                            handleOptionImage(qIndex, oIndex, e.target.files[0])
                                                        }
                                                    />

                                                    {opt.url && (
                                                        <img
                                                            src={opt.url}
                                                            className="w-24 h-24 object-cover rounded border"
                                                        />
                                                    )}
                                                </div>
                                            )}

                                            {/* DELETE */}
                                            <button
                                                type="button"
                                                onClick={() => removeOption(qIndex, oIndex)}
                                                className="text-red-500"
                                            >
                                                X
                                            </button>
                                        </div>
                                    ))}
                                    </div>

                                    {/* Add Option */}
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            type="button"
                                            onClick={() => addOption(qIndex, 'text')}
                                            className="text-blue-600 text-sm"
                                        >
                                            + Text Option
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => addOption(qIndex, 'image')}
                                            className="text-purple-600 text-sm"
                                        >
                                            + Image Option
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Publish */}
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={data.is_published}
                                onChange={(e) =>
                                    setData('is_published', e.target.checked)
                                }
                            />
                            Publish
                        </label>

                        {/* Submit */}
                        <PrimaryButton
                            type="submit"
                            disabled={processing}
                            size="md"
                            variant="primary"
                        >
                            {processing ? 'Saving...' : 'Create Quiz'}
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