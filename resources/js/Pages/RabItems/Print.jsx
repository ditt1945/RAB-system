import { Head, Link } from '@inertiajs/react';
import { Fragment } from 'react';
import { formatCurrency } from '@/Utils/formatters';

export default function Print({ project, rabItems, summary }) {
    const groupedItems = rabItems.reduce((groups, item) => {
        const group = item.group_name || 'Ungrouped';
        groups[group] = groups[group] || [];
        groups[group].push(item);

        return groups;
    }, {});

    return (
        <>
            <Head title={`Print RAB - ${project.project_name}`} />

            <div className="min-h-screen bg-white p-8 text-gray-900 print:p-0">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-6 flex items-center justify-between print:hidden">
                        <Link
                            href={route('rab.index', project.id)}
                            className="btn-secondary"
                        >
                            Back
                        </Link>

                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="btn-primary"
                        >
                            Save as PDF
                        </button>
                    </div>

                    <header className="mb-8 border-b border-gray-300 pb-4">
                        <h1 className="text-2xl font-bold">Rencana Anggaran Biaya</h1>
                        <div className="mt-3 grid gap-1 text-sm">
                            <div>Project: {project.project_name}</div>
                            <div>Client: {project.client_name}</div>
                            <div>Status: {project.status}</div>
                        </div>
                    </header>

                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-3 py-2 text-left">Name</th>
                                <th className="border border-gray-300 px-3 py-2 text-left">Material</th>
                                <th className="border border-gray-300 px-3 py-2 text-left">Category</th>
                                <th className="border border-gray-300 px-3 py-2 text-right">Volume</th>
                                <th className="border border-gray-300 px-3 py-2 text-left">Unit</th>
                                <th className="border border-gray-300 px-3 py-2 text-right">Unit Price</th>
                                <th className="border border-gray-300 px-3 py-2 text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(groupedItems).map(([group, items]) => (
                                <Fragment key={group}>
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="border border-gray-300 bg-gray-50 px-3 py-2 font-semibold"
                                        >
                                            {group}
                                        </td>
                                    </tr>

                                    {items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="border border-gray-300 px-3 py-2">{item.name}</td>
                                            <td className="border border-gray-300 px-3 py-2">
                                                {item.material?.name || '-'}
                                            </td>
                                            <td className="border border-gray-300 px-3 py-2">
                                                {item.category || '-'}
                                            </td>
                                            <td className="border border-gray-300 px-3 py-2 text-right">
                                                {item.volume}
                                            </td>
                                            <td className="border border-gray-300 px-3 py-2">{item.unit || '-'}</td>
                                            <td className="border border-gray-300 px-3 py-2 text-right">
                                                {formatCurrency(item.unit_price)}
                                            </td>
                                            <td className="border border-gray-300 px-3 py-2 text-right">
                                                {formatCurrency(item.subtotal)}
                                            </td>
                                        </tr>
                                    ))}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>

                    <div className="ml-auto mt-6 w-full max-w-sm space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{formatCurrency(summary.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Discount</span>
                            <span>{formatCurrency(summary.discount)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>PPN {summary.tax_percent}%</span>
                            <span>{formatCurrency(summary.tax_amount)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Service Fee</span>
                            <span>{formatCurrency(summary.service_fee)}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-300 pt-2 text-lg font-bold">
                            <span>Grand Total</span>
                            <span>{formatCurrency(summary.grand_total)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
