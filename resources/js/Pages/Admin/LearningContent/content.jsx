import AdministratorLayout from '@/Layouts/AdministratorLayout';
import { Head, Link } from '@inertiajs/react';

export default function AdditionalLearningContentContent({ courseId}) {
    const courses = [
        {
            id: 1,
            title: 'Introduction to AI',
            description: 'Learn the basics of Artificial Intelligence and its real-world applications.',
            topics: [
                { id: 1, title:'What is AI?'},
                { id: 2, title:'History of AI'},
                { id: 3, title:'Types of AI'},
                { id: 4, title:'Applications of AI'},
                { id: 5, title:'Future of AI'},
            ],
        },
        {
            id: 2,
            title: 'Cybersecurity Essentials',
            description: 'Understand security threats, vulnerabilities, and basic protection methods.',
            topics: [
                'Introduction to Cybersecurity',
                'Common Threats',
                'Vulnerabilities',
                'Protection Methods',
                'Best Practices',
            ],
        },
        {
            id: 3,
            title: 'Multimedia Design',
            description: 'Explore design principles, animation, and media tools.',
            topics: [
                'Design Principles',
                'Color Theory',
                'Animation Basics',
                'Media Tools Overview',
                'Project Workflow',
            ],
        },
        {
            id: 4,
            title: 'Web Development',
            description: 'Build websites using HTML, CSS, JavaScript, and backend basics.',
            topics: [
                'HTML & CSS Basics',
                'JavaScript Fundamentals',
                'Responsive Design',
                'Backend Introduction',
                'Deployment',
            ],
        },
    ];

    // Find the course by ID (courseId is a string, so use ==)
    const course = courses.find(c => c.id == courseId);

    if (!course) {
        
        return (
            <AdministratorLayout>
                <Head title="Course Not Found" />
                <div className="p-6 text-gray-900 dark:text-white">
                    <h2 className="text-xl font-semibold mb-4">Course Not Found</h2>
                    <p>The course you are looking for does not exist.</p>
                </div>
            </AdministratorLayout>
        );
    }

    return (

        <AdministratorLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {course.title}
                </h2>
            }
        >
            <Head title={course.title} />
            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-600 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-white">
                            <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                            <p className="mb-4">{course.description}</p>
                            <h4 className="font-semibold mb-2">Topics:</h4>
                            <ul className="list-disc list-inside">
                                {course.topics.map((topic) => (
                                    <li key={topic.id}>
                                        <Link
                                            href={route('admin.learning-content.topic.show', [course.id, topic.id])}
                                            className="text-black-900 hover:underline"
                                        >
                                            {topic.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AdministratorLayout>
    );
}