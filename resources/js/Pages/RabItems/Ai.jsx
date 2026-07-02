import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { formatCurrency } from '@/Utils/formatters';

const generatePresets = [
    {
        label: 'Draft awal',
        prompt: 'Buat draft RAB awal yang lengkap dari scope proyek. Kelompokkan pekerjaan dari persiapan sampai finishing, gunakan volume konservatif, dan beri catatan pemeriksaan untuk item yang perlu survey lapangan.',
    },
    {
        label: 'Renovasi cepat',
        prompt: 'Buat draft RAB renovasi dengan fokus bongkaran, perbaikan, finishing, listrik dasar, kebersihan, dan contingency. Pakai asumsi yang jelas jika data luasan belum lengkap.',
    },
    {
        label: 'Efisiensi biaya',
        prompt: 'Buat alternatif RAB yang lebih hemat tanpa menurunkan fungsi utama. Tandai item yang bisa diganti materialnya dan item yang wajib dicek estimator.',
    },
];

const assistantPrompts = [
    'Apa 3 risiko biaya terbesar di RAB ini dan tindakan paling cepat untuk menurunkannya?',
    'Item mana yang terlihat terlalu mahal dibanding kontribusinya ke project?',
    'Material apa yang sebaiknya ditambahkan ke database agar estimasi berikutnya lebih akurat?',
    'Buat urutan kerja estimator untuk merapikan RAB ini sebelum dikirim ke client.',
];

