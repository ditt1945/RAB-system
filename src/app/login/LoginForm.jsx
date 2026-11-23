'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowRight, LogIn, Zap } from 'lucide-react';
import { Alert, buttonClass, Field, inputClass } from '@/components/ui';

/**
 * @param {{ demo?: { email: string, password: string } | null, callbackUrl?: string }} props
 * demo = tombol masuk cepat (hanya dikirim server saat development).
 * callbackUrl = halaman yang tadi dibuka sebelum diminta login.
 */
export default function LoginForm({ demo = null, callbackUrl = '/dashboard' }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (loginEmail, loginPassword) => {
    setError(null);
    setLoading(true);
    try {
      const res = await signIn('credentials', { redirect: false, email: loginEmail, password: loginPassword });
      if (res?.error) {
        setError(res.error === 'CredentialsSignin' ? 'Email atau kata sandi salah' : res.error);
        setLoading(false);
        return;
      }
      // Tetap "loading" sampai pindah halaman, supaya tombol tidak bisa diklik dua kali
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError('Terjadi kendala saat masuk. Silakan coba lagi.');
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return setError('Email dan kata sandi wajib diisi');
    login(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Alert>{error}</Alert>

      <Field label="Email" required>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@kontraktor.com" autoComplete="email" className={inputClass} />
      </Field>
      <Field label="Kata sandi" required>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" className={inputClass} />
      </Field>

      <button type="submit" disabled={loading} className={`${buttonClass.primary} mt-2 w-full py-2.5`}>
        {loading ? (
          'Memverifikasi…'
        ) : (
          <>
            <LogIn className="h-4 w-4" /> Masuk <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      {demo && (
        <div className="border-t border-slate-800 pt-4">
          <button
            type="button"
            disabled={loading}
            onClick={() => login(demo.email, demo.password)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-sm font-medium text-amber-200 transition hover:bg-amber-500/20 disabled:opacity-60"
          >
            <Zap className="h-4 w-4" /> Masuk cepat sebagai {demo.email}
          </button>
          <p className="mt-2 text-center text-[11px] text-slate-500">Hanya muncul saat development (npm run dev)</p>
        </div>
      )}
    </form>
  );
}
