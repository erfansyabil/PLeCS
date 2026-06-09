import AdministratorLayout from '@/Layouts/AdministratorLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect } from 'react';

export default function Create({ topics = [] }) {
    const { data, setData, transform, post, processing, errors } = useForm({
        title: '',
        description: '',
        topic_id: topics[0]?.id ?? '',
        difficulty_level: 'Beginner',
        points: 10,
        questions: [
            {
                question: '',
                options: ['', '', '', ''],
                correct_index: 0,
                points: 10,
            }
        ],
        questions_json: '',
        is_published: false,
    });

    // 2. Add a new question block
    const addQuestion = () => {
        setData('questions', [
            ...data.questions,
            { question: '', options: ['', '', '', ''], correct_index: 0, points: 10 }
        ]);
    };

    // 3. Remove a question block
    const removeQuestion = (qIndex) => {
        const updated = data.questions.filter((_, index) => index !== qIndex);
        setData('questions', updated);
    };

    // 4. Update specific text fields inside a question
    const handleQuestionChange = (index, field, value) => {
        const updated = [...data.questions];
        updated[index][field] = value;
        setData('questions', updated);
    };

    // 5. Update a specific multiple-choice option
    const handleOptionChange = (qIndex, oIndex, value) => {
        const updated = [...data.questions];
        updated[qIndex].options[oIndex] = value;
        setData('questions', updated);
    };

    const submit = (e) => {
        e.preventDefault();
        
        transform((data) => ({
        ...data,
        questions_json: JSON.stringify(data.questions),
        }));

        // Inertia post accepts custom data payload overrides directly
        post(route('admin.quizzes.store'));
    }

    // Group topics by course_title for <optgroup> display
    const grouped = topics.reduce((acc, topic) => {
        const key = topic.course_title ?? 'Uncategorised';
        if (!acc[key]) acc[key] = [];
        acc[key].push(topic);
        return acc;
    }, {});

    return (
        <AdministratorLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Create Quiz</h2>
                    <Link
                        href={route('admin.quizzes.index')}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        Back
                    </Link>
                </div>
            }
        >
            <Head title="Create Quiz" />
            <div className="py-12">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-600">

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Title</label>
                            <input
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            />
                            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows="3"
                                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            />
                        </div>

                        <div className="grid gap-2 md:grid-cols-2">
                            {/* Course List */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Course</label>
                                <select
                                    value={data.course_id}
                                    onChange={(e) => setData('course_id', e.target.value)}
                                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                >
                                    <option value="">Select a Course</option>
                                    {Object.keys(grouped).map((courseTitle) => (
                                        <option key={courseTitle} value={courseTitle}>
                                            {courseTitle}
                                        </option>
                                    ))}
                                </select>
                                {errors.course_id && <p className="mt-1 text-sm text-red-600">{errors.course_id}</p>}
                            </div>

                            {/* Topic List */}            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Topic</label>
                                <select
                                    value={data.topic_id}
                                    onChange={(e) => setData('topic_id', e.target.value)}
                                    disabled={!data.course_id} // Disabled until a course is picked
                                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                >
                                    {!data.course_id ? (
                                        <option value="">Please select a course first</option>
                                    ) : !grouped[data.course_id] || grouped[data.course_id].length === 0 ? (
                                        <option value="" disabled>No topics available</option>
                                    ) : (
                                        <>
                                            <option value="">Select a Topic</option>
                                            {grouped[data.course_id].map((topic) => (
                                                <option key={topic.id} value={topic.id}>
                                                    {topic.name}
                                                </option>
                                            ))}
                                        </>
                                    )}
                                </select>
                                {errors.topic_id && <p className="mt-1 text-sm text-red-600">{errors.topic_id}</p>}
                            </div>
                        </div>

                        <div className="grid gap-2 md:grid-cols-2">
                            {/* Difficulty */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Difficulty</label>
                                <select
                                    value={data.difficulty_level}
                                    onChange={(e) => setData('difficulty_level', e.target.value)}
                                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>

                            {/* Points */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Points</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={data.points}
                                    onChange={(e) => setData('points', e.target.value)}
                                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>
                        </div>

                        {/* VISUAL QUESTION BUILDER SECTION */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Quiz Questions</h3>
                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="rounded-lg bg-green-600 px-4 py-2 text-xs font-medium text-white hover:bg-green-700"
                                >
                                    + Add Question
                                </button>
                            </div>

                            {errors.questions_json && <p className="mb-4 text-sm text-red-600 font-medium">{errors.questions_json}</p>}

                            <div className="space-y-6">
                                {data.questions.map((q, qIndex) => (
                                    <div key={qIndex} className="p-5 rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50 space-y-4 relative">
                                        
                                        {/* Remove Button */}
                                        {data.questions.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeQuestion(qIndex)}
                                                className="absolute top-4 right-4 text-sm text-red-500 hover:text-red-700 font-medium"
                                            >
                                                Remove
                                            </button>
                                        )}

                                        <span className="inline-block text-xs font-bold text-blue-600 uppercase tracking-wide">
                                            Question {qIndex + 1}
                                        </span>

                                        {/* Question Text Input */}
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Enter your question text here..."
                                                value={q.question}
                                                onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 font-medium"
                                                required
                                            />
                                        </div>

                                        {/* Options Grid */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Answer Options</label>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {q.options.map((option, oIndex) => (
                                                    <div key={oIndex} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
                                                        <input
                                                            type="radio"
                                                            name={`correct-answer-${qIndex}`}
                                                            checked={q.correct_index === oIndex}
                                                            onChange={() => handleQuestionChange(qIndex, 'correct_index', oIndex)}
                                                            className="text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder={`Option ${oIndex + 1}`}
                                                            value={option}
                                                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                            className="w-full border-0 p-1 text-sm bg-transparent focus:ring-0 dark:text-gray-200"
                                                            required
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-400 italic mt-1">Select the radio bullet to mark which answer option is correct.</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <hr className="border-gray-200 dark:border-gray-700" />

                        {/* Publish */}
                        <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                            <input
                                type="checkbox"
                                checked={data.is_published}
                                onChange={(e) => setData('is_published', e.target.checked)}
                            />
                            Publish immediately
                        </label>

                        <button
                            disabled={processing}
                            type="submit"
                            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? 'Creating...' : 'Create quiz'}
                        </button>
                    </form>
                </div>
            </div>
        </AdministratorLayout>
    );
}