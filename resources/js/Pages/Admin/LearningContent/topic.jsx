import AdministratorLayout from '@/Layouts/AdministratorLayout';
import { Head } from '@inertiajs/react';
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
    const attachments = [...(topic?.attachments ?? [])].sort((left, right) => {
        const leftOrder = Number(left.sort_order ?? 0);
        const rightOrder = Number(right.sort_order ?? 0);
        return leftOrder - rightOrder || left.id - right.id;
    });

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