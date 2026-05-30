import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function EnrollmentIndex({ auth, layout, courses = [] }) {
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [savingPath, setSavingPath] = useState(false);
    const [completedSurvey, setCompletedSurvey] = useState(false);

    // Enrollment modal state
    const [enrollModal, setEnrollModal] = useState({
        open: false,
        course: null,
        enrolling: false,
        result: null, // 'success' | 'error' | null
        message: '',
    });

    const { data, setData, post, processing, errors } = useForm({
        form_level: 'Form 1',
        interests: '',
        background: 'none',
        learning_goal: 'interest',
    });

    const fallbackCourses = [
        {
            id: 1,
            title: 'Introduction to Python Programming',
            description: 'Fundamentals of programming using Python. Perfect for Form 1-3 (ASK) students learning basic coding concepts.',
            difficulty: 'Beginner',
            topics: ['Python', 'Programming', 'ASK', 'Fundamentals'],
        },
        {
            id: 2,
            title: 'Cybersecurity and Digital Ethics',
            description: 'Learn about cybersecurity threats, data protection, and responsible digital citizenship. Aligned with Malaysian curriculum standards.',
            difficulty: 'Beginner',
            topics: ['Security', 'Ethics', 'Digital', 'ASK'],
        },
        {
            id: 3,
            title: 'Algorithms and Data Structures',
            description: 'Master algorithms, data structures, and problem-solving techniques. Ideal for Form 4-5 (SK) students preparing for SPM.',
            difficulty: 'Advanced',
            topics: ['Algorithms', 'Programming', 'SK', 'Advanced'],
        },
    ];

    const normalizeText = (value) => (value || '').toString().toLowerCase();

    const allCourses = courses.length > 0
        ? courses.map((course) => ({
            ...course,
            topics: course.topics ?? [],
            enroll_url: route('student.learning-content.show', course.id),
        }))
        : fallbackCourses.map((course) => ({
            ...course,
            enroll_url: route('student.learning-content.show', course.id),
        }));

    const mapApiResultToCourses = (result) => {
        if (!result) return [];

        const recommendationItems = Array.isArray(result.recommendations)
            ? result.recommendations
            : Array.isArray(result.raw?.learning_path)
                ? result.raw.learning_path
                : [];

        if (recommendationItems.length === 0) return [];

        const normalized = recommendationItems.map((item, index) => {
            const resolvedId = Number(item?.course_id ?? item?.id);
            const resolvedTitle = item?.course_title ?? item?.title ?? item?.topic ?? '';

            const matchedCourse = Number.isInteger(resolvedId)
                ? allCourses.find((course) => course.id === resolvedId)
                : allCourses.find((course) => {
                    const courseText = normalizeText([
                        course.title,
                        course.description,
                        ...(course.topics || []).flatMap((topic) => typeof topic === 'string'
                            ? [topic]
                            : [topic?.name, topic?.description].filter(Boolean)),
                    ].join(' '));
                    return courseText.includes(normalizeText(resolvedTitle));
                });

            const recommendationTopics = Array.isArray(item?.topics)
                ? item.topics
                : (matchedCourse?.topics || []);

            return {
                id: matchedCourse?.id ?? (Number.isInteger(resolvedId) ? resolvedId : index + 1),
                title: matchedCourse?.title ?? (resolvedTitle || 'Recommended Course'),
                description: matchedCourse?.description ?? 'Recommended based on your survey answers.',
                difficulty: item?.difficulty ?? matchedCourse?.difficulty ?? 'Beginner',
                topics: recommendationTopics,
                enroll_url: item?.enroll_url ?? matchedCourse?.enroll_url,
                estimated_hours: item?.estimated_hours ?? matchedCourse?.estimated_hours ?? null,
                keywords: item?.keywords ?? matchedCourse?.keywords ?? null,
                reason: item?.reason ?? '',
                score: item?.score,
                courseID: item?.course_id ?? matchedCourse?.id, // For enrollment API
            };
        });

        const deduped = [];
        const seen = new Set();
        normalized.forEach((item) => {
            const key = `${item.id}-${normalizeText(item.title)}`;
            if (!seen.has(key)) {
                seen.add(key);
                deduped.push(item);
            }
        });

        return deduped;
    };

    const handleSubmitSurvey = async (e) => {
        e.preventDefault();

        if (!data.interests || data.interests.toString().trim() === '' || !data.form_level || !data.background || !data.learning_goal) {
            alert('Please complete all fields');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/recommendations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const result = await response.json();
                const recommendedCourses = mapApiResultToCourses(result);
                setRecommendations(recommendedCourses.length > 0 ? recommendedCourses : allCourses.slice(0, 2));
                setCompletedSurvey(true);
                setShowRecommendations(true);
            } else {
                const interestsArray = data.interests.toString().split(',').map(i => i.trim().toLowerCase()).filter(Boolean);
                const recommendedCourses = allCourses.filter(course =>
                    (course.topics || []).some(tag => {
                        const tagText = (typeof tag === 'string' ? tag : tag?.name || '').toLowerCase();
                        return interestsArray.includes(tagText);
                    })
                );
                setRecommendations(recommendedCourses.length > 0 ? recommendedCourses : allCourses);
                setCompletedSurvey(true);
                setShowRecommendations(true);
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            setRecommendations(allCourses);
            setCompletedSurvey(true);
            setShowRecommendations(true);
        } finally {
            setLoading(false);
        }
    };

    const resetSurvey = () => {
        setData({
            form_level: 'Form 1',
            interests: '',
            background: 'none',
            learning_goal: 'interest',
        });
        setShowRecommendations(false);
        setRecommendations([]);
        setCompletedSurvey(false);
    };

    const handleSaveLearningPath = async () => {
        setSavingPath(true);

        try {
            const response = await fetch(route('student.learning-path.api.generate'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(payload.message || 'Unable to save learning path.');
            }

            window.location.href = route('student.learning-path.index');
        } catch (error) {
            alert(error.message || 'Unable to save learning path.');
        } finally {
            setSavingPath(false);
        }
    };

    // ─── Enrollment handlers ───────────────────────────────────────

    const openEnrollModal = (course) => {
        setEnrollModal({
            open: true,
            course,
            enrolling: false,
            result: null,
            message: '',
        });
    };

    const closeEnrollModal = () => {
        setEnrollModal({
            open: false,
            course: null,
            enrolling: false,
            result: null,
            message: '',
        });
    };

    const handleEnroll = async () => {
        const course = enrollModal.course;
        if (!course) return;

        setEnrollModal(prev => ({ ...prev, enrolling: true }));

        try {
            const response = await fetch('/student/enrollment/enroll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: JSON.stringify({
                    courseID: course.courseID || course.id,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setEnrollModal(prev => ({
                    ...prev,
                    enrolling: false,
                    result: 'success',
                    message: data.message || 'Successfully enrolled!',
                }));
            } else {
                setEnrollModal(prev => ({
                    ...prev,
                    enrolling: false,
                    result: 'error',
                    message: data.message || 'Enrollment failed. Please try again.',
                }));
            }
        } catch (error) {
            setEnrollModal(prev => ({
                ...prev,
                enrolling: false,
                result: 'error',
                message: 'Network error. Please try again.',
            }));
        }
    };

    const goToCourse = () => {
        const url = enrollModal.course?.enroll_url;
        closeEnrollModal();
        if (url) {
            window.location.href = url;
        }
    };

    // ─── Render ────────────────────────────────────────────────────

    return (
        <StudentLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Course Enrollment & Recommendations
                </h2>
            }
        >
            <Head title="Enrollment" />
            <div className="py-12">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
                    {!showRecommendations ? (
                        // Survey Section
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-8 text-gray-900 dark:text-white">
                                <div className="mb-8">
                                    <h1 className="text-3xl font-bold mb-2">Find Your Perfect Course</h1>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Answer a quick survey based on Malaysian Form 1-5 curriculum so we can recommend Computer Science courses tailored to your level and interests.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmitSurvey} className="space-y-8">
                                    {/* Form Level */}
                                    <div>
                                        <label className="block text-lg font-semibold mb-4">Form Level</label>
                                        <select
                                            value={data.form_level}
                                            onChange={(e) => setData('form_level', e.target.value)}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                        >
                                            <option>Form 1</option>
                                            <option>Form 2</option>
                                            <option>Form 3</option>
                                            <option>Form 4</option>
                                            <option>Form 5</option>
                                        </select>
                                    </div>

                                    {/* Interests */}
                                    <div>
                                        <label className="block text-lg font-semibold mb-4">Interests (comma-separated)</label>
                                        <input
                                            type="text"
                                            value={data.interests}
                                            onChange={(e) => setData('interests', e.target.value)}
                                            placeholder="e.g., AI, Web Development, Cybersecurity"
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                        />
                                    </div>

                                    {/* Programming Background */}
                                    <div>
                                        <label className="block text-lg font-semibold mb-4">Programming Background</label>
                                        <div className="space-y-2">
                                            {[
                                                { value: 'none', label: 'None' },
                                                { value: 'basic', label: 'Basic' },
                                                { value: 'intermediate', label: 'Intermediate' },
                                            ].map((option) => (
                                                <label key={option.value} className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                                    <input
                                                        type="radio"
                                                        name="background"
                                                        value={option.value}
                                                        checked={data.background === option.value}
                                                        onChange={(e) => setData('background', e.target.value)}
                                                        className="w-4 h-4"
                                                    />
                                                    <span className="ml-3 font-medium">{option.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Learning Goal */}
                                    <div>
                                        <label className="block text-lg font-semibold mb-4">Learning Goal</label>
                                        <div className="space-y-2">
                                            {[
                                                { value: 'career', label: 'Career' },
                                                { value: 'exam', label: 'Exam Preparation' },
                                                { value: 'interest', label: 'General Interest' },
                                            ].map((option) => (
                                                <label key={option.value} className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                                    <input
                                                        type="radio"
                                                        name="learning_goal"
                                                        value={option.value}
                                                        checked={data.learning_goal === option.value}
                                                        onChange={(e) => setData('learning_goal', e.target.value)}
                                                        className="w-4 h-4"
                                                    />
                                                    <span className="ml-3 font-medium">{option.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex gap-4 pt-6">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 px-6 py-3 text-white font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 rounded-lg transition"
                                        >
                                            {loading ? 'Getting Recommendations...' : 'Get Recommendations'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    ) : (
                        // Recommendations Section
                        <div>
                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mb-8 p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h1 className="text-3xl font-bold mb-2">Recommended Courses For You</h1>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Based on your survey responses, we recommend the following courses that match your interests and level.
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <button
                                            onClick={handleSaveLearningPath}
                                            disabled={savingPath}
                                            className="px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 rounded-lg transition"
                                        >
                                            {savingPath ? 'Saving Path...' : 'Save Learning Path'}
                                        </button>
                                        <button
                                            onClick={resetSurvey}
                                            className="px-4 py-2 text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900 transition"
                                        >
                                            Retake Survey
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {recommendations.map((course) => (
                                        <div
                                            key={course.id}
                                            className="rounded-xl overflow-hidden shadow-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:shadow-xl transition transform hover:scale-105"
                                        >
                                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-24"></div>
                                            <div className="p-5 -mt-12 relative">
                                                <div className="mb-4">
                                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                                                        {course.title}
                                                    </h3>
                                                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                                                        {course.description}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="inline-block px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900 rounded-full">
                                                        {course.difficulty || 'Beginner'}
                                                    </span>
                                                    {typeof course.score === 'number' && (
                                                        <span className="inline-block px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900 rounded-full">
                                                            Score: {course.score}
                                                        </span>
                                                    )}
                                                </div>

                                                {course.reason && (
                                                    <div className="mb-4 rounded-lg border border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 p-3">
                                                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1">Why this was recommended</p>
                                                        <p className="text-xs text-emerald-800 dark:text-emerald-200">{course.reason}</p>
                                                    </div>
                                                )}

                                                {course.estimated_hours && (
                                                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                                                        Estimated completion: {course.estimated_hours} hours
                                                    </p>
                                                )}

                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {(course.topics || []).map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-block px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded"
                                                        >
                                                            {typeof tag === 'string' ? tag : tag?.name}
                                                        </span>
                                                    ))}
                                                </div>

                                                {/* Enroll button — opens modal instead of direct link */}
                                                <button
                                                    onClick={() => openEnrollModal(course)}
                                                    className="block w-full px-4 py-2 text-center text-white font-medium bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                                                >
                                                    Enroll Now
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
                                <p className="text-blue-800 dark:text-blue-200">
                                    💡 <strong>Tip:</strong> Don't see what you're looking for? Retake the survey with different answers to get more course recommendations, or ask your teacher for additional suggestions.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Enrollment Confirmation Modal ─────────────────── */}
            {enrollModal.open && enrollModal.course && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50" onClick={closeEnrollModal}></div>

                    {/* Modal */}
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                            <h3 className="text-xl font-bold text-white">
                                {enrollModal.result === 'success' ? 'Enrollment Confirmed!' : 'Confirm Enrollment'}
                            </h3>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            {enrollModal.result === null && (
                                <>
                                    <div className="mb-4">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {enrollModal.course.title}
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Difficulty: {enrollModal.course.difficulty || 'Beginner'}
                                        </p>
                                        {enrollModal.course.estimated_hours && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Estimated: {enrollModal.course.estimated_hours} hours
                                            </p>
                                        )}
                                    </div>

                                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-6">
                                        Are you sure you want to enroll in this course? You'll gain access to all learning materials, topics, and assessments.
                                    </p>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={closeEnrollModal}
                                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleEnroll}
                                            disabled={enrollModal.enrolling}
                                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-lg transition"
                                        >
                                            {enrollModal.enrolling ? 'Enrolling...' : 'Confirm Enrollment'}
                                        </button>
                                    </div>
                                </>
                            )}

                            {enrollModal.result === 'success' && (
                                <>
                                    <div className="text-center mb-4">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                                            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <p className="text-green-700 dark:text-green-300 font-medium">
                                            {enrollModal.message}
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={closeEnrollModal}
                                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
                                        >
                                            Browse More Courses
                                        </button>
                                        <button
                                            onClick={goToCourse}
                                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                                        >
                                            Go to Course
                                        </button>
                                    </div>
                                </>
                            )}

                            {enrollModal.result === 'error' && (
                                <>
                                    <div className="text-center mb-4">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full mb-4">
                                            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </div>
                                        <p className="text-red-700 dark:text-red-300 font-medium">
                                            {enrollModal.message}
                                        </p>
                                    </div>
                                    <button
                                        onClick={closeEnrollModal}
                                        className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                                    >
                                        Close
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </StudentLayout>
    );
}