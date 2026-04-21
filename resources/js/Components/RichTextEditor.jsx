import { useMemo, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function RichTextEditor({ value, onChange, placeholder = 'Write content here...' }) {
    const quillRef = useRef(null);

    useEffect(() => {
        const setupResizeHandles = () => {
            if (!quillRef.current) return;

            const editor = quillRef.current.getEditor?.();
            if (!editor) return;

            const container = editor.root;
            const editorContainer = container.parentElement;

            if (editorContainer && !editorContainer.style.position) {
                editorContainer.style.position = 'relative';
            }

            const addResizeListener = () => {
                const media = container.querySelectorAll('img, iframe');

                media.forEach((element) => {
                    if (element.dataset.resizeListenerAttached) return;

                    element.style.maxWidth = '100%';
                    element.style.display = 'block';
                    element.dataset.resizeListenerAttached = 'true';

                    let isResizing = false;
                    let startX = 0;
                    let startWidth = 0;
                    let aspectRatio = element.offsetWidth > 0 && element.offsetHeight > 0
                        ? element.offsetHeight / element.offsetWidth
                        : 9 / 16;
                    let toolbar = null;

                    const removeToolbar = () => {
                        if (toolbar) {
                            toolbar.remove();
                            toolbar = null;
                        }
                    };

                    const applyAlignment = (alignment) => {
                        element.style.float = 'none';
                        element.style.transform = 'none';
                        element.style.display = 'inline-block';

                        const wrapper = element.parentElement;
                        if (wrapper) {
                            wrapper.style.textAlign = alignment;
                        }

                        if (alignment === 'center') {
                            element.style.marginLeft = 'auto';
                            element.style.marginRight = 'auto';
                        } else if (alignment === 'left') {
                            element.style.marginLeft = '0';
                            element.style.marginRight = 'auto';
                        } else if (alignment === 'right') {
                            element.style.marginLeft = 'auto';
                            element.style.marginRight = '0';
                        }
                    };

                    const showToolbar = () => {
                        removeToolbar();

                        if (!editorContainer) return;

                        const elementRect = element.getBoundingClientRect();
                        const containerRect = editorContainer.getBoundingClientRect();

                        const overlay = document.createElement('div');
                        overlay.style.cssText = `
                            position: absolute;
                            display: flex;
                            gap: 5px;
                            padding: 5px;
                            background: #f0f0f0;
                            border-radius: 4px;
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
                            z-index: 1000;
                        `;
                        overlay.style.top = `${Math.max(0, elementRect.top - containerRect.top - 40)}px`;
                        overlay.style.left = `${Math.max(0, elementRect.left - containerRect.left)}px`;

                        const createButton = (label, alignment) => {
                            const button = document.createElement('button');
                            button.type = 'button';
                            button.textContent = label;
                            button.style.cssText = `
                                padding: 4px 8px;
                                font-size: 12px;
                                cursor: pointer;
                                border: 1px solid #ccc;
                                border-radius: 3px;
                                background: white;
                            `;
                            button.onmouseover = () => {
                                button.style.background = '#e0e0e0';
                            };
                            button.onmouseout = () => {
                                button.style.background = 'white';
                            };
                            button.onclick = () => {
                                applyAlignment(alignment);
                            };
                            return button;
                        };

                        overlay.appendChild(createButton('Left', 'left'));
                        overlay.appendChild(createButton('Center', 'center'));
                        overlay.appendChild(createButton('Right', 'right'));

                        overlay.addEventListener('mouseleave', removeToolbar);

                        editorContainer.appendChild(overlay);
                        toolbar = overlay;
                    };

                    const onMouseDown = (e) => {
                        const rect = element.getBoundingClientRect();
                        const relX = e.clientX - rect.left;
                        const relY = e.clientY - rect.top;

                        if (relX > rect.width - 30 && relY > rect.height - 30) {
                            isResizing = true;
                            startX = e.clientX;
                            startWidth = element.offsetWidth;
                            const currentHeight = element.offsetHeight;
                            if (startWidth > 0 && currentHeight > 0) {
                                aspectRatio = currentHeight / startWidth;
                            }
                            element.style.cursor = 'nwse-resize';
                            element.style.opacity = '0.8';
                            e.preventDefault();
                        }
                    };

                    const onMouseMove = (e) => {
                        if (!isResizing) return;

                        const diff = e.clientX - startX;
                        const newWidth = Math.max(100, startWidth + diff);
                        element.style.width = `${newWidth}px`;
                        element.style.height = `${newWidth * aspectRatio}px`;
                    };

                    const onMouseUp = () => {
                        if (isResizing) {
                            element.style.cursor = 'auto';
                            element.style.opacity = '1';
                        }
                        isResizing = false;
                    };

                    const onMouseEnter = () => {
                        element.style.border = '2px solid #007bff';
                        showToolbar();
                    };

                    const onMouseLeave = () => {
                        element.style.border = 'none';
                    };

                    element.addEventListener('mousedown', onMouseDown);
                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                    element.addEventListener('mouseenter', onMouseEnter);
                    element.addEventListener('mouseleave', onMouseLeave);
                });
            };

            const observer = new MutationObserver(() => {
                addResizeListener();
            });

            observer.observe(container, {
                childList: true,
                subtree: true,
            });

            setTimeout(() => addResizeListener(), 100);

            return () => observer.disconnect();
        };

        const cleanup = setupResizeHandles();

        return () => {
            if (typeof cleanup === 'function') {
                cleanup();
            }
        };
    }, []);

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

    const convertYouTubeLinksToEmbeds = (html) => {
        if (!html) {
            return html;
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
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
                    iframe.setAttribute('class', 'ql-video');
                    iframe.setAttribute('frameborder', '0');
                    iframe.setAttribute('allowfullscreen', 'true');
                    iframe.setAttribute('style', 'width: 100%; aspect-ratio: 16 / 9; max-width: 560px; display: block;');
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

            const iframe = doc.createElement('iframe');
            iframe.setAttribute('src', embedUrl);
            iframe.setAttribute('class', 'ql-video');
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.setAttribute('style', 'width: 100%; aspect-ratio: 16 / 9; max-width: 560px; display: block;');
            anchor.replaceWith(iframe);
        });

        return doc.body.innerHTML;
    };

    const insertImage = async () => {
        const editor = quillRef.current?.getEditor();
        if (!editor) {
            return;
        }

        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) {
                return;
            }

            const formData = new FormData();
            formData.append('image', file);

            try {
                const response = await axios.post(route('admin.learning-content.editor-image'), formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                const range = editor.getSelection(true);
                const insertAt = range ? range.index : editor.getLength();
                editor.insertEmbed(insertAt, 'image', response.data.url);
                editor.setSelection(insertAt + 1);
            } catch (error) {
                console.error('Image upload failed', error);
                alert('Image upload failed. Please ensure you are logged in as administrator and try again.');
            }
        };
    };

    const insertVideo = () => {
        const editor = quillRef.current?.getEditor();
        if (!editor) {
            return;
        }

        const input = window.prompt('Paste a YouTube URL');
        const embedUrl = getYouTubeEmbedUrl(input ?? '');

        if (!embedUrl) {
            if (input) {
                alert('Please provide a valid YouTube URL.');
            }
            return;
        }

        const range = editor.getSelection(true);
        const insertAt = range ? range.index : editor.getLength();
        editor.insertEmbed(insertAt, 'video', embedUrl);
        editor.setSelection(insertAt + 1);
    };

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ header: [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                [{ indent: '-1' }, { indent: '+1' }],
                [{ align: [] }],
                ['link', 'blockquote', 'code-block', 'image', 'video'],
                ['clean'],
            ],
            handlers: {
                image: insertImage,
                video: insertVideo,
            },
        },
    }), []);

    const formats = [
        'header',
        'bold',
        'italic',
        'underline',
        'strike',
        'list',
        'bullet',
        'indent',
        'align',
        'link',
        'blockquote',
        'code-block',
        'image',
        'video',
    ];

    return (
        <div className="rich-text-editor">
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={(html) => onChange(convertYouTubeLinksToEmbeds(html))}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                style={{ minHeight: '240px' }}
            />
        </div>
    );
}
