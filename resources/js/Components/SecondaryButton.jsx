export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center justify-center rounded-md border border-hairlineSoft bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-softCloud disabled:cursor-not-allowed disabled:opacity-50 ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
