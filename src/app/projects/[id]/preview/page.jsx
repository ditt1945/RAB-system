import { Fragment } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, FileDown } from 'lucide-react';
import { requirePageUser } from '@/lib/auth';
import { parseId } from '@/lib/api';
import { loadProjectRab } from '@/lib/rab-data';
import { angka, rupiah, tanggal, terbilang } from '@/lib/format';
import { buttonClass } from '@/components/ui';
import PrintButton from './PrintButton';

export const metadata = { title: 'Preview RAB - Sistem RAB Kontraktor' };

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const cell = 'border border-slate-400 px-2 py-1';

export default async function PreviewPage({ params }) {
  const user = await requirePageUser();
  const { id } = await params;
  const rab = await loadProjectRab(parseId(id), user.id);
  if (!rab) notFound();
  const { project, groups, summary, company, preparedBy, items } = rab;

  const recap = [
    ['JUMLAH HARGA PEKERJAAN', rupiah(summary.itemsSubtotal), true],
    summary.discountAmount > 0 && ['Diskon', `- ${rupiah(summary.discountAmount)}`],
    summary.serviceFee > 0 && ['Biaya Jasa', rupiah(summary.serviceFee)],
    summary.marginAmount > 0 && [`Margin ${angka(summary.marginPercent, 2)}%`, rupiah(summary.marginAmount)],
    ['Dasar Pengenaan Pajak (DPP)', rupiah(summary.dpp)],
    [`PPN ${angka(summary.taxPercent, 2)}%`, rupiah(summary.taxAmount)],
    ['JUMLAH TOTAL', rupiah(summary.total), true],
    ['DIBULATKAN', rupiah(summary.grandTotal), true],
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-200 py-6 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-[210mm] flex-wrap items-center justify-between gap-2 px-4 print:hidden">
        <Link href={`/projects/${id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-700 hover:text-slate-950">
          <ArrowLeft className="h-4 w-4" /> Kembali ke penyusunan RAB
        </Link>
        <div className="flex gap-2">
          <PrintButton />
          {items.length > 0 && (
            <a href={`/api/projects/${id}/pdf?download=1`} className={buttonClass.primary}>
              <FileDown className="h-4 w-4" /> Export PDF
            </a>
          )}
        </div>
      </div>

      <article className="mx-auto max-w-[210mm] bg-white px-[12mm] py-[14mm] text-[12px] leading-snug text-slate-900 shadow-lg print:max-w-none print:p-0 print:shadow-none">
        {company?.companyName && (
          <header className="mb-4 border-b-2 border-slate-900 pb-2 text-center">
            <p className="text-lg font-bold uppercase">{company.companyName}</p>
            <p className="text-[11px] text-slate-600">
              {[company.address, company.phone && `Telp. ${company.phone}`, company.email].filter(Boolean).join(' · ')}
            </p>
          </header>
        )}

        <h1 className="mb-4 text-center text-base font-bold">RENCANA ANGGARAN BIAYA (RAB)</h1>

        <table className="mb-4">
          <tbody>
            {[
              ['Pekerjaan', project.projectName],
              ['Pemilik / Klien', project.clientName],
              ['Lokasi', project.location || '-'],
              ['Tanggal', tanggal(new Date())],
            ].map(([label, value]) => (
              <tr key={label}>
                <td className="w-32 pr-2 align-top">{label}</td>
                <td className="align-top">: {value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {items.length === 0 ? (
          <p className="rounded border border-dashed border-slate-400 p-6 text-center text-slate-500">RAB masih kosong.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-slate-200">
              <tr>
                <th className={`${cell} w-8`}>No</th>
                <th className={`${cell} w-20`}>Kode</th>
                <th className={cell}>Uraian Pekerjaan</th>
                <th className={`${cell} w-16`}>Volume</th>
                <th className={`${cell} w-12`}>Sat.</th>
                <th className={`${cell} w-28`}>Harga Satuan</th>
                <th className={`${cell} w-28`}>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group, gi) => (
                <Fragment key={group.name}>
                  <tr className="bg-slate-100 font-bold">
                    <td className={`${cell} text-center`}>{LETTERS[gi] ?? gi + 1}</td>
                    <td className={cell} colSpan={6}>
                      {group.name.toUpperCase()}
                    </td>
                  </tr>
                  {group.items.map((item, i) => (
                    <tr key={item.id} className="break-inside-avoid">
                      <td className={`${cell} text-center`}>{i + 1}</td>
                      <td className={cell}>{item.code || '-'}</td>
                      <td className={cell}>{item.name}</td>
                      <td className={`${cell} text-right tabular-nums`}>{angka(item.volume)}</td>
                      <td className={`${cell} text-center`}>{item.unit}</td>
                      <td className={`${cell} text-right tabular-nums`}>{rupiah(item.unitPrice)}</td>
                      <td className={`${cell} text-right tabular-nums`}>{rupiah(item.subtotal)}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <td className={`${cell} text-right`} colSpan={6}>
                      Jumlah {group.name}
                    </td>
                    <td className={`${cell} text-right tabular-nums`}>{rupiah(group.subtotal)}</td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        )}

        <table className="mt-4 w-full border-collapse break-inside-avoid">
          <tbody>
            {recap.map(([label, value, strong]) => (
              <tr key={label} className={strong ? 'font-bold' : ''}>
                <td className={`${cell} text-right`}>{label}</td>
                <td className={`${cell} w-28 text-right tabular-nums`}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 italic">Terbilang: {terbilang(summary.grandTotal)}</p>

        <div className="mt-10 flex justify-end break-inside-avoid">
          <div className="w-56 text-center">
            <p>
              {project.location || '..................'}, {tanggal(new Date())}
            </p>
            <p>Dibuat oleh,</p>
            {company?.companyName && <p>{company.companyName}</p>}
            <p className="mt-16 font-bold underline">{preparedBy}</p>
          </div>
        </div>
      </article>
    </div>
  );
}
