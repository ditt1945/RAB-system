'use client';

import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { buttonClass } from '@/components/ui';
import { useToast } from '@/components/toast';

/**
 * Unduh PDF RAB lewat fetch. Melempar Error dengan pesan yang jelas kalau gagal.
 * version: 'client' (untuk klien: RAB + rekap) atau 'internal' (ditambah lampiran material & komposisi biaya).
 */
export async function downloadPdf(projectId, version = 'internal') {
  const res = await fetch(`/api/projects/${projectId}/pdf?download=1&version=${version}`);
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
}

/** Tombol export PDF dengan status "Membuat PDF…" dan notifikasi hasil. */
export default function PdfButton({ projectId, variant = 'primary', label = 'Export PDF', version = 'internal', className = '' }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const download = async () => {
    setLoading(true);
    try {
      await downloadPdf(projectId, version);
      toast('PDF berhasil dibuat');
    } catch (err) {
      toast.error(err.message || 'Gagal membuat PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button type="button" onClick={download} disabled={loading} className={`${buttonClass[variant]} ${className}`}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
      {loading ? 'Membuat PDF…' : label}
    </button>
  );
}
