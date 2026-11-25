'use client';

import { createContext, useContext, useState } from 'react';
import { CheckCircle2, TriangleAlert, X } from 'lucide-react';

const ToastContext = createContext(null);

let lastId = 0;

/** Fungsi toast yang dipanggil dari event handler (bukan saat render). */
function createToastApi(setToasts) {
  const dismiss = (id) => setToasts((list) => list.filter((t) => t.id !== id));
  const push = (message, { type = 'success', action, duration = 4000 } = {}) => {
    lastId += 1;
    const id = lastId;
    setToasts((list) => [...list.slice(-2), { id, message, type, action }]);
    setTimeout(() => dismiss(id), duration);
    return id;
  };
  return Object.assign((message, options) => push(message, options), {
    error: (message, options) => push(message, { ...options, type: 'error', duration: 6000 }),
    dismiss,
  });
}

/**
 * Notifikasi kecil di pojok bawah yang hilang sendiri.
 * toast('Item disimpan') · toast.error('Gagal') · toast('Item dihapus', { action: { label: 'Batalkan', onClick } })
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [api] = useState(() => createToastApi(setToasts));
  const dismiss = api.dismiss;

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:px-6 print:hidden"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.type === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex w-full max-w-sm animate-toast-in items-center gap-3 rounded-lg bg-navy-900 px-4 py-3 text-sm text-white shadow-lg"
          >
            {t.type === 'error' ? (
              <TriangleAlert className="h-4 w-4 shrink-0 text-brand-300" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
            )}
            <span className="flex-1">{t.message}</span>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action.onClick();
                  dismiss(t.id);
                }}
                className="font-semibold text-brand-300 hover:text-brand-200"
              >
                {t.action.label}
              </button>
            )}
            <button type="button" onClick={() => dismiss(t.id)} className="text-white/60 hover:text-white" aria-label="Tutup notifikasi">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast harus dipakai di dalam <ToastProvider>');
  return ctx;
}