export default function Ai({ auth, project, rabItems, summary, flash = {}, aiRequest = null, aiInsights = {} }) {
    const csrfToken = typeof document !== 'undefined'
        ? document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        : '';
    const defaultPrompt = [
        project.description || `Buat draft RAB untuk project ${project.project_name}.`,
        'Gunakan kelompok pekerjaan kontraktor yang rapi, volume awal yang masuk akal, dan harga satuan Rupiah.',
    ].join('\n');

    const generateForm = useForm({
        ai_prompt: defaultPrompt,
    });

    const analysisForm = useForm({});

    const assistantForm = useForm({
        assistant_question: '',
    });

    const generateWithAi = (e) => {
        e.preventDefault();

        generateForm.post(route('rab.ai.generate', project.id), {
            preserveScroll: true,
        });
    };

    const analyzeWithAi = (e) => {
        e.preventDefault();

        analysisForm.post(route('rab.ai.analyze', project.id), {
            preserveScroll: true,
        });
    };

    const askAssistant = (e) => {
        e.preventDefault();

        assistantForm.post(route('rab.ai.assistant', project.id), {
            preserveScroll: true,
        });
    };

    const applyGeneratePreset = (preset) => {
        generateForm.setData('ai_prompt', [
            project.description || `Project: ${project.project_name} untuk ${project.client_name}.`,
            preset.prompt,
        ].join('\n\n'));
    };

    const askQuickQuestion = (question) => {
        assistantForm.setData('assistant_question', question);
    };

    const aiSuggestions = aiRequest?.suggestions || null;
    const requestStatus = aiRequest?.status || null;
    const requestError = aiRequest?.error || null;
    const acceptedAt = aiRequest?.accepted_at || null;
    const suggestedTotal = aiSuggestions?.reduce((total, item) => total + Number(item.volume || 0) * Number(item.unit_price || 0), 0) || 0;

    return (
        <AppLayout
            user={auth.user}
            header={
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="page-title">Review Biaya</h2>
                        <p className="section-copy mt-1">
                            {project.project_name} - {project.client_name}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Link href={route('rab.index', project.id)} className="btn-secondary">
                            Back to RAB
                        </Link>
                        <Link href={route('projects.show', project.id)} className="btn-secondary">
                            Project
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Review Biaya - ${project.project_name}`} />

            <div className="content-shell">
                    <section className="panel p-6 md:p-8">
                        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
                            <div className="space-y-5">
                                <div>
                                    <p className="text-sm uppercase tracking-[0.2em] text-mute">Review RAB</p>
                                    <h3 className="mt-2 text-2xl font-semibold text-ink">Tinjau kelengkapan data dan arahkan penyusunan biaya.</h3>
                                    <p className="mt-2 max-w-3xl text-body-md text-ash">
                                        Gunakan halaman ini untuk membuat draft awal, memeriksa risiko biaya, menemukan data yang belum lengkap, dan menentukan langkah estimator berikutnya.
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                    <Metric label="Items" value={rabItems.length} />
                                    <Metric label="Draft Item" value={aiSuggestions?.length || 0} />
                                    <Metric label="Subtotal" value={formatCurrency(summary.subtotal)} />
                                    <Metric label="Total" value={formatCurrency(summary.grand_total)} strong />
                                </div>
                            </div>

                            <ReadinessPanel insights={aiInsights} />
                        </div>
                    </section>

                    {requestStatus === 'failed' && (
                        <Alert>
                            {requestError || 'Draft belum bisa diproses. Cek konfigurasi layanan, model, atau koneksi server.'}
                        </Alert>
                    )}

                    {['pending', 'processing'].includes(requestStatus) && (
                        <InfoAlert>
                            Draft sedang diproses. Tunggu queue worker berjalan, lalu refresh halaman ini untuk melihat hasilnya.
                        </InfoAlert>
                    )}

                    {aiSuggestions && aiSuggestions.length > 0 && (
                        <section className="panel-strong overflow-hidden">
                            <div className="flex flex-col gap-3 border-b border-hairlineSoft px-6 py-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h3 className="section-title">Draft RAB</h3>
                                    <p className="section-copy mt-1">
                                        Review dulu sebelum dimasukkan ke RAB utama. Total draft: {formatCurrency(suggestedTotal)}.
                                    </p>
                                </div>
                                <form method="POST" action={route('rab.ai.accept', project.id)}>
                                    <input type="hidden" name="_token" value={csrfToken || ''} />
                                    <input type="hidden" name="ai_request_id" value={aiRequest?.id || ''} />
                                    <button type="submit" className="btn-success">
                                        {acceptedAt ? 'Sinkronkan ke RAB' : 'Masukkan ke RAB'}
                                    </button>
                                </form>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="table-surface w-full">
                                    <thead className="table-heading text-left">
                                        <tr>
                                            <th className="px-5 py-4">Group</th>
                                            <th className="px-5 py-4">Item</th>
                                            <th className="px-5 py-4">Volume</th>
                                            <th className="px-5 py-4">Review</th>
                                            <th className="px-5 py-4 text-right">Unit Price</th>
                                            <th className="px-5 py-4 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-hairlineSoft">
                                        {aiSuggestions.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-5 py-4 text-sm text-ash">{item.group_name || 'Draft RAB'}</td>
                                                <td className="px-5 py-4">
                                                    <div className="font-semibold text-ink">{item.name}</div>
                                                    <div className="mt-1 text-sm text-ash">{item.material || item.category || '-'}</div>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-ash">
                                                    {item.volume} {item.unit}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-ash">
                                                    <ConfidenceBadge value={item.confidence} />
                                                    {(item.assumption || item.review_flag) && (
                                                        <div className="mt-2 max-w-xs space-y-1">
                                                            {item.assumption && <div>Asumsi: {item.assumption}</div>}
                                                            {item.review_flag && <div>Cek: {item.review_flag}</div>}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-right text-sm text-ash">{formatCurrency(item.unit_price)}</td>
                                                <td className="px-5 py-4 text-right font-semibold text-ink">
                                                    {formatCurrency(Number(item.volume || 0) * Number(item.unit_price || 0))}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
                        <section className="panel-strong">
                            <div className="border-b border-hairlineSoft px-6 py-4">
                                <h3 className="section-title">1. Buat Draft RAB</h3>
                                <p className="section-copy mt-1">
                                    Cocok dipakai saat project masih kosong atau ketika tim membutuhkan baseline cepat untuk diskusi internal.
                                </p>
                            </div>

                            <form onSubmit={generateWithAi} className="space-y-4 p-6">
                                <div>
                                    <div className="mb-2 text-sm font-semibold text-ink">Mode cepat</div>
                                    <div className="grid gap-2 sm:grid-cols-3">
                                        {generatePresets.map((preset) => (
                                            <button
                                                key={preset.label}
                                                type="button"
                                                onClick={() => applyGeneratePreset(preset)}
                                                className="rounded-md border border-hairlineSoft bg-softCloud px-3 py-2 text-left text-sm font-semibold text-ink transition hover:bg-white"
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-ink">
                                        Scope pekerjaan
                                    </label>
                                    <textarea
                                        value={generateForm.data.ai_prompt}
                                        onChange={(e) => generateForm.setData('ai_prompt', e.target.value)}
                                        rows="10"
                                        placeholder="Contoh: Renovasi kantor 2 lantai, luas 180 m2, bongkar partisi lama, tambah plafon gypsum, cat ulang, instalasi listrik dasar..."
                                        className="textarea-field"
                                    />
                                    {generateForm.errors.ai_prompt && (
                                        <div className="mt-2 text-sm text-sale">{generateForm.errors.ai_prompt}</div>
                                    )}
                                </div>

                                <div className="rounded-md border border-hairlineSoft bg-softCloud p-4 text-sm text-ash">
                                    Sistem akan memakai scope pekerjaan, detail project, dan database material. Draft tetap perlu ditinjau estimator sebelum dimasukkan ke RAB utama.
                                </div>

                                <button
                                    type="submit"
                                    disabled={generateForm.processing}
                                    className="btn-primary w-full"
                                >
                                    {generateForm.processing ? 'Membuat draft...' : 'Buat Draft RAB'}
                                </button>
                            </form>
                        </section>

                        <div className="space-y-6">
                            <section className="panel-strong">
                                <div className="border-b border-hairlineSoft px-6 py-4">
                                    <h3 className="section-title">2. Audit Biaya</h3>
                                    <p className="section-copy mt-1">
                                        Periksa risiko, margin, item mahal, dan peluang penghematan dari RAB saat ini.
                                    </p>
                                </div>

                                <div className="space-y-4 p-6">
                                    <form onSubmit={analyzeWithAi}>
                                        <button
                                            type="submit"
                                            disabled={analysisForm.processing || rabItems.length === 0}
                                            className="btn-accent w-full disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {analysisForm.processing ? 'Memeriksa...' : 'Periksa RAB Saat Ini'}
                                        </button>
                                    </form>

                                    {rabItems.length === 0 && (
                                        <div className="text-sm text-ash">Tambahkan item RAB dulu agar audit biaya punya data.</div>
                                    )}

                                    {analysisForm.errors.ai_analysis && (
                                        <Alert>{analysisForm.errors.ai_analysis}</Alert>
                                    )}

                                    {flash.ai_analysis && (
                                        <ResultPanel>
                                            <ResultBlock title="Ringkasan">{flash.ai_analysis.overview}</ResultBlock>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <MiniMetric label="Risiko" value={flash.ai_analysis.risk_level} />
                                                <MiniMetric
                                                    label="Margin"
                                                    value={`${flash.ai_analysis.estimated_margin_percent ?? '-'}%`}
                                                />
                                            </div>

                                            <List title="Item mahal" items={flash.ai_analysis.expensive_items?.map((item) => `${item.name}: ${item.reason}. ${item.suggestion}`)} />
                                            <List title="Rekomendasi hemat" items={flash.ai_analysis.saving_recommendations} />
                                            <List title="Alternatif material" items={flash.ai_analysis.material_recommendations} />
                                            <List title="Gap data" items={flash.ai_analysis.data_gaps} />
                                            <List title="Langkah berikutnya" items={flash.ai_analysis.next_actions} />
                                        </ResultPanel>
                                    )}
                                </div>
                            </section>

                            <section className="panel-strong">
                                <div className="border-b border-hairlineSoft px-6 py-4">
                                    <h3 className="section-title">3. Catatan Estimator</h3>
                                    <p className="section-copy mt-1">
                                        Gunakan untuk pertanyaan spesifik seputar RAB, material, margin, atau strategi biaya project ini.
                                    </p>
                                </div>

                                <form onSubmit={askAssistant} className="space-y-4 p-6">
                                    <div>
                                        <div className="mb-2 text-sm font-semibold text-ink">Pertanyaan cepat</div>
                                        <div className="grid gap-2">
                                            {assistantPrompts.map((question) => (
                                                <button
                                                    key={question}
                                                    type="button"
                                                    onClick={() => askQuickQuestion(question)}
                                                    className="rounded-md border border-hairlineSoft bg-softCloud px-3 py-2 text-left text-sm text-ash transition hover:bg-white hover:text-ink"
                                                >
                                                    {question}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-ink">
                                            Pertanyaan
                                        </label>
                                        <textarea
                                            value={assistantForm.data.assistant_question}
                                            onChange={(e) =>
                                                assistantForm.setData('assistant_question', e.target.value)
                                            }
                                            rows="5"
                                            placeholder="Contoh: Item RAB mana yang terlalu mahal dan material apa yang bisa diganti?"
                                            className="textarea-field"
                                        />
                                        {assistantForm.errors.assistant_question && (
                                            <div className="mt-2 text-sm text-sale">
                                                {assistantForm.errors.assistant_question}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={assistantForm.processing}
                                        className="btn-success w-full"
                                    >
                                        {assistantForm.processing ? 'Memproses...' : 'Kirim Pertanyaan'}
                                    </button>
                                </form>

                                {flash.ai_assistant && (
                                    <div className="px-6 pb-6">
                                        <ResultPanel>
                                            <ResultBlock title="Jawaban">{flash.ai_assistant.answer}</ResultBlock>
                                            <List title="Poin penting" items={flash.ai_assistant.key_points} />
                                            <List title="Rekomendasi" items={flash.ai_assistant.recommendations} />
                                            <List title="Aksi lanjutan" items={flash.ai_assistant.follow_up_actions} />
                                        </ResultPanel>
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>
            </div>
        </AppLayout>
    );
}

function Metric({ label, value, strong = false }) {
    return (
        <div className="rounded-md border border-hairlineSoft bg-white p-4">
            <div className="text-xs uppercase tracking-[0.16em] text-mute">{label}</div>
            <div className={`mt-2 break-words text-lg font-semibold ${strong ? 'text-infoDeep' : 'text-ink'}`}>
                {value}
            </div>
        </div>
    );
}

function MiniMetric({ label, value }) {
    return (
        <div className="rounded-md bg-white p-3">
            <div className="text-xs uppercase tracking-wide text-mute">{label}</div>
            <div className="mt-1 font-semibold capitalize text-ink">{value}</div>
        </div>
    );
}

function ReadinessPanel({ insights = {} }) {
    const score = Number(insights.readiness_score ?? 0);
    const tone = score >= 75 ? 'text-success' : score >= 45 ? 'text-infoDeep' : 'text-sale';
    const bar = score >= 75 ? 'bg-success' : score >= 45 ? 'bg-info' : 'bg-sale';

    return (
        <div className="panel-strong p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-xs uppercase tracking-[0.16em] text-mute">Kesiapan data</div>
                    <div className={`mt-2 text-3xl font-semibold ${tone}`}>{score}%</div>
                </div>
                <div className="rounded-md border border-hairlineSoft bg-softCloud px-3 py-2 text-sm font-semibold text-ink">
                    {insights.material_count ?? 0} material
                </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-hairlineSoft">
                <div className={`h-full rounded-full ${bar}`} style={{ width: `${score}%` }} />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <MiniMetric label="Group" value={insights.group_count ?? 0} />
                <MiniMetric label="No Price" value={insights.missing_prices ?? 0} />
                <MiniMetric label="No Material" value={insights.without_material ?? 0} />
            </div>

            <List title="Aksi prioritas" items={insights.priority_actions} />
        </div>
    );
}

function ConfidenceBadge({ value }) {
    const normalized = String(value || 'medium').toLowerCase();
    const className = normalized === 'high'
        ? 'bg-success/10 text-success'
        : normalized === 'low'
        ? 'bg-sale/10 text-sale'
        : 'bg-info/10 text-infoDeep';

    return (
        <span className={`inline-flex rounded-sm px-2 py-1 text-xs font-semibold capitalize ${className}`}>
            {normalized}
        </span>
    );
}

function ResultPanel({ children }) {
    return (
        <div className="space-y-4 rounded-md border border-hairlineSoft bg-softCloud p-4 text-sm text-ash">
            {children}
        </div>
    );
}

function ResultBlock({ title, children }) {
    return (
        <div>
            <div className="font-semibold text-ink">{title}</div>
            <p className="mt-1">{children}</p>
        </div>
    );
}

function List({ title, items = [] }) {
    const validItems = items?.filter(Boolean) || [];

    if (!validItems.length) {
        return null;
    }

    const renderItem = (item) => {
        if (typeof item === 'string') {
            return item;
        }

        if (item?.action) {
            return `${item.priority ? `[${item.priority}] ` : ''}${item.action}${item.reason ? ` - ${item.reason}` : ''}`;
        }

        if (item?.label) {
            return `${item.label}${item.detail ? ` - ${item.detail}` : ''}`;
        }

        if (item?.name) {
            return `${item.name}${item.reason ? `: ${item.reason}` : ''}${item.suggestion ? `. ${item.suggestion}` : ''}`;
        }

        return JSON.stringify(item);
    };

    return (
        <div>
            <div className="font-semibold text-ink">{title}</div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
                {validItems.map((item, index) => (
                    <li key={index}>{renderItem(item)}</li>
                ))}
            </ul>
        </div>
    );
}

function Alert({ children }) {
    return (
        <div className="rounded-md border border-sale/20 bg-sale/10 p-4 text-sm text-sale">
            {children}
        </div>
    );
}

function InfoAlert({ children }) {
    return (
        <div className="rounded-md border border-info/20 bg-info/10 p-4 text-sm text-infoDeep">
            {children}
        </div>
    );
}
