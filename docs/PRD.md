# PRD: Sistem RAB Kontraktor

| Field | Isi |
|---|---|
| Produk | Sistem RAB (Rencana Anggaran Biaya) berbasis web untuk bidang usaha kontraktor |
| Penyusun | Radittya Vitsava Darma, XII RPL 2 |
| Jenis | Sistem Website (UKK) |
| Bidang | Konstruksi & Properti |
| Versi | 2.1 (v2.0: 20 November 2026; menggantikan `docs/_old/PRD-v1-2026-11-09.md`) |
| Tanggal | 23 November 2026 |
| Stack | JavaScript, Next.js 16 (App Router), Prisma 7, MySQL/MariaDB, NextAuth, Gemini API, PDFKit |
| Dokumen terkait | `docs/FLOWCHART.md`, `docs/AUDIT-2026-11-20.md`, `docs/AUDIT-2026-11-23.md` |

---

## 1. Latar Belakang

Kontraktor UMKM biasanya menyusun RAB di spreadsheet. Rumus mudah rusak, harga satuan diketik ulang di tiap proyek, analisa harga satuan (AHSP) disalin manual dari dokumen Permen PUPR, dan format laporan untuk klien tidak seragam.

Sistem ini menggantikan spreadsheet tersebut. Data AHSP disimpan sekali sebagai master. Pengguna cukup memilih pekerjaan dan mengisi volume, lalu sistem menghitung harga satuan, subtotal, dan total RAB. AI membantu menyarankan daftar pekerjaan, dan hasil akhirnya bisa dipratinjau lalu diekspor ke PDF.

## 2. Tujuan

1. Pengguna bisa menyusun RAB satu proyek tanpa menghitung manual.
2. Harga satuan pekerjaan berasal dari AHSP (koefisien × harga upah/bahan/alat), bukan angka yang dikarang.
3. Satu sumber perhitungan (server, `decimal.js`), sehingga angka di layar, preview, dan PDF selalu sama.
4. Laporan RAB PDF yang rapi dan siap dikirim ke klien.

### Di luar lingkup (tidak dikerjakan untuk UKK)

Estimasi rumah cepat, change order, permintaan penawaran (quotation), analytics, revisi/versi RAB, pembayaran/invoice, progres lapangan, dan aplikasi mobile. Tabel-tabel untuk fitur ini dihapus dari schema (audit D1).

## 3. Pengguna dan Peran

| Peran | Siapa | Hak akses |
|---|---|---|
| **Admin** | Pemilik usaha / pengelola data | Semua hak estimator, ditambah kelola master AHSP: sumber daya (upah, bahan, alat), kategori, analisa pekerjaan, dan koefisien |
| **Estimator** | Karyawan / staf perencana | Kelola proyek miliknya sendiri, menyusun RAB, memakai AI, preview, export PDF. Master AHSP hanya bisa dibaca |

Pengguna yang mendaftar sendiri mendapat peran estimator. Admin pertama dibuat lewat `prisma/seed`.

## 4. Kebutuhan Fungsional

Kode **F** dipetakan ke 5 fitur di spesifikasi UKK.

### F0. Autentikasi (pendukung)

| ID | Kebutuhan |
|---|---|
| F0.1 | Register: nama, email unik, password minimal 8 karakter (di-hash dengan bcrypt). |
| F0.2 | Login dengan email + password (NextAuth Credentials, session JWT). Logout. |
| F0.3 | Halaman `/dashboard`, `/projects/*`, `/ahsp/*`, `/profile`, dan `/company-settings` wajib login (`proxy.js`). Semua API mengecek session dan mengembalikan 401 jika belum login. |
| F0.4 | Pengaturan perusahaan (nama, alamat, telepon, email, URL logo `https://`) dipakai sebagai kop preview dan PDF. Form kosong sampai diisi pengguna. |

### F1. Manajemen proyek dan data pekerjaan konstruksi (UKK #1)

