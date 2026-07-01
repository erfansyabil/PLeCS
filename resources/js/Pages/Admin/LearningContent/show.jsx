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

        router.delete(route('admin.learning-content.topic.destroy', topicId), {
            preserveScroll: true,
        });
    };

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
        if (!match) return null;
        return `https://www.youtube.com/embed/${match[1]}`;
    };

    const pdfUrl = materialData.resource_path ? `/storage/${materialData.resource_path}` : null;
    const youtubeEmbedUrl = getYouTubeEmbedUrl(materialData.resource_url);
    const blocks = [...(materialData.blocks ?? [])].sort((a, b) =>
        (Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)) || (a.id - b.id)
    );
    const attachments = [...(materialData.attachments ?? [])].sort((a, b) =>
        (Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)) || (a.id - b.id)
    );

    const getBlockFileUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        return `/storage/${path}`;
    };

    return (
        <AdministratorLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">
                            {materialData.type === 'course' ? 'Course Details' : 'Topic Details'}
                        </h2>
                        <p className="mt-0.5 text-sm text-slate-400">{materialData.title}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.learning-content.edit', materialData.id)}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                            Edit
                        </Link>
                        <button
                            type="button"
                            onClick={materialData.type === 'course' ? deleteCourse : () => deleteTopic(materialData.id)}
                            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                            {materialData.type === 'course' ? 'Delete Course' : 'Delete Topic'}
                        </button>
                        <Link
                            href={route('admin.learning-content.index')}
                            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                        >
                            Back
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Learning Content Details" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* Info card */}
                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-sm">
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <h3 className="text-2xl font-bold text-slate-100">{materialData.title}</h3>
                            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${materialData.type === 'course' ? 'bg-indigo-900/50 text-indigo-300' : 'bg-cyan-900/50 text-cyan-300'}`}>
                                {materialData.type}
                            </span>
                        </div>

                        <div
                            className="rich-content text-sm text-slate-400 mb-4"
                            dangerouslySetInnerHTML={{ __html: materialData.description || '' }}
                        />

                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400 border-t border-slate-800 pt-4">
                            <span>Created: <strong className="text-slate-300">{new Date(materialData.created_at).toLocaleDateString()}</strong></span>
                        </div>
                    </div>

                    {/* Prerequisites */}
                    {materialData.prerequisites && Array.isArray(materialData.prerequisites) && materialData.prerequisites.length > 0 && (
                        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-sm">
                            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Prerequisite{materialData.prerequisites.length !== 1 ? 's' : ''}
                            </h4>
                            <ul className="space-y-2">
                                {materialData.prerequisites.map((prereq) => (
                                    <li key={prereq.id}>
                                        <Link
                                            href={route('admin.learning-content.show', prereq.id)}
                                            className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-indigo-400 hover:bg-indigo-900/30 hover:border-indigo-700"
                                        >
                                            <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                            {prereq.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Legacy content */}
                    {blocks.length === 0 && materialData.content && (
                        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-sm">
                            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Content</h4>
                            <div
                                className="rounded-lg border border-slate-800 bg-slate-800 p-4 text-sm text-slate-300"
                                dangerouslySetInnerHTML={{ __html: materialData.content }}
                            />
                        </div>
                    )}

                    {/* Legacy media */}
                    {blocks.length === 0 && materialData.type === 'topic' && materialData.resource_type !== 'none' && (
                        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-sm">
                            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Media Resource</h4>

                            {materialData.resource_type === 'pdf' && pdfUrl && (
                                <div>
                                    <div className="overflow-hidden rounded-lg border border-slate-700">
                                        <iframe src={pdfUrl} title="Topic PDF" className="w-full h-[640px]" />
                                    </div>
                                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-indigo-400 hover:text-indigo-300">
                                        Open PDF in new tab →
                                    </a>
                                </div>
                            )}

                            {materialData.resource_type === 'youtube' && youtubeEmbedUrl && (
                                <div className="aspect-video rounded-lg overflow-hidden">
                                    <iframe
                                        src={youtubeEmbedUrl}
                                        title="YouTube video"
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Attachments */}
                    {attachments.length > 0 && (
                        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-sm">
                            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Attachments</h4>
                            <div className="space-y-4">
                                {attachments.map((attachment) => {
                                    const attachmentUrl = `/storage/${attachment.file_path}`;
                                    return (
                                        <div key={attachment.id} className="rounded-lg border border-slate-700 p-4">
                                            <div className="mb-3 flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-slate-100">{attachment.title || 'Attachment'}</p>
                                                    <p className="text-xs text-slate-400">
                                                        {attachment.type.toUpperCase()} · Order {attachment.sort_order ?? 0}
                                                    </p>
                                                </div>
                                            </div>

                                            {attachment.type === 'image' && (
                                                <img
                                                    src={attachmentUrl}
                                                    alt={attachment.title || 'Attachment image'}
                                                    className="max-h-[640px] w-full object-contain rounded-lg"
                                                />
                                            )}

                                            {attachment.type === 'pdf' && (
                                                <div className="overflow-hidden rounded-lg border border-slate-700">
                                                    <iframe src={attachmentUrl} title={attachment.title || 'PDF'} className="w-full h-[640px]" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Topics */}
                    {topics.length > 0 && (
                        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-sm">
                            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Topics ({topics.length})
                            </h4>
                            <ul className="space-y-2">
                                {topics.map((topic) => (
                                    <li key={topic.id} className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 px-4 py-3 hover:bg-slate-800">
                                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-100">{topic.title}</span>
                                        <div className="flex shrink-0 items-center gap-4 text-sm">
                                            <Link
                                                href={route('admin.learning-content.topic.show', [materialData.id, topic.id])}
                                                className="font-medium text-indigo-400 hover:text-indigo-300"
                                            >
                                                View
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => deleteTopic(topic.id)}
                                                className="font-medium text-red-400 hover:text-red-300"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </AdministratorLayout>
    );
}
