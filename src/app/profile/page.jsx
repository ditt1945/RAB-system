import { requirePageUser } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import { PageHeader } from '@/components/ui';
import ProfileSettingsForm from './ProfileSettingsForm';

export const metadata = { title: 'Pengaturan Akun - Sistem RAB Kontraktor' };

export default async function ProfilePage() {
  const user = await requirePageUser();
  return (
    <AppShell user={user}>
      <PageHeader title="Pengaturan akun" description={`Peran: ${user.isAdmin ? 'Admin' : 'Estimator'}. Ubah nama, email login, atau kata sandi.`} />
      <div className="max-w-3xl">
        <ProfileSettingsForm />
      </div>
    </AppShell>
  );
}
