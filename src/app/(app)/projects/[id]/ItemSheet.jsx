'use client';

import { useMemo, useRef, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { calculateRabItemSubtotal } from '@/lib/calculations/rab';
import { rupiah } from '@/lib/format';
import { Alert, buttonClass, Field, inputClass } from '@/components/ui';
import { MoneyInput } from '@/components/inputs';
import { Sheet } from '@/components/overlay';

const EMPTY_MANUAL = { name: '', unit: '', unitPrice: '', volume: '' };

/**
 * Panel tambah / ubah satu item RAB.
 * - mode 'add': pilih dari katalog AHSP atau isi item manual, kelompok bisa sudah terisi.
 * - mode 'edit': ubah volume, kelompok, dan (untuk item manual) uraian, satuan, harga.
 * onSubmit(body) mengembalikan { ok, error, fields } dari API.
 */
export default function ItemSheet({ open, mode, item, presetGroup, catalog, groupNames, onClose, onSubmit, onDelete }) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={mode === 'edit' ? 'Ubah item pekerjaan' : 'Tambah pekerjaan'}
      description={mode === 'edit' ? item?.name : presetGroup ? `Ke kelompok "${presetGroup}"` : 'Pilih dari katalog AHSP atau isi item manual.'}
    >
      {open && (
        <ItemForm
          key={`${mode}-${item?.id ?? presetGroup ?? 'new'}`}
          mode={mode}
          item={item}
          presetGroup={presetGroup}
          catalog={catalog}
          groupNames={groupNames}
          onClose={onClose}
          onSubmit={onSubmit}
          onDelete={onDelete}
        />
      )}
    </Sheet>
  );
}

