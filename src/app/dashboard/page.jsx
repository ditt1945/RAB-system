import Link from 'next/link';
import { ArrowRight, Calculator, CheckCircle2, Circle, Clock, FileText, FolderKanban, PlusCircle } from 'lucide-react';
import { requirePageUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateProjectSummary } from '@/lib/calculations/rab';
import { rupiah } from '@/lib/format';
import AppShell from '@/components/AppShell';
import { buttonClass, Card, EmptyState, PageHeader, StatusBadge } from '@/components/ui';

export const metadata = { title: 'Dashboard - Sistem RAB Kontraktor' };

export default async function DashboardPage() {
  const user = await requirePageUser();

  const [projects, ahspCount, company] = await Promise.all([
    prisma.project.findMany({
      where: { createdBy: user.id },
      orderBy: { updatedAt: 'desc' },
      include: { rabItems: { select: { volume: true, unitPrice: true } } },
    }),
    prisma.ahsp.count({ where: { isActive: true } }),
    prisma.companySettings.findUnique({ where: { ownerId: user.id }, select: { companyName: true } }),
  ]);

  const withTotal = projects.map((p) => ({ ...p, grandTotal: calculateProjectSummary({ ...p, items: p.rabItems }).grandTotal }));
  const count = (status) => projects.filter((p) => p.status === status).length;
  const activeValue = withTotal.filter((p) => p.status !== 'cancelled').reduce((sum, p) => sum + p.grandTotal, 0);

  // Panduan langkah awal: tampil sampai ketiganya selesai
  const latest = projects[0];
  const firstEmpty = projects.find((p) => p.rabItems.length === 0);
  const setup = [
    {
      done: Boolean(company?.companyName),
      title: 'Lengkapi data perusahaan',
      text: 'Nama dan alamat perusahaan dipakai sebagai kop di dokumen RAB.',
      href: '/company-settings',
      cta: 'Isi data perusahaan',
    },
    {
      done: projects.length > 0,
      title: 'Buat proyek pertama',
      text: 'Isi nama pekerjaan, klien, dan lokasi.',
      href: '/projects/new',
      cta: 'Buat proyek',
    },
    {
      done: projects.some((p) => p.rabItems.length > 0),
      title: 'Susun RAB, lalu export PDF',
      text: 'Pilih pekerjaan dari AHSP atau minta saran AI, isi volume, lalu buka preview.',
      href: latest ? `/projects/${(firstEmpty ?? latest).id}` : null,
      cta: 'Susun RAB',
    },
  ];
  const nextStep = setup.find((s) => !s.done);

  const stats = [
    { label: 'Total proyek', value: projects.length, icon: FolderKanban, color: 'text-cyan-300' },
    { label: 'Perencanaan / berjalan', value: `${count('planning')} / ${count('progress')}`, icon: Clock, color: 'text-amber-300' },
    { label: 'Selesai', value: count('completed'), icon: CheckCircle2, color: 'text-emerald-300' },
    { label: 'Nilai RAB (tidak termasuk batal)', value: rupiah(activeValue), icon: Calculator, color: 'text-white' },
  ];

  return (
    <AppShell user={user}>
      <PageHeader
        title={`Halo, ${user.name}`}
        description={`Ringkasan proyek Anda. Tersedia ${ahspCount} analisa pekerjaan (AHSP) untuk menyusun RAB.`}
        actions={
          <Link href="/projects/new" className={buttonClass.primary}>
            <PlusCircle className="h-4 w-4" /> Proyek baru
          </Link>
        }
      />

      {nextStep && (
        <Card title="Langkah memulai" description={`${setup.filter((s) => s.done).length} dari ${setup.length} selesai`}>
          <ol className="-my-2 divide-y divide-slate-800">
            {setup.map((step) => {
              const isNext = step === nextStep;
              return (
                <li key={step.title} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-3">
                    {step.done ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                    ) : (
                      <Circle className={`mt-0.5 h-5 w-5 shrink-0 ${isNext ? 'text-cyan-300' : 'text-slate-600'}`} />
                    )}
                    <div>
                      <p className={`text-sm font-medium ${step.done ? 'text-slate-400 line-through' : 'text-white'}`}>{step.title}</p>
                      {!step.done && <p className="text-xs text-slate-400">{step.text}</p>}
                    </div>
                  </div>
                  {!step.done && step.href && (
                    <Link href={step.href} className={`${isNext ? buttonClass.primary : buttonClass.secondary} shrink-0`}>
                      {step.cta} <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              {label}
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className={`mt-3 text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <Card
        title="Proyek terakhir diperbarui"
        actions={
          <Link href="/projects" className="text-xs font-medium text-cyan-300 hover:text-cyan-200">
            Lihat semua →
          </Link>
        }
      >
        {withTotal.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Belum ada proyek"
            description="Buat proyek pertama, lalu susun RAB dari katalog AHSP atau minta saran AI."
            action={
              <Link href="/projects/new" className={buttonClass.primary}>
                <PlusCircle className="h-4 w-4" /> Buat proyek
              </Link>
            }
          />
        ) : (
          <ul className="-my-3 divide-y divide-slate-800">
            {withTotal.slice(0, 5).map((p) => (
              <li key={p.id.toString()} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Link href={`/projects/${p.id}`} className="font-medium text-white hover:text-cyan-300">
                      {p.projectName}
                    </Link>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-xs text-slate-400">
                    {p.clientName} · {p.rabItems.length} item
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm font-semibold tabular-nums text-white">{rupiah(p.grandTotal)}</p>
                  <Link href={`/projects/${p.id}`} className="text-xs font-medium text-cyan-300 hover:text-cyan-200">
                    {p.rabItems.length === 0 ? 'Mulai susun RAB →' : 'Lanjutkan →'}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </AppShell>
  );
}
