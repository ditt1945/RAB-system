import Link from 'next/link';
import { Calculator, CheckCircle2, Clock, FileText, FolderKanban, PlusCircle } from 'lucide-react';
import { requirePageUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateProjectSummary } from '@/lib/calculations/rab';
import { rupiah } from '@/lib/format';
import AppShell from '@/components/AppShell';
import { buttonClass, Card, EmptyState, PageHeader, StatusBadge } from '@/components/ui';

export const metadata = { title: 'Dashboard - Sistem RAB Kontraktor' };

export default async function DashboardPage() {
  const user = await requirePageUser();

  const [projects, ahspCount] = await Promise.all([
    prisma.project.findMany({
      where: { createdBy: user.id },
      orderBy: { updatedAt: 'desc' },
      include: { rabItems: { select: { volume: true, unitPrice: true } } },
    }),
    prisma.ahsp.count({ where: { isActive: true } }),
  ]);

  const withTotal = projects.map((p) => ({ ...p, grandTotal: calculateProjectSummary({ ...p, items: p.rabItems }).grandTotal }));
  const count = (status) => projects.filter((p) => p.status === status).length;
  const activeValue = withTotal.filter((p) => p.status !== 'cancelled').reduce((sum, p) => sum + p.grandTotal, 0);

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
                <p className="text-sm font-semibold text-white">{rupiah(p.grandTotal)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </AppShell>
  );
}
