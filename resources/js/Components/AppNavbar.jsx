import { Link, usePage } from '@inertiajs/react';

export default function AppNavbar({ onMenuClick }) {
    const { auth } = usePage().props;

    return (
        <header className="sticky top-0 z-30 border-b border-hairlineSoft bg-white/95 backdrop-blur-sm">
            <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onMenuClick}
                            className="inline-flex h-10 items-center gap-3 rounded-md border border-hairlineSoft bg-white px-3 text-sm font-semibold text-ink transition hover:bg-softCloud lg:hidden"
                        >
                            <span className="flex w-4 flex-col gap-1">
                                <span className="h-0.5 rounded-full bg-ink" />
                                <span className="h-0.5 rounded-full bg-ink" />
                                <span className="h-0.5 rounded-full bg-ink" />
                            </span>
                        </button>

                        <div>
                            <h2 className="text-base font-semibold text-ink md:text-lg">Workspace Estimator</h2>
                            <p className="text-sm text-mute">Pantau estimasi, material, dan laporan biaya.</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="rounded-md border border-hairlineSoft bg-canvas px-3 py-2 text-sm text-ink">
                            <span className="font-semibold">{auth.user.name}</span>
                            <span className="ml-3 text-mute">{auth.user.roles?.[0] ?? 'User'}</span>
                        </div>

                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="btn-secondary"
                        >
                            Log out
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
