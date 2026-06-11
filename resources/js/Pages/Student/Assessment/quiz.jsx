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
                    <form
                        onSubmit={submit}
                        className="space-y-6"
                    >

                        {quiz.questions?.map((question, qIndex) => (
                            <div
                                key={question.id ?? qIndex}
                                className="rounded-2xl bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden"
                            >

                                {/* QUESTION HEADER */}
                                <div className="p-5 border-b border-gray-100 dark:border-gray-600">
                                    <div className="flex gap-3">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
                                            {qIndex + 1}
                                        </span>

                                        <div className="flex-1">
                                            <div
                                                className="text-gray-900 dark:text-white leading-relaxed"
                                                dangerouslySetInnerHTML={{
                                                    __html: question.question,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* OPTIONS */}
                                <div className="p-5 space-y-3">
                                    {(question.options ?? []).map((option) => (
                                        <label
                                            key={option.id}
                                            className={`
                                                flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition
                                                hover:border-blue-500
                                                ${data.answers[qIndex] === option.id
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-gray-600'
                                                    : 'border-gray-200 dark:border-gray-600'
                                                }
                                            `}
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${qIndex}`}
                                                checked={data.answers[qIndex] === option.id}
                                                onChange={() => handleAnswer(qIndex, option.id)}
                                                className="mt-0.5"
                                            />

                                            {/* TEXT OPTION */}
                                            {option.type === 'text' && (
                                                <span className="text-gray-800 dark:text-gray-100">
                                                    {option.value}
                                                </span>
                                            )}

                                            {/* IMAGE OPTION */}
                                            {option.type === 'image' && option.url && (
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={option.url}
                                                        className="w-28 h-20 object-cover rounded-lg border"
                                                    />
                                                </div>
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* SUBMIT BUTTON */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-xl bg-blue-600 px-5 py-3 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {processing ? 'Submitting...' : 'Submit Quiz'}
                            </button>
                        </div>
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