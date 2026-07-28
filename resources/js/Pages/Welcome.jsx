import { Head, Link } from '@inertiajs/react';
import { Calculator, ClipboardCheck, Home, MessageCircle, Quote, ShieldCheck } from 'lucide-react';

const steps = [
    {
        title: 'Isi data rumah',
        copy: 'Masukkan luas bangunan, jumlah ruang, lokasi, dan paket kualitas yang Anda incar.',
    },
    {
        title: 'Lihat estimasi awal',
        copy: 'Dapatkan kisaran biaya, biaya per meter, dan rincian kategori pekerjaan utama.',
    },
    {
        title: 'Minta penawaran',
        copy: 'Kirim kebutuhan Anda agar tim bisa bantu validasi biaya sesuai kondisi lapangan.',
    },
];

const proofPoints = [
    'Paket hemat, standar, dan premium mudah dibandingkan',
    'Breakdown biaya memakai bahasa sederhana',
    'Bisa lanjut ke request penawaran tanpa login',
];

const projectExamples = [
    {
        title: 'Rumah tumbuh 1 lantai',
        meta: '72 m2, paket standar',
        cost: 'Rp 320-380 juta',
    },
    {
        title: 'Rumah keluarga modern',
        meta: '100 m2, paket standar',
        cost: 'Rp 450-520 juta',
    },
    {
        title: 'Rumah premium compact',
        meta: '120 m2, paket premium',
        cost: 'Rp 720-850 juta',
    },
];

const testimonials = [
    {
        name: 'Nadia, Bekasi',
        copy: 'Angkanya mudah dipahami, jadi saya bisa diskusi budget dengan keluarga sebelum ketemu kontraktor.',
    },
    {
        name: 'Raka, Sleman',
        copy: 'Paket dan tambahannya jelas. Saya langsung tahu mana yang perlu diprioritaskan dulu.',
    },
];

export default function Welcome({ auth, canLogin, canRegister }) {
    return (
        <>
            <Head title="Estimasi Biaya Bangun Rumah" />
            <div className="min-h-screen bg-softCloud text-ink">
                <header className="surface-band">
                    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
                        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-ink">
                            <Home className="h-5 w-5" />
                            Estimasi Rumah
                        </Link>
                        <nav className="flex flex-wrap items-center justify-end gap-2">
                            <Link href={route('house.packages')} className="btn-secondary">
                                Paket
                            </Link>
                            {auth?.user ? (
                                <Link href={route('dashboard')} className="btn-primary">
                                    Dashboard
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
                                            Daftar
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main>
                    <section className="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center lg:px-8">
                        <div className="max-w-3xl">
                            <p className="text-sm uppercase tracking-[0.24em] text-mute">Kalkulator biaya rumah</p>
                            <h1 className="mt-4 text-heading-xl font-semibold text-ink">
                                Hitung estimasi bangun rumah sebelum konsultasi kontraktor.
                            </h1>
                            <p className="mt-4 text-body-md text-ash">
                                Pilih paket, isi data rumah, lalu lihat kisaran biaya awal dalam format yang mudah dipahami. Cocok untuk membandingkan budget sebelum mulai desain.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link href={route('house.estimate.index')} className="btn-primary">
                                    <Calculator className="mr-2 h-4 w-4" />
                                    Hitung Estimasi
                                </Link>
                                <Link href={route('house.quotation')} className="btn-secondary">
                                    <MessageCircle className="mr-2 h-4 w-4" />
                                    Minta Penawaran
                                </Link>
                            </div>
                        </div>

                        <aside className="panel-strong p-6">
                            <p className="metric-label">Contoh hasil</p>
                            <p className="mt-3 text-3xl font-semibold text-ink">Rp 450 juta</p>
                            <p className="mt-2 text-sm text-ash">Estimasi rumah standar 100 m2, belum termasuk survei lokasi dan detail desain final.</p>
                            <div className="mt-6 space-y-3">
                                {[
                                    ['Pondasi dan struktur', '30%'],
                                    ['Dinding dan atap', '22%'],
                                    ['Finishing', '24%'],
                                ].map(([label, value]) => (
                                    <div key={label}>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-ash">{label}</span>
                                            <span className="font-semibold text-ink">{value}</span>
                                        </div>
                                        <div className="mt-2 h-2 rounded-full bg-field">
                                            <div className="h-2 rounded-full bg-primary" style={{ width: value }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </aside>
                    </section>

                    <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-12 sm:grid-cols-3 lg:px-8">
                        {steps.map((step, index) => (
                            <article key={step.title} className="panel p-5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-tealSoft text-sm font-semibold text-primary">
                                    {index + 1}
                                </div>
                                <h2 className="mt-4 text-heading-md font-semibold text-ink">{step.title}</h2>
                                <p className="mt-2 text-sm text-ash">{step.copy}</p>
                            </article>
                        ))}
                    </section>

                    <section className="mx-auto max-w-6xl px-6 pb-16 lg:px-8">
                        <div className="panel-strong grid gap-6 p-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-center">
                            <div>
                                <ClipboardCheck className="h-8 w-8 text-primary" />
                                <h2 className="mt-4 text-heading-md font-semibold text-ink">Dibuat untuk keputusan awal yang lebih tenang.</h2>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-3">
                                {proofPoints.map((item) => (
                                    <div key={item} className="rounded-md border border-hairlineSoft bg-softCloud px-4 py-3 text-sm text-ash">
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto grid max-w-6xl gap-8 px-6 pb-16 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
                        <div>
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="h-6 w-6 text-primary" />
                                <h2 className="text-heading-md font-semibold text-ink">Contoh kisaran proyek</h2>
                            </div>
                            <div className="mt-5 grid gap-4 md:grid-cols-3">
                                {projectExamples.map((project) => (
                                    <article key={project.title} className="panel p-5">
                                        <p className="text-sm font-semibold text-ink">{project.title}</p>
                                        <p className="mt-2 text-sm text-ash">{project.meta}</p>
                                        <p className="mt-4 text-body-md font-semibold text-primary">{project.cost}</p>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <aside className="panel-strong p-6">
                            <Quote className="h-7 w-7 text-primary" />
                            <h2 className="mt-4 text-heading-md font-semibold text-ink">Lebih enak untuk mulai bicara budget.</h2>
                            <div className="mt-5 space-y-4">
                                {testimonials.map((item) => (
                                    <blockquote key={item.name} className="border-l-2 border-primary/30 pl-4">
                                        <p className="text-sm text-ash">{item.copy}</p>
                                        <footer className="mt-2 text-sm font-semibold text-ink">{item.name}</footer>
                                    </blockquote>
                                ))}
                            </div>
                        </aside>
                    </section>
                </main>
            </div>
        </>
    );
}
