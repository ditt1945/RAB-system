export default function LoadingOverlay({ message = 'Loading...' }) {
    return (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-white/70">
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-hairlineSoft bg-white/95 px-6 py-5 shadow-lg">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-ink border-r-transparent" />
                <p className="text-sm font-medium text-ink">{message}</p>
            </div>
        </div>
    );
}
