import { Package } from 'lucide-react';
import { angka, rupiah } from '@/lib/format';
import { Card } from '@/components/ui';

/** Perkiraan kebutuhan material proyek (dari koefisien bahan AHSP × volume item). */
export default function MaterialNeeds({ materials }) {
  if (!materials?.items?.length) return null;
  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          <Package className="h-4 w-4 text-cyan-300" /> Perkiraan kebutuhan material
        </span>
      }
      description="Koefisien bahan AHSP × volume pekerjaan. Item manual tidak termasuk. Ikut tercetak sebagai lampiran di preview dan PDF."
    >
      <div className="-mx-5 -my-5 overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="border-b border-slate-800 text-xs text-slate-400">
            <tr>
              <th className="px-5 py-2 text-left font-medium">Bahan</th>
              <th className="px-3 py-2 text-right font-medium">Jumlah</th>
              <th className="px-3 py-2 text-right font-medium">Harga satuan</th>
              <th className="px-5 py-2 text-right font-medium">Perkiraan biaya</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {materials.items.map((m) => (
              <tr key={m.resourceId}>
                <td className="px-5 py-2">
                  <p className="text-slate-100">{m.name}</p>
                  <p className="font-mono text-[11px] text-slate-500">{m.code}</p>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-slate-200">
                  {angka(m.quantity)} {m.unit}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-slate-400">{rupiah(m.unitPrice)}</td>
                <td className="whitespace-nowrap px-5 py-2 text-right tabular-nums text-white">{rupiah(m.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-slate-700">
            <tr>
              <td colSpan={3} className="px-5 py-2.5 text-right text-xs text-slate-400">
                Perkiraan total biaya bahan
              </td>
              <td className="px-5 py-2.5 text-right font-semibold tabular-nums text-white">{rupiah(materials.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
}
