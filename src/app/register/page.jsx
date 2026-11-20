import Link from 'next/link';
import AuthCard from '@/components/AuthCard';
import RegisterForm from './RegisterForm';

export const metadata = { title: 'Daftar - Sistem RAB Kontraktor' };

export default function RegisterPage() {
  return (
    <AuthCard
      title="Buat akun"
      subtitle="Akun baru terdaftar sebagai estimator"
      footer={
        <>
          Sudah punya akun?{' '}
          <Link href="/login" className="font-medium text-cyan-300 hover:text-cyan-200">
            Masuk
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
