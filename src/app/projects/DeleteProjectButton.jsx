'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client';

export default function DeleteProjectButton({ id, name, redirectTo }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Hapus proyek "${name}" beserta seluruh item RAB-nya? Tindakan ini tidak bisa dibatalkan.`)) return;
    setBusy(true);
    const res = await api(`/api/projects/${id}`, { method: 'DELETE' });
    setBusy(false);
    if (!res.ok) {
      window.alert(res.error);
      return;
    }
    if (redirectTo) router.push(redirectTo);
    router.refresh();
  };

  return (
    <button type="button" onClick={handleDelete} disabled={busy} className="rounded-md px-2 py-1 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-50">
      {busy ? 'Menghapus…' : 'Hapus'}
    </button>
  );
}
