import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

function createAdapter() {
  const url = new URL(process.env.DATABASE_URL || 'mysql://root:@127.0.0.1:3306/rab_system_ukk');
  return new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    connectionLimit: 5,
    // Kalau MySQL mati, gagal cepat (lalu tampil halaman "Pastikan database sudah berjalan")
    // daripada halaman loading terus tanpa akhir.
    connectTimeout: 5000,
    acquireTimeout: 7000,
  });
}

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter: createAdapter() });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
