import AdministratorLayout from '@/Layouts/AdministratorLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const sampleQuestions = JSON.stringify(
    [
        {
            question: 'What does HTML stand for?',
            options: ['HyperText Markup Language', 'High Transfer Machine Language', 'Home Tool Markup Language', 'Hyperlink Markup Logic'],
            correct_index: 0,
            points: 10,
        },
    ],
    null,
    2,
);

export default function Create({ topics = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        topic_id: topics[0]?.id ?? '',
        difficulty_level: 'Beginner',
        points: 10,
        questions_json: sampleQuestions,
        is_published: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.quizzes.store'));
    };

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

                        <div className="grid gap-4 md:grid-cols-3">
                            {/* course list */}
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

                            {/* topic list */}            
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

                        {/* Questions JSON */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Questions JSON</label>
                            <textarea
                                value={data.questions_json}
                                onChange={(e) => setData('questions_json', e.target.value)}
                                rows="14"
                                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            />
                            {errors.questions_json && <p className="mt-1 text-sm text-red-600">{errors.questions_json}</p>}
                        </div>

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