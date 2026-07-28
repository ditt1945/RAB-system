import { Head, Link } from '@inertiajs/react';
import { CheckCircle, Home, MessageCircle, Phone } from 'lucide-react';

export default function HouseQuotationSuccess({ quotation }) {
    const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <>
            <Head title="Penawaran Terkirim" />
            <div className="flex min-h-screen items-center justify-center bg-softCloud px-6 py-12 text-ink">
                <main className="w-full max-w-3xl">
                    <section className="panel-strong p-6 text-center sm:p-10">
                        <CheckCircle className="mx-auto h-16 w-16 text-success" />
                        <p className="mt-6 text-sm uppercase tracking-[0.24em] text-mute">Permintaan terkirim</p>
                        <h1 className="mt-3 text-heading-xl font-semibold text-ink">Terima kasih, {quotation.name}.</h1>
                        <p className="mx-auto mt-4 max-w-xl text-body-md text-ash">
                            Tim sudah menerima request penawaran Anda. Kami akan menghubungi lewat WhatsApp, telepon, atau email untuk validasi kebutuhan proyek.
                        </p>

                        <div className="mt-8 grid gap-3 sm:grid-cols-3">
                            <InfoBox label="Referensi" value={`#${quotation.id}`} />
                            <InfoBox label="Email" value={quotation.email} />
                            <InfoBox label="Dikirim" value={formatDate(quotation.created_at)} />
                        </div>

                        <div className="mt-8 rounded-md border border-hairlineSoft bg-softCloud p-5 text-left">
                            <p className="font-semibold text-ink">Langkah berikutnya</p>
                            <ol className="mt-3 space-y-2 text-sm text-ash">
                                <li>1. Tim mengecek data lokasi dan kebutuhan awal.</li>
                                <li>2. Anda akan dihubungi untuk melengkapi detail rumah.</li>
                                <li>3. Estimasi awal divalidasi menjadi penawaran yang lebih akurat.</li>
                            </ol>
                        </div>

                        <div className="mt-8 grid gap-3 sm:grid-cols-2">
                            <Link href={route('house.estimate.index')} className="btn-secondary">
                                Hitung Estimasi Lain
                            </Link>
                            <Link href={route('house.packages')} className="btn-outline">
                                Lihat Paket Rumah
                            </Link>
                        </div>

                        <div className="mt-8 flex flex-wrap justify-center gap-3 border-t border-hairlineSoft pt-8">
                            <a href="https://wa.me/6285326610706" target="_blank" rel="noreferrer" className="btn-primary">
                                <MessageCircle className="mr-2 h-4 w-4" />
                                WhatsApp
                            </a>
                            <a href="tel:+6285326610706" className="btn-secondary">
                                <Phone className="mr-2 h-4 w-4" />
                                Telepon
                            </a>
                        </div>
                    </section>

                    <div className="mt-6 text-center">
                        <Link href="/" className="inline-flex items-center text-sm font-semibold text-primary hover:text-ink">
                            <Home className="mr-2 h-4 w-4" />
                            Kembali ke Beranda
                        </Link>
                    </div>
                </main>
            </div>
        </>
    );
}

function InfoBox({ label, value }) {
    return (
        <div className="rounded-md border border-hairlineSoft bg-white px-4 py-3">
            <p className="text-xs uppercase tracking-[0.14em] text-mute">{label}</p>
            <p className="mt-2 break-words text-sm font-semibold text-ink">{value}</p>
        </div>
    );
}
