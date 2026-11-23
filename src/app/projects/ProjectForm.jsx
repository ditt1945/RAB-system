'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client';
import { STATUS_LABEL } from '@/lib/format';
import { Alert, buttonClass, Card, Field, inputClass } from '@/components/ui';

const EMPTY = {
  projectName: '',
  clientName: '',
  location: '',
  description: '',
  startDate: '',
  endDate: '',
  status: 'planning',
  rabDiscount: 0,
  rabServiceFee: 0,
  targetMarginPercent: 0,
  rabTaxPercent: 11,
};

const toDateInput = (value) => (value ? String(value).slice(0, 10) : '');

/** @param {{ project?: object }} props project ada = mode edit */
export default function ProjectForm({ project }) {
  const router = useRouter();
  const isEdit = Boolean(project);
  const [form, setForm] = useState(() =>
    project
      ? Object.fromEntries(Object.keys(EMPTY).map((key) => [key, key.endsWith('Date') ? toDateInput(project[key]) : (project[key] ?? '')]))
      : EMPTY,
  );
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await api(isEdit ? `/api/projects/${project.id}` : '/api/projects', {
      method: isEdit ? 'PUT' : 'POST',
      body: form,
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.error);
      setErrors(res.fields);
      return;
    }
    router.push(`/projects/${isEdit ? project.id : res.data.data.id}`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <Alert>{error}</Alert>

      <Card title="Data proyek">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nama proyek" required error={errors.projectName} className="sm:col-span-2">
            <input className={inputClass} value={form.projectName} onChange={set('projectName')} placeholder="Rumah Tinggal 2 Lantai" />
          </Field>
          <Field label="Pemilik / klien" required error={errors.clientName}>
            <input className={inputClass} value={form.clientName} onChange={set('clientName')} placeholder="Bpk. Ahmad" />
          </Field>
          <Field label="Lokasi" error={errors.location}>
            <input className={inputClass} value={form.location} onChange={set('location')} placeholder="Kota / kabupaten" />
          </Field>
          <Field label="Tanggal mulai" error={errors.startDate}>
            <input type="date" className={inputClass} value={form.startDate} onChange={set('startDate')} />
          </Field>
          <Field label="Tanggal selesai" error={errors.endDate}>
            <input type="date" className={inputClass} value={form.endDate} onChange={set('endDate')} />
          </Field>
          <Field label="Status" error={errors.status}>
            <select className={inputClass} value={form.status} onChange={set('status')}>
              {Object.entries(STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Keterangan" error={errors.description} className="sm:col-span-2">
            <textarea rows={3} className={inputClass} value={form.description} onChange={set('description')} placeholder="Spesifikasi umum, luas bangunan, dll. Dipakai juga sebagai konteks AI." />
          </Field>
        </div>
      </Card>

      <div id="biaya" className="scroll-mt-24">
      <Card title="Parameter biaya" description="Overhead & keuntungan sudah termasuk di harga AHSP. Isi margin hanya bila perlu tambahan.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Diskon (Rp)" error={errors.rabDiscount}>
            <input type="number" min={0} className={inputClass} value={form.rabDiscount} onChange={set('rabDiscount')} />
          </Field>
          <Field label="Biaya jasa (Rp)" error={errors.rabServiceFee}>
            <input type="number" min={0} className={inputClass} value={form.rabServiceFee} onChange={set('rabServiceFee')} />
          </Field>
          <Field label="Margin tambahan (%)" error={errors.targetMarginPercent}>
            <input type="number" min={0} max={100} step={0.5} className={inputClass} value={form.targetMarginPercent} onChange={set('targetMarginPercent')} />
          </Field>
          <Field label="PPN (%)" error={errors.rabTaxPercent} hint="Jasa konstruksi: 11%">
            <input type="number" min={0} max={100} step={0.5} className={inputClass} value={form.rabTaxPercent} onChange={set('rabTaxPercent')} />
          </Field>
        </div>
      </Card>
      </div>

      <div className="flex justify-end gap-2">
        <Link href={isEdit ? `/projects/${project.id}` : '/projects'} className={buttonClass.secondary}>
          Batal
        </Link>
        <button type="submit" disabled={saving} className={buttonClass.primary}>
          {saving ? 'Menyimpan…' : isEdit ? 'Simpan perubahan' : 'Simpan & lanjut susun RAB'}
        </button>
      </div>
    </form>
  );
}
