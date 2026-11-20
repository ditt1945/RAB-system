import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Pencil } from 'lucide-react';
import { requirePageUser } from '@/lib/auth';
import { parseId } from '@/lib/api';
import { findAhspWithPrice } from '@/lib/rab-data';
import { angka, rupiah, RESOURCE_TYPE_LABEL } from '@/lib/format';
import AppShell from '@/components/AppShell';
import { buttonClass, Card, PageHeader } from '@/components/ui';
import DeleteAhspButton from './DeleteAhspButton';

export const metadata = { title: 'Detail AHSP - Sistem RAB Kontraktor' };

const SECTIONS = [
  ['A', 'upah'],
  ['B', 'bahan'],
  ['C', 'alat'],
];

export default async function AhspDetailPage({ params }) {
  const user = await requirePageUser();
  const { id } = await params;
  const found = await findAhspWithPrice(parseId(id));
  if (!found) notFound();
  const { ahsp, price } = found;

  return (
    <AppShell user={user}>
      <Link href="/ahsp" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Master AHSP
      </Link>

      <PageHeader
        title={ahsp.name}
        description={`${ahsp.code} · ${ahsp.category.name} · satuan ${ahsp.unit}${ahsp.isActive ? '' : ' · NONAKTIF'}`}
        actions={
          user.isAdmin && (
            <>
              <Link href={`/ahsp/${id}/edit`} className={buttonClass.secondary}>
                <Pencil className="h-4 w-4" /> Edit
              </Link>
              <DeleteAhspButton id={id} name={ahsp.name} />
            </>
          )
        }
      />

      {ahsp.description && <p className="text-sm text-slate-400">{ahsp.description}</p>}

      <Card title={`Analisa untuk 1 ${ahsp.unit}`} description="Format Permen PUPR No. 1 Tahun 2022">
        <div className="-m-5 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-slate-800 text-xs text-slate-400">
              <tr>
                <th className="px-5 py-2 text-left font-medium">Uraian</th>
                <th className="px-3 py-2 text-left font-medium">Kode</th>
                <th className="px-3 py-2 text-center font-medium">Satuan</th>
                <th className="px-3 py-2 text-right font-medium">Koefisien</th>
                <th className="px-3 py-2 text-right font-medium">Harga satuan</th>
                <th className="px-5 py-2 text-right font-medium">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {SECTIONS.map(([letter, type]) => {
                const lines = price.lines.filter((l) => l.resource.type === type);
                return [
                  <tr key={`${type}-head`} className="bg-slate-800/40">
                    <td colSpan={6} className="px-5 py-2 text-xs font-semibold uppercase text-cyan-300">
                      {letter}. {RESOURCE_TYPE_LABEL[type]}
                    </td>
                  </tr>,
                  ...(lines.length === 0
                    ? [
                        <tr key={`${type}-empty`}>
                          <td colSpan={6} className="px-5 py-2 text-xs text-slate-500">
                            Tidak ada
                          </td>
                        </tr>,
                      ]
                    : lines.map((l) => (
                        <tr key={l.id.toString()} className="border-b border-slate-800/60">
                          <td className="px-5 py-2 text-slate-200">{l.resource.name}</td>
                          <td className="px-3 py-2 font-mono text-xs text-slate-400">{l.resource.code}</td>
                          <td className="px-3 py-2 text-center text-slate-400">{l.resource.unit}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{angka(l.coefficient, 6)}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{rupiah(l.resource.unitPrice)}</td>
                          <td className="px-5 py-2 text-right tabular-nums">{rupiah(l.amount)}</td>
                        </tr>
                      ))),
                  <tr key={`${type}-total`} className="border-b border-slate-700">
                    <td colSpan={5} className="px-3 py-2 text-right text-xs text-slate-400">
                      Jumlah {RESOURCE_TYPE_LABEL[type].toLowerCase()}
                    </td>
                    <td className="px-5 py-2 text-right font-medium tabular-nums">{rupiah(price[type])}</td>
                  </tr>,
                ];
              })}
            </tbody>
            <tfoot className="text-sm">
              <tr>
                <td colSpan={5} className="px-3 py-2 text-right text-slate-300">
                  D. Jumlah (A + B + C)
                </td>
                <td className="px-5 py-2 text-right tabular-nums">{rupiah(price.base)}</td>
              </tr>
              <tr>
                <td colSpan={5} className="px-3 py-2 text-right text-slate-300">
                  E. Overhead & keuntungan {angka(ahsp.overheadPercent, 2)}% × D
                </td>
                <td className="px-5 py-2 text-right tabular-nums">{rupiah(price.overhead)}</td>
              </tr>
              <tr className="bg-cyan-500/10 font-semibold text-cyan-200">
                <td colSpan={5} className="px-3 py-3 text-right">
                  F. Harga satuan pekerjaan (D + E)
                </td>
                <td className="px-5 py-3 text-right tabular-nums">{rupiah(price.unitPrice)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
