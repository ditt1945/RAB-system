export default function Spinner({ size = 5, className = '' }) {
    return (
        <div className={`inline-block animate-spin rounded-full border-4 border-current border-r-transparent ${className}`} style={{ width: `${size}rem`, height: `${size}rem` }} />
    );
}
