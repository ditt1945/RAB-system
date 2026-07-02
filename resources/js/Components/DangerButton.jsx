export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-md bg-sale px-4 py-2.5 text-sm font-semibold text-onPrimary transition hover:bg-saleDeep disabled:cursor-not-allowed disabled:opacity-50 ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
