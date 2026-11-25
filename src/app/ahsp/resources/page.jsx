import { requirePageUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { serialize } from '@/lib/api';
import AppShell from '@/components/AppShell';
import { PageHeader } from '@/components/ui';
import AhspTabs from '../AhspTabs';
import ResourceManager from './ResourceManager';

export const metadata = { title: 'Harga Upah, Bahan, Alat - Sistem RAB Kontraktor' };

export default async function ResourcesPage() {
  const user = await requirePageUser();
  const resources = await prisma.resource.findMany({
    orderBy: [{ type: 'asc' }, { code: 'asc' }],
    include: { _count: { select: { components: true } } },
  });

  return (
    <AppShell user={user}>
      <PageHeader
        title="Master AHSP"
        description={
          user.isAdmin
            ? 'Harga dasar upah, bahan, dan alat. Mengubah harga di sini otomatis mengubah harga satuan semua AHSP yang memakainya.'
            : 'Harga dasar yang dipakai untuk menghitung AHSP. Hanya admin yang dapat mengubah.'
        }
      />
      <AhspTabs current="harga" />
      <ResourceManager resources={serialize(resources)} canEdit={user.isAdmin} />
    </AppShell>
  );
}
