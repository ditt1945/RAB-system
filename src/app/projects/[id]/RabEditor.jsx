'use client';

import { Fragment, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ListPlus, Pencil, RefreshCw, Trash2, X } from 'lucide-react';
import { api } from '@/lib/client';
import { angka, rupiah } from '@/lib/format';
import { calculateRabItemSubtotal } from '@/lib/calculations/rab';
import { Alert, buttonClass, Card, EmptyState, inputClass } from '@/components/ui';
import AddItemForm from './AddItemForm';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export default function RabEditor({ projectId, groups, catalog, hasAhspItems }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(null); // { id, ...fields }
  const [showAdd, setShowAdd] = useState(groups.length === 0);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const groupNames = groups.map((g) => g.name);

  // Pesan sukses hilang sendiri supaya tidak menumpuk di atas tabel
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  const refresh = (msg) => {
    setMessage(msg ?? null);
    setError(null);
    startTransition(() => router.refresh());
  };

  const saveEdit = async () => {
    const res = await api(`/api/projects/${projectId}/items/${editing.id}`, {
      method: 'PATCH',
      body: {
        ahspId: editing.ahspId,
        groupName: editing.groupName,
        volume: editing.volume,
        name: editing.name,
        unit: editing.unit,
        unitPrice: editing.ahspId ? undefined : editing.unitPrice,
      },
    });
    if (!res.ok) return setError(Object.values(res.fields)[0]?.[0] ?? res.error);
    setEditing(null);
    refresh('Item diperbarui');
  };

  const remove = async (item) => {
    if (!window.confirm(`Hapus "${item.name}" dari RAB?`)) return;
    const res = await api(`/api/projects/${projectId}/items/${item.id}`, { method: 'DELETE' });
    if (!res.ok) return setError(res.error);
    refresh('Item dihapus');
  };

  const reprice = async (itemId) => {
    const res = await api(`/api/projects/${projectId}/items/reprice`, { method: 'POST', body: itemId ? { itemId } : {} });
    if (!res.ok) return setError(res.error);
    refresh(res.data.message);
  };

  const editField = (key) => (e) => setEditing((v) => ({ ...v, [key]: e.target.value }));

  // Enter = simpan, Esc = batal saat mengedit baris
  const editKeys = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditing(null);
    }
  };

  return (
    <Card
      title="Rincian pekerjaan"
      description="Jumlah = volume × harga satuan. Harga dari AHSP dikunci saat item ditambahkan; pakai “Perbarui harga” bila harga master berubah."
      actions={
        <>
          {hasAhspItems && (
            <button type="button" onClick={() => reprice()} disabled={pending} className={buttonClass.secondary}>
              <RefreshCw className="h-4 w-4" /> Perbarui harga
            </button>
          )}
          <button type="button" onClick={() => setShowAdd((v) => !v)} className={buttonClass.primary}>
            <ListPlus className="h-4 w-4" /> {showAdd ? 'Tutup form' : 'Tambah item'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <Alert>{error}</Alert>
        {message && !error && <Alert type="success">{message}</Alert>}

        {showAdd && (
          <AddItemForm
            projectId={projectId}
            catalog={catalog}
            groupNames={groupNames}
            onAdded={(msg) => refresh(msg)}
          />
        )}

        {groups.length === 0 ? (
          <EmptyState title="RAB masih kosong" description="Minta saran AI di atas, atau pilih pekerjaan dari katalog AHSP / isi item manual lewat form ini." />
        ) : (
          <div className={`-mx-5 overflow-x-auto ${pending ? 'opacity-60' : ''}`}>
            <table className="w-full min-w-[860px] text-sm">
              <thead className="border-y border-slate-800 bg-slate-900 text-xs text-slate-400">
                <tr>
                  <th className="w-10 px-3 py-2 text-center font-medium">No</th>
                  <th className="px-3 py-2 text-left font-medium">Uraian pekerjaan</th>
                  <th className="w-28 px-3 py-2 text-right font-medium">Volume</th>
                  <th className="w-16 px-3 py-2 text-center font-medium">Sat.</th>
                  <th className="w-36 px-3 py-2 text-right font-medium">Harga satuan</th>
                  <th className="w-36 px-3 py-2 text-right font-medium">Jumlah</th>
                  <th className="w-24 px-3 py-2 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group, gi) => (
                  <Fragment key={group.name}>
                    <tr className="bg-slate-800/40">
                      <td className="px-3 py-2 text-center font-semibold text-cyan-300">{LETTERS[gi] ?? gi + 1}</td>
                      <td colSpan={6} className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-200">
                        {group.name}
                      </td>
                    </tr>
                    {group.items.map((item, i) =>
                      editing?.id === item.id ? (
                        <tr key={item.id} className="border-b border-slate-800 bg-cyan-500/5" onKeyDown={editKeys}>
                          <td className="px-3 py-2 text-center text-slate-500">{i + 1}</td>
                          <td className="space-y-2 px-3 py-2">
                            {item.ahspId ? (
                              <p className="text-slate-200">{item.name}</p>
                            ) : (
                              <input className={inputClass} value={editing.name} onChange={editField('name')} aria-label="Uraian" />
                            )}
                            <input className={inputClass} value={editing.groupName} onChange={editField('groupName')} list="rab-groups" aria-label="Kelompok" placeholder="Kelompok pekerjaan" />
                          </td>
                          <td className="px-3 py-2">
                            <input type="number" min={0} step="any" autoFocus className={`${inputClass} text-right`} value={editing.volume} onChange={editField('volume')} aria-label="Volume" />
                          </td>
                          <td className="px-3 py-2 text-center">
                            {item.ahspId ? item.unit : <input className={inputClass} value={editing.unit} onChange={editField('unit')} aria-label="Satuan" />}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {item.ahspId ? (
                              rupiah(item.unitPrice)
                            ) : (
                              <input type="number" min={0} className={`${inputClass} text-right`} value={editing.unitPrice} onChange={editField('unitPrice')} aria-label="Harga satuan" />
                            )}
                          </td>
                          <td className="px-3 py-2 text-right font-medium tabular-nums text-cyan-200">
                            {rupiah(calculateRabItemSubtotal(editing.volume || 0, (item.ahspId ? item.unitPrice : editing.unitPrice) || 0))}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex justify-end gap-1">
                              <button type="button" onClick={saveEdit} className={buttonClass.ghost} title="Simpan (Enter)">
                                <Check className="h-4 w-4 text-emerald-400" />
                              </button>
                              <button type="button" onClick={() => setEditing(null)} className={buttonClass.ghost} title="Batal (Esc)">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr key={item.id} className="border-b border-slate-800/70 hover:bg-slate-800/20">
                          <td className="px-3 py-2 text-center text-slate-500">{i + 1}</td>
                          <td className="px-3 py-2">
                            <p className="text-slate-100">{item.name}</p>
                            <p className="text-[11px] text-slate-500">{item.ahspId ? `AHSP ${item.code}` : 'Item manual'}</p>
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">{angka(item.volume)}</td>
                          <td className="px-3 py-2 text-center text-slate-400">{item.unit}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{rupiah(item.unitPrice)}</td>
                          <td className="px-3 py-2 text-right font-medium tabular-nums text-white">{rupiah(item.subtotal)}</td>
                          <td className="px-3 py-2">
                            <div className="flex justify-end gap-0.5">
                              {item.ahspId && (
                                <button type="button" onClick={() => reprice(item.id)} className={buttonClass.ghost} title="Perbarui harga dari AHSP">
                                  <RefreshCw className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <button type="button" onClick={() => setEditing({ ...item })} className={buttonClass.ghost} title="Edit">
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button type="button" onClick={() => remove(item)} className={buttonClass.ghost} title="Hapus">
                                <Trash2 className="h-3.5 w-3.5 text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
                    <tr className="border-b border-slate-700">
                      <td colSpan={5} className="px-3 py-2 text-right text-xs text-slate-400">
                        Jumlah {group.name}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold tabular-nums text-slate-100">{rupiah(group.subtotal)}</td>
                      <td />
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <datalist id="rab-groups">
          {groupNames.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </div>
    </Card>
  );
}
