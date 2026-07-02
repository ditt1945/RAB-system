export default function InputField({ label, id, className = '', error, ...props }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-ink">
                    {label}
                </label>
            )}
            <input
                id={id}
                className="input-field"
                {...props}
            />
            {error && <p className="text-sm text-sale">{error}</p>}
        </div>
    );
}
