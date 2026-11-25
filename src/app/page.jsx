import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { ArrowRight, Calculator, Check, FileDown, FolderKanban, Package, Sparkles } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { buttonClass } from '@/components/ui';
import Logo from '@/components/Logo';

const STEPS = [
  { title: 'Isi data proyek', text: 'Nama pekerjaan, klien, dan lokasi.' },
  { title: 'Susun RAB', text: 'Mulai dari template, saran AI, atau katalog AHSP, lalu isi volume.' },
  { title: 'Preview & PDF', text: 'Dokumen RAB lengkap dengan rekap, PPN, terbilang, dan tanda tangan.' },
];

const FEATURES = [
  { icon: FolderKanban, title: 'Manajemen proyek', text: 'Semua proyek dan data pekerjaan tersimpan per akun, bisa dicari dan difilter.' },
  { icon: Calculator, title: 'Hitung otomatis dari AHSP', text: 'Harga satuan = koefisien × harga upah, bahan, dan alat + overhead. Jumlah = volume × harga.' },
  { icon: Sparkles, title: 'Saran AI pekerjaan', text: 'Ceritakan proyeknya; AI menyarankan pekerjaan dari katalog AHSP beserta perkiraan volume.' },
  { icon: Package, title: 'Kebutuhan material', text: 'Jumlah semen, pasir, bata, dan bahan lain dihitung otomatis dari AHSP × volume.' },
  { icon: FileDown, title: 'PDF untuk klien & internal', text: 'Kop perusahaan, tabel per kelompok, rekap PPN, terbilang, dan lampiran material.' },
];

export default async function Home() {
  // Sudah login: langsung ke dashboard, tidak perlu lewat halaman depan lagi
  if (await getServerSession(authOptions)) redirect('/dashboard');

  return (
    <main className="min-h-screen bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" aria-label="Sistem RAB Kontraktor">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:text-navy-900">
            Masuk
          </Link>
          <Link href="/register" className={buttonClass.primary}>
            Buat akun
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-4 pb-12 pt-10 text-center sm:px-6 lg:pt-16">
        <p className="text-sm font-medium text-brand-700">Untuk kontraktor, UMKM, dan estimator</p>
        <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-navy-900 sm:text-5xl">
          Susun RAB dari data AHSP, langsung jadi dokumen PDF.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600">
          Pilih pekerjaan, isi volume, dan sistem menghitung harga satuan, jumlah, PPN, sampai total akhir dan kebutuhan material. Tanpa rumus spreadsheet.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/register" className={`${buttonClass.primary} px-5 py-3`}>
            Mulai susun RAB <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/login" className={`${buttonClass.secondary} px-5 py-3`}>
            Saya sudah punya akun
          </Link>
        </div>
        <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-600">
          {['AHSP sesuai Permen PUPR', 'PPN 11% otomatis', 'Bisa dipakai di HP'].map((point) => (
            <li key={point} className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-600" /> {point}
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-[0_24px_60px_-20px_rgba(15,42,63,0.35)]">
          <Image
            src="/screenshots/susun-rab.png"
            alt="Tampilan halaman Susun RAB: tabel pekerjaan per kelompok dengan rekapitulasi dan total akhir"
            width={1440}
            height={900}
            priority
            className="h-auto w-full"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-semibold text-navy-900">Tiga langkah, satu dokumen RAB</h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="rounded-xl border border-slate-200 p-5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">{i + 1}</span>
              <p className="mt-3 font-semibold text-navy-900">{step.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <article key={title}>
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-navy-900">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">Sistem RAB Kontraktor · UKK RPL</footer>
    </main>
  );
}
