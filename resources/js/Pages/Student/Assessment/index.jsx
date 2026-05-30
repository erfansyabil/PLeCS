import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link } from '@inertiajs/react';

export default function AssessmentIndex({ courses = [] }) {

    return (
        <StudentLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Assessment Hub
                </h2>
            }
        >
            <Head title="Assessment" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-600 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-white">
                            <p className="mb-6">
                                Open an enrolled course to work through quizzes and coding exercises tied to that course.
                            </p>

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
                                            {course.description ?? 'No description available.'}
                                        </p>
                                        <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-300">
                                            <span>{course.quizzes_count ?? 0} quizzes</span>
                                            <span>{course.coding_exercises_count ?? 0} exercises</span>
                                        </div>
                                        <Link
                                            href={route('student.assessment.show', course.id)}
                                            className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                        >
                                            Open assessments
                                        </Link>
                                    </div>
                                ))}
                            </div>

                            {courses.length === 0 && (
                                <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-500 dark:text-gray-300">
                                    You are not enrolled in any courses yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
