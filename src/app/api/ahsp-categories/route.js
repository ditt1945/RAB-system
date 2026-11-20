import { prisma } from '@/lib/prisma';
import { ok, readJson, validationFailed, withUser } from '@/lib/api';
import { categorySchema } from '@/lib/validation/schemas';

export const GET = withUser(async () => {
  const data = await prisma.ahspCategory.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { ahsp: true } } },
  });
  return ok({ data });
});

export const POST = withUser(
  async (req) => {
    const parsed = categorySchema.safeParse(await readJson(req));
    if (!parsed.success) return validationFailed(parsed.error);
    const data = await prisma.ahspCategory.create({ data: parsed.data });
    return ok({ message: 'Kategori berhasil dibuat', data }, { status: 201 });
  },
  { admin: true },
);
