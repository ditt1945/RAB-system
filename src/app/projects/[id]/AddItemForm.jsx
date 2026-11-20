'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '@/lib/client';
import { calculateRabItemSubtotal } from '@/lib/calculations/rab';
import { rupiah } from '@/lib/format';
import { Alert, buttonClass, Field, inputClass } from '@/components/ui';

const EMPTY_MANUAL = { name: '', unit: '', unitPrice: '', volume: '', groupName: '' };

export default function AddItemForm({ projectId, catalog, groupNames, onAdded }) {
  const [mode, setMode] = useState(catalog.length > 0 ? 'ahsp' : 'manual');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [volume, setVolume] = useState('');
  const [groupName, setGroupName] = useState('');
  const [manual, setManual] = useState(EMPTY_MANUAL);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter((a) => `${a.code} ${a.name} ${a.categoryName}`.toLowerCase().includes(q));
  }, [catalog, query]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setErrors({});
    if (mode === 'ahsp' && !selected) return setError('Pilih pekerjaan dari katalog AHSP terlebih dahulu');

    setSaving(true);
    const body = mode === 'ahsp' ? { ahspId: selected.id, volume, groupName } : manual;
    const res = await api(`/api/projects/${projectId}/items`, { method: 'POST', body });
    setSaving(false);
    if (!res.ok) {
      setError(res.error);
      setErrors(res.fields);
      return;
    }
    setSelected(null);
    setVolume('');
    setGroupName('');
    setManual(EMPTY_MANUAL);
    onAdded(res.data.message);
  };

  const tab = (value, label) => (
    <button
      type="button"
      onClick={() => setMode(value)}
      className={`rounded-md px-3 py-1.5 text-sm ${mode === value ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
      aria-pressed={mode === value}
    >
      {label}
    </button>
  );

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border border-slate-700 bg-slate-950/50 p-4" noValidate>
      <div className="inline-flex rounded-lg border border-slate-700 p-0.5">
        {tab('ahsp', 'Dari katalog AHSP')}
        {tab('manual', 'Item manual')}
      </div>
      <Alert>{error}</Alert>

      {mode === 'ahsp' ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_16rem]">
          <div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                className={`${inputClass} pl-9`}
                placeholder="Cari kode atau nama pekerjaan… (mis. galian, bata, beton)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Cari AHSP"
              />
            </div>
            <ul className="mt-2 max-h-64 divide-y divide-slate-800 overflow-y-auto rounded-lg border border-slate-800" role="listbox" aria-label="Katalog AHSP">
              {filtered.length === 0 && <li className="px-3 py-4 text-center text-xs text-slate-500">Tidak ada AHSP yang cocok</li>}
              {filtered.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected?.id === a.id}
                    onClick={() => setSelected(a)}
                    className={`flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm ${
                      selected?.id === a.id ? 'bg-cyan-500/15' : 'hover:bg-slate-800/60'
                    }`}
                  >
                    <span>
                      <span className="block text-slate-100">{a.name}</span>
                      <span className="text-[11px] text-slate-500">
                        {a.code} · {a.categoryName}
                      </span>
                    </span>
                    <span className="whitespace-nowrap text-xs tabular-nums text-slate-300">
                      {rupiah(a.unitPrice)}/{a.unit}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-slate-800 p-3 text-xs">
              {selected ? (
                <>
                  <p className="font-medium text-slate-100">{selected.name}</p>
                  <p className="mt-1 text-slate-400">
                    HSP {rupiah(selected.unitPrice)} / {selected.unit}
                  </p>
                </>
              ) : (
                <p className="text-slate-500">Belum ada pekerjaan dipilih</p>
              )}
            </div>
            <Field label={`Volume${selected ? ` (${selected.unit})` : ''}`} required error={errors.volume}>
              <input type="number" min={0} step="any" className={inputClass} value={volume} onChange={(e) => setVolume(e.target.value)} />
            </Field>
            <Field label="Kelompok" hint={selected ? `Kosongkan = ${selected.categoryName}` : 'Default: kategori AHSP'}>
              <input className={inputClass} value={groupName} onChange={(e) => setGroupName(e.target.value)} list="rab-groups" />
            </Field>
            {selected && volume !== '' && (
              <p className="text-xs text-slate-400">
                Perkiraan jumlah: <span className="font-semibold text-white">{rupiah(calculateRabItemSubtotal(volume, selected.unitPrice))}</span>
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="Uraian pekerjaan" required error={errors.name} className="sm:col-span-2">
            <input className={inputClass} value={manual.name} onChange={(e) => setManual({ ...manual, name: e.target.value })} placeholder="Mobilisasi alat" />
          </Field>
          <Field label="Satuan" required error={errors.unit}>
            <input className={inputClass} value={manual.unit} onChange={(e) => setManual({ ...manual, unit: e.target.value })} placeholder="ls, m2, unit" />
          </Field>
          <Field label="Harga satuan (Rp)" required error={errors.unitPrice}>
            <input type="number" min={0} className={inputClass} value={manual.unitPrice} onChange={(e) => setManual({ ...manual, unitPrice: e.target.value })} />
          </Field>
          <Field label="Volume" required error={errors.volume}>
            <input type="number" min={0} step="any" className={inputClass} value={manual.volume} onChange={(e) => setManual({ ...manual, volume: e.target.value })} />
          </Field>
          <Field label="Kelompok" hint="Kosongkan = Lain-lain" className="sm:col-span-2">
            <input className={inputClass} value={manual.groupName} onChange={(e) => setManual({ ...manual, groupName: e.target.value })} list="rab-groups" />
          </Field>
        </div>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className={buttonClass.primary}>
          {saving ? 'Menyimpan…' : 'Tambahkan ke RAB'}
        </button>
      </div>
    </form>
  );
}