| ID | Kebutuhan |
|---|---|
| F1.1 | CRUD proyek: nama proyek, nama klien, lokasi, deskripsi, tanggal mulai/selesai, status (`planning`, `progress`, `completed`, `cancelled`). |
| F1.2 | Parameter biaya per proyek: diskon (Rp), biaya jasa/overhead (Rp), margin (%), PPN (%, default 11). |
| F1.3 | Daftar proyek dengan pencarian nama dan filter status. Hanya proyek milik sendiri yang tampil. |
| F1.4 | Dashboard: jumlah proyek per status (termasuk dibatalkan), total nilai RAB, 5 proyek terakhir, dan panduan "Langkah memulai" untuk pengguna baru. |
| F1.5 | Menghapus proyek wajib lewat konfirmasi dan ikut menghapus item RAB-nya. |

### F2. Perhitungan RAB otomatis berdasarkan volume, harga satuan, dan AHSP (UKK #2)

**Master AHSP** (dikelola admin):

| ID | Kebutuhan |
|---|---|
| F2.1 | **Sumber daya**: kode, nama, jenis (`upah`, `bahan`, `alat`), satuan, harga satuan, sumber harga, tanggal berlaku. Contoh: `L.01 Pekerja, OH, Rp120.000`. |
| F2.2 | **Kategori pekerjaan** (halaman `/ahsp/categories`): kode, nama, urutan. Contoh: `A Pekerjaan Persiapan`, `B Pekerjaan Tanah`. Kategori yang masih dipakai AHSP tidak bisa dihapus. |
| F2.3 | **Analisa pekerjaan (AHSP)**: kode, nama, satuan, kategori, overhead & profit (%). Contoh: `A.2.3.1.1 Galian 1 m³ tanah biasa`. |
| F2.4 | **Komponen AHSP**: daftar sumber daya beserta koefisiennya. Contoh: Pekerja 0,750 OH; Mandor 0,025 OH. |
| F2.5 | Harga satuan pekerjaan (HSP) dihitung otomatis: `HSP = Σ(koefisien × harga sumber daya) × (1 + overhead% / 100)`. Kalau harga sumber daya berubah, HSP ikut berubah. |
| F2.6 | Halaman detail AHSP menampilkan rincian per jenis (upah, bahan, alat), jumlah per jenis, overhead, dan HSP. |
| F2.7 | Data awal AHSP di-seed dari data lama (`resources`, `work_items`, `work_item_components`). |

**Item RAB**:

| ID | Kebutuhan |
|---|---|
| F2.8 | Tambah item dari AHSP: pilih AHSP, isi volume. Nama, satuan, kategori, dan harga satuan terisi otomatis dari AHSP. |
| F2.9 | Tambah item manual (tanpa AHSP): nama, satuan, volume, harga satuan diketik sendiri. Item ditandai "manual". |
| F2.10 | Harga satuan disimpan sebagai **snapshot** saat item dibuat, supaya RAB lama tidak berubah sendiri ketika harga master diubah. Ada tombol "Perbarui harga dari AHSP" per item atau per proyek. |
| F2.11 | `subtotal = volume × harga satuan`, dihitung **di server**. Nilai subtotal dari client diabaikan. |
| F2.12 | Item dikelompokkan per kategori pekerjaan dan ditampilkan bersama subtotal per kelompok. |

**Rumus ringkasan RAB** (satu-satunya rumus, di `src/lib/calculations/rab.js`):

```text
Jumlah harga pekerjaan = Σ subtotal item
Setelah diskon         = Jumlah − Diskon         (diskon maksimal sebesar jumlah)
Biaya jasa             = rabServiceFee
Margin                 = (Setelah diskon + Biaya jasa) × margin%
DPP                    = Setelah diskon + Biaya jasa + Margin
PPN                    = DPP × PPN%              (default 11%)
Jumlah total           = DPP + PPN
DIBULATKAN (grand total) = Jumlah total dibulatkan ke bawah per Rp1.000
```

Sesuai praktik industri konstruksi di Indonesia:

