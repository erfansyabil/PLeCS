import AdministratorLayout from '@/Layouts/AdministratorLayout';
import { Head, Link } from '@inertiajs/react';

const difficultyBadge = {
    Beginner:     'bg-emerald-900/50 text-emerald-300',
    Intermediate: 'bg-amber-900/50 text-amber-300',
    Advanced:     'bg-red-900/50 text-red-300',
};

export default function Show({ quiz }) {

    const renderQuestion = (q, index) => {
        return (
            <div key={q.id || index} className="rounded-xl border border-slate-700 bg-slate-900 p-5 space-y-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-900/50 text-xs font-bold text-indigo-300">
                            {index + 1}
                        </span>
                        <div
                            className="prose prose-sm prose-invert max-w-none text-slate-200"
                            dangerouslySetInnerHTML={{ __html: q.question }}
                        />
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                        {q.points} pts
                    </span>
                </div>

                {q.image && (
                    <img
                        src={q.image}
                        alt="question"
                        className="max-w-md rounded-lg border border-slate-700"
                    />
                )}

                <div className="space-y-2">
                    {q.options?.map((opt, i) => {
                        const isCorrect = opt.id === q.correct_option_id;
                        return (
                            <div
                                key={opt.id || i}
                                className={`flex items-center gap-3 rounded-lg border p-3 text-sm ${
                                    isCorrect
                                        ? 'border-emerald-700 bg-emerald-900/30 text-emerald-300'
                                        : 'border-slate-700 bg-slate-800 text-slate-300'
                                }`}
                            >
                                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${isCorrect ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-600 text-slate-400'}`}>
                                    {String.fromCharCode(65 + i)}
                                </span>

                                {opt.type === 'text' && <span>{opt.value}</span>}

                                {opt.type === 'image' && opt.url && (
                                    <img src={opt.url} className="h-20 w-20 rounded object-cover border border-slate-700" alt="option" />
                                )}

                                {isCorrect && (
                                    <span className="ml-auto text-xs font-semibold text-emerald-400">
                                        ✓ Correct
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <AdministratorLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">Quiz Details</h2>
                        <p className="mt-0.5 text-sm text-slate-400">{quiz.title}</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href={route('admin.quizzes.edit', quiz.id)}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                            Edit
                        </Link>
                        <Link
                            href={route('admin.quizzes.index')}
                            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                        >
                            Back
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={quiz.title} />

            <div className="py-8">
                <div className="mx-auto max-w-4xl space-y-6 px-4">

                    {/* Quiz meta card */}
                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-sm">
                        <div className="mb-3 flex items-start justify-between gap-4">
                            <h1 className="text-2xl font-bold text-slate-100">{quiz.title}</h1>
                            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${quiz.is_published ? 'bg-emerald-900/50 text-emerald-300' : 'bg-slate-800 text-slate-300'}`}>
                                {quiz.is_published ? 'Published' : 'Draft'}
                            </span>
                        </div>

                        <p className="mb-4 text-sm text-slate-400">{quiz.description ?? 'No description provided.'}</p>

                        <div className="flex flex-wrap gap-3 border-t border-slate-800 pt-4">
                            <span className="text-sm text-slate-400">
                                Course: <strong className="text-slate-200">{quiz.course?.title ?? 'Unassigned'}</strong>
                            </span>
                            <span className="text-slate-600">·</span>
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${difficultyBadge[quiz.difficulty_level] ?? 'bg-slate-800 text-slate-300'}`}>
                                {quiz.difficulty_level}
                            </span>
                            <span className="text-slate-600">·</span>
                            <span className="text-sm text-slate-400">
                                <strong className="text-slate-200">{quiz.points}</strong> total points
                            </span>
                        </div>
                    </div>

                    {/* Questions */}
                    <div>
                        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Questions ({quiz.questions?.length ?? 0})
                        </h2>

                        {quiz.questions?.length > 0 ? (
                            <div className="space-y-4">
                                {quiz.questions.map(renderQuestion)}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
                                No questions added yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdministratorLayout>
    );
}
