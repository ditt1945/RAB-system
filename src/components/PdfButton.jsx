'use client';

import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { buttonClass } from '@/components/ui';

/**
 * Tombol export PDF: mengunduh file lewat fetch supaya ada status "Membuat PDF…"
 * dan pesan error yang jelas (bukan halaman JSON mentah) kalau gagal.
 */
export default function PdfButton({ projectId, variant = 'primary', label = 'Export PDF' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const download = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/pdf?download=1`);
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || `Gagal membuat PDF (${res.status})`);
      }
      const blob = await res.blob();
      const name = /filename="?([^";]+)"?/.exec(res.headers.get('Content-Disposition') ?? '')?.[1] ?? 'RAB.pdf';
      const url = URL.createObjectURL(blob);
      const link = Object.assign(document.createElement('a'), { href: url, download: name });
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Gagal membuat PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button type="button" onClick={download} disabled={loading} className={buttonClass[variant]}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
        {loading ? 'Membuat PDF…' : label}
      </button>
      {error && (
        <span role="alert" className="max-w-xs text-right text-xs text-red-400">
          {error}
        </span>
      )}
    </span>
  );
}
