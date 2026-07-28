import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Calculator, Clipboard, Home, LogIn, PackageCheck, Save, Send, Share2 } from 'lucide-react';
import { formatCurrency } from '@/Utils/formatters';

const packageOptions = [
    {
        key: 'hemat',
        title: 'Hemat',
        price: 'Mulai Rp 3,5 juta / m2',
        description: 'Untuk rumah sederhana dengan prioritas fungsi dan biaya awal yang ringan.',
    },
    {
        key: 'standar',
        title: 'Standar',
        price: 'Mulai Rp 4,5 juta / m2',
        description: 'Pilihan seimbang untuk rumah keluarga dengan finishing rapi.',
    },
    {
        key: 'premium',
        title: 'Premium',
        price: 'Mulai Rp 6 juta / m2',
        description: 'Untuk tampilan lebih baik, material pilihan, dan detail yang lebih matang.',
    },
];

const featureOptions = [
    { key: 'carport', label: 'Carport', note: 'Area parkir sederhana' },
    { key: 'pagar', label: 'Pagar', note: 'Batas dan keamanan rumah' },
    { key: 'taman', label: 'Taman', note: 'Area hijau ringan' },
    { key: 'rooftop', label: 'Rooftop', note: 'Area tambahan di atap' },
    { key: 'kanopi', label: 'Kanopi', note: 'Pelindung area luar' },
];

const materialGroups = [
    {
        key: 'wall',
        label: 'Dinding',
        options: [
            { value: 'bata_merah', label: 'Bata merah', note: 'Kokoh dan umum dipakai' },
            { value: 'bata_ringan', label: 'Bata ringan', note: 'Pemasangan lebih cepat' },
            { value: 'batako', label: 'Batako', note: 'Lebih ekonomis' },
        ],
    },
    {
        key: 'floor',
        label: 'Lantai',
        options: [
            { value: 'keramik', label: 'Keramik', note: 'Pilihan standar rumah keluarga' },
            { value: 'granite', label: 'Granite tile', note: 'Tampilan lebih premium' },
            { value: 'vinyl', label: 'Vinyl', note: 'Hangat dan praktis' },
        ],
    },
    {
        key: 'frame',
        label: 'Kusen',
        options: [
            { value: 'aluminium', label: 'Aluminium', note: 'Ringan dan minim perawatan' },
            { value: 'kayu', label: 'Kayu', note: 'Lebih natural' },
            { value: 'upvc', label: 'uPVC', note: 'Kedap dan modern' },
        ],
    },
    {
        key: 'paint',
        label: 'Cat',
        options: [
            { value: 'standar', label: 'Standar', note: 'Cukup untuk interior umum' },
            { value: 'weatherproof', label: 'Weatherproof', note: 'Lebih tahan cuaca luar' },
            { value: 'premium', label: 'Premium', note: 'Warna dan daya tahan lebih baik' },
        ],
    },
    {
        key: 'roof',
        label: 'Atap',
        options: [
            { value: 'baja_ringan', label: 'Baja ringan', note: 'Efisien dan umum' },
            { value: 'genteng_beton', label: 'Genteng beton', note: 'Kesan solid' },
            { value: 'genteng_metal', label: 'Genteng metal', note: 'Ringan dan modern' },
        ],
    },
    {
        key: 'sanitary',
        label: 'Sanitasi',
        options: [
            { value: 'ekonomis', label: 'Ekonomis', note: 'Fungsional untuk budget ketat' },
            { value: 'standar', label: 'Standar', note: 'Seimbang untuk keluarga' },
            { value: 'premium', label: 'Premium', note: 'Fixture lebih nyaman' },
        ],
    },
];

