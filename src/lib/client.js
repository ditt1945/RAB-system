// Helper fetch untuk komponen client. Selalu cek res.ok dan kembalikan pesan error yang jelas.

/**
 * @returns {Promise<{ ok: boolean, status: number, data: any, error: string | null, fields: Record<string, string[]> }>}
 */
export async function api(url, { method = 'GET', body } = {}) {
  try {
    const res = await fetch(url, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data: null,
        error: payload.error || `Permintaan gagal (${res.status})`,
        fields: payload.fields || {},
      };
    }
    return { ok: true, status: res.status, data: payload, error: null, fields: {} };
  } catch {
    return { ok: false, status: 0, data: null, error: 'Tidak bisa terhubung ke server. Periksa koneksi.', fields: {} };
  }
}
