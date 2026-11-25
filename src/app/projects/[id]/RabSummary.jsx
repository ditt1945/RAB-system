import Link from 'next/link';
import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import { angka, rupiah, terbilang } from '@/lib/format';
import { buttonClass } from '@/components/ui';

const PARTS = [
  ['upah', 'Upah', 'bg-navy-800'],
  ['bahan', 'Bahan', 'bg-brand-500'],
  ['alat', 'Alat', 'bg-amber-400'],
  ['overhead', 'Overhead & profit', 'bg-slate-400'],
  ['manual', 'Item manual', 'bg-sky-400'],
];

/** Rekapitulasi RAB: rincian DPP/PPN, total akhir, dan komposisi biaya. */
export default function RabSummary({ summary, composition, itemCount, projectId, showActions = true }) {
  const rows = [
    ['Jumlah harga pekerjaan', summary.itemsSubtotal, true],
    summary.discountAmount > 0 && ['Diskon', -summary.discountAmount],
    summary.serviceFee > 0 && ['Biaya jasa', summary.serviceFee],
    summary.marginAmount > 0 && [`Margin ${angka(summary.marginPercent, 2)}%`, summary.marginAmount],
    ['DPP', summary.dpp],
    [`PPN ${angka(summary.taxPercent, 2)}%`, summary.taxAmount],
    ['Jumlah total', summary.total, true],
  ].filter(Boolean);
  const parts = composition?.total > 0 ? PARTS.filter(([key]) => composition[key] > 0) : [];

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-navy-900 p-5 text-white">
        <p className="text-[13px] text-white/70">Total akhir (dibulatkan)</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">{rupiah(summary.grandTotal)}</p>
        <p className="mt-2 text-xs italic leading-relaxed text-white/70">{terbilang(summary.grandTotal)}</p>
        <p className="mt-3 text-xs text-white/60">{itemCount} item pekerjaan</p>
      </div>

      <dl className="space-y-2 text-sm">
        {rows.map(([label, value, strong]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className={strong ? 'font-medium text-slate-900' : 'text-slate-600'}>{label}</dt>
            <dd className={`tabular-nums ${strong ? 'font-semibold text-navy-900' : 'text-slate-700'}`}>{value < 0 ? `- ${rupiah(-value)}` : rupiah(value)}</dd>
          </div>
        ))}
      </dl>

      {parts.length > 0 && (
        <div>
          <p className="mb-2 text-[13px] font-medium text-slate-900">Komposisi biaya pekerjaan</p>
          <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100" aria-hidden>
            {parts.map(([key, , color]) => (
              <span key={key} className={color} style={{ width: `${composition[`${key}Percent`]}%` }} />
            ))}
          </div>
          <ul className="mt-2 space-y-1 text-xs">
            {parts.map(([key, label, color]) => (
              <li key={key} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className={`h-2 w-2 rounded-full ${color}`} /> {label}
                </span>
                <span className="tabular-nums text-slate-700">
                  {angka(composition[`${key}Percent`], 1)}% · {rupiah(composition[key])}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showActions && projectId && (
        <div className="space-y-2 border-t border-slate-200 pt-4">
          {itemCount > 0 && (
            <Link href={`/projects/${projectId}/preview`} className={`${buttonClass.primary} w-full`}>
              Lanjut ke preview <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <Link href={`/projects/${projectId}/edit#biaya`} className={`${buttonClass.secondary} w-full`}>
            <SlidersHorizontal className="h-4 w-4" /> Diskon, jasa, margin, PPN
          </Link>
        </div>
      )}
    </div>
  );
}
