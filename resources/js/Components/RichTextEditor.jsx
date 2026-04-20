import { useMemo, useRef } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function RichTextEditor({ value, onChange, placeholder = 'Write content here...' }) {
    const quillRef = useRef(null);

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

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ header: [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                [{ indent: '-1' }, { indent: '+1' }],
                [{ align: [] }],
                ['link', 'blockquote', 'code-block', 'image'],
                ['clean'],
            ],
            handlers: {
                image: insertImage,
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
    ];

    return (
        <div className="rich-text-editor">
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                style={{ minHeight: '240px' }}
            />
        </div>
    );
}
