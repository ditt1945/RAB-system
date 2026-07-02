export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-onPrimary transition hover:bg-charcoal disabled:cursor-not-allowed disabled:opacity-50 ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
