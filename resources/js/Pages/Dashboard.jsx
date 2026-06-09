import StudentLayout from '@/Layouts/StudentLayout';
import TeacherLayout from '@/Layouts/TeacherLayout';
import AdministratorLayout from '@/Layouts/AdministratorLayout';
import { Head, usePage } from '@inertiajs/react';

export default function Dashboard({ layout }) {
    const { auth } = usePage().props;

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
                return StudentLayout; // fallback
        }
    };

    const LayoutComponent = getLayout();

    return (
        <LayoutComponent
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-500">
                        <div className="p-6 text-gray-900 dark:text-gray-100 bg-gray-800">
                            <div className="mb-4">
                                <h3 className="text-lg font-medium">
                                    Welcome back, {auth.user.name}!
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Role: {auth.user.role.charAt(0).toUpperCase() + auth.user.role.slice(1)}
                                </p>
                            </div>
                            You're logged in!
                        </div>
                    </div>
                </div>
            </div>
        </LayoutComponent>
    );
}
