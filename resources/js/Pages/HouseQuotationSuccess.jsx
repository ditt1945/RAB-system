import { Head, Link } from '@inertiajs/react';

export default function HouseQuotationSuccess({ quotation }) {
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            <Head title="Penawaran Terkirim" />
            <div className="min-h-screen bg-softCloud text-ink flex items-center justify-center px-6 py-16">
                <div className="max-w-2xl w-full">
                    <div className="panel p-8 lg:p-12 text-center">
                        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                            <span className="text-4xl">✅</span>
                        </div>

                        <h1 className="text-heading-xl font-semibold text-ink">Penawaran Terkirim!</h1>
                        <p className="mt-4 text-body-md text-ash max-w-lg mx-auto">
                            Terima kasih, <strong>{quotation.name}</strong>. Tim kami telah menerima permintaan penawaran Anda dan akan segera menghubungi melalui nomor atau email yang Anda berikan.
                        </p>

                        <div className="mt-8 space-y-4">
                            <div className="rounded-2xl border border-hairlineSoft bg-white px-6 py-4">
                                <p className="text-sm uppercase tracking-[0.24em] text-mute">Nomor Referensi</p>
                                <p className="mt-2 text-heading-md font-semibold text-ink">#{quotation.id}</p>
                            </div>

                            <div className="rounded-2xl border border-hairlineSoft bg-white px-6 py-4">
                                <p className="text-sm uppercase tracking-[0.24em] text-mute">Email Anda</p>
                                <p className="mt-2 text-body-md text-ink">{quotation.email}</p>
                            </div>

                            <div className="rounded-2xl border border-hairlineSoft bg-white px-6 py-4">
                                <p className="text-sm uppercase tracking-[0.24em] text-mute">Waktu Pengiriman</p>
                                <p className="mt-2 text-body-md text-ink">{formatDate(quotation.created_at)}</p>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-hairlineSoft pt-8">
                            <p className="text-body-md text-ash mb-6">Selanjutnya, Anda bisa:</p>
                            <div className="space-y-3">
                                <Link href={route('house.estimate')} className="btn-secondary w-full">
                                    Hitung Estimasi Lain
                                </Link>
                                <Link href={route('house.packages')} className="btn-outline w-full">
                                    Lihat Paket Lain
                                </Link>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-hairlineSoft">
                            <p className="text-sm text-mute mb-4">Ada pertanyaan atau butuh bantuan cepat?</p>
                            <div className="flex flex-wrap gap-3 justify-center">
                                <a href="tel:+628123456789" className="btn-secondary">
                                    📞 Hubungi Kami
                                </a>
                                <a href="https://wa.me/628123456789" target="_blank" rel="noreferrer" className="btn-secondary">
                                    💬 WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <Link href={route('home')} className="text-ink hover:text-ash transition">
                            ← Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
