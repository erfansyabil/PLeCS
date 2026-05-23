// resources/js/Pages/Student/LearningPathManager.jsx

import StudentLayout from '@/Layouts/StudentLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'; // install if needed

export default function LearningPathManager({ auth }) {
    const [learningPath, setLearningPath] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reordering, setReordering] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [showSurvey, setShowSurvey] = useState(false);
    const [surveyData, setSurveyData] = useState({
        form_level: 'Form 1',
        interests: '',
        background: 'none',
        learning_goal: 'interest',
    });

    useEffect(() => {
        fetchLearningPath();
    }, []);

    const fetchLearningPath = async () => {
        try {
            const res = await fetch('/student/learning-path/api');
            const data = await res.json();
            setLearningPath(data.learning_path);
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

        // Optimistic UI update
        setLearningPath({
            ...learningPath,
            courses: items,
        });

        // Persist new order
        setReordering(true);
        try {
            const courseOrder = items.map(c => c.id);
            await fetch('/student/learning-path/reorder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content },
                body: JSON.stringify({ course_order: courseOrder }),
            });
        } catch (error) {
            console.error('Reorder failed:', error);
            fetchLearningPath(); // revert on error
        } finally {
            setReordering(false);
        }
    };

    const handleClearPath = async () => {
        if (!confirm('Are you sure you want to clear your entire learning path? This will remove all course enrollments.')) return;
        try {
            await fetch('/student/learning-path/api', { method: 'DELETE', headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content } });
            setLearningPath(null);
        } catch (error) {
            console.error('Failed to clear path:', error);
        }
    };

    const handleGenerateFromSurvey = async (e) => {
        e.preventDefault();
        if (!surveyData.interests.trim()) {
            alert('Please enter your interests.');
            return;
        }
        setGenerating(true);
        try {
            const res = await fetch('/student/learning-path/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content },
                body: JSON.stringify(surveyData),
            });
            const data = await res.json();
            if (res.ok) {
                setLearningPath(data.learning_path);
                setShowSurvey(false);
                alert('New learning path generated!');
            } else {
                alert(data.message || 'Generation failed.');
            }
        } catch (error) {
            console.error('Generation error:', error);
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <StudentLayout header={<h2>My Learning Path</h2>}><div className="p-6">Loading...</div></StudentLayout>;

    return (
        <StudentLayout header={<h2 className="text-xl font-semibold">My Learning Path</h2>}>
            <Head title="Learning Path" />
            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {learningPath ? learningPath.pathName : 'No Active Learning Path'}
                                </h3>
                                <div className="space-x-2">
                                    <button
                                        onClick={() => setShowSurvey(!showSurvey)}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                    >
                                        {showSurvey ? 'Cancel' : 'Generate New Path'}
                                    </button>
                                    {learningPath && (
                                        <button
                                            onClick={handleClearPath}
                                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                        >
                                            Clear Path
                                        </button>
                                    )}
                                </div>
                            </div>

                            {showSurvey && (
                                <form onSubmit={handleGenerateFromSurvey} className="mb-8 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
                                    <h4 className="font-semibold mb-4">Tell us about your interests</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium">Form Level</label>
                                            <select
                                                value={surveyData.form_level}
                                                onChange={e => setSurveyData({...surveyData, form_level: e.target.value})}
                                                className="mt-1 w-full p-2 border rounded"
                                            >
                                                <option>Form 1</option><option>Form 2</option><option>Form 3</option>
                                                <option>Form 4</option><option>Form 5</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Interests (comma separated)</label>
                                            <input
                                                type="text"
                                                value={surveyData.interests}
                                                onChange={e => setSurveyData({...surveyData, interests: e.target.value})}
                                                placeholder="e.g., AI, Web Development, Cybersecurity"
                                                className="mt-1 w-full p-2 border rounded"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Background</label>
                                            <select
                                                value={surveyData.background}
                                                onChange={e => setSurveyData({...surveyData, background: e.target.value})}
                                                className="mt-1 w-full p-2 border rounded"
                                            >
                                                <option value="none">None</option>
                                                <option value="basic">Basic</option>
                                                <option value="intermediate">Intermediate</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Learning Goal</label>
                                            <select
                                                value={surveyData.learning_goal}
                                                onChange={e => setSurveyData({...surveyData, learning_goal: e.target.value})}
                                                className="mt-1 w-full p-2 border rounded"
                                            >
                                                <option value="career">Career</option>
                                                <option value="exam">Exam Preparation</option>
                                                <option value="interest">General Interest</option>
                                            </select>
                                        </div>
                                        <button type="submit" disabled={generating} className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400">
                                            {generating ? 'Generating...' : 'Generate New Path'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {learningPath && learningPath.courses.length === 0 && (
                                <p className="text-gray-500 dark:text-gray-400">Your learning path is empty. Enroll in courses to build it.</p>
                            )}

                            {learningPath && learningPath.courses.length > 0 && (
                                <>
                                    <div className="mb-4">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${learningPath.progress}%` }}></div>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">Overall Progress: {learningPath.progress}%</p>
                                    </div>

                                    <DragDropContext onDragEnd={handleDragEnd}>
                                        <Droppable droppableId="courses">
                                            {(provided) => (
                                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                                    {learningPath.courses.map((course, index) => (
                                                        <Draggable key={course.id} draggableId={course.id.toString()} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className={`p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-700 flex items-center justify-between ${snapshot.isDragging ? 'shadow-lg opacity-50' : ''}`}
                                                                >
                                                                    <div className="flex items-center space-x-3">
                                                                        <span className="text-gray-400 cursor-move">☰</span>
                                                                        <div>
                                                                            <h4 className="font-medium">{course.title}</h4>
                                                                            <p className="text-sm text-gray-500">{course.description?.substring(0, 80)}</p>
                                                                        </div>
                                                                    </div>
                                                                    <a
                                                                        href={course.enroll_url}
                                                                        className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                                                                    >
                                                                        Go to Course
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </DragDropContext>

                                    {reordering && <p className="text-sm text-gray-400 mt-2">Saving new order...</p>}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}