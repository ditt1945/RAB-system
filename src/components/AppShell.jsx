import DashboardNav from '@/components/DashboardNav';

/** Kerangka halaman setelah login: navigasi + konten. */
export default function AppShell({ user, children, wide = false }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <DashboardNav user={{ name: user.name, email: user.email, role: user.role }} wide={wide} />
      <main className={`mx-auto space-y-6 px-4 py-8 sm:px-6 lg:px-8 ${wide ? 'max-w-[90rem]' : 'max-w-7xl'}`}>{children}</main>
    </div>
  );
}
