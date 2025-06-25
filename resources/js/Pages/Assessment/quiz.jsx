import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function QuizPage({ auth }) {
    // Mockup-only: No dynamic logic
    // const [currentQuestion, setCurrentQuestion] = useState(0);
    // const [selectedAnswer, setSelectedAnswer] = useState(null);
    // const [score, setScore] = useState(0);

    return (
        <AuthenticatedLayout
            auth={auth}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Quiz
                </h2>
            }
        >
            <Head title="Mock Quiz" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-600 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-white">
                            <h3 className="text-2xl font-bold mb-4">Quiz</h3>
                            <p className="mb-6">Answer the following questions:</p>

                            {/* Example Question */}
                            <div className="mb-6">
                                <p className="font-medium">1. What does HTML stand for?</p>
                                <ul className="mt-2 space-y-2">
                                    <li>
                                        <label className="flex items-center space-x-2">
                                            <input type="radio" name="q1" />
                                            <span>HyperText Markup Language</span>
                                        </label>
                                    </li>
                                    <li>
                                        <label className="flex items-center space-x-2">
                                            <input type="radio" name="q1" />
                                            <span>Home Tool Markup Language</span>
                                        </label>
                                    </li>
                                </ul>
                            </div>

                            <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

