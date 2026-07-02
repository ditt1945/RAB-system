export default function EmptyState({ title, description, cta }) {
    return (
        <div className="panel p-8 text-center">
            <div className="mx-auto max-w-md space-y-4">
                <div className="text-3xl">🗂️</div>
                <h2 className="text-heading-lg font-semibold text-ink">{title}</h2>
                <p className="text-body-md text-ash">{description}</p>
                {cta && <div className="mt-4">{cta}</div>}
            </div>
        </div>
    );
}
