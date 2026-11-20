import { prisma } from '@/lib/prisma';
import { fail, ok, parseId, readJson, validationFailed, withUser } from '@/lib/api';
import { resourceSchema } from '@/lib/validation/schemas';

const NOT_FOUND = 'Sumber daya tidak ditemukan';

// Mengubah harga di sini otomatis mengubah HSP semua AHSP yang memakainya.
// Item RAB yang sudah ada tidak berubah sampai "Perbarui harga" ditekan.
export const PUT = withUser(
  async (req, { params }) => {
    const id = parseId(params.id);
    if (!id || !(await prisma.resource.findUnique({ where: { id } }))) return fail(NOT_FOUND, 404);

    const parsed = resourceSchema.safeParse(await readJson(req));
    if (!parsed.success) return validationFailed(parsed.error);

    const data = await prisma.resource.update({ where: { id }, data: parsed.data });
    return ok({ message: 'Sumber daya berhasil diperbarui', data });
  },
  { admin: true },
);

export const DELETE = withUser(
  async (_req, { params }) => {
    const id = parseId(params.id);
    const resource = id && (await prisma.resource.findUnique({ where: { id }, include: { _count: { select: { components: true } } } }));
    if (!resource) return fail(NOT_FOUND, 404);
    if (resource._count.components > 0) {
      return fail(`Masih dipakai di ${resource._count.components} AHSP. Nonaktifkan saja, atau hapus dari AHSP dulu.`, 409);
    }

    await prisma.resource.delete({ where: { id } });
    return ok({ message: 'Sumber daya berhasil dihapus' });
  },
  { admin: true },
);
