import { prisma } from '@/lib/prisma';
import { ok, readJson, validationFailed, withUser } from '@/lib/api';
import { projectSchema } from '@/lib/validation/schemas';

const STATUSES = ['planning', 'progress', 'completed', 'cancelled'];

// GET /api/projects?q=rumah&status=planning
export const GET = withUser(async (req, _ctx, user) => {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  const status = searchParams.get('status');

  const data = await prisma.project.findMany({
    where: {
      createdBy: user.id,
      ...(STATUSES.includes(status) ? { status } : {}),
      ...(q ? { OR: [{ projectName: { contains: q } }, { clientName: { contains: q } }] } : {}),
    },
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { rabItems: true } } },
  });
  return ok({ data });
});

export const POST = withUser(async (req, _ctx, user) => {
  const parsed = projectSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationFailed(parsed.error);

  const data = await prisma.project.create({ data: { ...parsed.data, createdBy: user.id } });
  return ok({ message: 'Proyek berhasil dibuat', data }, { status: 201 });
});
