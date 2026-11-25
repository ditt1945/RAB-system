'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, FileDown, LayoutTemplate, ListPlus, Pencil, RefreshCw, SlidersHorizontal, Sparkles, Table2 } from 'lucide-react';
import { api } from '@/lib/client';
import { rupiah, tanggal } from '@/lib/format';
import { buttonClass, Card, StatusBadge } from '@/components/ui';
import { ActionMenu, Sheet } from '@/components/overlay';
import { useToast } from '@/components/toast';
import { downloadPdf } from '@/components/PdfButton';
import { useAppDialogs } from '@/components/AppDialogs';
import ProjectSteps from '@/components/ProjectSteps';
import RabTable from './RabTable';
import RabSummary from './RabSummary';
import QuickAdd from './QuickAdd';
import ItemSheet from './ItemSheet';
import AiSheet from './AiSheet';
import TemplateSheet from './TemplateSheet';

const UNDO_MS = 5000;

/** Body PATCH lengkap untuk satu item (API memvalidasi ulang seluruh field). */
const itemBody = (item, patch = {}) => ({
  ahspId: item.ahspId,
  groupName: item.groupName,
  volume: item.volume,
  ...(item.ahspId ? {} : { name: item.name, unit: item.unit, unitPrice: item.unitPrice }),
  ...patch,
});

/**
 * Halaman kerja "Susun RAB": header & aksi, tabel/kartu item, rekap, dan panel-panel
 * (tambah/ubah item, saran AI, template). Data dibaca server; setelah perubahan halaman di-refresh.
 */
