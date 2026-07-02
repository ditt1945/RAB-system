export default function InputLabel({ htmlFor, children, className = '' }) {
    return (
        <label htmlFor={htmlFor} className={`block text-sm font-medium text-ink ${className}`}>
            {children}
        </label>
    );
}
