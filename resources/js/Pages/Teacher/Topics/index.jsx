import TeacherLayout from '@/Layouts/TeacherLayout';
import { Head, Link} from '@inertiajs/react';

export default function ViewTopicsIndex({ contents = [] }) {
    const courses = Array.isArray(contents) ? contents : [];

    return (
        <TeacherLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    View Topics
                </h2>
            }
        >
            <Head title="Learning Content" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-600 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-white">
                            <p className="mb-6">
                                Welcome to the View Topics module. Here you can view all the learning topics.
                            </p>

                            {courses.length === 0 ? (
                                <p className="text-sm text-gray-600 dark:text-gray-300">No courses available yet.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {courses.map((course) => (
                                        <div
                                            key={course.id}
                                            className="rounded-xl shadow-md bg-white dark:bg-gray-500 border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition"
                                        >
                                            <div className="mb-2 flex items-start justify-between gap-3">
                                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                                    {course.title}
                                                </h3>
                                                <span className="inline-flex rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-200">
                                                    {course.children_count ?? 0} Topic{(course.children_count ?? 0) === 1 ? '' : 's'}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                                {course.description || 'No description'}
                                            </p>
                                            <Link
                                                href={route('teacher.topics.show', course.id)}
                                                className="mt-4 inline-block px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700"
                                            >
                                                View Topics
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
}
