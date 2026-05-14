import AdministratorLayout from '@/Layouts/AdministratorLayout';
import { Head, Link } from '@inertiajs/react';
import { useMemo } from 'react';

export default function TopicPage({ topic }) {

    const getYouTubeEmbedUrl = (url) => {
        if (!url) {
            return null;
        }

        const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
        if (!match) {
            return null;
        }

        return `https://www.youtube.com/embed/${match[1]}`;
    };

    const renderedContent = useMemo(() => {
        if (!topic?.content) {
            return '<p>No content available yet.</p>';
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(topic.content, 'text/html');
        const youtubeUrlPattern = /https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)[^\s<]+|youtu\.be\/[^\s<]+)/gi;
        const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
        const textNodes = [];

        while (walker.nextNode()) {
            textNodes.push(walker.currentNode);
        }

        textNodes.forEach((textNode) => {
            const parentTag = textNode.parentElement?.tagName;
            if (parentTag === 'A' || parentTag === 'SCRIPT' || parentTag === 'STYLE' || parentTag === 'IFRAME' || parentTag === 'CODE' || parentTag === 'PRE') {
                return;
            }

            const text = textNode.textContent ?? '';
            const matches = [...text.matchAll(youtubeUrlPattern)];
            if (matches.length === 0) {
                return;
            }

            const fragment = doc.createDocumentFragment();
            let cursor = 0;

            matches.forEach((match) => {
                const matchedUrl = match[0];
                const matchIndex = match.index ?? 0;

                if (matchIndex > cursor) {
                    fragment.appendChild(doc.createTextNode(text.slice(cursor, matchIndex)));
                }

                const embedUrl = getYouTubeEmbedUrl(matchedUrl);
                if (embedUrl) {
                    const iframe = doc.createElement('iframe');
                    iframe.setAttribute('src', embedUrl);
                    iframe.setAttribute('title', 'Embedded YouTube video');
                    iframe.setAttribute('class', 'w-full aspect-video my-4 rounded');
                    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
                    iframe.setAttribute('allowfullscreen', '');
                    fragment.appendChild(iframe);
                } else {
                    fragment.appendChild(doc.createTextNode(matchedUrl));
                }

                cursor = matchIndex + matchedUrl.length;
            });

            if (cursor < text.length) {
                fragment.appendChild(doc.createTextNode(text.slice(cursor)));
            }

            textNode.replaceWith(fragment);
        });

        const anchors = doc.querySelectorAll('a[href]');

        anchors.forEach((anchor) => {
            const href = anchor.getAttribute('href');
            const embedUrl = getYouTubeEmbedUrl(href ?? '');

            if (!embedUrl) {
                return;
            }

            const wrapper = doc.createElement('div');
            wrapper.className = 'aspect-video my-4';

            const iframe = doc.createElement('iframe');
            iframe.setAttribute('src', embedUrl);
            iframe.setAttribute('title', 'Embedded YouTube video');
            iframe.setAttribute('class', 'w-full h-full rounded');
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
            iframe.setAttribute('allowfullscreen', '');

            wrapper.appendChild(iframe);
            anchor.replaceWith(wrapper);
        });

        return doc.body.innerHTML;
    }, [topic?.content]);

    const pdfUrl = topic?.resource_path ? `/storage/${topic.resource_path}` : null;
    const youtubeEmbedUrl = getYouTubeEmbedUrl(topic?.resource_url);
    const blocks = [...(topic?.blocks ?? [])].sort((left, right) => {
        const leftOrder = Number(left.sort_order ?? 0);
        const rightOrder = Number(right.sort_order ?? 0);
        return leftOrder - rightOrder || left.id - right.id;
    });
    const attachments = [...(topic?.attachments ?? [])].sort((left, right) => {
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

    if (!topic) {
        return (
            <AdministratorLayout>
                <Head title="Topic Not Found" />
                <div className="p-6 text-gray-900 dark:text-white">
                    <h2 className="text-xl font-semibold mb-4">Topic Not Found</h2>
                    <p>The topic you are looking for does not exist.</p>
                </div>
            </AdministratorLayout>
        );
    }

    return (
        <AdministratorLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        {topic.title}
                    </h2>
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.learning-content.topic.edit', topic.id)}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Edit
                        </Link>
                        <Link
                            href={route('admin.learning-content.index')}
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Back to List
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={topic.title} />
            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-600 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-white">
                            <h3 className="text-lg font-bold mb-4">{topic.title}</h3>
                            {blocks.length > 0 ? (
                                <div className="space-y-6">
                                    {blocks.map((block) => {
                                        const blockFileUrl = getBlockFileUrl(block.file_path);
                                        const blockVideoUrl = getYouTubeEmbedUrl(block.url);

                                        return (
                                            <div key={block.id} className="rounded border border-gray-200 dark:border-gray-500 bg-white/50 dark:bg-gray-700/40 p-4">
                                                {block.title && <h4 className="font-semibold mb-3">{block.title}</h4>}

                                                {block.type === 'text' && (
                                                    <div dangerouslySetInnerHTML={{ __html: block.content || '<p>No content provided.</p>' }} />
                                                )}

                                                {block.type === 'youtube' && blockVideoUrl && (
                                                    <div className="aspect-video">
                                                        <iframe
                                                            src={blockVideoUrl}
                                                            title={block.title || 'Topic video'}
                                                            className="w-full h-full rounded"
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                        />
                                                    </div>
                                                )}

                                                {block.type === 'pdf' && blockFileUrl && (
                                                    <div>
                                                        <div className="rounded border border-gray-200 dark:border-gray-500 overflow-hidden">
                                                            <iframe
                                                                src={blockFileUrl}
                                                                title={block.title || 'Topic PDF'}
                                                                className="w-full h-[640px]"
                                                            />
                                                        </div>
                                                        <a
                                                            href={blockFileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-block mt-2 text-indigo-600 hover:text-indigo-800"
                                                        >
                                                            Open PDF in new tab
                                                        </a>
                                                    </div>
                                                )}

                                                {block.type === 'image' && blockFileUrl && (
                                                    <img
                                                        src={blockFileUrl}
                                                        alt={block.title || 'Topic image'}
                                                        className="max-h-[640px] w-full object-contain rounded"
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <>
                                    <div
                                        className="rounded border border-gray-200 dark:border-gray-500 bg-white/50 dark:bg-gray-700/40 p-4"
                                        dangerouslySetInnerHTML={{ __html: renderedContent }}
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
                                </>
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
        </AdministratorLayout>
    );
}