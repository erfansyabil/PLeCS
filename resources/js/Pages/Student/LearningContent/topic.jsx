import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import StudentLayout from '@/Layouts/StudentLayout';
import TeacherLayout from '@/Layouts/TeacherLayout';
import AdministratorLayout from '@/Layouts/AdministratorLayout';
import { Head } from '@inertiajs/react';

export default function TopicPage({ topic, layout }) {

    // Determine which layout to use
        const getLayout = () => {
            switch (layout) {
                case 'StudentLayout':
                    return StudentLayout;
                case 'TeacherLayout':
                    return TeacherLayout;
                case 'AdministratorLayout':
                    return AdministratorLayout;
                default:
                    return AuthenticatedLayout; // fallback
            }
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

    const pdfUrl = topic?.resource_path ? `/storage/${topic.resource_path}` : null;
    const youtubeEmbedUrl = getYouTubeEmbedUrl(topic?.resource_url);
    const attachments = [...(topic?.attachments ?? [])].sort((left, right) => {
        const leftOrder = Number(left.sort_order ?? 0);
        const rightOrder = Number(right.sort_order ?? 0);
        return leftOrder - rightOrder || left.id - right.id;
    });

    if (!topic) {
        const LayoutComponent = getLayout();
        return (
            <LayoutComponent>
                <Head title="Topic Not Found" />
                <div className="p-6 text-gray-900 dark:text-white">
                    <h2 className="text-xl font-semibold mb-4">Topic Not Found</h2>
                    <p>The topic you are looking for does not exist.</p>
                </div>
            </LayoutComponent>
        );
    }

    const LayoutComponent = getLayout();
    return (
        <LayoutComponent
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {topic.title}
                </h2>
            }
        >
            <Head title={topic.title} />
            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-600 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-white">
                            <h3 className="text-lg font-bold mb-4">{topic.title}</h3>
                            <div
                                className="rounded border border-gray-200 dark:border-gray-500 bg-white/50 dark:bg-gray-700/40 p-4"
                                dangerouslySetInnerHTML={{ __html: topic.content || '<p>No content available yet.</p>' }}
                            />

                            {topic.resource_type === 'pdf' && pdfUrl && (
                                <div className="mt-6">
                                    <h4 className="font-semibold mb-2">PDF Resource</h4>
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
                                        className="inline-block mt-2 text-indigo-600 hover:text-indigo-800"
                                    >
                                        Open PDF in new tab
                                    </a>
                                </div>
                            )}

                            {topic.resource_type === 'youtube' && youtubeEmbedUrl && (
                                <div className="mt-6">
                                    <h4 className="font-semibold mb-2">Video Resource</h4>
                                    <div className="aspect-video">
                                        <iframe
                                            src={youtubeEmbedUrl}
                                            title="Topic video"
                                            className="w-full h-full rounded"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                </div>
                            )}

                            {attachments.length > 0 && (
                                <div className="mt-8 space-y-6">
                                    <h4 className="font-semibold">Attachments</h4>
                                    {attachments.map((attachment) => {
                                        const attachmentUrl = `/storage/${attachment.file_path}`;

                                        return (
                                            <div key={attachment.id} className="rounded border border-gray-200 dark:border-gray-500 p-4">
                                                <div className="mb-3">
                                                    <p className="font-semibold">{attachment.title || 'Attachment'}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-300">
                                                        {attachment.type.toUpperCase()} · Order {attachment.sort_order ?? 0}
                                                    </p>
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
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </LayoutComponent>
    );
}