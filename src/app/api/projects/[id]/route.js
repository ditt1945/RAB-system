import { prisma } from '@/lib/prisma';
import { fail, ok, parseId, readJson, validationFailed, withUser } from '@/lib/api';
import { findOwnedProject, loadProjectRab } from '@/lib/rab-data';
import { projectSchema } from '@/lib/validation/schemas';

const NOT_FOUND = 'Proyek tidak ditemukan';

export const GET = withUser(async (_req, { params }, user) => {
  const rab = await loadProjectRab(parseId(params.id), user.id);
  if (!rab) return fail(NOT_FOUND, 404);
  return ok({ data: rab });
});

export const PUT = withUser(async (req, { params }, user) => {
  const project = await findOwnedProject(parseId(params.id), user.id);
  if (!project) return fail(NOT_FOUND, 404);

  const parsed = projectSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationFailed(parsed.error);

  const data = await prisma.project.update({ where: { id: project.id }, data: parsed.data });
  return ok({ message: 'Proyek berhasil diperbarui', data });
});

// Item RAB dan riwayat AI ikut terhapus (onDelete: Cascade)
export const DELETE = withUser(async (_req, { params }, user) => {
  const project = await findOwnedProject(parseId(params.id), user.id);
  if (!project) return fail(NOT_FOUND, 404);

  await prisma.project.delete({ where: { id: project.id } });
  return ok({ message: 'Proyek berhasil dihapus' });
});