export default function RabWorkspace({ projectId, project, groups, itemCount, summary, composition, ahspBreakdown, catalog, history, templates, children }) {
  const router = useRouter();
  const toast = useToast();
  const dialogs = useAppDialogs();
  const editProject = (openCosts = false) => dialogs.openProject({ project, openCosts });
  const [pending, startTransition] = useTransition();
  const [sheet, setSheet] = useState(null); // { type: 'add'|'edit'|'ai'|'template'|'summary', item?, group? }
  const [hidden, setHidden] = useState(() => new Set()); // item yang sedang menunggu dihapus (bisa dibatalkan)
  const [expanded, setExpanded] = useState(() => new Set());
  const deleteTimers = useRef(new Map());

  const items = groups.flatMap((g) => g.items);
  const groupNames = [...new Set([...groups.map((g) => g.name), ...catalog.map((a) => a.categoryName)])];
  const visibleCount = items.filter((i) => !hidden.has(i.id)).length;
  const isEmpty = visibleCount === 0;
  const refresh = useCallback(() => startTransition(() => router.refresh()), [router]);
  const close = () => setSheet(null);

  // Hapus yang tertunda tetap dikirim kalau pengguna pindah halaman sebelum 5 detik
  useEffect(() => {
    const timers = deleteTimers.current;
    return () => {
      for (const [itemId, timer] of timers) {
        clearTimeout(timer);
        fetch(`/api/projects/${projectId}/items/${itemId}`, { method: 'DELETE', keepalive: true });
      }
    };
  }, [projectId]);

  const fail = (res) => {
    toast.error(Object.values(res.fields ?? {})[0]?.[0] ?? res.error);
    return false;
  };

  const actions = {
    toggle: (id) =>
      setExpanded((set) => {
        const next = new Set(set);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }),
    edit: (item) => setSheet({ type: 'edit', item }),
    addTo: (group) => setSheet({ type: 'add', group }),
    commit: async (item, patch) => {
      const res = await api(`/api/projects/${projectId}/items/${item.id}`, { method: 'PATCH', body: itemBody(item, patch) });
      if (!res.ok) return fail(res);
      refresh();
      return true;
    },
    duplicate: async (item) => {
      const res = await api(`/api/projects/${projectId}/items`, { method: 'POST', body: itemBody(item) });
      if (!res.ok) return fail(res);
      toast(`"${item.name}" diduplikat`);
      refresh();
      return true;
    },
    reprice: async (item) => {
      const res = await api(`/api/projects/${projectId}/items/reprice`, { method: 'POST', body: item ? { itemId: item.id } : {} });
      if (!res.ok) return fail(res);
      toast(res.data.message);
      refresh();
      return true;
    },
    remove: (item) => {
      setSheet(null);
      setHidden((set) => new Set(set).add(item.id));
      const timer = setTimeout(async () => {
        deleteTimers.current.delete(item.id);
        const res = await api(`/api/projects/${projectId}/items/${item.id}`, { method: 'DELETE' });
        if (!res.ok) {
          setHidden((set) => {
            const next = new Set(set);
            next.delete(item.id);
            return next;
          });
          fail(res);
          return;
        }
        refresh();
      }, UNDO_MS);
      deleteTimers.current.set(item.id, timer);
      toast(`"${item.name}" dihapus`, {
        duration: UNDO_MS,
        action: {
          label: 'Batalkan',
          onClick: () => {
            clearTimeout(deleteTimers.current.get(item.id));
            deleteTimers.current.delete(item.id);
            setHidden((set) => {
              const next = new Set(set);
              next.delete(item.id);
              return next;
            });
          },
        },
      });
    },
  };

  const addItem = async (body) => {
    const res = await api(`/api/projects/${projectId}/items`, { method: 'POST', body });
    if (!res.ok) return fail(res);
    toast('Pekerjaan ditambahkan');
    refresh();
    return true;
  };

  const submitSheet = async (body) => {
    const isEdit = sheet?.type === 'edit';
    const res = await api(isEdit ? `/api/projects/${projectId}/items/${sheet.item.id}` : `/api/projects/${projectId}/items`, {
      method: isEdit ? 'PATCH' : 'POST',
      body,
    });
    if (res.ok) {
      toast(isEdit ? 'Item diperbarui' : 'Pekerjaan ditambahkan');
      refresh();
    }
    return res;
  };

  const applyTemplate = async (key) => {
    const res = await api(`/api/projects/${projectId}/items/template`, { method: 'POST', body: { key } });
    if (!res.ok) return fail(res);
    toast(res.data.message);
    refresh();
    return true;
  };

  const pdf = async (version) => {
    try {
      toast('Membuat PDF…', { duration: 2000 });
      await downloadPdf(projectId, version);
      toast('PDF berhasil dibuat');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const moreMenu = [
    { label: 'Ubah data proyek', icon: Pencil, onClick: () => editProject() },
    { label: 'Diskon, jasa, margin, PPN', icon: SlidersHorizontal, onClick: () => editProject(true) },
    { label: 'Tambah dari template', icon: LayoutTemplate, onClick: () => setSheet({ type: 'template' }) },
    items.some((i) => i.ahspId) && { label: 'Perbarui semua harga dari AHSP', icon: RefreshCw, onClick: () => actions.reprice(null) },
    !isEmpty && { label: 'Export PDF untuk klien', icon: FileDown, onClick: () => pdf('client') },
    !isEmpty && { label: 'Export PDF internal (+ lampiran)', icon: FileDown, onClick: () => pdf('internal') },
  ];

  return (
    <>
      {/* ── Header ringkas: jejak halaman + langkah, lalu judul + aksi ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Jejak halaman" className="flex min-w-0 items-center gap-1.5 text-[13px] text-slate-500">
          <Link href="/projects" className="inline-flex items-center gap-1 hover:text-navy-900">
            <ArrowLeft className="h-3.5 w-3.5" /> Proyek
          </Link>
          <span aria-hidden>/</span>
          <span className="truncate text-slate-700">Susun RAB</span>
        </nav>
        <ProjectSteps current="rab" projectId={projectId} hasItems={!isEmpty} onDataClick={() => editProject()} />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-navy-900 sm:text-2xl">{project.projectName}</h1>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-slate-600">
            <StatusBadge status={project.status} />
            <span>{project.clientName}</span>
            {project.location && <span>· {project.location}</span>}
            {project.startDate && <span>· mulai {tanggal(project.startDate)}</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setSheet({ type: 'ai' })} className={buttonClass.secondary}>
            <Sparkles className="h-4 w-4 text-brand-600" /> Saran AI
          </button>
          {!isEmpty && (
            <Link href={`/projects/${projectId}/preview`} className={buttonClass.primary}>
              Lanjut ke preview <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <ActionMenu items={moreMenu} label="Aksi proyek lainnya" buttonClassName={`${buttonClass.secondary} px-2.5`} />
        </div>
      </div>

      {/* ── Isi ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-5">
          <Card bodyClassName="p-0" className={pending ? 'opacity-80 transition-opacity' : ''}>
            <div className="flex flex-col gap-2 border-b border-slate-200 p-3 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <QuickAdd catalog={catalog} onAdd={addItem} />
              </div>
              <button type="button" onClick={() => setSheet({ type: 'add' })} className={`${buttonClass.secondary} shrink-0`}>
                <ListPlus className="h-4 w-4" /> Item manual / lengkap
              </button>
            </div>

            {isEmpty ? (
              <StartOptions onTemplate={() => setSheet({ type: 'template' })} onAi={() => setSheet({ type: 'ai' })} onCatalog={() => setSheet({ type: 'add' })} />
            ) : (
              <RabTable groups={groups} hidden={hidden} expanded={expanded} ahspBreakdown={ahspBreakdown} actions={actions} />
            )}

            {!isEmpty && (
              <p className="hidden border-t border-slate-100 px-4 py-2.5 text-xs text-slate-500 md:block">
                Klik angka volume untuk mengubahnya langsung (Enter simpan, Esc batal). Klik ▸ untuk melihat rincian AHSP. Harga AHSP dikunci saat item ditambahkan.
              </p>
            )}
          </Card>

          {children}
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <h2 className="mb-3 text-sm font-semibold text-navy-900">Rekapitulasi</h2>
            <RabSummary summary={summary} composition={composition} itemCount={visibleCount} projectId={projectId} onEditCosts={() => editProject(true)} />
          </div>
        </aside>
      </div>

      {/* Rekap ringkas untuk layar kecil: selalu terlihat di bawah */}
      <div className="fixed inset-x-0 bottom-[57px] z-30 border-t border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur lg:bottom-0 lg:left-60 xl:hidden print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <button type="button" onClick={() => setSheet({ type: 'summary' })} className="min-w-0 text-left">
            <span className="block text-[11px] text-slate-500">Total akhir · {visibleCount} item · lihat rekap</span>
            <span className="block text-lg font-semibold tabular-nums text-navy-900">{rupiah(summary.grandTotal)}</span>
          </button>
          {!isEmpty && (
            <Link href={`/projects/${projectId}/preview`} className={`${buttonClass.primary} shrink-0`}>
              Preview <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
      <div className="h-16 xl:hidden" aria-hidden />

      {/* ── Panel ──────────────────────────────────────────────── */}
      <ItemSheet
        open={sheet?.type === 'add' || sheet?.type === 'edit'}
        mode={sheet?.type === 'edit' ? 'edit' : 'add'}
        item={sheet?.item}
        presetGroup={sheet?.group}
        catalog={catalog}
        groupNames={groupNames}
        onClose={close}
        onSubmit={submitSheet}
        onDelete={actions.remove}
      />
      <AiSheet
        open={sheet?.type === 'ai'}
        onClose={close}
        projectId={projectId}
        hasCatalog={catalog.length > 0}
        projectDescription={project.description ?? ''}
        existingAhspIds={items.filter((i) => i.ahspId).map((i) => String(i.ahspId))}
        history={history}
        onAccepted={(message) => {
          close();
          toast(message);
          refresh();
        }}
      />
      <TemplateSheet open={sheet?.type === 'template'} onClose={close} templates={templates} hasItems={!isEmpty} onApply={applyTemplate} />
      <Sheet open={sheet?.type === 'summary'} onClose={close} title="Rekapitulasi">
        <RabSummary
          summary={summary}
          composition={composition}
          itemCount={visibleCount}
          projectId={projectId}
          onEditCosts={() => {
            close();
            editProject(true);
          }}
        />
      </Sheet>
    </>
  );
}

/** RAB kosong: tiga cara memulai supaya tidak berhadapan dengan tabel kosong. */
function StartOptions({ onTemplate, onAi, onCatalog }) {
  const options = [
    { icon: LayoutTemplate, title: 'Dari template', text: 'Rumah tipe 36, tipe 45, atau renovasi. Tinggal sesuaikan volume.', onClick: onTemplate },
    { icon: Sparkles, title: 'Minta saran AI', text: 'Ceritakan pekerjaannya, AI menyarankan pekerjaan, volume, dan material.', onClick: onAi },
    { icon: Table2, title: 'Pilih dari katalog', text: 'Cari pekerjaan AHSP satu per satu, atau isi item manual.', onClick: onCatalog },
  ];
  return (
    <div className="p-5 sm:p-8">
      <p className="text-center text-base font-semibold text-navy-900">RAB masih kosong. Mau mulai dari mana?</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {options.map(({ icon: Icon, title, text, onClick }) => (
          <button
            key={title}
            type="button"
            onClick={onClick}
            className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-brand-300 hover:bg-brand-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
          >
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-700">
              <Icon className="h-5 w-5" />
            </span>
            <span className="mt-3 block font-semibold text-navy-900">{title}</span>
            <span className="mt-1 block text-sm text-slate-600">{text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
