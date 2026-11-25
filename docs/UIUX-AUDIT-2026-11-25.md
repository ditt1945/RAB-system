# Audit UI/UX dan Rencana Rombak Tampilan

Tanggal: 25 November 2026. Branch: `bangil` (commit `65976e1`).

Cara audit: 12 halaman difoto di ukuran laptop (1440×900) dan HP (390×844) memakai Chrome headless, lalu diperiksa satu per satu bersama kodenya. Referensi dikumpulkan dari 9 aplikasi estimasi/RAB yang masih aktif (daftar di bagian akhir).

## Ringkasan

Fondasinya sudah benar: alurnya jelas (Data proyek → Susun RAB → Preview & PDF), angka rata kanan, tabel dikelompokkan per pekerjaan, dan dokumen preview sudah rapi seperti RAB resmi. Masalah utamanya ada di empat hal:

1. **Di HP, angka RAB tidak kelihatan.** Kolom volume, harga, dan jumlah terpotong di luar layar. Total baru muncul di paling bawah halaman.
2. **Mengedit RAB terasa lambat.** Volume (yang paling sering diubah) harus lewat tombol pensil per baris; form tambah item tersembunyi di balik tombol; ada tiga ikon aksi di setiap baris.
3. **Tema gelap kurang cocok untuk pekerjaan dokumen dan angka.** Pengguna berpindah dari layar gelap ke preview terang (kertas), dan teks kecil abu-abu di latar hitam sulit dibaca.
4. **Identitas visual belum satu.** Logo oranye, tombol utama cyan, judul putih: dua warna aksen bersaing.

Prioritas: **P0** = inti rombak, **P1** = sangat disarankan, **P2** = penyempurnaan.

## Arah desain yang disarankan

**Tema "kertas kerja" terang**, karena hasil akhir aplikasi ini adalah dokumen cetak:

| Unsur | Saran |
|---|---|
| Latar | Abu sangat muda (`slate-50`), kartu putih, garis tipis `slate-200`. Layar sama seperti dokumen yang dicetak (apa yang dilihat = apa yang dicetak). |
| Warna utama | **Satu** aksen: oranye/amber konstruksi (sudah ada di logo) untuk tombol utama dan penanda aktif. Navy gelap (`#173b57`, dulu dipakai di landing lama) untuk header tabel dan teks penting. |
| Warna status | Hijau = selesai, amber = berjalan, biru = perencanaan, abu = batal. Merah hanya untuk aksi hapus yang sudah dikonfirmasi. |
| Huruf | Geist (sudah ada), angka `tabular-nums`, kode AHSP monospace. Ukuran minimum teks 13px; teks bantuan minimal kontras 4.5:1. |
| Kepadatan | Tabel RAB padat seperti spreadsheet (tinggi baris 36–40px), halaman lain lebih lega. |
| Mode gelap | Opsional lewat toggle di menu akun, bukan bawaan. |

Kalau tetap ingin gelap, minimal naikkan kontras teks sekunder (`slate-500` → `slate-400`/`slate-300`) dan ganti aksen cyan ke oranye agar satu warna dengan logo.

## Temuan dan saran

### P0. Halaman Susun RAB (inti aplikasi)

