import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AuthCard from '@/components/AuthCard';
import RegisterForm from './RegisterForm';

export const metadata = { title: 'Daftar - Sistem RAB Kontraktor' };

export default async function RegisterPage() {
  if (await getServerSession(authOptions)) redirect('/dashboard');

  return (
    <AuthCard
      title="Buat akun"
      subtitle="Akun baru terdaftar sebagai estimator"
      footer={
        <>
          Sudah punya akun?{' '}
          <Link href="/login" className="font-medium text-brand-700 hover:text-brand-800">
            Masuk
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
