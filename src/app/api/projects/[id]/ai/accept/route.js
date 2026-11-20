import { prisma } from '@/lib/prisma';
import { fail, ok, parseId, readJson, validationFailed, withUser } from '@/lib/api';
import { buildRabItemData, findOwnedProject, nextSortOrder } from '@/lib/rab-data';
import { aiAcceptSchema } from '@/lib/validation/schemas';

// Masukkan saran AI yang dipilih pengguna ke RAB.
// Body: { requestId, items: [{ ahspId, volume }] }
export const POST = withUser(async (req, { params }, user) => {
  const project = await findOwnedProject(parseId(params.id), user.id);
  if (!project) return fail('Proyek tidak ditemukan', 404);

  const parsed = aiAcceptSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationFailed(parsed.error);

  const aiRequest = await prisma.aiRequest.findFirst({
    where: { id: BigInt(parsed.data.requestId), projectId: project.id, userId: user.id, status: 'completed' },
  });
  if (!aiRequest) return fail('Permintaan AI tidak ditemukan', 404);

  // Hanya AHSP yang memang disarankan di permintaan ini yang boleh dimasukkan
  const suggested = new Set((aiRequest.suggestions?.items ?? []).map((s) => String(s.ahspId)));
  const rows = [];
  for (const choice of parsed.data.items) {
    if (!suggested.has(choice.ahspId)) return fail('Ada item yang bukan bagian dari saran AI ini', 422);
    const built = await buildRabItemData({ ahspId: choice.ahspId, volume: choice.volume });
    if (built.error) return fail(built.error, 422);
    rows.push(built.data);
  }

  let sortOrder = await nextSortOrder(project.id);
  await prisma.$transaction([
    prisma.rabItem.createMany({ data: rows.map((row) => ({ ...row, projectId: project.id, sortOrder: sortOrder++ })) }),
    prisma.aiRequest.update({ where: { id: aiRequest.id }, data: { acceptedAt: new Date() } }),
  ]);

  return ok({ message: `${rows.length} item dari saran AI ditambahkan ke RAB` }, { status: 201 });
});
