'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Building2, Calculator, ChevronDown, FolderKanban, LayoutDashboard, LogOut, UserRound } from 'lucide-react';
import { ActionMenu } from '@/components/overlay';
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
 * Laptop: bar atas berisi 3 menu utama + menu avatar (Data perusahaan, Akun, Keluar).
 * HP: bar atas hanya logo + avatar, menu utama pindah ke bar bawah supaya mudah dijangkau jempol.
 */
export default function DashboardNav({ user, wide = false }) {
  const pathname = usePathname();
  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);
  const roleLabel = user?.role === 'admin' ? 'Admin' : 'Estimator';

  const accountMenu = [
    { label: 'Data perusahaan', icon: Building2, href: '/company-settings' },
    { label: 'Pengaturan akun', icon: UserRound, href: '/profile' },
    { label: 'Keluar', icon: LogOut, danger: true, onClick: () => signOut({ callbackUrl: '/login' }) },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur print:hidden">
        <div className={`mx-auto flex h-14 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 ${wide ? 'max-w-[90rem]' : 'max-w-6xl'}`}>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" aria-label="Sistem RAB Kontraktor, ke dashboard">
              <Logo />
            </Link>
            <nav className="hidden items-center gap-1 md:flex" aria-label="Menu utama">
              {LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive(href) ? 'page' : undefined}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    isActive(href) ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <ActionMenu
            items={accountMenu}
            label="Menu akun"
            buttonClassName="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 text-left transition hover:bg-slate-100"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-navy-800 text-xs font-semibold text-white">{initials(user?.name)}</span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-[13px] font-medium text-slate-900">{user?.name}</span>
              <span className="block text-[11px] text-slate-500">{roleLabel}</span>
            </span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </ActionMenu>
        </div>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden print:hidden"
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
      </nav>
    </>
  );
}
