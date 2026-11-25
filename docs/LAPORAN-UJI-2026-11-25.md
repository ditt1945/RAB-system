# Laporan Uji Sistem RAB Kontraktor

Tanggal: 25 November 2026 · Branch `bangil` · Server: `npm run dev` + MySQL (XAMPP) · Database `rab_system_ukk`

## Ringkasan

| Jenis uji | Hasil |
|---|---|
| Alur lengkap sebagai estimator, di browser (layar laptop 1536×730) | **61/61 lolos** |
| Interaksi tabel RAB (edit volume di sel, menu ⋯, hapus + batalkan, panel AI, tambah cepat, kartu HP) | **13/13 lolos** |
| Popup & animasi (proyek, biaya, perusahaan, AHSP, Esc, garis progres) | **14/14 lolos** |
| API & halaman lewat HTTP (validasi, keamanan, PDF, kategori, AI) | **37/37 lolos** |
| Fitur rombak (template, PDF klien/internal, nomor RAB) | **22/22 lolos** |
| Unit test perhitungan (Vitest) | **23/23 lolos** |
| Lint (ESLint) | 0 error |
| Build production | Berhasil |

Total **170 pemeriksaan otomatis lolos**. Semua uji di browser memakai Chrome headless (tanpa jendela) dengan profil sementara, sehingga tidak menyentuh Chrome pengguna.

## Akun

| Akun | Peran | Dibuat oleh |
|---|---|---|
| `admin@rab.local` | Admin: kelola master AHSP, harga, kategori | seed |
| `estimator@rab.local` | Estimator: susun RAB, master AHSP hanya dilihat | seed (baru) |

- Kata sandi keduanya ada di `.env` (`DEMO_LOGIN_PASSWORD`, `DEMO_ESTIMATOR_PASSWORD`). File ini tidak di-commit.
- Halaman login (khusus `npm run dev`) punya dua tombol **Masuk cepat: Admin / Estimator**.
- Akun yang mendaftar sendiri lewat halaman Daftar otomatis menjadi estimator.
- `npx prisma db seed` di laptop lain membuat kedua akun. Kata sandi acak dicetak sekali di terminal, atau bisa ditentukan lewat `SEED_ADMIN_PASSWORD` / `SEED_ESTIMATOR_PASSWORD`.

## Alur yang diuji (estimator, dari akun kosong)

| # | Langkah | Yang diperiksa | Hasil |
|---|---|---|---|
| 1 | Masuk cepat sebagai Estimator | Diarahkan ke dashboard; sidebar menampilkan peran; panduan "Langkah memulai" tampil; proyek admin tidak terlihat | Lolos |
| 2 | Lengkapi data perusahaan (popup) | Popup terbuka, tersimpan, toast tampil | Lolos |
| 3 | Buat proyek baru (popup) | Validasi wajib isi; tersimpan → langsung ke Susun RAB; RAB kosong menawarkan 3 cara mulai | Lolos |
| 4 | Mulai dari template rumah tipe 36 | 13 pekerjaan masuk; DPP × 1,11 = total; total akhir dibulatkan ke ribuan | Lolos |
| 5 | Ubah volume di sel tabel (36 → 40, Enter) | Tersimpan; jumlah item ikut berubah | Lolos |
| 6 | Tambah cepat "beton" + item manual Rp2.500.000 | Item baru tersimpan; input rupiah otomatis berformat 2.500.000; item manual masuk kelompok "Lain-lain" | Lolos |
| 7 | Menu ⋯: duplikat, hapus + Batalkan, hapus | Duplikat +1; Batalkan membatalkan hapus; tanpa Batalkan terhapus setelah 5 detik | Lolos |
| 8 | Rincian AHSP, komposisi biaya, kebutuhan material | Baris bisa dibuka; komposisi upah/bahan/manual; tabel material (semen, pasir, bata, …) | Lolos |
| 9 | Saran AI: "Pagar depan rumah 10 m …" | AI memberi saran dari katalog; saran yang sudah ada di RAB ditandai dan tidak dicentang; asumsi AI tampil; material muncul untuk saran yang dicentang; saran masuk ke RAB | Lolos |
| 10 | Diskon Rp1.000.000 (popup biaya) | Tersimpan tanpa pindah halaman; rekap di layar dan server ikut berubah | Lolos |
| 11 | Preview & PDF | Kop perusahaan estimator, nomor RAB, klien, terbilang, tanda tangan; versi internal punya lampiran, versi klien tidak; PDF klien 2 halaman, internal 3 halaman | Lolos |
| 12 | Hak akses | Estimator bisa melihat AHSP tanpa tombol tambah/edit/hapus; API ubah AHSP, harga, kategori → 403; proyek admin → 404/"tidak ditemukan"; admin juga tidak bisa membuka proyek estimator | Lolos |
| 13 | Admin menaikkan upah Pekerja +Rp10.000 | Item RAB estimator tidak berubah sendiri (harga dikunci); "Perbarui harga" menaikkan harga item; harga dikembalikan setelah uji | Lolos |
| 14 | Tampilan di 3 ukuran layar | Laptop 1536×730, desktop 1440×900, HP 390×844: tidak ada halaman yang melebar; di HP item tampil sebagai kartu, bar total dan navigasi bawah tampil | Lolos |
| 15 | Kesehatan halaman | Tidak ada error JavaScript selama seluruh uji | Lolos |

## Temuan selama pengujian (sudah diperbaiki)

1. **Saran AI gagal karena koneksi ke Google terputus ("fetch failed").** Model utama Gemini juga sedang penuh (HTTP 503).
   - Error jaringan sekarang dicoba ulang lalu dialihkan ke model cadangan, sama seperti saat server sibuk.
   - Model yang baru saja penuh "diingat" selama 5 menit, sehingga permintaan berikutnya langsung memakai cadangan. Waktu tunggu turun dari ±55–79 detik menjadi ±2 detik.
   - Batas waktu per percobaan diturunkan menjadi 30 detik.
2. **Label "Sudah ada di RAB" di panel AI terpotong ke dua baris.** Sekarang selalu satu baris.

## Catatan

- Saran AI bergantung pada layanan Gemini dan koneksi internet. Permintaan pertama setelah server dinyalakan bisa lebih lama kalau model utama sedang penuh.
- Halaman proyek yang tidak ada / bukan milik pengguna menampilkan "tidak ditemukan" dengan kode status 200 (efek tampilan loading). API tetap membalas 404.
- Data uji sudah dibersihkan: database kembali berisi admin (1 proyek contoh, 7 item) dan estimator kosong, siap untuk demo.

## Cara menjalankan ulang

Skrip uji berada di luar repo (folder sementara). Pengujian manual bisa mengikuti tabel "Alur yang diuji" di atas: masuk sebagai Estimator, lalu ulangi langkah 1–14.
