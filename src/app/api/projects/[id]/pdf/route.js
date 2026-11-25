import { fail, parseId, withUser } from '@/lib/api';
import { loadProjectRab } from '@/lib/rab-data';
import { generateRabPdfBuffer } from '@/lib/pdf/rabDocument';
import { fetchLogo } from '@/lib/pdf/logo';

export const runtime = 'nodejs';

// GET /api/projects/:id/pdf                       → tampil di browser
// GET /api/projects/:id/pdf?download=1            → unduh file
// &version=client   → untuk klien: RAB + rekap saja
// &version=internal → untuk internal (bawaan): ditambah lampiran kebutuhan material & komposisi biaya
export const GET = withUser(async (req, { params }, user) => {
  const rab = await loadProjectRab(parseId(params.id), user.id);
  if (!rab) return fail('Proyek tidak ditemukan', 404);
  if (rab.items.length === 0) return fail('RAB masih kosong, tambahkan item terlebih dahulu', 422);

  const searchParams = new URL(req.url).searchParams;
  const version = searchParams.get('version') === 'client' ? 'client' : 'internal';
  const logo = await fetchLogo(rab.company?.logoUrl);
  const buffer = await generateRabPdfBuffer({
    ...rab,
    logo,
    materials: version === 'internal' ? rab.materials : null,
    composition: version === 'internal' ? rab.composition : null,
  });
  const slug = rab.project.projectName.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 60) || 'proyek';
  const filename = `RAB_${slug}${version === 'client' ? '_klien' : ''}_${new Date().toISOString().slice(0, 10)}.pdf`;
  const download = searchParams.get('download') === '1';

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
});
