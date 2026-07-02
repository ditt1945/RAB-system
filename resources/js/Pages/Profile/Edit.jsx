import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AppLayout
            header={
                <div>
                    <h2 className="page-title">Profile</h2>
                    <p className="section-copy mt-1">Kelola informasi akun, password, dan pengaturan keamanan.</p>
                </div>
            }
        >
            <Head title="Profile" />

            <div className="content-shell">
                    <div className="panel-strong p-6">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="panel-strong p-6">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="panel-strong p-6">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
            </div>
        </AppLayout>
    );
}

