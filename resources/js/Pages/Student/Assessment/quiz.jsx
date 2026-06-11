import StudentLayout from '@/Layouts/StudentLayout';
import { Head, useForm } from '@inertiajs/react';

export default function QuizPage({ course, quiz, latestAttempt }) {
    const { data, setData, post, processing, errors } = useForm({
        answers: {}, // { questionIndex: optionId }
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('student.assessment.quiz.store', {
            course: course.id,
            topic: quiz.topic_id,
            quiz: quiz.id,
        }));
    };

    const handleAnswer = (questionIndex, optionId) => {
        setData('answers', {
            ...data.answers,
            [questionIndex]: optionId,
        });
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
                <div className="mx-auto max-w-5xl px-4 space-y-6">

                    {/* QUIZ HEADER */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-600">
                        <p className="text-sm uppercase text-gray-500">{course.title}</p>
                        <h3 className="mt-2 text-2xl font-semibold">{quiz.title}</h3>
                        <p className="mt-3 text-gray-700 dark:text-gray-200">
                            {quiz.description ?? 'No description provided.'}
                        </p>
                        <div className="mt-4 flex gap-3 text-sm text-gray-500">
                            <span>{quiz.difficulty_level}</span>
                            <span>{quiz.points} points</span>
                        </div>
                    </div>

                    {/* QUESTIONS */}
                    <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-600">

                        {quiz.questions?.map((question, qIndex) => (
                            <fieldset
                                key={question.id ?? qIndex}
                                className="rounded-2xl border border-gray-200 p-4"
                            >
                                <legend className="text-base font-medium">
                                    {qIndex + 1}. {question.question}
                                </legend>

                                <div className="mt-4 space-y-3">
                                    {(question.options ?? []).map((option) => (
                                        <label
                                            key={option.id}
                                            className="flex items-start gap-3 rounded-xl border px-4 py-3 text-sm hover:border-blue-400"
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${qIndex}`}
                                                checked={data.answers[qIndex] === option.id}
                                                onChange={() => handleAnswer(qIndex, option.id)}
                                            />

                                            {/* TEXT OPTION */}
                                            {option.type === 'text' && (
                                                <span>{option.value}</span>
                                            )}

                                            {/* IMAGE OPTION */}
                                            {option.type === 'image' && (
                                                <img
                                                    src={option.url}
                                                    className="w-24 h-24 object-cover rounded"
                                                />
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                        ))}

                        {errors.answers && (
                            <p className="text-sm text-red-600">{errors.answers}</p>
                        )}

                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-blue-600 px-5 py-2 text-white"
                        >
                            {processing ? 'Submitting...' : 'Submit quiz'}
                        </button>
                    </form>

                    {/* EMPTY STATE */}
                    {!quiz.questions?.length && (
                        <div className="border border-dashed p-6 text-sm text-gray-500">
                            This quiz does not have any questions yet.
                        </div>
                    )}
                </div>
            </div>
        </StudentLayout>
    );
}