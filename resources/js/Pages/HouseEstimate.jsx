import { Head, Link, useForm } from '@inertiajs/react';
import { formatCurrency } from '@/Utils/formatters';

const featureOptions = [
    { key: 'carport', label: 'Carport' },
    { key: 'pagar', label: 'Pagar' },
    { key: 'taman', label: 'Taman' },
    { key: 'rooftop', label: 'Rooftop' },
    { key: 'kanopi', label: 'Kanopi' },
];

export default function HouseEstimate({ estimate = null, form: initialForm = {} }) {
    const form = useForm({
        house_type: initialForm.house_type || '',
        floor_area: initialForm.floor_area || '',
        land_area: initialForm.land_area || '',
        bedrooms: initialForm.bedrooms || 0,
        bathrooms: initialForm.bathrooms || 0,
        quality: initialForm.quality || 'standar',
        location: initialForm.location || '',
        notes: initialForm.notes || '',
        additional_features: initialForm.additional_features || [],
    });

    const estimatedPerM2 = form.floor_area > 0 && estimate?.total_estimate
        ? Math.round(estimate.total_estimate / form.floor_area)
        : null;

    const handleSubmit = (event) => {
        event.preventDefault();
        form.post(route('house.estimate.store'));
    };

    return (
        <>
            <Head title="Estimasi Rumah" />
            <div className="min-h-screen bg-softCloud text-ink">
                <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
                    <div className="space-y-8">
                        <div className="max-w-3xl">
                            <p className="text-sm uppercase tracking-[0.36em] text-mute">Estimasi Biaya Rumah</p>
                            <h1 className="mt-4 text-heading-xl font-semibold text-ink">Hitung biaya bangun rumah dengan cepat.</h1>
                            <p className="mt-4 text-body-md text-ash">Isi data rumah Anda dan dapatkan estimasi biaya awal yang mudah dipahami. Cocok untuk calon pemilik rumah yang ingin tahu perkiraan anggaran.</p>
                            <Link href={route('house.packages')} className="btn-secondary mt-6 inline-flex w-full max-w-max px-6 py-3 text-sm font-semibold sm:w-auto">
                                Lihat Paket dan Perbandingan
                            </Link>
                        </div>

                        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
                            <section className="panel p-6">
                                <h2 className="text-heading-md font-semibold text-ink">Data Rumah</h2>
                                <p className="mt-2 text-body-md text-ash">Masukkan informasi dasar agar estimasi biaya bisa muncul secara lebih relevan.</p>

                                <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <label className="space-y-2">
                                            <span className="text-sm text-ash">Tipe rumah</span>
                                            <input
                                                type="text"
                                                value={form.house_type}
                                                onChange={(e) => form.setData('house_type', e.target.value)}
                                                className="input"
                                                placeholder="Contoh: 2 lantai modern"
                                                required
                                            />
                                        </label>

                                        <label className="space-y-2">
                                            <span className="text-sm text-ash">Luas bangunan (m²)</span>
                                            <input
                                                type="number"
                                                value={form.floor_area}
                                                onChange={(e) => form.setData('floor_area', e.target.value)}
                                                className="input"
                                                min="1"
                                                required
                                            />
                                        </label>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <label className="space-y-2">
                                            <span className="text-sm text-ash">Luas tanah (m²)</span>
                                            <input
                                                type="number"
                                                value={form.land_area}
                                                onChange={(e) => form.setData('land_area', e.target.value)}
                                                className="input"
                                                min="1"
                                            />
                                        </label>

                                        <label className="space-y-2">
                                            <span className="text-sm text-ash">Lokasi</span>
                                            <input
                                                type="text"
                                                value={form.location}
                                                onChange={(e) => form.setData('location', e.target.value)}
                                                className="input"
                                                placeholder="Kota atau daerah"
                                            />
                                        </label>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-sm uppercase tracking-[0.24em] text-mute">Pilih paket</p>
                                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                                {[
                                                    {
                                                        key: 'hemat',
                                                        title: 'Hemat',
                                                        description: 'Biaya dasar dengan material sederhana dan finishing minimal.',
                                                    },
                                                    {
                                                        key: 'standar',
                                                        title: 'Standar',
                                                        description: 'Kualitas umum yang seimbang antara biaya dan fungsi.',
                                                    },
                                                    {
                                                        key: 'premium',
                                                        title: 'Premium',
                                                        description: 'Finishing lebih baik dan material pilihan untuk tampilan lebih bagus.',
                                                    },
                                                ].map((option) => (
                                                    <button
                                                        key={option.key}
                                                        type="button"
                                                        onClick={() => form.setData('quality', option.key)}
                                                        className={`rounded-2xl border px-4 py-4 text-left transition ${form.quality === option.key ? 'border-ink bg-ink/5' : 'border-hairlineSoft bg-white hover:border-ink'}`}
                                                    >
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div>
                                                                <p className="text-sm font-semibold text-ink">{option.title}</p>
                                                                <p className="mt-2 text-sm text-ash">{option.description}</p>
                                                            </div>
                                                            {form.quality === option.key && <span className="text-sm font-semibold text-ink">Dipilih</span>}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm uppercase tracking-[0.24em] text-mute">Tambah opsi</p>
                                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                {featureOptions.map((option) => (
                                                    <label key={option.key} className="inline-flex items-center gap-3 rounded-2xl border border-hairlineSoft bg-white px-4 py-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={form.additional_features.includes(option.key)}
                                                            onChange={(e) => {
                                                                const next = e.target.checked
                                                                    ? [...form.additional_features, option.key]
                                                                    : form.additional_features.filter((feature) => feature !== option.key);
                                                                form.setData('additional_features', next);
                                                            }}
                                                            className="h-4 w-4 rounded border-ink text-ink"
                                                        />
                                                        <span className="text-body-md text-ink">{option.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <label className="space-y-2">
                                            <span className="text-sm text-ash">Kamar tidur</span>
                                            <input
                                                type="number"
                                                value={form.bedrooms}
                                                onChange={(e) => form.setData('bedrooms', e.target.value)}
                                                className="input"
                                                min="0"
                                                required
                                            />
                                        </label>

                                        <label className="space-y-2">
                                            <span className="text-sm text-ash">Kamar mandi</span>
                                            <input
                                                type="number"
                                                value={form.bathrooms}
                                                onChange={(e) => form.setData('bathrooms', e.target.value)}
                                                className="input"
                                                min="0"
                                                required
                                            />
                                        </label>

                                        <label className="space-y-2">
                                            <span className="text-sm text-ash">Kualitas</span>
                                            <select
                                                value={form.quality}
                                                onChange={(e) => form.setData('quality', e.target.value)}
                                                className="input"
                                            >
                                                <option value="hemat">Hemat</option>
                                                <option value="standar">Standar</option>
                                                <option value="premium">Premium</option>
                                            </select>
                                        </label>
                                    </div>

                                    <label className="space-y-2">
                                        <span className="text-sm text-ash">Catatan singkat</span>
                                        <textarea
                                            value={form.notes}
                                            onChange={(e) => form.setData('notes', e.target.value)}
                                            className="input min-h-[120px]"
                                            placeholder="Contoh: ingin material kualitas standar, finishing sederhana"
                                        />
                                    </label>

                                    <button type="submit" className="btn-primary w-full">
                                        Hitung Estimasi
                                    </button>
                                </form>
                            </section>

                            <aside className="panel p-6 bg-white/90">
                                <h2 className="text-heading-md font-semibold text-ink">Mengapa estimasi awal?</h2>
                                <p className="mt-3 text-body-md text-ash">Estimasi ini membantu Anda mendapatkan gambaran biaya sebelum bertemu kontraktor. Hasilnya bersifat awal dan bisa disesuaikan lagi dengan kondisi lapangan.</p>

                                <div className="mt-6 space-y-4">
                                    <div className="rounded-2xl border border-hairlineSoft bg-softCloud px-4 py-4">
                                        <p className="text-sm uppercase tracking-[0.24em] text-mute">Ringkas</p>
                                        <p className="mt-2 text-body-md text-ink">Estimasi per total biaya dan kategori utama.</p>
                                    </div>
                                    <div className="rounded-2xl border border-hairlineSoft bg-softCloud px-4 py-4">
                                        <p className="text-sm uppercase tracking-[0.24em] text-mute">Cepat</p>
                                        <p className="mt-2 text-body-md text-ink">Tidak perlu login, cukup isi data dan terima hasil langsung.</p>
                                    </div>
                                </div>
                            </aside>
                        </div>

                        {estimate && (
                            <section className="panel p-6">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-heading-md font-semibold text-ink">Hasil Estimasi</h2>
                                        <p className="mt-2 text-body-md text-ash">Ini adalah estimasi awal berdasarkan data yang Anda masukkan.</p>
                                    </div>
                                    <Link href={route('house.packages')} className="btn-secondary w-full max-w-max sm:w-auto">
                                        Bandingkan Paket Lain
                                    </Link>
                                </div>

                                <div className="mt-6 space-y-4">
                                    <div className="rounded-2xl border border-hairlineSoft bg-softCloud px-5 py-5">
                                        <p className="text-sm uppercase tracking-[0.24em] text-mute">Total estimasi</p>
                                        <p className="mt-3 text-3xl font-semibold text-ink">{formatCurrency(estimate.total_estimate)}</p>
                                        {estimatedPerM2 && (
                                            <p className="mt-3 text-body-md text-ink">Sekitar {formatCurrency(estimatedPerM2)} per m²</p>
                                        )}
                                    </div>

                                    <div className="rounded-2xl border border-hairlineSoft bg-white px-5 py-5">
                                        <p className="text-sm uppercase tracking-[0.24em] text-mute">Ringkasan</p>
                                        <p className="mt-3 text-body-md text-ink">{estimate.summary}</p>
                                    </div>

                                    <div className="rounded-2xl border border-hairlineSoft bg-softCloud px-5 py-5">
                                        <p className="text-sm uppercase tracking-[0.24em] text-mute">Paket terpilih</p>
                                        <p className="mt-3 text-body-md text-ink capitalize">{estimate.quality || form.quality}</p>
                                        {estimate.additional_features?.length > 0 && (
                                            <div className="mt-3 space-y-2 rounded-xl bg-white px-4 py-3">
                                                <p className="text-sm font-semibold text-ink">Opsi tambahan</p>
                                                <ul className="list-disc pl-5 text-body-md text-ink">
                                                    {estimate.additional_features.map((feature, index) => (
                                                        <li key={index}>{feature}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    <div className="rounded-2xl border border-hairlineSoft bg-softCloud px-5 py-5">
                                        <p className="text-sm uppercase tracking-[0.24em] text-mute">Breakdown biaya detail</p>
                                        <div className="mt-4 space-y-4">
                                            {estimate.breakdown?.map((item, index) => {
                                                const percentage = estimate.total_estimate > 0
                                                    ? Math.round((item.amount / estimate.total_estimate) * 100)
                                                    : 0;
                                                return (
                                                    <div key={index} className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-body-md font-medium text-ink">{item.name}</span>
                                                            <div className="text-right">
                                                                <p className="font-semibold text-ink">{formatCurrency(item.amount)}</p>
                                                                <p className="text-sm text-ash">{percentage}% dari total</p>
                                                            </div>
                                                        </div>
                                                        <div className="h-2 w-full rounded-full bg-white/60">
                                                            <div
                                                                className="h-full rounded-full bg-gradient-to-r from-ink to-tealSoft transition-all"
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {estimate.notes?.length > 0 && (
                                        <div className="rounded-2xl border border-hairlineSoft bg-white px-5 py-5">
                                            <p className="text-sm uppercase tracking-[0.24em] text-mute">Catatan penting</p>
                                            <ul className="mt-3 space-y-2 text-body-md text-ink">
                                                {estimate.notes.map((note, index) => (
                                                    <li key={index} className="flex items-start gap-3">
                                                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-ink flex-shrink-0" />
                                                        <span>{note}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="grid gap-3 sm:grid-cols-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const text = `Estimasi Rumah: ${formatCurrency(estimate.total_estimate)}\n${estimate.summary}`;
                                                navigator.clipboard.writeText(text);
                                                alert('Hasil estimasi disalin ke clipboard');
                                            }}
                                            className="btn-secondary"
                                        >
                                            📋 Salin Hasil
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => window.print()}
                                            className="btn-secondary"
                                        >
                                            🖨️ Cetak Estimasi
                                        </button>
                                        <Link href={route('house.quotation')} className="btn-primary text-center">
                                            💌 Minta Penawaran
                                        </Link>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
