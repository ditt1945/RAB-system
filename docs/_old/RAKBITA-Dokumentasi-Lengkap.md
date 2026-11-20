# RABKita - Sistem Manajemen RAB untuk Kontraktor

**Tugas Ujian Kompetensi Keahlian (UKK)**  
**Nama:** Radittya Vitsava Darma  
**Kelas:** XII RPL 2  
**Proyek:** Sistem RAB berbasis web untuk kontraktor

---

## 📋 Ringkasan Proyek

RABKita adalah aplikasi web untuk perencanaan dan pengelolaan Rencana Anggaran Biaya (RAB) pembangunan. Sistem ini dirancang khusus untuk kontraktor, estimator, dan profesional konstruksi yang membutuhkan tools cepat, akurat, dan professional dalam menghitung biaya proyek.

### Target Pengguna

1. **Kontraktor Kecil & Menengah (UMKM)** - Menyusun RAB untuk proyek renovasi dan pembangunan skala menengah.
2. **Estimator** - Menyusun anggaran dengan detail pekerjaan, material, dan perhitungan otomatis.
3. **Pemilik Usaha Konstruksi** - Mengelola multiple proyek dan melihat laporan keuangan.
4. **Freelance Estimator** - Menggunakan platform standalone tanpa bergantung pada perusahaan tertentu.
5. **Klien / Owner Proyek** - Menerima dokumen RAB yang rapi dan professional untuk approval.

### Mengapa Sistem Ini Universal?

Sistem ini **bukan dikhususkan untuk satu perusahaan tertentu**, melainkan dirancang sebagai **produk SaaS (Software as a Service)** yang dapat digunakan oleh:

- Berbagai kontraktor dengan branding berbeda
- Freelance estimator
- Konsultan konstruksi
- UMKM jasa renovasi
- Developer rumah kecil

Untuk demonstrasi UKK, sistem menggunakan studi kasus: **PT Bangun Jaya Konstruksi**.

---

## 🏗️ Arsitektur Teknologi

```
Frontend:        Next.js 16 App Router + React 19 + Tailwind CSS v4
Backend API:     Next.js Serverless Routes (API Routes)
Database:        MariaDB/MySQL 8+ via Prisma ORM 7
Authentication:  NextAuth.js (Credentials Provider)
AI Integration:  Google Gemini API (Gemini 2.0 Flash)
PDF Generation:  PDFKit (Direct streaming to client)
Testing:         Vitest Unit Tests
Build System:    Turbopack (Next.js default)
```

### Struktur Direktori

```
rab-system-next/
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Schema migrations
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # Backend API endpoints
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── register/route.ts
│   │   │   ├── projects/      # Project CRUD
│   │   │   ├── materials/     # Material master data
│   │   │   ├── profile/       # User profile management
│   │   │   ├── company-settings/  # Company branding config
│   │   │   └── [id]/pdf/      # PDF export endpoint
│   │   ├── dashboard/page.tsx # Dashboard user
│   │   ├── login/page.tsx     # Login page
│   │   ├── register/page.tsx  # Registration page
│   │   ├── projects/          # Project management UI
│   │   ├── materials/         # Material master page
│   │   ├── company-settings/  # Company profile config
│   │   └── profile/           # User account settings
│   ├── components/            # React UI components
│   │   ├── DashboardNav.tsx
│   │   └── Providers.tsx
│   ├── lib/                   # Business logic layer
│   │   ├── calculations/rab.ts        # Core RAB calculation engine
│   │   ├── pdf/rabDocument.ts         # PDF generation logic
│   │   ├── ai/gemini.ts              # AI integration helper
│   │   ├── validations/rab.ts         # Zod validation schemas
│   │   └── prisma.ts                # Prisma client singleton
│   └── types/                 # TypeScript type definitions
├── tests/                     # Vitest unit tests
├── scripts/                   # Migration scripts
│   └── migrate-legacy.ts      # Legacy Laravel migration
└── docs/                      # Documentation
    ├── migrasi-legacy.md
    └── audit-lengkap-fase-1-7.md
```

---

## ⚙️ Fitur Utama

### 1. ✅ Autentikasi & Keamanan

- **Login/Register** dengan email & password
- **Password hashing** menggunakan bcryptjs (salting factor 12)
- **JWT Session** dengan NextAuth
- **Protected routes** menggunakan middleware auth
- **CSRF protection** via credentials provider

