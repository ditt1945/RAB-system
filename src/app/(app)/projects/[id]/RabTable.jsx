'use client';

import { Fragment } from 'react';
import { ChevronRight, Copy, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { angka, rupiah, RESOURCE_TYPE_LABEL } from '@/lib/format';
import { ActionMenu } from '@/components/overlay';
import NumberCell from './NumberCell';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Tabel RAB per kelompok.
 * Laptop: tabel seperti spreadsheet (volume & harga item manual bisa diketik langsung, baris AHSP bisa dibuka).
 * HP: kartu per item; ketuk untuk mengubah di panel bawah.
 */
export default function RabTable({ groups, hidden, expanded, ahspBreakdown, actions }) {
  const visibleGroups = groups
    .map((g) => ({ ...g, items: g.items.filter((i) => !hidden.has(i.id)) }))
    .filter((g) => g.items.length > 0);

  const menuFor = (item) => [
    { label: 'Ubah detail', icon: Pencil, onClick: () => actions.edit(item) },
    item.ahspId && { label: 'Perbarui harga dari AHSP', icon: RefreshCw, onClick: () => actions.reprice(item) },
    { label: 'Duplikat', icon: Copy, onClick: () => actions.duplicate(item) },
    { label: 'Hapus', icon: Trash2, danger: true, onClick: () => actions.remove(item) },
  ];

  return (
    <>
      {/* ── Laptop ─────────────────────────────────────────────────── */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-y border-slate-200 bg-navy-50 text-left text-xs font-semibold uppercase tracking-wide text-navy-800">
              <th className="w-12 px-3 py-2.5 text-center">No</th>
              <th className="px-3 py-2.5">Uraian pekerjaan</th>
              <th className="w-32 px-3 py-2.5 text-right">Volume</th>
              <th className="w-16 px-3 py-2.5">Sat.</th>
              <th className="w-40 px-3 py-2.5 text-right">Harga satuan</th>
              <th className="w-40 px-3 py-2.5 text-right">Jumlah</th>
              <th className="w-12 px-2 py-2.5" aria-label="Aksi" />
            </tr>
          </thead>
          <tbody>
            {visibleGroups.map((group, gi) => (
              <Fragment key={group.name}>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <td className="px-3 py-2 text-center text-sm font-semibold text-brand-700">{LETTERS[gi] ?? gi + 1}</td>
                  <td colSpan={6} className="px-3 py-2 text-[13px] font-semibold uppercase tracking-wide text-navy-900">
                    {group.name}
                  </td>
                </tr>
                {group.items.map((item, i) => {
                  const breakdown = item.ahspId ? ahspBreakdown[String(item.ahspId)] : null;
                  const isOpen = expanded.has(item.id);
                  return (
                    <Fragment key={item.id}>
                      <tr className="group border-b border-slate-100 hover:bg-slate-50/60">
                        <td className="px-3 py-1.5 text-center text-slate-500">
                          {breakdown ? (
                            <button
                              type="button"
                              onClick={() => actions.toggle(item.id)}
                              aria-expanded={isOpen}
                              aria-label={`${isOpen ? 'Tutup' : 'Lihat'} rincian AHSP ${item.name}`}
                              className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 hover:bg-slate-100"
                            >
                              <ChevronRight className={`h-3.5 w-3.5 transition ${isOpen ? 'rotate-90' : ''}`} />
                              {i + 1}
                            </button>
                          ) : (
                            i + 1
                          )}
                        </td>
                        <td className="px-3 py-1.5">
                          <p className="text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.ahspId ? `AHSP ${item.code}` : 'Item manual'}</p>
                        </td>
                        <td className="px-1 py-1.5">
                          <NumberCell
                            key={`v-${item.id}-${item.volume}`}
                            value={item.volume}
                            label={`Volume ${item.name}`}
                            onCommit={(v) => actions.commit(item, { volume: v })}
                          />
                        </td>
                        <td className="px-3 py-1.5 text-slate-600">{item.unit}</td>
                        <td className="px-1 py-1.5 text-right tabular-nums text-slate-700">
                          {item.ahspId ? (
                            <span className="px-2">{rupiah(item.unitPrice)}</span>
                          ) : (
                            <NumberCell
                              key={`p-${item.id}-${item.unitPrice}`}
                              value={item.unitPrice}
                              digits={2}
                              prefix="Rp"
                              label={`Harga satuan ${item.name}`}
                              onCommit={(v) => actions.commit(item, { unitPrice: v })}
                            />
                          )}
                        </td>
                        <td className="px-3 py-1.5 text-right font-medium tabular-nums text-navy-900">{rupiah(item.subtotal)}</td>
                        <td className="px-2 py-1.5 text-right">
                          <ActionMenu items={menuFor(item)} label={`Aksi untuk ${item.name}`} />
                        </td>
                      </tr>
                      {isOpen && breakdown && <BreakdownRow item={item} breakdown={breakdown} onReprice={() => actions.reprice(item)} />}
                    </Fragment>
                  );
                })}
                <tr className="border-b border-slate-200">
                  <td />
                  <td className="px-3 py-1.5">
                    <button type="button" onClick={() => actions.addTo(group.name)} className="inline-flex items-center gap-1.5 rounded px-1 py-1 text-[13px] font-medium text-brand-700 hover:bg-brand-50">
                      <Plus className="h-3.5 w-3.5" /> Tambah pekerjaan
                    </button>
                  </td>
                  <td colSpan={3} className="px-3 py-1.5 text-right text-xs text-slate-500">
                    Jumlah {group.name}
                  </td>
                  <td className="px-3 py-1.5 text-right font-semibold tabular-nums text-navy-900">{rupiah(group.subtotal)}</td>
                  <td />
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── HP ─────────────────────────────────────────────────────── */}
      <div className="divide-y divide-slate-200 md:hidden">
        {visibleGroups.map((group, gi) => (
          <section key={group.name}>
            <header className="flex items-center justify-between gap-3 bg-slate-50 px-4 py-2.5">
              <h3 className="text-[13px] font-semibold uppercase tracking-wide text-navy-900">
                <span className="mr-1.5 text-brand-700">{LETTERS[gi] ?? gi + 1}.</span>
                {group.name}
              </h3>
              <span className="text-sm font-semibold tabular-nums text-navy-900">{rupiah(group.subtotal)}</span>
            </header>
            <ul className="divide-y divide-slate-100">
              {group.items.map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => actions.edit(item)} className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left active:bg-slate-50">
                    <span className="min-w-0">
                      <span className="block text-sm text-slate-900">{item.name}</span>
                      <span className="mt-0.5 block text-xs tabular-nums text-slate-600">
                        {angka(item.volume)} {item.unit} × {rupiah(item.unitPrice)}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-navy-900">{rupiah(item.subtotal)}</span>
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => actions.addTo(group.name)} className="flex w-full items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium text-brand-700">
              <Plus className="h-4 w-4" /> Tambah pekerjaan
            </button>
          </section>
        ))}
      </div>
    </>
  );
}

/** Rincian AHSP satu item (upah/bahan/alat × volume) yang bisa dibuka dari tabel. */
function BreakdownRow({ item, breakdown, onReprice }) {
  const outdated = Math.abs(breakdown.unitPrice - item.unitPrice) >= 0.01;
  return (
    <tr className="border-b border-slate-100 bg-slate-50/70">
      <td />
      <td colSpan={6} className="px-3 pb-3 pt-1">
        <div className="rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-xs">
            <thead className="text-slate-500">
              <tr className="border-b border-slate-100">
                <th className="px-3 py-1.5 text-left font-medium">Komponen per 1 {item.unit}</th>
                <th className="px-3 py-1.5 text-right font-medium">Koefisien</th>
                <th className="px-3 py-1.5 text-right font-medium">Harga</th>
                <th className="px-3 py-1.5 text-right font-medium">Jumlah</th>
                <th className="px-3 py-1.5 text-right font-medium">× volume {angka(item.volume)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {breakdown.lines.map((line) => (
                <tr key={line.code}>
                  <td className="px-3 py-1.5 text-slate-800">
                    <span className="mr-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-slate-600">{RESOURCE_TYPE_LABEL[line.type]}</span>
                    {line.name}
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-slate-700">
                    {angka(line.coefficient, 4)} {line.unit}
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-slate-600">{rupiah(line.unitPrice)}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-slate-700">{rupiah(line.amount)}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-slate-500">
                    {line.type === 'bahan' ? `${angka(line.coefficient * item.volume)} ${line.unit}` : '–'}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="px-3 py-1.5 text-slate-600">Overhead & keuntungan {angka(breakdown.overheadPercent, 2)}%</td>
                <td />
                <td />
                <td className="px-3 py-1.5 text-right tabular-nums text-slate-700">{rupiah(breakdown.overhead)}</td>
                <td />
              </tr>
            </tbody>
          </table>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-3 py-2 text-xs">
            <span className="text-slate-600">
              Harga AHSP terkini <span className="font-semibold tabular-nums text-navy-900">{rupiah(breakdown.unitPrice)}</span>
              {outdated && <span className="ml-1 text-amber-700">(item memakai {rupiah(item.unitPrice)})</span>}
            </span>
            {outdated && (
              <button type="button" onClick={onReprice} className="inline-flex items-center gap-1 font-medium text-brand-700 hover:underline">
                <RefreshCw className="h-3.5 w-3.5" /> Pakai harga terkini
              </button>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}
