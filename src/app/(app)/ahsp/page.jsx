import { Fragment } from 'react';
import Link from 'next/link';
import { Calculator, ChevronRight, PlusCircle, Search } from 'lucide-react';
import { requirePageUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { listAhsp } from '@/lib/ahsp';
import { parseId } from '@/lib/api';
import { rupiah } from '@/lib/format';
import FilterForm from '@/components/FilterForm';
import { buttonClass, Card, EmptyState, inputClass, PageHeader } from '@/components/ui';
import AhspTabs from './AhspTabs';
import AhspDialogButton from './AhspDialogButton';
import { serialize } from '@/lib/api';

export const metadata = { title: 'Master AHSP - Sistem RAB Kontraktor' };

export default async function AhspListPage({ searchParams }) {
  const user = await requirePageUser();
  const { q = '', category = '' } = await searchParams;

  const [categories, list, resources] = await Promise.all([
    prisma.ahspCategory.findMany({ orderBy: { sortOrder: 'asc' } }),
    listAhsp({
      q: q.trim() || undefined,
      categoryId: parseId(category) ?? undefined,
      includeInactive: user.isAdmin,
    }),
    user.isAdmin ? prisma.resource.findMany({ where: { isActive: true }, orderBy: [{ type: 'asc' }, { code: 'asc' }] }) : [],
  ]);

  const grouped = categories
    .map((c) => ({ ...c, items: list.filter((a) => a.categoryId === c.id.toString()) }))
    .filter((c) => c.items.length > 0);

  return (
    <>
      <PageHeader
        title="Master AHSP"
        description="Analisa Harga Satuan Pekerjaan: harga per satuan pekerjaan = koefisien × harga upah, bahan, dan alat, ditambah overhead & keuntungan."
        actions={
          user.isAdmin && (
            <AhspDialogButton categories={serialize(categories)} resources={serialize(resources)} className={buttonClass.primary}>
              <PlusCircle className="h-4 w-4" /> Tambah AHSP
            </AhspDialogButton>
          )
        }
      />
      <AhspTabs current="analisa" />

      <FilterForm className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
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
      </FilterForm>

      <Card bodyClassName="p-0">
        {grouped.length === 0 ? (
          <EmptyState icon={Calculator} title="Tidak ada AHSP" description={q || category ? 'Coba kata kunci lain.' : 'Admin belum menambahkan AHSP.'} />
        ) : (
          <>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-navy-50 text-left text-xs font-semibold uppercase tracking-wide text-navy-800">
                    <th className="w-40 px-5 py-2.5">Kode</th>
                    <th className="px-3 py-2.5">Uraian pekerjaan</th>
                    <th className="w-24 px-3 py-2.5 text-center">Satuan</th>
                    <th className="w-44 px-5 py-2.5 text-right">Harga satuan</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped.map((c) => (
                    <Fragment key={c.id.toString()}>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <td colSpan={4} className="px-5 py-2 text-[13px] font-semibold uppercase tracking-wide text-navy-900">
                          <span className="mr-2 font-mono text-xs font-normal text-slate-500">{c.code}</span>
                          {c.name}
                        </td>
                      </tr>
                      {c.items.map((a) => (
                        <tr key={a.id} className={`group relative border-b border-slate-100 hover:bg-brand-50/40 ${a.isActive ? '' : 'opacity-60'}`}>
                          <td className="whitespace-nowrap px-5 py-2.5 font-mono text-xs text-slate-600">{a.code}</td>
                          <td className="px-3 py-2.5">
                            {/* Seluruh baris bisa diklik lewat link yang direntangkan */}
                            <Link href={`/ahsp/${a.id}`} className="text-slate-900 after:absolute after:inset-0 group-hover:text-brand-700">
                              {a.name}
                            </Link>
                            {!a.isActive && <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">nonaktif</span>}
                          </td>
                          <td className="px-3 py-2.5 text-center text-slate-600">{a.unit}</td>
                          <td className="px-5 py-2.5 text-right font-medium tabular-nums text-navy-900">{rupiah(a.unitPrice)}</td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-200 sm:hidden">
              {grouped.map((c) => (
                <section key={c.id.toString()}>
                  <h2 className="bg-slate-50 px-4 py-2 text-[13px] font-semibold uppercase tracking-wide text-navy-900">{c.name}</h2>
                  <ul className="divide-y divide-slate-100">
                    {c.items.map((a) => (
                      <li key={a.id}>
                        <Link href={`/ahsp/${a.id}`} className={`flex items-center justify-between gap-3 px-4 py-3 ${a.isActive ? '' : 'opacity-60'}`}>
                          <span className="min-w-0">
                            <span className="block text-sm text-slate-900">{a.name}</span>
                            <span className="text-xs text-slate-500">
                              {a.code} · {rupiah(a.unitPrice)}/{a.unit}
                            </span>
                          </span>
                          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </>
        )}
      </Card>
    </>
  );
}
