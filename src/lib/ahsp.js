import { prisma } from '@/lib/prisma';
import { ahspInclude } from '@/lib/rab-data';
import { calculateAhspPrice } from '@/lib/calculations/rab';

/** Daftar AHSP + harga satuan terkini (ringkas, sudah diserialisasi). Untuk tabel, pemilih AHSP, dan prompt AI. */
export async function listAhsp({ q, categoryId, includeInactive = false } = {}) {
  const list = await prisma.ahsp.findMany({
    where: {
      ...(includeInactive ? {} : { isActive: true }),
      ...(categoryId ? { categoryId } : {}),
      ...(q ? { OR: [{ name: { contains: q } }, { code: { contains: q } }] } : {}),
    },
    include: ahspInclude,
    orderBy: [{ category: { sortOrder: 'asc' } }, { code: 'asc' }],
  });

  return list.map((ahsp) => ({
    id: ahsp.id.toString(),
    code: ahsp.code,
    name: ahsp.name,
    unit: ahsp.unit,
    isActive: ahsp.isActive,
    categoryId: ahsp.categoryId.toString(),
    categoryName: ahsp.category.name,
    componentCount: ahsp.components.length,
    unitPrice: calculateAhspPrice(ahsp).unitPrice,
  }));
}
