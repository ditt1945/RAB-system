import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { fail, ok, readJson, validationFailed, withUser } from '@/lib/api';
import { changePasswordSchema, profileSchema } from '@/lib/validation/schemas';

const select = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  profileSettings: { select: { role: true, phoneNumber: true, department: true } },
};

export const GET = withUser(async (_req, _ctx, user) => {
  const data = await prisma.user.findUnique({ where: { id: user.id }, select });
  return ok({ data });
});

// Ubah profil. Role TIDAK bisa diubah dari sini.
export const PUT = withUser(async (req, _ctx, user) => {
  const parsed = profileSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationFailed(parsed.error);
  const { name, email, phoneNumber, department } = parsed.data;

  const owner = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (owner && owner.id !== user.id) {
    return fail('Email sudah dipakai akun lain', 409, { fields: { email: ['Email sudah dipakai akun lain'] } });
  }

  const data = await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      email,
      profileSettings: {
        upsert: {
          create: { phoneNumber, department },
          update: { phoneNumber, department },
        },
      },
    },
    select,
  });
  return ok({ message: 'Profil berhasil diperbarui', data });
});

// Ganti password
export const PATCH = withUser(async (req, _ctx, user) => {
  const parsed = changePasswordSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationFailed(parsed.error);

  const current = await prisma.user.findUnique({ where: { id: user.id }, select: { password: true } });
  if (!(await bcrypt.compare(parsed.data.currentPassword, current.password))) {
    return fail('Kata sandi lama salah', 422, { fields: { currentPassword: ['Kata sandi lama salah'] } });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(parsed.data.newPassword, 12) },
  });
  return ok({ message: 'Kata sandi berhasil diubah' });
});
