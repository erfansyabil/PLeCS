import AdministratorLayout from '@/Layouts/AdministratorLayout';
import { Head, Link } from '@inertiajs/react';

export default function TopicPage({ auth, topicId, layout }) {

    // You can fetch or map topicId to topic content here
    // Example:
    const topics = {
        1: {
            title: 'What is AI?',
            content: (
                <>
                    <p>
                        <strong>Artificial Intelligence (AI)</strong> is a field of computer science focused on creating systems capable of performing tasks that typically require human intelligence. These tasks include learning, reasoning, problem-solving, perception, understanding language, and even recognizing emotions.
                    </p>
                    <p className="mt-4">
                        AI systems are designed to analyze large amounts of data, recognize patterns, and make decisions or predictions based on that data. There are two main types of AI:
                    </p>
                    <ul className="list-disc list-inside mt-2">
                        <li>
                            <strong>Narrow AI:</strong> Also known as Weak AI, this type is designed to perform a specific task, such as voice assistants (e.g., Siri, Alexa), recommendation systems, or image recognition.
                        </li>
                        <li>
                            <strong>General AI:</strong> Also known as Strong AI, this type would have the ability to understand, learn, and apply knowledge in different contexts, similar to human intelligence. General AI does not yet exist.
                        </li>
                    </ul>
                    <p className="mt-4">
                        <strong>Examples of AI in daily life:</strong>
                    </p>
                    <ul className="list-disc list-inside mt-2">
                        <li>Voice assistants like Siri and Google Assistant</li>
                        <li>Self-driving cars</li>
                        <li>Spam filters in email</li>
                        <li>Product recommendations on e-commerce sites</li>
                        <li>Facial recognition in smartphones</li>
                    </ul>
                    <p className="mt-4">
                        AI is powered by techniques such as <strong>machine learning</strong> (where computers learn from data) and <strong>deep learning</strong> (which uses neural networks inspired by the human brain). As technology advances, AI is expected to play an even greater role in healthcare, education, business, and many other fields.
                    </p>
                </>
            ),
        },
        2: {
            title: 'History of AI',
            content: 'The history of AI began in ...',
        },
        // Add more topics as needed
    };

    const topic = topics[topicId];

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
                            href={route('admin.learning-content.topic.edit', topicId)}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Edit
                        </Link>
                        <Link
                            href={route('admin.topics.index')}
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
                            <p>{topic.content}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdministratorLayout>
    );
}