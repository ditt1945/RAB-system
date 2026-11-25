'use client';

import { useState } from 'react';
import { inputClass } from '@/components/ui';
import { tanggal } from '@/lib/format';

const groupThousands = (digits) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/** "1234567,5" (string mentah) → "1.234.567,5" untuk ditampilkan */
function formatId(raw) {
  if (raw === '' || raw == null) return '';
  const [int, dec] = String(raw).replace('.', ',').split(',');
  return dec !== undefined ? `${groupThousands(int)},${dec}` : groupThousands(int);
}

/** Teks yang diketik pengguna ("1.234.567,5") → angka string untuk API ("1234567.5") */
function parseId(text, decimals) {
  const cleaned = text.replace(/[^\d,]/g, '');
  const [int = '', ...rest] = cleaned.split(',');
  const dec = rest.join('').slice(0, decimals);
  const intDigits = int.replace(/^0+(?=\d)/, '');
  if (!intDigits && !dec) return '';
  return dec !== '' || (decimals > 0 && cleaned.endsWith(',')) ? `${intDigits || '0'}.${dec}` : intDigits;
}

/**
 * Input rupiah dengan awalan "Rp" dan pemisah ribuan otomatis (10.000.000).
 * value/onChange memakai string angka biasa ("10000000") supaya langsung bisa dikirim ke API.
 */
export function MoneyInput({ value, onChange, className = '', decimals = 2, ...props }) {
  const [text, setText] = useState(null); // teks saat sedang diketik
  const shown = text ?? formatId(value === null || value === undefined ? '' : String(value));
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-500">Rp</span>
      <input
        {...props}
        inputMode="decimal"
        className={`${inputClass} pl-9 text-right tabular-nums ${className}`}
        value={shown}
        onChange={(e) => {
          const raw = parseId(e.target.value, decimals);
          const [int, dec] = raw.split('.');
          setText(dec !== undefined ? `${groupThousands(int)},${dec}` : groupThousands(raw));
          onChange(raw);
        }}
        onBlur={(e) => {
          setText(null);
          props.onBlur?.(e);
        }}
      />
    </div>
  );
}

/** Input angka dengan akhiran satuan, mis. "%" atau "m³". */
export function SuffixInput({ suffix, className = '', ...props }) {
  return (
    <div className="relative">
      <input type="number" inputMode="decimal" step="any" {...props} className={`${inputClass} pr-10 text-right tabular-nums ${className}`} />
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-500">{suffix}</span>
    </div>
  );
}

/** Input tanggal; tanggal terpilih ditulis ulang dalam format Indonesia di bawahnya. */
export function DateInput({ value, ...props }) {
  return (
    <div>
      <input type="date" {...props} value={value} className={inputClass} />
      {value && <span className="mt-1 block text-xs text-slate-500">{tanggal(value)}</span>}
    </div>
  );
}
