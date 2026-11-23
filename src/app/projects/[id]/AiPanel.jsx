'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { api } from '@/lib/client';
import { rupiah } from '@/lib/format';
import { calculateRabItemSubtotal } from '@/lib/calculations/rab';
import { Alert, buttonClass, Card, inputClass } from '@/components/ui';

/**
 * @param {{ projectId: string, hasCatalog: boolean, defaultPrompt?: string, existingAhspIds?: string[], featured?: boolean }} props
 * defaultPrompt = keterangan proyek, supaya user tidak mengetik ulang.
 * existingAhspIds = AHSP yang sudah ada di RAB, supaya saran yang sama tidak dobel.
 * featured = RAB masih kosong, panel ini ditonjolkan sebagai cara tercepat untuk mulai.
 */
export default function AiPanel({ projectId, hasCatalog, defaultPrompt = '', existingAhspIds = [], featured = false }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [result, setResult] = useState(null); // { requestId, items, outOfCatalog, notes }
  const [choices, setChoices] = useState({}); // ahspId → { checked, volume }
  const existing = new Set(existingAhspIds);
  const inRab = (s) => existing.has(String(s.ahspId));

  const ask = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const res = await api(`/api/projects/${projectId}/ai/recommend`, { method: 'POST', body: { prompt } });
    setLoading(false);
    if (!res.ok) return setError(res.fields.prompt?.[0] ?? res.error);

    const { id, suggestions } = res.data.data;
    setResult({ requestId: id, ...suggestions });
    // Saran yang pekerjaannya sudah ada di RAB tidak dicentang supaya tidak dobel
    setChoices(Object.fromEntries(suggestions.items.map((s) => [s.ahspId, { checked: !inRab(s), volume: s.volume }])));
  };

  const accept = async () => {
    const items = result.items.filter((s) => choices[s.ahspId]?.checked).map((s) => ({ ahspId: s.ahspId, volume: choices[s.ahspId].volume }));
    if (items.length === 0) return setError('Centang minimal satu saran');
    setLoading(true);
    setError(null);
    const res = await api(`/api/projects/${projectId}/ai/accept`, { method: 'POST', body: { requestId: result.requestId, items } });
    setLoading(false);
    if (!res.ok) return setError(res.error);
    setResult(null);
    setMessage(res.data.message);
    startTransition(() => router.refresh());
  };

  const setChoice = (ahspId, patch) => setChoices((c) => ({ ...c, [ahspId]: { ...c[ahspId], ...patch } }));
  const setAll = (checked) => setChoices((c) => Object.fromEntries(Object.entries(c).map(([k, v]) => [k, { ...v, checked }])));

  const picked = result ? result.items.filter((s) => choices[s.ahspId]?.checked) : [];
  const pickedTotal = picked.reduce((sum, s) => sum + calculateRabItemSubtotal(choices[s.ahspId].volume || 0, s.unitPrice), 0);

  return (
    <Card
      className={featured ? 'border-cyan-500/40' : ''}
      title={
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyan-300" /> Rekomendasi AI
          {featured && <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[11px] font-medium text-cyan-200">Cara tercepat untuk mulai</span>}
        </span>
      }
      description="Ceritakan pekerjaannya. AI memilih pekerjaan dari katalog AHSP dan memperkirakan volumenya. Harga tetap dihitung dari AHSP."
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
            disabled={!hasCatalog || loading}
            aria-label="Deskripsi kebutuhan proyek"
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              {defaultPrompt && prompt === defaultPrompt
                ? 'Diisi dari keterangan proyek. Tambahkan ukuran dan spesifikasi supaya volumenya lebih tepat.'
                : 'Sebutkan ukuran dan spesifikasi supaya volumenya lebih tepat.'}
            </p>
            <button type="submit" disabled={!hasCatalog || loading || prompt.trim().length < 8} className={`${buttonClass.primary} shrink-0`}>
              {loading && !result ? 'Meminta saran…' : result ? 'Minta ulang' : 'Minta saran'}
            </button>
          </div>
        </form>

        <Alert>{error}</Alert>
        {message && <Alert type="success">{message}</Alert>}

        {result && (
          <div className="space-y-3 rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4">
            {result.notes && <p className="text-sm text-slate-300">{result.notes}</p>}

            {result.items.length === 0 ? (
              <p className="text-sm text-slate-400">AI tidak menemukan pekerjaan yang cocok di katalog.</p>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
                  <span>Periksa dan sesuaikan volumenya, lalu centang yang ingin dimasukkan.</span>
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
              </>
            )}

            {result.outOfCatalog?.length > 0 && (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-100">
                <p className="mb-1 font-medium">Belum ada di katalog AHSP. Tambahkan lewat “Item manual” bila perlu:</p>
                <ul className="list-disc space-y-0.5 pl-4">
                  {result.outOfCatalog.map((o, i) => (
                    <li key={i}>
                      {o.name}
                      {o.unit ? ` (${o.unit})` : ''}
                      {o.note ? ` — ${o.note}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-300">
                {picked.length} dipilih · <span className="font-semibold tabular-nums text-white">{rupiah(pickedTotal)}</span>
              </p>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setResult(null)} className={buttonClass.secondary}>
                  Abaikan
                </button>
                {result.items.length > 0 && (
                  <button type="button" onClick={accept} disabled={loading || picked.length === 0} className={buttonClass.primary}>
                    {loading ? 'Menambahkan…' : `Tambahkan ${picked.length} item ke RAB`}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
