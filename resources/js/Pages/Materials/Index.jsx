import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import DataTable from '@/Components/Tables/DataTable';
import TableHeader from '@/Components/Tables/TableHeader';
import TablePagination from '@/Components/Tables/TablePagination';
import useDebouncedSearch from '@/Utils/useDebouncedSearch';
import { formatCurrency } from '@/Utils/formatters';

export default function Index({ auth, materials, filters }) {
    const { delete: destroy } = useForm();
    const [search, setSearch] = useDebouncedSearch('materials.index', filters.search);

    return (
        <AppLayout
            user={auth.user}
            header={
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="page-title">Materials</h2>
                        <p className="section-copy mt-1">Daftar material untuk dihitung dalam RAB dan estimasi biaya.</p>
                    </div>
                    <Link
                        href={route('materials.create')}
                        className="btn-primary"
                    >
                        New Material
                    </Link>
                </div>
            }
        >
            <Head title="Materials" />

            <div className="content-shell">
                    <div className="panel-strong overflow-hidden">
                        <div className="p-5">
                            <div className="mb-6">
                                <input
                                    type="text"
                                    value={search}
                                    placeholder="Search material..."
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="input-field"
                                />
                            </div>

                            <DataTable>
                                <TableHeader>
                                    <th className="px-5 py-4">Material</th>
                                    <th className="px-5 py-4">Category</th>
                                    <th className="px-5 py-4">Unit</th>
                                    <th className="px-5 py-4 text-right">Unit Price</th>
                                    <th className="px-5 py-4">Supplier</th>
                                    <th className="px-5 py-4 text-right">Action</th>
                                </TableHeader>
                                <tbody>
                                        {materials.data.length > 0 ? (
                                            materials.data.map((material) => (
                                                <tr key={material.id}>
                                                    <td className="px-5 py-4 font-medium text-ink">{material.name}</td>
                                                    <td className="px-5 py-4 text-gray-600">{material.category || '-'}</td>
                                                    <td className="px-5 py-4 text-gray-600">{material.unit || '-'}</td>
                                                    <td className="px-5 py-4 text-right text-ink">{formatCurrency(material.unit_price)}</td>
                                                    <td className="px-5 py-4 text-gray-600">{material.supplier || '-'}</td>
                                                    <td className="px-5 py-4">
                                                        <div className="table-actions">
                                                        <Link
                                                            href={route('materials.edit', material.id)}
                                                            className="btn-secondary"
                                                        >
                                                            Edit
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (confirm('Delete this material?')) {
                                                                    destroy(route('materials.destroy', material.id));
                                                                }
                                                            }}
                                                            className="btn-danger"
                                                        >
                                                            Delete
                                                        </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="6"
                                                    className="px-5 py-12 text-center text-gray-500"
                                                >
                                                    No materials found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                            </DataTable>

                            <TablePagination links={materials.links} />
                        </div>
                    </div>
            </div>
        </AppLayout>
    );
}
