import { Head, Link } from '@inertiajs/react';

const packages = [
    {
        key: 'hemat',
        title: 'Paket Hemat',
        subtitle: 'Untuk rumah sederhana dengan kebutuhan fungsional.',
        price: 'Mulai dari Rp 3.500.000 / m²',
        features: ['Finishing dasar', 'Material standar', 'Volume minimal', 'Cocok untuk rumah 1 lantai'],
    },
    {
        key: 'standar',
        title: 'Paket Standar',
        subtitle: 'Kualitas seimbang untuk rumah keluarga modern.',
        price: 'Mulai dari Rp 4.500.000 / m²',
        features: ['Finishing lebih rapi', 'Material umum', 'Lebih fleksibel', 'Cocok untuk 2 lantai'],
    },
    {
        key: 'premium',
        title: 'Paket Premium',
        subtitle: 'Untuk rumah dengan tampilan lebih baik dan material pilihan.',
        price: 'Mulai dari Rp 6.000.000 / m²',
        features: ['Finishing berkualitas', 'Material pilihan', 'Detail estetika dan fungsi', 'Cocok untuk rumah modern'],
    },
];

export default function HousePackages() {
    return (
        <>
            <Head title="Pilih Paket Rumah" />
            <div className="min-h-screen bg-softCloud text-ink">
                <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
                    <div className="space-y-8">
                        <div className="max-w-3xl">
                            <p className="text-sm uppercase tracking-[0.36em] text-mute">Pilih Paket Rumah</p>
                            <h1 className="mt-4 text-heading-xl font-semibold text-ink">Bandingkan paket agar sesuai anggaran dan gaya hidup.</h1>
                            <p className="mt-4 text-body-md text-ash">Pilih paket yang paling cocok untuk rumah Anda, lalu gunakan hasil pilihan ini sebagai dasar estimasi biaya.</p>
                            <Link href={route('house.estimate')} className="btn-secondary mt-6 inline-flex w-full max-w-max px-6 py-3 text-sm font-semibold sm:w-auto">
                                Kembali ke Estimasi Rumah
                            </Link>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-3">
                            {packages.map((item) => (
                                <div key={item.key} className="panel p-6">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm uppercase tracking-[0.24em] text-mute">{item.title}</p>
                                            <p className="mt-2 text-heading-md font-semibold text-ink">{item.subtitle}</p>
                                        </div>
                                        <p className="text-body-md font-semibold text-ink">{item.price}</p>
                                        <ul className="space-y-2 text-body-md text-ash">
                                            {item.features.map((feature) => (
                                                <li key={feature} className="flex items-start gap-2">
                                                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-ink" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                        <Link
                                            href={`${route('house.estimate')}?quality=${item.key}`}
                                            className="btn-primary w-full"
                                        >
                                            Pilih Paket
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <section className="panel p-6">
                            <h2 className="text-heading-md font-semibold text-ink">Perbandingan Paket</h2>
                            <div className="mt-6 overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-hairlineSoft text-sm uppercase tracking-[0.24em] text-mute">
                                            <th className="px-4 py-3">Fitur</th>
                                            <th className="px-4 py-3">Hemat</th>
                                            <th className="px-4 py-3">Standar</th>
                                            <th className="px-4 py-3">Premium</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-hairlineSoft text-body-md text-ash">
                                        {[
                                            { label: 'Material', values: ['Standard', 'Umum', 'Pilihan'] },
                                            { label: 'Finishing', values: ['Dasar', 'Rapi', 'Berkualitas'] },
                                            { label: 'Tampilan', values: ['Sederhana', 'Modern', 'Mewah'] },
                                            { label: 'Cocok untuk', values: ['1 lantai', '2 lantai', 'Rumah modern'] },
                                        ].map((row) => (
                                            <tr key={row.label}>
                                                <th className="px-4 py-4 font-medium text-ink">{row.label}</th>
                                                {row.values.map((value) => (
                                                    <td key={value} className="px-4 py-4">{value}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}
