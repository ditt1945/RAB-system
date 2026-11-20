import { requirePageUser } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import { PageHeader } from '@/components/ui';
import CompanySettingsForm from './CompanySettingsForm';

export const metadata = { title: 'Data Perusahaan - Sistem RAB Kontraktor' };

export default async function CompanySettingsPage() {
  const user = await requirePageUser();
  return (
    <AppShell user={user}>
      <PageHeader title="Data perusahaan" description="Dipakai sebagai kop pada preview dan PDF RAB." />
      <div className="max-w-3xl">
        <CompanySettingsForm />
      </div>
    </AppShell>
  );
}
