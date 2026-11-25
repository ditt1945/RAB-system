import { Package } from 'lucide-react';
import { angka, rupiah } from '@/lib/format';
import { Card } from '@/components/ui';

/** Perkiraan kebutuhan material proyek (dari koefisien bahan AHSP × volume item). */
export default function MaterialNeeds({ materials }) {
  if (!materials?.items?.length) return null;
  return (
    <Card
      bodyClassName="p-0"
      title={
        <span className="flex items-center gap-2">
          <Package className="h-4 w-4 text-brand-600" /> Perkiraan kebutuhan material
        </span>
      }
      description="Koefisien bahan AHSP × volume pekerjaan. Item manual tidak termasuk. Ikut dicetak sebagai lampiran di PDF internal."
    >
      {/* Laptop: tabel */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-navy-50 text-left text-xs font-semibold uppercase tracking-wide text-navy-800">
              <th className="px-5 py-2.5">Bahan</th>
              <th className="px-3 py-2.5 text-right">Jumlah</th>
              <th className="px-3 py-2.5 text-right">Harga satuan</th>
              <th className="px-5 py-2.5 text-right">Perkiraan biaya</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {materials.items.map((m) => (
              <tr key={m.resourceId}>
                <td className="px-5 py-2">
                  <p className="text-slate-900">{m.name}</p>
                  <p className="font-mono text-xs text-slate-500">{m.code}</p>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-slate-800">
                  {angka(m.quantity)} {m.unit}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-slate-600">{rupiah(m.unitPrice)}</td>
                <td className="whitespace-nowrap px-5 py-2 text-right tabular-nums text-navy-900">{rupiah(m.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* HP: daftar */}
      <ul className="divide-y divide-slate-100 sm:hidden">
        {materials.items.map((m) => (
          <li key={m.resourceId} className="flex items-start justify-between gap-3 px-4 py-3">
            <span className="min-w-0">
              <span className="block text-sm text-slate-900">{m.name}</span>
              <span className="text-xs tabular-nums text-slate-600">
                {angka(m.quantity)} {m.unit} × {rupiah(m.unitPrice)}
              </span>
            </span>
            <span className="shrink-0 text-sm font-medium tabular-nums text-navy-900">{rupiah(m.amount)}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 text-sm">
        <span className="text-slate-600">Perkiraan total biaya bahan</span>
        <span className="font-semibold tabular-nums text-navy-900">{rupiah(materials.total)}</span>
      </div>
    </Card>
  );
}
