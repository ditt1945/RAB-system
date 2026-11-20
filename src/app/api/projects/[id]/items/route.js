import { prisma } from '@/lib/prisma';
import { fail, ok, parseId, readJson, validationFailed, withUser } from '@/lib/api';
import { buildRabItemData, findOwnedProject, nextSortOrder } from '@/lib/rab-data';
import { rabItemSchema } from '@/lib/validation/schemas';

export const GET = withUser(async (_req, { params }, user) => {
  const project = await findOwnedProject(parseId(params.id), user.id);
  if (!project) return fail('Proyek tidak ditemukan', 404);

  const data = await prisma.rabItem.findMany({
    where: { projectId: project.id },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  return ok({ data });
});

// Tambah item: dari AHSP ({ ahspId, volume }) atau manual ({ name, unit, unitPrice, volume })
export const POST = withUser(async (req, { params }, user) => {
  const project = await findOwnedProject(parseId(params.id), user.id);
  if (!project) return fail('Proyek tidak ditemukan', 404);

  const parsed = rabItemSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationFailed(parsed.error);

  const built = await buildRabItemData(parsed.data);
  if (built.error) return fail(built.error, 422);

  const data = await prisma.rabItem.create({
    data: { ...built.data, projectId: project.id, sortOrder: await nextSortOrder(project.id) },
  });
  return ok({ message: 'Item RAB berhasil ditambahkan', data }, { status: 201 });
});
