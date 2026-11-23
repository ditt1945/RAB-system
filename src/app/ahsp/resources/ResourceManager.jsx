'use client';

import { Fragment, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { api } from '@/lib/client';
import { rupiah, RESOURCE_TYPE_LABEL, tanggal } from '@/lib/format';
import { Alert, buttonClass, Card, inputClass } from '@/components/ui';

const EMPTY = { code: '', name: '', type: 'bahan', unit: '', unitPrice: '', source: '', effectiveDate: '', isActive: true };
const TYPES = ['upah', 'bahan', 'alat'];

export default function ResourceManager({ resources, canEdit }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(null); // { id | 'new', ...fields }
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);
  const working = busy || pending;

  const cancel = () => {
    setEditing(null);
    setError(null);
  };

  const startEdit = (r) => setEditing({ ...EMPTY, ...r, effectiveDate: r.effectiveDate?.slice(0, 10) ?? '', source: r.source ?? '' });
  const field = (key) => (e) => setEditing((v) => ({ ...v, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const save = async () => {
    if (working) return;
    const isNew = editing.id === 'new';
    const { id, _count, createdAt, updatedAt, ...body } = editing;
    setBusy(true);
    const res = await api(isNew ? '/api/resources' : `/api/resources/${id}`, { method: isNew ? 'POST' : 'PUT', body });
    setBusy(false);
    if (!res.ok) return setError(Object.values(res.fields)[0]?.[0] ?? res.error);
    setEditing(null);
    setError(null);
    setMessage(res.data.message);
    startTransition(() => router.refresh());
  };

  const remove = async (r) => {
    if (working || !window.confirm(`Hapus "${r.name}"?`)) return;
    setBusy(true);
    const res = await api(`/api/resources/${r.id}`, { method: 'DELETE' });
    setBusy(false);
    if (!res.ok) return setError(res.error);
    setError(null);
    setMessage(res.data.message);
    startTransition(() => router.refresh());
  };

  const editRow = (
    <tr className="bg-cyan-500/5">
      <td className="px-3 py-2">
        <input className={inputClass} value={editing?.code ?? ''} onChange={field('code')} placeholder="M.20" aria-label="Kode" />
      </td>
      <td className="space-y-1 px-3 py-2">
        <input className={inputClass} value={editing?.name ?? ''} onChange={field('name')} placeholder="Nama" aria-label="Nama" />
        <input className={inputClass} value={editing?.source ?? ''} onChange={field('source')} placeholder="Sumber harga (opsional)" aria-label="Sumber harga" />
      </td>
      <td className="px-3 py-2">
        <select className={inputClass} value={editing?.type} onChange={field('type')} aria-label="Jenis">
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {RESOURCE_TYPE_LABEL[t]}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2">
        <input className={inputClass} value={editing?.unit ?? ''} onChange={field('unit')} placeholder="kg" aria-label="Satuan" />
      </td>
      <td className="space-y-1 px-3 py-2">
        <input type="number" min={0} className={`${inputClass} text-right`} value={editing?.unitPrice ?? ''} onChange={field('unitPrice')} aria-label="Harga" />
        <input type="date" className={inputClass} value={editing?.effectiveDate ?? ''} onChange={field('effectiveDate')} aria-label="Tanggal berlaku" />
      </td>
      <td className="px-3 py-2 text-center">
        <input type="checkbox" checked={!!editing?.isActive} onChange={field('isActive')} className="accent-cyan-500" aria-label="Aktif" />
      </td>
      <td className="px-3 py-2">
        <div className="flex justify-end gap-1">
          <button type="button" onClick={save} disabled={working} className={buttonClass.ghost} title="Simpan" aria-label="Simpan">
            <Check className="h-4 w-4 text-emerald-400" />
          </button>
          <button type="button" onClick={cancel} className={buttonClass.ghost} title="Batal" aria-label="Batal">
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
          <button type="button" onClick={() => setEditing({ ...EMPTY, id: 'new' })} className={buttonClass.primary}>
            <Plus className="h-4 w-4" /> Tambah
          </button>
        )
      }
    >
      <div className="space-y-4">
        <Alert>{error}</Alert>
        {message && !error && <Alert type="success">{message}</Alert>}
        <div className="-mx-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-y border-slate-800 text-left text-xs text-slate-400">
              <tr>
                <th className="w-28 px-3 py-2 font-medium">Kode</th>
                <th className="px-3 py-2 font-medium">Nama</th>
                <th className="w-28 px-3 py-2 font-medium">Jenis</th>
                <th className="w-24 px-3 py-2 font-medium">Satuan</th>
                <th className="w-40 px-3 py-2 text-right font-medium">Harga</th>
                <th className="w-16 px-3 py-2 text-center font-medium">Aktif</th>
                <th className="w-24 px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {editing?.id === 'new' && editRow}
              {TYPES.map((type) => (
                <Fragment key={type}>
                  <tr className="bg-slate-800/40">
                    <td colSpan={7} className="px-3 py-2 text-xs font-semibold uppercase text-cyan-300">
                      {RESOURCE_TYPE_LABEL[type]}
                    </td>
                  </tr>
                  {resources
                    .filter((r) => r.type === type)
                    .map((r) =>
                      editing?.id === r.id ? (
                        <Fragment key={r.id}>{editRow}</Fragment>
                      ) : (
                        <tr key={r.id} className={r.isActive ? '' : 'opacity-50'}>
                          <td className="px-3 py-2 font-mono text-xs text-slate-400">{r.code}</td>
                          <td className="px-3 py-2">
                            <p className="text-slate-100">{r.name}</p>
                            <p className="text-[11px] text-slate-500">
                              {r.source || 'Sumber tidak dicatat'}
                              {r.effectiveDate ? ` · berlaku ${tanggal(r.effectiveDate)}` : ''} · dipakai {r._count.components} AHSP
                            </p>
                          </td>
                          <td className="px-3 py-2 text-slate-300">{RESOURCE_TYPE_LABEL[r.type]}</td>
                          <td className="px-3 py-2 text-slate-300">{r.unit}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-white">{rupiah(r.unitPrice)}</td>
                          <td className="px-3 py-2 text-center text-xs">{r.isActive ? 'Ya' : 'Tidak'}</td>
                          <td className="px-3 py-2">
                            {canEdit && (
                              <div className="flex justify-end gap-1">
                                <button type="button" onClick={() => { setError(null); startEdit(r); }} disabled={working} className={buttonClass.ghost} title="Edit" aria-label={`Edit ${r.name}`}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button type="button" onClick={() => remove(r)} disabled={working} className={buttonClass.ghost} title="Hapus" aria-label={`Hapus ${r.name}`}>
                                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ),
                    )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
