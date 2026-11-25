// Kerangka sementara selama data halaman dimuat (sidebar tetap tampil).
export default function Loading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Memuat halaman">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="skeleton h-7 w-64" />
          <div className="skeleton h-4 w-96 max-w-full" />
        </div>
        <div className="skeleton hidden h-9 w-32 sm:block" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-24" />
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="skeleton h-11 rounded-none" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 border-t border-slate-100 px-5 py-4">
            <div className="skeleton h-4 flex-1" />
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-4 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}
