import DashboardNav from '@/components/DashboardNav';

/** Kerangka halaman setelah login: navigasi atas (laptop) / bawah (HP) + konten. */
export default function AppShell({ user, children, wide = false }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav user={{ name: user.name, email: user.email, role: user.role }} wide={wide} />
      <main className={`mx-auto space-y-6 px-4 pb-28 pt-6 sm:px-6 md:pb-12 md:pt-8 lg:px-8 ${wide ? 'max-w-[90rem]' : 'max-w-6xl'}`}>{children}</main>
    </div>
  );
}
