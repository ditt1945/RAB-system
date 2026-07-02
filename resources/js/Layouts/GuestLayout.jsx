import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-softCloud px-4 pt-6 text-ink sm:justify-center sm:pt-0">
            <div className="text-center">
                <Link href="/">
                    <ApplicationLogo className="mx-auto h-12 w-12 fill-current text-ink" />
                </Link>
                <div className="mt-3 text-lg font-semibold">RAB System</div>
                <div className="text-sm text-mute">Estimasi biaya kontraktor</div>
            </div>

            <div className="panel-strong mt-6 w-full overflow-hidden px-6 py-6 sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
