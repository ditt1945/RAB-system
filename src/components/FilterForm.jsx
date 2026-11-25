'use client';

import { useRef, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Form pencarian/filter yang langsung diterapkan: ketik (jeda 300 ms) atau pilih, tanpa tombol "Terapkan".
 * Nilai disimpan di URL (?q=…&status=…) supaya tetap ada saat halaman dimuat ulang.
 */
export default function FilterForm({ children, className = '' }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const timer = useRef(null);

  const apply = (form) => {
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(form)) if (String(value).trim()) params.set(key, String(value).trim());
    const query = params.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  };

  return (
    <form
      role="search"
      className={`relative ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        apply(e.currentTarget);
      }}
      onChange={(e) => {
        const form = e.currentTarget;
        clearTimeout(timer.current);
        timer.current = setTimeout(() => apply(form), e.target.tagName === 'SELECT' ? 0 : 300);
      }}
    >
      {children}
      {pending && <Loader2 className="absolute -right-6 top-2.5 hidden h-4 w-4 animate-spin text-slate-400 sm:block" aria-label="Memuat" />}
    </form>
  );
}
