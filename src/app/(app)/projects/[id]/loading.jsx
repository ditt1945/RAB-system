// Kerangka halaman Susun RAB selama dimuat: bentuknya mirip halaman aslinya.
export default function Loading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Memuat RAB">
      <div className="skeleton h-4 w-56" />
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="skeleton h-7 w-72" />
          <div className="skeleton h-4 w-52" />
        </div>
        <div className="hidden gap-2 sm:flex">
          <div className="skeleton h-9 w-28" />
          <div className="skeleton h-9 w-36" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_20rem]">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="p-4">
            <div className="skeleton h-9 w-full" />
          </div>
          <div className="skeleton h-10 rounded-none" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-4 border-t border-slate-100 px-4 py-3.5">
              <div className="skeleton h-4 w-6" />
              <div className="skeleton h-4 flex-1" />
              <div className="skeleton h-4 w-16" />
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-4 w-24" />
            </div>
          ))}
        </div>
        <div className="hidden space-y-3 rounded-xl border border-slate-200 bg-white p-5 xl:block">
          <div className="skeleton h-5 w-28" />
          <div className="skeleton h-24" />
          <div className="skeleton h-4" />
          <div className="skeleton h-4" />
          <div className="skeleton h-4" />
        </div>
      </div>
    </div>
  );
}
