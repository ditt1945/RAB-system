export default function DataTable({ children, className = '', tableClassName = 'min-w-full' }) {
    return (
        <div className={`overflow-x-auto rounded-md border border-hairlineSoft bg-white ${className}`}>
            <table className={`table-surface ${tableClassName}`}>{children}</table>
        </div>
    );
}
