import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth, canLogin, canRegister, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="RAB System" />
            <div className="min-h-screen bg-softCloud text-ink">
                <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
                    <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                        <div className="space-y-8">
                            <div className="max-w-2xl">
                                <p className="text-sm uppercase tracking-[0.36em] text-mute">Sistem RAB Kontraktor</p>
                                <h1 className="mt-4 text-heading-xl font-semibold text-ink">Buat dan kelola RAB proyek konstruksi dengan lebih rapi.</h1>
                                <p className="mt-4 text-body-md text-ash">Sistem kerja untuk estimator dan site manager: catat proyek, susun item pekerjaan, kelola harga material, dan siapkan ringkasan biaya untuk kebutuhan operasional.</p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {auth?.user ? (
                                    <Link href={route('dashboard')} className="btn-primary">
                                        Buka Dashboard
                                    </Link>
                                ) : (
                                    <> 
                                        {canLogin && (
                                            <Link href={route('login')} className="btn-secondary">
                                                Masuk
                                            </Link>
                                        )}
                                        {canRegister && (
                                            <Link href={route('register')} className="btn-primary">
                                                Daftar Akun
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="panel-strong space-y-4 p-8">
                            <div className="space-y-2">
                                <p className="text-sm uppercase tracking-[0.28em] text-mute">Fitur utama</p>
                                <h2 className="text-xl font-semibold text-ink">Yang Dikelola</h2>
                            </div>
                            <ul className="space-y-4 text-body-md text-ash">
                                <li className="rounded-md border border-hairlineSoft bg-softCloud px-4 py-3">Data proyek, client, status pekerjaan, dan periode pelaksanaan tersimpan dalam satu tempat.</li>
                                <li className="rounded-md border border-hairlineSoft bg-softCloud px-4 py-3">Penyusunan RAB berbasis grup pekerjaan, volume, satuan, harga material, dan subtotal otomatis.</li>
                                <li className="rounded-md border border-hairlineSoft bg-softCloud px-4 py-3">Ringkasan biaya siap diperiksa, dicetak, dan diekspor untuk kebutuhan internal maupun presentasi.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <article className="panel p-6">
                            <p className="text-caption-sm uppercase tracking-[0.24em] text-mute">Proyek</p>
                            <p className="mt-4 text-heading-md font-semibold">Data pekerjaan dan client tersusun jelas</p>
                        </article>
                        <article className="panel p-6">
                            <p className="text-caption-sm uppercase tracking-[0.24em] text-mute">Material</p>
                            <p className="mt-4 text-heading-md font-semibold">Referensi harga untuk estimasi satuan</p>
                        </article>
                        <article className="panel p-6">
                            <p className="text-caption-sm uppercase tracking-[0.24em] text-mute">RAB</p>
                            <p className="mt-4 text-heading-md font-semibold">Item pekerjaan, volume, dan biaya terhitung</p>
                        </article>
                        <article className="panel p-6">
                            <p className="text-caption-sm uppercase tracking-[0.24em] text-mute">Laporan</p>
                            <p className="mt-4 text-heading-md font-semibold">Cetak dan ekspor ringkasan biaya</p>
                        </article>
                    </div>

                    <footer className="mt-16 border-t border-hairlineSoft pt-8 text-sm text-mute">
                        RAB System - Laravel v{laravelVersion ?? ''} - PHP v{phpVersion ?? ''}
                    </footer>
                </div>
            </div>
        </>
    );
}
