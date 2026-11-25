# Sistem RAB Kontraktor

Aplikasi web untuk merencanakan dan menghitung **Rencana Anggaran Biaya (RAB)** proyek konstruksi berdasarkan **AHSP** (Analisa Harga Satuan Pekerjaan), dengan rekomendasi AI dan export PDF.

| Data | Isi |
|---|---|
| Nama | Radittya Vitsava Darma |
| Kelas | XII RPL 2 |
| Judul | Sistem RAB (Rencana Anggaran Biaya) berbasis web untuk bidang usaha kontraktor |
| Bahasa / Framework | JavaScript, Next.js 16 (App Router) |
| Database | MySQL / MariaDB (Prisma ORM) |
| Target pengguna | UMKM / Pengusaha, Karyawan / Perusahaan |

Dokumen: [PRD](docs/PRD.md) · [Flowchart](docs/FLOWCHART.md) · [Audit 20 Nov](docs/AUDIT-2026-11-20.md) · [Audit 23 Nov](docs/AUDIT-2026-11-23.md) · [Audit UI/UX 25 Nov](docs/UIUX-AUDIT-2026-11-25.md)

## Fitur (sesuai spesifikasi UKK)

1. **Manajemen proyek dan data pekerjaan**: CRUD proyek, pencarian, filter status, dashboard dengan panduan langkah memulai. Alur proyek: Data proyek → Susun RAB → Preview & PDF.
2. **Perhitungan RAB otomatis**: harga satuan dihitung dari AHSP (koefisien × harga upah/bahan/alat + overhead), subtotal = volume × harga satuan, rekap dengan PPN 11% dan pembulatan.
3. **Rekomendasi AI pekerjaan dan material (Gemini)**: AI memilih pekerjaan dari katalog AHSP dan memperkirakan volume; sistem menghitung kebutuhan material dari koefisien bahan AHSP × volume. Harga tetap dari AHSP. Ada model cadangan kalau model utama penuh.
4. **Penyimpanan dan pengelolaan RAB**: mulai dari template / saran AI / katalog, tambah cepat dari katalog, volume diketik langsung di tabel, hapus dengan Batalkan, kelompok pekerjaan, perbarui harga, komposisi biaya, dan perkiraan kebutuhan material.
5. **Preview dan export PDF**: dokumen RAB dengan kop + logo perusahaan, nomor RAB, tabel per kelompok, rekapitulasi, terbilang, tanda tangan klien dan pembuat. Dua versi: untuk klien, dan internal (dengan lampiran material & komposisi biaya).

Tampilan: tema terang, responsif sampai HP (kartu item, bar total, navigasi bawah).

Peran: **admin** (mengelola master AHSP, kategori, dan harga) dan **estimator** (menyusun RAB, hanya bisa melihat master AHSP).

## Menjalankan

Kebutuhan: Node.js 20+, MySQL/MariaDB (misalnya XAMPP).

```bash
npm install                 # otomatis menjalankan prisma generate
cp .env.example .env        # lalu isi nilainya
npx prisma migrate deploy   # buat tabel
npx prisma db seed          # data AHSP + akun admin + proyek contoh
npm run dev                 # http://localhost:3000
```

Seed membuat akun admin `admin@rab.local`. Jika `SEED_ADMIN_PASSWORD` tidak diisi, kata sandi acak dicetak sekali di terminal.

Saat development, isi `DEMO_LOGIN_EMAIL` dan `DEMO_LOGIN_PASSWORD` di `.env` untuk memunculkan tombol "Masuk cepat" di halaman login (tidak muncul di production).

Perintah lain: `npm test` (unit test perhitungan, pembulatan, kebutuhan material, validasi), `npm run lint`, `npm run build`.

## Struktur

```text
prisma/schema.prisma        model data (User, Project, RabItem, Resource, Ahsp, AhspComponent, ...)
prisma/seed.mjs             data awal AHSP (SNI / Permen PUPR) + admin
src/lib/calculations/rab.js SATU-SATUNYA tempat rumus HSP & RAB (decimal.js)
src/lib/rab-data.js         query RAB bersama (halaman, API, preview, PDF)
src/lib/api.js              helper API: cek login/admin, serialisasi, error
src/lib/validation/         skema validasi Zod
src/lib/ai/gemini.js        rekomendasi AI berbasis katalog AHSP
src/lib/pdf/rabDocument.js  generator PDF
src/app/                    halaman & API route (App Router)
tests/                      unit test (Vitest)
```

Jangan commit `.env` atau dump database.
