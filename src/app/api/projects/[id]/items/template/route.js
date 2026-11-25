import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { fail, ok, parseId, readJson, validationFailed, withUser } from '@/lib/api';
import { buildRabItemData, findOwnedProject, nextSortOrder } from '@/lib/rab-data';
import { findTemplate } from '@/lib/templates';

const schema = z.object({ key: z.string().min(1).max(50) });

// Tambahkan semua pekerjaan dari satu template RAB (harga tetap dihitung dari AHSP).
export const POST = withUser(async (req, { params }, user) => {
  const project = await findOwnedProject(parseId(params.id), user.id);
  if (!project) return fail('Proyek tidak ditemukan', 404);

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return validationFailed(parsed.error);
  const template = findTemplate(parsed.data.key);
  if (!template) return fail('Template tidak ditemukan', 404);

  const codes = template.items.map(([code]) => code);
  const ahspByCode = new Map(
    (await prisma.ahsp.findMany({ where: { code: { in: codes }, isActive: true }, select: { id: true, code: true } })).map((a) => [a.code, a.id]),
  );

  const rows = [];
  for (const [code, volume] of template.items) {
    const ahspId = ahspByCode.get(code);
    if (!ahspId) continue;
    const built = await buildRabItemData({ ahspId: ahspId.toString(), volume });
    if (!built.error) rows.push(built.data);
  }
  if (rows.length === 0) return fail('Pekerjaan pada template ini belum ada di katalog AHSP', 422);

  await prisma.$transaction(async (tx) => {
    let sortOrder = await nextSortOrder(project.id, tx);
    await tx.rabItem.createMany({ data: rows.map((row) => ({ ...row, projectId: project.id, sortOrder: sortOrder++ })) });
  });

  const skipped = template.items.length - rows.length;
  return ok(
    {
      message: `${rows.length} pekerjaan dari template "${template.name}" ditambahkan${skipped ? ` (${skipped} dilewati karena tidak ada di katalog)` : ''}. Sesuaikan volumenya.`,
    },
    { status: 201 },
  );
});
