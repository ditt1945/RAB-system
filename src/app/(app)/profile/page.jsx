import { requirePageUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui';
import ProfileSettingsForm from './ProfileSettingsForm';

export const metadata = { title: 'Pengaturan Akun - Sistem RAB Kontraktor' };

export default async function ProfilePage() {
  const user = await requirePageUser();
  const settings = await prisma.profileSetting.findUnique({ where: { userId: user.id }, select: { phoneNumber: true, department: true } });
  return (
    <>
      <PageHeader title="Pengaturan akun" description={`Peran: ${user.isAdmin ? 'Admin' : 'Estimator'}. Ubah nama, email masuk, atau kata sandi.`} />
      <div className="max-w-3xl">
        <ProfileSettingsForm
          profile={{ name: user.name, email: user.email, phoneNumber: settings?.phoneNumber, department: settings?.department }}
        />
      </div>
    </>
  );
}
