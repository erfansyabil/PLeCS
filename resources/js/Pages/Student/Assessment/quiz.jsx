import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

// ─── Icons ────────────────────────────────────────────────────────────────────
function CheckIcon() {
    return (
        <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    );
}

function XIcon() {
    return (
        <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    );
}

// ─── Result panel ─────────────────────────────────────────────────────────────
function ResultPanel({ attempt, quiz, course, topic, onRetry }) {
    const percentage = attempt.max_score > 0
        ? Math.round((attempt.score / attempt.max_score) * 100)
        : 0;

    const scoreColor = attempt.passed
        ? 'text-green-600 dark:text-green-400'
        : 'text-red-600 dark:text-red-400';

    const badgeClass = attempt.passed
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';

    return (
        <div className="space-y-6">
            {/* Score summary */}
            <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-700 text-center">
                <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {course.title}
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                    {quiz.title}
                </h3>

                <div className={`mt-6 text-6xl font-bold ${scoreColor}`}>
                    {percentage}%
                </div>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                    {attempt.score} / {attempt.max_score} points
                </p>

                <span className={`mt-4 inline-block rounded-full px-4 py-1 text-sm font-medium ${badgeClass}`}>
                    {attempt.passed ? 'Passed' : 'Failed'}
                </span>

                <p className="mt-2 text-xs text-gray-400">
                    Submitted {attempt.submitted_at}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link
                        href={route('student.assessment.show', course.id)}
                        className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                        Back to course
                    </Link>
                    {/* FIX: use onRetry callback instead of Link so state resets */}
                    <button
                        type="button"
                        onClick={onRetry}
                        className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Retry quiz
                    </button>
                </div>
            </div>

            {/* Per-question feedback */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Question Review
                </h4>

                {(attempt.feedback ?? []).map((item, i) => (
                    <div
                        key={i}
                        className={`rounded-2xl border bg-white p-5 shadow-sm dark:bg-gray-700 ${
                            item.is_correct
                                ? 'border-green-200 dark:border-green-700'
                                : 'border-red-200 dark:border-red-700'
                        }`}
                    >
                        <div className="flex gap-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold dark:bg-gray-600 dark:text-gray-200">
                                {i + 1}
                            </span>
                            <p
                                className="text-gray-900 dark:text-white leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: item.question }}
                            />
                        </div>

                        <div className="mt-4 space-y-2 pl-10">
                            {(item.options ?? quiz.questions[i]?.options ?? []).map((option, optIndex) => {
                                const optId      = typeof option === 'string' ? String(optIndex) : (option.id ?? String(optIndex));
                                const isCorrect  = optId === item.correct_option_id;
                                const isSelected = optId === item.selected_option_id;

                                let optionClass = 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300';
                                if (isCorrect) optionClass = 'border-green-400 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 font-medium';
                                if (isSelected && !isCorrect) optionClass = 'border-red-400 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200';

                                const type  = typeof option === 'string' ? 'text' : (option.type ?? 'text');
                                const label = typeof option === 'string' ? option : (option.value ?? '');
                                const url   = typeof option === 'object' ? (option.url ?? null) : null;

                                return (
                                    <div
                                        key={optIndex}
                                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${optionClass}`}
                                    >
                                        {isCorrect && <CheckIcon />}
                                        {isSelected && !isCorrect && <XIcon />}
                                        {!isCorrect && !isSelected && <span className="h-5 w-5 shrink-0" />}
                                        {type === 'image' && url ? (
                                            <img
                                                src={url}
                                                alt={label || `Option ${optIndex + 1}`}
                                                className="h-20 w-28 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                                            />
                                        ) : (
                                            <span>{label}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {item.explanation && (
                            <p className="mt-3 pl-10 text-sm text-gray-500 dark:text-gray-400 italic">
                                {item.explanation}
                            </p>
                        )}

                        <div className="mt-3 pl-10 text-xs text-gray-400">
                            {item.is_correct ? `+${item.points} points` : `0 / ${item.points} points`}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Quiz form ─────────────────────────────────────────────────────────────────
function QuizForm({ course, topic, quiz, processing, data, setData, submit }) {
    const handleAnswer = (questionIndex, optionIndex) => {
        setData('answers', { ...data.answers, [questionIndex]: optionIndex });
    };

    const answeredCount = Object.keys(data.answers).length;
    const totalCount    = quiz.questions?.length ?? 0;

    return (
        <form onSubmit={submit} className="space-y-6">
            {/* Progress bar */}
            <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-700 flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {answeredCount} / {totalCount} answered
                </span>
                <div className="h-2 w-48 rounded-full bg-gray-200 dark:bg-gray-600">
                    <div
                        className="h-2 rounded-full bg-blue-600 transition-all"
                        style={{ width: totalCount > 0 ? `${(answeredCount / totalCount) * 100}%` : '0%' }}
                    />
                </div>
            </div>

            {quiz.questions?.map((question, qIndex) => {
                const options = (question.options ?? []).map((opt, i) => ({
                    index: i,
                    id:    typeof opt === 'string' ? String(i) : (opt.id ?? String(i)),
                    type:  typeof opt === 'string' ? 'text' : (opt.type ?? 'text'),
                    label: typeof opt === 'string' ? opt : (opt.value ?? ''),
                    url:   typeof opt === 'object' ? (opt.url ?? null) : null,
                }));

                return (
                    <div
                        key={qIndex}
                        className="rounded-2xl bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden"
                    >
                        <div className="p-5 border-b border-gray-100 dark:border-gray-600">
                            <div className="flex gap-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
                                    {qIndex + 1}
                                </span>
                                <div
                                    className="flex-1 text-gray-900 dark:text-white leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: question.question }}
                                />
                            </div>
                        </div>

                        <div className="p-5 space-y-3">
                            {options.map(({ index: optIndex, id: optId, type, label, url }) => (
                                <label
                                    key={optIndex}
                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition hover:border-blue-500 ${
                                        data.answers[qIndex] === optId
                                            ? 'border-blue-500 bg-blue-50 dark:bg-gray-600'
                                            : 'border-gray-200 dark:border-gray-600'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name={`question-${qIndex}`}
                                        checked={data.answers[qIndex] === optId}
                                        onChange={() => handleAnswer(qIndex, optId)}
                                        className="mt-0.5 shrink-0"
                                    />
                                    {type === 'image' && url ? (
                                        <img
                                            src={url}
                                            alt={label || `Option ${optIndex + 1}`}
                                            className="h-24 w-36 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                                        />
                                    ) : (
                                        <span className="text-gray-800 dark:text-gray-100">{label}</span>
                                    )}
                                </label>
                            ))}
                        </div>
                    </div>
                );
            })}

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={processing || answeredCount < totalCount}
                    className="w-full rounded-xl bg-blue-600 px-5 py-3 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {processing
                        ? 'Submitting...'
                        : answeredCount < totalCount
                            ? `Answer all questions to submit (${answeredCount}/${totalCount})`
                            : 'Submit Quiz'}
                </button>
            </div>
        </form>
    );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function QuizPage({ course, topic, quiz, latestAttempt }) {
    // FIX: explicit boolean state controls result vs form — not inferred from answers
    const [showResult, setShowResult] = useState(!!latestAttempt);

    const { data, setData, post, processing, reset } = useForm({ answers: {} });

    const handleRetry = () => {
        reset();              // clear answers
        setShowResult(false); // switch to form
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('student.assessment.quiz.store', {
            course: course.id,
            topic:  topic.id,
            quiz:   quiz.id,
        }), {
            // After successful submission the page reloads with new latestAttempt,
            // so we flip back to result view via onSuccess
            onSuccess: () => setShowResult(true),
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

                    {/* Quiz header */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-600">
                        <p className="text-sm uppercase text-gray-500">{course.title}</p>
                        <h3 className="mt-2 text-2xl font-semibold dark:text-white">{quiz.title}</h3>
                        {quiz.description && (
                            <p className="mt-3 text-gray-700 dark:text-gray-200">{quiz.description}</p>
                        )}
                        <div className="mt-4 flex gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <span>{quiz.difficulty_level}</span>
                            <span>·</span>
                            <span>{quiz.points} points</span>
                            <span>·</span>
                            <span>{quiz.questions?.length ?? 0} questions</span>
                        </div>
                    </div>

                    {showResult && latestAttempt ? (
                        <ResultPanel
                            attempt={latestAttempt}
                            quiz={quiz}
                            course={course}
                            topic={topic}
                            onRetry={handleRetry}
                        />
                    ) : (
                        <>
                            {!quiz.questions?.length ? (
                                <div className="rounded-2xl border border-dashed p-6 text-sm text-gray-500">
                                    This quiz does not have any questions yet.
                                </div>
                            ) : (
                                <QuizForm
                                    course={course}
                                    topic={topic}
                                    quiz={quiz}
                                    processing={processing}
                                    data={data}
                                    setData={setData}
                                    submit={submit}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </StudentLayout>
    );
}