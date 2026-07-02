export default function SectionCard({ title, subtitle, children, className = '' }) {
    return (
        <section className={`panel p-6 ${className}`}>
            {title && <h3 className="section-title">{title}</h3>}
            {subtitle && <p className="section-copy mt-2">{subtitle}</p>}
            <div className="mt-5">{children}</div>
        </section>
    );
}
