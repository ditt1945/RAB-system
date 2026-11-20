// Rekomendasi AI berbasis katalog AHSP.
// AI hanya memilih KODE AHSP + perkiraan volume. Harga selalu dihitung server dari AHSP.
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

export class AiConfigError extends Error {}

const responseSchema = z.object({
  items: z
    .array(
      z.object({
        ahspCode: z.string(),
        volume: z.coerce.number().min(0).catch(0),
        reason: z.string().catch(''),
      }),
    )
    .catch([]),
  outOfCatalog: z
    .array(z.object({ name: z.string(), unit: z.string().catch(''), note: z.string().catch('') }))
    .catch([]),
  notes: z.string().catch(''),
});

const SYSTEM_PROMPT = `Kamu asisten estimator RAB untuk kontraktor di Indonesia.
Tugas: dari deskripsi proyek, pilih item pekerjaan yang dibutuhkan HANYA dari katalog AHSP yang diberikan, lalu perkirakan volumenya.
Aturan:
- "ahspCode" WAJIB persis sama dengan kode di katalog. Jangan mengarang kode.
- Volume dalam satuan AHSP tersebut, berupa angka. Jika data kurang, beri perkiraan wajar dan sebutkan asumsinya di "reason".
- Pekerjaan/material penting yang tidak ada di katalog masukkan ke "outOfCatalog" (tanpa harga).
- Jangan memberi harga. Jawab dalam bahasa Indonesia.
- Hanya bantu topik RAB dan konstruksi.
Balas JSON saja dengan bentuk:
{"items":[{"ahspCode":"string","volume":number,"reason":"string"}],"outOfCatalog":[{"name":"string","unit":"string","note":"string"}],"notes":"string"}`;

/**
 * @param {{ prompt: string, project: { projectName: string, location?: string|null, description?: string|null }, catalog: Array<{ code: string, name: string, unit: string, categoryName: string }> }} input
 */
export async function requestAhspSuggestions({ prompt, project, catalog }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new AiConfigError('Fitur AI belum aktif: GEMINI_API_KEY belum diisi di file .env');

  const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
    // Alias "latest" selalu mengarah ke model Flash terbaru, jadi tidak rusak saat versi lama dipensiunkan
    model: process.env.GEMINI_MODEL || 'gemini-flash-latest',
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
  });

  const catalogText = catalog.map((a) => `${a.code} | ${a.name} | ${a.unit} | ${a.categoryName}`).join('\n');
  const userMessage = [
    `Proyek: ${project.projectName}`,
    project.location ? `Lokasi: ${project.location}` : '',
    project.description ? `Keterangan proyek: ${project.description}` : '',
    `Kebutuhan dari pengguna: ${prompt}`,
    '',
    'Katalog AHSP (kode | nama | satuan | kategori):',
    catalogText,
  ]
    .filter(Boolean)
    .join('\n');

  const result = await model.generateContent(userMessage);
  const raw = result.response
    .text()
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');

  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error('Balasan AI bukan JSON yang valid');
  }
  return responseSchema.parse(json);
}
