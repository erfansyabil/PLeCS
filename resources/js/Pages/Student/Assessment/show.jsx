import StudentLayout from '@/Layouts/StudentLayout';
import { Head } from '@inertiajs/react';
import Header from '@/Components/ui/Header';
import PrimaryButton from '@/Components/ui/PrimaryButton';

export default function Show({ course, topics = [] }) {
    return (
        <StudentLayout>
            <Head title={course.title} />

            <Header title={course.title} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    <div className="bg-white dark:bg-gray-600 shadow-sm rounded-lg p-6">

                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Select a topic assessment below.
                        </p>

                        <div className="space-y-4">
                            {topics.map((topic) => (
                                <div
                                    key={topic.topicID}
                                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-500"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                                {topic.name}
                                            </h3>

                                            <p className="text-sm text-gray-500 dark:text-gray-300">
                                                {topic.quizzes_count ?? 0} quiz available
                                            </p>
                                        </div>

                                        <PrimaryButton
                                            href={route(
                                                'student.assessment.topic',
                                                topic.topicID
                                            )}
                                            variant="primary"
                                            size="md"
                                        >
                                            Open Topic
                                        </PrimaryButton>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {topics.length === 0 && (
                            <div className="text-center py-10 text-gray-500">
                                No assessments available.
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}