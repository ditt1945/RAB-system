'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { calculateRabItemSubtotal } from '@/lib/calculations/rab';
import { rupiah } from '@/lib/format';
import { buttonClass, inputClass } from '@/components/ui';

/**
 * Tambah cepat dari katalog: ketik → pilih (panah + Enter) → isi volume → Enter.
 * Tekan "/" di mana saja (selain saat mengetik) untuk langsung ke kolom cari.
 */
export default function QuickAdd({ catalog, onAdd }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState(null);
  const [volume, setVolume] = useState('');
  const [saving, setSaving] = useState(false);
  const searchRef = useRef(null);
  const volumeRef = useRef(null);
  const boxRef = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalog.slice(0, 8);
    return catalog.filter((a) => `${a.code} ${a.name} ${a.categoryName}`.toLowerCase().includes(q)).slice(0, 8);
  }, [catalog, query]);

  useEffect(() => {
    const onKey = (e) => {
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
      if (e.key === '/' && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    const onClick = (e) => boxRef.current && !boxRef.current.contains(e.target) && setOpen(false);
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  const choose = (ahsp) => {
    setSelected(ahsp);
    setOpen(false);
    setQuery('');
    requestAnimationFrame(() => volumeRef.current?.focus());
  };

  const reset = () => {
    setSelected(null);
    setVolume('');
    requestAnimationFrame(() => searchRef.current?.focus());
  };

  const add = async () => {
    if (!selected || volume.trim() === '' || saving) return;
    setSaving(true);
    const ok = await onAdd({ ahspId: selected.id, volume: volume.replace(',', '.') });
    setSaving(false);
    if (ok) reset();
  };

  if (selected) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-brand-300 bg-brand-50 px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-900">{selected.name}</p>
          <p className="text-xs text-slate-600">
            {selected.code} · {rupiah(selected.unitPrice)}/{selected.unit}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-32">
            <input
              ref={volumeRef}
              inputMode="decimal"
              aria-label={`Volume (${selected.unit})`}
              placeholder="Volume"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') add();
                if (e.key === 'Escape') reset();
              }}
              className={`${inputClass} pr-10 text-right tabular-nums`}
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-500">{selected.unit}</span>
          </div>
          <span className="hidden w-32 text-right text-sm font-medium tabular-nums text-navy-900 sm:block">
            {volume ? rupiah(calculateRabItemSubtotal(volume.replace(',', '.'), selected.unitPrice)) : '–'}
          </span>
          <button type="button" onClick={add} disabled={saving || !volume.trim()} className={buttonClass.primary}>
            <Plus className="h-4 w-4" /> {saving ? 'Menambah…' : 'Tambah'}
          </button>
          <button type="button" onClick={reset} className={buttonClass.ghost} aria-label="Batal">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={boxRef}>
      <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
      <input
        ref={searchRef}
        role="combobox"
        aria-expanded={open}
        aria-controls="quick-add-list"
        aria-label="Cari pekerjaan AHSP untuk ditambahkan"
        placeholder="Tambah pekerjaan: ketik nama atau kode AHSP…"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((i) => Math.min(i + 1, results.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          } else if (e.key === 'Enter' && results[active]) {
            e.preventDefault();
            choose(results[active]);
          } else if (e.key === 'Escape') {
            setOpen(false);
            e.currentTarget.blur();
          }
        }}
        className={`${inputClass} pl-9 pr-10`}
      />
      <kbd className="pointer-events-none absolute right-3 top-2 hidden rounded border border-slate-300 px-1.5 text-xs text-slate-500 sm:block">/</kbd>
      {open && (
        <ul id="quick-add-list" role="listbox" className="absolute inset-x-0 top-full z-30 mt-1 max-h-80 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {results.length === 0 && <li className="px-3 py-3 text-sm text-slate-500">Tidak ada AHSP yang cocok. Pakai “Item manual” untuk pekerjaan di luar katalog.</li>}
          {results.map((a, i) => (
            <li key={a.id} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(a)}
                className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm ${i === active ? 'bg-brand-50' : ''}`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-slate-900">{a.name}</span>
                  <span className="text-xs text-slate-500">
                    {a.code} · {a.categoryName}
                  </span>
                </span>
                <span className="whitespace-nowrap text-xs font-medium tabular-nums text-slate-700">
                  {rupiah(a.unitPrice)}/{a.unit}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
