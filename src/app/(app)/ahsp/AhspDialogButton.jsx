'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/overlay';
import { useToast } from '@/components/toast';
import AhspForm from './AhspForm';

/** Tombol yang membuka form AHSP (tambah / edit) di popup, tanpa pindah halaman. */
export default function AhspDialogButton({ categories, resources, ahsp, className, children }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [version, setVersion] = useState(0); // form baru setiap kali dibuka

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => {
          setVersion((v) => v + 1);
          setOpen(true);
        }}
      >
        {children}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        size="lg"
        title={ahsp ? 'Edit AHSP' : 'Tambah AHSP'}
        description={ahsp ? `${ahsp.code} · item RAB yang sudah ada tetap memakai harga lama sampai diperbarui.` : 'Susun analisa dari koefisien upah, bahan, dan alat.'}
      >
        <AhspForm
          key={version}
          categories={categories}
          resources={resources}
          ahsp={ahsp}
          onCancel={() => setOpen(false)}
          onDone={(saved) => {
            setOpen(false);
            toast(ahsp ? 'AHSP disimpan' : 'AHSP dibuat');
            if (ahsp) router.refresh();
            else router.push(`/ahsp/${saved.id}`);
          }}
        />
      </Modal>
    </>
  );
}
