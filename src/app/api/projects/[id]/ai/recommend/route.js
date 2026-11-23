import { prisma } from '@/lib/prisma';
import { fail, ok, parseId, readJson, serialize, validationFailed, withUser } from '@/lib/api';
import { findOwnedProject, loadAhspMaterials } from '@/lib/rab-data';
import { listAhsp } from '@/lib/ahsp';
import { AiBusyError, AiConfigError, requestAhspSuggestions } from '@/lib/ai/gemini';
import { clientIp, hit } from '@/lib/rate-limit';
import { aiRecommendSchema } from '@/lib/validation/schemas';

// Riwayat 5 permintaan AI terakhir di proyek ini (tanpa pesan error mentah dari layanan AI)
export const GET = withUser(async (_req, { params }, user) => {
  const project = await findOwnedProject(parseId(params.id), user.id);
  if (!project) return fail('Proyek tidak ditemukan', 404);

  const data = await prisma.aiRequest.findMany({
    where: { projectId: project.id, userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, prompt: true, status: true, suggestions: true, acceptedAt: true, createdAt: true },
  });
  return ok({ data });
});

export const POST = withUser(async (req, { params }, user) => {
  const project = await findOwnedProject(parseId(params.id), user.id);
  if (!project) return fail('Proyek tidak ditemukan', 404);

  // Batasi biaya API: maksimal 20 permintaan AI per jam per pengguna
  if (!hit(`ai:${user.id}:${clientIp(req)}`, { limit: 20, windowMs: 60 * 60 * 1000 })) {
    return fail('Batas permintaan AI tercapai (20 per jam). Coba lagi nanti.', 429);
  }

  const parsed = aiRecommendSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationFailed(parsed.error);

  const catalog = await listAhsp();
  if (catalog.length === 0) return fail('Katalog AHSP masih kosong. Isi master AHSP dulu.', 422);

  const aiRequest = await prisma.aiRequest.create({
    data: { projectId: project.id, userId: user.id, prompt: parsed.data.prompt, status: 'processing' },
  });

  let answer;
  try {
    answer = await requestAhspSuggestions({ prompt: parsed.data.prompt, project, catalog });
  } catch (error) {
    // Detail error hanya ke log server; yang disimpan & ditampilkan cukup pesan umum
    console.error('[AI recommend]', error);
    const config = error instanceof AiConfigError;
    const busy = error instanceof AiBusyError;
    await prisma.aiRequest.update({
      where: { id: aiRequest.id },
      data: { status: 'failed', error: config ? 'AI belum dikonfigurasi' : busy ? 'Layanan AI sedang sibuk' : 'Layanan AI gagal memproses permintaan' },
    });
    if (config || busy) return fail(error.message, 503);
    return fail('Rekomendasi AI gagal diproses. Coba lagi beberapa saat lagi.', 502);
  }

  // Cocokkan kode dari AI ke katalog; harga dari AHSP, bukan dari AI
  const byCode = new Map(catalog.map((a) => [a.code.toLowerCase(), a]));
  const seen = new Set();
  const matched = [];
  const unknown = [];
  for (const suggestion of answer.items) {
    const ahsp = byCode.get(suggestion.ahspCode.trim().toLowerCase());
    if (!ahsp) {
      unknown.push({ name: suggestion.ahspCode, unit: '', note: `Kode tidak ada di katalog. ${suggestion.reason}`.trim() });
      continue;
    }
    if (seen.has(ahsp.id)) continue;
    seen.add(ahsp.id);
    matched.push({ ahsp, suggestion });
  }

  // Material per pekerjaan (koefisien bahan per satuan). Client mengalikan dengan volume yang dipilih.
  const materialsByAhsp = await loadAhspMaterials(matched.map((m) => m.ahsp.id));
  const items = matched.map(({ ahsp, suggestion }) => ({
    ahspId: ahsp.id,
    code: ahsp.code,
    name: ahsp.name,
    unit: ahsp.unit,
    categoryName: ahsp.categoryName,
    unitPrice: ahsp.unitPrice,
    volume: suggestion.volume,
    reason: suggestion.reason,
    materials: (materialsByAhsp.get(ahsp.id) ?? []).map((c) => ({
      resourceId: c.resource.id,
      code: c.resource.code,
      name: c.resource.name,
      unit: c.resource.unit,
      unitPrice: c.resource.unitPrice,
      coefficient: c.coefficient,
    })),
  }));

  const suggestions = { items, outOfCatalog: [...answer.outOfCatalog, ...unknown], notes: answer.notes };
  const data = await prisma.aiRequest.update({
    where: { id: aiRequest.id },
    data: { status: 'completed', suggestions: serialize(suggestions) },
    select: { id: true, prompt: true, status: true, suggestions: true, acceptedAt: true, createdAt: true },
  });
  return ok({ message: `AI menyarankan ${items.length} pekerjaan`, data });
});
