import { prisma } from '@/lib/prisma';
import { fail, ok, parseId, readJson, validationFailed, withUser } from '@/lib/api';
import { findAhspWithPrice } from '@/lib/rab-data';
import { checkAhspReferences } from '@/lib/ahsp';
import { ahspSchema } from '@/lib/validation/schemas';

const NOT_FOUND = 'AHSP tidak ditemukan';

// Detail AHSP + rincian perhitungan (upah, bahan, alat, overhead, HSP)
export const GET = withUser(async (_req, { params }) => {
  const found = await findAhspWithPrice(parseId(params.id));
  if (!found) return fail(NOT_FOUND, 404);
  return ok({ data: { ...found.ahsp, price: found.price } });
});

export const PUT = withUser(
  async (req, { params }) => {
    const id = parseId(params.id);
    if (!id || !(await prisma.ahsp.findUnique({ where: { id } }))) return fail(NOT_FOUND, 404);

    const parsed = ahspSchema.safeParse(await readJson(req));
    if (!parsed.success) return validationFailed(parsed.error);
    const { components, categoryId, ...rest } = parsed.data;
    const badReference = await checkAhspReferences(parsed.data);
    if (badReference) return badReference;

    // Ganti seluruh komponen dalam satu transaksi
    const data = await prisma.$transaction(async (tx) => {
      await tx.ahspComponent.deleteMany({ where: { ahspId: id } });
      return tx.ahsp.update({
        where: { id },
        data: {
          ...rest,
          categoryId: BigInt(categoryId),
          components: { create: components.map((c) => ({ resourceId: BigInt(c.resourceId), coefficient: c.coefficient })) },
        },
      });
    });
    return ok({ message: 'AHSP berhasil diperbarui. Item RAB lama tetap memakai harga lamanya.', data });
  },
  { admin: true },
);

// Item RAB yang memakai AHSP ini tetap ada (harga snapshot), hanya tautannya dilepas.
export const DELETE = withUser(
  async (_req, { params }) => {
    const id = parseId(params.id);
    if (!id || !(await prisma.ahsp.findUnique({ where: { id } }))) return fail(NOT_FOUND, 404);

    await prisma.ahsp.delete({ where: { id } });
    return ok({ message: 'AHSP berhasil dihapus' });
  },
  { admin: true },
);
