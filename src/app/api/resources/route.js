import { prisma } from '@/lib/prisma';
import { ok, readJson, validationFailed, withUser } from '@/lib/api';
import { resourceSchema } from '@/lib/validation/schemas';

const TYPES = ['upah', 'bahan', 'alat'];

// GET /api/resources?type=bahan&q=semen
export const GET = withUser(async (req) => {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const q = searchParams.get('q')?.trim();

  const data = await prisma.resource.findMany({
    where: {
      ...(TYPES.includes(type) ? { type } : {}),
      ...(q ? { OR: [{ name: { contains: q } }, { code: { contains: q } }] } : {}),
    },
    orderBy: [{ type: 'asc' }, { code: 'asc' }],
    include: { _count: { select: { components: true } } },
  });
  return ok({ data });
});

export const POST = withUser(
  async (req) => {
    const parsed = resourceSchema.safeParse(await readJson(req));
    if (!parsed.success) return validationFailed(parsed.error);
    const data = await prisma.resource.create({ data: parsed.data });
    return ok({ message: 'Sumber daya berhasil ditambahkan', data }, { status: 201 });
  },
  { admin: true },
);
