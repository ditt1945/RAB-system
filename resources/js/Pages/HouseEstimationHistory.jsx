import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { formatCurrency } from '@/Utilities/formatCurrency';

export default function HouseEstimationHistory({ estimations }) {
    const [deleting, setDeleting] = useState(null);

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus estimasi ini?')) {
            setDeleting(id);
            router.delete(route('house.estimations.delete', id), {
                onSuccess: () => setDeleting(null),
                onError: () => {
                    alert('Terjadi kesalahan saat menghapus estimasi');
                    setDeleting(null);
                }
            });
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <Head title="Riwayat Estimasi Rumah" />
            <div className="bg-gradient-to-br from-softCloud to-white min-h-screen p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-ink mb-2">
                            📋 Riwayat Estimasi Rumah
                        </h1>
                        <p className="text-mute text-lg">
                            Kelola dan lihat kembali estimasi rumah Anda
                        </p>
                    </div>

                    {/* New Estimate CTA */}
                    <div className="mb-8 flex gap-3 flex-wrap">
                        <Link
                            href={route('house.estimate.index')}
                            className="inline-block bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-semibold"
                        >
                            + Buat Estimasi Baru
                        </Link>
                        <Link
                            href={route('house.dashboard')}
                            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        >
                            📊 Dashboard & Rekomendasi
                        </Link>
                    </div>

                    {/* Estimations List */}
                    {estimations.data && estimations.data.length > 0 ? (
                        <div className="grid gap-4">
                            {estimations.data.map((estimation) => (
                                <div
                                    key={estimation.id}
                                    className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-tealSoft ${
                                        deleting === estimation.id ? 'opacity-50' : ''
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-ink mb-1">
                                                {estimation.title}
                                            </h3>
                                            <p className="text-sm text-mute">
                                                {formatDate(estimation.created_at)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-bold text-teal-600 mb-2">
                                                {formatCurrency(estimation.total_estimate)}
                                            </p>
                                            <p className="text-sm text-ash">
                                                {estimation.floor_area}m² | {estimation.bedrooms} KT, {estimation.bathrooms} KM
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                        <div>
                                            <span className="text-mute">Jenis Rumah:</span>
                                            <p className="text-ink font-semibold">{estimation.house_type}</p>
                                        </div>
                                        <div>
                                            <span className="text-mute">Paket:</span>
                                            <p className="text-ink font-semibold capitalize">{estimation.quality}</p>
                                        </div>
                                        <div>
                                            <span className="text-mute">Lokasi:</span>
                                            <p className="text-ink font-semibold">{estimation.location || '-'}</p>
                                        </div>
                                        <div>
                                            <span className="text-mute">Per m²:</span>
                                            <p className="text-ink font-semibold">
                                                {formatCurrency(estimation.total_estimate / estimation.floor_area)}/m²
                                            </p>
                                        </div>
                                    </div>

                                    {estimation.additional_features && estimation.additional_features.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-sm text-mute mb-2">Fitur Tambahan:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {estimation.additional_features.map((feature) => (
                                                    <span
                                                        key={feature}
                                                        className="bg-tealSoft text-teal-800 px-3 py-1 rounded-full text-xs font-semibold"
                                                    >
                                                        {feature}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {estimation.summary && (
                                        <div className="mb-4 p-3 bg-ash bg-opacity-5 rounded-lg">
                                            <p className="text-sm text-mute mb-1">Ringkasan:</p>
                                            <p className="text-sm text-ink">{estimation.summary}</p>
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-4 border-t border-ash border-opacity-20">
                                        <Link
                                            href={route('house.estimate.index', { estimationId: estimation.id })}
                                            className="btn-primary flex-1 text-center py-2"
                                        >
                                            ✏️ Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(estimation.id)}
                                            disabled={deleting === estimation.id}
                                            className="btn-outline flex-1 disabled:opacity-50"
                                        >
                                            🗑️ {deleting === estimation.id ? 'Menghapus...' : 'Hapus'}
                                        </button>
                                        <Link
                                            href={route('house.quotation')}
                                            className="btn-secondary flex-1 text-center py-2"
                                        >
                                            💌 Penawaran
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center">
                            <p className="text-xl text-mute mb-6">
                                Belum ada riwayat estimasi. Mulai buat estimasi pertama Anda!
                            </p>
                            <Link
                                href={route('house.estimate.index')}
                                className="btn-primary inline-block"
                            >
                                Buat Estimasi Sekarang
                            </Link>
                        </div>
                    )}

                    {/* Pagination */}
                    {estimations.links && estimations.links.length > 3 && (
                        <div className="mt-8 flex justify-center gap-2">
                            {estimations.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-3 py-2 rounded-lg transition-colors ${
                                        link.active
                                            ? 'bg-teal-600 text-white'
                                            : link.url
                                            ? 'bg-white text-ink hover:bg-ash hover:bg-opacity-10'
                                            : 'bg-ash bg-opacity-10 text-mute cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
