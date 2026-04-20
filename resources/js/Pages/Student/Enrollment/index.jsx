import StudentLayout from '@/Layouts/StudentLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function EnrollmentIndex({ auth, layout }) {
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [completedSurvey, setCompletedSurvey] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        interests: [],
        experience_level: '',
        learning_style: '',
        time_commitment: '',
        career_goals: '',
    });

    const allCourses = [
        {
            id: 1,
            title: 'Introduction to Python Programming',
            description: 'Fundamentals of programming using Python. Perfect for Form 1-3 (ASK) students learning basic coding concepts.',
            tags: ['Python', 'Programming', 'ASK', 'Fundamentals'],
            difficulty: 'Form 1-3',
            form: ['form1', 'form2', 'form3'],
        },
        {
            id: 2,
            title: 'Cybersecurity and Digital Ethics',
            description: 'Learn about cybersecurity threats, data protection, and responsible digital citizenship. Aligned with Malaysian curriculum standards.',
            tags: ['Security', 'Ethics', 'Digital', 'ASK'],
            difficulty: 'Form 1-3',
            form: ['form1', 'form2', 'form3'],
        },
        {
            id: 3,
            title: 'Algorithms and Data Structures',
            description: 'Master algorithms, data structures, and problem-solving techniques. Ideal for Form 4-5 (SK) students preparing for SPM.',
            tags: ['Algorithms', 'Programming', 'SK', 'Advanced'],
            difficulty: 'Form 4-5',
            form: ['form4', 'form5'],
        },
        {
            id: 4,
            title: 'Object-Oriented Programming',
            description: 'Object-oriented programming using languages like C++ and Java for Form 4-5 (SK) curriculum standards.',
            tags: ['OOP', 'C++', 'Java', 'SK'],
            difficulty: 'Form 4-5',
            form: ['form4', 'form5'],
        },
        {
            id: 5,
            title: 'Computer Networks and Internet',
            description: 'Understand networking basics, the internet, and how data is transmitted. Core topic in ASK and SK curriculum.',
            tags: ['Networking', 'Internet', 'ASK', 'SK'],
            difficulty: 'Form 1-5',
            form: ['form1', 'form2', 'form3', 'form4', 'form5'],
        },
        {
            id: 6,
            title: 'Information Technology Applications',
            description: 'Explore IT applications, databases, and digital tools used in modern organizations and daily life.',
            tags: ['IT', 'Databases', 'Digital Tools', 'ASK'],
            difficulty: 'Form 1-3',
            form: ['form1', 'form2', 'form3'],
        },
    ];

    const surveyQuestions = {
        interests: [
            { value: 'programming', label: '💻 Programming' },
            { value: 'networking', label: '🌐 Networking & Internet' },
            { value: 'cybersecurity', label: '🔒 Cybersecurity' },
            { value: 'databases', label: '🗄️ Databases' },
            { value: 'algorithms', label: '🧮 Algorithms' },
            { value: 'digitaltools', label: '🛠️ Digital Tools' },
        ],
        experience_level: [
            { value: 'complete_beginner', label: 'Complete Beginner - No experience' },
            { value: 'some_basics', label: 'Some Basics - Only learned in class' },
            { value: 'intermediate', label: 'Intermediate - Have done some small projects' },
        ],
        learning_style: [
            { value: 'visual', label: '👁️ Visual (Videos, Diagrams)' },
            { value: 'interactive', label: '🖱️ Interactive (Hands-on, Coding)' },
            { value: 'theoretical', label: '📚 Theoretical (Lectures, Reading)' },
            { value: 'mixed', label: '🔄 Mixed Learning Approach' },
        ],
        time_commitment: [
            { value: 'light', label: '⏰ Light (2-5 hours/week)' },
            { value: 'moderate', label: '⏱️ Moderate (5-10 hours/week)' },
            { value: 'intensive', label: '🚀 Intensive (10+ hours/week)' },
        ],
        career_goals: [
            { value: 'exam_preparation', label: 'Exam Preparation (PT3/SPM)' },
            { value: 'skill_development', label: 'Technical Skill Development' },
            { value: 'career_interest', label: 'Interest in Technology Career' },
            { value: 'general_interest', label: 'General Interest in Computer Science' },
        ],
    };

    const toggleInterest = (interest) => {
        setData('interests', data.interests.includes(interest)
            ? data.interests.filter(i => i !== interest)
            : [...data.interests, interest]
        );
    };

    const normalizeText = (value) => (value || '').toString().toLowerCase();

    const mapApiResultToCourses = (result) => {
        if (!result) {
            return [];
        }

        const idRecommendations = Array.isArray(result.recommendations)
            ? result.recommendations
                .map((item) => item?.id)
                .filter((id) => Number.isInteger(id))
            : [];

        if (idRecommendations.length > 0) {
            return allCourses.filter((course) => idRecommendations.includes(course.id));
        }

        const topicRecommendations = Array.isArray(result.recommendations)
            ? result.recommendations
                .map((item) => normalizeText(item?.topic))
                .filter(Boolean)
            : [];

        if (topicRecommendations.length === 0) {
            return [];
        }

        return allCourses.filter((course) => {
            const courseText = normalizeText([
                course.title,
                course.description,
                ...(course.tags || []),
            ].join(' '));

            return topicRecommendations.some((topic) => courseText.includes(topic));
        });
    };

    const handleSubmitSurvey = async (e) => {
        e.preventDefault();
        
        if (data.interests.length === 0 || !data.experience_level || !data.learning_style || !data.time_commitment || !data.career_goals) {
            alert('Please complete all fields');
            return;
        }

        setLoading(true);

        try {
            // Call your backend endpoint that will use HuggingFace API
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
                // Fallback: recommend based on interests
                const recommendedCourses = allCourses.filter(course =>
                    course.tags.some(tag => data.interests.includes(tag))
                );
                setRecommendations(recommendedCourses.length > 0 ? recommendedCourses : allCourses);
                setCompletedSurvey(true);
                setShowRecommendations(true);
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            // Fallback recommendation
            setRecommendations(allCourses);
            setCompletedSurvey(true);
            setShowRecommendations(true);
        } finally {
            setLoading(false);
        }
    };

    const resetSurvey = () => {
        setData({
            interests: [],
            experience_level: '',
            learning_style: '',
            time_commitment: '',
            career_goals: '',
        });
        setShowRecommendations(false);
        setRecommendations([]);
        setCompletedSurvey(false);
    };

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
                                    {/* Interests */}
                                    <div>
                                        <label className="block text-lg font-semibold mb-4">
                                            What are your interests?
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {surveyQuestions.interests.map((option) => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => toggleInterest(option.value)}
                                                    className={`p-4 rounded-lg border-2 transition font-medium text-left ${
                                                        data.interests.includes(option.value)
                                                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100'
                                                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-400'
                                                    }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Experience Level */}
                                    <div>
                                        <label className="block text-lg font-semibold mb-4">
                                            What is your experience level?
                                        </label>
                                        <div className="space-y-2">
                                            {surveyQuestions.experience_level.map((option) => (
                                                <label key={option.value} className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                                    <input
                                                        type="radio"
                                                        name="experience_level"
                                                        value={option.value}
                                                        checked={data.experience_level === option.value}
                                                        onChange={(e) => setData('experience_level', e.target.value)}
                                                        className="w-4 h-4"
                                                    />
                                                    <span className="ml-3 font-medium">{option.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Learning Style */}
                                    <div>
                                        <label className="block text-lg font-semibold mb-4">
                                            How do you prefer to learn?
                                        </label>
                                        <div className="space-y-2">
                                            {surveyQuestions.learning_style.map((option) => (
                                                <label key={option.value} className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                                    <input
                                                        type="radio"
                                                        name="learning_style"
                                                        value={option.value}
                                                        checked={data.learning_style === option.value}
                                                        onChange={(e) => setData('learning_style', e.target.value)}
                                                        className="w-4 h-4"
                                                    />
                                                    <span className="ml-3 font-medium">{option.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Time Commitment */}
                                    <div>
                                        <label className="block text-lg font-semibold mb-4">
                                            How much time can you commit?
                                        </label>
                                        <div className="space-y-2">
                                            {surveyQuestions.time_commitment.map((option) => (
                                                <label key={option.value} className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                                    <input
                                                        type="radio"
                                                        name="time_commitment"
                                                        value={option.value}
                                                        checked={data.time_commitment === option.value}
                                                        onChange={(e) => setData('time_commitment', e.target.value)}
                                                        className="w-4 h-4"
                                                    />
                                                    <span className="ml-3 font-medium">{option.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Career Goals */}
                                    <div>
                                        <label className="block text-lg font-semibold mb-4">
                                            What is your primary goal?
                                        </label>
                                        <div className="space-y-2">
                                            {surveyQuestions.career_goals.map((option) => (
                                                <label key={option.value} className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                                    <input
                                                        type="radio"
                                                        name="career_goals"
                                                        value={option.value}
                                                        checked={data.career_goals === option.value}
                                                        onChange={(e) => setData('career_goals', e.target.value)}
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
                                    <button
                                        onClick={resetSurvey}
                                        className="px-4 py-2 text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900 transition"
                                    >
                                        Retake Survey
                                    </button>
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
                                                        {course.difficulty}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {course.tags.map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="inline-block px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>

                                                <button className="w-full px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
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
        </StudentLayout>
    );
}
