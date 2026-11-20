'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, ArrowRight } from 'lucide-react';
export default function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });
            if (res?.error) {
                setError(res.error);
                setLoading(false);
                return;
            }
            router.push('/dashboard');
            router.refresh();
        }
        catch {
            setError('Terjadi kendala saat login. Silakan coba lagi.');
            setLoading(false);
        }
    };
    return (<form onSubmit={handleSubmit} className="space-y-4">
      {error && (<div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>)}

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Akun</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@kontraktor.com" className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 text-sm transition"/>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">Kata Sandi</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 text-sm transition"/>
      </div>

      <button type="submit" disabled={loading} className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium text-sm transition disabled:opacity-60 shadow-lg shadow-cyan-500/20 cursor-pointer">
        {loading ? (<span>Memverifikasi...</span>) : (<>
            <LogIn className="w-4 h-4"/>
            <span>Masuk ke Dashboard</span>
            <ArrowRight className="w-4 h-4"/>
          </>)}
      </button>
    </form>);
}
