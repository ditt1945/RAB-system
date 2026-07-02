import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ auth, material }) {
    const { data, setData, put, processing, errors } = useForm({
        name: material.name || '',
        category: material.category || '',
        unit: material.unit || '',
        unit_price: material.unit_price || 0,
        supplier: material.supplier || '',
        description: material.description || '',
    });

    const submit = (e) => {
        e.preventDefault();

        put(route('materials.update', material.id));
    };

    return (
        <AppLayout
            user={auth.user}
            header={
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="page-title">Edit Material</h2>
                        <p className="section-copy mt-1">Perbarui harga, satuan, kategori, dan pemasok material.</p>
                    </div>

                    <Link href={route('materials.index')} className="btn-secondary">
                        Back
                    </Link>
                </div>
            }
        >
            <Head title="Edit Material" />

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
                                Update Material
                            </button>
                        </form>
                    </div>
            </div>
        </AppLayout>
    );
}

