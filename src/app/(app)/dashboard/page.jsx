import Link from 'next/link';
import { ArrowRight, CheckCircle2, Circle, FileText, FolderKanban, PlusCircle, Timer, Wallet } from 'lucide-react';
import { requirePageUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateProjectSummary } from '@/lib/calculations/rab';
import { rupiah, rupiahRingkas, waktuRelatif } from '@/lib/format';
import DialogButton from '@/components/DialogButton';
import { buttonClass, Card, EmptyState, PageHeader, Stat, StatusBadge } from '@/components/ui';

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
  const active = count('planning') + count('progress');
  const activeValue = withTotal.filter((p) => p.status !== 'cancelled').reduce((sum, p) => sum + p.grandTotal, 0);
  const latest = withTotal.find((p) => p.status !== 'cancelled' && p.status !== 'completed') ?? withTotal[0];

  // Panduan langkah awal: tampil sampai ketiganya selesai
  const firstEmpty = projects.find((p) => p.rabItems.length === 0);
  const setup = [
    { done: Boolean(company?.companyName), title: 'Lengkapi data perusahaan', text: 'Dipakai sebagai kop dokumen RAB.', action: 'company', cta: 'Isi data' },
    { done: projects.length > 0, title: 'Buat proyek pertama', text: 'Nama pekerjaan, klien, lokasi.', action: 'project', cta: 'Buat proyek' },
    {
      done: projects.some((p) => p.rabItems.length > 0),
      title: 'Susun RAB, lalu export PDF',
      text: 'Template, saran AI, atau katalog AHSP.',
      href: projects.length ? `/projects/${(firstEmpty ?? projects[0]).id}` : null,
      cta: 'Susun RAB',
    },
  ];
  const nextStep = setup.find((s) => !s.done);
  const firstName = user.name.split(' ')[0];

  return (
    <>
      <PageHeader
        title={`Halo, ${firstName}`}
        description={`${ahspCount} analisa pekerjaan (AHSP) siap dipakai untuk menyusun RAB.`}
        actions={
          <DialogButton action="project" className={buttonClass.primary}>
            <PlusCircle className="h-4 w-4" /> Proyek baru
          </DialogButton>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total proyek" value={projects.length} icon={FolderKanban} />
        <Stat label="Sedang berjalan" value={active} hint="Perencanaan + berjalan" icon={Timer} />
        <Stat label="Selesai" value={count('completed')} hint={count('cancelled') ? `${count('cancelled')} dibatalkan` : 'Proyek rampung'} icon={CheckCircle2} />
        <Stat label="Nilai RAB" value={rupiahRingkas(activeValue)} hint="Termasuk PPN, tanpa yang batal" icon={Wallet} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card
            title="Proyek terbaru"
            bodyClassName="p-0"
            actions={
              <Link href="/projects" className={buttonClass.link}>
                Lihat semua <ArrowRight className="h-4 w-4" />
              </Link>
            }
          >
            {withTotal.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Belum ada proyek"
                description="Buat proyek pertama, lalu susun RAB dari template, saran AI, atau katalog AHSP."
                action={
                  <DialogButton action="project" className={buttonClass.primary}>
                    <PlusCircle className="h-4 w-4" /> Buat proyek
                  </DialogButton>
                }
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {withTotal.slice(0, 6).map((p) => (
                  <li key={p.id.toString()}>
                    <Link href={`/projects/${p.id}`} className="flex items-center justify-between gap-4 px-5 py-3 transition hover:bg-slate-50">
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="truncate font-medium text-slate-900">{p.projectName}</span>
                          <StatusBadge status={p.status} />
                        </span>
                        <span className="mt-0.5 block text-[13px] text-slate-600">
                          {p.clientName} · {p.rabItems.length} item · {waktuRelatif(p.updatedAt)}
                        </span>
                      </span>
                      <span className="shrink-0 text-right text-sm font-semibold tabular-nums text-navy-900">{rupiah(p.grandTotal)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          {latest && (
            <Link
              href={`/projects/${latest.id}`}
              className="group block rounded-xl bg-navy-900 p-5 text-white shadow-sm transition hover:bg-navy-800"
            >
              <p className="text-[13px] font-medium text-brand-300">Lanjutkan pekerjaan terakhir</p>
              <p className="mt-1.5 line-clamp-2 text-lg font-semibold">{latest.projectName}</p>
              <p className="mt-1 text-[13px] text-white/70">
                {latest.clientName} · {latest.rabItems.length} item · diubah {waktuRelatif(latest.updatedAt)}
              </p>
              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs text-white/60">Total akhir</p>
                  <p className="text-xl font-semibold tabular-nums">{rupiah(latest.grandTotal)}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-300">
                  {latest.rabItems.length === 0 ? 'Mulai susun' : 'Buka RAB'} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          )}

          {nextStep && (
            <Card title="Langkah memulai" description={`${setup.filter((s) => s.done).length} dari ${setup.length} selesai`} bodyClassName="px-5 py-1">
              <ol className="divide-y divide-slate-100">
                {setup.map((step) => {
                  const isNext = step === nextStep;
                  const cls = `${isNext ? buttonClass.primary : buttonClass.secondary} shrink-0 px-3 py-1.5 text-[13px]`;
                  return (
                    <li key={step.title} className="flex items-center justify-between gap-3 py-3">
                      <div className="flex min-w-0 gap-3">
                        {step.done ? (
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                        ) : (
                          <Circle className={`mt-0.5 h-5 w-5 shrink-0 ${isNext ? 'text-brand-600' : 'text-slate-300'}`} />
                        )}
                        <div className="min-w-0">
                          <p className={`text-sm font-medium ${step.done ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{step.title}</p>
                          {!step.done && <p className="text-xs text-slate-600">{step.text}</p>}
                        </div>
                      </div>
                      {!step.done &&
                        (step.action ? (
                          <DialogButton action={step.action} className={cls}>
                            {step.cta}
                          </DialogButton>
                        ) : (
                          step.href && (
                            <Link href={step.href} className={cls}>
                              {step.cta}
                            </Link>
                          )
                        ))}
                    </li>
                  );
                })}
              </ol>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
