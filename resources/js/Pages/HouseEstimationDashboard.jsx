import { Head, Link } from '@inertiajs/react';
import { BarChart3, FileText, Lightbulb, Plus, Sparkles, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/Utils/formatters';

export default function HouseEstimationDashboard({ analytics = {}, trends = {}, recommendations = {} }) {
    const qualityEntries = Object.entries(analytics.quality_distribution || {});
    const featureEntries = Object.entries(analytics.popular_features || {})
        .sort(([, first], [, second]) => second - first);
    const totalEstimations = Number(analytics.total_estimations || 0);
    const favoritePackage = qualityEntries
        .sort(([, first], [, second]) => second - first)
        .at(0)?.[0] || '-';

    return (
        <>
            <Head title="Dashboard Estimasi Rumah" />
            <div className="min-h-screen bg-softCloud px-6 py-12 text-ink">
                <div className="mx-auto max-w-7xl">
                    <header className="flex flex-col gap-5 border-b border-hairlineSoft pb-8 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm uppercase tracking-[0.24em] text-mute">Ringkasan akun</p>
                            <h1 className="mt-3 text-heading-xl font-semibold text-ink">Dashboard estimasi rumah.</h1>
                            <p className="mt-3 max-w-2xl text-body-md text-ash">
                                Pantau pola budget, paket yang sering dipilih, dan rekomendasi praktis dari riwayat estimasi Anda.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Link href={route('house.estimate.index')} className="btn-primary">
                                <Plus className="mr-2 h-4 w-4" />
                                Estimasi Baru
                            </Link>
                            <Link href={route('house.estimations.history')} className="btn-secondary">
                                <FileText className="mr-2 h-4 w-4" />
                                Riwayat
                            </Link>
                        </div>
                    </header>

                    <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <MetricCard label="Total estimasi" value={totalEstimations} copy="Estimasi tersimpan" icon={BarChart3} />
                        <MetricCard label="Rata-rata biaya/m2" value={formatCurrency(analytics.avg_cost_per_m2 || 0)} copy="Patokan budget awal" icon={TrendingUp} />
                        <MetricCard label="Rata-rata luas" value={`${Math.round(Number(analytics.avg_floor_area || 0))} m2`} copy="Ukuran yang sering dihitung" icon={FileText} />
                        <MetricCard label="Paket favorit" value={favoritePackage} copy="Pilihan terbanyak" icon={Sparkles} capitalize />
                    </section>

                    <section className="mt-8 grid gap-6 lg:grid-cols-2">
                        <Panel title="Distribusi paket" copy="Komposisi pilihan kualitas dari estimasi yang pernah dibuat.">
                            {qualityEntries.length > 0 ? (
                                <div className="space-y-4">
                                    {qualityEntries.map(([quality, count]) => {
                                        const percentage = totalEstimations > 0 ? Math.round((count / totalEstimations) * 100) : 0;

                                        return (
                                            <div key={quality}>
                                                <div className="flex items-center justify-between gap-4 text-sm">
                                                    <span className="font-semibold capitalize text-ink">{quality}</span>
                                                    <span className="text-ash">{count} estimasi</span>
                                                </div>
                                                <div className="mt-2 h-2 rounded-full bg-field">
                                                    <div className="h-2 rounded-full bg-primary" style={{ width: `${percentage}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <EmptyText>Belum ada data paket.</EmptyText>
                            )}
                        </Panel>

                        <Panel title="Fitur tambahan favorit" copy="Tambahan yang paling sering muncul di estimasi Anda.">
                            {featureEntries.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {featureEntries.map(([feature, count]) => (
                                        <span key={feature} className="rounded-sm bg-tealSoft px-3 py-2 text-sm font-semibold capitalize text-primary">
                                            {feature} ({count}x)
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <EmptyText>Belum ada fitur tambahan yang sering dipilih.</EmptyText>
                            )}
                        </Panel>
                    </section>

                    <section className="mt-8 grid gap-6 lg:grid-cols-3">
                        <RecommendationList title="Rekomendasi upgrade" items={recommendations.suggested_upgrades} empty="Belum ada rekomendasi upgrade." />
                        <RecommendationList title="Optimasi biaya" items={recommendations.cost_optimization} empty="Optimasi akan muncul setelah data cukup." />
                        <RecommendationList title="Fitur yang bisa ditambahkan" items={recommendations.feature_recommendations} empty="Belum ada rekomendasi fitur." />
                    </section>

                    <section className="mt-8 panel-strong p-6">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="metric-label">Langkah berikutnya</p>
                                <div className="mt-3 space-y-2">
                                    {(recommendations.next_steps || []).length > 0 ? (
                                        recommendations.next_steps.map((step, index) => (
                                            <p key={`${step.message}-${index}`} className="text-sm text-ash">
                                                {index + 1}. {step.message}
                                            </p>
                                        ))
                                    ) : (
                                        <p className="text-sm text-ash">Buat estimasi baru atau lanjutkan request quote untuk validasi biaya.</p>
                                    )}
                                </div>
                            </div>
                            <Link href={route('house.quotation')} className="btn-primary">
                                Minta Penawaran
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

function MetricCard({ label, value, copy, icon: Icon, capitalize = false }) {
    return (
        <article className="panel-strong p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="metric-label">{label}</p>
                    <p className={`metric-value ${capitalize ? 'capitalize' : ''}`}>{value}</p>
                    <p className="mt-2 text-sm text-ash">{copy}</p>
                </div>
                <Icon className="h-5 w-5 text-primary" />
            </div>
        </article>
    );
}

function Panel({ title, copy, children }) {
    return (
        <section className="panel-strong p-6">
            <h2 className="text-heading-md font-semibold text-ink">{title}</h2>
            <p className="mt-2 text-sm text-ash">{copy}</p>
            <div className="mt-5">{children}</div>
        </section>
    );
}

function RecommendationList({ title, items = [], empty }) {
    return (
        <Panel title={title} copy="Saran ini membantu menentukan prioritas sebelum konsultasi.">
            {items.length > 0 ? (
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <article key={`${item.title}-${index}`} className="rounded-md border border-hairlineSoft bg-softCloud p-4">
                            <div className="flex items-start gap-3">
                                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                <div>
                                    <p className="text-sm font-semibold text-ink">{item.title}</p>
                                    <p className="mt-1 text-sm text-ash">{item.description}</p>
                                    {(item.benefit || item.savings) && (
                                        <p className="mt-2 text-xs font-semibold text-primary">{item.benefit || `Potensi hemat ${item.savings}`}</p>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <EmptyText>{empty}</EmptyText>
            )}
        </Panel>
    );
}

function EmptyText({ children }) {
    return <p className="text-sm text-ash">{children}</p>;
}