**Flow Registrasi:**
```
User mengisi form → Validasi Zod → Hash password → Insert ke DB → Redirect login
```

### 2. ✅ Manajemen Proyek

- **Create Project**: Nama proyek, nama klien, deskripsi, tanggal mulai/selesai
- **Project Status**: planning, progress, completed, cancelled
- **Ownership Validation**: `createdBy` ensures users only access their own projects
- **Project List Dashboard**: Shows all projects with quick stats

### 3. ✅ Mesin Perhitungan RAB (Core Engine)

Semua perhitungan dilakukan di **server-side** menggunakan **Decimal.js** untuk akurasi finansial:

```typescript
// Contoh perhitungan per item
subtotal = volume × unitPrice

// Total project summary
afterDiscount = subtotal - rabDiscount
taxAmount = afterDiscount × (rabTaxPercent / 100)
serviceFee = rabServiceFee
marginAmount = (afterDiscount + serviceFee) × (targetMarginPercent / 100)
grandTotal = afterDiscount + taxAmount + serviceFee + marginAmount
```

**Validasi Input:**
- Volume >= 0
- Harga satuan >= 0
- Pajak <= 100%
- Margin <= 100%

### 4. ✅ Master Material & Pekerjaan

- **CRUD Material**: Create, Read, Update, Delete
- **Material Categories**: Struktur, Arsitektur, Plumbing, Mekanikal, Listrik, Finishing, Tenaga Kerja
- **Supplier Management**: Tracking pemasok material
- **Reusable Data**: Material disimpan sekali, bisa dipakai di berbagai proyek

### 5. ✅ Integrasi AI (Gemini AI)

Fitur rekomendasi pekerjaan berdasarkan deskripsi proyek:

**Endpoint:** `/api/projects/[id]/ai/recommend`

**Input:** Prompt text user (deskripsi proyek)
**Output:** Rekomendasi list pekerjaan dengan perkiraan harga

**Contoh Penggunaan:**
```
Prompt: "Saya mau bangun rumah sederhana tipe 36"

AI Recommendations:
- Galian tanah pondasi (m3): 15.0
- Pondasi batu kali (m3): 8.0
- Kolom beton 15/20 (m3): 2.0
- Sloof 15/20 (m): 40.0
- Pengecoran dak lantai (m2): 54.0
- Pasang bata ringan m2: 120.0
- Acian m2: 120.0
- Cat tembok m2: 120.0
- Lantai keramik 40x40 m2: 54.0
- Pintu kayu frame besi 200/80 (buah): 2.0
- Jendela kaca double geser 100/150 cm (buah): 3.0
- Instalasi listrik dalam bangunan (ls): 1.0
- Saluran air hujan (m): 30.0
```

**Keamanan:**
- API key Gemini hanya tersimpan di server (`GEMINI_API_KEY`)
- Client tidak pernah mengakses API key langsung

### 6. ✅ Export PDF Profesional

**Format:** A4 Landscape
**Stream Directly** ke client tanpa file temp di disk

**Layout PDF (dengan Company Settings):**
```
┌─────────────────────────────────────┐
│      PT BANGUN JAYA KONSTRUKSI      │
│    Jl. Pembangunan No. 10, Surabaya │
│       Telp: 0812-0000-0000          │
│      Email: info@bangunjaya.test    │
├─────────────────────────────────────┤
│ RENCANA ANGGARAN BIAYA (RAB)        │
│                                     │
│ Proyek: Renovasi Rumah Bapak Andi   │
│ Klien:  Bapak Andi                  │
│ Status: PLANNING                    │
│                                     │
│ Rincian Pekerjaan:                  │
│ 1. [Struktur] Pondasi Batu Kali     │
│    8.00 m3 @ Rp 1.800.000 = Rp ...  │
│ ...                                 │
│                                     │
│ Ringkasan Biaya:                    │
│ Subtotal Pekerjaan : Rp xxx.xxx     │
│ Diskon             : -Rp xxx.xxx    │
│ Biaya Jasa         : +Rp xxx.xxx    │
│ Target Margin      : +Rp xxx.xxx    │
│ Pajak (PPN 11%)    : +Rp xxx.xxx    │
│ ─────────────────────────────────── │
│ GRAND TOTAL        : Rp xxx.xxx     │
└─────────────────────────────────────┘
```

