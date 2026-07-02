import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import StatCard from '@/Components/Dashboard/StatCard';
import { formatCurrency } from '@/Utils/formatters';

export default function Dashboard({ stats = {}, recentProjects = [] }) {
    const { auth } = usePage().props;
    const firstName = auth.user.name?.split(' ')?.[0] || 'User';

    const statusLabel = {
        planning: 'Planning',
        progress: 'Progress',
        completed: 'Completed',
        cancelled: 'Cancelled',
    };
    const statusCounts = [
        { label: 'Planning', value: stats.planningProjects ?? 0, className: 'bg-blueSoft text-infoDeep' },
        { label: 'Progress', value: stats.activeProjects ?? 0, className: 'bg-amberSoft text-warning' },
        { label: 'Completed', value: stats.completedProjects ?? 0, className: 'bg-tealSoft text-success' },
        { label: 'Cancelled', value: stats.cancelledProjects ?? 0, className: 'bg-orange-100 text-saleDeep' },
    ];

    return (
        <AppLayout
            header={
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Dashboard RAB</h1>
                        <p className="section-copy mt-1">Ringkasan biaya, pipeline proyek, dan aktivitas estimasi.</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Link href={route('projects.create')} className="btn-primary">
                            New Project
                        </Link>
                        {auth.user.roles?.includes('admin') && (
                            <Link href={route('materials.index')} className="btn-secondary">
                                Materials
                            </Link>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-6">
                <section className="overflow-hidden rounded-md border border-hairlineSoft bg-primary text-onPrimary shadow-sm">
                    <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_340px] md:p-8">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/70">Command Center</p>
                            <h2 className="mt-3 text-3xl font-semibold">Halo, {firstName}</h2>
                            <p className="mt-3 max-w-2xl text-body-md text-white/75">
                                Fokus hari ini: lanjutkan project progress, cek item RAB paling bernilai, dan pastikan database material cukup untuk estimasi berikutnya.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link href={route('projects.index')} className="inline-flex min-h-10 items-center justify-center rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-tealSoft">
                                    Kelola Project
                                </Link>
                                <Link href={route('projects.create')} className="inline-flex min-h-10 items-center justify-center rounded-md border border-white/25 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
                                    Buat Project
                                </Link>
                            </div>
                        </div>
                        <div className="rounded-md border border-white/15 bg-white/10 p-5">
                            <p className="text-sm font-semibold text-white/75">Nilai RAB aktif</p>
                            <p className="mt-2 break-words text-3xl font-semibold">{formatCurrency(stats.rabSubtotal)}</p>
                            <p className="mt-3 text-sm text-white/70">
                                Rata-rata {formatCurrency(stats.averageRab)} per project dari {stats.projects ?? 0} project.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Projects" value={stats.projects ?? 0} description={`${stats.activeProjects ?? 0} sedang progress`} />
                    <StatCard label="RAB Items" value={stats.rabItems ?? 0} description="Item pekerjaan yang sudah dihitung" />
                    <StatCard label="Materials" value={stats.materials ?? 0} description="Referensi harga satuan" />
                    <StatCard label="AI Reviews" value={stats.aiRequests ?? 0} description="Draft dan audit biaya diproses" />
                </div>

                <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="panel-strong p-6">
                        <h3 className="section-title">Pipeline Status</h3>
                        <div className="mt-5 grid grid-cols-2 gap-3">
                            {statusCounts.map((status) => (
                                <div key={status.label} className={`rounded-md p-4 ${status.className}`}>
                                    <div className="text-sm font-semibold">{status.label}</div>
                                    <div className="mt-2 text-2xl font-semibold">{status.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="panel-strong p-6">
                        <h3 className="section-title">Prioritas Workflow</h3>
                        <div className="mt-5 grid gap-3 md:grid-cols-3">
                            <WorkflowStep number="1" title="Scope" text="Buat project dan isi periode kerja." />
                            <WorkflowStep number="2" title="Estimate" text="Susun item, volume, dan harga." />
                            <WorkflowStep number="3" title="Review" text="Audit biaya lalu export laporan." />
                        </div>
                    </div>
                </section>

                <section className="panel-strong overflow-hidden">
                    <div className="flex flex-col gap-3 border-b border-hairlineSoft p-6 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h3 className="section-title">Project Terbaru</h3>
                            <p className="section-copy mt-1">Lanjutkan penyusunan RAB atau tinjau rekomendasi biaya dari project yang sedang dikerjakan.</p>
                        </div>
                        <Link href={route('projects.index')} className="btn-secondary">
                            Lihat Semua
                        </Link>
                    </div>

                    <div className="divide-y divide-hairlineSoft">
                        {recentProjects.length > 0 ? (
                            recentProjects.map((project) => (
                                <div key={project.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                                    <div className="min-w-0">
                                        <div className="font-semibold text-ink">{project.project_name}</div>
                                        <div className="mt-1 text-sm text-ash">
                                            {project.client_name} · {project.rab_items_count ?? 0} item · {formatCurrency(project.rab_items_sum_subtotal || 0)}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`badge-status ${
                                            project.status === 'planning'
                                                ? 'badge-planning'
                                                : project.status === 'progress'
                                                ? 'badge-progress'
                                                : project.status === 'completed'
                                                ? 'badge-completed'
                                                : 'badge-cancelled'
                                        }`}>
                                            {statusLabel[project.status] ?? project.status}
                                        </span>
                                        <Link href={route('rab.index', project.id)} className="btn-success">
                                            RAB
                                        </Link>
                                        <Link href={route('rab.ai', project.id)} className="btn-secondary">
                                            Review
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-ash">
                                Belum ada project. Buat project pertama untuk mulai menyusun RAB.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}

function WorkflowStep({ number, title, text }) {
    return (
        <div className="rounded-md border border-hairlineSoft bg-field p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-sm font-semibold text-primary">
                {number}
            </div>
            <div className="mt-3 font-semibold text-ink">{title}</div>
            <p className="mt-1 text-sm text-ash">{text}</p>
        </div>
    );
}
