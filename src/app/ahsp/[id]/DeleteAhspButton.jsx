'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { api } from '@/lib/client';
import { buttonClass } from '@/components/ui';

export default function DeleteAhspButton({ id, name }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    const ok = window.confirm(
      `Hapus AHSP "${name}"?\n\nItem RAB yang sudah memakai AHSP ini tetap ada dengan harga lamanya, tetapi berubah menjadi item manual.`,
    );
    if (!ok) return;
    setBusy(true);
    const res = await api(`/api/ahsp/${id}`, { method: 'DELETE' });
    setBusy(false);
    if (!res.ok) return window.alert(res.error);
    router.push('/ahsp');
    router.refresh();
  };

  return (
    <button type="button" onClick={handleDelete} disabled={busy} className={buttonClass.danger}>
      <Trash2 className="h-4 w-4" /> {busy ? 'Menghapus…' : 'Hapus'}
    </button>
  );
}
