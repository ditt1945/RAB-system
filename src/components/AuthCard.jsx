import Link from 'next/link';

/** Kerangka halaman login & register */
export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <main className="flex min-h-screen flex-col justify-center bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e2673d] text-sm font-black text-white">RK</span>
          <span className="text-lg font-bold text-white">
            Sistem RAB <span className="text-[#e2673d]">Kontraktor</span>
          </span>
        </Link>
        <h1 className="text-center text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-center text-sm text-slate-400">{subtitle}</p>}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-8 sm:px-8">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-slate-400">{footer}</div>}
      </div>
    </main>
  );
}
