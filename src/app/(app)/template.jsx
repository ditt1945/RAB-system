// Dibuat ulang setiap pindah halaman: isi halaman muncul dengan efek halus.
export default function PageTransition({ children }) {
  return <div className="animate-page-in space-y-5">{children}</div>;
}
