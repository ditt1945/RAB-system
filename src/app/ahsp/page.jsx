import { Fragment } from 'react';
import Link from 'next/link';
import { Calculator, PlusCircle, Search, Wrench } from 'lucide-react';
import { requirePageUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { listAhsp } from '@/lib/ahsp';
import { rupiah } from '@/lib/format';
import AppShell from '@/components/AppShell';
import { buttonClass, Card, EmptyState, inputClass, PageHeader } from '@/components/ui';

export const metadata = { title: 'Master AHSP - Sistem RAB Kontraktor' };

export default async function AhspListPage({ searchParams }) {
  const user = await requirePageUser();
  const { q = '', category = '' } = await searchParams;

  const [categories, list] = await Promise.all([
    prisma.ahspCategory.findMany({ orderBy: { sortOrder: 'asc' } }),
    listAhsp({
      q: q.trim() || undefined,
      categoryId: /^\d+$/.test(category) ? BigInt(category) : undefined,
      includeInactive: user.isAdmin,
    }),
  ]);

  const grouped = categories
    .map((c) => ({ ...c, items: list.filter((a) => a.categoryId === c.id.toString()) }))
    .filter((c) => c.items.length > 0);

  return (
    <AppShell user={user}>
      <PageHeader
        title="Master AHSP"
        description="Analisa Harga Satuan Pekerjaan: harga per satuan pekerjaan dihitung dari koefisien × harga upah, bahan, dan alat, ditambah overhead & keuntungan."
        actions={
          <>
            <Link href="/ahsp/resources" className={buttonClass.secondary}>
              <Wrench className="h-4 w-4" /> Harga upah, bahan, alat
            </Link>
            {user.isAdmin && (
              <Link href="/ahsp/new" className={buttonClass.primary}>
                <PlusCircle className="h-4 w-4" /> Tambah AHSP
              </Link>
            )}
          </>
        }
      />

      <form className="flex flex-col gap-2 sm:flex-row" role="search">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input name="q" defaultValue={q} placeholder="Cari kode atau nama pekerjaan…" className={`${inputClass} pl-9`} aria-label="Cari AHSP" />
        </div>
        <select name="category" defaultValue={category} className={`${inputClass} sm:w-64`} aria-label="Filter kategori">
          <option value="">Semua kategori</option>
          {categories.map((c) => (
            <option key={c.id.toString()} value={c.id.toString()}>
              {c.name}
            </option>
          ))}
        </select>
        <button className={buttonClass.secondary}>Terapkan</button>
      </form>

      <Card>
        {grouped.length === 0 ? (
          <EmptyState icon={Calculator} title="Tidak ada AHSP" description={q || category ? 'Coba kata kunci lain.' : 'Admin belum menambahkan AHSP.'} />
        ) : (
          <div className="-m-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-slate-800 text-left text-xs text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Kode</th>
                  <th className="px-3 py-3 font-medium">Uraian pekerjaan</th>
                  <th className="px-3 py-3 text-center font-medium">Satuan</th>
                  <th className="px-5 py-3 text-right font-medium">Harga satuan</th>
                </tr>
              </thead>
              <tbody>
                {grouped.map((c) => (
                  <Fragment key={c.id.toString()}>
                    <tr className="bg-slate-800/40">
                      <td colSpan={4} className="px-5 py-2 text-xs font-semibold uppercase tracking-wide text-cyan-300">
                        {c.code} · {c.name}
                      </td>
                    </tr>
                    {c.items.map((a) => (
                      <tr key={a.id} className={`border-b border-slate-800/70 hover:bg-slate-800/20 ${a.isActive ? '' : 'opacity-50'}`}>
                        <td className="whitespace-nowrap px-5 py-2.5 font-mono text-xs text-slate-400">{a.code}</td>
                        <td className="px-3 py-2.5">
                          <Link href={`/ahsp/${a.id}`} className="text-slate-100 hover:text-cyan-300">
                            {a.name}
                          </Link>
                          {!a.isActive && <span className="ml-2 text-[11px] text-slate-500">(nonaktif)</span>}
                        </td>
                        <td className="px-3 py-2.5 text-center text-slate-400">{a.unit}</td>
                        <td className="px-5 py-2.5 text-right font-medium tabular-nums text-white">{rupiah(a.unitPrice)}</td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
