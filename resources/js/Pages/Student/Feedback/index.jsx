import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link } from '@inertiajs/react';
import Header from '@/Components/ui/Header';

const TAGS = [
    'Easy to understand',
    'Confusing explanation',
    'Well structured',
    'Needs more examples',
    'Too advanced',
    'Very helpful',
];

function StarDisplay({ rating }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
}

function PeerRating({ avgRating, peerCount }) {
    if (!avgRating || peerCount === 0) return null;
    return (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{avgRating.toFixed(1)} from {peerCount} {peerCount === 1 ? 'student' : 'students'}</span>
        </div>
    );
}

function TopicCard({ topic, reviewed }) {
    const feedback = topic.feedback;

    return (
        <div className="rounded-xl shadow-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-5 flex flex-col gap-3">
            {/* Course badge */}
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                {topic.course_title}
            </span>

            <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                {topic.name}
            </h3>

            <PeerRating avgRating={topic.avg_rating} peerCount={topic.peer_count} />

            {reviewed && feedback ? (
                <>
                    <StarDisplay rating={feedback.rating} />
                    {feedback.comment && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                            "{feedback.comment}"
                        </p>
                    )}
                    {feedback.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {feedback.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                    <Link
                        href={route('student.feedback.form', { topic: topic.id })}
                        className="mt-auto text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                        Edit feedback
                    </Link>
                </>
            ) : (
                <Link
                    href={route('student.feedback.form', { topic: topic.id })}
                    className="mt-auto inline-block px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition text-center"
                >
                    Give Feedback
                </Link>
            )}
        </div>
    );
}

export default function FeedbackIndex({ auth, pendingTopics, reviewedTopics }) {
    return (
        <StudentLayout>
            <Head title="Feedback" />
            <Header title="Provide Feedback" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-10">

                    {/* Pending */}
                    <section>
                        <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                                Awaiting Your Feedback
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Topics you have not reviewed yet.
                            </p>

                            {pendingTopics.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    You have reviewed all your topics — great job!
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {pendingTopics.map((topic) => (
                                        <TopicCard key={topic.id} topic={topic} reviewed={false} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Reviewed */}
                    {reviewedTopics.length > 0 && (
                        <section>
                            <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg p-6">
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                                    Already Reviewed
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                    You can edit your feedback anytime.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {reviewedTopics.map((topic) => (
                                        <TopicCard key={topic.id} topic={topic} reviewed={true} />
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                </div>
            </div>
        </StudentLayout>
    );
}