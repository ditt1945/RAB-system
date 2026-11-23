// Pembatas percobaan sederhana di memori server (cukup untuk satu server / demo).
// Contoh: login maksimal 10 kali gagal per 15 menit per email.
const buckets = new Map();

/**
 * Catat satu percobaan untuk `key`. Mengembalikan true kalau masih boleh, false kalau sudah melewati batas.
 * @param {string} key
 * @param {{ limit: number, windowMs: number }} options
 */
export function hit(key, { limit, windowMs }) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    cleanup(now);
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

/** Hapus catatan untuk `key` (mis. setelah login berhasil). */
export function reset(key) {
  buckets.delete(key);
}

function cleanup(now) {
  if (buckets.size < 1000) return;
  for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
}

/** IP pengirim request (di belakang proxy memakai x-forwarded-for). */
export function clientIp(req) {
  const forwarded = req.headers.get?.('x-forwarded-for') ?? req.headers?.['x-forwarded-for'];
  return String(forwarded ?? '').split(',')[0].trim() || 'local';
}
