import TeacherLayout from '@/Layouts/TeacherLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ topics = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        topic_id: '',
        attachments: [
            {
                title: '',
                type: 'pdf',
                sort_order: 0,
                file: null,
            },
        ],
    });

    const addAttachment = () => {
        setData('attachments', [
            ...data.attachments,
            {
                title: '',
                type: 'pdf',
                sort_order: data.attachments.length,
                file: null,
            },
        ]);
    };

    const updateAttachment = (index, field, value) => {
        const nextAttachments = [...data.attachments];
        nextAttachments[index] = {
            ...nextAttachments[index],
            [field]: value,
        };
        setData('attachments', nextAttachments);
    };

    const removeAttachment = (index) => {
        setData('attachments', data.attachments.filter((_, currentIndex) => currentIndex !== index));
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
                        Add Additional Files
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
            <Head title="Add Additional Files" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-600 overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6 text-gray-900 dark:text-white">
                            <div className="mb-4">
                                <label htmlFor="topic_id" className="block text-sm font-medium mb-2">
                                    Topic
                                </label>
                                <select
                                    id="topic_id"
                                    value={data.topic_id}
                                    onChange={(e) => setData('topic_id', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                    required
                                >
                                    <option value="">Select a topic</option>
                                    {topics.map((topic) => (
                                        <option key={topic.id} value={topic.id}>
                                            {topic.course_title} - {topic.title}
                                        </option>
                                    ))}
                                </select>
                                {errors.topic_id && <div className="text-red-500 text-sm mt-1">{errors.topic_id}</div>}
                            </div>

                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium">Additional Files</label>
                                    <button
                                        type="button"
                                        onClick={addAttachment}
                                        className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
                                    >
                                        Add File
                                    </button>
                                </div>

                                <p className="text-xs text-gray-500 dark:text-gray-300 mb-3">
                                    Upload PDF or image files for the selected topic. Lower sort order appears first.
                                </p>

                                <div className="space-y-4">
                                    {data.attachments.map((attachment, index) => (
                                        <div key={index} className="rounded-lg border border-gray-200 dark:border-gray-500 p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Title</label>
                                                    <input
                                                        type="text"
                                                        value={attachment.title}
                                                        onChange={(e) => updateAttachment(index, 'title', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Type</label>
                                                    <select
                                                        value={attachment.type}
                                                        onChange={(e) => updateAttachment(index, 'type', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                                    >
                                                        <option value="pdf">PDF</option>
                                                        <option value="image">Image</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Sort Order</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={attachment.sort_order}
                                                        onChange={(e) => updateAttachment(index, 'sort_order', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <label className="block text-sm font-medium mb-2">File</label>
                                                <input
                                                    type="file"
                                                    accept="application/pdf,image/*"
                                                    onChange={(e) => updateAttachment(index, 'file', e.target.files?.[0] ?? null)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                                    required
                                                />
                                                {errors[`attachments.${index}.file`] && (
                                                    <div className="text-red-500 text-sm mt-1">{errors[`attachments.${index}.file`]}</div>
                                                )}
                                            </div>

                                            <div className="mt-3 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => removeAttachment(index)}
                                                    className="text-sm text-red-600 hover:text-red-800 dark:text-red-300 dark:hover:text-red-200"
                                                    disabled={data.attachments.length === 1}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {errors.attachments && <div className="text-red-500 text-sm mt-2">{errors.attachments}</div>}
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                                >
                                    {processing ? 'Uploading...' : 'Upload Files'}
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