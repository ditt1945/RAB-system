'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { TriangleAlert } from 'lucide-react';
import { buttonClass } from '@/components/ui';

// Tampil kalau halaman gagal dimuat, misalnya database (MySQL) belum dinyalakan
export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-amber-100">
        <TriangleAlert className="h-7 w-7 text-amber-700" />
      </span>
      <h1 className="mt-4 text-2xl font-semibold text-navy-900">Terjadi kesalahan</h1>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        Halaman ini gagal dimuat. Pastikan database sudah berjalan, lalu coba lagi.
        {error?.digest && <span className="mt-1 block text-xs text-slate-500">Kode: {error.digest}</span>}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={reset} className={buttonClass.primary}>
          Coba lagi
        </button>
        <Link href="/dashboard" className={buttonClass.secondary}>
          Ke dashboard
        </Link>
      </div>
    </main>
  );
}
