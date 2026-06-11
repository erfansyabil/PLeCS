import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link } from '@inertiajs/react';
import Header from '@/Components/ui/Header';
import PrimaryButton from '@/Components/ui/PrimaryButton';

export default function AssessmentIndex({ courses = [] }) {

    return (
        <StudentLayout>
            <Head title="Assessment" />
            <Header title="Assessment Hub" />
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
                                        <div
                                            className="rich-content text-gray-600 dark:text-gray-300 text-sm"
                                            dangerouslySetInnerHTML={{ __html: course.description }}
                                        />
                                        <div className="mt-2 mb-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-300">
                                            <span>{course.quizzes_count ?? 0} quizzes</span>
                                            <span>{course.coding_exercises_count ?? 0} exercises</span>
                                        </div>
                                        <PrimaryButton
                                            href={route('student.assessment.show', course.id)}
                                            variant="primary"
                                            size="md"
                                        >
                                            Open assessments
                                        </PrimaryButton>
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