| # | Temuan | Saran | Referensi |
|---|---|---|---|
| R1 | **HP: kolom angka terpotong.** Di 390px hanya terlihat No dan Uraian; volume, harga, dan jumlah harus digeser di dalam kartu tanpa petunjuk. Tabel material juga terpotong. | Di bawah 768px ganti tabel jadi **kartu per item**: nama + kode di atas, baris kedua "8,5 m³ × Rp103.813", jumlah tebal di kanan. Ketuk kartu untuk edit di lembar bawah (bottom sheet). | Joist, Aplikasi 101 |
| R2 | **HP: total ada di paling bawah.** Rekapitulasi muncul setelah tabel, AI, dan material. | **Bar total menempel di bawah layar** (sticky): "Total Rp47.537.000 · Lihat rekap ▲". | Buildertrend, HashMicro |
| R3 | **Edit volume harus klik pensil dulu.** Mode edit membuka seluruh baris. | Sel volume (dan harga untuk item manual) **langsung bisa diketik** seperti spreadsheet: klik sel, ketik, Enter simpan, Tab ke baris berikut. Simpan otomatis + indikator "Tersimpan". | Buildertrend (Enter/Tab, multi-select) |
| R4 | **Tambah item tersembunyi di balik tombol**, dan form-nya muncul di atas tabel, jauh dari kelompok yang dituju. | Tambah baris "+ Tambah pekerjaan" di bawah setiap kelompok, plus satu kolom cari cepat di atas tabel ("Cari pekerjaan AHSP…", bisa dibuka dengan `/`). Pilih → isi volume → Enter. | JobTread, Buildxact "recipes" |
| R5 | **Tiga ikon aksi di setiap baris** (perbarui harga, edit, hapus merah) membuat tabel ramai; ikon 28px kecil untuk jari. | Satu tombol "⋯" per baris (Perbarui harga, Duplikat, Pindah kelompok, Hapus). Di laptop boleh muncul saat baris disorot. | Buildertrend |
| R6 | **Hapus memakai `window.confirm` bawaan browser.** | Dialog konfirmasi sendiri, atau langsung hapus + toast "Item dihapus · **Batalkan**" selama 5 detik. | Umum (Gmail, Notion) |
| R7 | **Rincian upah/bahan/alat tidak terlihat di RAB.** Harus buka Master AHSP. | Baris bisa dibuka (▸) untuk melihat komposisi AHSP-nya. Di rekap tambahkan bar komposisi biaya: Upah xx% · Bahan xx% · Alat xx%. | Buildxact, JobTread |
| R8 | **Panel AI ada di bawah tabel**, dan kolomnya terisi "Proyek contoh dari seed. Boleh dihapus." | Pindahkan ke **panel samping** yang dibuka dengan tombol "✨ Saran AI" di header. Kolom diisi contoh yang bisa diklik ("Rumah tipe 36, 1 lantai, pondasi batu kali…"), tampilkan asumsi AI per saran, dan footer "11 item · +Rp23.400.000 · Tambahkan". Jangan isi otomatis dari keterangan kalau isinya bukan deskripsi teknis. | Houzz Pro AI, Buildxact Blu |
| R9 | **Tombol ganda**: "Lanjut ke preview" ada di header dan di rekap; header punya 3 tombol + stepper. | Header cukup judul + stepper + satu tombol utama. Aksi sekunder (Edit proyek, Export PDF) masuk menu "⋯". | – |
| R10 | **Deskripsi kartu terlalu panjang** sehingga tombol "Perbarui harga" dan "Tambah item" tersusun menurun. | Pindahkan penjelasan ke tooltip (ⓘ) dan tombol ke satu baris toolbar di atas tabel. | – |

### P0. Tampilan umum

| # | Temuan | Saran |
|---|---|---|
| V1 | Tema gelap bawaan, preview terang: perpindahan terasa seperti pindah aplikasi. | Tema terang "kertas kerja" (lihat Arah desain). |
| V2 | Dua warna aksen (oranye logo vs cyan tombol). | Satu aksen oranye + navy. |
| V3 | Teks bantuan, kode AHSP, dan label kolom memakai abu gelap ukuran 11–12px di latar hitam: kontras rendah. | Minimal 13px dan kontras ≥ 4.5:1. |
| V4 | Daftar proyek di HP: kolom total dan aksi terpotong; tanggal "20 November 2026" makan 3 baris. | Kartu proyek di HP: nama, klien, status, total; ketuk untuk buka. Tanggal singkat ("20 Nov"). |

### P1. Form dan input

