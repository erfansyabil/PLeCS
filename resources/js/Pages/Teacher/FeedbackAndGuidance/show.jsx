import TeacherLayout from '@/Layouts/TeacherLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import Header from '@/Components/ui/Header';

function ScoreBar({ score }) {
    const color =
        score >= 70 ? 'bg-green-500' :
        score >= 50 ? 'bg-yellow-400' :
                      'bg-red-500';
    return (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
            <div
                className={`${color} h-2 rounded-full transition-all`}
                style={{ width: `${Math.min(score, 100)}%` }}
            />
        </div>
    );
}

function TopicRow({ topic }) {
    return (
        <div className="py-3">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {topic.topic_name}
                </span>
                <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${
                        topic.average_score >= 70 ? 'text-green-600 dark:text-green-400' :
                        topic.average_score >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                                                    'text-red-600 dark:text-red-400'
                    }`}>
                        {topic.average_score.toFixed(1)}%
                    </span>
                    {topic.is_at_risk && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                            Weak
                        </span>
                    )}
                </div>
            </div>
            <ScoreBar score={topic.average_score} />
            <p className="text-xs text-gray-400 mt-1">
                {topic.completion_rate.toFixed(0)}% quizzes attempted
            </p>
        </div>
    );
}

function GuidanceCard({ guidance }) {
    return (
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400">{guidance.created_at}</span>
                {!guidance.is_read && (
                    <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-full">
                        Unread
                    </span>
                )}
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-200">{guidance.comment}</p>
        </div>
    );
}

export default function GuidanceShow({ student, analytics, guidances }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        student_id: student.id,
        topic_id:   null,   // not used — general comment
        comment:    '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('teacher.guidance.store'), {
            onSuccess: () => reset('comment'),
        });
    };

    return (
        <TeacherLayout>
            <Head title={`Guidance — ${student.name}`} />
            <Header title="Student Guidance" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Back link */}
                    <Link
                        href={route('teacher.guidance.index')}
                        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6"
                    >
                        ← Back to Students
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left: student info + topic performance */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Student info */}
                            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                                    {student.name}
                                </h2>
                                <p className="text-sm text-gray-400">{student.email}</p>
                            </div>

                            {/* Topic performance */}
                            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
                                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">
                                    Topic Performance
                                </h3>

                                {analytics.length === 0 ? (
                                    <p className="text-sm text-gray-400">
                                        This student has no quiz attempts yet.
                                    </p>
                                ) : (
                                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {analytics.map((a, i) => (
                                            <TopicRow key={i} topic={a} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: guidance form + history */}
                        <div className="space-y-6">

                            {/* Guidance form */}
                            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
                                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">
                                    Send Guidance
                                </h3>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Comment
                                        </label>
                                        <textarea
                                            rows={5}
                                            value={data.comment}
                                            onChange={(e) => setData('comment', e.target.value)}
                                            placeholder={`Write guidance for ${student.name}...`}
                                            className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                        />
                                        {errors.comment && (
                                            <p className="text-red-500 text-xs mt-1">{errors.comment}</p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing || !data.comment.trim()}
                                        className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        Send Guidance
                                    </button>
                                </form>
                            </div>

                            {/* Guidance history */}
                            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
                                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">
                                    Guidance History
                                </h3>

                                {guidances.length === 0 ? (
                                    <p className="text-sm text-gray-400">
                                        No guidance sent to this student yet.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {guidances.map((g) => (
                                            <GuidanceCard key={g.id} guidance={g} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
}