'use client';
import { useEffect, useState } from 'react';
export default function ProfileSettingsForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [profileMsg, setProfileMsg] = useState('');
    const [profileErr, setProfileErr] = useState('');
    const [pwdMsg, setPwdMsg] = useState('');
    const [pwdErr, setPwdErr] = useState('');
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPwd, setSavingPwd] = useState(false);
    useEffect(() => {
        fetch('/api/profile')
            .then(async (response) => {
            if (!response.ok)
                throw new Error('Gagal mengambil data profil');
            const result = await response.json();
            if (result.data) {
                setName(result.data.name || '');
                setEmail(result.data.email || '');
            }
        })
            .catch((error) => setProfileErr(error.message))
            .finally(() => setLoading(false));
    }, []);
    async function handleUpdateProfile(event) {
        event.preventDefault();
        setSavingProfile(true);
        setProfileMsg('');
        setProfileErr('');
        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email }),
            });
            const result = await response.json();
            if (!response.ok)
                throw new Error(result.error || 'Gagal update profil');
            setProfileMsg('Data akun berhasil diperbarui.');
        }
        catch (error) {
            setProfileErr(error instanceof Error ? error.message : 'Gagal simpan profil');
        }
        finally {
            setSavingProfile(false);
        }
    }
    async function handleChangePassword(event) {
        event.preventDefault();
        setSavingPwd(true);
        setPwdMsg('');
        setPwdErr('');
        try {
            const response = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const result = await response.json();
            if (!response.ok)
                throw new Error(result.error || 'Gagal ganti kata sandi');
            setPwdMsg('Kata sandi berhasil diperbarui.');
            setCurrentPassword('');
            setNewPassword('');
        }
        catch (error) {
            setPwdErr(error instanceof Error ? error.message : 'Gagal ubah sandi');
        }
        finally {
            setSavingPwd(false);
        }
    }
    if (loading)
        return <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-400">Memuat profil...</div>;
    return (<div className="space-y-6">
      <form onSubmit={handleUpdateProfile} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7 space-y-4">
        <h2 className="text-base font-semibold text-white">Informasi Dasar</h2>
        {profileMsg && <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">{profileMsg}</div>}
        {profileErr && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{profileErr}</div>}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-slate-300">Nama lengkap<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-500"/></label>
          <label className="block text-sm text-slate-300">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-500"/></label>
        </div>
        <button disabled={savingProfile} className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50">{savingProfile ? 'Menyimpan...' : 'Perbarui Akun'}</button>
      </form>

      <form onSubmit={handleChangePassword} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7 space-y-4">
        <h2 className="text-base font-semibold text-white">Ganti Kata Sandi</h2>
        {pwdMsg && <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">{pwdMsg}</div>}
        {pwdErr && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{pwdErr}</div>}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-slate-300">Kata sandi saat ini<input required type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-500"/></label>
          <label className="block text-sm text-slate-300">Kata sandi baru<input required minLength={8} type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-500"/></label>
        </div>
        <button disabled={savingPwd} className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50">{savingPwd ? 'Memperbarui...' : 'Ubah Sandi'}</button>
      </form>
    </div>);
}
