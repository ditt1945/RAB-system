import Link from 'next/link';
import { ChevronRight, FolderKanban, PlusCircle, Search } from 'lucide-react';
import { requirePageUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateProjectSummary } from '@/lib/calculations/rab';
import { rupiah, STATUS_LABEL, tanggalPendek, waktuRelatif } from '@/lib/format';
import AppShell from '@/components/AppShell';
import FilterForm from '@/components/FilterForm';
import { buttonClass, Card, EmptyState, inputClass, PageHeader, StatusBadge } from '@/components/ui';

export const metadata = { title: 'Daftar Proyek - Sistem RAB Kontraktor' };

export default async function ProjectsPage({ searchParams }) {
  const user = await requirePageUser();
  const { q = '', status = '' } = await searchParams;

  const projects = await prisma.project.findMany({
    where: {
      createdBy: user.id,
      ...(STATUS_LABEL[status] ? { status } : {}),
      ...(q.trim() ? { OR: [{ projectName: { contains: q.trim() } }, { clientName: { contains: q.trim() } }] } : {}),
    },
    orderBy: { updatedAt: 'desc' },
    include: { rabItems: { select: { volume: true, unitPrice: true } } },
  });
  const rows = projects.map((p) => ({ ...p, id: p.id.toString(), grandTotal: calculateProjectSummary({ ...p, items: p.rabItems }).grandTotal }));
  const filtered = Boolean(q || status);

  return (
    <AppShell user={user}>
      <PageHeader
        title="Proyek"
        description="Semua proyek konstruksi milik Anda beserta nilai RAB-nya."
        actions={
          <Link href="/projects/new" className={buttonClass.primary}>
            <PlusCircle className="h-4 w-4" /> Proyek baru
          </Link>
        }
      />

      <FilterForm className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input name="q" defaultValue={q} placeholder="Cari nama proyek atau klien…" className={`${inputClass} pl-9`} aria-label="Cari proyek" />
        </div>
        <select name="status" defaultValue={status} className={`${inputClass} sm:w-48`} aria-label="Filter status">
          <option value="">Semua status</option>
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </FilterForm>

      <Card bodyClassName="p-0">
        {rows.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title={filtered ? 'Tidak ada proyek yang cocok' : 'Belum ada proyek'}
            description={filtered ? 'Coba ubah kata kunci atau status.' : 'Mulai dengan membuat proyek baru.'}
            action={
              !filtered && (
                <Link href="/projects/new" className={buttonClass.primary}>
                  <PlusCircle className="h-4 w-4" /> Buat proyek
                </Link>
              )
            }
          />
        ) : (
          <>
            {/* Laptop: tabel, seluruh baris bisa diklik */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-navy-50 text-left text-xs font-semibold uppercase tracking-wide text-navy-800">
                    <th className="px-5 py-2.5">Proyek</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5">Diubah</th>
                    <th className="px-3 py-2.5 text-right">Item</th>
                    <th className="px-3 py-2.5 text-right">Total akhir</th>
                    <th className="px-5 py-2.5" aria-label="Aksi" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((p) => (
                    <tr key={p.id} className="group relative hover:bg-brand-50/40">
                      <td className="px-5 py-3">
                        <Link href={`/projects/${p.id}`} className="font-medium text-slate-900 after:absolute after:inset-0 group-hover:text-brand-700">
                          {p.projectName}
                        </Link>
                        <p className="text-[13px] text-slate-600">
                          {p.clientName}
                          {p.location ? ` · ${p.location}` : ''}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-3 py-3 text-slate-600" title={tanggalPendek(p.updatedAt)}>
                        {waktuRelatif(p.updatedAt)}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-slate-700">{p.rabItems.length}</td>
                      <td className="px-3 py-3 text-right font-semibold tabular-nums text-navy-900">{rupiah(p.grandTotal)}</td>
                      <td className="relative z-10 px-5 py-3 text-right">
                        <Link href={`/projects/${p.id}/edit`} className="rounded px-2 py-1 text-[13px] font-medium text-slate-600 hover:bg-slate-100 hover:text-navy-900">
                          Ubah data
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* HP: kartu */}
            <ul className="divide-y divide-slate-100 md:hidden">
              {rows.map((p) => (
                <li key={p.id}>
                  <Link href={`/projects/${p.id}`} className="flex items-center gap-3 px-4 py-3.5 active:bg-slate-50">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-slate-900">{p.projectName}</span>
                      <span className="mt-0.5 block truncate text-[13px] text-slate-600">
                        {p.clientName} · {waktuRelatif(p.updatedAt)}
                      </span>
                      <span className="mt-1.5 flex items-center justify-between gap-2">
                        <StatusBadge status={p.status} />
                        <span className="text-sm font-semibold tabular-nums text-navy-900">{rupiah(p.grandTotal)}</span>
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
      {rows.length > 0 && <p className="text-xs text-slate-500">{rows.length} proyek. Total akhir sudah termasuk PPN dan dibulatkan.</p>}
    </AppShell>
  );
}
