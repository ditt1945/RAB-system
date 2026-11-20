import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { fail, ok, readJson, validationFailed } from '@/lib/api';
import { registerSchema } from '@/lib/validation/schemas';

// Pendaftaran mandiri selalu mendapat role estimator.
export async function POST(req) {
  try {
    const parsed = registerSchema.safeParse(await readJson(req));
    if (!parsed.success) return validationFailed(parsed.error);

    const { name, email, password } = parsed.data;
    if (await prisma.user.findUnique({ where: { email } })) {
      return fail('Email sudah terdaftar', 409, { fields: { email: ['Email sudah terdaftar'] } });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await hash(password, 12),
        profileSettings: { create: { role: 'estimator' } },
      },
      select: { id: true, name: true, email: true },
    });
    return ok({ message: 'Akun berhasil dibuat', data: user }, { status: 201 });
  } catch (error) {
    console.error('[API register]', error);
    return fail('Registrasi gagal, coba lagi', 500);
  }
}