- **Overhead & keuntungan sudah ada di HSP** (AHSP, Permen PUPR No. 1/2022, umumnya 10%, maksimal 15%). Karena itu margin proyek default **0%** dan hanya diisi kalau perlu tambahan.
- **PPN dikenakan pada seluruh nilai kontrak (DPP)**, bukan hanya pada nilai pekerjaan.
- **PPN jasa konstruksi efektif 11%.** Sejak 2025 tarif umum 12%, tetapi untuk barang/jasa non-mewah DPP-nya 11/12 × harga, sehingga hasilnya tetap 11% dari harga. Nilainya bisa diubah per proyek.
- **Total dibulatkan ke bawah per Rp1.000**, seperti pada rekapitulasi RAB pada umumnya.

Semua angka dihitung dengan `decimal.js` dan dibulatkan 2 desimal per langkah.

### F3. Rekomendasi AI untuk pekerjaan dan material (UKK #3)

| ID | Kebutuhan |
|---|---|
| F3.1 | Di halaman proyek, pengguna menulis kebutuhan, misalnya "rumah tipe 36, 1 lantai, pondasi batu kali, dinding bata ringan". |
| F3.2 | Server mengirim ke Gemini: deskripsi pengguna, data proyek, dan **daftar katalog AHSP** (kode, nama, satuan). Gemini diminta membalas JSON: `[{ ahspCode, volume, reason }]`, plus `outOfCatalog` untuk pekerjaan/material di luar katalog. Kalau model utama penuh, server otomatis memakai model cadangan (`GEMINI_FALLBACK_MODEL`). Batas 20 permintaan per jam per pengguna. |
| F3.3 | Server memvalidasi balasan dengan Zod dan mencocokkan `ahspCode` ke database. Harga **selalu** dihitung dari AHSP, bukan dari AI. Saran tanpa kode yang cocok ditandai "di luar katalog" dan harganya kosong. |
| F3.4 | **Rekomendasi material**: untuk setiap saran, sistem menghitung kebutuhan bahan = koefisien bahan AHSP × volume saran, dijumlahkan per bahan, dan ikut berubah saat volume diedit. |
| F3.4a | Pengguna mencentang saran yang mau dipakai dan bisa mengedit volumenya, lalu menekan "Tambahkan ke RAB". Item dibuat lewat F2.8 dan `AiRequest.acceptedAt` diisi. Satu permintaan AI hanya bisa dimasukkan sekali. Saran yang pekerjaannya sudah ada di RAB ditandai dan tidak dicentang. |
| F3.5 | Riwayat 5 permintaan AI terakhir per proyek ditampilkan (status `processing`, `completed`, `failed`) dan bisa dipakai lagi. |
| F3.6 | Jika `GEMINI_API_KEY` kosong atau API gagal, muncul pesan jelas dalam bahasa Indonesia. Fitur lain tetap berjalan. |

### F4. Penyimpanan dan pengelolaan data RAB (UKK #4)

| ID | Kebutuhan |
|---|---|
| F4.1 | Item RAB bisa diedit (volume, harga untuk item manual, kelompok) dan dihapus dengan konfirmasi. |
| F4.2 | Ringkasan RAB diperbarui setiap kali item atau parameter proyek berubah. |
| F4.3 | Data proyek, item, dan AHSP tersimpan di MySQL/MariaDB lewat Prisma, dengan skema yang dibuat dari `prisma migrate` (bisa direproduksi). |
| F4.4 | Isolasi data: pengguna hanya bisa membaca dan mengubah proyek miliknya sendiri. Akses ke proyek orang lain dibalas 404. |

### F5. Preview dan export RAB ke PDF (UKK #5)

| ID | Kebutuhan |
|---|---|
| F5.1 | Halaman `/projects/[id]/preview` menampilkan RAB dalam format dokumen: kop perusahaan, identitas proyek, tabel (No, Kode AHSP, Uraian Pekerjaan, Volume, Satuan, Harga Satuan, Jumlah) per kelompok dengan subtotal kelompok, rekapitulasi (rumus F2), terbilang, serta tempat & tanggal dan kolom tanda tangan. |
| F5.2 | Tombol "Export PDF" mengunduh PDF dengan isi **sama persis** dengan preview (A4, nomor halaman, header tabel diulang di setiap halaman). |
| F5.3 | Nama file: `RAB_<nama-proyek>_<yyyy-mm-dd>.pdf`. |
| F5.4 | Lampiran "Perkiraan kebutuhan material" (koefisien bahan AHSP × volume item) di halaman proyek, preview, dan PDF. Kolom tanda tangan: "Disetujui oleh pemilik/klien" dan "Dibuat oleh". |