| # | Temuan | Saran | Referensi |
|---|---|---|---|
| F1 | Input rupiah tanpa pemisah ribuan ("10000000") dan tanpa "Rp"; persen tanpa "%". | Input mata uang dengan awalan "Rp" dan format otomatis "10.000.000"; persen dengan akhiran "%". | HashMicro |
| F2 | Tanggal tampil "dd/mm/yyyy" (format bawaan Chrome bahasa Inggris). | Pemilih tanggal berbahasa Indonesia, atau tampilkan "25 Nov 2026" setelah dipilih. | – |
| F3 | Form proyek sangat lebar di laptop (input 1.200px), padahal isinya pendek. | Batasi lebar form ±720px. "Parameter biaya" dilipat sebagai "Pengaturan lanjutan (diskon, jasa, margin, PPN 11%)". | – |
| F4 | Belum ada nomor RAB dan "Disetujui oleh" di data proyek; tanda tangan memakai nama klien. | Tambah kolom Nomor RAB dan nama penyetuju (opsional), dicetak di kop dan tanda tangan. | HashMicro |
| F5 | Filter daftar proyek dan AHSP butuh tombol "Terapkan". | Saring otomatis saat mengetik/memilih. | – |

### P1. Navigasi dan struktur

| # | Temuan | Saran | Referensi |
|---|---|---|---|
| N1 | Menu atas berisi 5 item; "Perusahaan" dan "Akun" jarang dibuka tapi sejajar dengan "Proyek". | Menu utama: Dashboard, Proyek, Master AHSP. "Data perusahaan", "Akun", dan "Keluar" masuk menu avatar di kanan. | Estimator.id (4 modul) |
| N2 | Sub-halaman Master AHSP (Kategori, Harga upah/bahan/alat) berupa tombol di header. | Tab di dalam Master AHSP: **Analisa (AHSP) · Harga dasar · Kategori**. | Estimator.id |
| N3 | Di HP menu dibuka dari ikon hamburger di atas. | Bar navigasi bawah (Dashboard, Proyek, AHSP, Akun) untuk HP. | Joist |

### P1. Dashboard dan memulai

| # | Temuan | Saran | Referensi |
|---|---|---|---|
| D1 | Statistik "1 / 0" dan "0 / 0" membingungkan dan halaman terasa kosong. | Satu kartu besar "Lanjutkan: Rumah Tipe 36 · Rp47,5 jt · diubah 2 hari lalu". Statistik dipecah jadi angka tunggal dengan label jelas. | – |
| D2 | RAB baru selalu mulai dari tabel kosong. | Saat RAB kosong tampilkan 3 pilihan besar: **Dari template** (Rumah tipe 36 / 45 / renovasi), **Minta saran AI**, **Pilih dari katalog**. | Buildertrend, JobTread |
| D3 | Pesan sukses berupa kotak hijau di dalam kartu yang mendorong konten ke bawah. | Toast di pojok bawah yang hilang sendiri. | – |

### P2. Preview, PDF, dan halaman depan

| # | Temuan | Saran | Referensi |
|---|---|---|---|
| P1 | Satu jenis PDF untuk semua. | Dua versi saat export: **Untuk klien** (harga saja) dan **Untuk internal** (dengan rincian AHSP, material, biaya pokok). Pilihan centang: tampilkan kode AHSP, tampilkan lampiran material. | Aplikasi 101, Buildertrend Client Preview |
| P2 | Batas halaman A4 tidak terlihat di preview. | Garis putus-putus/jarak antar halaman supaya tahu di mana halaman terpotong. | – |
| P3 | Toolbar preview ikut tergulung. | Toolbar (Kembali, Cetak, Export) menempel di atas. | – |
| P4 | Halaman depan hanya teks, tanpa gambar produk. | Tampilkan screenshot tabel RAB dan contoh PDF; itu yang paling meyakinkan calon pengguna. | Joist, Estimator.id |
| P5 | Item dan kelompok tidak bisa diurutkan ulang. | Pegangan geser (⋮⋮) atau aksi "Pindah ke kelompok…". | Buildertrend |
| P6 | Indikator dev Next.js ("N") menutupi isi di pojok kiri bawah. | Hanya muncul di `npm run dev`; boleh dimatikan dengan `devIndicators: false` di `next.config.mjs` supaya tidak mengganggu saat demo. | – |

## Yang sudah baik (pertahankan)

