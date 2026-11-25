import { requirePageUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { serialize } from '@/lib/api';
import { PageHeader } from '@/components/ui';
import AhspTabs from '../AhspTabs';
import CategoryManager from './CategoryManager';

export const metadata = { title: 'Kategori AHSP - Sistem RAB Kontraktor' };

export default async function CategoriesPage() {
  const user = await requirePageUser();
  const categories = await prisma.ahspCategory.findMany({
    orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
    include: { _count: { select: { ahsp: true } } },
  });

  return (
    <>
      <PageHeader
        title="Master AHSP"
        description={
          user.isAdmin
            ? 'Kategori pekerjaan menjadi kelompok di tabel RAB (A, B, C, …) dan urutannya mengikuti kolom Urutan.'
            : 'Kelompok pekerjaan pada RAB. Hanya admin yang dapat mengubah.'
        }
      />
      <AhspTabs current="kategori" />
      <CategoryManager categories={serialize(categories)} canEdit={user.isAdmin} />
    </>
  );
}
