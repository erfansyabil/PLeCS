import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const [selectedRole, setSelectedRole] = useState(null);

    const handleImageError = () => {
        document
            .getElementById('screenshot-container')
            ?.classList.add('!hidden');
        document.getElementById('docs-card')?.classList.add('!row-span-1');
        document
            .getElementById('docs-card-content')
            ?.classList.add('!flex-row');
        document.getElementById('background')?.classList.add('!hidden');
    };

    const roles = [
        { id: 'student', label: 'Student', icon: '👨‍🎓' },
        { id: 'teacher', label: 'Teacher', icon: '👨‍🏫' },
        { id: 'administrator', label: 'Administrator', icon: '👨‍💼' },
    ];

    return (
        <>
            <Head title="PLeCS - Welcome" />
            <div className="bg-gray-300 text-black min-h-screen">
                <img
                    id="background"
                    className="absolute -left-20 top-0 max-w-[877px]"
                    src="https://laravel.com/assets/img/welcome/background.svg"
                />
                <div className="relative flex min-h-screen flex-col items-center justify-center selection:bg-[#FF2D20] selection:text-white">
                    <div className="relative w-full max-w-2xl px-6 lg:max-w-7xl">
                        <header className="grid grid-cols-2 items-center gap-2 py-10 lg:grid-cols-3">
                            <div className="flex lg:col-start-2 lg:justify-center">
                                <img
                                    className="h-12 w-auto lg:h-16"
                                    src="/images/PLeCS_Logo.png"
                                    alt="PLeCS Logo"
                                />
                            </div>
                            <nav className="-mx-3 flex flex-1 justify-end">
                                {auth.user ? (
                                    <>
                                        <Link
                                            href={route('dashboard')}
                                            className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] focus-visible:ring-2"
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            href={route('learning-content.index')}
                                            className="rounded-md px-3 py-2 ml-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] focus-visible:ring-2"
                                        >
                                            Learning Content
                                        </Link>
                                    </>
                                ) : null}
                            </nav>
                        </header>

                        <main>
                            <div className="grid gap-6 lg:grid-cols-1 lg:gap-8">
                                <div
                                    id="docs-card"
                                    className="flex flex-col items-start gap-6 overflow-hidden rounded-lg bg-white p-6 shadow-[0px_14px_34px_0px_rgba(0,0,0,0.08)] ring-1 ring-white/[0.05] transition duration-300 hover:text-black/70 hover:ring-black/20 focus:outline-none focus-visible:ring-[#FF2D20] md:row-span-3 lg:p-10 lg:pb-10 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:text-white/70 dark:hover:ring-zinc-700 dark:focus-visible:ring-[#FF2D20]"
                                >
                                    <div className="flex w-full gap-6">
                                        {/* Left Side - Content and Images */}
                                        <div className="flex-1">
                                            <div
                                                id="screenshot-container"
                                                className="relative flex w-full flex-1 items-stretch"
                                            >
                                                <img
                                                    src="https://laravel.com/assets/img/welcome/docs-light.svg"
                                                    alt="Laravel documentation screenshot"
                                                    className="aspect-video h-full w-full flex-1 rounded-[10px] object-cover object-top drop-shadow-[0px_4px_34px_rgba(0,0,0,0.06)] dark:hidden"
                                                    onError={handleImageError}
                                                />
                                                <img
                                                    src="/images/cs_bg.jpg"
                                                    alt="Computer Science Background"
                                                    className="hidden aspect-video h-full w-full flex-1 rounded-[10px] object-cover object-top drop-shadow-[0px_4px_34px_rgba(0,0,0,0.25)] dark:block"
                                                />
                                               {/*  <div className="absolute -bottom-16 -left-16 h-40 w-[calc(100%+4rem)] bg-gradient-to-b from-transparent via-white to-white dark:via-zinc-900 dark:to-zinc-900"></div>*/}
                                            </div>

                                            <div className="relative flex items-center gap-6 lg:items-end mt-6">
                                                <div
                                                    id="docs-card-content"
                                                    className="flex items-start gap-6 lg:flex-col"
                                                >
                                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#FF2D20]/10 sm:size-16">
                                                        <svg
                                                            className="size-5 sm:size-6"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                fill="#FF2D20"
                                                                d="M23 4a1 1 0 0 0-1.447-.894L12.224 7.77a.5.5 0 0 1-.448 0L2.447 3.106A1 1 0 0 0 1 4v13.382a1.99 1.99 0 0 0 1.105 1.79l9.448 4.728c.14.065.293.1.447.1.154-.005.306-.04.447-.105l9.453-4.724a1.99 1.99 0 0 0 1.1-1.789V4ZM3 6.023a.25.25 0 0 1 .362-.223l7.5 3.75a.251.251 0 0 1 .138.223v11.2a.25.25 0 0 1-.362.224l-7.5-3.75a.25.25 0 0 1-.138-.22V6.023Zm18 11.2a.25.25 0 0 1-.138.224l-7.5 3.75a.249.249 0 0 1-.329-.099.249.249 0 0 1-.033-.12V9.772a.251.251 0 0 1 .138-.224l7.5-3.75a.25.25 0 0 1 .362.224v11.2Z"
                                                            />
                                                            <path
                                                                fill="#FF2D20"
                                                                d="m3.55 1.893 8 4.048a1.008 1.008 0 0 0 .9 0l8-4.048a1 1 0 0 0-.9-1.785l-7.322 3.706a.506.506 0 0 1-.452 0L4.454.108a1 1 0 0 0-.9 1.785H3.55Z"
                                                            />
                                                        </svg>
                                                    </div>

                                                    <div className="pt-3 sm:pt-5 lg:pt-0">
                                                        <h2 className="text-xl font-semibold text-black dark:text-white">
                                                            Welcome to PLeCS!
                                                        </h2>

                                                        <p className="mt-4 text-sm/relaxed">
                                                            Computer Science Made Easier!
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side - Role Selection and Auth */}
                                        <div className="w-80 flex flex-col justify-center">
                                            {!selectedRole && !auth.user && (
                                                <div>
                                                    <p className="text-sm font-medium text-white/70 mb-4">Select your role:</p>
                                                    <div className="space-y-2">
                                                        {roles.map((role) => (
                                                            <button
                                                                key={role.id}
                                                                onClick={() => setSelectedRole(role.id)}
                                                                className="w-full flex items-center gap-3 rounded-lg border-2 border-gray-300 bg-white p-4 transition hover:border-[#FF2D20] hover:bg-[#FF2D20]/5"
                                                            >
                                                                <span className="text-2xl">{role.icon}</span>
                                                                <span className="text-sm font-medium text-black">{role.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {selectedRole && !auth.user && (
                                                <div className="space-y-3">
                                                    <p className="text-sm font-medium text-white/70">
                                                        {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                                                    </p>
                                                    <Link
                                                        href={route('login')}
                                                        data={{ role: selectedRole }}
                                                        className="w-full block rounded-md bg-[#FF2D20] px-4 py-3 text-center text-white text-sm font-medium transition hover:bg-[#E01810] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D20]"
                                                    >
                                                        Log in
                                                    </Link>
                                                    <Link
                                                        href={route('register')}
                                                        data={{ role: selectedRole }}
                                                        className="w-full block rounded-md bg-[#FF2D20] px-4 py-3 text-center text-white text-sm font-medium transition hover:bg-[#E01810] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D20]"
                                                    >
                                                        Register
                                                    </Link>
                                                    <a 
                                                        href={`${route('auth.google.redirect')}?role=${selectedRole}`}
                                                        className="w-full block rounded-md bg-white border-2 border-gray-300 px-4 py-3 text-center text-black text-sm font-medium transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D20]"
                                                    >
                                                        Sign in with Google
                                                    </a>
                                                    <button
                                                        onClick={() => setSelectedRole(null)}
                                                        className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-white text-sm font-medium transition hover:border-gray-400"
                                                    >
                                                        Back
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </main>

                        <footer className="py-16 text-center text-sm text-black dark:text-white/70">
                            Laravel v{laravelVersion} (PHP v{phpVersion})
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
}