/** Logo aplikasi: kotak oranye "RK" + nama (tidak pernah terpotong ke baris kedua). */
export default function Logo({ compact = false, inverted = false }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-500 text-[11px] font-black tracking-tight text-white">RK</span>
      {!compact && (
        <span className={`whitespace-nowrap text-sm font-bold tracking-tight ${inverted ? 'text-white' : 'text-navy-900'}`}>
          Sistem RAB <span className="text-brand-600">Kontraktor</span>
        </span>
      )}
    </span>
  );
}
