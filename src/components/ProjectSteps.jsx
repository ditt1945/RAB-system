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
export default function ProjectSteps({ current, projectId, hasItems = false, light = false }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);
  const href = {
    data: projectId ? `/projects/${projectId}/edit` : null,
    rab: projectId ? `/projects/${projectId}` : null,
    preview: projectId && hasItems ? `/projects/${projectId}/preview` : null,
  };
  const tone = light
    ? { active: 'text-slate-900', idle: 'text-slate-600 hover:text-slate-900', off: 'text-slate-400', line: 'bg-slate-400', ring: 'border-slate-400' }
    : { active: 'text-white', idle: 'text-slate-300 hover:text-white', off: 'text-slate-600', line: 'bg-slate-700', ring: 'border-slate-600' };

  return (
    <nav aria-label="Langkah proyek" className="print:hidden">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
        {STEPS.map((step, i) => {
          const isCurrent = i === currentIndex;
          const done = i < currentIndex;
          const link = href[step.key];
          const bubble = (
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                isCurrent ? 'bg-cyan-500 text-slate-950' : done ? 'bg-emerald-500/20 text-emerald-500' : `border ${tone.ring}`
              }`}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
          );
          const body = (
            <>
              {bubble}
              <span className={isCurrent ? 'font-semibold' : ''}>{step.label}</span>
            </>
          );
          return (
            <li key={step.key} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden className={`h-px w-5 sm:w-8 ${tone.line}`} />}
              {isCurrent ? (
                <span aria-current="step" className={`flex items-center gap-2 ${tone.active}`}>
                  {body}
                </span>
              ) : link ? (
                <Link href={link} className={`flex items-center gap-2 transition ${tone.idle}`}>
                  {body}
                </Link>
              ) : (
                <span
                  className={`flex items-center gap-2 ${tone.off}`}
                  title={step.key === 'preview' ? 'Tambahkan item RAB dulu' : 'Simpan data proyek dulu'}
                >
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
