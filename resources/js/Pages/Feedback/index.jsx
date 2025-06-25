import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link} from '@inertiajs/react';

export default function FeedbackIndex({ auth }) {
    const courses = [
        {
            id: 1,
            title: 'Introduction to AI',
            description: 'Learn the basics of Artificial Intelligence and its real-world applications.',
        },
        {
            id: 2,
            title: 'Cybersecurity Essentials',
            description: 'Understand security threats, vulnerabilities, and basic protection methods.',
        },
        {
            id: 4,
            title: 'Web Development',
            description: 'Build websites using HTML, CSS, JavaScript, and backend basics.',
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Provide Your Feedback!
                </h2>
            }
        >
            <Head title="Learning Content" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-600 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-white">
                            <p className="mb-6">
                                Here you can provide feedback on a course you have completed!
                            </p>

                            {/* Grid of Course Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {courses.map((course) => (
                                    <div
                                        key={course.id}
                                        className="rounded-xl shadow-md bg-white dark:bg-gray-500 border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition"
                                    >
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                                            {course.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                                            {course.description}
                                        </p>
                                        <Link
                                            href={route('feedback.form', { course: course.id })}
                                            className="mt-4 inline-block px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700"
                                        >
                                            Give Feedback
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
