'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Building2, Calculator, FolderKanban, LayoutDashboard, LogOut, Menu, Settings, X } from 'lucide-react';

const LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Proyek', icon: FolderKanban },
  { href: '/ahsp', label: 'Master AHSP', icon: Calculator },
  { href: '/company-settings', label: 'Perusahaan', icon: Building2 },
  { href: '/profile', label: 'Akun', icon: Settings },
];

export default function DashboardNav({ user }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur print:hidden">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#e2673d] text-xs font-black text-white">RK</span>
            <span className="text-base font-extrabold tracking-tight text-white">
              Sistem RAB <span className="text-[#e2673d]">Kontraktor</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Menu utama">
            {LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  isActive(href) ? 'bg-cyan-500/10 text-cyan-300' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium text-white">{user?.name}</p>
            <p className="text-[11px] text-slate-500">{user?.role === 'admin' ? 'Admin' : 'Estimator'}</p>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="hidden items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-red-500/30 hover:text-red-400 sm:flex"
          >
            <LogOut className="h-3.5 w-3.5" />
            Keluar
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-slate-800 p-2 text-slate-300 lg:hidden"
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-slate-800 px-4 py-3 lg:hidden" aria-label="Menu utama (mobile)">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm ${
                isActive(href) ? 'bg-cyan-500/10 text-cyan-300' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-red-300 hover:bg-slate-900"
          >
            <LogOut className="h-4 w-4" />
            Keluar ({user?.name})
          </button>
        </nav>
      )}
    </header>
  );
}
