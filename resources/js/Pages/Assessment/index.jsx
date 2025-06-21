import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function AssessmentIndex({ auth }) {
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
            id: 3,
            title: 'Multimedia Design',
            description: 'Explore design principles, animation, and media tools.',
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
                    Assessment
                </h2>
            }
        >
            <Head title="Assessment" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-white">
                            <p className="mb-6">
                                Welcome to the Assessment module. Here you attempt a quiz to enhance your understanding!
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
                                            href={route('quiz.show', 1)} // assuming 1 is a placeholder course ID
                                            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                        >
                                            Start Quiz
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
