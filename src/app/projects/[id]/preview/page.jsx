import { Fragment } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requirePageUser } from '@/lib/auth';
import { parseId } from '@/lib/api';
import { loadProjectRab } from '@/lib/rab-data';
import { angka, rupiah, tanggal, terbilang } from '@/lib/format';
import ProjectSteps from '@/components/ProjectSteps';
import PdfButton from '@/components/PdfButton';
import PrintButton from './PrintButton';

export const metadata = { title: 'Preview RAB - Sistem RAB Kontraktor' };

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const cell = 'border border-slate-400 px-2 py-1';

export default async function PreviewPage({ params }) {
  const user = await requirePageUser();
  const { id } = await params;
  const rab = await loadProjectRab(parseId(id), user.id);
  if (!rab) notFound();
  const { project, groups, summary, company, preparedBy, items, materials } = rab;
  const isEmpty = items.length === 0;

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
      <div className="mx-auto mb-4 flex max-w-[210mm] flex-wrap items-start justify-between gap-2 px-4 print:hidden">
        <Link href={`/projects/${id}`} className="inline-flex items-center gap-1.5 py-2 text-sm text-slate-700 hover:text-slate-950">
          <ArrowLeft className="h-4 w-4" /> Kembali ke penyusunan RAB
        </Link>
        {!isEmpty && (
          <div className="flex gap-2">
            <PrintButton />
            <PdfButton projectId={id} />
          </div>
        )}
      </div>

      <div className="mx-auto mb-4 max-w-[210mm] space-y-3 px-4 print:hidden">
        <ProjectSteps current="preview" projectId={id} hasItems={!isEmpty} light />
        {!company?.companyName && (
          <p className="rounded-lg border border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Kop perusahaan belum diisi, jadi dokumen ini tampil tanpa kop.{' '}
            <Link href="/company-settings" className="font-semibold underline">
              Lengkapi data perusahaan
            </Link>
          </p>
        )}
        {isEmpty && (
          <p className="rounded-lg border border-slate-400 bg-white px-4 py-3 text-sm text-slate-700">
            RAB masih kosong, jadi belum bisa dicetak atau di-export.{' '}
            <Link href={`/projects/${id}`} className="font-semibold underline">
              Tambahkan item pekerjaan
            </Link>
          </p>
        )}
      </div>

      {/* Di layar sempit dokumen bisa digeser ke samping; ukuran A4 tetap terjaga */}
      <div className="overflow-x-auto px-2 sm:px-4 print:overflow-visible print:px-0">
        <article className="mx-auto w-[210mm] min-w-[210mm] bg-white px-[12mm] py-[14mm] text-[12px] leading-snug text-slate-900 shadow-lg print:w-auto print:min-w-0 print:p-0 print:shadow-none">
          {company?.companyName && (
            <header className="mb-4 flex items-center gap-4 border-b-2 border-slate-900 pb-2">
              {company.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- URL logo dari pengguna
                <img src={company.logoUrl} alt="" className="h-14 w-14 shrink-0 object-contain" />
              )}
              <div className="flex-1 text-center">
                <p className="text-lg font-bold uppercase">{company.companyName}</p>
                <p className="text-[11px] text-slate-600">
                  {[company.address, company.phone && `Telp. ${company.phone}`, company.email].filter(Boolean).join(' · ')}
                </p>
              </div>
              {company.logoUrl && <span className="w-14 shrink-0" aria-hidden />}
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

          {isEmpty ? (
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

          <div className="mt-10 grid grid-cols-2 gap-8 break-inside-avoid text-center">
            <div>
              <p>&nbsp;</p>
              <p>Disetujui oleh,</p>
              <p>Pemilik / Klien</p>
              <p className="mt-16 font-bold underline">{project.clientName}</p>
            </div>
            <div>
              <p>
                {project.location || '..................'}, {tanggal(new Date())}
              </p>
              <p>Dibuat oleh,</p>
              <p>{company?.companyName || ' '}</p>
              <p className="mt-16 font-bold underline">{preparedBy}</p>
            </div>
          </div>

          {materials.items.length > 0 && (
            <section className="mt-10 break-before-page">
              <h2 className="text-center text-sm font-bold">LAMPIRAN: PERKIRAAN KEBUTUHAN MATERIAL</h2>
              <p className="mb-3 text-center text-[11px] text-slate-600">
                Dihitung dari koefisien bahan AHSP × volume pekerjaan (item manual tidak termasuk). Harga bahan sesuai master harga saat ini.
              </p>
              <table className="w-full border-collapse">
                <thead className="bg-slate-200">
                  <tr>
                    <th className={`${cell} w-8`}>No</th>
                    <th className={`${cell} w-20`}>Kode</th>
                    <th className={cell}>Nama Bahan</th>
                    <th className={`${cell} w-20`}>Jumlah</th>
                    <th className={`${cell} w-12`}>Sat.</th>
                    <th className={`${cell} w-24`}>Harga Satuan</th>
                    <th className={`${cell} w-28`}>Perkiraan Biaya</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.items.map((m, i) => (
                    <tr key={m.resourceId} className="break-inside-avoid">
                      <td className={`${cell} text-center`}>{i + 1}</td>
                      <td className={cell}>{m.code}</td>
                      <td className={cell}>{m.name}</td>
                      <td className={`${cell} text-right tabular-nums`}>{angka(m.quantity)}</td>
                      <td className={`${cell} text-center`}>{m.unit}</td>
                      <td className={`${cell} text-right tabular-nums`}>{rupiah(m.unitPrice)}</td>
                      <td className={`${cell} text-right tabular-nums`}>{rupiah(m.amount)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td className={`${cell} text-right`} colSpan={6}>
                      PERKIRAAN TOTAL BIAYA BAHAN
                    </td>
                    <td className={`${cell} text-right tabular-nums`}>{rupiah(materials.total)}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          )}
        </article>
      </div>
    </div>
  );
}