## 5. Kebutuhan Non-Fungsional

| Kategori | Syarat |
|---|---|
| Akurasi | Semua uang memakai `decimal.js` dan kolom DB `DECIMAL`, tanpa float. Angka di layar, preview, dan PDF identik. |
| Keamanan | bcrypt; session NextAuth; cek kepemilikan di setiap query (`createdBy`); validasi Zod di setiap API; tidak ada secret di repo; tidak ada dump DB berisi user di repo. |
| Pesan error | Bahasa Indonesia. API mengembalikan 401, 404, atau 422 (dengan detail per field), dan 500 hanya untuk error tak terduga. |
| Tampilan | Responsif minimal 390 px (HP); tabel bisa di-scroll horizontal. |
| Pengujian | Unit test (Vitest) untuk rumus HSP, rumus RAB, urutan pajak, dan cek kepemilikan. Uji manual mengikuti skenario §8. |
| Instalasi | `npm install` → isi `.env` → `npx prisma migrate deploy` → `npx prisma db seed` → `npm run dev`. |

## 6. Model Data (target)

```text
User ─1:1─ ProfileSetting (role: admin | estimator)
User ─1:1─ CompanySettings
User ─1:N─ Project ─1:N─ RabItem ─N:1─ Ahsp (opsional, null = item manual)
                    └─1:N─ AiRequest

AhspCategory ─1:N─ Ahsp ─1:N─ AhspComponent ─N:1─ Resource
```

| Model | Kolom penting |
|---|---|
| `Resource` | `code` (unik), `name`, `type` (upah/bahan/alat), `unit`, `unitPrice`, `source`, `effectiveDate`, `isActive` |
| `AhspCategory` | `code`, `name`, `sortOrder` |
| `Ahsp` | `code` (unik), `name`, `unit`, `categoryId`, `overheadPercent`, `isActive` |
| `AhspComponent` | `ahspId`, `resourceId`, `coefficient DECIMAL(10,6)` |
| `Project` | sama seperti sekarang, ditambah `location` |
| `RabItem` | `ahspId?`, `groupName`, `code?`, `name`, `unit`, `volume`, `unitPrice` (snapshot), `subtotal`, `sortOrder` |
| `AiRequest` | sama seperti sekarang; `suggestions` berisi kode AHSP |

Dihapus: `HouseEstimation`, `EstimationAnalytic`, `QuotationRequest`, `ChangeOrder`, `RabRevision`. `Material` digantikan oleh `Resource` dengan jenis `bahan`.

## 7. Halaman dan API

| Halaman | Isi |
|---|---|
| `/` | Landing page singkat dan tombol Masuk/Daftar |
| `/login`, `/register` | Autentikasi |
| `/dashboard` | Statistik dan proyek terakhir |
| `/projects`, `/projects/new`, `/projects/[id]/edit` | Kelola proyek |
| `/projects/[id]` | Penyusunan RAB: tabel item, tambah dari AHSP/manual, panel AI, ringkasan |
| `/projects/[id]/preview` | Preview dokumen RAB dan Export PDF |
| `/ahsp`, `/ahsp/[id]` | Daftar dan detail AHSP (admin bisa edit) |
| `/ahsp/resources` | Harga upah, bahan, dan alat (admin bisa edit) |
| `/ahsp/categories` | Kategori pekerjaan (admin bisa edit) |
| `/profile`, `/company-settings` | Pengaturan |

