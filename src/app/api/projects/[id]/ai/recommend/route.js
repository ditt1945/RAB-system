import { prisma } from '@/lib/prisma';
import { fail, ok, parseId, readJson, validationFailed, withUser } from '@/lib/api';
import { findOwnedProject } from '@/lib/rab-data';
import { listAhsp } from '@/lib/ahsp';
import { AiConfigError, requestAhspSuggestions } from '@/lib/ai/gemini';
import { aiRecommendSchema } from '@/lib/validation/schemas';

// Riwayat 5 permintaan AI terakhir di proyek ini
export const GET = withUser(async (_req, { params }, user) => {
  const project = await findOwnedProject(parseId(params.id), user.id);
  if (!project) return fail('Proyek tidak ditemukan', 404);

  const data = await prisma.aiRequest.findMany({
    where: { projectId: project.id, userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  return ok({ data });
});

export const POST = withUser(async (req, { params }, user) => {
  const project = await findOwnedProject(parseId(params.id), user.id);
  if (!project) return fail('Proyek tidak ditemukan', 404);

  const parsed = aiRecommendSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationFailed(parsed.error);

  const catalog = await listAhsp();
  if (catalog.length === 0) return fail('Katalog AHSP masih kosong. Isi master AHSP dulu.', 422);

  const aiRequest = await prisma.aiRequest.create({
    data: { projectId: project.id, userId: user.id, prompt: parsed.data.prompt, status: 'processing' },
  });

  try {
    const answer = await requestAhspSuggestions({ prompt: parsed.data.prompt, project, catalog });

    // Cocokkan kode dari AI ke katalog; harga dari AHSP, bukan dari AI
    const byCode = new Map(catalog.map((a) => [a.code.toLowerCase(), a]));
    const seen = new Set();
    const items = [];
    const unknown = [];
    for (const suggestion of answer.items) {
      const ahsp = byCode.get(suggestion.ahspCode.trim().toLowerCase());
      if (!ahsp) {
        unknown.push({ name: suggestion.ahspCode, unit: '', note: `Kode tidak ada di katalog. ${suggestion.reason}`.trim() });
        continue;
      }
      if (seen.has(ahsp.id)) continue;
      seen.add(ahsp.id);
      items.push({
        ahspId: ahsp.id,
        code: ahsp.code,
        name: ahsp.name,
        unit: ahsp.unit,
        categoryName: ahsp.categoryName,
        unitPrice: ahsp.unitPrice,
        volume: suggestion.volume,
        reason: suggestion.reason,
      });
    }

    const suggestions = { items, outOfCatalog: [...answer.outOfCatalog, ...unknown], notes: answer.notes };
    const data = await prisma.aiRequest.update({
      where: { id: aiRequest.id },
      data: { status: 'completed', suggestions },
    });
    return ok({ message: `AI menyarankan ${items.length} pekerjaan`, data });
  } catch (error) {
    await prisma.aiRequest.update({
      where: { id: aiRequest.id },
      data: { status: 'failed', error: String(error?.message ?? error).slice(0, 2000) },
    });
    if (error instanceof AiConfigError) return fail(error.message, 503);
    console.error('[AI recommend]', error);
    return fail('Rekomendasi AI gagal diproses. Coba lagi beberapa saat lagi.', 502);
  }
});
