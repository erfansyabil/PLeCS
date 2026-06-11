import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link } from '@inertiajs/react';

export default function CourseAssessmentPage({ course, quizzes = [], codingExercises = [] }) {
    return (
        <StudentLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">{course.title}</h2>}>
            <Head title={`${course.title} Assessments`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
                    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-600">
                        <div
                            className="rich-content text-gray-500 dark:text-gray-300"
                            dangerouslySetInnerHTML={{ __html: course.description }}
                        />
                        <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-300">
                            <span>{course.quizzes_count ?? 0} quizzes</span>
                            <span>{course.coding_exercises_count ?? 0} coding exercises</span>
                        </div>
                    </div>

                    <section className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Topics & Quizzes
                        </h3>

                        <div className="space-y-6">
                            {course.topics?.map((topic) => (
                                <div
                                    key={topic.id}
                                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-600"
                                >
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {topic.title}
                                    </h4>

                                    <div
                                        className="rich-content mt-2 text-sm text-gray-600 dark:text-gray-300"
                                        dangerouslySetInnerHTML={{
                                            __html: topic.description ?? 'No description provided.',
                                        }}
                                    />

                                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-300">
                                        {topic.quizzes?.length ?? 0} quizzes available
                                    </div>

                                    {topic.quizzes?.length > 0 ? (
                                        <div className="mt-4 space-y-3">
                                            {topic.quizzes.map((quiz) => (
                                                <div
                                                    key={quiz.id}
                                                    className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-3"
                                                >
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {quiz.title}
                                                        </div>

                                                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-300 flex gap-3">
                                                            <span>{quiz.points} pts</span>
                                                            <span>{quiz.questions_count} questions</span>
                                                            <span>{quiz.difficulty_level}</span>
                                                        </div>

                                                        {quiz.latest_attempt && (
                                                            <div className="mt-1 text-xs">
                                                                {quiz.latest_attempt.passed ? (
                                                                    <span className="text-green-600">
                                                                        Passed ({quiz.latest_attempt.score}/{quiz.latest_attempt.max_score})
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-red-600">
                                                                        Failed ({quiz.latest_attempt.score}/{quiz.latest_attempt.max_score})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <Link
                                                        href={route('student.assessment.quiz.show', {
                                                            course: course.id,
                                                            topic: topic.id,
                                                            quiz: quiz.id,
                                                        })}
                                                        className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                                                    >
                                                        {topic.quizzes[0]?.latest_attempt
                                                            ? 'Retake Quiz'
                                                            : 'Attempt Quiz'}
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="mt-4 text-sm text-gray-500 dark:text-gray-300">
                                            No quizzes available for this topic.
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Coding Exercises</h3>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {codingExercises.map((exercise) => (
                                <div key={exercise.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-600">
                                    <div className="flex items-center justify-between gap-3">
                                        <h4 className="font-semibold text-gray-900 dark:text-white">{exercise.title}</h4>
                                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                                            {exercise.points} pts
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{exercise.description ?? 'No description provided.'}</p>
                                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-300">
                                        <span>{exercise.difficulty_level}</span>
                                        <span>{exercise.test_cases_count} checks</span>
                                    </div>
                                    <Link href={route('student.assessment.coding-exercise.show', [course.id, exercise.id])} className="mt-4 inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700">
                                        Start exercise
                                    </Link>
                                </div>
                            ))}
                            {codingExercises.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-300">No published coding exercises yet.</p>}
                        </div>
                    </section>
                </div>
            </div>
        </StudentLayout>
    );
}
