import { notFound } from 'next/navigation';
import { requirePageUser } from '@/lib/auth';
import { parseId, serialize } from '@/lib/api';
import { findOwnedProject } from '@/lib/rab-data';
import AppShell from '@/components/AppShell';
import { PageHeader } from '@/components/ui';
import ProjectForm from '../../ProjectForm';
import DeleteProjectButton from '../../DeleteProjectButton';

export const metadata = { title: 'Edit Proyek - Sistem RAB Kontraktor' };

export default async function EditProjectPage({ params }) {
  const user = await requirePageUser();
  const { id } = await params;
  const project = await findOwnedProject(parseId(id), user.id);
  if (!project) notFound();

  return (
    <AppShell user={user}>
      <PageHeader
        title="Edit proyek"
        description={project.projectName}
        actions={<DeleteProjectButton id={id} name={project.projectName} redirectTo="/projects" />}
      />
      <ProjectForm project={serialize(project)} />
    </AppShell>
  );
}
