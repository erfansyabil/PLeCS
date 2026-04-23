import AdministratorLayout from '@/Layouts/AdministratorLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Show({ content, topics = [] }) {
    const materialData = content;

    const deleteCourse = () => {
        if (!confirm('Are you sure you want to delete this course? This will also delete all topics under it.')) {
            return;
        }

        router.delete(route('admin.learning-content.destroy', materialData.id));
    };

    const deleteTopic = (topicId) => {
        if (!confirm('Are you sure you want to delete this topic?')) {
            return;
        }

        router.delete(route('admin.learning-content.destroy', topicId), {
            preserveScroll: true,
        });
    };

    const getYouTubeEmbedUrl = (url) => {
        if (!url) {
            return null;
        }

        const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
        if (!match) {
            return null;
        }

        return `https://www.youtube.com/embed/${match[1]}`;
    };

    const pdfUrl = materialData.resource_path ? `/storage/${materialData.resource_path}` : null;
    const youtubeEmbedUrl = getYouTubeEmbedUrl(materialData.resource_url);
    const blocks = [...(materialData.blocks ?? [])].sort((left, right) => {
        const leftOrder = Number(left.sort_order ?? 0);
        const rightOrder = Number(right.sort_order ?? 0);
        return leftOrder - rightOrder || left.id - right.id;
    });
    const attachments = [...(materialData.attachments ?? [])].sort((left, right) => {
        const leftOrder = Number(left.sort_order ?? 0);
        const rightOrder = Number(right.sort_order ?? 0);
        return leftOrder - rightOrder || left.id - right.id;
    });

    const getBlockFileUrl = (path) => {
        if (!path) {
            return null;
        }

        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }

        return `/storage/${path}`;
    };

    return (
        <AdministratorLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Learning Content Details
                    </h2>
                    <Link
                        href={route('admin.learning-content.index')}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Back to List
                    </Link>
                </div>
            }
        >
            <Head title="Learning Content Details" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-600 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-white">
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold mb-2">{materialData.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">{materialData.description}</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <strong>Type:</strong> {materialData.type}
                                    </div>
                                    <div>
                                        <strong>Created:</strong> {new Date(materialData.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                {blocks.length > 0 && (
                                    <div className="mb-6">
                                        <strong>Ordered Topic Blocks:</strong>
                                        <div className="mt-3 space-y-4">
                                            {blocks.map((block) => {
                                                const blockFileUrl = getBlockFileUrl(block.file_path);
                                                const blockVideoUrl = getYouTubeEmbedUrl(block.url);

                                                return (
                                                    <div key={block.id} className="rounded border border-gray-200 dark:border-gray-500 p-4">
                                                        <div className="mb-2 text-sm text-gray-500 dark:text-gray-300">
                                                            {/* {block.type.toUpperCase()} · Order {block.sort_order ?? 0} */}
                                                        </div>
                                                        {block.title && <p className="font-semibold mb-3">{block.title}</p>}

                                                        {block.type === 'text' && (
                                                            <div dangerouslySetInnerHTML={{ __html: block.content || '<p>No content provided.</p>' }} />
                                                        )}

                                                        {block.type === 'youtube' && blockVideoUrl && (
                                                            <div className="aspect-video">
                                                                <iframe
                                                                    src={blockVideoUrl}
                                                                    title={block.title || 'YouTube video'}
                                                                    className="w-full h-full rounded"
                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                    allowFullScreen
                                                                />
                                                            </div>
                                                        )}

                                                        {block.type === 'pdf' && blockFileUrl && (
                                                            <div className="rounded border border-gray-200 dark:border-gray-500 overflow-hidden">
                                                                <iframe
                                                                    src={blockFileUrl}
                                                                    title={block.title || 'PDF block'}
                                                                    className="w-full h-[640px]"
                                                                />
                                                            </div>
                                                        )}

                                                        {block.type === 'image' && blockFileUrl && (
                                                            <img
                                                                src={blockFileUrl}
                                                                alt={block.title || 'Image block'}
                                                                className="max-h-[640px] w-full object-contain rounded"
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {blocks.length === 0 && materialData.content && (
                                    <div className="mb-6">
                                        <strong>Content:</strong>
                                        <div
                                            className="mt-2 rounded border border-gray-200 dark:border-gray-500 bg-white/50 dark:bg-gray-700/40 p-4"
                                            dangerouslySetInnerHTML={{ __html: materialData.content }}
                                        />
                                    </div>
                                )}

                                {blocks.length === 0 && materialData.type === 'topic' && materialData.resource_type !== 'none' && (
                                    <div className="mb-6">
                                        <strong>Media Resource:</strong>

                                        {materialData.resource_type === 'pdf' && pdfUrl && (
                                            <div className="mt-2">
                                                <div className="rounded border border-gray-200 dark:border-gray-500 overflow-hidden">
                                                    <iframe
                                                        src={pdfUrl}
                                                        title="Topic PDF"
                                                        className="w-full h-[640px]"
                                                    />
                                                </div>
                                                <a
                                                    href={pdfUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-block mt-2 text-indigo-600 hover:text-indigo-900 dark:text-indigo-300 dark:hover:text-indigo-200"
                                                >
                                                    Open PDF in new tab
                                                </a>
                                            </div>
                                        )}

                                        {materialData.resource_type === 'youtube' && youtubeEmbedUrl && (
                                            <div className="mt-3">
                                                <div className="aspect-video">
                                                    <iframe
                                                        src={youtubeEmbedUrl}
                                                        title="YouTube video"
                                                        className="w-full h-full rounded"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {attachments.length > 0 && (
                                    <div className="mb-6">
                                        <strong>Attachments:</strong>
                                        <div className="mt-3 space-y-6">
                                            {attachments.map((attachment) => {
                                                const attachmentUrl = `/storage/${attachment.file_path}`;

                                                return (
                                                    <div key={attachment.id} className="rounded border border-gray-200 dark:border-gray-500 p-4">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div>
                                                                <p className="font-semibold">{attachment.title || 'Attachment'}</p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-300">
                                                                    {attachment.type.toUpperCase()} · Order {attachment.sort_order ?? 0}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {attachment.type === 'image' && (
                                                            <img
                                                                src={attachmentUrl}
                                                                alt={attachment.title || 'Attachment image'}
                                                                className="max-h-[640px] w-full object-contain rounded"
                                                            />
                                                        )}

                                                        {attachment.type === 'pdf' && (
                                                            <div className="rounded border border-gray-200 dark:border-gray-500 overflow-hidden">
                                                                <iframe
                                                                    src={attachmentUrl}
                                                                    title={attachment.title || 'Attachment PDF'}
                                                                    className="w-full h-[640px]"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {topics.length > 0 && (
                                    <div className="mb-6">
                                        <strong>Topics:</strong>
                                        <ul className="mt-2 space-y-2">
                                            {topics.map((topic) => (
                                                <li key={topic.id} className="flex items-center justify-between rounded border border-gray-200 dark:border-gray-500 px-3 py-2">
                                                    <span>{topic.title}</span>
                                                    <Link
                                                        href={route('admin.learning-content.show', topic.id)}
                                                        className="text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-300 dark:hover:text-indigo-200"
                                                    >
                                                        View
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteTopic(topic.id)}
                                                        className="text-sm text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                    >
                                                        Delete
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="flex space-x-4">
                                <Link
                                    href={route('admin.learning-content.edit', materialData.id)}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Edit
                                </Link>
                                <button
                                    type="button"
                                    onClick={materialData.type === 'course' ? deleteCourse : () => deleteTopic(materialData.id)}
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    {materialData.type === 'course' ? 'Delete Course' : 'Delete Topic'}
                                </button>
                                <Link
                                    href={route('admin.learning-content.index')}
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Back to List
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdministratorLayout>
    );
}