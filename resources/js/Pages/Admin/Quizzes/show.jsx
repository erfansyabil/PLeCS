import AdministratorLayout from '@/Layouts/AdministratorLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ quiz }) {

    const renderQuestion = (q, index) => {
        return (
            <div key={q.id || index} className="border rounded-xl p-5 bg-white dark:bg-gray-700 space-y-4">

                {/* Question Title (Rich Text HTML) */}
                <div
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: q.question }}
                />

                {/* Question Image */}
                {q.image && (
                    <img
                        src={q.image}
                        alt="question"
                        className="max-w-md rounded-lg border"
                    />
                )}

                {/* Options */}
                <div className="space-y-2">
                    {q.options?.map((opt, i) => {

                        const isCorrect = opt.id === q.correct_option_id;

                        return (
                            <div
                                key={opt.id || i}
                                className={`flex items-center gap-3 p-3 rounded-lg border
                                    ${isCorrect
                                        ? 'bg-green-100 border-green-500 dark:bg-green-900'
                                        : 'bg-gray-50 dark:bg-gray-800'
                                    }`}
                            >

                                {/* Option content */}
                                {opt.type === 'text' && (
                                    <span className="text-gray-800 dark:text-gray-100">
                                        {opt.value}
                                    </span>
                                )}

                                {opt.type === 'image' && opt.url && (
                                    <img
                                        src={opt.url}
                                        className="w-28 h-28 object-cover rounded border"
                                        alt="option"
                                    />
                                )}

                                {/* Correct badge */}
                                {isCorrect && (
                                    <span className="ml-auto text-xs font-bold text-green-600">
                                        Correct
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Points */}
                <div className="text-xs text-gray-500">
                    {q.points} points
                </div>
            </div>
        );
    };

    return (
        <AdministratorLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        Quiz Details
                    </h2>

                    <Link
                        href={route('admin.quizzes.index')}
                        className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Back
                    </Link>
                </div>
            }
        >
            <Head title={quiz.title} />

            <div className="py-10">
                <div className="mx-auto max-w-4xl px-4 space-y-6">

                    {/* Quiz Info */}
                    <div className="rounded-2xl bg-white dark:bg-gray-700 p-6 space-y-2">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {quiz.title}
                        </h1>

                        <p className="text-gray-600 dark:text-gray-300">
                            {quiz.description ?? 'No description provided.'}
                        </p>

                        <div className="flex gap-3 text-sm text-gray-500 dark:text-gray-300">
                            <span>📚 {quiz.course?.title ?? 'Unassigned'}</span>
                            <span>🎯 {quiz.difficulty_level}</span>
                            <span>⭐ {quiz.points} points</span>
                            <span>
                                {quiz.is_published ? '🟢 Published' : '🟡 Draft'}
                            </span>
                        </div>
                    </div>

                    {/* Questions */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Questions
                        </h2>

                        {quiz.questions?.length > 0 ? (
                            quiz.questions.map(renderQuestion)
                        ) : (
                            <p className="text-gray-500">No questions available.</p>
                        )}
                    </div>

                </div>
            </div>
        </AdministratorLayout>
    );
}