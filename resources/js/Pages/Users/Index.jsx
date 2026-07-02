import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import DataTable from '@/Components/Tables/DataTable';
import TableHeader from '@/Components/Tables/TableHeader';
import SecondaryButton from '@/Components/UI/SecondaryButton';
import DangerButton from '@/Components/UI/DangerButton';
import useDebouncedSearch from '@/Utils/useDebouncedSearch';

export default function Index({ auth, users, filters = {} }) {
    const form = useForm();
    const { delete: destroy, errors } = useForm();
    const [search, setSearch] = useDebouncedSearch('users.index', filters.search);

    const toggleAdmin = (userId, makeAdmin) => {
        form.patch(route('users.update', userId), {
            preserveScroll: true,
            data: { role: makeAdmin ? 'admin' : null },
        });
    };

    const deleteUser = (user) => {
        if (confirm(`Hapus user ${user.name}? Data project milik user ini juga bisa ikut terhapus.`)) {
            destroy(route('users.destroy', user.id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout
            user={auth.user}
            header={
                <div>
                    <h2 className="page-title">User Management</h2>
                    <p className="section-copy mt-1">Kelola akses, role, dan akun pengguna.</p>
                </div>
            }
        >
            <Head title="Users" />

            <div className="content-shell">
                <div className="panel-strong overflow-hidden">
                    <div className="p-5">
                        <div className="mb-5">
                            <input
                                type="text"
                                value={search}
                                placeholder="Search user..."
                                onChange={(e) => setSearch(e.target.value)}
                                className="input-field"
                            />
                            {errors.user && <div className="form-error">{errors.user}</div>}
                        </div>

                        <DataTable>
                            <TableHeader>
                                <th className="px-5 py-4">Name</th>
                                <th className="px-5 py-4">Email</th>
                                <th className="px-5 py-4">Roles</th>
                                <th className="px-5 py-4 text-right">Actions</th>
                            </TableHeader>
                            <tbody>
                                {users.data.map((user) => (
                                    <tr key={user.id} className="border-t border-hairlineSoft bg-white">
                                        <td className="px-5 py-4 text-sm text-ink">{user.name}</td>
                                        <td className="px-5 py-4 text-sm text-gray-600">{user.email}</td>
                                        <td className="px-5 py-4 text-sm text-gray-600">
                                            {user.roles?.length ? (
                                                user.roles.map((r) => (
                                                    <span key={r.name} className="mr-2 inline-block rounded-sm bg-softCloud px-2 py-1 text-xs text-ink">
                                                        {r.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-mute">User</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="table-actions">
                                                <SecondaryButton
                                                    type="button"
                                                    onClick={() => toggleAdmin(user.id, !user.roles?.some((r) => r.name === 'admin'))}
                                                >
                                                    {user.roles?.some((r) => r.name === 'admin') ? 'Revoke Admin' : 'Make Admin'}
                                                </SecondaryButton>
                                                <DangerButton
                                                    type="button"
                                                    disabled={user.id === auth.user.id}
                                                    onClick={() => deleteUser(user)}
                                                >
                                                    Delete
                                                </DangerButton>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {users.data.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-5 py-12 text-center text-gray-500">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </DataTable>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
