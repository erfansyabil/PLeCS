import AdministratorLayout from '@/Layouts/AdministratorLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ auth, quiz, layout }) {
    const placeholderQuiz = {
        id: 1,
        title: 'React Component Exercise',
        description: 'Build a reusable React component that displays quiz results and supports sorting.',
        type: 'Coding',
        difficulty: 'Intermediate',
        instructions: 'Create a React component that accepts a list of results and renders a sortable table. Implement basic styling and add filters for score thresholds.',
        code_template: 'function ResultTable({ results }) {\n  return <div>...</div>\n}',
        created_at: '2025-11-18',
    };

    const quizData = quiz || placeholderQuiz;

    return (
        <AdministratorLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Quiz / Coding Exercise Details
                    </h2>
                    <Link
                        href={route('admin.quizzes.index')}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Back to List
                    </Link>
                </div>
            }
        >
            <Head title="Quiz Details" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-600 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-white">
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold mb-2">{quizData.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">{quizData.description}</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <strong>Type:</strong> {quizData.type}
                                    </div>
                                    <div>
                                        <strong>Difficulty:</strong> {quizData.difficulty}
                                    </div>
                                    <div>
                                        <strong>Created:</strong> {new Date(quizData.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <strong>Instructions:</strong>
                                    <p className="mt-2 whitespace-pre-line text-gray-700 dark:text-gray-200">{quizData.instructions}</p>
                                </div>

                                {quizData.type === 'Coding' && (
                                    <div className="mb-6">
                                        <strong>Starter Code:</strong>
                                        <pre className="mt-2 rounded bg-gray-100 dark:bg-gray-800 p-4 overflow-x-auto text-sm text-gray-800 dark:text-gray-100">
                                            {quizData.code_template}
                                        </pre>
                                    </div>
                                )}
                            </div>

                            <div className="flex space-x-4">
                                <Link
                                    href={route('admin.quizzes.edit', quizData.id)}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Edit
                                </Link>
                                <Link
                                    href={route('admin.quizzes.index')}
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Back to List
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdministratorLayout>
    );
}
