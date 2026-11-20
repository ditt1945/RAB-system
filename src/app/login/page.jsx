import Link from 'next/link';
import AuthCard from '@/components/AuthCard';
import LoginForm from './LoginForm';

export const metadata = { title: 'Masuk - Sistem RAB Kontraktor' };

export default function LoginPage() {
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
      <LoginForm />
    </AuthCard>
  );
}
