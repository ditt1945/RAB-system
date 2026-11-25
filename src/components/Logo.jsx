/** Logo aplikasi: kotak oranye "RK" + nama. */
export default function Logo({ compact = false, inverted = false }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-[11px] font-black tracking-tight text-white">RK</span>
      {!compact && (
        <span className={`text-[15px] font-bold tracking-tight ${inverted ? 'text-white' : 'text-navy-900'}`}>
          Sistem RAB <span className="text-brand-600">Kontraktor</span>
        </span>
      )}
    </span>
  );
}
