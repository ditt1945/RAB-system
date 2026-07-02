export default function StatCard({ label, value, description, className = '' }) {
    return (
        <article className={`panel p-5 ${className}`}>
            <div className="flex items-start justify-between gap-4">
                <p className="metric-label">{label}</p>
                <span className="mt-0.5 h-2.5 w-2.5 rounded-full bg-success" />
            </div>
            <p className="metric-value md:text-3xl">{value}</p>
            {description && <p className="mt-3 min-h-10 text-sm leading-5 text-ash">{description}</p>}
        </article>
    );
}
