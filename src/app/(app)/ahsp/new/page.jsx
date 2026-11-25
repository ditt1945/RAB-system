import { requirePageUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { serialize } from '@/lib/api';
import { PageHeader } from '@/components/ui';
import AhspForm from '../AhspForm';

export const metadata = { title: 'Tambah AHSP - Sistem RAB Kontraktor' };

export default async function NewAhspPage() {
  const user = await requirePageUser({ admin: true });
  const [categories, resources] = await Promise.all([
    prisma.ahspCategory.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.resource.findMany({ where: { isActive: true }, orderBy: [{ type: 'asc' }, { code: 'asc' }] }),
  ]);

  return (
    <>
      <PageHeader title="Tambah AHSP" description="Susun analisa harga satuan pekerjaan dari koefisien upah, bahan, dan alat." />
      <AhspForm categories={serialize(categories)} resources={serialize(resources)} />
    </>
  );
}