function ItemForm({ mode, item, presetGroup, catalog, groupNames, onClose, onSubmit, onDelete }) {
  const isEdit = mode === 'edit';
  const [tab, setTab] = useState(catalog.length > 0 ? 'ahsp' : 'manual');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [volume, setVolume] = useState(isEdit ? String(item.volume) : '');
  const [groupName, setGroupName] = useState(isEdit ? item.groupName : (presetGroup ?? ''));
  const [manual, setManual] = useState(isEdit ? { name: item.name, unit: item.unit, unitPrice: String(item.unitPrice) } : EMPTY_MANUAL);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const volumeRef = useRef(null);

  const isAhsp = isEdit ? Boolean(item.ahspId) : tab === 'ahsp';
  const unitPrice = isEdit ? (item.ahspId ? item.unitPrice : manual.unitPrice) : isAhsp ? selected?.unitPrice : manual.unitPrice;
  const unit = isEdit ? (item.ahspId ? item.unit : manual.unit) : isAhsp ? selected?.unit : manual.unit;
  const preview = volume !== '' && unitPrice !== '' && unitPrice != null ? calculateRabItemSubtotal(volume.replace(',', '.'), unitPrice) : null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? catalog.filter((a) => `${a.code} ${a.name} ${a.categoryName}`.toLowerCase().includes(q)) : catalog;
  }, [catalog, query]);

  const choose = (ahsp) => {
    setSelected(ahsp);
    setError(null);
    requestAnimationFrame(() => volumeRef.current?.focus());
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setErrors({});
    if (!isEdit && isAhsp && !selected) return setError('Pilih pekerjaan dari katalog dulu');
    const vol = volume.replace(',', '.');
    const body = isEdit
      ? { ahspId: item.ahspId, volume: vol, groupName, ...(item.ahspId ? {} : manual) }
      : isAhsp
        ? { ahspId: selected.id, volume: vol, groupName }
        : { ...manual, volume: vol, groupName };
    setSaving(true);
    const res = await onSubmit(body);
    setSaving(false);
    if (!res.ok) {
      setError(res.error);
      setErrors(res.fields ?? {});
      return;
    }
    onClose();
  };

  const tabButton = (value, label) => (
    <button
      type="button"
      onClick={() => {
        setTab(value);
        setError(null);
        setErrors({});
      }}
      aria-pressed={tab === value}
      className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${tab === value ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
    >
      {label}
    </button>
  );

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {!isEdit && (
        <div className="flex rounded-lg bg-slate-100 p-1">
          {tabButton('ahsp', 'Dari katalog AHSP')}
          {tabButton('manual', 'Item manual')}
        </div>
      )}
      <Alert>{error}</Alert>

      {!isEdit && isAhsp && (
        <div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              className={`${inputClass} pl-9`}
              placeholder="Cari kode atau nama pekerjaan (galian, bata, beton…)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Cari AHSP"
              autoFocus
            />
          </div>
          <ul className="mt-2 max-h-64 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200" aria-label="Katalog AHSP">
            {filtered.length === 0 && <li className="px-3 py-4 text-center text-sm text-slate-500">Tidak ada AHSP yang cocok</li>}
            {filtered.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  aria-pressed={selected?.id === a.id}
                  onClick={() => choose(a)}
                  className={`flex w-full items-start justify-between gap-3 px-3 py-2.5 text-left text-sm transition ${
                    selected?.id === a.id ? 'bg-brand-50 ring-1 ring-inset ring-brand-300' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block text-slate-900">{a.name}</span>
                    <span className="text-xs text-slate-500">
                      {a.code} · {a.categoryName}
                    </span>
                  </span>
                  <span className="whitespace-nowrap text-xs font-medium tabular-nums text-slate-700">
                    {rupiah(a.unitPrice)}/{a.unit}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isEdit && item.ahspId && (
        <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
          <p className="text-slate-900">{item.name}</p>
          <p className="text-xs text-slate-500">
            AHSP {item.code} · {rupiah(item.unitPrice)}/{item.unit} (harga dikunci saat ditambahkan)
          </p>
        </div>
      )}

      {!isAhsp && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Uraian pekerjaan" required error={errors.name} className="col-span-2">
            <input className={inputClass} value={manual.name} onChange={(e) => setManual({ ...manual, name: e.target.value })} placeholder="Mobilisasi & demobilisasi alat" />
          </Field>
          <Field label="Satuan" required error={errors.unit}>
            <input className={inputClass} value={manual.unit} onChange={(e) => setManual({ ...manual, unit: e.target.value })} placeholder="ls, m2, unit" />
          </Field>
          <Field label="Harga satuan" required error={errors.unitPrice}>
            <MoneyInput value={manual.unitPrice} onChange={(v) => setManual({ ...manual, unitPrice: v })} />
          </Field>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label={`Volume${unit ? ` (${unit})` : ''}`} required error={errors.volume}>
          <input
            ref={volumeRef}
            inputMode="decimal"
            className={`${inputClass} text-right tabular-nums`}
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            placeholder="0"
          />
        </Field>
        <Field label="Kelompok" hint={isAhsp && !isEdit ? 'Kosongkan = kategori AHSP' : 'Kosongkan = Lain-lain'}>
          <input className={inputClass} value={groupName} onChange={(e) => setGroupName(e.target.value)} list="rab-groups" />
          <datalist id="rab-groups">
            {groupNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </Field>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-navy-50 px-4 py-3">
        <span className="text-sm text-navy-800">Jumlah</span>
        <span className="text-lg font-semibold tabular-nums text-navy-900">{preview != null ? rupiah(preview) : 'Rp –'}</span>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2">
        {isEdit && onDelete ? (
          <button type="button" onClick={() => onDelete(item)} className={`${buttonClass.ghost} gap-1.5 px-2 text-red-700 hover:bg-red-50 hover:text-red-800`}>
            <Trash2 className="h-4 w-4" /> Hapus item
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className={buttonClass.secondary}>
            Batal
          </button>
          <button type="submit" disabled={saving} className={buttonClass.primary}>
            {saving ? 'Menyimpan…' : isEdit ? 'Simpan' : 'Tambahkan ke RAB'}
          </button>
        </div>
      </div>
    </form>
  );
}
