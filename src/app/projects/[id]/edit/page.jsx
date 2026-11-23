import { notFound } from 'next/navigation';
import { requirePageUser } from '@/lib/auth';
import { parseId, serialize } from '@/lib/api';
import { findOwnedProject } from '@/lib/rab-data';
import AppShell from '@/components/AppShell';
import ProjectSteps from '@/components/ProjectSteps';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/ui';
import ProjectForm from '../../ProjectForm';
import DeleteProjectButton from '../../DeleteProjectButton';

export const metadata = { title: 'Edit Proyek - Sistem RAB Kontraktor' };

export default async function EditProjectPage({ params }) {
  const user = await requirePageUser();
  const { id } = await params;
  const project = await findOwnedProject(parseId(id), user.id);
  if (!project) notFound();
  const itemCount = await prisma.rabItem.count({ where: { projectId: project.id } });

  return (
    <AppShell user={user}>
      <ProjectSteps current="data" projectId={id} hasItems={itemCount > 0} />
      <PageHeader
        title="Edit proyek"
        description={project.projectName}
        actions={<DeleteProjectButton id={id} name={project.projectName} redirectTo="/projects" />}
      />
      <ProjectForm project={serialize(project)} />
    </AppShell>
  );
}
