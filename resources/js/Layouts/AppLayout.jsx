import AppSidebar from '@/Components/AppSidebar';
import AppNavbar from '@/Components/AppNavbar';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AppLayout({ header, children, contentClassName = 'max-w-7xl' }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { flash } = usePage().props;

    return (
        <div className="min-h-screen bg-softCloud text-ink">
            <div className="min-h-screen lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
                <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <main className="min-w-0 flex-1">
                    <AppNavbar onMenuClick={() => setSidebarOpen(true)} />

                    {header && (
                        <div className="surface-band">
                            <div className={`mx-auto px-4 py-5 sm:px-6 lg:px-8 ${contentClassName}`}>
                                {header}
                            </div>
                        </div>
                    )}

                    <div className={`mx-auto px-4 py-6 sm:px-6 lg:px-8 ${contentClassName}`}>
                        {flash?.success && (
                            <div className="mb-5 rounded-md border border-success/20 bg-success/10 px-4 py-3 text-sm font-semibold text-success">
                                {flash.success}
                            </div>
                        )}
                        {flash?.error && (
                            <div className="mb-5 rounded-md border border-sale/20 bg-sale/10 px-4 py-3 text-sm font-semibold text-sale">
                                {flash.error}
                            </div>
                        )}
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