| API | Method |
|---|---|
| `/api/auth/register`, `/api/auth/[...nextauth]` | POST / NextAuth |
| `/api/projects`, `/api/projects/[id]` | GET, POST / GET, PUT, DELETE |
| `/api/projects/[id]/items`, `/items/[itemId]` | GET, POST / PATCH, DELETE |
| `/api/projects/[id]/items/reprice` | POST: perbarui harga item dari AHSP |
| `/api/projects/[id]/summary` | GET |
| `/api/projects/[id]/ai/recommend`, `/ai/accept` | GET (riwayat), POST / POST |
| `/api/projects/[id]/pdf` | GET |
| `/api/ahsp`, `/api/ahsp/[id]`, `/api/resources`, `/api/resources/[id]`, `/api/ahsp-categories`, `/api/ahsp-categories/[id]` | GET untuk semua pengguna; POST/PUT/DELETE hanya admin |
| `/api/profile` | GET, PUT (profil), PATCH (ganti kata sandi) |
| `/api/company-settings` | GET, PUT |

## 8. Kriteria Penerimaan (skenario uji)

1. Register lalu login; dashboard tampil. Mengakses `/projects` tanpa login diarahkan ke `/login`.
2. Membuat proyek; proyek muncul di daftar. Pengguna lain yang membuka URL proyek itu mendapat 404.
3. AHSP "Galian 1 m³ tanah biasa" dengan komponen Pekerja 0,75 OH × Rp120.000 dan Mandor 0,025 OH × Rp180.000, overhead 10%, menghasilkan HSP = (90.000 + 4.500) × 1,10 = **Rp103.950**.
4. Menambah item dari AHSP itu dengan volume 12,5 m³ menghasilkan subtotal **Rp1.299.375**.
5. Mengubah harga Pekerja tidak mengubah item yang sudah ada sampai tombol "Perbarui harga" ditekan.
6. Ringkasan dengan subtotal 10.000.000, diskon 500.000, jasa 1.000.000, margin 10%, dan PPN 11% menghasilkan DPP 11.550.000, PPN 1.270.500, Jumlah total 12.820.500, dibulatkan **12.820.000**.
7. Rekomendasi AI menampilkan saran berkode AHSP beserta perkiraan kebutuhan material; saran yang dicentang masuk ke RAB dengan harga dari AHSP. Menekan "Tambahkan" dua kali tidak membuat item dobel. Tanpa API key, muncul pesan error yang jelas.
8. Total akhir di halaman proyek, preview, dan PDF sama persis, dan jumlah semua kelompok sama dengan "Jumlah harga pekerjaan" (volume dibulatkan 3 desimal, harga 2 desimal).
9. PDF terbuka dan berisi kop perusahaan, tabel per kelompok, rekap, terbilang, dan tanda tangan.
10. Login sebagai estimator: tombol edit AHSP tidak ada, dan request API edit AHSP dibalas 403.

## 9. Rencana Pengerjaan

| Tahap | Isi | Acuan audit |
|---|---|---|
| 0 | Commit kondisi sekarang ke git | – |
| 1 | Perbaikan keamanan: material IDOR, dump SQL, script password, `proxy.js` | B1–B4 |
| 2 | Schema AHSP, hapus model di luar lingkup, migration, seed dari data lama | A1, D1, D2, D8 |
| 3 | Engine kalkulasi (HSP + RAB) beserta unit test; dipakai di semua tempat | C1–C4, E3 |
| 4 | Halaman master AHSP dan item RAB dari AHSP | A1, F2 |
| 5 | AI berbasis katalog AHSP dan endpoint accept | A3 |
| 6 | Halaman preview dan PDF berbentuk tabel | A4, A5 |
| 7 | Rapikan kode (`requireUser`, serializer), lint bersih, dokumentasi | D3–D9, E1–E2 |

## 10. Keputusan

| # | Pertanyaan | Keputusan |
|---|---|---|
| K1 | TypeScript atau JavaScript? | **JavaScript**, sesuai spesifikasi UKK. Seluruh kode sudah dikonversi ke `.js`/`.jsx`. |
| K2 | Master AHSP global atau per pengguna? | **Global**, dikelola admin (§3). |
| K3 | Perhitungan PPN? | **Standar industri**: PPN 11% dari DPP, total dibulatkan ke bawah per Rp1.000 (§F2). |
| K4 | Nama aplikasi resmi? | **"Sistem RAB Kontraktor"**. |
