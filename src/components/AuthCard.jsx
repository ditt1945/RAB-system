import Link from 'next/link';
import Logo from '@/components/Logo';

/** Kerangka halaman masuk & daftar */
export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <main className="flex min-h-screen flex-col justify-center bg-slate-50 px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="mb-8 flex justify-center">
          <Logo />
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-8">
          <h1 className="text-xl font-semibold text-navy-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-6 text-center text-sm text-slate-600">{footer}</div>}
      </div>
    </main>
  );
}
