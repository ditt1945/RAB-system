import { prisma } from '@/lib/prisma';
import { fail } from '@/lib/api';
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

/**
 * Pastikan kategori dan semua sumber daya di input AHSP benar-benar ada.
 * Mengembalikan Response 422 (dengan pesan per field) kalau ada yang tidak ditemukan, atau null kalau aman.
 */
export async function checkAhspReferences({ categoryId, components }) {
  const category = await prisma.ahspCategory.findUnique({ where: { id: BigInt(categoryId) }, select: { id: true } });
  if (!category) return fail('Kategori tidak ditemukan', 422, { fields: { categoryId: ['Kategori tidak ditemukan'] } });

  const ids = components.map((c) => BigInt(c.resourceId));
  const found = await prisma.resource.count({ where: { id: { in: ids } } });
  if (found !== ids.length) {
    return fail('Ada sumber daya yang tidak ditemukan', 422, { fields: { components: ['Ada sumber daya yang tidak ditemukan'] } });
  }
  return null;
}
