'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { History, Loader2, Package, Sparkles } from 'lucide-react';
import { api } from '@/lib/client';
import { angka, rupiah, tanggal } from '@/lib/format';
import { calculateMaterialNeeds, calculateRabItemSubtotal } from '@/lib/calculations/rab';
import { Alert, buttonClass, Card, inputClass } from '@/components/ui';

const MIN_PROMPT = 8;
const HISTORY_STATUS = { completed: 'Selesai', failed: 'Gagal', processing: 'Diproses' };

/**
 * Rekomendasi AI: pekerjaan dari katalog AHSP + perkiraan volume, dan kebutuhan material dari AHSP tersebut.
 * @param {{ projectId: string, hasCatalog: boolean, defaultPrompt?: string, existingAhspIds?: string[], featured?: boolean, history?: any[] }} props
 * defaultPrompt = keterangan proyek, supaya user tidak mengetik ulang.
 * existingAhspIds = AHSP yang sudah ada di RAB, supaya saran yang sama tidak dobel.
 * featured = RAB masih kosong, panel ini ditonjolkan sebagai cara tercepat untuk mulai.
 */
export default function AiPanel({ projectId, hasCatalog, defaultPrompt = '', existingAhspIds = [], featured = false, history = [] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [asking, setAsking] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [result, setResult] = useState(null); // { requestId, items, outOfCatalog, notes }
  const [choices, setChoices] = useState({}); // ahspId → { checked, volume }
  const existing = new Set(existingAhspIds);
  const inRab = (s) => existing.has(String(s.ahspId));
  const promptTooShort = prompt.trim().length < MIN_PROMPT;

  const ask = async (e) => {
    e.preventDefault();
    if (promptTooShort) return setError(`Deskripsi minimal ${MIN_PROMPT} karakter`);
    setAsking(true);
    setError(null);
    setMessage(null);
    const res = await api(`/api/projects/${projectId}/ai/recommend`, { method: 'POST', body: { prompt } });
    setAsking(false);
    if (!res.ok) return setError(res.fields.prompt?.[0] ?? res.error);

    const { id, suggestions } = res.data.data;
    setResult({ requestId: id, ...suggestions });
    // Saran yang pekerjaannya sudah ada di RAB tidak dicentang supaya tidak dobel
    setChoices(Object.fromEntries(suggestions.items.map((s) => [s.ahspId, { checked: !inRab(s), volume: s.volume }])));
    startTransition(() => router.refresh()); // perbarui riwayat
  };

  const accept = async () => {
    const items = result.items.filter((s) => choices[s.ahspId]?.checked).map((s) => ({ ahspId: s.ahspId, volume: choices[s.ahspId].volume }));
    if (items.length === 0) return setError('Centang minimal satu saran');
    setAccepting(true);
    setError(null);
    const res = await api(`/api/projects/${projectId}/ai/accept`, { method: 'POST', body: { requestId: result.requestId, items } });
    setAccepting(false);
    if (!res.ok) return setError(Object.values(res.fields)[0]?.[0] ?? res.error);
    setResult(null);
    setMessage(res.data.message);
    startTransition(() => router.refresh());
  };

  const dismiss = () => {
    setResult(null);
    setError(null);
  };

  const setChoice = (ahspId, patch) => setChoices((c) => ({ ...c, [ahspId]: { ...c[ahspId], ...patch } }));
  const setAll = (checked) => setChoices((c) => Object.fromEntries(Object.entries(c).map(([k, v]) => [k, { ...v, checked }])));

  const picked = result ? result.items.filter((s) => choices[s.ahspId]?.checked) : [];
  const pickedTotal = picked.reduce((sum, s) => sum + calculateRabItemSubtotal(choices[s.ahspId].volume || 0, s.unitPrice), 0);

  // Kebutuhan material dari saran yang dicentang: koefisien bahan × volume (berubah saat volume diedit)
  const materials = calculateMaterialNeeds(
    picked.map((s) => ({
      volume: choices[s.ahspId]?.volume || 0,
      components: (s.materials ?? []).map((m) => ({
        coefficient: m.coefficient,
        resource: { id: m.resourceId, code: m.code, name: m.name, unit: m.unit, unitPrice: m.unitPrice, type: 'bahan' },
      })),
    })),
  );

  return (
    <Card
      className={featured ? 'border-cyan-500/40' : ''}
      title={
        <span className="flex flex-wrap items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyan-300" /> Rekomendasi AI: pekerjaan & material
          {featured && <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[11px] font-medium text-cyan-200">Cara tercepat untuk mulai</span>}
        </span>
      }
      description="Ceritakan pekerjaannya. AI memilih pekerjaan dari katalog AHSP dan memperkirakan volumenya, lalu sistem menghitung kebutuhan materialnya. Harga tetap dari AHSP."
    >
      <div className="space-y-4">
        {!hasCatalog && <Alert type="warning">Katalog AHSP masih kosong, jadi AI belum bisa memberi saran. Minta admin mengisi Master AHSP.</Alert>}

        <form onSubmit={ask} className="space-y-3">
          <textarea
            rows={3}
            className={inputClass}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Contoh: rumah tipe 36 satu lantai 6x6 m, pondasi batu kali, dinding bata merah diplester dan dicat, lantai keramik 40x40"
            disabled={!hasCatalog || asking}
            aria-label="Deskripsi kebutuhan proyek"
            maxLength={2000}
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              {promptTooShort
                ? `Tulis minimal ${MIN_PROMPT} karakter. Sebutkan ukuran dan spesifikasi supaya volumenya lebih tepat.`
                : defaultPrompt && prompt === defaultPrompt
                  ? 'Diisi dari keterangan proyek. Tambahkan ukuran dan spesifikasi supaya volumenya lebih tepat.'
                  : 'Sebutkan ukuran dan spesifikasi supaya volumenya lebih tepat.'}
            </p>
            <button type="submit" disabled={!hasCatalog || asking || promptTooShort} className={`${buttonClass.primary} shrink-0`}>
              {asking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Meminta saran…
                </>
              ) : result ? (
                'Minta ulang'
              ) : (
                'Minta saran'
              )}
            </button>
          </div>
        </form>

        <Alert>{error}</Alert>
        {message && <Alert type="success">{message}</Alert>}

        {result && (
          <div className="space-y-4 rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4">
            {result.notes && <p className="text-sm text-slate-300">{result.notes}</p>}

            {result.items.length === 0 ? (
              <p className="text-sm text-slate-400">AI tidak menemukan pekerjaan yang cocok di katalog.</p>
            ) : (
              <div>
                <div className="flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-medium text-slate-200">Saran pekerjaan</span>
                  <span className="flex shrink-0 gap-3">
                    <button type="button" onClick={() => setAll(true)} className="text-cyan-300 hover:text-cyan-200">
                      Pilih semua
                    </button>
                    <button type="button" onClick={() => setAll(false)} className="hover:text-white">
                      Kosongkan
                    </button>
                  </span>
                </div>
                <ul className="divide-y divide-slate-800">
                  {result.items.map((s) => {
                    const choice = choices[s.ahspId] ?? {};
                    return (
                      <li key={s.ahspId} className={`flex flex-col gap-2 py-3 sm:flex-row sm:items-start ${choice.checked ? '' : 'opacity-60'}`}>
                        <label className="flex flex-1 gap-3">
                          <input type="checkbox" checked={!!choice.checked} onChange={(e) => setChoice(s.ahspId, { checked: e.target.checked })} className="mt-1 accent-cyan-500" />
                          <span>
                            <span className="block text-sm text-slate-100">
                              {s.name}
                              {inRab(s) && (
                                <span className="ml-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-200">
                                  Sudah ada di RAB
                                </span>
                              )}
                            </span>
                            <span className="block text-[11px] text-slate-500">
                              {s.code} · {s.categoryName} · {rupiah(s.unitPrice)}/{s.unit}
                            </span>
                            {s.reason && <span className="mt-1 block text-xs text-slate-400">{s.reason}</span>}
                          </span>
                        </label>
                        <div className="flex items-center gap-2 pl-7 sm:pl-0">
                          <input
                            type="number"
                            min={0}
                            step="any"
                            value={choice.volume ?? ''}
                            onChange={(e) => setChoice(s.ahspId, { volume: e.target.value })}
                            className={`${inputClass} w-24 text-right`}
                            aria-label={`Volume ${s.name}`}
                          />
                          <span className="w-10 text-xs text-slate-400">{s.unit}</span>
                          <span className="w-32 text-right text-xs tabular-nums text-slate-300">{rupiah(calculateRabItemSubtotal(choice.volume || 0, s.unitPrice))}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {materials.items.length > 0 && (
              <div className="rounded-md border border-slate-700 bg-slate-950/40 p-3">
                <p className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-200">
                  <Package className="h-3.5 w-3.5 text-cyan-300" /> Perkiraan kebutuhan material (dari saran yang dicentang)
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[420px] text-xs">
                    <tbody className="divide-y divide-slate-800">
                      {materials.items.map((m) => (
                        <tr key={m.resourceId}>
                          <td className="py-1.5 pr-3 text-slate-200">{m.name}</td>
                          <td className="whitespace-nowrap py-1.5 pr-3 text-right tabular-nums text-slate-300">
                            {angka(m.quantity)} {m.unit}
                          </td>
                          <td className="whitespace-nowrap py-1.5 text-right tabular-nums text-slate-400">{rupiah(m.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-right text-xs text-slate-400">
                  Total bahan ± <span className="font-semibold tabular-nums text-white">{rupiah(materials.total)}</span> (sudah termasuk di harga pekerjaan)
                </p>
              </div>
            )}

            {result.outOfCatalog?.length > 0 && (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-100">
                <p className="mb-1 font-medium">Pekerjaan / material yang belum ada di katalog AHSP. Tambahkan lewat “Item manual” bila perlu:</p>
                <ul className="list-disc space-y-0.5 pl-4">
                  {result.outOfCatalog.map((o, i) => (
                    <li key={i}>
                      {o.name}
                      {o.unit ? ` (${o.unit})` : ''}
                      {o.note ? `: ${o.note}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-300">
                {picked.length} pekerjaan dipilih · <span className="font-semibold tabular-nums text-white">{rupiah(pickedTotal)}</span>
              </p>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={dismiss} disabled={accepting} className={buttonClass.secondary}>
                  Abaikan
                </button>
                {result.items.length > 0 && (
                  <button type="button" onClick={accept} disabled={accepting || picked.length === 0} className={buttonClass.primary}>
                    {accepting ? 'Menambahkan…' : `Tambahkan ${picked.length} item ke RAB`}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <details className="group rounded-lg border border-slate-800">
            <summary className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-white">
              <History className="h-3.5 w-3.5" /> Riwayat permintaan AI ({history.length})
            </summary>
            <ul className="divide-y divide-slate-800 border-t border-slate-800">
              {history.map((h) => (
                <li key={h.id} className="flex flex-col gap-1 px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between">
                  <span className="min-w-0">
                    <span className="block truncate text-slate-200">{h.prompt}</span>
                    <span className="text-slate-500">
                      {tanggal(h.createdAt)} · {HISTORY_STATUS[h.status] ?? h.status}
                      {h.acceptedAt ? ' · dimasukkan ke RAB' : ''}
                    </span>
                  </span>
                  <button type="button" onClick={() => setPrompt(h.prompt)} className="shrink-0 text-left text-cyan-300 hover:text-cyan-200 sm:text-right">
                    Pakai lagi
                  </button>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </Card>
  );
}
