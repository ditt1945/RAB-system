// Akses data RAB yang dipakai bersama oleh halaman, API, preview, dan PDF.
// Semua query proyek WAJIB menyertakan createdBy agar data antar pengguna tidak bocor.
import { prisma } from '@/lib/prisma';
import { serialize } from '@/lib/api';
import {
  calculateAhspPrice,
  calculateProjectSummary,
  calculateRabItemSubtotal,
  groupRabItems,
} from '@/lib/calculations/rab';

export const ahspInclude = {
  category: true,
  components: { include: { resource: true }, orderBy: { id: 'asc' } },
};

/** Proyek milik user, atau null. */
export function findOwnedProject(projectId, userId) {
  if (projectId == null) return null;
  return prisma.project.findFirst({ where: { id: projectId, createdBy: userId } });
}

/** AHSP lengkap + harga satuan terkini, atau null. */
export async function findAhspWithPrice(ahspId) {
  if (ahspId == null) return null;
  const ahsp = await prisma.ahsp.findUnique({ where: { id: ahspId }, include: ahspInclude });
  if (!ahsp) return null;
  return { ahsp, price: calculateAhspPrice(ahsp) };
}

/**
 * Ubah input item (hasil rabItemSchema) menjadi data RabItem.
 * - Dari AHSP: nama, satuan, kode, dan harga diambil dari AHSP (harga tidak pernah dari client).
 * - Manual: pakai nilai dari input.
 * @param {{ keepUnitPrice?: any }} options keepUnitPrice = pertahankan harga snapshot lama (saat edit item AHSP)
 * @returns {Promise<{ data?: object, error?: string }>}
 */
export async function buildRabItemData(input, { keepUnitPrice } = {}) {
  if (input.ahspId) {
    const found = await findAhspWithPrice(BigInt(input.ahspId));
    if (!found) return { error: 'AHSP tidak ditemukan' };
    const unitPrice = keepUnitPrice ?? found.price.unitPrice;
    return {
      data: {
        ahspId: found.ahsp.id,
        code: found.ahsp.code,
        name: found.ahsp.name,
        unit: found.ahsp.unit,
        groupName: input.groupName || found.ahsp.category.name,
        volume: input.volume,
        unitPrice,
        subtotal: calculateRabItemSubtotal(input.volume, unitPrice),
      },
    };
  }

  return {
    data: {
      ahspId: null,
      code: null,
      name: input.name,
      unit: input.unit,
      groupName: input.groupName || 'Lain-lain',
      volume: input.volume,
      unitPrice: input.unitPrice,
      subtotal: calculateRabItemSubtotal(input.volume, input.unitPrice),
    },
  };
}

/** Nomor urut berikutnya untuk item baru di proyek. */
export async function nextSortOrder(projectId) {
  const last = await prisma.rabItem.findFirst({ where: { projectId }, orderBy: { sortOrder: 'desc' }, select: { sortOrder: true } });
  return (last?.sortOrder ?? -1) + 1;
}

/**
 * Semua data RAB satu proyek (sudah diserialisasi), atau null kalau bukan milik user.
 * Ringkasan dihitung dengan fungsi yang sama untuk layar, preview, dan PDF.
 */
export async function loadProjectRab(projectId, userId) {
  if (projectId == null) return null;
  const project = await prisma.project.findFirst({
    where: { id: projectId, createdBy: userId },
    include: {
      rabItems: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] },
      creator: { select: { name: true, companySettings: true } },
    },
  });
  if (!project) return null;

  const { rabItems, creator, ...rest } = project;
  const items = serialize(rabItems);
  const categoryOrder = (await prisma.ahspCategory.findMany({ orderBy: { sortOrder: 'asc' }, select: { name: true } })).map((c) => c.name);
  const summary = calculateProjectSummary({
    items,
    rabDiscount: project.rabDiscount,
    rabServiceFee: project.rabServiceFee,
    targetMarginPercent: project.targetMarginPercent,
    rabTaxPercent: project.rabTaxPercent,
  });

  return {
    project: serialize(rest),
    items,
    groups: groupRabItems(items, categoryOrder),
    summary,
    company: serialize(creator.companySettings),
    preparedBy: creator.name,
  };
}
