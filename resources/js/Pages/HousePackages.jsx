import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Check } from 'lucide-react';

const packages = [
    {
        key: 'hemat',
        title: 'Paket Hemat',
        subtitle: 'Untuk rumah sederhana dengan kebutuhan fungsional.',
        price: 'Mulai dari Rp 3.500.000 / m2',
        features: ['Finishing dasar', 'Material ekonomis', 'Cocok untuk budget ketat', 'Ideal untuk rumah 1 lantai'],
    },
    {
        key: 'standar',
        title: 'Paket Standar',
        subtitle: 'Kualitas seimbang untuk rumah keluarga modern.',
        price: 'Mulai dari Rp 4.500.000 / m2',
        features: ['Finishing lebih rapi', 'Material umum yang mudah dicari', 'Komposisi biaya seimbang', 'Cocok untuk rumah keluarga'],
    },
    {
        key: 'premium',
        title: 'Paket Premium',
        subtitle: 'Untuk rumah dengan tampilan lebih baik dan material pilihan.',
        price: 'Mulai dari Rp 6.000.000 / m2',
        features: ['Finishing berkualitas', 'Material pilihan', 'Detail estetika lebih matang', 'Cocok untuk rumah modern'],
    },
];

const comparisonRows = [
    { label: 'Material', values: ['Ekonomis', 'Umum', 'Pilihan'] },
    { label: 'Finishing', values: ['Dasar', 'Rapi', 'Berkualitas'] },
    { label: 'Tampilan', values: ['Sederhana', 'Modern', 'Lebih premium'] },
    { label: 'Cocok untuk', values: ['Budget ketat', 'Rumah keluarga', 'Rumah modern'] },
];

export default function HousePackages() {
    return (
        <>
            <Head title="Pilih Paket Rumah" />
            <div className="min-h-screen bg-softCloud text-ink">
                <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
                    <div className="space-y-8">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                            <div className="max-w-3xl">
                                <p className="text-sm uppercase tracking-[0.24em] text-mute">Pilih Paket Rumah</p>
                                <h1 className="mt-4 text-heading-xl font-semibold text-ink">Bandingkan paket berdasarkan budget dan kualitas.</h1>
                                <p className="mt-4 text-body-md text-ash">
                                    Pilih paket yang paling mendekati kebutuhan Anda. Kalkulator akan memakai pilihan ini sebagai dasar estimasi awal.
                                </p>
                            </div>
                            <Link href={route('house.estimate.index')} className="btn-secondary">
                                Kembali ke Kalkulator
                            </Link>
                        </div>

                        <div className="grid gap-5 lg:grid-cols-3">
                            {packages.map((item) => (
                                <article key={item.key} className="panel-strong flex flex-col p-6">
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <p className="text-sm uppercase tracking-[0.18em] text-mute">{item.title}</p>
                                            <h2 className="mt-2 text-heading-md font-semibold text-ink">{item.subtitle}</h2>
                                        </div>
                                        <p className="text-body-md font-semibold text-primary">{item.price}</p>
                                        <ul className="space-y-2 text-sm text-ash">
                                            {item.features.map((feature) => (
                                                <li key={feature} className="flex items-start gap-2">
                                                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <Link
                                        href={`${route('house.estimate.index')}?quality=${item.key}`}
                                        className="btn-primary mt-6 w-full"
                                    >
                                        Pilih Paket
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </article>
                            ))}
                        </div>

                        <section className="panel p-6">
                            <h2 className="text-heading-md font-semibold text-ink">Perbandingan Singkat</h2>
                            <p className="mt-2 text-sm text-ash">Gunakan tabel ini untuk memilih arah budget. Detail final tetap perlu disesuaikan dengan desain dan kondisi lapangan.</p>
                            <div className="mt-6 overflow-x-auto">
                                <table className="w-full min-w-[680px] text-left">
                                    <thead>
                                        <tr className="border-b border-hairlineSoft text-sm uppercase tracking-[0.14em] text-mute">
                                            <th className="px-4 py-3">Fitur</th>
                                            <th className="px-4 py-3">Hemat</th>
                                            <th className="px-4 py-3">Standar</th>
                                            <th className="px-4 py-3">Premium</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-hairlineSoft text-body-md text-ash">
                                        {comparisonRows.map((row) => (
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
