export default function TableHeader({ children }) {
    return (
        <thead className="table-heading text-left">
            <tr>{children}</tr>
        </thead>
    );
}
