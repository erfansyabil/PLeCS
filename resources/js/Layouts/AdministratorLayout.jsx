import ApplicationLogo from '@/Components/shared/ApplicationLogo';
import Dropdown from '@/Components/ui/Dropdown';
import NavLink from '@/Components/nav/NavLink';
import ResponsiveNavLink from '@/Components/nav/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AdministratorLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-slate-100">
            <nav className="border-b border-slate-700 bg-slate-900">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href={route('dashboard')} className="flex items-center gap-2">
                                    <ApplicationLogo className="block h-8 w-auto fill-current text-cyan-400" />
                                    <span className="hidden text-sm font-bold tracking-wide text-white sm:block">
                                        PLeCS <span className="font-normal text-slate-400">Admin</span>
                                    </span>
                                </Link>
                            </div>

                            <div className="hidden space-x-1 sm:ms-8 sm:flex sm:items-center">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </NavLink>
                                <NavLink
                                    href={route('admin.learning-content.index')}
                                    active={
                                        route().current('admin.learning-content.index') ||
                                        route().current('admin.learning-content.show') ||
                                        route().current('admin.learning-content.topic.show')
                                    }
                                >
                                    Learning Content
                                </NavLink>
                                <NavLink
                                    href={route('admin.quizzes.index')}
                                    active={route().current('admin.quizzes.index') || route().current('admin.quizzes.*')}
                                >
                                    Quizzes
                                </NavLink>
                                <NavLink
                                    href={route('admin.coding-exercises.index')}
                                    active={route().current('admin.coding-exercises.index') || route().current('admin.coding-exercises.*')}
                                >
                                    Coding Exercises
                                </NavLink>
                                <NavLink
                                    href={route('admin.feedback-overview.index')}
                                    active={route().current('admin.feedback-overview.index')}
                                >
                                    Feedback Overview
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-300 transition duration-150 ease-in-out hover:border-slate-600 hover:text-white focus:outline-none"
                                            >
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </span>
                                                {user.name}
                                                <svg
                                                    className="h-4 w-4 text-slate-400"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 transition duration-150 ease-in-out hover:bg-slate-800 hover:text-slate-200 focus:bg-slate-800 focus:text-slate-200 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('admin.learning-content.index')}
                            active={
                                route().current('admin.learning-content.index') ||
                                route().current('admin.learning-content.show') ||
                                route().current('admin.learning-content.topic.show')
                            }
                        >
                            Learning Content
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('admin.quizzes.index')}
                            active={route().current('admin.quizzes.index')}
                        >
                            Quizzes
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('admin.coding-exercises.index')}
                            active={route().current('admin.coding-exercises.index')}
                        >
                            Coding Exercises
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('admin.feedback-overview.index')}
                            active={route().current('admin.feedback-overview.index')}
                        >
                            Feedback Overview
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-slate-700 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-white">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-slate-400">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="border-b border-slate-200 bg-white shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
