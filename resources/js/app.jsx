import '../css/app.css';

import PageSkeleton from '@/Components/Feedback/PageSkeleton';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { Component } from 'react';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

function getInitialPage() {
    const page = document.getElementById('app')?.dataset?.page;

    if (!page) {
        return null;
    }

    return JSON.parse(page);
}

function RuntimeError({ error }) {
    return (
        <div className="min-h-screen bg-white p-6 text-slate-900">
            <div className="mx-auto mt-12 max-w-2xl rounded-md border border-red-200 bg-red-50 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-red-700">React runtime error</p>
                <h1 className="mt-2 text-xl font-semibold text-red-950">Aplikasi gagal dimuat</h1>
                <pre className="mt-4 max-h-80 overflow-auto rounded-md bg-white p-4 text-sm text-red-900">
                    {String(error?.message || error)}
                </pre>
            </div>
        </div>
    );
}

class RootErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    render() {
        if (this.state.error) {
            return <RuntimeError error={this.state.error} />;
        }

        return this.props.children;
    }
}

createInertiaApp({
    page: getInitialPage(),
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <RootErrorBoundary>
                <PageSkeleton>
                    <App {...props} />
                </PageSkeleton>
            </RootErrorBoundary>,
        );
    },
    progress: {
        color: '#4B5563',
    },
}).catch((error) => {
    const el = document.getElementById('app');
    if (el) {
        createRoot(el).render(<RuntimeError error={error} />);
    }
});
