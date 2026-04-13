import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import StudentLayout from '@/Layouts/StudentLayout';
import TeacherLayout from '@/Layouts/TeacherLayout';
import AdministratorLayout from '@/Layouts/AdministratorLayout';
import { Head } from '@inertiajs/react';

export default function FeedbackForm({ auth, layout }) {
    const [form, setForm] = useState({
        subject: '',
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically send the form data to the server
        setSubmitted(true);
    };

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

    const LayoutComponent = getLayout();

    return (
        <LayoutComponent
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Feedback & Suggestion
                </h2>
            }
        >
            <Head title="Feedback" />
            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-600 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-white">
                            {submitted ? (
                                <div className="text-green-600 dark:text-green-400">
                                    Thank you for your feedback!
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block mb-1 font-medium" htmlFor="subject">
                                            Subject
                                        </label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            value={form.subject}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium" htmlFor="message">
                                            Message
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={form.message}
                                            onChange={handleChange}
                                            required
                                            rows={5}
                                            className="w-full rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                    >
                                        Submit Feedback
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </LayoutComponent>
    );
}