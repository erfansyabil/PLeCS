import StudentLayout from '@/Layouts/StudentLayout';
import { Head, useForm } from '@inertiajs/react';

export default function QuizPage({ course, quiz, latestAttempt }) {
    const { data, setData, post, processing, errors } = useForm({
        answers: {},
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('student.assessment.quiz.store', [course.id, quiz.id]));
    };

    return (
        <StudentLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {quiz.title}
                </h2>
            }
        >
            <Head title={quiz.title} />

            <div className="py-12">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-600">
                        <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-300">{course.title}</p>
                        <h3 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{quiz.title}</h3>
                        <p className="mt-3 text-gray-700 dark:text-gray-200">{quiz.description ?? 'No description provided.'}</p>
                        <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-300">
                            <span>{quiz.difficulty_level}</span>
                            <span>{quiz.points} points</span>
                        </div>
                    </div>

                    {latestAttempt && (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-100">
                            <p className="font-semibold">Latest result</p>
                            <p className="mt-1 text-sm">Score: {latestAttempt.score} / {latestAttempt.max_score}</p>
                            <p className="text-sm">Status: {latestAttempt.passed ? 'Passed' : 'Needs another attempt'}</p>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-600">
                        {quiz.questions.map((question, index) => (
                            <fieldset key={index} className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
                                <legend className="px-2 text-base font-medium text-gray-900 dark:text-white">
                                    {index + 1}. {question.question}
                                </legend>
                                <div className="mt-4 space-y-3">
                                    {(question.options ?? []).map((option, optionIndex) => (
                                        <label key={optionIndex} className="flex items-start gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 transition hover:border-blue-400 dark:border-gray-700 dark:text-gray-200">
                                            <input
                                                type="radio"
                                                name={`question-${index}`}
                                                value={optionIndex}
                                                checked={String(data.answers[index] ?? '') === String(optionIndex)}
                                                onChange={() => setData('answers', { ...data.answers, [index]: optionIndex })}
                                                className="mt-1"
                                            />
                                            <span>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                        ))}

                        {errors.answers && <p className="text-sm text-red-600">{errors.answers}</p>}

                        <button type="submit" disabled={processing} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50">
                            {processing ? 'Submitting...' : 'Submit quiz'}
                        </button>
                    </form>

                    {!quiz.questions.length && (
                        <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-sm text-gray-500 dark:border-gray-600 dark:text-gray-300">
                            This quiz does not have any questions yet.
                        </div>
                    )}
                </div>
            </div>
        </StudentLayout>
    );
}

