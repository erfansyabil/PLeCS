import TeacherLayout from '@/Layouts/TeacherLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Create({ auth, layout, topic, course, courses }) {
    const [selectedCourse, setSelectedCourse] = useState(course?.id || '');
    const [courseTopics, setCourseTopics] = useState(topic ? [topic] : []);
    const [loadingTopics, setLoadingTopics] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        topic_id: topic?.topicID || '',
        title: '',
        description: '',
        type: 'Document',
        url: '',
        file: null,
    });

    const handleCourseChange = async (courseId) => {
        setSelectedCourse(courseId);
        setData('topic_id', '');

        if (courseId) {
            setLoadingTopics(true);
            try {
                const response = await fetch(route('teacher.additional-content.topics', courseId));
                const topics = await response.json();
                setCourseTopics(topics);
            } catch (error) {
                console.error('Error fetching topics:', error);
                setCourseTopics([]);
            } finally {
                setLoadingTopics(false);
            }
        } else {
            setCourseTopics([]);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('teacher.additional-content.store'), {
            forceFormData: true,
        });
    };

    return (
        <TeacherLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Add Additional Learning Content
                    </h2>
                    <Link
                        href={route('teacher.additional-content.index')}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Back to List
                    </Link>
                </div>
            }
        >
            <Head title="Add Additional Learning Content" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-600 overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6 text-gray-900 dark:text-white">
                            {course && (
                                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        <strong>Course:</strong> {course.title}
                                    </p>
                                    {topic && (
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            <strong>Topic:</strong> {topic.name}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="mb-4">
                                <label htmlFor="title" className="block text-sm font-medium mb-2">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                    required
                                />
                                {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="description" className="block text-sm font-medium mb-2">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows="4"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                />
                                {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="type" className="block text-sm font-medium mb-2">
                                    Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="type"
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                >
                                    <option value="Document">Document</option>
                                    <option value="Video">Video</option>
                                    <option value="Link">Link</option>
                                    <option value="Presentation">Presentation</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.type && <div className="text-red-500 text-sm mt-1">{errors.type}</div>}
                            </div>

                            {data.type === 'Link' && (
                                <div className="mb-6">
                                    <label htmlFor="url" className="block text-sm font-medium mb-2">
                                        URL <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="url"
                                        id="url"
                                        value={data.url}
                                        onChange={(e) => setData('url', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                        placeholder="https://example.com/resource"
                                    />
                                    {errors.url && <div className="text-red-500 text-sm mt-1">{errors.url}</div>}
                                </div>
                            )}

                            {data.type !== 'Link' && (
                                <div className="mb-6">
                                    <label htmlFor="file" className="block text-sm font-medium mb-2">
                                        File Upload
                                    </label>
                                    <input
                                        type="file"
                                        id="file"
                                        onChange={(e) => setData('file', e.target.files[0])}
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Supported formats: PDF, DOC, DOCX, JPG, PNG, WEBP (Max 10MB)
                                    </p>
                                    {errors.file && <div className="text-red-500 text-sm mt-1">{errors.file}</div>}
                                </div>
                            )}

                            {!topic && (
                                <>
                                    <div className="mb-4">
                                        <label htmlFor="course_id" className="block text-sm font-medium mb-2">
                                            Course <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="course_id"
                                            value={selectedCourse}
                                            onChange={(e) => handleCourseChange(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                        >
                                            <option value="">Select a course</option>
                                            {courses && courses.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {selectedCourse && (
                                        <div className="mb-4">
                                            <label htmlFor="topic_id" className="block text-sm font-medium mb-2">
                                                Topic <span className="text-red-500">*</span>
                                            </label>
                                            {loadingTopics ? (
                                                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500">
                                                    Loading topics...
                                                </div>
                                            ) : (
                                                <select
                                                    id="topic_id"
                                                    value={data.topic_id}
                                                    onChange={(e) => setData('topic_id', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                                    required
                                                >
                                                    <option value="">Select a topic</option>
                                                    {courseTopics && courseTopics.length > 0 ? (
                                                        courseTopics.map((t) => (
                                                            <option key={t.topicID} value={t.topicID}>
                                                                {t.name}
                                                            </option>
                                                        ))
                                                    ) : (
                                                        <option disabled>No topics available</option>
                                                    )}
                                                </select>
                                            )}
                                            {errors.topic_id && <div className="text-red-500 text-sm mt-1">{errors.topic_id}</div>}
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                                >
                                    {processing ? 'Creating...' : 'Create Material'}
                                </button>
                                <Link
                                    href={route('teacher.additional-content.index')}
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
}