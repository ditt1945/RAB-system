import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { requirePageUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { serialize } from '@/lib/api';
import AppShell from '@/components/AppShell';
import { PageHeader } from '@/components/ui';
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
      <Link href="/ahsp" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Master AHSP
      </Link>
      <PageHeader
        title="Harga upah, bahan, dan alat"
        description={
          user.isAdmin
            ? 'Mengubah harga di sini otomatis mengubah harga satuan semua AHSP yang memakainya.'
            : 'Harga dasar yang dipakai untuk menghitung AHSP. Hanya admin yang dapat mengubah.'
        }
      />
      <ResourceManager resources={serialize(resources)} canEdit={user.isAdmin} />
    </AppShell>
  );
}
