import TeacherLayout from '@/Layouts/TeacherLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import Header from '@/Components/ui/Header';
import { useState } from 'react';

function RiskBadge({ isAtRisk }) {
    if (!isAtRisk) return null;
    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
            At Risk
        </span>
    );
}

function ScoreBadge({ score }) {
    const color =
        score >= 70 ? 'text-green-600 dark:text-green-400' :
        score >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400';
    return (
        <span className={`text-sm font-semibold ${color}`}>
            {score.toFixed(1)}%
        </span>
    );
}

export default function FeedbackAndGuidanceIndex({ students, courses, selectedCourseId, showAtRisk }) {
    const [search, setSearch] = useState('');
    const [atRiskOnly, setAtRiskOnly] = useState(showAtRisk ?? false);

    const handleCourseFilter = (courseId) => {
        router.get(route('teacher.guidance.index'), {
            course_id:   courseId || undefined,
            at_risk:     atRiskOnly ? 1 : undefined,
        }, { preserveState: true });
    };

    const handleAtRiskToggle = () => {
        const next = !atRiskOnly;
        setAtRiskOnly(next);
        router.get(route('teacher.guidance.index'), {
            course_id: selectedCourseId || undefined,
            at_risk:   next ? 1 : undefined,
        }, { preserveState: true });
    };

    const filtered = students.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <TeacherLayout>
            <Head title="Feedback and Guidance" />
            <Header title="Feedback & Guidance" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg p-6">

                        {/* Filters row */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-6">

                            {/* Search */}
                            <input
                                type="text"
                                placeholder="Search student name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex-1 rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                            />

                            {/* Course filter */}
                            <select
                                value={selectedCourseId ?? ''}
                                onChange={(e) => handleCourseFilter(e.target.value)}
                                className="rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                            >
                                <option value="">All Courses</option>
                                {courses.map((c) => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>

                            {/* At-risk toggle */}
                            <button
                                onClick={handleAtRiskToggle}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                    atRiskOnly
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                {atRiskOnly ? '⚠ At-Risk Only' : 'Show All'}
                            </button>
                        </div>

                        {/* Student count */}
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            {filtered.length} student{filtered.length !== 1 ? 's' : ''} found
                        </p>

                        {/* Table */}
                        {filtered.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-400 dark:text-gray-500 text-sm">
                                    No students match the current filters.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="pb-3 font-medium text-gray-600 dark:text-gray-400">Student</th>
                                            <th className="pb-3 font-medium text-gray-600 dark:text-gray-400">Course</th>
                                            <th className="pb-3 font-medium text-gray-600 dark:text-gray-400">Avg Score</th>
                                            <th className="pb-3 font-medium text-gray-600 dark:text-gray-400">Topics Attempted</th>
                                            <th className="pb-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                                            <th className="pb-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {filtered.map((s) => (
                                            <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                                                <td className="py-3 pr-4">
                                                    <p className="font-medium text-gray-800 dark:text-white">{s.name}</p>
                                                    <p className="text-xs text-gray-400">{s.email}</p>
                                                </td>
                                                <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">
                                                    {s.course_title}
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <ScoreBadge score={s.average_score} />
                                                </td>
                                                <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">
                                                    {s.topics_attempted}
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <RiskBadge isAtRisk={s.is_at_risk} />
                                                </td>
                                                <td className="py-3 text-right">
                                                    <Link
                                                        href={route('teacher.guidance.show', s.id)}
                                                        className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition"
                                                    >
                                                        Guide
                                                    </Link>
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
        </TeacherLayout>
    );
}