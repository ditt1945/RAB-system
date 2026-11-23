'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { api } from '@/lib/client';
import { Alert, buttonClass, Field, inputClass } from '@/components/ui';

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrors({});

    const res = await api('/api/auth/register', { method: 'POST', body: form });
    if (!res.ok) {
      setLoading(false);
      setError(res.error);
      setErrors(res.fields);
      return;
    }

    // Langsung masuk setelah daftar
    const login = await signIn('credentials', { redirect: false, email: form.email, password: form.password });
    if (login?.error) {
      router.push('/login');
      return;
    }
    // loading dibiarkan true sampai pindah halaman, supaya tidak terkirim dua kali
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Alert>{error}</Alert>
      <Field label="Nama lengkap" required error={errors.name}>
        <input className={inputClass} value={form.name} onChange={set('name')} autoComplete="name" />
      </Field>
      <Field label="Email" required error={errors.email}>
        <input type="email" className={inputClass} value={form.email} onChange={set('email')} autoComplete="email" />
      </Field>
      <Field label="Kata sandi" required error={errors.password} hint="Minimal 8 karakter">
        <input type="password" className={inputClass} value={form.password} onChange={set('password')} autoComplete="new-password" />
      </Field>
      <button type="submit" disabled={loading} className={`${buttonClass.primary} w-full`}>
        {loading ? 'Memproses…' : 'Daftar'}
      </button>
    </form>
  );
}
