import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Eye, FileDown, Pencil } from 'lucide-react';
import { requirePageUser } from '@/lib/auth';
import { parseId } from '@/lib/api';
import { loadProjectRab } from '@/lib/rab-data';
import { listAhsp } from '@/lib/ahsp';
import { tanggal } from '@/lib/format';
import AppShell from '@/components/AppShell';
import { buttonClass, PageHeader, StatusBadge } from '@/components/ui';
import RabEditor from './RabEditor';
import RabSummary from './RabSummary';
import AiPanel from './AiPanel';

export const metadata = { title: 'Susun RAB - Sistem RAB Kontraktor' };

export default async function ProjectRabPage({ params }) {
  const user = await requirePageUser();
  const { id } = await params;
  const rab = await loadProjectRab(parseId(id), user.id);
  if (!rab) notFound();
  const catalog = await listAhsp();
  const { project, groups, summary, items } = rab;

  return (
    <AppShell user={user} wide>
      <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Daftar proyek
      </Link>

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
            <Link href={`/projects/${id}/preview`} className={buttonClass.secondary}>
              <Eye className="h-4 w-4" /> Preview
            </Link>
            {items.length > 0 && (
              <a href={`/api/projects/${id}/pdf?download=1`} className={buttonClass.primary}>
                <FileDown className="h-4 w-4" /> Export PDF
              </a>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-6">
          <RabEditor projectId={id} groups={groups} catalog={catalog} hasAhspItems={items.some((i) => i.ahspId)} />
          <AiPanel projectId={id} hasCatalog={catalog.length > 0} />
        </div>
        <div className="xl:sticky xl:top-24 xl:self-start">
          <RabSummary summary={summary} itemCount={items.length} />
        </div>
      </div>
    </AppShell>
  );
}
