import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Edit3, FileText, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/Utils/formatters';

export default function HouseEstimationHistory({ estimations }) {
    const [deleting, setDeleting] = useState(null);
    const rows = estimations?.data || [];

    const handleDelete = (id) => {
        if (!confirm('Hapus estimasi ini dari riwayat?')) {
            return;
        }

        setDeleting(id);
        router.delete(route('house.estimations.delete', id), {
            preserveScroll: true,
            onFinish: () => setDeleting(null),
            onError: () => alert('Estimasi belum bisa dihapus. Coba lagi.'),
        });
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <>
            <Head title="Riwayat Estimasi Rumah" />
            <div className="min-h-screen bg-softCloud px-6 py-12 text-ink">
                <div className="mx-auto max-w-6xl">
                    <header className="flex flex-col gap-5 border-b border-hairlineSoft pb-8 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm uppercase tracking-[0.24em] text-mute">Riwayat customer</p>
                            <h1 className="mt-3 text-heading-xl font-semibold text-ink">Estimasi rumah Anda.</h1>
                            <p className="mt-3 max-w-2xl text-body-md text-ash">
                                Buka ulang estimasi sebelumnya, ubah data rumah, atau lanjutkan ke request penawaran.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Link href={route('house.estimate.index')} className="btn-primary">
                                <Plus className="mr-2 h-4 w-4" />
                                Estimasi Baru
                            </Link>
                            <Link href={route('house.dashboard')} className="btn-secondary">
                                Ringkasan Akun
                            </Link>
                        </div>
                    </header>

                    {rows.length > 0 ? (
                        <div className="mt-8 grid gap-4">
                            {rows.map((estimation) => {
                                const costPerM2 = Number(estimation.floor_area) > 0
                                    ? Number(estimation.total_estimate) / Number(estimation.floor_area)
                                    : 0;

                                return (
                                    <article
                                        key={estimation.id}
                                        className={`panel-strong p-5 transition ${deleting === estimation.id ? 'opacity-50' : ''}`}
                                    >
                                        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="text-heading-md font-semibold text-ink">
                                                        {estimation.title || estimation.house_type}
                                                    </h2>
                                                    <span className="rounded-sm bg-tealSoft px-2.5 py-1 text-xs font-semibold capitalize text-primary">
                                                        {estimation.quality}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-sm text-mute">{formatDate(estimation.created_at)}</p>
                                                {estimation.summary && (
                                                    <p className="mt-3 max-w-3xl text-sm text-ash">{estimation.summary}</p>
                                                )}

                                                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                                                    <MiniStat label="Luas" value={`${estimation.floor_area} m2`} />
                                                    <MiniStat label="Kamar" value={`${estimation.bedrooms} KT, ${estimation.bathrooms} KM`} />
                                                    <MiniStat label="Lokasi" value={estimation.location || '-'} />
                                                    <MiniStat label="Per m2" value={costPerM2 ? formatCurrency(costPerM2) : '-'} />
                                                </div>

                                                {estimation.additional_features?.length > 0 && (
                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        {estimation.additional_features.map((feature) => (
                                                            <span key={feature} className="rounded-sm bg-field px-2.5 py-1 text-xs font-semibold capitalize text-ash">
                                                                {feature}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {Object.values(estimation.material_choices || {}).filter(Boolean).length > 0 && (
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {Object.entries(estimation.material_choices)
                                                            .filter(([, value]) => Boolean(value))
                                                            .map(([group, value]) => (
                                                                <span key={group} className="rounded-sm bg-tealSoft px-2.5 py-1 text-xs font-semibold capitalize text-primary">
                                                                    {group}: {String(value).replaceAll('_', ' ')}
                                                                </span>
                                                            ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-3 lg:text-right">
                                                <p className="text-2xl font-semibold text-ink">{formatCurrency(estimation.total_estimate)}</p>
                                                <div className="grid gap-2">
                                                    <Link href={route('house.quotation')} className="btn-primary">
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        Minta Quote
                                                    </Link>
                                                    <Link href={route('house.estimate.index', { estimationId: estimation.id })} className="btn-secondary">
                                                        <Edit3 className="mr-2 h-4 w-4" />
                                                        Edit Data
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(estimation.id)}
                                                        disabled={deleting === estimation.id}
                                                        className="btn-outline"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        {deleting === estimation.id ? 'Menghapus...' : 'Hapus'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <section className="panel-strong mt-8 p-8 text-center">
                            <FileText className="mx-auto h-10 w-10 text-primary" />
                            <h2 className="mt-4 text-heading-md font-semibold text-ink">Belum ada estimasi tersimpan.</h2>
                            <p className="mx-auto mt-2 max-w-xl text-sm text-ash">
                                Buat estimasi pertama untuk menyimpan pilihan paket, luas rumah, dan perkiraan biaya.
                            </p>
                            <Link href={route('house.estimate.index')} className="btn-primary mt-6">
                                Buat Estimasi
                            </Link>
                        </section>
                    )}

                    {estimations?.links?.length > 3 && (
                        <nav className="mt-8 flex flex-wrap justify-center gap-2">
                            {estimations.links.map((link, index) => (
                                <Link
                                    key={`${link.label}-${index}`}
                                    href={link.url || '#'}
                                    className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                                        link.active
                                            ? 'bg-primary text-white'
                                            : link.url
                                                ? 'bg-white text-ink hover:bg-field'
                                                : 'cursor-not-allowed bg-field text-mute'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </nav>
                    )}
                </div>
            </div>
        </>
    );
}

function MiniStat({ label, value }) {
    return (
        <div className="rounded-md border border-hairlineSoft bg-softCloud px-3 py-2">
            <p className="text-xs uppercase tracking-[0.12em] text-mute">{label}</p>
            <p className="mt-1 truncate text-sm font-semibold text-ink">{value}</p>
        </div>
    );
}
