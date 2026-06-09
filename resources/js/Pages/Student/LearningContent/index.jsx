import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import StudentLayout from '@/Layouts/StudentLayout';
import TeacherLayout from '@/Layouts/TeacherLayout';
import AdministratorLayout from '@/Layouts/AdministratorLayout';
import { Head, Link} from '@inertiajs/react';
import Header from '@/Components/ui/Header';
import PrimaryButton from '@/Components/ui/PrimaryButton';

export default function LearningContentIndex({ layout, contents = [] }) {

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
        <LayoutComponent>
            <Head title="Learning Content" />
            <Header title="My Learning Content" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-600 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-white bg-gray-800">
                            <p className="mb-6">
                                Welcome to the Learning Content module. Here you can browse, add, and manage your learning materials.
                            </p>

                            {/* Grid of Course Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {contents.map((course) => (
                                    <div
                                        key={course.id}
                                        className="rounded-xl shadow-md bg-white dark:bg-gray-500 border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition"
                                    >
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                                            {course.title}
                                        </h3>
                                        <div
                                            className="rich-content text-gray-600 dark:text-gray-300 text-sm"
                                            dangerouslySetInnerHTML={{ __html: course.description }}
                                        />
                                        <PrimaryButton
                                            href={route('student.learning-content.show', course.id)}
                                            className="mt-4"
                                        >
                                            View Course
                                        </PrimaryButton>
                                    </div>
                                ))}

                                {contents.length === 0 && (
                                    <div className="col-span-full text-sm text-gray-600 dark:text-gray-300">
                                        No courses available yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </LayoutComponent>
    );
}
