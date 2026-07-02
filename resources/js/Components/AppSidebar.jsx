import { Link, usePage } from '@inertiajs/react';

export default function AppSidebar({ open, onClose }) {
    const { auth } = usePage().props;
    const currentUrl = usePage().url;

    const navItems = [
        { label: 'Dashboard', href: route('dashboard'), active: currentUrl.startsWith('/dashboard'), hint: 'KPI dan aktivitas' },
        { label: 'Projects', href: route('projects.index'), active: currentUrl.startsWith('/projects'), hint: 'Pipeline dan RAB' },
    ];

    if (auth?.user?.roles?.includes?.('admin')) {
        navItems.push({ label: 'Materials', href: route('materials.index'), active: currentUrl.startsWith('/materials'), hint: 'Harga satuan' });
        navItems.push({ label: 'User Management', href: route('users.index'), active: currentUrl.startsWith('/users'), hint: 'Akses tim' });
    }

    return (
        <>
            <button
                type="button"
                aria-label="Close navigation"
                onClick={onClose}
                className={`fixed inset-0 z-40 bg-ink/25 transition-opacity duration-300 ${
                    open ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
            />

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-hairlineSoft bg-white text-ink shadow-xl transition-transform duration-300 ease-out lg:sticky lg:z-20 lg:h-screen lg:translate-x-0 lg:shadow-none ${
                    open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                <div className="flex items-start justify-between gap-4 border-b border-hairlineSoft px-6 py-6">
                    <div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm font-bold text-onPrimary">
                            RS
                        </div>
                        <h1 className="mt-4 text-xl font-semibold tracking-tight">RAB System</h1>
                        <p className="mt-1 text-sm text-mute">Estimasi biaya konstruksi.</p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md border border-hairlineSoft bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-softCloud lg:hidden"
                    >
                        Close
                    </button>
                </div>

                <nav className="flex flex-col gap-2 p-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            onClick={onClose}
                            className={`rounded-md px-4 py-3 transition ${
                                item.active
                                    ? 'bg-primary text-onPrimary shadow-sm'
                                    : 'text-ink hover:bg-field'
                            }`}
                        >
                            <span className="block text-sm font-semibold">{item.label}</span>
                            <span className={`mt-0.5 block text-xs ${item.active ? 'text-white/75' : 'text-mute'}`}>
                                {item.hint}
                            </span>
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto border-t border-hairlineSoft p-4">
                    <div className="rounded-md bg-field p-4">
                        <p className="text-sm font-semibold text-ink">Alur cepat</p>
                        <p className="mt-1 text-xs leading-5 text-ash">Project, item RAB, review biaya, lalu export laporan.</p>
                    </div>
                </div>
            </aside>
        </>
    );
}
