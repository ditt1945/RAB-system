import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        category: '',
        unit: '',
        unit_price: 0,
        supplier: '',
        description: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('materials.store'));
    };

    return (
        <AppLayout
            user={auth.user}
            header={
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="page-title">Create Material</h2>
                        <p className="section-copy mt-1">Tambahkan harga material sebagai referensi penyusunan RAB.</p>
                    </div>

                    <Link href={route('materials.index')} className="btn-secondary">
                        Back
                    </Link>
                </div>
            }
        >
            <Head title="Create Material" />

            <div className="form-shell">
                    <div className="panel-strong p-6">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label className="form-label">Material Name</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="input-field"
                                />
                                {errors.name && <div className="form-error">{errors.name}</div>}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="form-label">Category</label>
                                    <input
                                        type="text"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="form-label">Unit</label>
                                    <input
                                        type="text"
                                        value={data.unit}
                                        onChange={(e) => setData('unit', e.target.value)}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="form-label">Unit Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.unit_price}
                                        onChange={(e) => setData('unit_price', e.target.value)}
                                        className="input-field"
                                    />
                                    {errors.unit_price && (
                                        <div className="form-error">{errors.unit_price}</div>
                                    )}
                                </div>

                                <div>
                                    <label className="form-label">Supplier</label>
                                    <input
                                        type="text"
                                        value={data.supplier}
                                        onChange={(e) => setData('supplier', e.target.value)}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows="4"
                                    className="textarea-field"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-primary"
                            >
                                Save Material
                            </button>
                        </form>
                    </div>
            </div>
        </AppLayout>
    );
}

