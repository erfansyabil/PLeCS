import TeacherLayout from '@/Layouts/TeacherLayout';
import { Head, Link } from '@inertiajs/react';

export default function ViewTopicsContent({ course, topics = [] }) {

    if (!course) {
        
        return (
            <TeacherLayout>
                <Head title="Course Not Found" />
                <div className="p-6 text-gray-900 dark:text-white">
                    <h2 className="text-xl font-semibold mb-4">Course Not Found</h2>
                    <p>The course you are looking for does not exist.</p>
                </div>
            </TeacherLayout>
        );
    }

    return (

        <TeacherLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        {course.title}
                    </h2>
                    <Link
                        href={route('teacher.topics.index')}
                        className="rounded bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                    >
                        Back to Courses
                    </Link>
                </div>
            }
        >
            <Head title={course.title} />
            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-600 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-white">
                            <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                            <p className="mb-4">{course.description}</p>
                            <h4 className="font-semibold mb-2">Topics:</h4>
                            <ul className="list-disc list-inside">
                                {topics.map((topic) => (
                                    <li key={topic.id}>
                                        <Link
                                            href={route('teacher.topics.topic', topic.id)}
                                            className="text-black-900 hover:underline"
                                        >
                                            {topic.title}
                                        </Link>
                                    </li>
                                ))}
                                {topics.length === 0 && <li>No topics available yet.</li>}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
}