import ApplicationLogo from '@/Components/shared/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-300 pt-6 sm:justify-center sm:pt-0 dark:bg-white-900">
            <div>
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-gray-100 px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg dark:bg-gray-200">
                {children}
            </div>
        </div>
    );
}
