import { prisma } from '@/lib/prisma';
import { fail, ok, parseId, readJson, validationFailed, withUser } from '@/lib/api';
import { buildRabItemData } from '@/lib/rab-data';
import { rabItemSchema } from '@/lib/validation/schemas';

function findOwnedItem(params, userId) {
  const projectId = parseId(params.id);
  const itemId = parseId(params.itemId);
  if (!projectId || !itemId) return null;
  return prisma.rabItem.findFirst({ where: { id: itemId, projectId, project: { createdBy: userId } } });
}

export const PATCH = withUser(async (req, { params }, user) => {
  const item = await findOwnedItem(params, user.id);
  if (!item) return fail('Item RAB tidak ditemukan', 404);

  const parsed = rabItemSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationFailed(parsed.error);

  // AHSP sama → harga snapshot lama dipertahankan (pakai "Perbarui harga" untuk menyegarkan)
  const sameAhsp = item.ahspId != null && parsed.data.ahspId && BigInt(parsed.data.ahspId) === item.ahspId;
  const built = await buildRabItemData(parsed.data, { keepUnitPrice: sameAhsp ? item.unitPrice.toString() : undefined });
  if (built.error) return fail(built.error, 422);

  const data = await prisma.rabItem.update({ where: { id: item.id }, data: built.data });
  return ok({ message: 'Item RAB berhasil diperbarui', data });
});

export const DELETE = withUser(async (_req, { params }, user) => {
  const item = await findOwnedItem(params, user.id);
  if (!item) return fail('Item RAB tidak ditemukan', 404);

  await prisma.rabItem.delete({ where: { id: item.id } });
  return ok({ message: 'Item RAB berhasil dihapus' });
});
