import React, { useState } from 'react';
import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import Header from '@/Components/ui/Header';

const TAGS = [
    'Easy to understand',
    'Confusing explanation',
    'Well structured',
    'Needs more examples',
    'Too advanced',
    'Very helpful',
];

function StarPicker({ value, onChange }) {
    const [hovered, setHovered] = useState(null);
    const active = hovered ?? value;

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(null)}
                    className="focus:outline-none"
                >
                    <svg
                        className={`w-8 h-8 transition-colors ${
                            star <= active
                                ? 'text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </button>
            ))}
            {value > 0 && (
                <span className="ml-2 self-center text-sm text-gray-500 dark:text-gray-400">
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value]}
                </span>
            )}
        </div>
    );
}

export default function FeedbackForm({ auth, topic }) {
    // topic: { id, name, course_title, feedback: existing|null }
    const existing = topic.feedback;

    const { data, setData, post, processing, errors } = useForm({
        topic_id: topic.id,
        rating:   existing?.rating  ?? 0,
        comment:  existing?.comment ?? '',
        tags:     existing?.tags    ?? [],
    });

    const toggleTag = (tag) => {
        setData('tags',
            data.tags.includes(tag)
                ? data.tags.filter((t) => t !== tag)
                : [...data.tags, tag]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('student.feedback.store'));
    };

    const handleSkip = () => {
        post(route('student.feedback.skip'), {
            data: { topic_id: topic.id },
        });
    };

    const ratingRequired = data.rating === 0;

    return (
        <StudentLayout>
            <Head title={`Feedback — ${topic.name}`} />
            <Header title="Give Feedback" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg p-6 space-y-6">

                        {/* Topic info */}
                        <div>
                            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                                {topic.course_title}
                            </span>
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mt-0.5">
                                {topic.name}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Star rating */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Rating <span className="text-red-500">*</span>
                                </label>
                                <StarPicker
                                    value={data.rating}
                                    onChange={(val) => setData('rating', val)}
                                />
                                {errors.rating && (
                                    <p className="text-red-500 text-xs mt-1">{errors.rating}</p>
                                )}
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tags <span className="text-gray-400 font-normal">(optional)</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {TAGS.map((tag) => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => toggleTag(tag)}
                                            className={`px-3 py-1 rounded-full text-sm border transition ${
                                                data.tags.includes(tag)
                                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                                            }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Comment */}
                            <div>
                                <label
                                    htmlFor="comment"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                    Comment <span className="text-gray-400 font-normal">(optional)</span>
                                </label>
                                <textarea
                                    id="comment"
                                    rows={4}
                                    value={data.comment}
                                    onChange={(e) => setData('comment', e.target.value)}
                                    placeholder="Share your thoughts on this topic..."
                                    className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                />
                                {errors.comment && (
                                    <p className="text-red-500 text-xs mt-1">{errors.comment}</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={processing || ratingRequired}
                                    className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    {existing ? 'Update Feedback' : 'Submit Feedback'}
                                </button>

                                {!existing && (
                                    <button
                                        type="button"
                                        onClick={handleSkip}
                                        disabled={processing}
                                        className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
                                    >
                                        Skip for now
                                    </button>
                                )}

                                <Link
                                    href={route('student.feedback.index')}
                                    className="ml-auto text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    ← Back
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}