'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Garis progres tipis di atas layar saat pindah halaman, supaya pengguna tahu klik sudah diproses.
 * Mulai saat link internal diklik, selesai saat alamat halaman berubah.
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState('idle'); // idle | loading | done
  const location = `${pathname}?${searchParams}`;
  const [last, setLast] = useState(location);

  // Alamat berubah → selesaikan garis (pola "simpan nilai sebelumnya" tanpa efek)
  if (last !== location) {
    setLast(location);
    if (state === 'loading') setState('done');
  }

  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target.closest?.('a[href]');
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname.startsWith('/api/')) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      setState('loading');
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  useEffect(() => {
    if (state !== 'done') return undefined;
    const timer = setTimeout(() => setState('idle'), 350);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-0.5 print:hidden">
      <div
        className={`h-full bg-brand-500 shadow-[0_0_8px] shadow-brand-500/60 ${
          state === 'loading'
            ? 'w-4/5 opacity-100 transition-[width] duration-[2500ms] ease-out'
            : state === 'done'
              ? 'w-full opacity-0 transition-[width,opacity] duration-300'
              : 'w-0 opacity-0'
        }`}
      />
    </div>
  );
}
