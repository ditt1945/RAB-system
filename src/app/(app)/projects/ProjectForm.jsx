'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { api } from '@/lib/client';
import { STATUS_LABEL } from '@/lib/format';
import { Alert, buttonClass, Card, Field, inputClass } from '@/components/ui';
import { DateInput, MoneyInput, SuffixInput } from '@/components/inputs';

const EMPTY = {
  projectName: '',
  clientName: '',
  location: '',
  description: '',
  startDate: '',
  endDate: '',
  status: 'planning',
  rabNumber: '',
  approvedBy: '',
  rabDiscount: '0',
  rabServiceFee: '0',
  targetMarginPercent: '0',
  rabTaxPercent: '11',
};

const toDateInput = (value) => (value ? String(value).slice(0, 10) : '');

/**
 * Form data proyek, dipakai di halaman /projects/new, /projects/[id]/edit, dan popup.
 * @param {{ project?: object, onDone?: (project: object) => void, onCancel?: () => void, inModal?: boolean, openCosts?: boolean }} props
 * project ada = mode edit. Di popup (inModal) bagian ditampilkan tanpa kartu, dan onDone dipanggil setelah tersimpan.
 */
export default function ProjectForm({ project, onDone, onCancel, inModal = false, openCosts = false }) {
  const router = useRouter();
  const isEdit = Boolean(project);
  const [form, setForm] = useState(() =>
    project
      ? Object.fromEntries(Object.keys(EMPTY).map((key) => [key, key.endsWith('Date') ? toDateInput(project[key]) : String(project[key] ?? '')]))
      : EMPTY,
  );
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setValue = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const costErrors = ['rabDiscount', 'rabServiceFee', 'targetMarginPercent', 'rabTaxPercent'].some((k) => errors[k]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await api(isEdit ? `/api/projects/${project.id}` : '/api/projects', {
      method: isEdit ? 'PUT' : 'POST',
      body: form,
    });
    if (!res.ok) {
      setSaving(false);
      setError(res.error);
      setErrors(res.fields);
      return;
    }
    if (onDone) {
      setSaving(false);
      onDone(res.data.data);
      return;
    }
    // saving dibiarkan true sampai pindah halaman, supaya tombol tidak bisa diklik dua kali
    router.push(`/projects/${isEdit ? project.id : res.data.data.id}`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className={inModal ? 'space-y-6' : 'max-w-3xl space-y-6'} noValidate>
      <Alert>{error}</Alert>

      <Section inModal={inModal} title="Data proyek">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nama proyek" required error={errors.projectName} className="sm:col-span-2">
            <input className={inputClass} value={form.projectName} onChange={set('projectName')} placeholder="Rumah Tinggal 2 Lantai" autoFocus={!isEdit} />
          </Field>
          <Field label="Pemilik / klien" required error={errors.clientName}>
            <input className={inputClass} value={form.clientName} onChange={set('clientName')} placeholder="Bpk. Ahmad" />
          </Field>
          <Field label="Lokasi" error={errors.location}>
            <input className={inputClass} value={form.location} onChange={set('location')} placeholder="Kota / kabupaten" />
          </Field>
          <Field label="Tanggal mulai" error={errors.startDate}>
            <DateInput value={form.startDate} onChange={set('startDate')} />
          </Field>
          <Field label="Tanggal selesai" error={errors.endDate}>
            <DateInput value={form.endDate} onChange={set('endDate')} />
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
          <Field label="Keterangan" error={errors.description} hint="Spesifikasi umum, luas bangunan, dll. Bisa dipakai sebagai deskripsi untuk saran AI." className="sm:col-span-2">
            <textarea rows={3} className={inputClass} value={form.description} onChange={set('description')} placeholder="Rumah 1 lantai 6×6 m, pondasi batu kali, dinding bata merah…" />
          </Field>
        </div>
      </Section>

      <Section inModal={inModal} title="Dokumen RAB" description="Opsional. Dicetak di kop dan kolom tanda tangan preview/PDF.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nomor RAB" error={errors.rabNumber}>
            <input className={inputClass} value={form.rabNumber} onChange={set('rabNumber')} placeholder="RAB/001/XI/2026" />
          </Field>
          <Field label="Disetujui oleh" error={errors.approvedBy} hint="Kosongkan = nama pemilik/klien">
            <input className={inputClass} value={form.approvedBy} onChange={set('approvedBy')} placeholder={form.clientName || 'Nama penyetuju'} />
          </Field>
        </div>
      </Section>

      <details id="biaya" open={isEdit || openCosts || costErrors} className="group scroll-mt-24 rounded-xl border border-slate-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
          <span>
            <span className="block text-sm font-semibold text-navy-900">Pengaturan biaya</span>
            <span className="block text-[13px] text-slate-600">
              Diskon Rp{Number(form.rabDiscount || 0).toLocaleString('id-ID')} · jasa Rp{Number(form.rabServiceFee || 0).toLocaleString('id-ID')} · margin{' '}
              {form.targetMarginPercent || 0}% · PPN {form.rabTaxPercent || 0}%
            </span>
          </span>
          <ChevronDown className="h-5 w-5 shrink-0 text-slate-500 transition group-open:rotate-180" />
        </summary>
        <div className="border-t border-slate-200 p-4">
          <p className="mb-4 text-[13px] text-slate-600">Overhead & keuntungan sudah termasuk di harga AHSP. Isi margin hanya bila perlu tambahan.</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Diskon" error={errors.rabDiscount}>
              <MoneyInput value={form.rabDiscount} onChange={setValue('rabDiscount')} />
            </Field>
            <Field label="Biaya jasa" error={errors.rabServiceFee}>
              <MoneyInput value={form.rabServiceFee} onChange={setValue('rabServiceFee')} />
            </Field>
            <Field label="Margin tambahan" error={errors.targetMarginPercent}>
              <SuffixInput suffix="%" min={0} max={100} value={form.targetMarginPercent} onChange={set('targetMarginPercent')} />
            </Field>
            <Field label="PPN" error={errors.rabTaxPercent} hint="Jasa konstruksi umumnya 11%">
              <SuffixInput suffix="%" min={0} max={100} value={form.rabTaxPercent} onChange={set('rabTaxPercent')} />
            </Field>
          </div>
        </div>
      </details>

      <div className={`flex flex-col-reverse gap-2 sm:flex-row sm:justify-end ${inModal ? 'sticky bottom-0 -mx-5 -mb-5 border-t border-slate-200 bg-white px-5 py-3' : ''}`}>
        {onCancel ? (
          <button type="button" onClick={onCancel} className={buttonClass.secondary}>
            Batal
          </button>
        ) : (
          <Link href={isEdit ? `/projects/${project.id}` : '/projects'} className={buttonClass.secondary}>
            Batal
          </Link>
        )}
        <button type="submit" disabled={saving} className={buttonClass.primary}>
          {saving ? 'Menyimpan…' : isEdit ? 'Simpan perubahan' : 'Simpan & lanjut susun RAB'}
        </button>
      </div>
    </form>
  );
}

/** Di popup tiap bagian cukup diberi judul; di halaman penuh dibungkus kartu. */
function Section({ inModal, title, description, children }) {
  return inModal ? (
    <section>
      <h3 className="text-sm font-semibold text-navy-900">{title}</h3>
      {description && <p className="mt-0.5 text-[13px] text-slate-600">{description}</p>}
      <div className="mt-3">{children}</div>
    </section>
  ) : (
    <Card title={title} description={description}>
      {children}
    </Card>
  );
}
