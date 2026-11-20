import { prisma } from '@/lib/prisma';
import { ok, readJson, validationFailed, withUser } from '@/lib/api';
import { companySchema } from '@/lib/validation/schemas';

export const GET = withUser(async (_req, _ctx, user) => {
  const data = await prisma.companySettings.findUnique({ where: { ownerId: user.id } });
  return ok({ data });
});

export const PUT = withUser(async (req, _ctx, user) => {
  const parsed = companySchema.safeParse(await readJson(req));
  if (!parsed.success) return validationFailed(parsed.error);

  const data = await prisma.companySettings.upsert({
    where: { ownerId: user.id },
    create: { ownerId: user.id, ...parsed.data },
    update: parsed.data,
  });
  return ok({ message: 'Data perusahaan berhasil disimpan', data });
});
