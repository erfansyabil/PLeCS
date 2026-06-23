import { Link } from '@inertiajs/react';

export default function PrimaryButton({
    children,
    className = '',
    disabled = false,
    href,
    method = 'get',
    as = 'button',

    variant = 'primary',
    size = 'md',
    fullWidth = false,

    ...props
}) {
    const base =
        'inline-flex items-center justify-center font-semibold transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50';

    const variants = {
        primary:   'bg-indigo-600 text-white hover:bg-indigo-700',
        secondary: 'border border-slate-300 text-slate-700 hover:bg-slate-50',
        danger:    'bg-red-600 text-white hover:bg-red-700',
        outline:   'border border-slate-300 text-slate-700 hover:bg-slate-50',
    };

    const sizes = {
        sm: 'px-3 py-1 text-xs rounded',
        md: 'px-4 py-2 text-sm rounded-md',
        lg: 'px-6 py-3 text-base rounded-lg',
    };

    const classes = [
        base,
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        className,
    ].join(' ');

    // LINK version
    if (href) {
        return (
            <Link
                href={href}
                method={method}
                as={as}
                className={classes}
                {...props}
            >
                {children}
            </Link>
        );
    }

    // BUTTON version
    return (
        <button
            disabled={disabled}
            className={classes}
            {...props}
        >
            {children}
        </button>
    );
}