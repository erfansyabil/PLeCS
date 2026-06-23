import { Head } from '@inertiajs/react';
import Header from '@/Components/ui/Header';

function StarDisplay({ rating }) {
    const full  = Math.floor(rating);
    const half  = rating - full >= 0.25 && rating - full < 0.75;
    const empty = 5 - full - (half ? 1 : 0);

    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: full }).map((_, i) => (
                <StarIcon key={`f${i}`} fill="full" />
            ))}
            {half && <StarIcon fill="half" />}
            {Array.from({ length: empty }).map((_, i) => (
                <StarIcon key={`e${i}`} fill="empty" />
            ))}
            <span className="ml-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                {rating.toFixed(1)}
            </span>
        </div>
    );
}

function StarIcon({ fill }) {
    const colorMap = {
        full:  'text-yellow-400',
        half:  'text-yellow-300',
        empty: 'text-gray-300 dark:text-gray-600',
    };
    return (
        <svg className={`w-4 h-4 ${colorMap[fill]}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
    );
}

function TopicRow({ topic }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{topic.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{topic.course_title}</p>
            </div>
            <div className="flex items-center gap-4 shrink-0 ml-4">
                <StarDisplay rating={topic.avg_rating} />
                <span className="text-xs text-gray-400 dark:text-gray-500 w-20 text-right">
                    {topic.count} {topic.count === 1 ? 'review' : 'reviews'}
                </span>
            </div>
        </div>
    );
}

export default function FeedbackOverviewContent({ needsReview, allTopics }) {
    return (
        <>
            <Head title="Feedback Overview" />
            <Header title="Feedback Overview" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-8">

                    {/* Needs Review section (FR049) */}
                    {needsReview.length > 0 && (
                        <section>
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 shadow-sm sm:rounded-lg p-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <h2 className="text-base font-semibold text-red-700 dark:text-red-300">
                                        Needs Review ({needsReview.length})
                                    </h2>
                                </div>
                                <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                                    Topics rated below 3 stars on average — consider revising their content.
                                </p>
                                <div>
                                    {needsReview.map((topic) => (
                                        <TopicRow key={topic.id} topic={topic} />
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* All topics (FR047) */}
                    <section>
                        <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg p-6">
                            <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-1">
                                All Rated Topics
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                Average student rating across all topics that have received feedback.
                            </p>

                            {allTopics.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    No feedback has been submitted yet.
                                </p>
                            ) : (
                                <div>
                                    {allTopics.map((topic) => (
                                        <TopicRow key={topic.id} topic={topic} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                </div>
            </div>
        </>
    );
}
