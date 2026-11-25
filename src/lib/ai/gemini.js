// Rekomendasi AI berbasis katalog AHSP.
// AI hanya memilih KODE AHSP + perkiraan volume. Harga selalu dihitung server dari AHSP,
// dan kebutuhan material dihitung dari koefisien bahan AHSP × volume.
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

export class AiConfigError extends Error {}
/** Layanan AI sedang penuh/sibuk (HTTP 429/503) walaupun sudah dicoba ulang. */
export class AiBusyError extends Error {}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isTimeout = (error) => error?.name === 'AbortError' || /timeout|aborted/i.test(String(error?.message));
// Sibuk (429/5xx) atau koneksi terputus ("fetch failed", ECONNRESET, ...): layak dicoba ulang / dialihkan ke model cadangan
const isBusy = (error) =>
  [429, 500, 502, 503, 504].includes(error?.status) || /fetch failed|ECONNRESET|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|socket hang up/i.test(String(error?.message));

/** Panggil satu model; kalau sibuk atau koneksi terputus, coba sekali lagi setelah jeda singkat. */
async function generateWithRetry(model, message) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await model.generateContent(message);
    } catch (error) {
      if (isTimeout(error)) throw new AiBusyError('Layanan AI terlalu lama merespons. Coba lagi beberapa saat lagi.');
      if (!isBusy(error)) throw error;
      if (attempt >= 1) throw new AiBusyError('Layanan AI sedang sibuk. Coba lagi beberapa saat lagi.');
      await sleep(1500);
    }
  }
}

/**
 * Coba model utama dulu; kalau sedang penuh, pakai model cadangan yang lebih ringan.
 * Model Gemini kadang "high demand" untuk sementara, jadi cadangan membuat fitur AI tetap jalan.
 */
// Kalau model utama baru saja penuh, 5 menit berikutnya langsung pakai model cadangan
// supaya pengguna tidak menunggu model utama gagal lagi.
const BUSY_MEMORY_MS = 5 * 60 * 1000;
const busyUntil = new Map();

async function generateWithFallback(genAI, message) {
  const primary = process.env.GEMINI_MODEL || 'gemini-flash-latest';
  const fallback = process.env.GEMINI_FALLBACK_MODEL || 'gemini-flash-lite-latest';
  const candidates = primary === fallback ? [primary] : [primary, fallback];
  // Model yang sedang ditandai sibuk dipindah ke urutan terakhir (tetap dicoba kalau yang lain gagal)
  const models = [...candidates].sort((a, b) => Number((busyUntil.get(a) ?? 0) > Date.now()) - Number((busyUntil.get(b) ?? 0) > Date.now()));

  let lastError;
  for (const name of models) {
    const model = genAI.getGenerativeModel(
      {
        model: name,
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
      },
      { timeout: 30_000 }, // batas waktu per percobaan
    );
    try {
      const result = await generateWithRetry(model, message);
      busyUntil.delete(name);
      return result;
    } catch (error) {
      if (!(error instanceof AiBusyError)) throw error;
      console.warn(`[AI] model ${name} sibuk, mencoba model berikutnya`);
      busyUntil.set(name, Date.now() + BUSY_MEMORY_MS);
      lastError = error;
    }
  }
  throw lastError;
}

const itemSchema = z.object({
  ahspCode: z.string().min(1),
  volume: z.coerce.number().min(0).catch(0),
  reason: z.string().catch(''),
});
const outOfCatalogSchema = z.object({ name: z.string().min(1), unit: z.string().catch(''), note: z.string().catch('') });

/** Ambil elemen array yang valid saja, supaya satu saran yang rusak tidak membuang semua saran. */
const validOnly = (schema) =>
  z
    .array(z.unknown())
    .catch([])
    .transform((list) => list.map((value) => schema.safeParse(value)).filter((r) => r.success).map((r) => r.data));

const responseSchema = z.object({
  items: validOnly(itemSchema),
  outOfCatalog: validOnly(outOfCatalogSchema),
  notes: z.string().catch(''),
});

const SYSTEM_PROMPT = `Kamu asisten estimator RAB untuk kontraktor di Indonesia.
Tugas: dari deskripsi proyek, pilih item pekerjaan yang dibutuhkan HANYA dari katalog AHSP yang diberikan, lalu perkirakan volumenya.
Kebutuhan material dihitung sistem dari AHSP yang kamu pilih, jadi fokus memilih pekerjaan dan volume yang tepat.
Aturan:
- "ahspCode" WAJIB persis sama dengan kode di katalog. Jangan mengarang kode.
- Volume dalam satuan AHSP tersebut, berupa angka. Jika data kurang, beri perkiraan wajar dan sebutkan asumsinya di "reason".
- Pekerjaan atau material penting yang tidak ada di katalog masukkan ke "outOfCatalog" (tanpa harga).
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

  // Alias "latest" selalu mengarah ke model terbaru, jadi tidak rusak saat versi lama dipensiunkan
  const genAI = new GoogleGenerativeAI(apiKey);

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

  const result = await generateWithFallback(genAI, userMessage);
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
