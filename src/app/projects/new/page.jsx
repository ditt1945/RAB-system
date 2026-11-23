import { requirePageUser } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import ProjectSteps from '@/components/ProjectSteps';
import { PageHeader } from '@/components/ui';
import ProjectForm from '../ProjectForm';

export const metadata = { title: 'Proyek Baru - Sistem RAB Kontraktor' };

export default async function NewProjectPage() {
  const user = await requirePageUser();
  return (
    <AppShell user={user}>
      <ProjectSteps current="data" />
      <PageHeader title="Proyek baru" description="Isi data proyek. Setelah tersimpan, Anda langsung diarahkan ke penyusunan RAB." />
      <ProjectForm />
    </AppShell>
  );
}
