import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { formatCurrency } from '@/Utilities/formatCurrency';

export default function HouseEstimationDashboard({ analytics, trends, recommendations }) {
    const { auth } = usePage().props;

    const formatPercentage = (value) => {
        return Math.round(value * 100) / 100;
    };

    return (
        <>
            <Head title="Dashboard - Estimasi Rumah" />
            <div className="min-h-screen bg-gradient-to-br from-softCloud to-white p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-ink mb-2">
                            📊 Dashboard Estimasi Rumah Anda
                        </h1>
                        <p className="text-mute text-lg">
                            Analisis preferensi dan rekomendasi personal untuk rumah impian Anda
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="flex gap-3 mb-8 flex-wrap">
                        <Link
                            href={route('house.estimate.index')}
                            className="btn-primary inline-block px-6 py-3 text-sm font-semibold"
                        >
                            + Estimasi Baru
                        </Link>
                        <Link
                            href={route('house.estimations.history')}
                            className="btn-secondary inline-block px-6 py-3 text-sm font-semibold"
                        >
                            📋 Riwayat
                        </Link>
                    </div>

                    {/* Analytics Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-teal-600">
                            <p className="text-mute text-sm mb-2">Total Estimasi</p>
                            <p className="text-3xl font-bold text-ink">{analytics.total_estimations}</p>
                            <p className="text-xs text-ash mt-2">estimasi yang telah dibuat</p>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-tealSoft">
                            <p className="text-mute text-sm mb-2">Rata-rata Biaya/m²</p>
                            <p className="text-3xl font-bold text-ink">
                                {formatCurrency(analytics.avg_cost_per_m2)}
                            </p>
                            <p className="text-xs text-ash mt-2">biaya standar Anda</p>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-ink">
                            <p className="text-mute text-sm mb-2">Rata-rata Luas Bangunan</p>
                            <p className="text-3xl font-bold text-ink">
                                {formatPercentage(analytics.avg_floor_area)}
                            </p>
                            <p className="text-xs text-ash mt-2">m² per estimasi</p>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-ash">
                            <p className="text-mute text-sm mb-2">Paket Favorit</p>
                            <p className="text-3xl font-bold text-ink capitalize">
                                {analytics.quality_distribution && 
                                    Object.entries(analytics.quality_distribution)
                                        .sort(([,a], [,b]) => b - a)
                                        .at(0)?.[0] || '-'}
                            </p>
                            <p className="text-xs text-ash mt-2">pilihan terbanyak Anda</p>
                        </div>
                    </div>

                    {/* Quality Distribution */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Quality Breakdown */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold text-ink mb-4">📦 Distribusi Paket</h2>
                            <div className="space-y-4">
                                {Object.entries(analytics.quality_distribution || {}).length > 0 ? (
                                    Object.entries(analytics.quality_distribution).map(([quality, count]) => (
                                        <div key={quality}>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm font-semibold capitalize text-ink">{quality}</span>
                                                <span className="text-sm text-mute">{count} estimasi</span>
                                            </div>
                                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${
                                                        quality === 'hemat' ? 'bg-blue-400' :
                                                        quality === 'standar' ? 'bg-teal-500' :
                                                        'bg-purple-500'
                                                    }`}
                                                    style={{ width: `${(count / analytics.total_estimations * 100) || 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-ash">Belum ada estimasi</p>
                                )}
                            </div>
                        </div>

                        {/* Popular Features */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold text-ink mb-4">⭐ Fitur Favorit</h2>
                            <div className="space-y-3">
                                {Object.entries(analytics.popular_features || {}).length > 0 ? (
                                    Object.entries(analytics.popular_features)
                                        .sort(([,a], [,b]) => b - a)
                                        .map(([feature, count]) => (
                                            <div key={feature} className="flex items-center justify-between">
                                                <span className="font-semibold text-ink capitalize">{feature}</span>
                                                <span className="bg-tealSoft text-teal-800 px-3 py-1 rounded-full text-sm">
                                                    {count}x digunakan
                                                </span>
                                            </div>
                                        ))
                                ) : (
                                    <p className="text-ash">Belum ada fitur tambahan</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Upgrade Suggestions */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold text-ink mb-4">🚀 Rekomendasi Upgrade</h2>
                            {recommendations.suggested_upgrades?.length > 0 ? (
                                <div className="space-y-4">
                                    {recommendations.suggested_upgrades.map((rec, idx) => (
                                        <div key={idx} className="border border-tealSoft rounded-lg p-4">
                                            <h3 className="font-bold text-ink mb-2">{rec.title}</h3>
                                            <p className="text-sm text-ash mb-3">{rec.description}</p>
                                            {rec.benefit && (
                                                <p className="text-xs bg-teal-100 text-teal-800 p-2 rounded">
                                                    ✓ {rec.benefit}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-ash">Tidak ada rekomendasi upgrade saat ini</p>
                            )}
                        </div>

                        {/* Cost Optimization */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold text-ink mb-4">💰 Optimasi Biaya</h2>
                            {recommendations.cost_optimization?.length > 0 ? (
                                <div className="space-y-4">
                                    {recommendations.cost_optimization.map((rec, idx) => (
                                        <div key={idx} className="border border-amber-300 rounded-lg p-4">
                                            <h3 className="font-bold text-ink mb-2">{rec.title}</h3>
                                            <p className="text-sm text-ash mb-3">{rec.description}</p>
                                            {rec.savings && (
                                                <p className="text-xs bg-amber-100 text-amber-800 p-2 rounded">
                                                    💡 Hemat hingga {rec.savings}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-ash">Optimasi akan tersedia setelah lebih banyak estimasi</p>
                            )}
                        </div>
                    </div>

                    {/* Feature Recommendations */}
                    <div className="bg-white rounded-lg shadow p-6 mb-8">
                        <h2 className="text-xl font-bold text-ink mb-4">💡 Fitur Yang Bisa Ditambahkan</h2>
                        {recommendations.feature_recommendations?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {recommendations.feature_recommendations.map((feature, idx) => (
                                    <div key={idx} className="border border-softCloud rounded-lg p-4 hover:shadow-lg transition-shadow">
                                        <h3 className="font-bold text-ink mb-2">{feature.title}</h3>
                                        <p className="text-sm text-ash">{feature.description}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-ash">Fitur rekomendasi akan muncul setelah estimasi</p>
                        )}
                    </div>

                    {/* Next Steps */}
                    <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-ink mb-4">📝 Langkah Selanjutnya</h2>
                        {recommendations.next_steps?.length > 0 ? (
                            <div className="space-y-3">
                                {recommendations.next_steps.map((step, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="text-ink font-semibold">{step.message}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-ash">Tidak ada langkah selanjutnya</p>
                        )}
                    </div>

                    {/* Call to Action */}
                    <div className="mt-8 text-center p-6 bg-white rounded-lg shadow">
                        <p className="text-mute mb-4">Siap untuk konsultasi lebih lanjut?</p>
                        <Link
                            href={route('house.quotation')}
                            className="btn-primary inline-block px-8 py-3 text-lg font-semibold"
                        >
                            💌 Hubungi Kontraktor
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
