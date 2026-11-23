// Helper bersama untuk API route.
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

/** Ubah BigInt → string, Decimal → number, Date → ISO agar aman dikirim sebagai JSON / props client. */
export function serialize(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'bigint') return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(serialize);
  if (typeof value === 'object') {
    if (value.constructor?.name === 'Decimal' || (typeof value.toFixed === 'function' && 'd' in value && 'e' in value)) {
      return Number(value.toString());
    }
    return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, serialize(val)]));
  }
  return value;
}

export function ok(data, init) {
  return NextResponse.json(serialize(data), init);
}

export function fail(message, status, extra = {}) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function validationFailed(zodError) {
  return fail('Data tidak valid', 422, { fields: zodError.flatten().fieldErrors });
}

/** "12" → 12n; ID tidak valid → null (supaya dibalas 404, bukan 500). */
export function parseId(value) {
  // Dibatasi 18 digit: BigInt MySQL maksimal 9.223.372.036.854.775.807
  return /^\d{1,18}$/.test(String(value ?? '')) ? BigInt(value) : null;
}

export async function readJson(req) {
  return req.json().catch(() => null);
}

/**
 * Bungkus handler API: cek login (401), cek admin (403), tangkap error tak terduga (500).
 * @param {(req: Request, ctx: { params: Record<string,string> }, user: Awaited<ReturnType<typeof getCurrentUser>>) => Promise<Response>} handler
 */
export function withUser(handler, { admin = false } = {}) {
  return async (req, ctx) => {
    try {
      const user = await getCurrentUser();
      if (!user) return fail('Silakan login terlebih dahulu', 401);
      if (admin && !user.isAdmin) return fail('Hanya admin yang boleh melakukan aksi ini', 403);
      const params = ctx?.params ? await ctx.params : {};
      return await handler(req, { params }, user);
    } catch (error) {
      const known = prismaErrorResponse(error);
      if (known) return known;
      console.error(`[API ${req.method} ${new URL(req.url).pathname}]`, error);
      return fail('Terjadi kesalahan pada server', 500);
    }
  };
}

/**
 * Terjemahkan error Prisma yang bisa diduga menjadi balasan yang jelas, atau null.
 * P2002 = data unik bentrok, P2003 = relasi tidak cocok, P2000/P2020 = nilai melebihi ukuran kolom.
 */
export function prismaErrorResponse(error) {
  switch (error?.code) {
    case 'P2002': {
      const target = JSON.stringify(error.meta ?? {});
      if (target.includes('email')) return fail('Email sudah dipakai akun lain', 409, { fields: { email: ['Email sudah dipakai akun lain'] } });
      return fail('Kode sudah dipakai, gunakan kode lain', 409, { fields: { code: ['Kode sudah dipakai'] } });
    }
    case 'P2003':
      return fail('Data terkait tidak ditemukan, atau data ini masih dipakai data lain', 409);
    case 'P2000':
      return fail('Isian terlalu panjang', 422);
    case 'P2020':
      return fail('Angka terlalu besar', 422);
    default:
      return null;
  }
}
