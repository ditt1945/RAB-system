import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { formatCurrency } from '@/Utils/formatters';

export default function Show({ auth, project }) {
    const statusClass = {
        planning: 'badge-planning',
        progress: 'badge-progress',
        completed: 'badge-completed',
        cancelled: 'badge-cancelled',
    };

    return (
        <AppLayout
            user={auth.user}
            header={
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="page-title">{project.project_name}</h2>
                        <p className="section-copy mt-1">{project.client_name}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href={route('rab.index', project.id)} className="btn-success">
                            Open RAB
                        </Link>
                        <Link href={route('projects.edit', project.id)} className="btn-secondary">
                            Edit Project
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={project.project_name} />

            <div className="form-shell space-y-6">
                <section className="grid gap-4 sm:grid-cols-2">
                    <ProjectSummary label="Total RAB" value={formatCurrency(project.rab_items_sum_subtotal || 0)} />
                    <ProjectSummary label="Jumlah Item" value={project.rab_items_count ?? 0} />
                </section>

                <section className="panel-strong overflow-hidden">
                    <div className="border-b border-hairlineSoft p-6">
                        <h3 className="section-title">Project Detail</h3>
                        <p className="section-copy mt-1">Informasi dasar yang dipakai untuk menyusun dan meninjau RAB proyek.</p>
                    </div>

                    <div className="grid gap-0 divide-y divide-hairlineSoft">
                        <Detail label="Project Name" value={project.project_name} />
                        <Detail label="Client Name" value={project.client_name} />
                        <Detail label="Description" value={project.description || '-'} />
                        <div className="grid gap-2 p-5 sm:grid-cols-[180px_minmax(0,1fr)]">
                            <div className="text-sm font-semibold text-mute">Status</div>
                            <div>
                                <span className={`badge-status ${statusClass[project.status] || 'badge-planning'}`}>
                                    {project.status}
                                </span>
                            </div>
                        </div>
                        <Detail label="Start Date" value={project.start_date || '-'} />
                        <Detail label="End Date" value={project.end_date || '-'} />
                    </div>
                </section>

                <section className="panel p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h3 className="section-title">Next Action</h3>
                            <p className="section-copy mt-1">Buka estimator untuk menambah item, review biaya, atau export laporan.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Link href={route('rab.index', project.id)} className="btn-success">
                                Open RAB
                            </Link>
                            <Link href={route('rab.ai', project.id)} className="btn-secondary">
                                Review Biaya
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}

function ProjectSummary({ label, value }) {
    return (
        <div className="panel p-5">
            <p className="metric-label">{label}</p>
            <p className="metric-value">{value}</p>
        </div>
    );
}

function Detail({ label, value }) {
    return (
        <div className="grid gap-2 p-5 sm:grid-cols-[180px_minmax(0,1fr)]">
            <div className="text-sm font-semibold text-mute">{label}</div>
            <div className="text-sm text-ink sm:text-base">{value}</div>
        </div>
    );
}
