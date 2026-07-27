import { Head, Link, useForm } from '@inertiajs/react';

export default function HouseQuotation() {
    const form = useForm({
        name: '',
        email: '',
        phone: '',
        location: '',
        message: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post(route('house.quotation.store'), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Minta Penawaran" />
            <div className="min-h-screen bg-softCloud text-ink">
                <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
                    <div className="space-y-8">
                        <div className="max-w-2xl">
                            <Link href={route('house.estimate')} className="btn-secondary mb-6 inline-flex">
                                ← Kembali ke Estimasi
                            </Link>
                            <p className="text-sm uppercase tracking-[0.36em] text-mute">Hubungi Kami</p>
                            <h1 className="mt-4 text-heading-xl font-semibold text-ink">Minta Penawaran Resmi</h1>
                            <p className="mt-4 text-body-md text-ash">Isi data Anda dan tim kami akan menghubungi dalam waktu 24 jam untuk memberikan penawaran yang lebih detail dan personal.</p>
                        </div>

                        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
                            <section className="panel p-6 lg:p-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="space-y-2">
                                            <span className="text-sm font-medium text-ink">Nama Lengkap</span>
                                            <input
                                                type="text"
                                                value={form.name}
                                                onChange={(e) => form.setData('name', e.target.value)}
                                                className="input"
                                                placeholder="Siapa nama Anda?"
                                                required
                                            />
                                            {form.errors.name && <p className="text-sm text-red-600">{form.errors.name}</p>}
                                        </label>
                                    </div>

                                    <div>
                                        <label className="space-y-2">
                                            <span className="text-sm font-medium text-ink">Email</span>
                                            <input
                                                type="email"
                                                value={form.email}
                                                onChange={(e) => form.setData('email', e.target.value)}
                                                className="input"
                                                placeholder="email@example.com"
                                                required
                                            />
                                            {form.errors.email && <p className="text-sm text-red-600">{form.errors.email}</p>}
                                        </label>
                                    </div>

                                    <div>
                                        <label className="space-y-2">
                                            <span className="text-sm font-medium text-ink">Nomor Telepon / WhatsApp</span>
                                            <input
                                                type="tel"
                                                value={form.phone}
                                                onChange={(e) => form.setData('phone', e.target.value)}
                                                className="input"
                                                placeholder="+62 812 3456 7890"
                                                required
                                            />
                                            {form.errors.phone && <p className="text-sm text-red-600">{form.errors.phone}</p>}
                                        </label>
                                    </div>

                                    <div>
                                        <label className="space-y-2">
                                            <span className="text-sm font-medium text-ink">Lokasi / Alamat Proyek</span>
                                            <input
                                                type="text"
                                                value={form.location}
                                                onChange={(e) => form.setData('location', e.target.value)}
                                                className="input"
                                                placeholder="Kota, provinsi, atau alamat lengkap"
                                                required
                                            />
                                            {form.errors.location && <p className="text-sm text-red-600">{form.errors.location}</p>}
                                        </label>
                                    </div>

                                    <div>
                                        <label className="space-y-2">
                                            <span className="text-sm font-medium text-ink">Pesan Tambahan</span>
                                            <textarea
                                                value={form.message}
                                                onChange={(e) => form.setData('message', e.target.value)}
                                                className="input min-h-[120px]"
                                                placeholder="Ceritakan kebutuhan Anda lebih detail. Contoh: ingin start kapan, ada kendala khusus, dll."
                                            />
                                        </label>
                                    </div>

                                    <button type="submit" className="btn-primary w-full" disabled={form.processing}>
                                        {form.processing ? 'Mengirim...' : '✉️ Kirim Permintaan Penawaran'}
                                    </button>
                                </form>
                            </section>

                            <aside className="panel p-6 bg-white/90 h-fit">
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-sm uppercase tracking-[0.24em] text-mute">Atau hubungi langsung</p>
                                        <div className="mt-4 space-y-3">
                                            <a href="tel:+628123456789" className="flex items-start gap-3 rounded-lg p-3 hover:bg-softCloud transition">
                                                <span className="text-lg">📞</span>
                                                <span className="text-body-md text-ink">+62 812 3456 7890</span>
                                            </a>
                                            <a href="https://wa.me/628123456789" target="_blank" rel="noreferrer" className="flex items-start gap-3 rounded-lg p-3 hover:bg-softCloud transition">
                                                <span className="text-lg">💬</span>
                                                <span className="text-body-md text-ink">WhatsApp</span>
                                            </a>
                                            <a href="mailto:info@example.com" className="flex items-start gap-3 rounded-lg p-3 hover:bg-softCloud transition">
                                                <span className="text-lg">✉️</span>
                                                <span className="text-body-md text-ink">info@example.com</span>
                                            </a>
                                        </div>
                                    </div>

                                    <div className="border-t border-hairlineSoft pt-6">
                                        <p className="text-sm uppercase tracking-[0.24em] text-mute">Jam Layanan</p>
                                        <div className="mt-3 space-y-1 text-body-md text-ink">
                                            <p>Senin - Jumat: 09.00 - 17.00</p>
                                            <p>Sabtu: 09.00 - 13.00</p>
                                            <p>Minggu: Tutup</p>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
