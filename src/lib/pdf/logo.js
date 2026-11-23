// Ambil logo perusahaan untuk kop PDF dengan aman.
// URL berasal dari pengguna, jadi dibatasi: hanya https ke domain publik, maksimal 1 MB,
// hanya PNG/JPEG, dan batas waktu 4 detik. Gagal = PDF tetap dibuat tanpa logo.
const MAX_BYTES = 1024 * 1024;
const PRIVATE_HOST = /^(localhost|.*\.local|.*\.internal|\d{1,3}(\.\d{1,3}){3}|\[.*\])$/i;

export async function fetchLogo(logoUrl) {
  if (!logoUrl) return null;
  let url;
  try {
    url = new URL(logoUrl);
  } catch {
    return null;
  }
  // Tolak alamat IP langsung dan nama host lokal supaya server tidak dipakai mengakses jaringan internal
  if (url.protocol !== 'https:' || PRIVATE_HOST.test(url.hostname)) return null;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000), redirect: 'error' });
    const type = res.headers.get('content-type') ?? '';
    if (!res.ok || !/^image\/(png|jpe?g)/i.test(type)) return null;
    if (Number(res.headers.get('content-length') ?? 0) > MAX_BYTES) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    return buffer.length > 0 && buffer.length <= MAX_BYTES ? buffer : null;
  } catch {
    return null;
  }
}