### 7. ✅ Profil Perusahaan (Brand Settings)

- **Nama Perusahaan**: PT Bangun Jaya Konstruksi (default untuk demo)
- **Alamat Lengkap**
- **Nomor Telepon**
- **Email Perusahaan**
- **URL Logo** (opsional, placeholder URL)

Data ini muncul di semua dokumen RAB yang di-export.

### 8. ✅ Pengaturan Akun

- **Update Nama & Email** user
- **Ganti Password** dengan validasi old password
- **Role Management** (future feature): admin, estimator, manager

### 9. ✅ Dashboard Interaktif

**Metric Cards:**
- Total Proyek
- Sedang Berjalan (status: progress)
- Proyek Selesai (status: completed)
- Nilai Akumulasi RAB (sum of all active projects)

**Recent Projects:** Tabel 5 proyek terakhir dengan link ke detail

### 10. ✅ Revisi & Snapshot (Bonus Feature)

- **Version History**: Simpan snapshot setiap revision
- **Compare Versions**: Bandingkan perubahan dari time to time
- **Rollback**: Restore ke versi sebelumnya jika diperlukan

---

## 🔄 Flow Sistem Lengkap

### Flow User Baru (Registrasi + Setup)

```
1. Buka aplikasi → Halaman Login
2. Klik "Daftar Akun Baru"
3. Isi Nama, Email, Password
4. Submit → Account Created → Redirect Login
5. Login dengan kredensial baru
6. Redirect ke Dashboard
7. Masuk menu "Profil Perusahaan"
8. Isi identitas perusahaan demo (PT Bangun Jaya Konstruksi)
9. Kembali ke Dashboard → Mulai buat proyek
```

### Flow Pembuatan Proyek Baru

```
1. Dashboard → "Buat Proyek Baru" atau "Daftar Proyek" → "Buat Proyek"
2. Form New Project:
   - Nama Proyek: Renovasi Rumah Tipe 36
   - Nama Klien: Bapak Andi
   - Deskripsi: Renovasi rumah lama menjadi lebih modern
   - Tanggal Mulai: 2024-01-15
   - Tanggal Target: 2024-04-15
   - Status: Planning
3. Submit → Project Created → Redirect ke Detail Proyek
```

### Flow Penyusunan RAB (Detail Proyek)

```
1. Lihat Summary Card (Subtotal, Pajak, Discount, Grand Total)
2. Tambah Item RAB Manual:
   - Pilih Kategori: Struktur/Arsitektur/dll
   - Nama Pekerjaan: Pondasi Batu Kali
   - Volume: 8.0
   - Satuan: m3
   - Harga Satuan: 1.800.000
   - Subtotal otomatis dihitung: 14.400.000
3. Atau Generate AI Suggestions:
   - Input prompt: "Rumah tipe 36 simple"
   - Pilih beberapa item → Item masuk ke RAB
   - Total updated otomatis
4. Edit Item (inline editor):
   - Ubah volume/harga → Subtotal real-time berubah
   - Hapus item → Total berkurang
5. Atur Project-level taxes/discounts:
   - Rab Discount: 0
   - Pajak: 11% (PPN)
   - Jasa: 0
   - Margin: 15%
6. Review Final Summary
7. Export PDF → Download ke device
```

### Flow Approval Proses (Future Enhancement)

```
1. Estimator membuat RAB → Status: Draft
2. Kirim untuk review → Status: Submitted
3. Manager memeriksa RAB
4. Approve atau Reject
5. Jika Approved → Status: Approved
6. PDF export dengan watermark "DIPERSETUJUI"
```

---

## 🔒 Keamanan & Validasi

### Authentication Security

1. **Password Hashing**: bcrypt salt rounds = 12
2. **Session JWT**: Secure cookie storage
3. **Credential Verification**: Compare hash, not plain text
4. **Role-based Access Control**: Prepared but simplified version

### Input Validation

```typescript
// Zod validation examples
projectSchema = z.object({
  projectName: z.string().min(3).max(255),
  clientName: z.string().min(2).max(255),
  rabDiscount: z.coerce.number().min(0).default(0),
  rabTaxPercent: z.coerce.number().min(0).max(100).default(11),
});
```

