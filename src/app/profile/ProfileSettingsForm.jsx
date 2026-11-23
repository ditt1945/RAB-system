'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client';
import { Alert, buttonClass, Card, Field, inputClass } from '@/components/ui';

const IDLE = { saving: false, error: null, errors: {}, message: null };

/** @param {{ profile: { name: string, email: string, phoneNumber?: string|null, department?: string|null } }} props */
export default function ProfileSettingsForm({ profile }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: profile.name ?? '',
    email: profile.email ?? '',
    phoneNumber: profile.phoneNumber ?? '',
    department: profile.department ?? '',
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [profileState, setProfileState] = useState(IDLE);
  const [passwordState, setPasswordState] = useState(IDLE);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setPassword = (key) => (e) => setPasswords((p) => ({ ...p, [key]: e.target.value }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileState({ ...IDLE, saving: true });
    const res = await api('/api/profile', { method: 'PUT', body: form });
    if (!res.ok) return setProfileState({ ...IDLE, error: res.error, errors: res.fields });
    setProfileState({ ...IDLE, message: 'Data akun berhasil diperbarui' });
    router.refresh();
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPasswordState({ ...IDLE, saving: true });
    const res = await api('/api/profile', { method: 'PATCH', body: passwords });
    if (!res.ok) return setPasswordState({ ...IDLE, error: res.error, errors: res.fields });
    setPasswords({ currentPassword: '', newPassword: '' });
    setPasswordState({ ...IDLE, message: 'Kata sandi berhasil diubah' });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={saveProfile} noValidate>
        <Card title="Informasi akun">
          <div className="space-y-4">
            <Alert>{profileState.error}</Alert>
            {profileState.message && <Alert type="success">{profileState.message}</Alert>}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Nama lengkap" required error={profileState.errors.name}>
                <input className={inputClass} value={form.name} onChange={set('name')} autoComplete="name" />
              </Field>
              <Field label="Email (untuk masuk)" required error={profileState.errors.email}>
                <input type="email" className={inputClass} value={form.email} onChange={set('email')} autoComplete="email" />
              </Field>
              <Field label="Nomor telepon" error={profileState.errors.phoneNumber}>
                <input className={inputClass} value={form.phoneNumber} onChange={set('phoneNumber')} autoComplete="tel" />
              </Field>
              <Field label="Jabatan / bagian" error={profileState.errors.department}>
                <input className={inputClass} value={form.department} onChange={set('department')} placeholder="Estimator, pemilik, ..." />
              </Field>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={profileState.saving} className={buttonClass.primary}>
                {profileState.saving ? 'Menyimpan…' : 'Simpan data akun'}
              </button>
            </div>
          </div>
        </Card>
      </form>

      <form onSubmit={savePassword} noValidate>
        <Card title="Ganti kata sandi">
          <div className="space-y-4">
            <Alert>{passwordState.error}</Alert>
            {passwordState.message && <Alert type="success">{passwordState.message}</Alert>}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Kata sandi saat ini" required error={passwordState.errors.currentPassword}>
                <input type="password" className={inputClass} value={passwords.currentPassword} onChange={setPassword('currentPassword')} autoComplete="current-password" />
              </Field>
              <Field label="Kata sandi baru" required error={passwordState.errors.newPassword} hint="Minimal 8 karakter">
                <input type="password" className={inputClass} value={passwords.newPassword} onChange={setPassword('newPassword')} autoComplete="new-password" />
              </Field>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={passwordState.saving} className={buttonClass.secondary}>
                {passwordState.saving ? 'Mengubah…' : 'Ubah kata sandi'}
              </button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
