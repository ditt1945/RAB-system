import { angka, rupiah, terbilang } from '@/lib/format';
import { Card } from '@/components/ui';

/** Rekapitulasi RAB. Dipakai di halaman susun RAB dan preview. */
export default function RabSummary({ summary, itemCount }) {
  const rows = [
    ['Jumlah harga pekerjaan', summary.itemsSubtotal, true],
    summary.discountAmount > 0 && ['Diskon', -summary.discountAmount],
    summary.serviceFee > 0 && ['Biaya jasa', summary.serviceFee],
    summary.marginAmount > 0 && [`Margin ${angka(summary.marginPercent, 2)}%`, summary.marginAmount],
    ['DPP', summary.dpp],
    [`PPN ${angka(summary.taxPercent, 2)}%`, summary.taxAmount],
    ['Jumlah total', summary.total, true],
  ].filter(Boolean);

  return (
    <Card title="Rekapitulasi" description={`${itemCount} item pekerjaan`}>
      <dl className="space-y-2 text-sm">
        {rows.map(([label, value, strong]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className={strong ? 'font-medium text-slate-200' : 'text-slate-400'}>{label}</dt>
            <dd className={`tabular-nums ${strong ? 'font-semibold text-white' : 'text-slate-300'}`}>
              {value < 0 ? `- ${rupiah(-value)}` : rupiah(value)}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-4">
        <p className="text-xs text-cyan-200">Grand total (dibulatkan)</p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-cyan-200">{rupiah(summary.grandTotal)}</p>
        <p className="mt-1 text-xs italic text-cyan-100/70">{terbilang(summary.grandTotal)}</p>
      </div>
    </Card>
  );
}
