import AdministratorLayout from '@/Layouts/AdministratorLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ quiz }) {
    return (
        <AdministratorLayout header={<div className="flex items-center justify-between"><h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Quiz Details</h2><Link href={route('admin.quizzes.index')} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">Back</Link></div>}>
            <Head title={quiz.title} />
            <div className="py-12">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-600">
                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">{quiz.title}</h3>
                        <p className="mt-2 text-gray-700 dark:text-gray-200">{quiz.description ?? 'No description provided.'}</p>
                        <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-300">
                            <span>{quiz.course?.title ?? 'Unassigned'}</span>
                            <span>{quiz.difficulty_level}</span>
                            <span>{quiz.points} points</span>
                            <span>{quiz.is_published ? 'Published' : 'Draft'}</span>
                        </div>
                    </div>
                    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-600">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Questions</h4>
                        <pre className="mt-4 overflow-x-auto rounded-xl bg-gray-900 p-4 text-sm text-gray-100">{JSON.stringify(quiz.questions ?? [], null, 2)}</pre>
                    </div>
                </div>
            </div>
        </AdministratorLayout>
    );
}
