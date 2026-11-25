'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { angka } from '@/lib/format';

const toNumber = (text) => {
  // Format Indonesia: koma = desimal, titik = ribuan ("1.234,5", "150.000").
  // Titik tanpa pola ribuan dianggap desimal ("12.5").
  const t = String(text).trim();
  const normalized = t.includes(',') || /^\d{1,3}(\.\d{3})+$/.test(t) ? t.replace(/\./g, '').replace(',', '.') : t;
  const n = Number(normalized);
  return t !== '' && Number.isFinite(n) && n >= 0 ? n : null;
};

/**
 * Sel angka yang bisa langsung diketik seperti spreadsheet.
 * Klik/Tab untuk masuk, Enter atau pindah sel untuk menyimpan, Esc untuk batal.
 * Pasang `key` yang berubah saat nilai dari server berubah supaya tampilan ikut segar.
 */
export default function NumberCell({ value, onCommit, label, prefix, digits = 3, className = '' }) {
  const [draft, setDraft] = useState(null);
  const [shown, setShown] = useState(value);
  const [state, setState] = useState('idle'); // idle | saving | saved
  const cancelled = useRef(false);
  const inputRef = useRef(null);
  const selectPending = useRef(false);
  const justFocused = useRef(false);

  useLayoutEffect(() => {
    if (draft !== null && selectPending.current) {
      selectPending.current = false;
      inputRef.current?.select();
    }
  }, [draft]);

  const commit = async () => {
    if (cancelled.current) {
      cancelled.current = false;
      setDraft(null);
      return;
    }
    if (draft === null) return;
    const next = toNumber(draft);
    setDraft(null);
    if (next === null || next === Number(shown)) return;
    const previous = shown;
    setShown(next);
    setState('saving');
    const ok = await onCommit(next);
    if (!ok) {
      setShown(previous);
      setState('idle');
      return;
    }
    setState('saved');
    setTimeout(() => setState('idle'), 1500);
  };

  return (
    <div className={`relative flex items-center justify-end ${className}`}>
      {state === 'saving' && <Loader2 className="absolute -left-1 h-3.5 w-3.5 animate-spin text-slate-400" aria-hidden />}
      {state === 'saved' && <Check className="absolute -left-1 h-3.5 w-3.5 text-emerald-600" aria-label="Tersimpan" />}
      {prefix && draft === null && <span className="mr-1 text-slate-500">{prefix}</span>}
      <input
        inputMode="decimal"
        aria-label={label}
        value={draft ?? angka(shown, digits)}
        ref={inputRef}
        onFocus={() => {
          // Seleksi dilakukan setelah React menulis nilai mentah (lihat useLayoutEffect),
          // supaya angka yang diketik menggantikan isi lama, bukan tergabung dengannya.
          selectPending.current = true;
          justFocused.current = true;
          setDraft(String(shown).replace('.', ','));
        }}
        onMouseUp={(e) => {
          // Klik yang memberi fokus jangan sampai membatalkan seleksi
          if (justFocused.current) {
            e.preventDefault();
            justFocused.current = false;
          }
        }}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
          if (e.key === 'Escape') {
            cancelled.current = true;
            e.currentTarget.blur();
          }
        }}
        className="w-full min-w-0 rounded-md border border-transparent bg-transparent px-2 py-1 text-right tabular-nums text-slate-900 transition hover:border-slate-300 hover:bg-white focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />
    </div>
  );
}
