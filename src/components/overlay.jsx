'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal, X } from 'lucide-react';
import { buttonClass } from '@/components/ui';

/** Tutup dengan Esc dan kunci scroll halaman selama panel terbuka. */
function useModalBehavior(open, onClose) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);
}

/**
 * Panel geser: dari kanan di laptop, dari bawah di HP.
 * Dipakai untuk saran AI dan edit item di HP.
 */
export function Sheet({ open, onClose, title, description, children, footer, size = 'md' }) {
  useModalBehavior(open, onClose);
  const titleId = useId();
  if (!open || typeof document === 'undefined') return null;
  const width = size === 'lg' ? 'md:max-w-2xl' : 'md:max-w-lg';
  return createPortal(
    <div className="fixed inset-0 z-50 print:hidden" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button type="button" className="absolute inset-0 h-full w-full bg-navy-900/40" onClick={onClose} aria-label="Tutup panel" tabIndex={-1} />
      <div
        className={`absolute inset-x-0 bottom-0 flex max-h-[92vh] animate-sheet-in-bottom flex-col rounded-t-2xl bg-white shadow-xl md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-full ${width} md:animate-sheet-in-right md:rounded-none`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-semibold text-navy-900">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-[13px] text-slate-600">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className={buttonClass.ghost} aria-label="Tutup">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-slate-200 bg-slate-50 px-5 py-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

/** Dialog konfirmasi pengganti window.confirm. */
export function ConfirmDialog({ open, title, message, confirmLabel = 'Hapus', danger = true, busy = false, onConfirm, onCancel }) {
  useModalBehavior(open, onCancel);
  const titleId = useId();
  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center p-4 print:hidden" role="alertdialog" aria-modal="true" aria-labelledby={titleId}>
      <button type="button" className="absolute inset-0 h-full w-full bg-navy-900/40" onClick={onCancel} aria-label="Batal" tabIndex={-1} />
      <div className="relative w-full max-w-md animate-toast-in rounded-xl bg-white p-5 shadow-xl">
        <h2 id={titleId} className="text-base font-semibold text-navy-900">
          {title}
        </h2>
        {message && <div className="mt-2 text-sm text-slate-600">{message}</div>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className={buttonClass.secondary} autoFocus>
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={danger ? `${buttonClass.primary} bg-red-600 hover:bg-red-700` : buttonClass.primary}
          >
            {busy ? 'Memproses…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * Pengganti window.confirm berbasis dialog sendiri.
 * const [confirm, dialog] = useConfirm();  →  if (!(await confirm({ title, message }))) return;  lalu render {dialog}.
 */
export function useConfirm() {
  const [state, setState] = useState(null); // { title, message, confirmLabel, danger, resolve }
  const confirm = (options) => new Promise((resolve) => setState({ confirmLabel: 'Hapus', danger: true, ...options, resolve }));
  const finish = (value) => {
    state?.resolve(value);
    setState(null);
  };
  const dialog = (
    <ConfirmDialog
      open={Boolean(state)}
      title={state?.title}
      message={state?.message}
      confirmLabel={state?.confirmLabel}
      danger={state?.danger}
      onConfirm={() => finish(true)}
      onCancel={() => finish(false)}
    />
  );
  return [confirm, dialog];
}

/**
 * Menu "⋯" kecil berisi aksi.
 * items: [{ label, icon, onClick, danger?, href? }]
 */
export function ActionMenu({ items, label = 'Aksi lainnya', align = 'right', buttonClassName = buttonClass.ghost, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)} className={buttonClassName} aria-label={label} aria-haspopup="menu" aria-expanded={open}>
        {children ?? <MoreHorizontal className="h-4 w-4" />}
      </button>
      {open && (
        <div
          role="menu"
          className={`absolute top-full z-30 mt-1 min-w-48 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          {items.filter(Boolean).map(({ label: text, icon: Icon, onClick, danger, href }) => {
            const cls = `flex w-full items-center gap-2.5 px-3 py-2 text-left ${danger ? 'text-red-700 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50'}`;
            const content = (
              <>
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                {text}
              </>
            );
            return href ? (
              <a key={text} href={href} role="menuitem" className={cls} onClick={() => setOpen(false)}>
                {content}
              </a>
            ) : (
              <button
                key={text}
                type="button"
                role="menuitem"
                className={cls}
                onClick={() => {
                  setOpen(false);
                  onClick();
                }}
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
