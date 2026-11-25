'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/client';
import { calculateAhspPrice } from '@/lib/calculations/rab';
import { rupiah, RESOURCE_TYPE_LABEL } from '@/lib/format';
import { Alert, buttonClass, Card, Field, inputClass } from '@/components/ui';

/**
 * @param {{ categories: Array, resources: Array, ahsp?: object }} props  ahsp ada = mode edit
 */
export default function AhspForm({ categories, resources, ahsp }) {
  const router = useRouter();
  const isEdit = Boolean(ahsp);
  const [form, setForm] = useState({
    code: ahsp?.code ?? '',
    name: ahsp?.name ?? '',
    unit: ahsp?.unit ?? '',
    categoryId: ahsp?.categoryId ?? categories[0]?.id ?? '',
    overheadPercent: ahsp?.overheadPercent ?? 10,
    description: ahsp?.description ?? '',
    isActive: ahsp?.isActive ?? true,
  });
  const [components, setComponents] = useState(
    ahsp?.components.map((c) => ({ resourceId: c.resourceId, coefficient: c.coefficient })) ?? [{ resourceId: '', coefficient: '' }],
  );
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const resourceById = useMemo(() => new Map(resources.map((r) => [r.id, r])), [resources]);
  const preview = useMemo(
    () =>
      calculateAhspPrice({
        overheadPercent: form.overheadPercent,
        components: components
          .filter((c) => resourceById.has(c.resourceId) && Number(c.coefficient) > 0)
          .map((c) => ({ coefficient: c.coefficient, resource: resourceById.get(c.resourceId) })),
      }),
    [components, form.overheadPercent, resourceById],
  );

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const setComponent = (index, patch) => setComponents((list) => list.map((c, i) => (i === index ? { ...c, ...patch } : c)));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await api(isEdit ? `/api/ahsp/${ahsp.id}` : '/api/ahsp', {
      method: isEdit ? 'PUT' : 'POST',
      body: { ...form, components: components.filter((c) => c.resourceId) },
    });
    if (!res.ok) {
      setSaving(false);
      setError(res.fields.components?.[0] ?? res.error);
      setErrors(res.fields);
      return;
    }
    // saving dibiarkan true sampai pindah halaman, supaya tombol tidak bisa diklik dua kali
    router.push(`/ahsp/${isEdit ? ahsp.id : res.data.data.id}`);
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      {categories.length === 0 && (
        <Alert type="warning">
          Belum ada kategori pekerjaan.{' '}
          <Link href="/ahsp/categories" className="font-semibold underline">
            Buat kategori dulu
          </Link>{' '}
          sebelum menambah AHSP.
        </Alert>
      )}
      <Alert>{error}</Alert>

      <Card title="Data pekerjaan">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Kode" required error={errors.code}>
            <input className={inputClass} value={form.code} onChange={set('code')} placeholder="A.2.3.1.1" />
          </Field>
          <Field label="Uraian pekerjaan" required error={errors.name} className="sm:col-span-2 lg:col-span-3">
            <input className={inputClass} value={form.name} onChange={set('name')} placeholder="Penggalian 1 m3 tanah biasa" />
          </Field>
          <Field label="Satuan" required error={errors.unit}>
            <input className={inputClass} value={form.unit} onChange={set('unit')} placeholder="m3" />
          </Field>
          <Field label="Kategori" required error={errors.categoryId}>
            <select className={inputClass} value={form.categoryId} onChange={set('categoryId')}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Overhead & keuntungan (%)" error={errors.overheadPercent} hint="Permen PUPR: maks. 15%">
            <input type="number" min={0} max={100} step={0.5} className={inputClass} value={form.overheadPercent} onChange={set('overheadPercent')} />
          </Field>
          <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.isActive} onChange={set('isActive')} className="accent-brand-600" /> Aktif (muncul di katalog)
          </label>
          <Field label="Keterangan" className="sm:col-span-2 lg:col-span-4">
            <textarea rows={2} className={inputClass} value={form.description} onChange={set('description')} />
          </Field>
        </div>
      </Card>

      <Card title="Komponen (koefisien per 1 satuan pekerjaan)" description="Pilih upah, bahan, atau alat beserta koefisiennya.">
        <div className="space-y-2">
          {components.map((c, index) => {
            const resource = resourceById.get(c.resourceId);
            return (
              <div key={index} className="grid grid-cols-[1fr_7rem_auto] items-center gap-2 sm:grid-cols-[1fr_8rem_9rem_auto]">
                <select className={inputClass} value={c.resourceId} onChange={(e) => setComponent(index, { resourceId: e.target.value })} aria-label="Sumber daya">
                  <option value="">Pilih sumber daya…</option>
                  {['upah', 'bahan', 'alat'].map((type) => (
                    <optgroup key={type} label={RESOURCE_TYPE_LABEL[type]}>
                      {resources
                        .filter((r) => r.type === type)
                        .map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.code} · {r.name} ({rupiah(r.unitPrice)}/{r.unit})
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
                <input
                  type="number"
                  min={0}
                  step="any"
                  className={`${inputClass} text-right`}
                  value={c.coefficient}
                  onChange={(e) => setComponent(index, { coefficient: e.target.value })}
                  placeholder="Koefisien"
                  aria-label="Koefisien"
                />
                <span className="hidden text-right text-xs tabular-nums text-slate-600 sm:block">
                  {resource && c.coefficient ? `${resource.unit} → ${rupiah(Number(c.coefficient) * resource.unitPrice)}` : ''}
                </span>
                <button
                  type="button"
                  onClick={() => setComponents((list) => list.filter((_, i) => i !== index))}
                  className={buttonClass.ghost}
                  title="Hapus komponen"
                  aria-label="Hapus komponen"
                  disabled={components.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
          <button type="button" onClick={() => setComponents((list) => [...list, { resourceId: '', coefficient: '' }])} className={buttonClass.secondary}>
            <Plus className="h-4 w-4" /> Tambah komponen
          </button>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 rounded-lg border border-slate-200 p-4 text-sm sm:grid-cols-6">
          {[
            ['A. Upah', preview.upah],
            ['B. Bahan', preview.bahan],
            ['C. Alat', preview.alat],
            ['D. Jumlah', preview.base],
            ['E. Overhead', preview.overhead],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-slate-500">{label}</dt>
              <dd className="tabular-nums text-slate-800">{rupiah(value)}</dd>
            </div>
          ))}
          <div>
            <dt className="text-xs text-brand-700">F. HSP / {form.unit || 'satuan'}</dt>
            <dd className="font-semibold tabular-nums text-brand-700">{rupiah(preview.unitPrice)}</dd>
          </div>
        </dl>
      </Card>

      <div className="flex justify-end gap-2">
        <Link href={isEdit ? `/ahsp/${ahsp.id}` : '/ahsp'} className={buttonClass.secondary}>
          Batal
        </Link>
        <button type="submit" disabled={saving} className={buttonClass.primary}>
          {saving ? 'Menyimpan…' : 'Simpan AHSP'}
        </button>
      </div>
    </form>
  );
}
