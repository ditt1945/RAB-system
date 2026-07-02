export default function SelectField({ label, id, options = [], className = '', error, ...props }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-ink">
                    {label}
                </label>
            )}
            <select
                id={id}
                className="input-field"
                {...props}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-sm text-sale">{error}</p>}
        </div>
    );
}
