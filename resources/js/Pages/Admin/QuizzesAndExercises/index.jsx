import AdministratorLayout from '@/Layouts/AdministratorLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, quizzes, layout }) {
    const placeholderQuizzes = [
        {
            id: 1,
            title: 'JavaScript Fundamentals Quiz',
            description: 'A short quiz covering core JavaScript concepts and syntax.',
            type: 'Quiz',
            difficulty: 'Beginner',
            created_at: '2025-11-10',
        },
        {
            id: 2,
            title: 'React Component Exercise',
            description: 'A coding exercise to build a reusable React component.',
            type: 'Coding',
            difficulty: 'Intermediate',
            created_at: '2025-11-18',
        },
        {
            id: 3,
            title: 'PHP Array Challenges',
            description: 'Multiple choice and coding tasks for PHP array handling.',
            type: 'Quiz',
            difficulty: 'Intermediate',
            created_at: '2025-11-22',
        },
    ];

    const quizList = quizzes || placeholderQuizzes;

    return (
        <AdministratorLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Quiz & Coding Exercise Management
                    </h2>
                    <Link
                        href={route('admin.quizzes.create')}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Add New Quiz
                    </Link>
                </div>
            }
        >
            <Head title="Manage Quizzes" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-600 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-white">
                            <p className="mb-6">
                                Manage quizzes and coding exercises for students. Create, review, edit, and publish assessments from this dashboard.
                            </p>

                            {quizList.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">No quizzes or exercises found.</p>
                                    <Link
                                        href={route('admin.quizzes.create')}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Create the First Quiz
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Title
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Difficulty
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Created
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-600 divide-y divide-gray-200 dark:divide-gray-700">
                                            {quizList.map((quiz) => (
                                                <tr key={quiz.id} className="hover:bg-gray-50 dark:hover:bg-gray-500">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{quiz.title}</div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-300">
                                                            {quiz.description.length > 60 ? `${quiz.description.substring(0, 60)}...` : quiz.description}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                                                            {quiz.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{quiz.difficulty}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                        {new Date(quiz.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end space-x-2">
                                                            <Link
                                                                href={route('admin.quizzes.show', quiz.id)}
                                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                            >
                                                                View
                                                            </Link>
                                                            <Link
                                                                href={route('admin.quizzes.edit', quiz.id)}
                                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                            >
                                                                Edit
                                                            </Link>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (confirm('Are you sure you want to remove this quiz?')) {
                                                                        console.log('Delete quiz', quiz.id);
                                                                    }
                                                                }}
                                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdministratorLayout>
    );
}
