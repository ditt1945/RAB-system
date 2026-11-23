import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Pencil } from 'lucide-react';
import { requirePageUser } from '@/lib/auth';
import { parseId } from '@/lib/api';
import { loadProjectRab } from '@/lib/rab-data';
import { listAhsp } from '@/lib/ahsp';
import { tanggal } from '@/lib/format';
import AppShell from '@/components/AppShell';
import ProjectSteps from '@/components/ProjectSteps';
import PdfButton from '@/components/PdfButton';
import { prisma } from '@/lib/prisma';
import { buttonClass, PageHeader, StatusBadge } from '@/components/ui';
import RabEditor from './RabEditor';
import RabSummary from './RabSummary';
import AiPanel from './AiPanel';
import MaterialNeeds from './MaterialNeeds';

export const metadata = { title: 'Susun RAB - Sistem RAB Kontraktor' };

export default async function ProjectRabPage({ params }) {
  const user = await requirePageUser();
  const { id } = await params;
  const rab = await loadProjectRab(parseId(id), user.id);
  if (!rab) notFound();
  const { project, groups, summary, items, materials } = rab;
  const [catalog, history] = await Promise.all([
    listAhsp(),
    prisma.aiRequest.findMany({
      where: { projectId: BigInt(project.id), userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, prompt: true, status: true, acceptedAt: true, createdAt: true },
    }),
  ]);
  const isEmpty = items.length === 0;

  const editor = (
    <RabEditor key="editor" projectId={id} groups={groups} catalog={catalog} hasAhspItems={items.some((i) => i.ahspId)} />
  );
  const ai = (
    <AiPanel
      key="ai"
      projectId={id}
      hasCatalog={catalog.length > 0}
      defaultPrompt={project.description ?? ''}
      existingAhspIds={items.filter((i) => i.ahspId).map((i) => String(i.ahspId))}
      featured={isEmpty}
      history={history.map((h) => ({ ...h, id: h.id.toString(), createdAt: h.createdAt.toISOString(), acceptedAt: h.acceptedAt?.toISOString() ?? null }))}
    />
  );

  return (
    <AppShell user={user} wide>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Daftar proyek
        </Link>
        <ProjectSteps current="rab" projectId={id} hasItems={!isEmpty} />
      </div>

      <PageHeader
        title={project.projectName}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge status={project.status} />
            {project.clientName}
            {project.location ? ` · ${project.location}` : ''}
            {project.startDate ? ` · mulai ${tanggal(project.startDate)}` : ''}
          </span>
        }
        actions={
          <>
            <Link href={`/projects/${id}/edit`} className={buttonClass.secondary}>
              <Pencil className="h-4 w-4" /> Edit proyek
            </Link>
            {!isEmpty && (
              <>
                <PdfButton projectId={id} variant="secondary" />
                <Link href={`/projects/${id}/preview`} className={buttonClass.primary}>
                  Lanjut ke preview <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_22rem]">
        {/* RAB kosong: saran AI ditaruh paling atas karena itu cara tercepat untuk mulai */}
        <div className="min-w-0 space-y-6">
          {isEmpty ? [ai, editor] : [editor, ai]}
          <MaterialNeeds materials={materials} />
        </div>
        <div className="xl:sticky xl:top-24 xl:self-start">
          <RabSummary summary={summary} itemCount={items.length} projectId={id} />
        </div>
      </div>
    </AppShell>
  );
}
