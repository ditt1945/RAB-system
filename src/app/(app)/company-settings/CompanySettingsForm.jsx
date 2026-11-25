'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client';
import { Alert, buttonClass, Card, Field, inputClass } from '@/components/ui';

const EMPTY = { companyName: '', address: '', phone: '', email: '', logoUrl: '' };

/** @param {{ company: object | null }} props data tersimpan (null = belum pernah diisi) */
export default function CompanySettingsForm({ company, onDone, onCancel }) {
  const router = useRouter();
  const [form, setForm] = useState(() => (company ? Object.fromEntries(Object.keys(EMPTY).map((k) => [k, company[k] ?? ''])) : EMPTY));
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [logoBroken, setLogoBroken] = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (key === 'logoUrl') setLogoBroken(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setErrors({});
    setMessage(null);
    const res = await api('/api/company-settings', { method: 'PUT', body: form });
    setSaving(false);
    if (!res.ok) {
      setError(res.error);
      setErrors(res.fields);
      return;
    }
    router.refresh();
    if (onDone) return onDone();
    setMessage('Data perusahaan tersimpan. Kop di preview dan PDF sudah memakai data ini.');
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {!company && <Alert type="info">Data perusahaan belum diisi. Lengkapi supaya dokumen RAB punya kop resmi.</Alert>}
      <Alert>{error}</Alert>
      {message && <Alert type="success">{message}</Alert>}

      <Card title="Kop dokumen">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nama perusahaan" required error={errors.companyName} className="sm:col-span-2">
            <input className={inputClass} value={form.companyName} onChange={set('companyName')} placeholder="CV Maju Bersama" autoComplete="organization" />
          </Field>
          <Field label="Alamat" required error={errors.address} className="sm:col-span-2">
            <textarea rows={3} className={inputClass} value={form.address} onChange={set('address')} placeholder="Jl. ..., kota" autoComplete="street-address" />
          </Field>
          <Field label="Nomor telepon" error={errors.phone}>
            <input className={inputClass} value={form.phone} onChange={set('phone')} placeholder="0812xxxxxxxx" autoComplete="tel" />
          </Field>
          <Field label="Email perusahaan" error={errors.email}>
            <input type="email" className={inputClass} value={form.email} onChange={set('email')} placeholder="kantor@perusahaan.com" autoComplete="email" />
          </Field>
          <Field label="URL logo" error={errors.logoUrl} hint="Opsional. Alamat gambar PNG/JPG yang diawali https://" className="sm:col-span-2">
            <input type="url" className={inputClass} value={form.logoUrl} onChange={set('logoUrl')} placeholder="https://..." />
          </Field>
          {form.logoUrl.startsWith('https://') && (
            <div className="sm:col-span-2">
              <p className="mb-1.5 text-xs text-slate-400">Pratinjau logo</p>
              {logoBroken ? (
                <p className="text-xs text-amber-300">Gambar tidak bisa dimuat. Periksa URL-nya.</p>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- URL dari pengguna, domainnya tidak bisa didaftarkan di next/image
                <img src={form.logoUrl} alt="Logo perusahaan" className="h-14 w-auto rounded bg-white p-1" onError={() => setLogoBroken(true)} />
              )}
            </div>
          )}
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className={buttonClass.secondary}>
            Batal
          </button>
        )}
        <button type="submit" disabled={saving} className={buttonClass.primary}>
          {saving ? 'Menyimpan…' : 'Simpan data perusahaan'}
        </button>
      </div>
    </form>
  );
}
