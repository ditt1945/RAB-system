export default function PrimaryButton({ type = 'button', className = '', disabled, children, ...props }) {
    return (
        <button
            {...props}
            type={type}
            disabled={disabled}
            className={
                `inline-flex items-center justify-center rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-onPrimary transition hover:bg-charcoal disabled:cursor-not-allowed disabled:opacity-50 ${className}`
            }
        >
            {children}
        </button>
    );
}
