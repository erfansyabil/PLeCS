// resources/js/Pages/Student/LearningPath/index.jsx
import StudentLayout from '@/Layouts/StudentLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Link } from '@inertiajs/react';
import Header from '@/Components/ui/Header';
import PrimaryButton from '@/Components/ui/PrimaryButton';

export default function LearningPathIndex({ auth }) {
    const [learningPath, setLearningPath] = useState(null);
    const [draftLearningPath, setDraftLearningPath] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reordering, setReordering] = useState(false);
    const [activating, setActivating] = useState(false);

    useEffect(() => {
        fetchLearningPath();
    }, []);

    const fetchLearningPath = async () => {
        try {
            const res = await fetch('/student/learning-path/api');
            const data = await res.json();
            setLearningPath(data.learning_path);
            setDraftLearningPath(data.draft_learning_path);
        } catch (error) {
            console.error('Failed to fetch learning path:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = async (result) => {
        if (!result.destination || !learningPath) return;
        const items = Array.from(learningPath.courses);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setLearningPath({ ...learningPath, courses: items });
        setReordering(true);

        try {
            const courseOrder = items.map(c => c.id);
            await fetch('/student/learning-path/reorder', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({ course_order: courseOrder }),
            });
        } catch (error) {
            console.error('Reorder failed:', error);
            fetchLearningPath();
        } finally {
            setReordering(false);
        }
    };

    const handleClearPath = async () => {
        if (!confirm('Clear your entire learning path? This will remove all course enrollments.')) return;
        try {
            await fetch('/student/learning-path/api', { 
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content }
            });
            await fetchLearningPath();
        } catch (error) {
            console.error('Failed to clear path:', error);
        }
    };

    const handleActivateDraft = async () => {
        if (!draftLearningPath) return;

        setActivating(true);

        try {
            const response = await fetch(route('student.learning-path.api.activate', { path: draftLearningPath.pathID }), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(payload.message || 'Unable to activate the draft path.');
            }

            await fetchLearningPath();
        } catch (error) {
            console.error('Failed to activate draft path:', error);
            alert(error.message || 'Unable to activate the draft path.');
        } finally {
            setActivating(false);
        }
    };

    if (loading) return <StudentLayout header={<h2>My Learning Path</h2>}><div>Loading...</div></StudentLayout>;

    return (
        <StudentLayout>
            <Head title="Learning Path" />
            <Header title="My Learning Path" />
            <div className="py-12">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                {learningPath ? learningPath.pathName : 'No Active Learning Path'}
                            </h3>
                            {(learningPath || draftLearningPath) && (
                                <PrimaryButton
                                    onClick={handleClearPath}
                                    variant="danger"
                                    size="md"
                                >
                                    Clear Path
                                </PrimaryButton>
                            )}
                        </div>

                        {!learningPath && (
                            <p className="text-gray-500">
                                You don’t have an active learning path yet. 
                                <Link href="/student/enrollment" className="text-indigo-600 ml-1">Take the survey</Link> to get started.
                            </p>
                        )}

                        {draftLearningPath && (
                            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h4 className="font-semibold text-amber-900 text-gray-800 dark:text-gray-200">Draft Learning Path Ready</h4>
                                        <p className="text-sm text-amber-800">
                                            {draftLearningPath.pathName} is saved as a draft. Activate it when you want these courses to become your active path.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleActivateDraft}
                                        disabled={activating}
                                        className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:bg-amber-400"
                                    >
                                        {activating ? 'Activating...' : 'Activate Draft Path'}
                                    </button>
                                </div>
                                <div className="mt-4 space-y-2">
                                    {draftLearningPath.courses?.map((course, index) => (
                                        <div key={course.id} className="text-sm text-amber-900 flex items-center justify-between gap-4">
                                            <span>{index + 1}. {course.title}</span>
                                            <span className="text-amber-700">{course.difficulty}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {learningPath && learningPath.courses.length === 0 && (
                            <p>Your learning path is empty. Enroll in courses to build it.</p>
                        )}

                        {learningPath && learningPath.next_course && (
                            <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                                <h4 className="font-semibold text-indigo-800">Next Recommended Course</h4>
                                <p className="text-indigo-700">{learningPath.next_course.title}</p>
                                <Link href={learningPath.next_course.enroll_url} className="mt-2 inline-block px-3 py-1 bg-indigo-600 text-white rounded">
                                    Start This Course
                                </Link>
                            </div>
                        )}

                        {learningPath && learningPath.courses.length > 0 && (
                            <>
                                <div className="mb-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${learningPath.progress}%` }}></div>
                                    </div>
                                    <p className="text-sm mt-1 text-gray-800 dark:text-gray-200">Overall Progress: {learningPath.progress}%</p>
                                </div>

                                <DragDropContext onDragEnd={handleDragEnd}>
                                    <Droppable droppableId="courses">
                                        {(provided) => (
                                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                                {learningPath.courses.map((course, idx) => (
                                                    <Draggable key={course.id} draggableId={String(course.id)} index={idx}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`p-4 border rounded flex items-center justify-between ${snapshot.isDragging ? 'opacity-50' : ''}`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <span className="cursor-move">☰</span>
                                                                    <div>
                                                                        <h4 className="font-medium text-sm text-gray-500 dark:text-gray-300">{course.title}</h4>
                                                                        <div
                                                                            className="rich-content text-sm text-gray-500 dark:text-gray-300"
                                                                            dangerouslySetInnerHTML={{ __html: course.description?.substring(0, 80) }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <PrimaryButton href={course.enroll_url} variant="secondary" size="md">
                                                                    Go
                                                                </PrimaryButton>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                                {reordering && <p className="text-sm text-gray-400 mt-2">Saving order...</p>}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}