'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowRight, LogIn, Zap } from 'lucide-react';
import { Alert, buttonClass, Field, inputClass } from '@/components/ui';

/**
 * @param {{ demos?: Array<{ role: string, email: string, password: string }>, callbackUrl?: string }} props
 * demos = tombol masuk cepat per peran (hanya dikirim server saat development).
 * callbackUrl = halaman yang tadi dibuka sebelum diminta login.
 */
export default function LoginForm({ demos = [], callbackUrl = '/dashboard' }) {
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

      {demos.length > 0 && (
        <div className="border-t border-slate-200 pt-4">
          <p className="mb-2 text-center text-xs font-medium text-slate-600">Masuk cepat (akun demo)</p>
          <div className={`grid gap-2 ${demos.length > 1 ? 'grid-cols-2' : ''}`}>
            {demos.map((demo) => (
              <button
                key={demo.email}
                type="button"
                disabled={loading}
                onClick={() => login(demo.email, demo.password)}
                title={demo.email}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-900 transition hover:bg-amber-100 disabled:opacity-60"
              >
                <Zap className="h-4 w-4" /> {demo.role}
              </button>
            ))}
          </div>
          <p className="mt-2 text-center text-[11px] text-slate-500">Hanya muncul saat development (npm run dev)</p>
        </div>
      )}
    </form>
  );
}
