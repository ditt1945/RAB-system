import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AuthCard from '@/components/AuthCard';
import LoginForm from './LoginForm';

export const metadata = { title: 'Masuk - Sistem RAB Kontraktor' };

/**
 * Ambil hanya path dari callbackUrl (NextAuth mengirim URL lengkap), supaya
 * setelah login pengguna kembali ke halaman tadi dan tidak bisa diarahkan ke situs lain.
 */
function safeCallback(value) {
  try {
    const url = new URL(String(value ?? ''), 'http://localhost');
    const path = url.pathname + url.search;
    return path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/login') ? path : '/dashboard';
  } catch {
    return '/dashboard';
  }
}

export default async function LoginPage({ searchParams }) {
  const callbackUrl = safeCallback((await searchParams).callbackUrl);
  if (await getServerSession(authOptions)) redirect(callbackUrl);

  // Shortcut login untuk development saja. Di production (npm run build/start) tombolnya tidak ada.
  const env = process.env;
  const demos =
    env.NODE_ENV === 'development'
      ? [
          { role: 'Admin', email: env.DEMO_LOGIN_EMAIL, password: env.DEMO_LOGIN_PASSWORD },
          { role: 'Estimator', email: env.DEMO_ESTIMATOR_EMAIL, password: env.DEMO_ESTIMATOR_PASSWORD },
        ].filter((d) => d.email && d.password)
      : [];

  return (
    <AuthCard
      title="Masuk"
      subtitle="Kelola proyek dan hitung RAB berbasis AHSP"
      footer={
        <>
          Belum punya akun?{' '}
          <Link href="/register" className="font-medium text-brand-700 hover:text-brand-800">
            Daftar
          </Link>
        </>
      }
    >
      <LoginForm demos={demos} callbackUrl={callbackUrl} />
    </AuthCard>
  );
}
