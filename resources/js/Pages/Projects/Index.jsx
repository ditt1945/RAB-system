import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import useDebouncedSearch from '@/Utils/useDebouncedSearch';
import { formatCurrency } from '@/Utils/formatters';

export default function Index({ auth, projects, filters, stats = {} }) {
    const { delete: destroy } = useForm();
    const [search, setSearch] = useDebouncedSearch('projects.index', filters.search);

    return (
        <AppLayout
            user={auth.user}
            header={
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="page-title">Projects</h2>
                        <p className="section-copy mt-1">Pipeline project, nilai RAB, dan status pekerjaan.</p>
                    </div>

                    <Link href={route('projects.create')} className="btn-primary">
                        New Project
                    </Link>
                </div>
            }
        >
            <Head title="Projects" />

            <div className="content-shell">
                <div className="grid gap-4 md:grid-cols-4">
                    <ProjectMetric label="Total" value={stats.total ?? 0} />
                    <ProjectMetric label="Planning" value={stats.planning ?? 0} tone="info" />
                    <ProjectMetric label="Progress" value={stats.progress ?? 0} tone="warning" />
                    <ProjectMetric label="Completed" value={stats.completed ?? 0} tone="success" />
                </div>

                <div className="panel-strong overflow-hidden">
                    <div className="flex flex-col gap-4 border-b border-hairlineSoft p-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h3 className="section-title">Project List</h3>
                            <p className="section-copy mt-2">Kelola project konstruksi dan alur RAB dalam satu tempat.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Link href={route('dashboard')} className="btn-secondary">
                                Dashboard
                            </Link>
                            <Link href={route('projects.create')} className="btn-primary">
                                New Project
                            </Link>
                        </div>
                    </div>

                    <div className="p-5">
                        <div className="mb-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                            <input
                                type="text"
                                value={search}
                                placeholder="Search project atau client..."
                                onChange={(e) => setSearch(e.target.value)}
                                className="input-field"
                            />
                            <div className="text-sm text-ash">
                                {projects.total ?? projects.data.length} project ditemukan
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-md border border-hairlineSoft">
                            <table className="table-surface w-full min-w-[960px]">
                                <thead className="table-heading text-left">
                                    <tr>
                                        <th className="px-5 py-4">Project</th>
                                        <th className="px-5 py-4">Client</th>
                                        <th className="px-5 py-4">Status</th>
                                        <th className="px-5 py-4 text-right">RAB</th>
                                        <th className="px-5 py-4 text-right">Items</th>
                                        <th className="px-5 py-4">Start Date</th>
                                        <th className="px-5 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projects.data.length > 0 ? (
                                        projects.data.map((project) => (
                                            <tr key={project.id} className="focus-row">
                                                <td className="px-5 py-4">
                                                    <div className="font-semibold text-ink">{project.project_name}</div>
                                                    <div className="mt-1 text-xs text-mute">Project #{project.id}</div>
                                                </td>
                                                <td className="px-5 py-4 text-gray-600">{project.client_name}</td>
                                                <td className="px-5 py-4">
                                                    <span className={`badge-status ${
                                                        project.status === 'planning'
                                                            ? 'badge-planning'
                                                            : project.status === 'progress'
                                                            ? 'badge-progress'
                                                            : project.status === 'completed'
                                                            ? 'badge-completed'
                                                            : 'badge-cancelled'
                                                    }`}>
                                                        {project.status}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-right text-sm font-semibold text-ink">
                                                    {formatCurrency(project.rab_items_sum_subtotal || 0)}
                                                </td>
                                                <td className="px-5 py-4 text-right text-sm text-ash">
                                                    {project.rab_items_count ?? 0}
                                                </td>
                                                <td className="px-5 py-4 text-gray-600">{project.start_date || '-'}</td>
                                                <td className="px-5 py-4">
                                                    <div className="table-actions">
                                                        <Link href={route('projects.show', project.id)} className="btn-secondary">
                                                            View
                                                        </Link>
                                                        <Link href={route('projects.edit', project.id)} className="btn-secondary">
                                                            Edit
                                                        </Link>
                                                        <Link href={route('rab.index', project.id)} className="btn-success">
                                                            RAB
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (confirm('Delete this project?')) {
                                                                    destroy(route('projects.destroy', project.id));
                                                                }
                                                            }}
                                                            className="btn-danger"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-12 text-center text-gray-500">
                                                Belum ada project yang cocok. Coba kata kunci lain atau buat project baru.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2">
                            {projects.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`rounded-md border px-3 py-1 text-sm transition ${
                                        link.active
                                            ? 'bg-primary text-onPrimary'
                                            : 'bg-white text-gray-700 hover:bg-field'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function ProjectMetric({ label, value, tone = 'neutral' }) {
    const tones = {
        neutral: 'bg-white text-ink',
        info: 'bg-blueSoft text-infoDeep',
        warning: 'bg-amberSoft text-warning',
        success: 'bg-tealSoft text-success',
    };

    return (
        <div className={`rounded-md border border-hairlineSoft p-4 ${tones[tone]}`}>
            <p className="text-sm font-semibold">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
    );
}
