'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { api } from '@/lib/client';
import { Alert, buttonClass, Card, EmptyState, inputClass } from '@/components/ui';
import { useConfirm } from '@/components/overlay';
import { useToast } from '@/components/toast';

const EMPTY = { code: '', name: '', sortOrder: '' };

/** Kelola kategori AHSP (kelompok pekerjaan: persiapan, tanah, pondasi, ...). */
export default function CategoryManager({ categories, canEdit }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(null); // { id | 'new', code, name, sortOrder }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();
  const [confirm, confirmDialog] = useConfirm();
  const working = busy || pending;

  const field = (key) => (e) => setEditing((v) => ({ ...v, [key]: e.target.value }));
  const cancel = () => {
    setEditing(null);
    setError(null);
  };
  const startNew = () => {
    setError(null);
    const next = categories.reduce((max, c) => Math.max(max, c.sortOrder), 0) + 1;
    setEditing({ ...EMPTY, id: 'new', sortOrder: String(next) });
  };

  const done = (msg) => {
    setEditing(null);
    setError(null);
    toast(msg);
    startTransition(() => router.refresh());
  };

  const save = async () => {
    if (working) return;
    const isNew = editing.id === 'new';
    setBusy(true);
    const res = await api(isNew ? '/api/ahsp-categories' : `/api/ahsp-categories/${editing.id}`, {
      method: isNew ? 'POST' : 'PUT',
      body: { code: editing.code, name: editing.name, sortOrder: editing.sortOrder || 0 },
    });
    setBusy(false);
    if (!res.ok) return setError(Object.values(res.fields)[0]?.[0] ?? res.error);
    done(res.data.message);
  };

  const remove = async (category) => {
    if (working) return;
    if (!(await confirm({ title: `Hapus kategori "${category.name}"?` }))) return;
    setBusy(true);
    const res = await api(`/api/ahsp-categories/${category.id}`, { method: 'DELETE' });
    setBusy(false);
    if (!res.ok) return setError(res.error);
    done(res.data.message);
  };

  const keys = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      save();
    } else if (e.key === 'Escape') cancel();
  };

  const editRow = (key) => (
    <tr key={key} className="bg-brand-50/60" onKeyDown={keys}>
      <td className="px-3 py-2">
        <input type="number" min={0} className={`${inputClass} text-right`} value={editing?.sortOrder ?? ''} onChange={field('sortOrder')} aria-label="Urutan" />
      </td>
      <td className="px-3 py-2">
        <input className={inputClass} value={editing?.code ?? ''} onChange={field('code')} placeholder="DIV-07" aria-label="Kode" autoFocus />
      </td>
      <td className="px-3 py-2">
        <input className={inputClass} value={editing?.name ?? ''} onChange={field('name')} placeholder="Pekerjaan Atap" aria-label="Nama kategori" />
      </td>
      <td className="px-3 py-2 text-right text-xs text-slate-500">{editing?._count?.ahsp ?? 0}</td>
      <td className="px-3 py-2">
        <div className="flex justify-end gap-1">
          <button type="button" onClick={save} disabled={working} className={buttonClass.ghost} title="Simpan (Enter)" aria-label="Simpan">
            <Check className="h-4 w-4 text-emerald-600" />
          </button>
          <button type="button" onClick={cancel} className={buttonClass.ghost} title="Batal (Esc)" aria-label="Batal">
            <X className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <Card
      actions={
        canEdit && (
          <button type="button" onClick={startNew} disabled={working} className={buttonClass.primary}>
            <Plus className="h-4 w-4" /> Tambah kategori
          </button>
        )
      }
    >
      <div className="space-y-4">
        <Alert>{error}</Alert>
        {categories.length === 0 && editing?.id !== 'new' ? (
          <EmptyState title="Belum ada kategori" description="Buat kategori dulu (mis. Pekerjaan Persiapan) sebelum menambah AHSP." />
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="border-y border-slate-200 bg-navy-50 text-left text-xs font-semibold uppercase tracking-wide text-navy-800">
                <tr>
                  <th className="w-24 px-3 py-2 text-right font-medium">Urutan</th>
                  <th className="w-36 px-3 py-2 font-medium">Kode</th>
                  <th className="px-3 py-2 font-medium">Nama kategori</th>
                  <th className="w-24 px-3 py-2 text-right font-medium">AHSP</th>
                  <th className="w-24 px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((c) =>
                  editing?.id === c.id ? (
                    editRow(c.id)
                  ) : (
                    <tr key={c.id}>
                      <td className="px-3 py-2 text-right tabular-nums text-slate-600">{c.sortOrder}</td>
                      <td className="px-3 py-2 font-mono text-xs text-slate-600">{c.code}</td>
                      <td className="px-3 py-2 text-slate-900">{c.name}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-slate-700">{c._count.ahsp}</td>
                      <td className="px-3 py-2">
                        {canEdit && (
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setError(null);
                                setEditing({ ...c, sortOrder: String(c.sortOrder) });
                              }}
                              disabled={working}
                              className={buttonClass.ghost}
                              title="Edit"
                              aria-label={`Edit ${c.name}`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(c)}
                              disabled={working || c._count.ahsp > 0}
                              className={buttonClass.ghost}
                              title={c._count.ahsp > 0 ? 'Masih dipakai AHSP' : 'Hapus'}
                              aria-label={`Hapus ${c.name}`}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-600" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ),
                )}
                {editing?.id === 'new' && editRow('new')}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {confirmDialog}
    </Card>
  );
}
