import Link from 'next/link';
import { FolderKanban, PlusCircle, Search } from 'lucide-react';
import { requirePageUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateProjectSummary } from '@/lib/calculations/rab';
import { rupiah, STATUS_LABEL, tanggal } from '@/lib/format';
import AppShell from '@/components/AppShell';
import { buttonClass, Card, EmptyState, inputClass, PageHeader, StatusBadge } from '@/components/ui';
import DeleteProjectButton from './DeleteProjectButton';

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

  return (
    <AppShell user={user}>
      <PageHeader
        title="Daftar Proyek"
        description="Proyek konstruksi milik Anda beserta nilai RAB-nya."
        actions={
          <Link href="/projects/new" className={buttonClass.primary}>
            <PlusCircle className="h-4 w-4" /> Proyek baru
          </Link>
        }
      />

      <form className="flex flex-col gap-2 sm:flex-row" role="search">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
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
        <button className={buttonClass.secondary}>Terapkan</button>
      </form>

      <Card>
        {projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title={q || status ? 'Tidak ada proyek yang cocok' : 'Belum ada proyek'}
            description={q || status ? 'Coba ubah kata kunci atau filter.' : 'Mulai dengan membuat proyek baru.'}
          />
        ) : (
          <div className="-m-5 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-slate-800 text-left text-xs text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Proyek</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Diperbarui</th>
                  <th className="px-3 py-3 text-right font-medium">Item</th>
                  <th className="px-3 py-3 text-right font-medium">Grand total</th>
                  <th className="px-5 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {projects.map((p) => {
                  const { grandTotal } = calculateProjectSummary({ ...p, items: p.rabItems });
                  return (
                    <tr key={p.id.toString()} className="hover:bg-slate-800/30">
                      <td className="px-5 py-3">
                        <Link href={`/projects/${p.id}`} className="font-medium text-white hover:text-cyan-300">
                          {p.projectName}
                        </Link>
                        <p className="text-xs text-slate-400">
                          {p.clientName}
                          {p.location ? ` · ${p.location}` : ''}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-3 py-3 text-slate-400">{tanggal(p.updatedAt)}</td>
                      <td className="px-3 py-3 text-right text-slate-300">{p.rabItems.length}</td>
                      <td className="px-3 py-3 text-right font-semibold text-white">{rupiah(grandTotal)}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <Link href={`/projects/${p.id}`} className="rounded-md px-2 py-1 text-xs text-cyan-300 hover:bg-slate-800">
                            Susun RAB
                          </Link>
                          <Link href={`/projects/${p.id}/edit`} className="rounded-md px-2 py-1 text-xs text-slate-300 hover:bg-slate-800">
                            Edit
                          </Link>
                          <DeleteProjectButton id={p.id.toString()} name={p.projectName} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
