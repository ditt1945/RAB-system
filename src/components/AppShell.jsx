import AppFrame from '@/components/AppFrame';

/** Kerangka halaman setelah login (dipakai oleh layout grup (app)). */
export default function AppShell({ user, children }) {
  return <AppFrame user={{ name: user.name, email: user.email, role: user.role }}>{children}</AppFrame>;
}
