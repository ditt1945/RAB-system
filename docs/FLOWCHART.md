# Flowchart: Sistem RAB Kontraktor

Versi 2.3, 25 November 2026 (v2.0: 20 November 2026). Mengikuti `docs/PRD.md` v2.0. Versi lama ada di `docs/_old/FLOWCHART-v1.md`.

Sintaks Mermaid. Bisa dirender di VS Code (extension "Markdown Preview Mermaid Support"), GitHub, atau https://mermaid.live.

Simbol: `([ ])` = mulai/selesai, `[ ]` = proses, `{ }` = keputusan, `[/ /]` = input/output, `[( )]` = database.

---

## 1. Alur Utama Sistem

```mermaid
flowchart TD
    S([Mulai]) --> L[/"Buka aplikasi"/]
    L --> A{Sudah login?}
    A -->|Belum| AUTH[[Proses Autentikasi - lihat flowchart 2]]
    AUTH --> D
    A -->|Sudah, langsung dialihkan| D[Dashboard + panduan langkah memulai]

    D --> M{Pilih menu}
    M -->|Proyek| P[[Kelola Proyek - flowchart 3]]
    M -->|Master AHSP| H[[Kelola AHSP - flowchart 4]]
    M -->|Menu akun di sidebar| PS[Popup data perusahaan / pengaturan akun]
    M -->|Logout| OUT([Selesai])

    P --> R[Langkah 2: susun RAB]
    R --> KOSONG{RAB masih kosong?}
    KOSONG -->|Ya| MULAI{Pilih cara mulai}
    MULAI -->|Template| TPL[Tambah pekerjaan dari template<br/>rumah tipe 36/45, renovasi] --> R
    MULAI -->|Saran AI| R2[[Panel saran AI - flowchart 6]]
    MULAI -->|Katalog| R1
    KOSONG -->|Tidak| R1[[Tambah / edit item RAB - flowchart 5]]
    R1 --> R
    R2 --> R
    R --> R3[[Langkah 3: Preview & Export PDF - flowchart 7]]
    R3 --> D
    H --> D
    PS --> D
```

Setiap proyek dikerjakan dalam tiga langkah yang selalu terlihat di atas halaman: **1. Data proyek → 2. Susun RAB → 3. Preview & PDF**. Langkah 3 baru bisa dibuka setelah RAB berisi minimal satu item.

## 2. Autentikasi (Register, Login, Proteksi Halaman)

```mermaid
flowchart TD
    S([Mulai]) --> Q{Punya akun?}
    Q -->|Belum| RG[/"Input nama, email, password"/]
    RG --> V1{"Valid? email format,<br/>password >= 8"}
    V1 -->|Tidak| E1[Tampilkan error per field] --> RG
    V1 -->|Ya| C1{Email sudah terdaftar?}
    C1 -->|Ya| E2[Error: Email sudah terdaftar] --> RG
    C1 -->|Tidak| H1[Hash password bcrypt]
    H1 --> DB1[(Simpan User + role estimator)]
    DB1 --> LG

    Q -->|Sudah| LG[/"Input email & password"/]
    LG --> C2{Email ada &<br/>password cocok?}
    C2 -->|Tidak| E3[Error: Email atau password salah] --> LG
    C2 -->|Ya| T[Buat session JWT: id, role]
    T --> D[Masuk Dashboard]
    D --> X([Selesai])

    subgraph Proteksi [Setiap request ke halaman / API terlindungi]
        RQ[Request masuk] --> PX{proxy.ts: ada session?}
        PX -->|Tidak, halaman| RL[Redirect ke /login]
        PX -->|Tidak, API| R401[Balas 401]
        PX -->|Ya| OWN{Data milik user?<br/>createdBy = user.id}
        OWN -->|Tidak| R404[Balas 404]
        OWN -->|Ya| OK[Proses request]
    end
```

## 3. Kelola Proyek (UKK #1)

