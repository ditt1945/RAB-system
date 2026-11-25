'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { api } from '@/lib/client';
import { buttonClass } from '@/components/ui';
import { useConfirm } from '@/components/overlay';
import { useToast } from '@/components/toast';

/** Tombol hapus proyek dengan dialog konfirmasi. */
export default function DeleteProjectButton({ id, name, redirectTo, variant = 'danger' }) {
  const router = useRouter();
  const toast = useToast();
  const [confirm, dialog] = useConfirm();
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    const yes = await confirm({
      title: `Hapus proyek "${name}"?`,
      message: 'Seluruh item RAB di proyek ini ikut terhapus. Tindakan ini tidak bisa dibatalkan.',
      confirmLabel: 'Hapus proyek',
    });
    if (!yes) return;
    setBusy(true);
    const res = await api(`/api/projects/${id}`, { method: 'DELETE' });
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast(`Proyek "${name}" dihapus`);
    if (redirectTo) router.push(redirectTo);
    router.refresh();
  };

  return (
    <>
      <button type="button" onClick={handleDelete} disabled={busy} className={buttonClass[variant]}>
        <Trash2 className="h-4 w-4" /> {busy ? 'Menghapus…' : 'Hapus proyek'}
      </button>
      {dialog}
    </>
  );
}
