'use client';
import { useEffect, useState } from 'react';
const initialForm = {
    companyName: 'PT Bangun Jaya Konstruksi',
    address: 'Jl. Pembangunan No. 10, Surabaya',
    phone: '0812-0000-0000',
    email: 'info@bangunjaya.test',
    logoUrl: '',
};
export default function CompanySettingsForm() {
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    useEffect(() => {
        fetch('/api/company-settings')
            .then(async (response) => {
            if (!response.ok)
                throw new Error('Gagal mengambil data');
            const result = await response.json();
            if (result.data) {
                setForm({ ...initialForm, companyName: result.data.companyName, address: result.data.address, phone: result.data.phone || '', email: result.data.email || '', logoUrl: result.data.logoUrl || '' });
            }
        })
            .catch(() => setError('Data belum tersimpan. Form siap diisi.'))
            .finally(() => setLoading(false));
    }, []);
    async function submit(event) {
        event.preventDefault();
        setSaving(true);
        setMessage('');
        setError('');
        try {
            const response = await fetch('/api/company-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, logoUrl: form.logoUrl || null }),
            });
            const result = await response.json();
            if (!response.ok)
                throw new Error(result.error || 'Gagal menyimpan');
            setMessage('Profil perusahaan tersimpan.');
        }
        catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : 'Gagal menyimpan profil');
        }
        finally {
            setSaving(false);
        }
    }
    function update(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
    }
    if (loading)
        return <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-400">Memuat profil perusahaan...</div>;
    return (<form onSubmit={submit} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7 space-y-5">
      {message && <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{message}</div>}
      {error && <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">{error}</div>}
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm text-slate-300 sm:col-span-2">Nama perusahaan<input required value={form.companyName} onChange={(event) => update('companyName', event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-cyan-500"/></label>
        <label className="block text-sm text-slate-300 sm:col-span-2">Alamat<textarea required value={form.address} onChange={(event) => update('address', event.target.value)} rows={3} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-cyan-500"/></label>
        <label className="block text-sm text-slate-300">Nomor telepon<input value={form.phone} onChange={(event) => update('phone', event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-cyan-500"/></label>
        <label className="block text-sm text-slate-300">Email perusahaan<input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-cyan-500"/></label>
        <label className="block text-sm text-slate-300 sm:col-span-2">URL logo (opsional)<input type="url" value={form.logoUrl} onChange={(event) => update('logoUrl', event.target.value)} placeholder="https://..." className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-cyan-500"/></label>
      </div>
      <button disabled={saving} className="rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan Profil Perusahaan'}</button>
    </form>);
}
