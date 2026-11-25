'use client';

import { useState } from 'react';
import { LayoutTemplate } from 'lucide-react';
import { buttonClass } from '@/components/ui';
import { Sheet } from '@/components/overlay';

/** Pilih template RAB (rumah tipe 36/45, renovasi) sebagai titik awal. */
export default function TemplateSheet({ open, onClose, templates, hasItems, onApply }) {
  const [busyKey, setBusyKey] = useState(null);

  const apply = async (key) => {
    setBusyKey(key);
    const ok = await onApply(key);
    setBusyKey(null);
    if (ok) onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Mulai dari template"
      description={
        hasItems
          ? 'Pekerjaan dari template akan ditambahkan ke RAB yang sudah ada.'
          : 'Template berisi pekerjaan AHSP yang umum beserta perkiraan volume. Sesuaikan volumenya dengan gambar kerja.'
      }
    >
      <ul className="space-y-3">
        {templates.map((t) => (
          <li key={t.key} className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                <LayoutTemplate className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-navy-900">{t.name}</p>
                <p className="mt-0.5 text-sm text-slate-600">{t.description}</p>
                <p className="mt-1 text-xs text-slate-500">{t.count} pekerjaan</p>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button type="button" onClick={() => apply(t.key)} disabled={busyKey !== null} className={buttonClass.primary}>
                {busyKey === t.key ? 'Menambahkan…' : 'Pakai template ini'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
