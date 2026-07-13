export default function MediaUnavailable({ className = '', label = 'Media' }) {
    return (
        <div
            className={`flex items-center justify-center gap-2 rounded border border-dashed border-gray-300 dark:border-gray-500 bg-gray-50 dark:bg-gray-800 p-6 text-center text-sm text-gray-500 dark:text-gray-300 ${className}`}
        >
            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636L5.636 18.364M9 3h6l3 3v12a1 1 0 01-1 1H7a1 1 0 01-1-1V7L9 3z" />
            </svg>
            <span>{label} is not available due to current low-bandwidth mode.</span>
        </div>
    );
}
