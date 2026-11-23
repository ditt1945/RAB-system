import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { buttonClass } from '@/components/ui';

export const metadata = { title: 'Halaman tidak ditemukan - Sistem RAB Kontraktor' };

// Dipakai untuk URL yang salah dan data yang tidak ada / bukan milik pengguna
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center text-slate-100">
      <SearchX className="h-12 w-12 text-slate-600" />
      <p className="mt-4 text-sm font-medium text-cyan-300">404</p>
      <h1 className="mt-1 text-2xl font-bold text-white">Halaman atau data tidak ditemukan</h1>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        Alamatnya mungkin salah, datanya sudah dihapus, atau data ini bukan milik akun Anda.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/dashboard" className={buttonClass.primary}>
          Ke dashboard
        </Link>
        <Link href="/projects" className={buttonClass.secondary}>
          Daftar proyek
        </Link>
      </div>
    </main>
  );
}
