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
  const { DEMO_LOGIN_EMAIL: email, DEMO_LOGIN_PASSWORD: password } = process.env;
  const demo = process.env.NODE_ENV === 'development' && email && password ? { email, password } : null;

  return (
    <AuthCard
      title="Masuk"
      subtitle="Kelola proyek dan hitung RAB berbasis AHSP"
      footer={
        <>
          Belum punya akun?{' '}
          <Link href="/register" className="font-medium text-cyan-300 hover:text-cyan-200">
            Daftar
          </Link>
        </>
      }
    >
      <LoginForm demo={demo} callbackUrl={callbackUrl} />
    </AuthCard>
  );
}
