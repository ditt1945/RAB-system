# Import Legacy Data Script — rab_system → rab_system_next

**Prerequisites:**
- MySQL/MariaDB sudah berjalan di `127.0.0.1:3306` (XAMPP/WinService).
- Database `rab_system` ada (legacy) dan `rab_system_next` siap (target).
- File `.env` target mengarah ke `rab_system_next`.
- User root tanpa password (`''`) atau sesuaikan konfigurasi pool koneksi.

---

## Jalankan Skrip Migrasi

```powershell
cd C:\Project\rab-system-next
npx tsx scripts/migrate-legacy.ts
```

Output sukses menampilkan jumlah record untuk setiap tabel yang diimpor:
- Users
- Materials
- Projects
- Rab Items

Status migrasi akan ditambahkan ke dokumentasi final.

---

## Catatan Penting

- Skrip menggunakan adapter Prisma MariaDB (`@prisma/adapter-mariadb`).
- Tidak menggunakan Laravel; semua data langsung dari database MySQL via mariadb driver.
- Jika gagal ECONNREFUSED 3306: pastikan MySQL sedang aktif (cek XAMPP Control Panel / task manager).
- Jika gagal authentication: update `.env` atau konfigurasikan pool koneksi user/password sesuai environment lokal.

---

## Alternative Manual Migration (fallback)

Jika skrip tsx tidak bisa dijalankan karena dependensi, lakukan manual via:
1. Export legacy data dengan `mysqldump rab_system --result-file=rab_legacy.sql`
2. Buat seed file Next.js (`scripts/seeds/rab-seed.ts`) untuk insert data dengan `prisma.$queryRawUnsafe`
3. Jalankan seed: `npx tsx scripts/seeds/rab-seed.ts`
