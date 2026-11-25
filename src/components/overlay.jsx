'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { MoreHorizontal, X } from 'lucide-react';
import { buttonClass } from '@/components/ui';

const DURATION = 200;

/**
 * Animasi masuk & keluar: komponen tetap terpasang sebentar setelah ditutup
 * supaya transisi keluar sempat diputar.
 * @returns {{ mounted: boolean, visible: boolean }}
 */
export function usePresence(open, ms = DURATION) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timers = [];
    let frame;
    if (open) {
      timers.push(
        setTimeout(() => {
          setMounted(true);
          // dua frame: pastikan elemen sudah tergambar sebelum kelas "terlihat" dipasang
          frame = requestAnimationFrame(() => {
            frame = requestAnimationFrame(() => setVisible(true));
          });
        }, 0),
      );
    } else {
      timers.push(setTimeout(() => setVisible(false), 0));
      timers.push(setTimeout(() => setMounted(false), ms));
    }
    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(frame);
    };
  }, [open, ms]);
  return { mounted, visible };
}

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

function Backdrop({ visible, onClick, label }) {
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={label}
      onClick={onClick}
      className={`absolute inset-0 h-full w-full bg-navy-900/40 backdrop-blur-[2px] transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
    />
  );
}

function Header({ id, title, description, onClose }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
      <div className="min-w-0">
        <h2 id={id} className="text-base font-semibold text-navy-900">
          {title}
        </h2>
        {description && <div className="mt-0.5 text-[13px] text-slate-600">{description}</div>}
      </div>
      <button type="button" onClick={onClose} className={buttonClass.ghost} aria-label="Tutup">
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

/**
 * Panel geser: dari kanan di laptop, dari bawah di HP.
 * Dipakai untuk saran AI, tambah/ubah item, dan rekap di HP.
 */
export function Sheet({ open, onClose, title, description, children, footer, size = 'md' }) {
  useModalBehavior(open, onClose);
  const { mounted, visible } = usePresence(open);
  const titleId = useId();
  if (!mounted || typeof document === 'undefined') return null;
  const width = size === 'lg' ? 'md:max-w-2xl' : 'md:max-w-lg';
  return createPortal(
    <div className="fixed inset-0 z-50 print:hidden" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <Backdrop visible={visible} onClick={onClose} label="Tutup panel" />
      <div
        className={`absolute inset-x-0 bottom-0 flex max-h-[92vh] flex-col rounded-t-2xl bg-white shadow-2xl transition-transform duration-200 ease-out md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-full ${width} md:rounded-none ${
          visible ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full md:translate-y-0'
        }`}
      >
        <Header id={titleId} title={title} description={description} onClose={onClose} />
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-slate-200 bg-slate-50 px-5 py-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

/**
 * Popup di tengah layar untuk form edit data (proyek, AHSP, perusahaan, akun).
 * Di HP tampil penuh dari bawah.
 */
export function Modal({ open, onClose, title, description, children, size = 'md' }) {
  useModalBehavior(open, onClose);
  const { mounted, visible } = usePresence(open);
  const titleId = useId();
  if (!mounted || typeof document === 'undefined') return null;
  const width = { sm: 'sm:max-w-md', md: 'sm:max-w-2xl', lg: 'sm:max-w-4xl' }[size];
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6 print:hidden" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <Backdrop visible={visible} onClick={onClose} label="Tutup" />
      <div
        className={`relative flex max-h-[94vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl transition duration-200 ease-out sm:max-h-[90vh] sm:rounded-2xl ${width} ${
          visible ? 'translate-y-0 opacity-100 sm:scale-100' : 'translate-y-8 opacity-0 sm:translate-y-2 sm:scale-[0.97]'
        }`}
      >
        <Header id={titleId} title={title} description={description} onClose={onClose} />
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

/** Dialog konfirmasi pengganti window.confirm. */
export function ConfirmDialog({ open, title, message, confirmLabel = 'Hapus', danger = true, busy = false, onConfirm, onCancel }) {
  useModalBehavior(open, onCancel);
  const { mounted, visible } = usePresence(open, 150);
  const titleId = useId();
  if (!mounted || typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-0 z-[55] grid place-items-center p-4 print:hidden" role="alertdialog" aria-modal="true" aria-labelledby={titleId}>
      <Backdrop visible={visible} onClick={onCancel} label="Batal" />
      <div className={`relative w-full max-w-md rounded-xl bg-white p-5 shadow-2xl transition duration-150 ease-out ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <h2 id={titleId} className="text-base font-semibold text-navy-900">
          {title}
        </h2>
        {message && <div className="mt-2 text-sm text-slate-600">{message}</div>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className={buttonClass.secondary} autoFocus>
            Batal
          </button>
          <button type="button" onClick={onConfirm} disabled={busy} className={danger ? `${buttonClass.primary} bg-red-600 hover:bg-red-700` : buttonClass.primary}>
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
 * Menu kecil berisi aksi (tombol "⋯", menu akun).
 * items: [{ label, icon, onClick, danger?, href? }]
 * side: 'bottom' (bawah tombol) atau 'top' (atas tombol, untuk menu di dasar sidebar)
 */
export function ActionMenu({ items, label = 'Aksi lainnya', align = 'right', side = 'bottom', buttonClassName = buttonClass.ghost, className = '', children }) {
  const [open, setOpen] = useState(false);
  const { mounted, visible } = usePresence(open, 120);
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

  const position = `${align === 'right' ? 'right-0' : 'left-0'} ${side === 'top' ? 'bottom-full mb-1 origin-bottom' : 'top-full mt-1 origin-top'}`;

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)} className={buttonClassName} aria-label={label} aria-haspopup="menu" aria-expanded={open}>
        {children ?? <MoreHorizontal className="h-4 w-4" />}
      </button>
      {mounted && (
        <div
          role="menu"
          className={`absolute z-40 min-w-52 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg transition duration-100 ease-out ${position} ${
            visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
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
              <Link key={text} href={href} role="menuitem" className={cls} onClick={() => setOpen(false)}>
                {content}
              </Link>
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
