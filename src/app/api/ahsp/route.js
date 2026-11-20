import { prisma } from '@/lib/prisma';
import { ok, readJson, validationFailed, withUser } from '@/lib/api';
import { listAhsp } from '@/lib/ahsp';
import { ahspSchema } from '@/lib/validation/schemas';

// GET /api/ahsp?q=galian&categoryId=1  (admin: &all=1 untuk ikut menampilkan yang nonaktif)
export const GET = withUser(async (req, _ctx, user) => {
  const { searchParams } = new URL(req.url);
  const categoryId = /^\d+$/.test(searchParams.get('categoryId') ?? '') ? BigInt(searchParams.get('categoryId')) : undefined;
  const data = await listAhsp({
    q: searchParams.get('q')?.trim(),
    categoryId,
    includeInactive: user.isAdmin && searchParams.get('all') === '1',
  });
  return ok({ data });
});

export const POST = withUser(
  async (req) => {
    const parsed = ahspSchema.safeParse(await readJson(req));
    if (!parsed.success) return validationFailed(parsed.error);
    const { components, categoryId, ...rest } = parsed.data;

    const data = await prisma.ahsp.create({
      data: {
        ...rest,
        categoryId: BigInt(categoryId),
        components: { create: components.map((c) => ({ resourceId: BigInt(c.resourceId), coefficient: c.coefficient })) },
      },
    });
    return ok({ message: 'AHSP berhasil dibuat', data }, { status: 201 });
  },
  { admin: true },
);
