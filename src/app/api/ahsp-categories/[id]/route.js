import { prisma } from '@/lib/prisma';
import { fail, ok, parseId, readJson, validationFailed, withUser } from '@/lib/api';
import { categorySchema } from '@/lib/validation/schemas';

const NOT_FOUND = 'Kategori tidak ditemukan';

export const PUT = withUser(
  async (req, { params }) => {
    const id = parseId(params.id);
    if (!id || !(await prisma.ahspCategory.findUnique({ where: { id } }))) return fail(NOT_FOUND, 404);

    const parsed = categorySchema.safeParse(await readJson(req));
    if (!parsed.success) return validationFailed(parsed.error);

    const data = await prisma.ahspCategory.update({ where: { id }, data: parsed.data });
    return ok({ message: 'Kategori berhasil diperbarui', data });
  },
  { admin: true },
);

// Kategori yang masih dipakai AHSP tidak boleh dihapus
export const DELETE = withUser(
  async (_req, { params }) => {
    const id = parseId(params.id);
    const category = id && (await prisma.ahspCategory.findUnique({ where: { id }, include: { _count: { select: { ahsp: true } } } }));
    if (!category) return fail(NOT_FOUND, 404);
    if (category._count.ahsp > 0) {
      return fail(`Kategori masih dipakai ${category._count.ahsp} AHSP. Pindahkan AHSP-nya dulu.`, 409);
    }

    await prisma.ahspCategory.delete({ where: { id } });
    return ok({ message: 'Kategori berhasil dihapus' });
  },
  { admin: true },
);
