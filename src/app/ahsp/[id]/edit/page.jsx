import { notFound } from 'next/navigation';
import { requirePageUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseId, serialize } from '@/lib/api';
import { ahspInclude } from '@/lib/rab-data';
import AppShell from '@/components/AppShell';
import { PageHeader } from '@/components/ui';
import AhspForm from '../../AhspForm';

export const metadata = { title: 'Edit AHSP - Sistem RAB Kontraktor' };

export default async function EditAhspPage({ params }) {
  const user = await requirePageUser({ admin: true });
  const { id } = await params;
  const ahspId = parseId(id);
  const ahsp = ahspId && (await prisma.ahsp.findUnique({ where: { id: ahspId }, include: ahspInclude }));
  if (!ahsp) notFound();

  const [categories, resources] = await Promise.all([
    prisma.ahspCategory.findMany({ orderBy: { sortOrder: 'asc' } }),
    // Sertakan sumber daya nonaktif yang masih dipakai AHSP ini
    prisma.resource.findMany({
      where: { OR: [{ isActive: true }, { components: { some: { ahspId } } }] },
      orderBy: [{ type: 'asc' }, { code: 'asc' }],
    }),
  ]);

  return (
    <AppShell user={user}>
      <PageHeader
        title="Edit AHSP"
        description={`${ahsp.code} · ${ahsp.name}. Item RAB yang sudah ada tetap memakai harga lama sampai diperbarui.`}
      />
      <AhspForm categories={serialize(categories)} resources={serialize(resources)} ahsp={serialize(ahsp)} />
    </AppShell>
  );
}