- Alur tiga langkah dengan penunjuk langkah yang selalu terlihat.
- Tabel RAB per kelompok (A, B, C…) dengan subtotal, angka rata kanan, kode AHSP di bawah nama.
- Rekap di sisi kanan yang menempel saat digulir (laptop).
- Halaman detail AHSP dengan format A–F Permen PUPR: jelas untuk penguji.
- Dokumen preview sudah seperti RAB resmi: kop, identitas, tabel, rekap, terbilang, dua tanda tangan, lampiran material.

## Urutan pengerjaan yang disarankan

1. **Fondasi visual**: token warna terang + satu aksen, komponen dasar (`ui.jsx`: tombol, input rupiah, kartu, tabel, toast, dialog). Semua halaman ikut berubah dari sini.
2. **Halaman Susun RAB**: R3 (edit langsung di sel), R4 (tambah per kelompok + cari cepat), R5–R6 (menu ⋯, hapus dengan batalkan), R9–R10 (header & toolbar).
3. **Versi HP**: R1–R2 (kartu item + bar total), V4 (kartu proyek), N3 (navigasi bawah).
4. **AI sebagai panel samping** (R8) dan tiga pilihan mulai di RAB kosong (D2).
5. Navigasi (N1–N2), form (F1–F5), dashboard (D1, D3).
6. P2: dua versi PDF, batas halaman, halaman depan, urutkan ulang item.

## Referensi aplikasi serupa

| Aplikasi | Untuk siapa | Yang layak ditiru |
|---|---|---|
| [Buildertrend Estimates](https://buildertrend.com/help-article/estimate-overview/) | Kontraktor rumah tinggal & renovasi (AS) | Lembar kerja seperti spreadsheet (Enter/Tab, multi-pilih), kelompok yang bisa disusun dan digeser, 3 pilihan mulai (Excel, template, katalog), pratinjau klien dengan pilihan kolom yang tampil. |
| [JobTread](https://www.jobtread.com/features/estimating) · [katalog](https://www.jobtread.com/features/cost-catalog) | Kontraktor kecil | Katalog biaya material/upah/alat, "cost group" (mirip AHSP), template per jenis proyek, kelompok bertingkat, pratinjau dokumen sebelum dibuat. |
| [Houzz Pro AI Estimate](https://pro.houzz.com/pro-help/r/how-to-use-ai-to-create-an-estimate-or-proposal) | Kontraktor renovasi & desainer | Panel AI di kanan: deskripsi → saran dengan centang per item & kategori, "Pilih semua", footer total baru + jumlah item, tombol "Update". |
| [Buildxact](https://help.buildxact.com/en/articles/11467181-how-do-i-use-the-blu-assembly-recipe-assistant) | Builder kecil (AU/NZ/AS) | "Recipe" material + upah sekali tambah (padanan AHSP); asisten AI yang **menampilkan asumsinya**; prompt tersimpan bisa dipakai ulang. |
| [Joist](https://www.joist.com/) | Tukang/kontraktor perorangan, HP | Desain HP lebih dulu, total diperbarui langsung, logo di estimasi, tanda tangan klien di tempat. |
| [Aplikasi 101](https://101-app.com/id/blog/aplikasi-rab-gratis-untuk-estimasi-proyek-konstruksi) | Kontraktor & renovator Indonesia | Daftar harga dengan harga pokok & harga penawaran, tahapan pekerjaan, **PDF dua versi** (untuk pelanggan vs untuk kontraktor), dipakai di HP & laptop. |
| [HashMicro RAB Generator](https://www.hashmicro.com/id/blog/rab-proyek-generator/) | UMKM Indonesia | Tiga blok input sederhana; kolom nomor RAB, dibuat oleh, disetujui oleh; overhead, profit, PPN dalam persen; langsung unduh PDF. |
| [Estimator.id](https://estimator.id) | Estimator, konsultan, mahasiswa Indonesia | Navigasi 4 modul (Estimator, Proyek, Material & Upah, Analisa Harga Satuan), database AHSP SNI/PUPR, mulai gratis tanpa instal. |
| [Estimatrix](https://www.capterra.com/p/10047660/Estimatrix/) | Kontraktor & developer Indonesia | RAB bertingkat 3 level, overhead/profit/PPN otomatis, persetujuan bertingkat. (Sumber terlemah: belum ada ulasan.) |
