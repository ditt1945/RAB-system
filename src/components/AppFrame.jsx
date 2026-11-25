'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Building2, Calculator, ChevronsUpDown, FolderKanban, LayoutDashboard, LogOut, Plus, UserRound } from 'lucide-react';
import { ActionMenu } from '@/components/overlay';
import { AppDialogsProvider, useAppDialogs } from '@/components/AppDialogs';
import NavigationProgress from '@/components/NavigationProgress';
import Logo from '@/components/Logo';

const LINKS = [
  { href: '/dashboard', label: 'Dashboard', short: 'Beranda', icon: LayoutDashboard },
  { href: '/projects', label: 'Proyek', short: 'Proyek', icon: FolderKanban },
  { href: '/ahsp', label: 'Master AHSP', short: 'AHSP', icon: Calculator },
];

const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || '?';

/**
 * Kerangka aplikasi setelah login.
 * Laptop (≥1024px): sidebar kiri tetap + konten selebar sisa layar, sama di semua halaman.
 * HP/tablet: bar atas (logo + akun) dan bar navigasi bawah.
 */
export default function AppFrame({ user, children }) {
  return (
    <AppDialogsProvider>
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      <Frame user={user}>{children}</Frame>
    </AppDialogsProvider>
  );
}

function Frame({ user, children }) {
  const pathname = usePathname();
  const dialogs = useAppDialogs();
  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);
  const roleLabel = user.role === 'admin' ? 'Admin' : 'Estimator';

  const accountMenu = [
    { label: 'Data perusahaan', icon: Building2, onClick: dialogs.openCompany },
    { label: 'Pengaturan akun', icon: UserRound, onClick: dialogs.openProfile },
    { label: 'Keluar', icon: LogOut, danger: true, onClick: () => signOut({ callbackUrl: '/login' }) },
  ];

  const avatar = <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy-800 text-xs font-semibold text-white">{initials(user.name)}</span>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Sidebar (laptop) ─────────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-slate-200 bg-white lg:flex print:hidden">
        <Link href="/dashboard" className="flex h-16 items-center px-5" aria-label="Sistem RAB Kontraktor, ke dashboard">
          <Logo />
        </Link>
        <div className="px-3">
          <button
            type="button"
            onClick={() => dialogs.openProject()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white shadow-xs transition hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" /> Proyek baru
          </button>
        </div>
        <nav className="mt-4 flex-1 space-y-0.5 px-3" aria-label="Menu utama">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? 'page' : undefined}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive(href) ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`h-[18px] w-[18px] ${isActive(href) ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-3">
          <ActionMenu
            items={accountMenu}
            label="Menu akun"
            side="top"
            align="left"
            className="w-full"
            buttonClassName="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-slate-100"
          >
            {avatar}
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-[13px] font-medium text-slate-900">{user.name}</span>
              <span className="block text-[11px] text-slate-500">{roleLabel}</span>
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" />
          </ActionMenu>
        </div>
      </aside>

      {/* ── Bar atas (HP/tablet) ─────────────────────────────────── */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden print:hidden">
        <Link href="/dashboard" aria-label="Sistem RAB Kontraktor, ke dashboard">
          <Logo />
        </Link>
        <ActionMenu items={accountMenu} label="Menu akun" buttonClassName="flex items-center gap-1 rounded-full p-0.5 transition hover:bg-slate-100">
          {avatar}
        </ActionMenu>
      </header>

      {/* ── Konten ───────────────────────────────────────────────── */}
      <div className="lg:pl-60">
        <main className="mx-auto max-w-[1360px] space-y-5 px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-6">{children}</main>
      </div>

      {/* ── Navigasi bawah (HP/tablet) ───────────────────────────── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden print:hidden"
        aria-label="Menu utama (HP)"
      >
        {LINKS.map(({ href, short, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(href) ? 'page' : undefined}
            className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${isActive(href) ? 'text-brand-700' : 'text-slate-500'}`}
          >
            <Icon className="h-5 w-5" />
            {short}
          </Link>
        ))}
        <button type="button" onClick={() => dialogs.openProject()} className="flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-slate-500">
          <Plus className="h-5 w-5" />
          Baru
        </button>
      </nav>
    </div>
  );
}