### Ownership Validation

All project operations check `createdBy`:

```typescript
const project = await prisma.project.findFirst({
  where: { id: projectId, createdBy: userId }, // ← Only owner can modify
});
```

---

## 📊 Database Schema

### Tables Overview

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | User accounts | id, name, email, password, createdAt |
| `projects` | Project management | id, projectName, clientName, status, createdBy, rabDiscount, rabTaxPercent |
| `rab_items` | RAB items | id, projectId, name, category, volume, unit, unitPrice, subtotal |
| `materials` | Master data | id, name, category, unit, unitPrice, supplier |
| `ai_requests` | AI suggestion history | id, projectId, userId, prompt, status, suggestions |
| `rab_revisions` | Version control | id, projectId, label, notes, snapshot, grandTotal |
| `company_settings` | Company branding | id, ownerId, companyName, address, phone, email |
| `profile_settings` | User roles | id, userId, role, department, notes |

### Relationship Map

```
users (1) ←→ (N) projects
users (1) ←→ (N) ai_requests
users (1) ←→ (N) rab_revisions
users (1) → (1) company_settings
users (1) → (1) profile_settings

projects (1) ←→ (N) rab_items
projects (1) ←→ (N) ai_requests
projects (1) ←→ (N) rab_revisions

rab_items (*).materialId → materials (1)
rab_items (N) → revisions (1) via projectId
```

---

## 🧪 Testing & Quality Assurance

### Unit Tests

**File**: `tests/rab-engine.test.ts`  
**Test Cases**: 2 tests covering calculation accuracy

```bash
npm run test
✅ RAB Calculation Engine > should calculate basic volume * price correctly
✅ RAB Calculation Engine > should handle multi-item project with proper totals
```

### Build Validation

```bash
npm run lint && npm run test && npm run build
✅ ESLint passed
✅ Vitest tests passed
✅ Next.js production build succeeded
Exit Code: 0
```

---

## 🚀 Cara Menjalankan Aplikasi

### Prerequisites

- Node.js 18+ installed
- XAMPP or MySQL/MariaDB running on port 3306
- Git (optional, for version control)

### Installation Steps

1. **Clone Repository:**
```bash
cd C:\Project\rab-system-next
```

2. **Install Dependencies:**
```bash
npm install
```

3. **Environment Setup (.env.local):**
```env
DATABASE_URL="mysql://root:[REDACTED]@127.0.0.1:3306/rab_system_next"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Google Gemini API (for AI recommendations)
GEMINI_API_KEY=[REDACTED]
```

4. **Run Database Migration:**
```bash
npx prisma migrate deploy
npx prisma db push
```

5. **Seed Initial Data (Optional):**
```bash
npm run seed  # Creates sample data
```

6. **Development Mode:**
```bash
npm run dev
```

Aplikasi berjalan di: http://localhost:3000

### Production Deployment

```bash
npm run build
npm start
```

Deploy ke Vercel, Railway, atau hosting penyedia Next.js support.

---

## 🎯 Use Cases Demonstrations

### Scenario 1: Estimasi Renovasi Rumah

**User**: Budi (kontraktor)  
**Project**: Renovasi Rumah Tipe 36  
**Flow**:

1. Register akun → Login
2. Set profil perusahaan → PT Bangun Jaya
3. Buat project "Renovasi Rumah Tipe 36 - Bapak Andi"
4. Masukkan 3 item manual:
   - Pondasi batu kali: 8 m³ @ 1.800.000 = 14.400.000
   - Kolom beton: 2 m³ @ 2.500.000 = 5.000.000
   - Pengecoran dak: 30 m³ @ 1.750.000 = 52.500.000
5. Click "Generate AI Suggestions"
6. AI memberi 15 saran pekerjaan
7. Pilih 5 item yang relevan
8. RAB total: Rp 150.000.000 (setelah pajak & margin)
9. Export PDF → Kirim ke klien

### Scenario 2: Quick Estimate from Description

**User**: Sari (freelance estimator)  
**Flow**:

1. Login
2. Buat project "Perumahan Minimalis 4 Unit"
3. Gunakan AI recommendation:
   - Prompt: "Bangun perumahan minimalis 4 unit, 54m2 per unit"
   - AI output: Foundation, struktur dinding, atap, finishing, plumbing, listrik, dll
