'use client';

import { useState } from 'react';
import { History, Loader2, Package, Sparkles } from 'lucide-react';
import { api } from '@/lib/client';
import { angka, rupiah, tanggal } from '@/lib/format';
import { calculateMaterialNeeds, calculateRabItemSubtotal } from '@/lib/calculations/rab';
import { Alert, buttonClass, inputClass } from '@/components/ui';
import { Sheet } from '@/components/overlay';

const MIN_PROMPT = 8;
const HISTORY_STATUS = { completed: 'Selesai', failed: 'Gagal', processing: 'Diproses' };
const EXAMPLES = [
  'Rumah tipe 36 satu lantai 6×6 m, pondasi batu kali, dinding bata merah diplester dan dicat, lantai keramik 40×40',
  'Renovasi kamar mandi 2×2 m: bongkar keramik lama, pasang keramik dinding dan lantai baru',
  'Pagar depan rumah panjang 10 m tinggi 1,5 m dari bata merah diplester dan dicat',
];

/**
 * Panel samping rekomendasi AI: pekerjaan dari katalog AHSP + perkiraan volume,
 * lalu kebutuhan material dihitung dari koefisien bahan AHSP × volume.
 */
export default function AiSheet({ open, onClose, projectId, hasCatalog, projectDescription, existingAhspIds, history, onAccepted }) {
  const [prompt, setPrompt] = useState('');
  const [asking, setAsking] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // { requestId, items, outOfCatalog, notes }
  const [choices, setChoices] = useState({}); // ahspId → { checked, volume }
  const existing = new Set(existingAhspIds);
  const inRab = (s) => existing.has(String(s.ahspId));
  const promptTooShort = prompt.trim().length < MIN_PROMPT;

  const ask = async (e) => {
    e?.preventDefault();
    if (promptTooShort) return setError(`Deskripsi minimal ${MIN_PROMPT} karakter`);
    setAsking(true);
    setError(null);
    const res = await api(`/api/projects/${projectId}/ai/recommend`, { method: 'POST', body: { prompt } });
    setAsking(false);
    if (!res.ok) return setError(res.fields.prompt?.[0] ?? res.error);
    const { id, suggestions } = res.data.data;
    setResult({ requestId: id, ...suggestions });
    // Saran yang pekerjaannya sudah ada di RAB tidak dicentang supaya tidak dobel
    setChoices(Object.fromEntries(suggestions.items.map((s) => [s.ahspId, { checked: !inRab(s), volume: s.volume }])));
  };

  const picked = result ? result.items.filter((s) => choices[s.ahspId]?.checked) : [];
  const pickedTotal = picked.reduce((sum, s) => sum + calculateRabItemSubtotal(String(choices[s.ahspId].volume || 0).replace(',', '.'), s.unitPrice), 0);
  const materials = calculateMaterialNeeds(
    picked.map((s) => ({
      volume: String(choices[s.ahspId]?.volume || 0).replace(',', '.'),
      components: (s.materials ?? []).map((m) => ({
        coefficient: m.coefficient,
        resource: { id: m.resourceId, code: m.code, name: m.name, unit: m.unit, unitPrice: m.unitPrice, type: 'bahan' },
      })),
    })),
  );

  const accept = async () => {
    const items = picked.map((s) => ({ ahspId: s.ahspId, volume: String(choices[s.ahspId].volume).replace(',', '.') }));
    if (items.length === 0) return setError('Centang minimal satu saran');
    setAccepting(true);
    setError(null);
    const res = await api(`/api/projects/${projectId}/ai/accept`, { method: 'POST', body: { requestId: result.requestId, items } });
    setAccepting(false);
    if (!res.ok) return setError(Object.values(res.fields)[0]?.[0] ?? res.error);
    setResult(null);
    setPrompt('');
    onAccepted(res.data.message);
  };

  const setChoice = (ahspId, patch) => setChoices((c) => ({ ...c, [ahspId]: { ...c[ahspId], ...patch } }));
  const setAll = (checked) => setChoices((c) => Object.fromEntries(Object.entries(c).map(([k, v]) => [k, { ...v, checked }])));

  const footer = result?.items.length ? (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-700">
        {picked.length} pekerjaan · <span className="font-semibold tabular-nums text-navy-900">+{rupiah(pickedTotal)}</span>
      </p>
      <div className="flex gap-2">
        <button type="button" onClick={() => setResult(null)} disabled={accepting} className={buttonClass.secondary}>
          Buang saran
        </button>
        <button type="button" onClick={accept} disabled={accepting || picked.length === 0} className={buttonClass.primary}>
          {accepting ? 'Menambahkan…' : `Tambahkan ${picked.length} ke RAB`}
        </button>
      </div>
    </div>
  ) : null;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      size="lg"
      title={
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-600" /> Saran AI: pekerjaan & material
        </span>
      }
      description="AI memilih pekerjaan dari katalog AHSP dan memperkirakan volume. Harga tetap dihitung dari AHSP; periksa volumenya sebelum dimasukkan."
      footer={footer}
    >
      <div className="space-y-5">
        {!hasCatalog && <Alert type="warning">Katalog AHSP masih kosong, jadi AI belum bisa memberi saran. Minta admin mengisi Master AHSP.</Alert>}

        <form onSubmit={ask} className="space-y-3">
          <label className="block text-[13px] font-medium text-slate-700" htmlFor="ai-prompt">
            Ceritakan pekerjaannya: jenis bangunan, ukuran, dan bahan
          </label>
          <textarea
            id="ai-prompt"
            rows={4}
            className={inputClass}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Contoh: rumah tipe 36 satu lantai 6×6 m, pondasi batu kali, dinding bata merah…"
            disabled={!hasCatalog || asking}
            maxLength={2000}
          />
          {!result && (
            <div className="flex flex-wrap gap-2">
              {projectDescription && (
                <button type="button" onClick={() => setPrompt(projectDescription)} className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs text-brand-800 hover:bg-brand-100">
                  Pakai keterangan proyek
                </button>
              )}
              {EXAMPLES.map((example) => (
                <button key={example} type="button" onClick={() => setPrompt(example)} className="max-w-full truncate rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 hover:bg-slate-50" title={example}>
                  {example.length > 48 ? `${example.slice(0, 48)}…` : example}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">{promptTooShort ? `Minimal ${MIN_PROMPT} karakter.` : 'Biasanya 5–20 detik.'}</p>
            <button type="submit" disabled={!hasCatalog || asking || promptTooShort} className={`${result ? buttonClass.secondary : buttonClass.primary} shrink-0`}>
              {asking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Meminta saran…
                </>
              ) : result ? (
                'Minta ulang'
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Minta saran
                </>
              )}
            </button>
          </div>
        </form>

        <Alert>{error}</Alert>

        {result && (
          <div className="space-y-4">
            {result.notes && <p className="rounded-lg bg-navy-50 px-3 py-2 text-sm text-navy-800">{result.notes}</p>}

            {result.items.length === 0 ? (
              <p className="text-sm text-slate-600">AI tidak menemukan pekerjaan yang cocok di katalog.</p>
            ) : (
              <section>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <h3 className="text-sm font-semibold text-navy-900">Saran pekerjaan ({result.items.length})</h3>
                  <span className="flex gap-3">
                    <button type="button" onClick={() => setAll(true)} className="font-medium text-brand-700 hover:underline">
                      Pilih semua
                    </button>
                    <button type="button" onClick={() => setAll(false)} className="text-slate-600 hover:underline">
                      Kosongkan
                    </button>
                  </span>
                </div>
                <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {result.items.map((s) => {
                    const choice = choices[s.ahspId] ?? {};
                    return (
                      <li key={s.ahspId} className={`flex flex-col gap-2 p-3 sm:flex-row sm:items-start ${choice.checked ? '' : 'bg-slate-50 opacity-70'}`}>
                        <label className="flex flex-1 gap-3">
                          <input type="checkbox" checked={!!choice.checked} onChange={(e) => setChoice(s.ahspId, { checked: e.target.checked })} className="mt-1 h-4 w-4 accent-brand-600" />
                          <span className="min-w-0">
                            <span className="block text-sm text-slate-900">
                              {s.name}
                              {inRab(s) && <span className="ml-2 rounded-full bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-800">Sudah ada di RAB</span>}
                            </span>
                            <span className="block text-xs text-slate-500">
                              {s.code} · {rupiah(s.unitPrice)}/{s.unit}
                            </span>
                            {s.reason && <span className="mt-1 block text-xs text-slate-600">Asumsi AI: {s.reason}</span>}
                          </span>
                        </label>
                        <div className="flex items-center gap-2 pl-7 sm:pl-0">
                          <div className="relative w-28">
                            <input
                              inputMode="decimal"
                              value={choice.volume ?? ''}
                              onChange={(e) => setChoice(s.ahspId, { volume: e.target.value })}
                              className={`${inputClass} py-1.5 pr-9 text-right tabular-nums`}
                              aria-label={`Volume ${s.name}`}
                            />
                            <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-slate-500">{s.unit}</span>
                          </div>
                          <span className="w-28 text-right text-sm tabular-nums text-slate-800">
                            {rupiah(calculateRabItemSubtotal(String(choice.volume || 0).replace(',', '.'), s.unitPrice))}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {materials.items.length > 0 && (
              <section>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-navy-900">
                  <Package className="h-4 w-4 text-brand-600" /> Perkiraan kebutuhan material
                </h3>
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-slate-100">
                      {materials.items.map((m) => (
                        <tr key={m.resourceId}>
                          <td className="px-3 py-2 text-slate-800">{m.name}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-slate-700">
                            {angka(m.quantity)} {m.unit}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-slate-500">{rupiah(m.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-1.5 text-xs text-slate-500">Dari saran yang dicentang. Biaya bahan sudah termasuk di harga pekerjaan.</p>
              </section>
            )}

            {result.outOfCatalog?.length > 0 && (
              <section className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <p className="mb-1 font-medium">Belum ada di katalog AHSP (tambahkan sebagai item manual bila perlu):</p>
                <ul className="list-disc space-y-0.5 pl-5">
                  {result.outOfCatalog.map((o, i) => (
                    <li key={i}>
                      {o.name}
                      {o.unit ? ` (${o.unit})` : ''}
                      {o.note ? `: ${o.note}` : ''}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        {!result && history.length > 0 && (
          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-navy-900">
              <History className="h-4 w-4 text-slate-500" /> Permintaan sebelumnya
            </h3>
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {history.map((h) => (
                <li key={h.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate text-slate-800">{h.prompt}</span>
                    <span className="text-xs text-slate-500">
                      {tanggal(h.createdAt)} · {HISTORY_STATUS[h.status] ?? h.status}
                      {h.acceptedAt ? ' · dimasukkan ke RAB' : ''}
                    </span>
                  </span>
                  <button type="button" onClick={() => setPrompt(h.prompt)} className={buttonClass.link}>
                    Pakai lagi
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Sheet>
  );
}
