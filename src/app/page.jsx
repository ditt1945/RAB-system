import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { ArrowRight, Calculator, FileDown, FolderKanban, Save, Sparkles } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { buttonClass } from '@/components/ui';

const STEPS = [
  { title: 'Isi data proyek', text: 'Nama pekerjaan, klien, lokasi, dan parameter biaya seperti PPN.' },
  { title: 'Susun RAB', text: 'Pilih pekerjaan dari katalog AHSP atau minta saran AI, lalu isi volumenya.' },
  { title: 'Preview & export PDF', text: 'Periksa dokumen RAB lengkap dengan rekap dan terbilang, lalu unduh.' },
];

const FEATURES = [
  { icon: FolderKanban, title: 'Manajemen proyek', text: 'Semua proyek dan data pekerjaan tersimpan per akun, bisa dicari dan difilter.' },
  { icon: Calculator, title: 'Hitung otomatis dari AHSP', text: 'Harga satuan dihitung dari koefisien × harga upah, bahan, dan alat. Jumlah = volume × harga satuan.' },
  { icon: Sparkles, title: 'Rekomendasi AI', text: 'AI menyarankan pekerjaan dan perkiraan volume dari deskripsi proyek. Harga tetap dari AHSP.' },
  { icon: Save, title: 'RAB tersimpan rapi', text: 'Item dikelompokkan per jenis pekerjaan, bisa diedit, dihapus, dan diperbarui harganya.' },
  { icon: FileDown, title: 'Preview & PDF', text: 'Dokumen RAB dengan kop perusahaan, rekap, PPN, terbilang, dan kolom tanda tangan.' },
];

export default async function Home() {
  // Sudah login: langsung ke dashboard, tidak perlu lewat halaman depan lagi
  if (await getServerSession(authOptions)) redirect('/dashboard');

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#e2673d] text-xs font-black text-white">RK</span>
          <span className="text-base font-extrabold tracking-tight text-white">
            Sistem RAB <span className="text-[#e2673d]">Kontraktor</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:text-white">
            Masuk
          </Link>
          <Link href="/register" className={buttonClass.primary}>
            Buat akun
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:pt-16">
        <div>
          <p className="text-sm font-medium text-cyan-300">Untuk kontraktor, UMKM, dan estimator</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            Susun RAB proyek konstruksi dari data AHSP, selesai jadi PDF.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-400">
            Pilih pekerjaan, isi volume, dan sistem menghitung harga satuan, jumlah, PPN, sampai grand total. Tidak perlu rumus spreadsheet.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className={`${buttonClass.primary} px-5 py-3`}>
              Mulai susun RAB <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className={`${buttonClass.secondary} px-5 py-3`}>
              Saya sudah punya akun
            </Link>
          </div>
        </div>

        <ol className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <li className="mb-4 list-none text-xs font-medium uppercase tracking-wider text-slate-500">Alur kerja</li>
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4 py-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cyan-500 text-sm font-bold text-slate-950">{i + 1}</span>
              <div>
                <p className="font-semibold text-white">{step.title}</p>
                <p className="mt-0.5 text-sm leading-6 text-slate-400">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-slate-800 bg-slate-900/40">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <article key={title}>
              <Icon className="h-5 w-5 text-cyan-300" />
              <h2 className="mt-3 text-sm font-semibold text-white">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-400">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
