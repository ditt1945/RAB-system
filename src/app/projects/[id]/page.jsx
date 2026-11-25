import { notFound } from 'next/navigation';
import { requirePageUser } from '@/lib/auth';
import { parseId } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { loadProjectRab } from '@/lib/rab-data';
import { listAhsp } from '@/lib/ahsp';
import { RAB_TEMPLATES } from '@/lib/templates';
import AppShell from '@/components/AppShell';
import RabWorkspace from './RabWorkspace';
import MaterialNeeds from './MaterialNeeds';

export const metadata = { title: 'Susun RAB - Sistem RAB Kontraktor' };

export default async function ProjectRabPage({ params }) {
  const user = await requirePageUser();
  const { id } = await params;
  const rab = await loadProjectRab(parseId(id), user.id);
  if (!rab) notFound();
  const { project, groups, summary, items, materials, composition, ahspBreakdown } = rab;

  const [catalog, history] = await Promise.all([
    listAhsp(),
    prisma.aiRequest.findMany({
      where: { projectId: BigInt(project.id), userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, prompt: true, status: true, acceptedAt: true, createdAt: true },
    }),
  ]);

  return (
    <AppShell user={user} wide>
      <RabWorkspace
        projectId={id}
        project={project}
        groups={groups}
        itemCount={items.length}
        summary={summary}
        composition={composition}
        ahspBreakdown={ahspBreakdown}
        catalog={catalog}
        history={history.map((h) => ({ ...h, id: h.id.toString(), createdAt: h.createdAt.toISOString(), acceptedAt: h.acceptedAt?.toISOString() ?? null }))}
        templates={RAB_TEMPLATES.map(({ key, name, description, items: list }) => ({ key, name, description, count: list.length }))}
      >
        <MaterialNeeds materials={materials} />
      </RabWorkspace>
    </AppShell>
  );
}
