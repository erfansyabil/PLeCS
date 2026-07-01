import AdministratorLayout from '@/Layouts/AdministratorLayout';
import RichTextEditor from '@/Components/RichTextEditor';
import { Head, Link, useForm } from '@inertiajs/react';

const inputCls = 'w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 shadow-sm placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30';
const labelCls = 'block text-sm font-medium text-slate-300 mb-1.5';

export default function Create({ courses = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        content: '',
        type: 'course',
        difficultyLevel: 'Beginner',
        estimated_hours: '',
        keywords: '',
        parent_id: '',
        resource_type: 'none',
        resource_url: '',
        resource_file: null,
        blocks: [],
        attachments: [],
        prerequisites: [],
    });

    const emptyBlock = (type = 'text', sortOrder = 1) => ({
        type,
        title: '',
        content: '',
        url: '',
        file: null,
        existing_file_path: '',
        sort_order: sortOrder,
    });

    const emptyAttachment = () => ({
        title: '',
        type: 'pdf',
        file: null,
        sort_order: 0,
    });

    const updateAttachment = (index, field, value) => {
        const next = [...data.attachments];
        next[index] = { ...next[index], [field]: value };
        setData('attachments', next);
    };

    const updateBlock = (index, field, value) => {
        const next = [...data.blocks];
        next[index] = { ...next[index], [field]: value };
        setData('blocks', next);
    };

    const updateBlockType = (index, type) => {
        const next = [...data.blocks];
        next[index] = { ...emptyBlock(type, next[index]?.sort_order ?? (index + 1)), title: next[index]?.title ?? '' };
        setData('blocks', next);
    };

    const addBlock = (type = 'text') => {
        setData('blocks', [...data.blocks, emptyBlock(type, (data.blocks.length + 1))]);
    };

    const removeBlock = (index) => {
        setData('blocks', data.blocks.filter((_, i) => i !== index));
    };

    const addAttachment = () => {
        setData('attachments', [...data.attachments, emptyAttachment()]);
    };

    const removeAttachment = (index) => {
        setData('attachments', data.attachments.filter((_, i) => i !== index));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.learning-content.store'), { forceFormData: true });
    };

    const sortedCourses = [...courses].sort((a, b) => a.title.localeCompare(b.title));

    return (
        <AdministratorLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">Add Learning Content</h2>
                        <p className="mt-0.5 text-sm text-slate-400">Create a new course or topic</p>
                    </div>
                    <Link
                        href={route('admin.learning-content.index')}
                        className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                    >
                        Back
                    </Link>
                </div>
            }
        >
            <Head title="Add Learning Content" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="space-y-6">

                        {/* Info banner */}
                        <div className="rounded-lg border border-indigo-800 bg-indigo-900/40 p-4">
                            <p className="mb-1 text-sm font-semibold text-indigo-300">Course and Topic Structure</p>
                            <p className="text-sm text-indigo-300">
                                Create the course first, then add topics by selecting Type = Topic and choosing the parent course.
                            </p>
                        </div>

                        {/* Current courses list */}
                        {sortedCourses.length > 0 && (
                            <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-sm">
                                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Existing Courses</h3>
                                <div className="divide-y divide-slate-800 rounded-lg border border-slate-800 overflow-hidden">
                                    {sortedCourses.map((course) => (
                                        <div key={course.id} className="flex items-center justify-between px-3 py-2.5 text-sm">
                                            <span className="text-slate-100">{course.title}</span>
                                            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                                                {course.children_count ?? 0} topic{(course.children_count ?? 0) === 1 ? '' : 's'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Main form card */}
                        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-sm space-y-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Content Details</h3>

                            <div>
                                <label htmlFor="title" className={labelCls}>Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className={inputCls}
                                    placeholder="e.g. Introduction to Programming"
                                    required
                                />
                                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                            </div>

                            <div>
                                <label htmlFor="description" className={labelCls}>Description</label>
                                <RichTextEditor
                                    value={data.description}
                                    onChange={(value) => setData('description', value)}
                                    placeholder="Write a brief description..."
                                />
                                {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="type" className={labelCls}>Type</label>
                                    <select
                                        id="type"
                                        value={data.type}
                                        onChange={(e) => {
                                            const nextType = e.target.value;
                                            setData('type', nextType);
                                            if (nextType === 'course') {
                                                setData('parent_id', '');
                                                setData('difficultyLevel', 'Beginner');
                                                setData('estimated_hours', '');
                                                setData('keywords', '');
                                                setData('resource_type', 'none');
                                                setData('resource_url', '');
                                                setData('resource_file', null);
                                                setData('blocks', []);
                                                setData('attachments', []);
                                            }
                                            if (nextType === 'topic') {
                                                if (data.blocks.length === 0) {
                                                    setData('blocks', [emptyBlock('text', 1)]);
                                                }
                                                setData('attachments', []);
                                            }
                                        }}
                                        className={inputCls}
                                    >
                                        <option value="course">Course</option>
                                        <option value="topic">Topic</option>
                                    </select>
                                    {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
                                </div>

                                {data.type === 'course' && (
                                    <div>
                                        <label htmlFor="difficultyLevel" className={labelCls}>Difficulty Level</label>
                                        <select
                                            id="difficultyLevel"
                                            value={data.difficultyLevel}
                                            onChange={(e) => setData('difficultyLevel', e.target.value)}
                                            className={inputCls}
                                        >
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
                                        </select>
                                        {errors.difficultyLevel && <p className="mt-1 text-xs text-red-600">{errors.difficultyLevel}</p>}
                                    </div>
                                )}

                                {data.type === 'topic' && (
                                    <div>
                                        <label htmlFor="parent_id" className={labelCls}>Parent Course</label>
                                        <select
                                            id="parent_id"
                                            value={data.parent_id}
                                            onChange={(e) => setData('parent_id', e.target.value)}
                                            className={inputCls}
                                            required
                                        >
                                            <option value="">Select a course</option>
                                            {sortedCourses.map((course) => (
                                                <option key={course.id} value={course.id}>
                                                    {course.title} ({course.children_count ?? 0} topic{(course.children_count ?? 0) === 1 ? '' : 's'})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.parent_id && <p className="mt-1 text-xs text-red-600">{errors.parent_id}</p>}
                                    </div>
                                )}
                            </div>

                            {data.type === 'course' && (
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="estimated_hours" className={labelCls}>Estimated Hours</label>
                                        <input
                                            type="number"
                                            id="estimated_hours"
                                            min="1"
                                            max="2000"
                                            value={data.estimated_hours}
                                            onChange={(e) => setData('estimated_hours', e.target.value)}
                                            className={inputCls}
                                            placeholder="e.g. 20"
                                        />
                                        {errors.estimated_hours && <p className="mt-1 text-xs text-red-600">{errors.estimated_hours}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="keywords" className={labelCls}>Keywords <span className="font-normal text-slate-400">(comma separated)</span></label>
                                        <input
                                            type="text"
                                            id="keywords"
                                            value={data.keywords}
                                            onChange={(e) => setData('keywords', e.target.value)}
                                            className={inputCls}
                                            placeholder="python, loops, fundamentals"
                                        />
                                        {errors.keywords && <p className="mt-1 text-xs text-red-600">{errors.keywords}</p>}
                                    </div>
                                </div>
                            )}

                            {data.type === 'course' && (
                                <div>
                                    <label htmlFor="prerequisites" className={labelCls}>
                                        Prerequisite Courses
                                    </label>
                                    <select
                                        id="prerequisites"
                                        multiple
                                        value={data.prerequisites}
                                        onChange={(e) => setData('prerequisites', Array.from(e.target.selectedOptions, (o) => o.value))}
                                        className={inputCls + ' min-h-[7rem]'}
                                    >
                                        {sortedCourses.map((course) => (
                                            <option key={course.id} value={course.id}>{course.title}</option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-xs text-slate-400">Hold Ctrl/Cmd to select multiple.</p>
                                    {errors.prerequisites && <p className="mt-1 text-xs text-red-600">{errors.prerequisites}</p>}
                                </div>
                            )}
                        </div>

                        {/* Topic blocks */}
                        {data.type === 'topic' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-300">Topic Blocks</h3>
                                        <p className="text-xs text-slate-400">Arrange your lesson flow: text, video, PDF, image.</p>
                                    </div>
                                </div>

                                {data.blocks.map((block, index) => (
                                    <div key={index} className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-sm space-y-4">
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                            <div>
                                                <label className={labelCls}>Block Type</label>
                                                <select
                                                    value={block.type}
                                                    onChange={(e) => updateBlockType(index, e.target.value)}
                                                    className={inputCls}
                                                >
                                                    <option value="text">Text</option>
                                                    <option value="youtube">YouTube</option>
                                                    <option value="pdf">PDF</option>
                                                    <option value="image">Image</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelCls}>Title <span className="font-normal text-slate-400">(optional)</span></label>
                                                <input
                                                    type="text"
                                                    value={block.title}
                                                    onChange={(e) => updateBlock(index, 'title', e.target.value)}
                                                    className={inputCls}
                                                    placeholder="Block heading"
                                                />
                                            </div>
                                            <div>
                                                <label className={labelCls}>Sort Order</label>
                                                <input
                                                    type="number"
                                                    value={block.sort_order}
                                                    onChange={(e) => updateBlock(index, 'sort_order', e.target.value)}
                                                    className={inputCls}
                                                />
                                            </div>
                                        </div>

                                        {block.type === 'text' && (
                                            <div>
                                                <label className={labelCls}>Content</label>
                                                <RichTextEditor
                                                    value={block.content}
                                                    onChange={(value) => updateBlock(index, 'content', value)}
                                                    placeholder="Write text for this block..."
                                                />
                                            </div>
                                        )}

                                        {block.type === 'youtube' && (
                                            <div>
                                                <label className={labelCls}>YouTube URL</label>
                                                <input
                                                    type="url"
                                                    value={block.url}
                                                    onChange={(e) => updateBlock(index, 'url', e.target.value)}
                                                    placeholder="https://www.youtube.com/watch?v=..."
                                                    className={inputCls}
                                                />
                                            </div>
                                        )}

                                        {(block.type === 'pdf' || block.type === 'image') && (
                                            <div>
                                                <label className={labelCls}>{block.type === 'pdf' ? 'PDF File' : 'Image File'}</label>
                                                <input
                                                    type="file"
                                                    accept={block.type === 'pdf' ? 'application/pdf' : 'image/*'}
                                                    onChange={(e) => updateBlock(index, 'file', e.target.files?.[0] ?? null)}
                                                    className="text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-900/50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-indigo-300 hover:file:bg-indigo-900/70"
                                                />
                                            </div>
                                        )}

                                        <div className="flex justify-end border-t border-slate-800 pt-3">
                                            <button
                                                type="button"
                                                onClick={() => removeBlock(index)}
                                                className="text-sm font-medium text-red-400 hover:text-red-300"
                                            >
                                                Remove Block
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => addBlock('text')}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-indigo-700 px-4 py-3 text-sm font-medium text-indigo-400 hover:border-indigo-500 hover:bg-indigo-900/30"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Block
                                </button>

                                {errors.blocks && <p className="text-xs text-red-600">{errors.blocks}</p>}
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-sm">
                            <Link
                                href={route('admin.learning-content.index')}
                                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {processing ? 'Creating…' : 'Create Content'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdministratorLayout>
    );
}
