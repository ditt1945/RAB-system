import Link from 'next/link';

const TABS = [
  { key: 'analisa', href: '/ahsp', label: 'Analisa (AHSP)' },
  { key: 'harga', href: '/ahsp/resources', label: 'Harga upah, bahan, alat' },
  { key: 'kategori', href: '/ahsp/categories', label: 'Kategori' },
];

/** Tab di dalam Master AHSP supaya tiga halaman master terasa satu bagian. */
export default function AhspTabs({ current }) {
  return (
    <nav aria-label="Bagian Master AHSP" className="overflow-x-auto border-b border-slate-200">
      <ul className="flex min-w-max gap-1">
        {TABS.map((tab) => {
          const active = tab.key === current;
          return (
            <li key={tab.key}>
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={`-mb-px inline-block border-b-2 px-3 py-2.5 text-sm font-medium transition ${
                  active ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-navy-900'
                }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