```mermaid
flowchart TD
    S([Mulai]) --> LS[Tampilkan daftar proyek milik user<br/>+ cari & filter status]
    LS --> A{Aksi?}

    A -->|Tambah| F[/"Input nama proyek, klien, lokasi, tanggal,<br/>status, diskon, jasa, margin %, PPN %"/]
    F --> V{Valid?}
    V -->|Tidak| E[Tampilkan error] --> F
    V -->|Ya| DB1[(Simpan Project, createdBy = user)]
    DB1 --> DT

    A -->|Buka| DT[Langkah 2: halaman penyusunan RAB]

    A -->|Edit| F2[/"Ubah data proyek"/]
    F2 --> V2{Valid?}
    V2 -->|Tidak| F2
    V2 -->|Ya| DB2[(Update Project)] --> HIT[Hitung ulang ringkasan RAB] --> DT

    A -->|Hapus| K{Konfirmasi hapus?}
    K -->|Batal| LS
    K -->|Ya| DB3[(Hapus Project + semua RabItem)] --> LS

    DT --> X([Selesai])
```

## 4. Kelola Master AHSP & Hitung Harga Satuan Pekerjaan (UKK #2)

```mermaid
flowchart TD
    S([Mulai]) --> R{Role admin?}
    R -->|Tidak| RO[Lihat daftar & detail AHSP<br/>tanpa tombol edit] --> X([Selesai])
    R -->|Ya| M{Kelola apa?}

    M -->|Sumber daya| SD[/"Input kode, nama, jenis upah/bahan/alat,<br/>satuan, harga"/]
    SD --> DB1[(Simpan Resource)] --> X

    M -->|Analisa pekerjaan| AH[/"Input kode, nama, satuan,<br/>kategori, overhead %"/]
    AH --> KOMP[/"Tambah komponen:<br/>pilih sumber daya + koefisien"/]
    KOMP --> LAGI{Tambah komponen lagi?}
    LAGI -->|Ya| KOMP
    LAGI -->|Tidak| DB2[(Simpan Ahsp + AhspComponent)]
    DB2 --> HSP

    subgraph HSP [Hitung HSP]
        H1[Untuk setiap komponen:<br/>jumlah = koefisien x harga sumber daya]
        H1 --> H2[Kelompokkan: total upah, bahan, alat]
        H2 --> H3[Dasar = upah + bahan + alat]
        H3 --> H4[HSP = Dasar x 1 + overhead% / 100]
    end
    HSP --> TAMPIL[/"Tampilkan rincian & HSP"/] --> X
```

Contoh: Pekerja 0,75 OH × 120.000 = 90.000; Mandor 0,025 OH × 180.000 = 4.500. Dasar 94.500, overhead 10%, maka **HSP = 103.950 / m³**.

## 5. Tambah Item RAB & Hitung Total RAB (UKK #2 & #4)

```mermaid
flowchart TD
    S([Mulai]) --> J{Sumber item?}

    J -->|Dari AHSP| P1[/"Pilih AHSP dari katalog"/]
    P1 --> P2[Server ambil nama, satuan, kategori,<br/>hitung HSP terkini]
    P2 --> VOL[/"Input volume"/]

    J -->|Manual| M1[/"Input nama, satuan,<br/>harga satuan, kelompok"/]
    M1 --> VOL

    VOL --> V{"Volume >= 0 dan<br/>harga >= 0?"}
    V -->|Tidak| E[Tampilkan error] --> VOL
    V -->|Ya| SUB[Server: subtotal = volume x harga satuan<br/>harga disimpan sebagai snapshot]
    SUB --> DB[(Simpan RabItem)]
    DB --> RK

    subgraph RK [Hitung ringkasan RAB - decimal.js]
        K1[Subtotal = jumlah semua subtotal item]
        K1 --> K2[Setelah diskon = max 0, Subtotal - Diskon]
        K2 --> K3[Margin = Setelah diskon + Jasa x margin%]
        K3 --> K4[DPP = Setelah diskon + Jasa + Margin]
        K4 --> K5[PPN = DPP x PPN%]
        K5 --> K6[Jumlah total = DPP + PPN]
        K6 --> K7[Grand total = dibulatkan ke bawah per Rp1.000]
    end

    RK --> T[/"Tampilkan tabel per kelompok + ringkasan"/]
    T --> A{Aksi lanjutan?}
    A -->|Ketik volume di sel / Ubah detail| VOL
    A -->|Hapus item| HIDE[Sembunyikan item + toast Batalkan 5 detik]
    HIDE --> K{Batalkan ditekan?}
    K -->|Tidak| DEL[(Hapus RabItem)] --> RK
    K -->|Ya| T
    A -->|Perbarui harga dari AHSP| RP[Hitung ulang HSP terkini<br/>untuk item ber-AHSP] --> DB
    A -->|Selesai| X([Selesai])
```

## 6. Rekomendasi AI (UKK #3)

