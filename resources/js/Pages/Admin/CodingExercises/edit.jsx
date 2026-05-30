import AdministratorLayout from '@/Layouts/AdministratorLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ codingExercise, courses = [] }) {
    const { data, setData, put, processing, errors } = useForm({
        title: codingExercise.title ?? '',
        description: codingExercise.description ?? '',
        course_id: codingExercise.course_id ?? courses[0]?.id ?? '',
        difficulty_level: codingExercise.difficulty_level ?? 'Beginner',
        points: codingExercise.points ?? 10,
        instructions: codingExercise.instructions ?? '',
        starter_code: codingExercise.starter_code ?? '',
        test_cases_json: codingExercise.test_cases_json ?? '[]',
        is_published: !!codingExercise.is_published,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.coding-exercises.update', codingExercise.id));
    };

    return (
        <AdministratorLayout header={<div className="flex items-center justify-between"><h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Edit Coding Exercise</h2><Link href={route('admin.coding-exercises.index')} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">Back</Link></div>}>
            <Head title="Edit Coding Exercise" />
            <div className="py-12">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-600">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Title</label>
                            <input value={data.title} onChange={(e) => setData('title', e.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
                            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
                            <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows="3" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Course</label>
                                <select value={data.course_id} onChange={(e) => setData('course_id', e.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                                    {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                                </select>
                                {errors.course_id && <p className="mt-1 text-sm text-red-600">{errors.course_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Difficulty</label>
                                <select value={data.difficulty_level} onChange={(e) => setData('difficulty_level', e.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Points</label>
                                <input type="number" min="1" value={data.points} onChange={(e) => setData('points', e.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Instructions</label>
                            <textarea value={data.instructions} onChange={(e) => setData('instructions', e.target.value)} rows="6" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
                            {errors.instructions && <p className="mt-1 text-sm text-red-600">{errors.instructions}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Starter Code</label>
                            <textarea value={data.starter_code} onChange={(e) => setData('starter_code', e.target.value)} rows="8" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Test Cases JSON</label>
                            <textarea value={data.test_cases_json} onChange={(e) => setData('test_cases_json', e.target.value)} rows="12" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
                            {errors.test_cases_json && <p className="mt-1 text-sm text-red-600">{errors.test_cases_json}</p>}
                        </div>

                        <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                            <input type="checkbox" checked={data.is_published} onChange={(e) => setData('is_published', e.target.checked)} />
                            Publish immediately
                        </label>

                        <button disabled={processing} type="submit" className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">{processing ? 'Saving...' : 'Save exercise'}</button>
                    </form>
                </div>
            </div>
        </AdministratorLayout>
    );
}
