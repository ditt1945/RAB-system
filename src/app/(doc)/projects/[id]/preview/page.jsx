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
const VERSIONS = [
  { key: 'internal', label: 'Internal', hint: 'Dengan lampiran kebutuhan material dan komposisi biaya.' },
  { key: 'client', label: 'Untuk klien', hint: 'RAB dan rekap saja, tanpa lampiran internal.' },
];

export default async function PreviewPage({ params, searchParams }) {
  const user = await requirePageUser();
  const { id } = await params;
  const version = (await searchParams).versi === 'klien' ? 'client' : 'internal';
  const rab = await loadProjectRab(parseId(id), user.id);
  if (!rab) notFound();
  const { project, groups, summary, company, preparedBy, items, materials, composition } = rab;
  const isEmpty = items.length === 0;
  const internal = version === 'internal';

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

  const compositionRows = [
    ['Upah tenaga kerja', 'upah'],
    ['Bahan / material', 'bahan'],
    ['Peralatan', 'alat'],
    ['Overhead & keuntungan', 'overhead'],
    ['Item manual (di luar AHSP)', 'manual'],
  ].filter(([, key]) => composition[key] > 0);

  return (
    <div className="min-h-screen bg-slate-200 print:bg-white">
      {/* Toolbar menempel di atas saat dokumen digulir */}
      <div className="sticky top-0 z-30 border-b border-slate-300 bg-white/95 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-[210mm] flex-wrap items-center justify-between gap-2 px-4 py-2.5">
          <Link href={`/projects/${id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-navy-900">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Kembali ke</span> RAB
          </Link>
          {!isEmpty && (
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg bg-slate-100 p-0.5 text-[13px]" role="group" aria-label="Versi dokumen">
                {VERSIONS.map((v) => (
                  <Link
                    key={v.key}
                    href={v.key === 'client' ? `?versi=klien` : '?'}
                    replace
                    scroll={false}
                    title={v.hint}
                    aria-current={version === v.key ? 'true' : undefined}
                    className={`rounded-md px-2.5 py-1.5 font-medium ${version === v.key ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-600 hover:text-navy-900'}`}
                  >
                    {v.label}
                  </Link>
                ))}
              </div>
              <PrintButton />
              <PdfButton projectId={id} version={version} label="PDF" />
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-[210mm] space-y-3 px-4 py-4 print:hidden">
        <ProjectSteps current="preview" projectId={id} hasItems={!isEmpty} />
        <p className="text-xs text-slate-600">{VERSIONS.find((v) => v.key === version).hint} Hasil cetak dan PDF sama dengan tampilan ini.</p>
        {!company?.companyName && (
          <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Kop perusahaan belum diisi, jadi dokumen ini tampil tanpa kop.{' '}
            <Link href="/company-settings" className="font-semibold underline">
              Lengkapi data perusahaan
            </Link>
          </p>
        )}
        {isEmpty && (
          <p className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700">
            RAB masih kosong, jadi belum bisa dicetak atau di-export.{' '}
            <Link href={`/projects/${id}`} className="font-semibold underline">
              Tambahkan pekerjaan
            </Link>
          </p>
        )}
      </div>

      {/* Di layar sempit dokumen bisa digeser ke samping; ukuran A4 tetap terjaga */}
      <div className="overflow-x-auto px-2 pb-10 sm:px-4 print:overflow-visible print:p-0">
        <article className="mx-auto w-[210mm] min-w-[210mm] bg-white px-[12mm] py-[14mm] text-[12px] leading-snug text-slate-900 shadow-lg print:w-auto print:min-w-0 print:p-0 print:shadow-none">
          {company?.companyName && (
            <header className="mb-4 flex items-center gap-4 border-b-2 border-slate-900 pb-2">
              {company.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- URL logo dari pengguna
                <img src={company.logoUrl} alt="" className="h-14 w-14 shrink-0 object-contain" />
              )}
              <div className="flex-1 text-center">
                <p className="text-lg font-bold uppercase">{company.companyName}</p>
                <p className="text-[11px] text-slate-600">{[company.address, company.phone && `Telp. ${company.phone}`, company.email].filter(Boolean).join(' · ')}</p>
              </div>
              {company.logoUrl && <span className="w-14 shrink-0" aria-hidden />}
            </header>
          )}

          <h1 className="mb-4 text-center text-base font-bold">RENCANA ANGGARAN BIAYA (RAB)</h1>

          <table className="mb-4">
            <tbody>
              {[
                project.rabNumber && ['Nomor RAB', project.rabNumber],
                ['Pekerjaan', project.projectName],
                ['Pemilik / Klien', project.clientName],
                ['Lokasi', project.location || '-'],
                ['Tanggal', tanggal(new Date())],
              ]
                .filter(Boolean)
                .map(([label, value]) => (
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
              <p className="mt-16 font-bold underline">{project.approvedBy || project.clientName}</p>
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

          {internal && materials.items.length > 0 && (
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

          {internal && compositionRows.length > 0 && (
            <section className="mt-8 break-inside-avoid">
              <h2 className="mb-2 text-center text-sm font-bold">KOMPOSISI BIAYA PEKERJAAN</h2>
              <table className="w-full border-collapse">
                <tbody>
                  {compositionRows.map(([label, key]) => (
                    <tr key={key}>
                      <td className={`${cell} text-right`}>
                        {label} ({angka(composition[`${key}Percent`], 1)}%)
                      </td>
                      <td className={`${cell} w-28 text-right tabular-nums`}>{rupiah(composition[key])}</td>
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td className={`${cell} text-right`}>JUMLAH HARGA PEKERJAAN</td>
                    <td className={`${cell} w-28 text-right tabular-nums`}>{rupiah(composition.total)}</td>
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
