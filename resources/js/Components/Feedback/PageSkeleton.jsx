import { router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

function SkeletonBlock({ className = '' }) {
    return (
        <div
            className={
                'skeleton-block rounded-md ' +
                className
            }
            aria-hidden="true"
        />
    );
}

function GuestSkeleton() {
    return (
        <div className="flex min-h-screen flex-col items-center bg-softCloud px-4 pt-6 text-ink sm:justify-center sm:pt-0">
            <div className="text-center">
                <SkeletonBlock className="mx-auto h-12 w-12" />
                <SkeletonBlock className="mx-auto mt-3 h-5 w-28" />
                <SkeletonBlock className="mx-auto mt-2 h-4 w-36" />
            </div>

            <div className="panel-strong mt-6 w-full overflow-hidden px-6 py-6 sm:max-w-md">
                <div className="space-y-6">
                    <div className="space-y-3">
                        <SkeletonBlock className="h-7 w-44" />
                        <div className="space-y-2">
                            <SkeletonBlock className="h-4 w-full" />
                            <SkeletonBlock className="h-4 w-3/4" />
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <SkeletonBlock className="h-4 w-16" />
                            <SkeletonBlock className="h-11 w-full" />
                        </div>
                        <div className="space-y-2">
                            <SkeletonBlock className="h-4 w-24" />
                            <SkeletonBlock className="h-11 w-full" />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <SkeletonBlock className="h-4 w-32" />
                            <SkeletonBlock className="h-4 w-28" />
                        </div>
                        <div className="flex justify-end">
                            <SkeletonBlock className="h-10 w-24" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AppShellSkeleton() {
    return (
        <div className="min-h-screen bg-softCloud text-ink">
            <div className="border-b border-hairlineSoft bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <SkeletonBlock className="h-10 w-10" />
                        <div className="space-y-2">
                            <SkeletonBlock className="h-4 w-28" />
                            <SkeletonBlock className="h-3 w-20" />
                        </div>
                    </div>
                    <div className="hidden items-center gap-2 sm:flex">
                        <SkeletonBlock className="h-9 w-24" />
                        <SkeletonBlock className="h-9 w-9" />
                    </div>
                </div>
            </div>

            <div className="border-b border-hairlineSoft bg-softCloud">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="panel-strong p-5 md:p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="space-y-3">
                                <SkeletonBlock className="h-7 w-52" />
                                <SkeletonBlock className="h-4 w-72 max-w-full" />
                            </div>
                            <div className="flex gap-2">
                                <SkeletonBlock className="h-10 w-28" />
                                <SkeletonBlock className="h-10 w-24" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <section className="panel p-6 md:p-8">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-3">
                            <SkeletonBlock className="h-4 w-24" />
                            <SkeletonBlock className="h-8 w-48" />
                            <SkeletonBlock className="h-4 w-96 max-w-full" />
                        </div>
                        <SkeletonBlock className="h-10 w-32" />
                    </div>
                </section>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {[0, 1, 2, 3].map((item) => (
                        <div key={item} className="panel-strong p-5">
                            <div className="space-y-4">
                                <SkeletonBlock className="h-4 w-24" />
                                <SkeletonBlock className="h-8 w-20" />
                                <SkeletonBlock className="h-4 w-full" />
                            </div>
                        </div>
                    ))}
                </div>

                <section className="panel-strong overflow-hidden">
                    <div className="border-b border-hairlineSoft p-6">
                        <div className="space-y-3">
                            <SkeletonBlock className="h-6 w-40" />
                            <SkeletonBlock className="h-4 w-80 max-w-full" />
                        </div>
                    </div>
                    <div className="divide-y divide-hairlineSoft">
                        {[0, 1, 2].map((item) => (
                            <div key={item} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                                <div className="space-y-2">
                                    <SkeletonBlock className="h-5 w-44" />
                                    <SkeletonBlock className="h-4 w-28" />
                                </div>
                                <div className="flex gap-2">
                                    <SkeletonBlock className="h-8 w-20" />
                                    <SkeletonBlock className="h-9 w-16" />
                                    <SkeletonBlock className="h-9 w-16" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}

function WelcomeSkeleton() {
    return (
        <div className="min-h-screen bg-softCloud text-ink">
            <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
                <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                    <div className="space-y-8">
                        <div className="max-w-2xl space-y-4">
                            <SkeletonBlock className="h-4 w-56" />
                            <SkeletonBlock className="h-10 w-full" />
                            <SkeletonBlock className="h-10 w-4/5" />
                            <SkeletonBlock className="h-5 w-full" />
                            <SkeletonBlock className="h-5 w-3/4" />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <SkeletonBlock className="h-10 w-24" />
                            <SkeletonBlock className="h-10 w-32" />
                            <SkeletonBlock className="h-10 w-28" />
                        </div>
                    </div>

                    <div className="panel-strong space-y-4 p-8">
                        <div className="space-y-3">
                            <SkeletonBlock className="h-4 w-28" />
                            <SkeletonBlock className="h-7 w-44" />
                        </div>
                        {[0, 1, 2].map((item) => (
                            <SkeletonBlock key={item} className="h-14 w-full" />
                        ))}
                    </div>
                </div>

                <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[0, 1, 2, 3].map((item) => (
                        <article key={item} className="panel p-6">
                            <div className="space-y-4">
                                <SkeletonBlock className="h-4 w-20" />
                                <SkeletonBlock className="h-6 w-full" />
                            </div>
                        </article>
                    ))}
                </div>

                <SkeletonBlock className="mt-16 h-px w-full" />
            </div>
        </div>
    );
}

function PrintSkeleton() {
    return (
        <div className="min-h-screen bg-white p-8 text-gray-900">
            <div className="mx-auto max-w-5xl">
                <div className="mb-6 flex items-center justify-between">
                    <SkeletonBlock className="h-10 w-20" />
                    <SkeletonBlock className="h-10 w-28" />
                </div>

                <header className="mb-8 border-b border-gray-300 pb-4">
                    <SkeletonBlock className="h-8 w-72" />
                    <div className="mt-4 grid gap-2">
                        <SkeletonBlock className="h-4 w-56" />
                        <SkeletonBlock className="h-4 w-44" />
                        <SkeletonBlock className="h-4 w-32" />
                    </div>
                </header>

                <div className="overflow-hidden border border-gray-300">
                    {[0, 1, 2, 3, 4, 5].map((item) => (
                        <div key={item} className="grid grid-cols-7 border-b border-gray-300 last:border-b-0">
                            {[0, 1, 2, 3, 4, 5, 6].map((cell) => (
                                <div key={cell} className="border-r border-gray-300 p-3 last:border-r-0">
                                    <SkeletonBlock className="h-4 w-full" />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                <div className="ml-auto mt-6 w-full max-w-sm space-y-3">
                    {[0, 1, 2, 3].map((item) => (
                        <div key={item} className="flex justify-between gap-6">
                            <SkeletonBlock className="h-4 w-24" />
                            <SkeletonBlock className="h-4 w-28" />
                        </div>
                    ))}
                    <SkeletonBlock className="h-px w-full" />
                    <div className="flex justify-between gap-6">
                        <SkeletonBlock className="h-6 w-28" />
                        <SkeletonBlock className="h-6 w-36" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function isGuestPage(path) {
    return (
        path === '/login' ||
        path === '/register' ||
        path === '/forgot-password' ||
        path.startsWith('/reset-password') ||
        path === '/confirm-password' ||
        path.startsWith('/verify-email')
    );
}

function getSkeletonKind(path) {
    if (path === '/') {
        return 'welcome';
    }

    if (/^\/projects\/[^/]+\/rab\/print$/.test(path)) {
        return 'print';
    }

    return isGuestPage(path) ? 'guest' : 'app';
}

export default function PageSkeleton({ children }) {
    const [mounted, setMounted] = useState(true);
    const [active, setActive] = useState(true);
    const [targetPath, setTargetPath] = useState(() => window.location.pathname);
    const timers = useRef([]);
    const visibleSince = useRef(Date.now());

    const skeletonKind = useMemo(
        () => getSkeletonKind(targetPath),
        [targetPath],
    );

    const clearTimers = () => {
        timers.current.forEach((timer) => window.clearTimeout(timer));
        timers.current = [];
    };

    const hideSkeleton = () => {
        clearTimers();

        const elapsed = Date.now() - visibleSince.current;
        const delay = Math.max(120, 420 - elapsed);

        timers.current.push(window.setTimeout(() => {
            setActive(false);

            timers.current.push(window.setTimeout(() => {
                setMounted(false);
            }, 220));
        }, delay));
    };

    const showSkeleton = (path, immediate = false) => {
        clearTimers();
        setTargetPath(path);

        const delay = immediate ? 0 : 80;

        timers.current.push(window.setTimeout(() => {
            visibleSince.current = Date.now();
            setMounted(true);

            window.requestAnimationFrame(() => {
                setActive(true);
            });
        }, delay));
    };

    useEffect(() => {
        const bootTimeout = window.setTimeout(hideSkeleton, 360);

        const removeStartListener = router.on('start', (event) => {
            const visitUrl = event.detail.visit.url;
            const nextPath = visitUrl
                ? new URL(visitUrl, window.location.origin).pathname
                : window.location.pathname;

            showSkeleton(nextPath);
        });

        const removeFinishListener = router.on('finish', () => {
            hideSkeleton();
        });

        return () => {
            window.clearTimeout(bootTimeout);
            clearTimers();
            removeStartListener?.();
            removeFinishListener?.();
        };
    }, []);

    return (
        <>
            {children}

            {mounted && (
                <div
                    className={
                        'fixed inset-0 z-[9999] overflow-auto bg-softCloud transition duration-300 ease-out motion-reduce:transition-none ' +
                        (active ? 'opacity-100' : 'opacity-0')
                    }
                    role="status"
                    aria-live="polite"
                >
                    <span className="sr-only">Memuat halaman</span>
                    <div
                        className={
                            'origin-top transition duration-300 ease-out motion-reduce:transition-none ' +
                            (active ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0')
                        }
                    >
                        {skeletonKind === 'welcome' && <WelcomeSkeleton />}
                        {skeletonKind === 'print' && <PrintSkeleton />}
                        {skeletonKind === 'guest' && <GuestSkeleton />}
                        {skeletonKind === 'app' && <AppShellSkeleton />}
                    </div>
                </div>
            )}
        </>
    );
}