```mermaid
flowchart TD
    S([Mulai]) --> PRE[Isi awal deskripsi = keterangan proyek]
    PRE --> IN[/"Input / lengkapi deskripsi kebutuhan proyek"/]
    IN --> V{Minimal 8 karakter?}
    V -->|Tidak| IN
    V -->|Ya| KEY{GEMINI_API_KEY ada?}
    KEY -->|Tidak| E1[Pesan: Fitur AI belum dikonfigurasi] --> X([Selesai])
    KEY -->|Ya| LOG[(Simpan AiRequest status processing)]
    LOG --> CTX[Siapkan prompt: deskripsi + data proyek<br/>+ katalog AHSP kode, nama, satuan]
    CTX --> API[Kirim ke Gemini API]
    API --> BUSY{Model utama penuh?}
    BUSY -->|Ya| FB[Coba model cadangan] --> OK
    BUSY -->|Tidak| OK{Balasan JSON valid?<br/>cek Zod}
    OK -->|Tidak / error| F[(Update AiRequest status failed)]
    F --> E2[Pesan: Rekomendasi gagal, coba lagi] --> X
    OK -->|Ya| MATCH[Cocokkan ahspCode ke database]
    MATCH --> PR[Hitung harga dari AHSP, bukan dari AI<br/>Saran tanpa kode = di luar katalog]
    PR --> MAT[Ambil koefisien bahan tiap AHSP<br/>kebutuhan material = koefisien x volume]
    MAT --> DONE[(Update AiRequest status completed)]
    DONE --> DUP[Saran yang pekerjaannya sudah ada di RAB<br/>ditandai dan tidak dicentang]
    DUP --> SHOW[/"Tampilkan saran + checkbox, volume bisa diedit,<br/>total yang dipilih, kebutuhan material"/]
    SHOW --> PIL{User pilih saran?}
    PIL -->|Tidak ada| X
    PIL -->|Ya| SUDAH{acceptedAt sudah terisi?}
    SUDAH -->|Ya| E3[Pesan: saran sudah dimasukkan] --> X
    SUDAH -->|Tidak| ACC[(Isi AiRequest.acceptedAt)]
    ACC --> ADD[Buat RabItem untuk setiap saran terpilih<br/>dalam satu transaksi]
    ADD --> X
```

## 7. Preview & Export PDF (UKK #5)

```mermaid
flowchart TD
    S([Mulai]) --> CEK{Proyek milik user?}
    CEK -->|Tidak| N[404] --> X([Selesai])
    CEK -->|Ya| ITEM{Ada item RAB?}
    ITEM -->|Tidak| KOS[Dokumen kosong + pesan & tautan tambah item<br/>tombol Cetak dan Export disembunyikan] --> X
    ITEM -->|Ya| AMB[(Ambil Project, RabItem,<br/>CompanySettings)]
    AMB --> HIT[Hitung ringkasan dengan fungsi yang sama<br/>dengan halaman proyek]
    HIT --> KOP{Data perusahaan sudah diisi?}
    KOP -->|Belum| WARN[Peringatan + tautan ke Data Perusahaan] --> PV
    KOP -->|Sudah| PV
    PV[/"Halaman Preview: kop + logo, identitas proyek,<br/>tabel per kelompok, rekap, terbilang, tanda tangan klien & pembuat,<br/>lampiran kebutuhan material"/]
    PV --> VER{Versi dokumen?}
    VER -->|Untuk klien| PVK[RAB + rekap saja] --> A
    VER -->|Internal| PVI[+ lampiran material & komposisi biaya] --> A
    A{Export PDF?}
    A -->|Tidak| X
    A -->|Ya| GEN[Bangun PDF A4 dari data yang sama:<br/>header tabel diulang, nomor halaman]
    GEN --> DL[/"Unduh RAB_nama-proyek_tanggal.pdf"/]
    DL --> X
```

## 8. Relasi Data (ERD ringkas)

```mermaid
erDiagram
    User ||--o| ProfileSetting : punya
    User ||--o| CompanySettings : punya
    User ||--o{ Project : membuat
    Project ||--o{ RabItem : berisi
    Project ||--o{ AiRequest : riwayat
    Ahsp ||--o{ RabItem : "sumber harga (opsional)"
    AhspCategory ||--o{ Ahsp : mengelompokkan
    Ahsp ||--o{ AhspComponent : terdiri
    Resource ||--o{ AhspComponent : dipakai
```
