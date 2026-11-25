'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { api } from '@/lib/client';
import { buttonClass } from '@/components/ui';
import { useConfirm } from '@/components/overlay';
import { useToast } from '@/components/toast';

export default function DeleteAhspButton({ id, name }) {
  const router = useRouter();
  const toast = useToast();
  const [confirm, dialog] = useConfirm();
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    const yes = await confirm({
      title: `Hapus AHSP "${name}"?`,
      message: 'Item RAB yang sudah memakai AHSP ini tetap ada dengan harga lamanya, tetapi berubah menjadi item manual.',
    });
    if (!yes) return;
    setBusy(true);
    const res = await api(`/api/ahsp/${id}`, { method: 'DELETE' });
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast('AHSP dihapus');
    router.push('/ahsp');
    router.refresh();
  };

  return (
    <>
      <button type="button" onClick={handleDelete} disabled={busy} className={buttonClass.danger}>
        <Trash2 className="h-4 w-4" /> {busy ? 'Menghapus…' : 'Hapus'}
      </button>
      {dialog}
    </>
  );
}
