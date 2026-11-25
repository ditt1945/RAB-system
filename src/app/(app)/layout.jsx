import { requirePageUser } from '@/lib/auth';
import AppShell from '@/components/AppShell';

// Satu kerangka untuk semua halaman setelah login: sidebar tidak dimuat ulang saat pindah halaman.
export default async function AppLayout({ children }) {
  const user = await requirePageUser();
  return <AppShell user={user}>{children}</AppShell>;
}
