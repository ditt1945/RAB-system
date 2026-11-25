// Komponen UI dasar yang dipakai bersama.
// Tema terang "kertas kerja": kartu putih di latar abu muda, aksen oranye (brand) dan navy.
import { STATUS_LABEL } from '@/lib/format';

export const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-xs transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-100 disabled:text-slate-500';

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-50';

export const buttonClass = {
  primary: `${base} bg-brand-600 px-4 py-2 text-white shadow-xs hover:bg-brand-700`,
  secondary: `${base} border border-slate-300 bg-white px-4 py-2 text-slate-800 shadow-xs hover:border-slate-400 hover:bg-slate-50`,
  danger: `${base} border border-red-200 bg-white px-4 py-2 text-red-700 hover:bg-red-50`,
  ghost: `${base} p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900`,
  link: 'inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline',
};

export function PageHeader({ title, description, actions, eyebrow }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <div className="mb-1">{eyebrow}</div>}
        <h1 className="text-xl font-semibold tracking-tight text-navy-900 sm:text-[22px]">{title}</h1>
        {description && <div className="mt-1 text-sm text-slate-600">{description}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, description, actions, children, className = '', bodyClassName = 'p-5' }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white shadow-xs ${className}`}>
      {(title || actions) && (
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold text-navy-900">{title}</h2>}
            {description && <p className="mt-0.5 text-[13px] text-slate-600">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function Field({ label, error, hint, required, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[13px] font-medium text-slate-700">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-red-600">{Array.isArray(error) ? error[0] : error}</span>}
    </label>
  );
}

export function Alert({ type = 'error', children }) {
  if (!children) return null;
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    info: 'border-navy-100 bg-navy-50 text-navy-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
  };
  return (
    <div role={type === 'error' ? 'alert' : 'status'} className={`rounded-lg border px-4 py-3 text-sm ${styles[type]}`}>
      {children}
    </div>
  );
}

const STATUS_STYLE = {
  planning: 'bg-sky-50 text-sky-800 ring-sky-200',
  progress: 'bg-amber-50 text-amber-800 ring-amber-200',
  completed: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  cancelled: 'bg-slate-100 text-slate-600 ring-slate-200',
};

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLE[status] ?? STATUS_STYLE.cancelled}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, description, action, children }) {
  return (
    <div className="px-4 py-12 text-center">
      {Icon && (
        <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-slate-100">
          <Icon className="h-6 w-6 text-slate-500" />
        </span>
      )}
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
      {children}
    </div>
  );
}

/** Kotak angka ringkas (dashboard). */
export function Stat({ label, value, hint, icon: Icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-xs">
      <div className="flex items-center justify-between text-[13px] text-slate-600">
        {label}
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
      </div>
      <p className="mt-1 text-xl font-semibold tabular-nums text-navy-900 sm:text-2xl">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
