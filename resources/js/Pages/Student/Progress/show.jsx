import StudentLayout from '@/Layouts/StudentLayout';
import { Head } from '@inertiajs/react';

export default function ProgressShow({ auth, courseId }) {
    // Example static data; in a real app, fetch this from the backend
    const courses = [
        {
            id: 1,
            title: 'Introduction to AI',
            completion: 80, // percent
            totalQuiz: 5,
            quizCompleted: 4,
        },
        {
            id: 2,
            title: 'Cybersecurity Essentials',
            completion: 50,
            totalQuiz: 4,
            quizCompleted: 2,
        },
        {
            id: 3,
            title: 'Multimedia Design',
            completion: 100,
            totalQuiz: 3,
            quizCompleted: 3,
        },
        {
            id: 4,
            title: 'Web Development',
            completion: 30,
            totalQuiz: 6,
            quizCompleted: 1,
        },
    ];

    const course = courses.find(c => c.id == courseId);

    if (!course) {
        return (
            <StudentLayout>
                <Head title="Course Not Found" />
                <div className="p-6 text-gray-900 dark:text-white">
                    <h2 className="text-xl font-semibold mb-4">Course Not Found</h2>
                    <p>The course you are looking for does not exist.</p>
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {course.title} - Progress Details
                </h2>
            }
        >
            <Head title="Your Progress" />
            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-600 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-white">
                            <h3 className="text-lg font-semibold mb-4">Completion Rate</h3>
                            <div className="flex justify-between mb-1">
                                <span>Completion</span>
                                <span>{course.completion}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700 mb-6">
                                <div
                                    className="bg-indigo-600 h-4 rounded-full transition-all duration-500"
                                    style={{ width: `${course.completion}%` }}
                                ></div>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Quiz Progress</h3>
                            <div className="flex justify-between mb-1">
                                <span>Quizzes Completed</span>
                                <span>
                                    {course.quizCompleted} / {course.totalQuiz}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                                <div
                                    className="bg-green-500 h-4 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${(Number(course.quizCompleted) / Number(course.totalQuiz)) * 100}%`,
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}