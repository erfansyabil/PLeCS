export default function Header({ title, children }) {
    return (
        <header className="bg-white shadow dark:bg-gray-800">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-between">
                
                {/* Left side (title) */}
                <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {title}
                </h1>

                {/* Right side (optional actions) */}
                <div className="flex items-center gap-3">
                    {children}
                </div>

            </div>
        </header>
    );
}