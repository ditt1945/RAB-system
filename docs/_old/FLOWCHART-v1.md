# Flowchart — RABKita

Dokumen ini memakai sintaks Mermaid. Render otomatis di GitHub, VS Code (extension Mermaid), atau tempel ke `mermaid.live`.

---

## 1. Alur Utama Aplikasi (High Level)

```mermaid
flowchart TD
    A[Landing page /] --> B{Sudah punya akun?}
    B -->|Belum| C[Register /register]
    B -->|Sudah| D[Login /login]
    C -->|Validasi Zod + bcrypt OK| D
    C -->|Gagal validasi| C
    D -->|NextAuth credentials OK| E[Dashboard /dashboard]
    D -->|Email/password salah| D

    E --> F[Pilih / buat proyek]
    E --> G[Master material /materials]
    E --> H[Pengaturan profil & perusahaan]
    E --> I[Estimasi rumah cepat]

    F --> J[Detail proyek /projects/id]
    J --> K[Susun item RAB]
    J --> L[Simpan revisi]
    J --> M[Ajukan change order]
    J --> N[Rekomendasi AI Gemini]
    J --> O[Export PDF]

    K --> P[Preview ringkasan RAB]
    P --> J
    L --> J
    M --> J
    N -->|siterima jadi item| K
    O --> Q[File PDF siap kirim ke klien]
```

## 2. Autentikasi

```mermaid
flowchart LR
    A[Buka /register /login] --> B[Isi form]
    B --> C{Validasi Zod}
    C -->|Gagal| B
    C -->|OK| D{Register atau Login?}
    D -->|Register| E[bcrypt hash password<br/>INSERT users + profile_settings]
    E --> F[Berhasil → redirect /login]
    D -->|Login| G[NextAuth Credentials<br/>verifikasi hash]
    G -->|Cocok| H[Session aktif → /dashboard]
    G -->|Salah| B
```

## 3. Alur Proyek & Item RAB

```mermaid
flowchart TD
    A[Halaman /projects] --> B[Buat proyek baru /projects/new]
    B --> C[Isi: nama, klien, tanggal, status<br/>diskon, pajak 11%, biaya jasa, margin 15%]
    C --> D[POST /api/projects]
    D --> E[Buka detail /projects/id]

    E --> F[Tambah item RAB]
    F --> G{Ambil harga dari master material?}
    G -->|Ya| H[Pilih material → autofill satuan & harga]
    G -->|Isi manual| I[Isi nama, volume, satuan, harga satuan]
    H --> J[POST /api/projects/id/items]
    I --> J
    J --> K[Server hitung subtotal = volume × unitPrice]
    K --> E

    E --> L[Edit / hapus item]
    L --> M[PATCH / DELETE items/itemId]
    M --> E

    E --> N[Ringkasan RAB /api/projects/id/summary]
    N --> O[Server hitung grand total<br/>subtotal − diskon → + pajak + jasa + margin]
    O --> P[Preview di halaman detail]
```

## 4. Perhitungan Ringkasan RAB (Server-Side)

```mermaid
flowchart TD
    A[items: volume & unitPrice] --> B[itemsSubtotal = Σ volume × unitPrice]
    B --> C[afterDiscount = max 0, subtotal − discount]
    C --> D[taxAmount = afterDiscount × taxPercent / 100]
    C --> E[marginAmount = afterDiscount + serviceFee<br/>× marginPercent / 100]
    D --> F[grandTotal = afterDiscount + tax<br/>+ serviceFee + margin]
    E --> F
    F --> G[Response JSON → tampil di UI]
```

## 5. Revisi RAB

```mermaid
flowchart TD
    A[Di detail proyek] --> B[Klik Simpan revisi]
    B --> C[Isi label + catatan]
    C --> D[Server snapshot seluruh item RAB<br/>+ subtotal + grandTotal]
    D --> E[INSERT rab_revisions]
    E --> F[Riwayat revisi tampil di halaman proyek]
```

## 6. Change Order

```mermaid
flowchart LR
    A[draft] --> B[submit<br/>submitted]
    B --> C[approve → approved]
    B --> D[reject → rejected]
    C --> E[Nilai masuk pertimbangan total proyek]
    D --> A
```

## 7. Rekomendasi AI (Gemini)

```mermaid
flowchart TD
    A[Prompt kebutuhan proyek] --> B[POST request AI]
    B --> C[ai_requests: pending]
    C --> D[Server panggil Gemini API]
    D -->|Sukses| E[status completed<br/>suggestions tersimpan sebagai JSON]
    D -->|Gagal / kuot habis| F[status failed + pesan error]
    F --> G[Tampilkan pesan, user isi item manual]
    E --> H[User pilih saran]
    H --> I[Diterima → jadi item RAB<br/>acceptedAt terisi]
    H --> J[Diabaikan → selesai]
    I --> K[Subtotal & total dihitung ulang]
```

## 8. Master Material

```mermaid
flowchart TD
    A[/materials] --> B[Tambah material]
    A --> C[Edit / hapus material]
    B --> D[POST /api/materials<br/>scoped ke ownerId = user login]
    C --> E[PATCH / DELETE api/materials/id]
    D --> F[Tersimpan, muncul di daftar]
    E --> F
    F --> G[Saat item RAB dibuat,<br/>material jadi sumber harga satuan]
```

## 9. Estimasi Rumah Cepat

```mermaid
flowchart LR
    A[Isi form: tipe rumah,<br/>luas, kamar, kualitas, lokasi] --> B[Server hitung estimasi<br/>+ rincian breakdown]
    B --> C[Tampilkan total & ringkasan]
    C --> D[Simpan house_estimations]
    D --> E[Catat ke estimation_analytics<br/>rata-rata per periode]
```

## 10. Export PDF

```mermaid
flowchart LR
    A[Klik Export PDF] --> B[GET /api/projects/id/pdf]
    B --> C[Ambil data proyek, item,<br/>ringkasan, company_settings]
    C --> D[PDFKit susun dokumen<br/>kop perusahaan + tabel RAB + total]
    D --> E[Streaming response →<br/>browser unduh file PDF]
```

## 11. Permintaan Penawaran (Landing Page)

```mermaid
flowchart LR
    A[Pengunjung isi form<br/>nama, email, telepon, lokasi] --> B[POST quotation request]
    B --> C[status pending]
    C --> D[Admin review → reviewed]
    D --> E[Dihubungi → contacted]
```
