import { prisma } from '@/lib/prisma';
import { fail, ok, parseId, readJson, validationFailed, withUser } from '@/lib/api';
import { findAhspWithPrice, findOwnedProject } from '@/lib/rab-data';
import { calculateRabItemSubtotal, LIMITS } from '@/lib/calculations/rab';
import { repriceSchema } from '@/lib/validation/schemas';

// Perbarui harga snapshot item ber-AHSP ke harga AHSP terkini.
// Body opsional { itemId } untuk satu item; tanpa itemId = semua item ber-AHSP di proyek.
export const POST = withUser(async (req, { params }, user) => {
  const project = await findOwnedProject(parseId(params.id), user.id);
  if (!project) return fail('Proyek tidak ditemukan', 404);

  const parsed = repriceSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationFailed(parsed.error);
  const itemId = parsed.data?.itemId ? BigInt(parsed.data.itemId) : null;

  const items = await prisma.rabItem.findMany({
    where: { projectId: project.id, ahspId: { not: null }, ...(itemId ? { id: itemId } : {}) },
  });
  if (itemId && items.length === 0) return fail('Item RAB tidak ditemukan', 404);

  const priceCache = new Map();
  const updates = [];
  for (const item of items) {
    const key = item.ahspId.toString();
    if (!priceCache.has(key)) priceCache.set(key, (await findAhspWithPrice(item.ahspId))?.price.unitPrice ?? null);
    const unitPrice = priceCache.get(key);
    if (unitPrice == null || Number(item.unitPrice) === unitPrice) continue;

    const subtotal = calculateRabItemSubtotal(item.volume, unitPrice);
    if (unitPrice > LIMITS.price || subtotal > LIMITS.subtotal) return fail(`Harga baru "${item.name}" terlalu besar`, 422);
    updates.push(prisma.rabItem.update({ where: { id: item.id }, data: { unitPrice, subtotal } }));
  }

  // Semua item berubah bersama, atau tidak sama sekali
  if (updates.length) await prisma.$transaction(updates);

  return ok({
    message: updates.length ? `${updates.length} item diperbarui ke harga AHSP terkini` : 'Semua harga sudah sesuai AHSP terkini',
    changed: updates.length,
  });
});
