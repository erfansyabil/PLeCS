import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function History({ enrollments }) {
    const [reEnrolling, setReEnrolling] = useState(null);

    const handleReEnroll = async (enrollmentId, courseId) => {
        if (!confirm('Re-enroll in this course? Your progress will reset.')) return;
        setReEnrolling(enrollmentId);
        try {
            const response = await fetch('/student/enrollment/enroll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: JSON.stringify({ courseID: courseId }),
            });
            const data = await response.json();
            if (response.ok) {
                alert('Successfully re-enrolled!');
                router.reload(); // refresh the page to show updated status
            } else {
                alert(data.message || 'Re-enrollment failed.');
            }
        } catch (error) {
            alert('Network error. Please try again.');
        } finally {
            setReEnrolling(null);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            active: 'bg-green-100 text-green-800',
            completed: 'bg-blue-100 text-blue-800',
            dropped: 'bg-red-100 text-red-800',
        };
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>{status}</span>;
    };

    return (
        <StudentLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-600 dark:text-gray-300 text-sm">Enrollment History</h2>}>
            <Head title="Enrollment History" />
            <div className="py-12">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {enrollments.data?.length === 0 ? (
                                <p className="text-gray-500">No enrollments found.</p>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled At</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed At</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {enrollments.data.map((enrollment) => (
                                                    <tr key={enrollment.id}>
                                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                            {enrollment.course_title}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {getStatusBadge(enrollment.status)}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {enrollment.progress}%
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {enrollment.enrolled_at || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {enrollment.completed_at || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm space-x-2">
                                                            {enrollment.status === 'active' && (
                                                                <Link
                                                                    href={enrollment.course_url}
                                                                    className="inline-block px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
                                                                >
                                                                    Continue
                                                                </Link>
                                                            )}
                                                            {enrollment.status === 'completed' && (
                                                                <Link
                                                                    href={enrollment.course_url}
                                                                    className="inline-block px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                                                                >
                                                                    Review
                                                                </Link>
                                                            )}
                                                            {enrollment.status === 'dropped' && (
                                                                <button
                                                                    onClick={() => handleReEnroll(enrollment.id, enrollment.course_id)}
                                                                    disabled={reEnrolling === enrollment.id}
                                                                    className="inline-block px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                                                                >
                                                                    {reEnrolling === enrollment.id ? '...' : 'Re-enroll'}
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {enrollments.links && (
                                        <div className="mt-6 flex justify-center">
                                            <div className="flex space-x-1">
                                                {enrollments.links.map((link, idx) => (
                                                    <Link
                                                        key={idx}
                                                        href={link.url || '#'}
                                                        className={`px-3 py-1 rounded ${link.active ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}