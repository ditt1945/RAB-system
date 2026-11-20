import { fail, ok, parseId, withUser } from '@/lib/api';
import { loadProjectRab } from '@/lib/rab-data';

export const GET = withUser(async (_req, { params }, user) => {
  const rab = await loadProjectRab(parseId(params.id), user.id);
  if (!rab) return fail('Proyek tidak ditemukan', 404);
  return ok({ data: rab.summary });
});
