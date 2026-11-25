import Link from 'next/link';
import { Check } from 'lucide-react';

const STEPS = [
  { key: 'data', label: 'Data proyek' },
  { key: 'rab', label: 'Susun RAB' },
  { key: 'preview', label: 'Preview & PDF' },
];

/**
 * Penunjuk langkah pengerjaan satu proyek: Data proyek → Susun RAB → Preview & PDF.
 * Langkah yang belum bisa dibuka (proyek belum disimpan / RAB masih kosong) tampil nonaktif.
 */
/** onDataClick: buka popup data proyek alih-alih pindah ke halaman edit. */
export default function ProjectSteps({ current, projectId, hasItems = false, onDataClick }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);
  const href = {
    data: projectId ? `/projects/${projectId}/edit` : null,
    rab: projectId ? `/projects/${projectId}` : null,
    preview: projectId && hasItems ? `/projects/${projectId}/preview` : null,
  };

  return (
    <nav aria-label="Langkah proyek" className="print:hidden">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-2 text-[13px]">
        {STEPS.map((step, i) => {
          const isCurrent = i === currentIndex;
          const done = i < currentIndex;
          const link = href[step.key];
          const body = (
            <>
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                  isCurrent ? 'bg-brand-600 text-white' : done ? 'bg-emerald-100 text-emerald-700' : 'border border-slate-300 text-slate-500'
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              {/* Di HP hanya label langkah aktif yang ditulis, supaya penunjuk tetap satu baris */}
              <span className={isCurrent ? 'font-semibold' : 'hidden sm:inline'}>{step.label}</span>
            </>
          );
          return (
            <li key={step.key} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden className="h-px w-4 bg-slate-300 sm:w-8" />}
              {isCurrent ? (
                <span aria-current="step" className="flex items-center gap-2 text-navy-900">
                  {body}
                </span>
              ) : step.key === 'data' && onDataClick ? (
                <button type="button" onClick={onDataClick} className="flex items-center gap-2 text-slate-600 transition hover:text-navy-900">
                  {body}
                </button>
              ) : link ? (
                <Link href={link} className="flex items-center gap-2 text-slate-600 transition hover:text-navy-900">
                  {body}
                </Link>
              ) : (
                <span className="flex items-center gap-2 text-slate-400" title={step.key === 'preview' ? 'Tambahkan item RAB dulu' : 'Simpan data proyek dulu'}>
                  {body}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
