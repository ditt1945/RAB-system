import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { requirePageUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { serialize } from '@/lib/api';
import AppShell from '@/components/AppShell';
import { PageHeader } from '@/components/ui';
import CategoryManager from './CategoryManager';

export const metadata = { title: 'Kategori AHSP - Sistem RAB Kontraktor' };

export default async function CategoriesPage() {
  const user = await requirePageUser();
  const categories = await prisma.ahspCategory.findMany({
    orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
    include: { _count: { select: { ahsp: true } } },
  });

  return (
    <AppShell user={user}>
      <Link href="/ahsp" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Master AHSP
      </Link>
      <PageHeader
        title="Kategori pekerjaan"
        description={
          user.isAdmin
            ? 'Kategori menjadi kelompok di tabel RAB (A, B, C, …) dan urutannya mengikuti kolom Urutan.'
            : 'Kelompok pekerjaan pada RAB. Hanya admin yang dapat mengubah.'
        }
      />
      <CategoryManager categories={serialize(categories)} canEdit={user.isAdmin} />
    </AppShell>
  );
}
