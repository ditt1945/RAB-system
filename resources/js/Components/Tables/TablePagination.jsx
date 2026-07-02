export default function TablePagination({ links }) {
    return (
        <div className="mt-6 flex flex-wrap gap-2">
            {links.map((link, index) => (
                <a
                    key={index}
                    href={link.url || '#'}
                    className={`rounded-md border px-3 py-1 text-sm ${link.active ? 'bg-ink text-onPrimary' : 'bg-white text-ink'}`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </div>
    );
}
