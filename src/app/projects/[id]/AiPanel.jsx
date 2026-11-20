'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { api } from '@/lib/client';
import { rupiah } from '@/lib/format';
import { calculateRabItemSubtotal } from '@/lib/calculations/rab';
import { Alert, buttonClass, Card, inputClass } from '@/components/ui';

export default function AiPanel({ projectId, hasCatalog }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [result, setResult] = useState(null); // { requestId, items, outOfCatalog, notes }
  const [choices, setChoices] = useState({}); // ahspId → { checked, volume }

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
    setChoices(Object.fromEntries(suggestions.items.map((s) => [s.ahspId, { checked: true, volume: s.volume }])));
  };

  const accept = async () => {
    const items = result.items.filter((s) => choices[s.ahspId]?.checked).map((s) => ({ ahspId: s.ahspId, volume: choices[s.ahspId].volume }));
    if (items.length === 0) return setError('Centang minimal satu saran');
    setLoading(true);
    const res = await api(`/api/projects/${projectId}/ai/accept`, { method: 'POST', body: { requestId: result.requestId, items } });
    setLoading(false);
    if (!res.ok) return setError(res.error);
    setResult(null);
    setPrompt('');
    setMessage(res.data.message);
    startTransition(() => router.refresh());
  };

  const setChoice = (ahspId, patch) => setChoices((c) => ({ ...c, [ahspId]: { ...c[ahspId], ...patch } }));

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyan-300" /> Rekomendasi AI
        </span>
      }
      description="AI memilih pekerjaan dari katalog AHSP dan memperkirakan volumenya. Harga tetap dihitung dari AHSP."
    >
      <div className="space-y-4">
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
            <p className="text-xs text-slate-500">Periksa kembali volume sebelum dimasukkan ke RAB.</p>
            <button type="submit" disabled={!hasCatalog || loading || prompt.trim().length < 8} className={buttonClass.primary}>
              {loading && !result ? 'Meminta saran…' : 'Minta saran'}
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
              <ul className="divide-y divide-slate-800">
                {result.items.map((s) => {
                  const choice = choices[s.ahspId] ?? {};
                  return (
                    <li key={s.ahspId} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start">
                      <label className="flex flex-1 gap-3">
                        <input type="checkbox" checked={!!choice.checked} onChange={(e) => setChoice(s.ahspId, { checked: e.target.checked })} className="mt-1 accent-cyan-500" />
                        <span>
                          <span className="block text-sm text-slate-100">{s.name}</span>
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
            )}

            {result.outOfCatalog?.length > 0 && (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-100">
                <p className="mb-1 font-medium">Di luar katalog AHSP (tambahkan manual bila perlu):</p>
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

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setResult(null)} className={buttonClass.secondary}>
                Abaikan
              </button>
              {result.items.length > 0 && (
                <button type="button" onClick={accept} disabled={loading} className={buttonClass.primary}>
                  {loading ? 'Menambahkan…' : 'Tambahkan yang dicentang'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
