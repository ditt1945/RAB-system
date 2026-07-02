import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Fragment, useMemo, useState } from 'react';
import DataTable from '@/Components/Tables/DataTable';
import TableHeader from '@/Components/Tables/TableHeader';
import PrimaryButton from '@/Components/UI/PrimaryButton';
import SecondaryButton from '@/Components/UI/SecondaryButton';
import DangerButton from '@/Components/UI/DangerButton';
import { formatCurrency } from '@/Utils/formatters';

export default function Index({ auth, project, rabItems, materials, summary, revisions = [], changeOrders = [] }) {
    const [editingItemId, setEditingItemId] = useState(null);

    const createForm = useForm({
        material_id: '',
        group_name: '',
        name: '',
        category: '',
        volume: 0,
        unit: '',
        unit_price: 0,
    });

    const editForm = useForm({
        material_id: '',
        group_name: '',
        name: '',
        category: '',
        volume: 0,
        unit: '',
        unit_price: 0,
    });

    const summaryForm = useForm({
        rab_discount: summary.discount || 0,
        rab_tax_percent: summary.tax_percent || 0,
        rab_service_fee: summary.service_fee || 0,
        target_margin_percent: summary.target_margin_percent || 0,
    });

    const revisionForm = useForm({
        label: `Revisi ${revisions.length + 1}`,
        notes: '',
    });

    const changeOrderForm = useForm({
        title: '',
        description: '',
        amount: 0,
        status: 'draft',
        requested_at: new Date().toISOString().slice(0, 10),
    });

    const { delete: destroy } = useForm();

    const groupedItems = useMemo(() => {
        return rabItems.reduce((groups, item) => {
            const group = item.group_name || 'Ungrouped';
            groups[group] = groups[group] || [];
            groups[group].push(item);

            return groups;
        }, {});
    }, [rabItems]);
    const materialCoverage = rabItems.length > 0
        ? Math.round((rabItems.filter((item) => item.material_id).length / rabItems.length) * 100)
        : 0;
    const adjustmentRows = [
        { label: 'Subtotal', value: summary.subtotal },
        { label: 'Discount', value: -summary.discount },
        { label: `PPN ${summary.tax_percent}%`, value: summary.tax_amount },
        { label: 'Service Fee', value: summary.service_fee },
    ];
    const createPreviewTotal = Number(createForm.data.volume || 0) * Number(createForm.data.unit_price || 0);
    const approvedChangeTotal = changeOrders
        .filter((order) => order.status === 'approved')
        .reduce((total, order) => total + Number(order.amount || 0), 0);
    const projectedTotal = Number(summary.grand_total || 0) + approvedChangeTotal;
    const riskTone = summary.risk_level === 'low'
        ? 'bg-tealSoft text-success'
        : summary.risk_level === 'medium'
        ? 'bg-amberSoft text-warning'
        : 'bg-orange-100 text-saleDeep';

    const applyMaterial = (form, materialId) => {
        const material = materials.find((item) => String(item.id) === materialId);

        form.setData('material_id', materialId);

        if (material) {
            form.setData('name', material.name || '');
            form.setData('category', material.category || '');
            form.setData('unit', material.unit || '');
            form.setData('unit_price', material.unit_price || 0);
        }
    };

    const submit = (e) => {
        e.preventDefault();

        createForm.post(route('rab.store', project.id), {
            preserveScroll: true,
            onSuccess: () =>
                createForm.reset(
                    'material_id',
                    'group_name',
                    'name',
                    'category',
                    'volume',
                    'unit',
                    'unit_price',
                ),
        });
    };

    const startEdit = (item) => {
        setEditingItemId(item.id);
        editForm.setData({
            material_id: item.material_id || '',
            group_name: item.group_name || '',
            name: item.name || '',
            category: item.category || '',
            volume: item.volume || 0,
            unit: item.unit || '',
            unit_price: item.unit_price || 0,
        });
    };

    const updateItem = (e, item) => {
        e.preventDefault();

        editForm.put(route('rab.update', [project.id, item.id]), {
            preserveScroll: true,
            onSuccess: () => setEditingItemId(null),
        });
    };

    const updateSummary = (e) => {
        e.preventDefault();

        summaryForm.patch(route('rab.summary.update', project.id), {
            preserveScroll: true,
        });
    };

    const saveRevision = (e) => {
        e.preventDefault();

        revisionForm.post(route('rab.revisions.store', project.id), {
            preserveScroll: true,
            onSuccess: () => revisionForm.reset('notes'),
        });
    };

    const saveChangeOrder = (e) => {
        e.preventDefault();

        changeOrderForm.post(route('rab.change-orders.store', project.id), {
            preserveScroll: true,
            onSuccess: () => changeOrderForm.reset('title', 'description', 'amount'),
        });
    };

    const renderInput = (form, key, type = 'text') => (
        <input
            type={type}
            step={type === 'number' ? '0.01' : undefined}
            value={form.data[key]}
            onChange={(e) => form.setData(key, e.target.value)}
            className="input-field"
        />
    );

    return (
        <AppLayout
            user={auth.user}
            contentClassName="max-w-[1600px]"
            header={
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="page-title">RAB Estimator</h2>
                        <p className="section-copy mt-1">
                            {project.project_name} · {project.client_name}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Link href={route('rab.ai', project.id)} className="btn-secondary">
                            Review Biaya
                        </Link>
                        <Link href={route('rab.export.csv', project.id)} className="btn-success">
                            Export CSV
                        </Link>
                        <Link href={route('rab.print', project.id)} className="btn-secondary">
                            Print PDF
                        </Link>
                        <Link href={route('projects.show', project.id)} className="btn-secondary">
                            Project
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`RAB - ${project.project_name}`} />

            <div className="mx-auto max-w-[1600px] space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <SummaryMetric label="Subtotal" value={formatCurrency(summary.subtotal)} description={`${rabItems.length} item pekerjaan`} />
                        <SummaryMetric label="Material Coverage" value={`${materialCoverage}%`} description="Item yang terhubung ke database material" />
                        <SummaryMetric label={`PPN ${summary.tax_percent}%`} value={formatCurrency(summary.tax_amount)} description="Pajak dari subtotal setelah diskon" />
                        <SummaryMetric label="Grand Total" value={formatCurrency(summary.grand_total)} description="Nilai final untuk laporan" strong />
                    </div>

                    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                        <div className="panel-strong p-5">
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h3 className="section-title">Readiness RAB</h3>
                                    <p className="section-copy mt-1">Kerapian data sebelum review dan export laporan.</p>
                                </div>
                                <span className="badge-status bg-tealSoft text-success">{materialCoverage}% linked</span>
                            </div>
                            <div className="mt-5 h-3 overflow-hidden rounded-full bg-field">
                                <div className="h-full rounded-full bg-success" style={{ width: `${materialCoverage}%` }} />
                            </div>
                            <div className="mt-4 grid gap-3 text-sm text-ash md:grid-cols-3">
                                <span>{Object.keys(groupedItems).length} grup pekerjaan</span>
                                <span>{materials.length} material tersedia</span>
                                <span>{rabItems.length} item dihitung</span>
                            </div>
                        </div>
                        <div className="panel-strong p-5">
                            <h3 className="section-title">Cost Breakdown</h3>
                            <div className="mt-4 space-y-3">
                                {adjustmentRows.map((row) => (
                                    <div key={row.label} className="flex items-center justify-between gap-4 text-sm">
                                        <span className="text-ash">{row.label}</span>
                                        <span className={`font-semibold ${row.value < 0 ? 'text-saleDeep' : 'text-ink'}`}>
                                            {formatCurrency(row.value)}
                                        </span>
                                    </div>
                                ))}
                                <div className="border-t border-hairlineSoft pt-3">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="font-semibold text-ink">Grand Total</span>
                                        <span className="font-semibold text-primary">{formatCurrency(summary.grand_total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-4 lg:grid-cols-3">
                        <div className="panel-strong p-5">
                            <div className="flex items-center justify-between gap-3">
                                <h3 className="section-title">Margin & Risk</h3>
                                <span className={`badge-status ${riskTone}`}>{summary.risk_level}</span>
                            </div>
                            <div className="mt-5 grid gap-3">
                                <MiniMetric label="Target Margin" value={`${summary.target_margin_percent}%`} />
                                <MiniMetric label="Margin Estimasi" value={formatCurrency(summary.target_margin_amount)} />
                                <MiniMetric label="Risk Score" value={`${summary.risk_score}/100`} />
                            </div>
                        </div>

                        <div className="panel-strong p-5">
                            <div className="flex items-center justify-between gap-3">
                                <h3 className="section-title">Revisi RAB</h3>
                                <span className="text-sm font-semibold text-ash">{revisions.length} snapshot</span>
                            </div>
                            <form onSubmit={saveRevision} className="mt-4 space-y-3">
                                <input
                                    type="text"
                                    value={revisionForm.data.label}
                                    onChange={(e) => revisionForm.setData('label', e.target.value)}
                                    className="input-field"
                                />
                                <textarea
                                    value={revisionForm.data.notes}
                                    onChange={(e) => revisionForm.setData('notes', e.target.value)}
                                    placeholder="Catatan perubahan..."
                                    className="textarea-field"
                                    rows="2"
                                />
                                <PrimaryButton type="submit" disabled={revisionForm.processing} className="w-full">
                                    Simpan Snapshot
                                </PrimaryButton>
                            </form>
                            <div className="mt-4 space-y-2">
                                {revisions.slice(0, 3).map((revision) => (
                                    <div key={revision.id} className="rounded-md border border-hairlineSoft bg-field p-3">
                                        <div className="text-sm font-semibold text-ink">{revision.label}</div>
                                        <div className="mt-1 text-xs text-ash">{formatCurrency(revision.grand_total)} · {revision.user?.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="panel-strong p-5">
                            <h3 className="section-title">Change Order</h3>
                            <div className="mt-4 rounded-md bg-field p-3">
                                <div className="text-sm text-ash">Projected Total</div>
                                <div className="mt-1 text-xl font-semibold text-primary">{formatCurrency(projectedTotal)}</div>
                            </div>
                            <form onSubmit={saveChangeOrder} className="mt-4 space-y-3">
                                <input
                                    type="text"
                                    value={changeOrderForm.data.title}
                                    onChange={(e) => changeOrderForm.setData('title', e.target.value)}
                                    placeholder="Judul perubahan scope"
                                    className="input-field"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={changeOrderForm.data.amount}
                                        onChange={(e) => changeOrderForm.setData('amount', e.target.value)}
                                        className="input-field"
                                    />
                                    <select
                                        value={changeOrderForm.data.status}
                                        onChange={(e) => changeOrderForm.setData('status', e.target.value)}
                                        className="input-field"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="submitted">Submitted</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                                <PrimaryButton type="submit" disabled={changeOrderForm.processing} className="w-full">
                                    Catat Change Order
                                </PrimaryButton>
                            </form>
                        </div>
                    </section>

                    <div className="grid items-start gap-6 2xl:grid-cols-[minmax(0,1fr)_380px]">
                        <section className="panel-strong min-w-0 overflow-hidden">
                            <div className="border-b border-hairlineSoft px-5 py-4">
                                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                                    <div>
                                        <h3 className="section-title">Item RAB</h3>
                                        <p className="section-copy mt-1">
                                            Kelola pekerjaan, volume, harga satuan, dan total biaya.
                                        </p>
                                    </div>
                                    <div className="text-sm font-semibold text-ash">
                                        {rabItems.length} item
                                    </div>
                                </div>
                            </div>

                            <DataTable className="rounded-none border-0" tableClassName="min-w-[980px] table-fixed">
                                <TableHeader>
                                    <th className="w-[32%] px-5 py-4">Item</th>
                                    <th className="w-[22%] px-5 py-4">Detail</th>
                                    <th className="w-[12%] px-5 py-4 text-right">Qty</th>
                                    <th className="w-[14%] px-5 py-4 text-right">Harga</th>
                                    <th className="w-[14%] px-5 py-4 text-right">Total</th>
                                    <th className="w-[6%] px-5 py-4 text-right">Aksi</th>
                                </TableHeader>
                                <tbody className="divide-y divide-hairlineSoft">
                                        {rabItems.length > 0 ? (
                                            Object.entries(groupedItems).map(([group, items]) => (
                                                <Fragment key={group}>
                                                    <tr className="bg-gray-100/70">
                                                        <td colSpan="6" className="px-5 py-3 text-sm font-semibold text-ink">
                                                            {group}
                                                        </td>
                                                    </tr>

                                                    {items.map((item) =>
                                                        editingItemId === item.id ? (
                                                            <tr key={item.id} className="bg-softCloud align-top">
                                                                <td colSpan="6" className="px-5 py-5">
                                                                    <form
                                                                        id={`edit-rab-${item.id}`}
                                                                        onSubmit={(e) => updateItem(e, item)}
                                                                        className="space-y-4"
                                                                    >
                                                                        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                                                                            <Field label="Group">
                                                                                {renderInput(editForm, 'group_name')}
                                                                            </Field>
                                                                            <Field label="Nama Item">
                                                                                {renderInput(editForm, 'name')}
                                                                            </Field>
                                                                            <Field label="Material">
                                                                                <select
                                                                                    value={editForm.data.material_id}
                                                                                    onChange={(e) => applyMaterial(editForm, e.target.value)}
                                                                                    className="input-field"
                                                                                >
                                                                                    <option value="">Manual</option>
                                                                                    {materials.map((material) => (
                                                                                        <option key={material.id} value={material.id}>
                                                                                            {material.name}
                                                                                        </option>
                                                                                    ))}
                                                                                </select>
                                                                            </Field>
                                                                            <Field label="Kategori">
                                                                                {renderInput(editForm, 'category')}
                                                                            </Field>
                                                                            <div className="grid grid-cols-2 gap-3">
                                                                                <Field label="Volume">
                                                                                    {renderInput(editForm, 'volume', 'number')}
                                                                                </Field>
                                                                                <Field label="Unit">
                                                                                    {renderInput(editForm, 'unit')}
                                                                                </Field>
                                                                            </div>
                                                                            <Field label="Harga Satuan">
                                                                                {renderInput(editForm, 'unit_price', 'number')}
                                                                            </Field>
                                                                        </div>
                                                                        <div className="flex flex-col gap-3 border-t border-hairlineSoft pt-4 sm:flex-row sm:items-center sm:justify-between">
                                                                            <div className="text-sm text-ash">
                                                                                Total preview:{' '}
                                                                                <span className="font-semibold text-ink">
                                                                                    {formatCurrency(editForm.data.volume * editForm.data.unit_price)}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex flex-wrap justify-end gap-2">
                                                                                <PrimaryButton type="submit" disabled={editForm.processing}>
                                                                                    Simpan
                                                                                </PrimaryButton>
                                                                                <SecondaryButton
                                                                                    type="button"
                                                                                    onClick={() => setEditingItemId(null)}
                                                                                >
                                                                                    Batal
                                                                                </SecondaryButton>
                                                                            </div>
                                                                        </div>
                                                                    </form>
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            <tr key={item.id} className="align-top hover:bg-gray-50">
                                                                <td className="px-5 py-4">
                                                                    <div className="max-w-[34rem] font-semibold leading-6 text-ink">
                                                                        {item.name}
                                                                    </div>
                                                                </td>
                                                                <td className="px-5 py-4">
                                                                    <div className="text-sm font-medium text-ash">
                                                                        {item.material?.name || 'Manual item'}
                                                                    </div>
                                                                    <div className="mt-1 text-sm text-mute">
                                                                        {item.category || '-'}
                                                                    </div>
                                                                </td>
                                                                <td className="px-5 py-4 text-right text-sm font-semibold text-ink">
                                                                    {Number(item.volume).toLocaleString('id-ID')} {item.unit || ''}
                                                                </td>
                                                                <td className="px-5 py-4 text-right text-sm text-ash">
                                                                    {formatCurrency(item.unit_price)}
                                                                </td>
                                                                <td className="px-5 py-4 text-right text-sm font-semibold text-ink">
                                                                    {formatCurrency(item.subtotal)}
                                                                </td>
                                                                <td className="px-5 py-4 text-right">
                                                                    <div className="flex flex-col items-end gap-2">
                                                                        <SecondaryButton type="button" onClick={() => startEdit(item)} className="w-20 px-3 py-1 text-sm">
                                                                            Edit
                                                                        </SecondaryButton>
                                                                        <DangerButton
                                                                            type="button"
                                                                            onClick={() => {
                                                                                if (confirm('Delete this item?')) {
                                                                                    destroy(route('rab.destroy', [project.id, item.id]));
                                                                                }
                                                                            }}
                                                                            className="w-20 px-3 py-1 text-sm"
                                                                        >
                                                                            Delete
                                                                        </DangerButton>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </Fragment>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-4 py-12 text-center text-gray-500">
                                                    Belum ada item RAB. Tambahkan item manual atau buat draft dari halaman review biaya.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </DataTable>
                        </section>

                        <aside className="space-y-6 2xl:sticky 2xl:top-28">
                            <section className="panel-strong">
                                <div className="border-b border-hairlineSoft px-5 py-4">
                                    <h3 className="section-title">Tambah Item</h3>
                                </div>

                                <form onSubmit={submit} className="space-y-4 p-6">
                                    <Field label="Group">{renderInput(createForm, 'group_name')}</Field>

                                    <Field label="Material">
                                        <select
                                            value={createForm.data.material_id}
                                            onChange={(e) => applyMaterial(createForm, e.target.value)}
                                            className="input-field"
                                        >
                                            <option value="">Manual item</option>
                                            {materials.map((material) => (
                                                <option key={material.id} value={material.id}>
                                                    {material.name} - {formatCurrency(material.unit_price)}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>

                                    <Field label="Name" error={createForm.errors.name}>
                                        {renderInput(createForm, 'name')}
                                    </Field>

                                    <Field label="Category">{renderInput(createForm, 'category')}</Field>

                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Volume" error={createForm.errors.volume}>
                                            {renderInput(createForm, 'volume', 'number')}
                                        </Field>

                                        <Field label="Unit">{renderInput(createForm, 'unit')}</Field>
                                    </div>

                                    <Field label="Unit Price" error={createForm.errors.unit_price}>
                                        {renderInput(createForm, 'unit_price', 'number')}
                                    </Field>

                                    <div className="rounded-md border border-hairlineSoft bg-field p-4">
                                        <div className="text-sm text-ash">Preview subtotal</div>
                                        <div className="mt-1 text-xl font-semibold text-ink">
                                            {formatCurrency(createPreviewTotal)}
                                        </div>
                                    </div>

                                    <PrimaryButton type="submit" disabled={createForm.processing} className="w-full">
                                        Add Item
                                    </PrimaryButton>
                                </form>
                            </section>

                            <section className="panel-strong">
                                <div className="border-b border-hairlineSoft px-5 py-4">
                                    <h3 className="section-title">Biaya & Pajak</h3>
                                </div>

                                <form onSubmit={updateSummary} className="space-y-4 p-6">
                                    <Field label="Discount">{renderInput(summaryForm, 'rab_discount', 'number')}</Field>
                                    <Field label="PPN (%)">{renderInput(summaryForm, 'rab_tax_percent', 'number')}</Field>
                                    <Field label="Service Fee">{renderInput(summaryForm, 'rab_service_fee', 'number')}</Field>
                                    <Field label="Target Margin (%)">{renderInput(summaryForm, 'target_margin_percent', 'number')}</Field>

                                    <PrimaryButton type="submit" disabled={summaryForm.processing} className="w-full">
                                        Update Summary
                                    </PrimaryButton>
                                </form>
                            </section>

                            <section className="panel-strong">
                                <div className="border-b border-hairlineSoft px-5 py-4">
                                    <h3 className="section-title">Change Log</h3>
                                </div>

                                <div className="space-y-3 p-5">
                                    {changeOrders.length > 0 ? (
                                        changeOrders.map((order) => (
                                            <div key={order.id} className="rounded-md border border-hairlineSoft bg-field p-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-semibold text-ink">{order.title}</p>
                                                        <p className="mt-1 text-xs text-ash">{order.status}</p>
                                                    </div>
                                                    <p className="text-sm font-semibold text-ink">{formatCurrency(order.amount)}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-ash">Belum ada change order.</p>
                                    )}
                                </div>
                            </section>
                        </aside>
                    </div>
            </div>
        </AppLayout>
    );
}

function MiniMetric({ label, value }) {
    return (
        <div className="rounded-md border border-hairlineSoft bg-field p-3">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-mute">{label}</div>
            <div className="mt-1 text-lg font-semibold text-ink">{value}</div>
        </div>
    );
}

function SummaryMetric({ label, value, description, strong = false }) {
    return (
        <div className="panel p-5">
            <div className="metric-label">{label}</div>
            <div className={`mt-1 text-xl font-semibold ${strong ? 'text-infoDeep' : 'text-ink'}`}>
                {value}
            </div>
            {description && <p className="mt-2 text-sm leading-5 text-ash">{description}</p>}
        </div>
    );
}

function Field({ label, error, children }) {
    return (
        <div>
            <label className="form-label">{label}</label>
            {children}
            {error && <div className="form-error">{error}</div>}
        </div>
    );
}