4. Review suggestions → Accept semua
5. Adjust harga satuan sesuai market rate
6. Export PDF untuk tender proposal

### Scenario 3: Budget Adjustment & Revision

**User**: Manager proyek  
**Flow**:

1. Review RAB existing
2. Hitung ulang dengan discount 5% dari supplier
3. Adjust rabat tax dari 11% ke 0% (project outside taxable area)
4. Add additional services fee: Rp 2.000.000
5. Check new grand total
6. Save revision: "Revisi 2 - Discount Supplier"
7. Compare before/after: Δ - Rp 3.450.000
8. Approve final version

---

## 📱 UI/UX Features

### Design System

- **Color Palette**: Dark theme (slate-950 base)
- **Accent Colors**: Cyan (#06b6d4), Blue (#2563eb), Red (#ef4444), Green (#22c55e)
- **Typography**: Inter system font
- **Icons**: Lucide React icons
- **Components**: Rounded cards, gradients, glass-morphism effects

### Responsive Design

- Mobile-first responsive layout
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly buttons (min 44px height)
- Optimized navigation menus for smaller screens

---

## 🔮 Roadmap & Future Enhancements

### Immediate Priorities

1. ✅ **Master Material Page** (DONE)
2. ✅ **Company Branding** (DONE)
3. ✅ **Profile Settings** (DONE)
4. ⏳ **User Role System** (in progress)
5. ⏳ **Multi-project Analytics** (planned)

### Long-term Goals

1. **Real-time Collaboration** (WebSockets)
2. **Mobile App** (React Native)
3. **Integration dengan Supplier** (API marketplace)
4. **Quote Generation** (customer-facing proposals)
5. **Expense Tracking** (actual vs budgeted)
6. **Reporting Dashboard** (charts & trends)
7. **Cloud Sync** (multi-device access)
8. **Offline Mode** (PWA support)
9. **Internationalization** (English/Indonesian/Bahasa)
10. **White-label Option** (custom branding for clients)

---

## 📄 Sertifikat & Dokumentasi

### Files Generated

- `audit-lengkap-fase-1-7.md` - Full system audit report
- `docs/migrasi-legacy.md` - Migration guide from Laravel
- `scripts/migrate-legacy.ts` - Automated migration script

### Legal & Credits

- **Copyright**: © 2024 RABKita System
- **Author**: Radittya Vitsava Darma
- **License**: MIT License (for educational purposes)

---

## 🤝 Support & Contact

Untuk pertanyaan, diskusi, atau kolaborasi:

- **Developer**: Radittya Vitsava Darma
- **School**: SMA Negeri [Nama Sekolah]
- **Class**: XII RPL 2
- **Contact**: [email protected] *(placeholder)*

---

## ✅ Checklist Presentasi UKK

### Yang Harus Ditampilkan

#### ✅ Backend/API
- [x] Database schema clean & normalized
- [x] RESTful API endpoints working
- [x] Auth middleware protecting routes
- [x] Validation schemas (Zod) in place
- [x] Decimal.js precision for financial calculations

#### ✅ Frontend/UI
- [x] Clean dark theme interface
- [x] Responsive layouts
- [x] Interactive forms with validation
- [x] Real-time calculations
- [x] Loading states & error handling

#### ✅ Features
- [x] User registration & login
- [x] Project creation & listing
- [x] RAB item management
- [x] AI suggestions (with safe API key)
- [x] PDF export (streamed binary)
- [x] Company branding configuration
- [x] Profile/account settings
- [x] Master material CRUD

#### ✅ Quality
- [x] Build passes (exit code 0)
- [x] Unit tests running
- [x] ESLint clean
- [x] Type-safe TypeScript

---

## 🎉 Kesimpulan

Sistem RABKita sudah mencapai milestone penting:

✅ **Full-stack application ready**  
✅ **UKK exam presentation complete**  
✅ **Demo-ready with studio-quality UI**  
✅ **Professional PDF exports**  
✅ **AI-powered estimation assistance**  
✅ **Universal architecture suitable for multiple companies**  

System siap dipresentasikan kepada juri UKK dari berbagai perusahaan kontraktor! 🚀

---

*Dibuat dengan ❤️ untuk Ujian Kompetensi Keahlian*  
*Sistem RAB Kontraktor v1.0.0 - Next.js Edition*