export default function HouseEstimate({ estimate = null, form: initialForm = {} }) {
    const { auth } = usePage().props;
    const initialAdditionalFeatures = Array.isArray(initialForm.additional_features)
        ? initialForm.additional_features
        : [];
    const form = useForm({
        house_type: initialForm.house_type || '',
        floor_area: initialForm.floor_area || '',
        land_area: initialForm.land_area || '',
        bedrooms: initialForm.bedrooms || 2,
        bathrooms: initialForm.bathrooms || 1,
        quality: initialForm.quality || 'standar',
        location: initialForm.location || '',
        notes: initialForm.notes || '',
        additional_features: initialAdditionalFeatures,
        material_choices: initialForm.material_choices || {},
    });
    const formData = form.data;
    const selectedFeatures = Array.isArray(formData.additional_features)
        ? formData.additional_features
        : [];
    const estimatedPerM2 = Number(formData.floor_area) > 0 && estimate?.total_estimate
        ? Math.round(Number(estimate.total_estimate) / Number(formData.floor_area))
        : null;

    const handleSubmit = (event) => {
        event.preventDefault();
        form.post(route('house.estimate.store'), { preserveScroll: true });
    };

    const copyEstimate = () => {
        const text = `Estimasi rumah: ${formatCurrency(estimate.total_estimate)}\n${estimate.summary}`;
        navigator.clipboard.writeText(text);
        alert('Hasil estimasi disalin.');
    };

    const shareEstimate = async () => {
        const text = `Estimasi bangun rumah ${formatCurrency(estimate.total_estimate)}. ${estimate.summary}`;

        if (navigator.share) {
            await navigator.share({
                title: 'Estimasi Biaya Bangun Rumah',
                text,
                url: window.location.href,
            });
            return;
        }

        navigator.clipboard.writeText(`${text}\n${window.location.href}`);
        alert('Link dan ringkasan estimasi disalin.');
    };

    return (
        <>
            <Head title="Hitung Estimasi Rumah" />
            <div className="min-h-screen bg-softCloud text-ink">
                <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
                    <header className="flex flex-col gap-4 border-b border-hairlineSoft pb-8 sm:flex-row sm:items-end sm:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-sm uppercase tracking-[0.24em] text-mute">Kalkulator rumah</p>
                            <h1 className="mt-3 text-heading-xl font-semibold text-ink">Hitung estimasi biaya bangun rumah.</h1>
                            <p className="mt-3 text-body-md text-ash">
                                Isi data utama, pilih paket, lalu lihat kisaran biaya yang mudah dipahami sebelum konsultasi lanjutan.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Link href={route('house.packages')} className="btn-secondary">
                                <PackageCheck className="mr-2 h-4 w-4" />
                                Lihat Paket
                            </Link>
                            {auth?.user && (
                                <Link href={route('house.estimations.history')} className="btn-secondary">
                                    Riwayat
                                </Link>
                            )}
                        </div>
                    </header>

                    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <section className="panel p-6">
                                <StepHeading number="1" title="Data rumah" copy="Mulai dari informasi yang paling memengaruhi biaya." />
                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                    <Field label="Tipe rumah">
                                        <input
                                            type="text"
                                            value={formData.house_type}
                                            onChange={(event) => form.setData('house_type', event.target.value)}
                                            className="input"
                                            placeholder="Contoh: rumah 1 lantai minimalis"
                                            required
                                        />
                                    </Field>
                                    <Field label="Luas bangunan">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={formData.floor_area}
                                                onChange={(event) => form.setData('floor_area', event.target.value)}
                                                className="input pr-12"
                                                min="1"
                                                required
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-mute">m2</span>
                                        </div>
                                    </Field>
                                    <Field label="Luas tanah">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={formData.land_area}
                                                onChange={(event) => form.setData('land_area', event.target.value)}
                                                className="input pr-12"
                                                min="1"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-mute">m2</span>
                                        </div>
                                    </Field>
                                    <Field label="Lokasi">
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(event) => form.setData('location', event.target.value)}
                                            className="input"
                                            placeholder="Contoh: Bekasi, Bandung, Sleman"
                                        />
                                    </Field>
                                    <Field label="Kamar tidur">
                                        <input
                                            type="number"
                                            value={formData.bedrooms}
                                            onChange={(event) => form.setData('bedrooms', event.target.value)}
                                            className="input"
                                            min="0"
                                            required
                                        />
                                    </Field>
                                    <Field label="Kamar mandi">
                                        <input
                                            type="number"
                                            value={formData.bathrooms}
                                            onChange={(event) => form.setData('bathrooms', event.target.value)}
                                            className="input"
                                            min="0"
                                            required
                                        />
                                    </Field>
                                </div>
                            </section>

                            <section className="panel p-6">
                                <StepHeading number="2" title="Pilih paket" copy="Paket membantu customer memahami kualitas tanpa membaca RAB teknis." />
                                <div className="mt-6 grid gap-3 md:grid-cols-3">
                                    {packageOptions.map((option) => (
                                        <button
                                            key={option.key}
                                            type="button"
                                            onClick={() => form.setData('quality', option.key)}
                                            className={`rounded-md border p-4 text-left transition ${formData.quality === option.key ? 'border-primary bg-tealSoft' : 'border-hairlineSoft bg-white hover:border-primary/50'}`}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="font-semibold text-ink">{option.title}</p>
                                                {formData.quality === option.key && <span className="text-xs font-semibold text-primary">Dipilih</span>}
                                            </div>
                                            <p className="mt-2 text-sm font-semibold text-primary">{option.price}</p>
                                            <p className="mt-2 text-sm text-ash">{option.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section className="panel p-6">
                                <StepHeading number="3" title="Tambahan dan catatan" copy="Pilih fitur yang umum diminta agar estimasi lebih realistis." />
                                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                    {featureOptions.map((option) => (
                                        <label key={option.key} className="flex cursor-pointer items-start gap-3 rounded-md border border-hairlineSoft bg-white p-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedFeatures.includes(option.key)}
                                                onChange={(event) => {
                                                    const next = event.target.checked
                                                        ? [...selectedFeatures, option.key]
                                                        : selectedFeatures.filter((feature) => feature !== option.key);
                                                    form.setData('additional_features', next);
                                                }}
                                                className="mt-1 rounded border-hairline text-primary focus:ring-primary"
                                            />
                                            <span>
                                                <span className="block text-sm font-semibold text-ink">{option.label}</span>
                                                <span className="block text-sm text-ash">{option.note}</span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                <label className="mt-5 block space-y-2">
                                    <span className="text-sm font-semibold text-ink">Catatan kebutuhan</span>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(event) => form.setData('notes', event.target.value)}
                                        className="textarea-field min-h-[110px]"
                                        placeholder="Contoh: ingin ruang keluarga terbuka, finishing sederhana, ada area laundry."
                                    />
                                </label>
                            </section>

                            <section className="panel p-6">
                                <StepHeading number="4" title="Material utama" copy="Pilih arah material tanpa perlu masuk ke detail RAB teknis." />
                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                    {materialGroups.map((group) => (
                                        <Field key={group.key} label={group.label}>
                                            <select
                                                value={formData.material_choices?.[group.key] || ''}
                                                onChange={(event) => form.setData('material_choices', {
                                                    ...formData.material_choices,
                                                    [group.key]: event.target.value,
                                                })}
                                                className="input"
                                            >
                                                <option value="">Ikuti paket kualitas</option>
                                                {group.options.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label} - {option.note}
                                                    </option>
                                                ))}
                                            </select>
                                        </Field>
                                    ))}
                                </div>
                            </section>

                            <button type="submit" className="btn-primary w-full" disabled={form.processing}>
                                <Calculator className="mr-2 h-4 w-4" />
                                {form.processing ? 'Menghitung...' : 'Hitung Estimasi'}
                            </button>
                        </form>

                        <aside className="space-y-4">
                            <div className="panel-strong p-5">
                                <p className="metric-label">Ringkasan pilihan</p>
                                <div className="mt-4 space-y-3 text-sm">
                                    <SummaryRow label="Paket" value={packageOptions.find((item) => item.key === formData.quality)?.title || 'Standar'} />
                                    <SummaryRow label="Luas" value={formData.floor_area ? `${formData.floor_area} m2` : '-'} />
                                    <SummaryRow label="Kamar" value={`${formData.bedrooms || 0} KT, ${formData.bathrooms || 0} KM`} />
                                    <SummaryRow label="Tambahan" value={selectedFeatures.length > 0 ? `${selectedFeatures.length} dipilih` : '-'} />
                                    <SummaryRow label="Material" value={Object.values(formData.material_choices || {}).filter(Boolean).length > 0 ? `${Object.values(formData.material_choices).filter(Boolean).length} dipilih` : 'Ikuti paket'} />
                                </div>
                            </div>

                            <div className="panel p-5">
                                <div className="flex items-start gap-3">
                                    <Home className="mt-1 h-5 w-5 text-primary" />
                                    <div>
                                        <h2 className="text-heading-md font-semibold text-ink">Catatan estimasi</h2>
                                        <p className="mt-2 text-sm text-ash">
                                            Hasil ini adalah angka awal. Validasi akhir tetap perlu survei lokasi, gambar kerja, spesifikasi material, dan detail desain.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>

                    {estimate && (
                        <section className="mt-8 panel-strong p-6">
                            <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                                <div>
                                    <p className="metric-label">Hasil estimasi awal</p>
                                    <p className="mt-3 text-3xl font-semibold text-ink">{formatCurrency(estimate.total_estimate)}</p>
                                    {estimatedPerM2 && (
                                        <p className="mt-2 text-sm text-ash">Sekitar {formatCurrency(estimatedPerM2)} per m2</p>
                                    )}
                                    <p className="mt-4 text-sm text-ash">{estimate.summary}</p>
                                    <div className="mt-5 grid gap-2">
                                        <Link href={route('house.quotation')} className="btn-primary">
                                            <Send className="mr-2 h-4 w-4" />
                                            Minta Penawaran
                                        </Link>
                                        {auth?.user ? (
                                            <Link href={route('house.estimations.history')} className="btn-secondary">
                                                <Save className="mr-2 h-4 w-4" />
                                                Lihat Hasil Tersimpan
                                            </Link>
                                        ) : (
                                            <Link href={route('login')} className="btn-secondary">
                                                <LogIn className="mr-2 h-4 w-4" />
                                                Masuk untuk Simpan
                                            </Link>
                                        )}
                                        <button type="button" onClick={shareEstimate} className="btn-secondary">
                                            <Share2 className="mr-2 h-4 w-4" />
                                            Bagikan Hasil
                                        </button>
                                        <button type="button" onClick={copyEstimate} className="btn-secondary">
                                            <Clipboard className="mr-2 h-4 w-4" />
                                            Salin Hasil
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <p className="text-sm font-semibold text-ink">Breakdown biaya</p>
                                        <div className="mt-3 space-y-3">
                                            {(estimate.breakdown || []).map((item) => {
                                                const percentage = Number(estimate.total_estimate) > 0
                                                    ? Math.round((Number(item.amount) / Number(estimate.total_estimate)) * 100)
                                                    : 0;
                                                return (
                                                    <div key={item.name} className="rounded-md border border-hairlineSoft bg-softCloud p-4">
                                                        <div className="flex items-center justify-between gap-4 text-sm">
                                                            <span className="font-medium text-ink">{item.name}</span>
                                                            <span className="text-right font-semibold text-ink">{formatCurrency(item.amount)}</span>
                                                        </div>
                                                        <div className="mt-3 h-2 rounded-full bg-white">
                                                            <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(percentage, 100)}%` }} />
                                                        </div>
                                                        <p className="mt-2 text-xs text-ash">{percentage}% dari total</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {estimate.notes?.length > 0 && (
                                        <div className="rounded-md border border-hairlineSoft bg-white p-4">
                                            <p className="text-sm font-semibold text-ink">Catatan penting</p>
                                            <ul className="mt-3 space-y-2 text-sm text-ash">
                                                {estimate.notes.map((note) => (
                                                    <li key={note} className="flex gap-2">
                                                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                                        <span>{note}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </>
    );
}

function StepHeading({ number, title, copy }) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-white">
                {number}
            </div>
            <div>
                <h2 className="text-heading-md font-semibold text-ink">{title}</h2>
                <p className="mt-1 text-sm text-ash">{copy}</p>
            </div>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <label className="block space-y-2">
            <span className="text-sm font-semibold text-ink">{label}</span>
            {children}
        </label>
    );
}

function SummaryRow({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-hairlineSoft pb-2 last:border-b-0 last:pb-0">
            <span className="text-ash">{label}</span>
            <span className="text-right font-semibold text-ink">{value}</span>
        </div>
    );
}
