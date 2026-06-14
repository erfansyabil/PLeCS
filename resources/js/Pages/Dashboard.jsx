import StudentLayout from '@/Layouts/StudentLayout';
import TeacherLayout from '@/Layouts/TeacherLayout';
import AdministratorLayout from '@/Layouts/AdministratorLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import Header from '@/Components/ui/Header';

// ─── Shared helpers ────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex flex-col gap-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
            <span className="text-2xl font-bold text-gray-800 dark:text-white">{value}</span>
            {sub && <span className="text-xs text-gray-400">{sub}</span>}
        </div>
    );
}

function SectionCard({ title, children }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">
                {title}
            </h2>
            {children}
        </div>
    );
}

function EmptyState({ message, actionLabel, actionHref }) {
    return (
        <div className="text-center py-8">
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">{message}</p>
            {actionLabel && (
                <Link
                    href={actionHref}
                    className="inline-block px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
                >
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}

// ─── Student sections ──────────────────────────────────────────────────────────

function ProgressBar({ value }) {
    return (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
                className="bg-indigo-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(value, 100)}%` }}
            />
        </div>
    );
}

function EnrolledCourses({ enrollments }) {
    if (enrollments.length === 0) {
        return (
            <EmptyState
                message="You are not enrolled in any course yet."
                actionLabel="Browse Courses"
                actionHref={route('student.learning-content.index')}
            />
        );
    }

    return (
        <div className="space-y-4">
            {enrollments.map((e) => (
                <div key={e.course_id} className="flex flex-col gap-1">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-200">
                            {e.course_title}
                        </span>
                        <span className="text-gray-400">{e.progress}%</span>
                    </div>
                    <ProgressBar value={e.progress} />
                </div>
            ))}
        </div>
    );
}

function RecentQuizzes({ attempts }) {
    if (attempts.length === 0) {
        return (
            <EmptyState
                message="No quiz attempts yet. Start practising!"
                actionLabel="Go to Assessments"
                actionHref={route('student.assessment.index')}
            />
        );
    }

    return (
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {attempts.map((a, i) => (
                <div key={i} className="py-3 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {a.quiz_title}
                        </p>
                        <p className="text-xs text-gray-400">{a.submitted_at}</p>
                    </div>
                    <div className="text-right">
                        <span
                            className={`text-sm font-semibold ${
                                a.passed
                                    ? 'text-green-500'
                                    : 'text-red-400'
                            }`}
                        >
                            {a.score}/{a.max_score}
                        </span>
                        <p className="text-xs text-gray-400">
                            {a.passed ? 'Passed' : 'Failed'}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

const BADGE_LABELS = {
    first_quiz:    '🎯 First Quiz',
    streak_3:      '🔥 3-Day Streak',
    streak_7:      '🔥 7-Day Streak',
    points_100:    '⭐ 100 Points',
    points_500:    '⭐ 500 Points',
    points_1000:   '🏆 1000 Points',
    perfect_score: '💯 Perfect Score',
};

function WeakTopics({ weakTopics }) {
    if (weakTopics.length === 0) {
        return (
            <p className="text-sm text-green-500 dark:text-green-400">
                No weak topics — keep it up!
            </p>
        );
    }

    return (
        <div className="space-y-2">
            {weakTopics.map((t, i) => (
                <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800"
                >
                    <div>
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">
                            {t.topic_name}
                        </p>
                        <p className="text-xs text-red-400">{t.course_title}</p>
                    </div>
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                        {t.average_score.toFixed(1)}%
                    </span>
                </div>
            ))}
        </div>
    );
}

function StudentDashboard({ auth, enrollments, recentAttempts, weakTopics, streak, points, badges }) {
    return (
        <div className="space-y-6">
            {/* Welcome + stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label="Points" value={points} />
                <StatCard
                    label="Streak"
                    value={`${streak} day${streak !== 1 ? 's' : ''}`}
                    sub={streak > 0 ? 'Keep it going!' : 'Attempt a quiz to start'}
                />
                <StatCard label="Enrolled Courses" value={enrollments.length} />
                <StatCard label="Weak Topics" value={weakTopics.length} sub={weakTopics.length > 0 ? 'Need attention' : 'All good'} />
            </div>

            {/* Badges */}
            {badges.length > 0 && (
                <SectionCard title="Your Badges">
                    <div className="flex flex-wrap gap-2">
                        {badges.map((b) => (
                            <span
                                key={b}
                                className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs rounded-full"
                            >
                                {BADGE_LABELS[b] ?? b}
                            </span>
                        ))}
                    </div>
                </SectionCard>
            )}

            {/* Course progress + recent quizzes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard title="Course Progress">
                    <EnrolledCourses enrollments={enrollments} />
                </SectionCard>

                <SectionCard title="Recent Quiz Attempts">
                    <RecentQuizzes attempts={recentAttempts} />
                </SectionCard>
            </div>

            {/* Weak topics */}
            <SectionCard title="Topics Needing Attention">
                <WeakTopics weakTopics={weakTopics} />
            </SectionCard>
        </div>
    );
}

// ─── Teacher sections ──────────────────────────────────────────────────────────

function TeacherDashboard({ auth, atRiskStudents, recentGuidance, totalStudents }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard label="Total Students" value={totalStudents} />
                <StatCard label="At-Risk Students" value={atRiskStudents.length} sub="Below 50% average" />
                <StatCard label="Guidance Sent" value={recentGuidance.length} sub="Recent" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard title="Students Needing Attention">
                    {atRiskStudents.length === 0 ? (
                        <p className="text-sm text-green-500">No at-risk students right now.</p>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {atRiskStudents.map((s, i) => (
                                <div key={i} className="py-3 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                            {s.student_name}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {s.topic_name} · {s.course_title}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-semibold text-red-500">
                                            {s.average_score.toFixed(1)}%
                                        </span>
                                        <Link
                                            href={route('teacher.guidance.show', s.student_id)}
                                            className="text-xs text-indigo-600 hover:underline"
                                        >
                                            Guide
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>

                <SectionCard title="Recent Guidance Sent">
                    {recentGuidance.length === 0 ? (
                        <EmptyState
                            message="No guidance sent yet."
                            actionLabel="Go to Guidance"
                            actionHref={route('teacher.guidance.index')}
                        />
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {recentGuidance.map((g, i) => (
                                <div key={i} className="py-3">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        {g.student_name}
                                        <span className="text-gray-400 font-normal"> · {g.topic_name}</span>
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                                        {g.comment}
                                    </p>
                                    <p className="text-xs text-gray-300 mt-0.5">{g.created_at}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>
            </div>
        </div>
    );
}

// ─── Admin sections ────────────────────────────────────────────────────────────

function AdminDashboard({ totalStudents, totalTeachers, totalCourses, lowPerformingCourses, topQuizzes }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <StatCard label="Total Students" value={totalStudents} />
                <StatCard label="Total Teachers" value={totalTeachers} />
                <StatCard label="Total Courses"  value={totalCourses} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard title="Courses with Lowest Average Score">
                    {lowPerformingCourses.length === 0 ? (
                        <p className="text-sm text-gray-400">No analytics data yet.</p>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {lowPerformingCourses.map((c, i) => (
                                <div key={i} className="py-3 flex justify-between">
                                    <span className="text-sm text-gray-700 dark:text-gray-200">
                                        {c.course_title}
                                    </span>
                                    <span className="text-sm font-semibold text-orange-500">
                                        {c.avg_score}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>

                <SectionCard title="Most Attempted Quizzes">
                    {topQuizzes.length === 0 ? (
                        <p className="text-sm text-gray-400">No quiz attempts yet.</p>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {topQuizzes.map((q, i) => (
                                <div key={i} className="py-3 flex justify-between">
                                    <span className="text-sm text-gray-700 dark:text-gray-200">
                                        {q.quiz_title}
                                    </span>
                                    <span className="text-sm font-semibold text-indigo-500">
                                        {q.attempt_count} attempts
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>
            </div>
        </div>
    );
}

// ─── Root ──────────────────────────────────────────────────────────────────────

export default function Dashboard(props) {
    const { auth } = usePage().props;
    const { layout } = props;

    const layouts = {
        StudentLayout:       StudentLayout,
        TeacherLayout:       TeacherLayout,
        AdministratorLayout: AdministratorLayout,
    };

    const LayoutComponent = layouts[layout] ?? StudentLayout;

    const roleSection = {
        StudentLayout:       <StudentDashboard {...props} auth={auth} />,
        TeacherLayout:       <TeacherDashboard {...props} auth={auth} />,
        AdministratorLayout: <AdminDashboard   {...props} />,
    };

    return (
        <LayoutComponent>
            <Head title="Dashboard" />
            <Header title="Dashboard" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                            Welcome back, {auth.user.name}!
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {auth.user.role.charAt(0).toUpperCase() + auth.user.role.slice(1)}
                        </p>
                    </div>
                    {roleSection[layout]}
                </div>
            </div>
        </LayoutComponent>
    );
}