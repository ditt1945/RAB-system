import { prisma } from '@/lib/prisma';
import { fail, ok, parseId, readJson, withUser } from '@/lib/api';
import { findAhspWithPrice, findOwnedProject } from '@/lib/rab-data';
import { calculateRabItemSubtotal } from '@/lib/calculations/rab';

// Perbarui harga snapshot item ber-AHSP ke harga AHSP terkini.
// Body opsional { itemId } untuk satu item; tanpa itemId = semua item ber-AHSP di proyek.
export const POST = withUser(async (req, { params }, user) => {
  const project = await findOwnedProject(parseId(params.id), user.id);
  if (!project) return fail('Proyek tidak ditemukan', 404);

  const body = await readJson(req);
  const itemId = body?.itemId ? parseId(body.itemId) : null;
  const items = await prisma.rabItem.findMany({
    where: { projectId: project.id, ahspId: { not: null }, ...(itemId ? { id: itemId } : {}) },
  });

  const priceCache = new Map();
  let changed = 0;
  for (const item of items) {
    const key = item.ahspId.toString();
    if (!priceCache.has(key)) priceCache.set(key, (await findAhspWithPrice(item.ahspId))?.price.unitPrice ?? null);
    const unitPrice = priceCache.get(key);
    if (unitPrice == null || Number(item.unitPrice) === unitPrice) continue;

    await prisma.rabItem.update({
      where: { id: item.id },
      data: { unitPrice, subtotal: calculateRabItemSubtotal(item.volume, unitPrice) },
    });
    changed += 1;
  }

  return ok({
    message: changed ? `${changed} item diperbarui ke harga AHSP terkini` : 'Semua harga sudah sesuai AHSP terkini',
    changed,
  });
});
