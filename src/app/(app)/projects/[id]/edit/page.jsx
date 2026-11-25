import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requirePageUser } from '@/lib/auth';
import { parseId, serialize } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { findOwnedProject } from '@/lib/rab-data';
import ProjectSteps from '@/components/ProjectSteps';
import { PageHeader } from '@/components/ui';
import ProjectForm from '../../ProjectForm';
import DeleteProjectButton from '../../DeleteProjectButton';

export const metadata = { title: 'Ubah Data Proyek - Sistem RAB Kontraktor' };

export default async function EditProjectPage({ params }) {
  const user = await requirePageUser();
  const { id } = await params;
  const project = await findOwnedProject(parseId(id), user.id);
  if (!project) notFound();
  const itemCount = await prisma.rabItem.count({ where: { projectId: project.id } });

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href={`/projects/${id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-navy-900">
          <ArrowLeft className="h-4 w-4" /> Kembali ke RAB
        </Link>
        <ProjectSteps current="data" projectId={id} hasItems={itemCount > 0} />
      </div>
      <PageHeader title="Ubah data proyek" description={project.projectName} />
      <ProjectForm project={serialize(project)} />

      <section className="max-w-3xl rounded-xl border border-red-200 bg-white p-5">
        <h2 className="text-base font-semibold text-red-800">Hapus proyek</h2>
        <p className="mt-1 text-[13px] text-slate-600">Proyek dan seluruh item RAB-nya dihapus permanen.</p>
        <div className="mt-4">
          <DeleteProjectButton id={id} name={project.projectName} redirectTo="/projects" />
        </div>
      </section>
    </>
  );
}
