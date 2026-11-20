# SRS / PRD RABKita
## Sistem Manajemen RAB untuk Perusahaan Kontraktor

| Item | Nilai |
|---|---|
| Versi | 2.0 |
| Status | Draft untuk review produk |
| Tanggal | 9 November 2026 |
| Prepared by | Product Management & System Analysis |
| Repository | `C:\Project\rab-system-next` |
| Sumber confirmed | Source code, `prisma/schema.prisma`, `docs/RAKBITA-Dokumentasi-Lengkap.md` |

> **Notasi status:** `Confirmed` berarti tersedia di source code atau schema. `Planned` berarti requirement yang disetujui untuk dibangun, tetapi belum boleh dianggap selesai. `Proposed` berarti rekomendasi yang masih perlu keputusan.

---

# 1. Executive Summary

RABKita adalah aplikasi web untuk perusahaan kontraktor, estimator, dan pemilik usaha konstruksi. Sistem membantu membuat proyek, menyusun item RAB, menghitung biaya, mengelola material, menyimpan revisi, menangani change order, menghasilkan estimasi rumah, memakai rekomendasi AI, dan menerbitkan PDF beridentitas perusahaan.

Masalah utama yang diselesaikan: spreadsheet tidak konsisten, rumus mudah salah, histori perubahan hilang, data material tersebar, dan dokumen RAB untuk klien tidak seragam.

Sistem saat ini memakai Next.js App Router, React, Tailwind CSS, Prisma, MariaDB/MySQL, NextAuth, Gemini API, PDFKit, dan Vitest. Beberapa fitur sudah memiliki UI/API; sebagian entity sudah ada di schema tetapi belum memiliki endpoint dan workflow lengkap. Dokumen ini memisahkan kondisi implementasi dari target requirement.

## Keputusan discovery

1. Semua fitur yang sudah tercantum di Prisma schema masuk scope requirement.
2. Role wajib: `admin`, `estimator`, `manager`, `client`.
3. Permission matrix harus diterapkan di backend, bukan hanya ditampilkan di UI.
4. Semua diagram dibuat berdasarkan requirement ini.
5. Dokumen ini menjadi draft untuk review sebelum development lanjutan.

---

# 2. Product Overview

## 2.1 Vision

Menjadi workspace RAB yang akurat, mudah diaudit, dan siap dipakai perusahaan kontraktor dari estimasi awal sampai dokumen penawaran.

## 2.2 Value proposition

- Perhitungan biaya otomatis dan konsisten.
- Data proyek, material, revisi, dan change order tersimpan terstruktur.
- PDF RAB siap dikirim dengan identitas perusahaan.
- Rekomendasi AI mempercepat penyusunan item awal.
- Akses data dibatasi berdasarkan role dan kepemilikan.

## 2.3 Business goals

- Mengurangi input manual dan kesalahan perhitungan.
- Mempercepat pembuatan penawaran.
- Menjaga histori perubahan RAB.
- Menstandarkan dokumen yang dikirim ke klien.

## 2.4 Proposed success metrics

Target berikut **proposed**, bukan confirmed:

| Metric | Target usulan |
|---|---:|
| RAB pertama selesai setelah akun dibuat | ≤ 15 menit |
| Error perhitungan subtotal/grand total | 0 pada test case valid |
| Request halaman utama/dashboard lokal | p95 ≤ 2 detik |
| Export PDF berhasil pada data valid | ≥ 99% |
| Proyek user lain terlihat oleh user | 0 kasus |

---

# 3. Background & Problem Statement

## 3.1 Kondisi bisnis

Kontraktor UMKM dan estimator sering memakai spreadsheet untuk menghitung material, upah, volume, pajak, margin, dan biaya jasa. Metode ini sulit dikontrol ketika jumlah proyek dan revisi bertambah.

## 3.2 Root causes

1. Formula tersebar di banyak file.
2. Harga material tidak memiliki master data terpusat.
3. Versi RAB tidak memiliki snapshot dan catatan perubahan.
4. Akses dokumen tidak mengikuti role organisasi.
5. Dokumen final membutuhkan format manual.

## 3.3 Proposed solution

RABKita menyediakan workspace per user/company, kalkulasi server-side, master material, revision snapshot, change order, AI assistance, company branding, dan export PDF.

---

# 4. Scope

## 4.1 In scope

- Register, login, session, profile.
- Company settings dan branding PDF.
- Dashboard.
- CRUD proyek.
- CRUD item RAB.
- Perhitungan subtotal, diskon, pajak, biaya jasa, margin, grand total.
- Master material dan supplier field.
- Revision snapshot.
- Change order.
- Rekomendasi Gemini.
- Estimasi rumah cepat.
- Analytics estimasi.
- Quotation request.
- Preview dan export PDF.
- Role-based access control.
- Audit trail minimal untuk revisi dan status transitions.

## 4.2 Out of scope

- Akuntansi dan jurnal keuangan.
- Invoice dan pembayaran.
- Procurement dan purchase order.
- Timesheet, payroll, dan monitoring pekerja.
- Gantt/progress fisik lapangan.
- Chat real-time.
- Native Android/iOS.
- Multi-company tenant penuh dengan organisasi terpisah, kecuali diputuskan pada fase berikutnya.

## 4.3 MVP

MVP wajib: auth, role check, project CRUD, item RAB, calculation engine, material CRUD, company settings, PDF export, dan test coverage untuk perhitungan.

Fase berikutnya: revisions, change orders, AI, house estimation, analytics, quotation request.

---

# 5. Personas

| Persona | Tujuan | Pain point |
|---|---|---|
| Admin/pemilik usaha | Mengontrol perusahaan, user, proyek, dan dokumen | Data tersebar, sulit audit |
| Estimator | Membuat RAB akurat dengan cepat | Input berulang, formula rawan salah |
| Manager | Review dan approve perubahan biaya | Sulit membandingkan versi |
| Client | Melihat dokumen penawaran yang jelas | Dokumen tidak seragam, tidak mudah diverifikasi |

---

# 6. Roles & Permission Matrix

Akses harus diperiksa pada server berdasarkan session user dan ownership/relationship. UI hide button bukan kontrol keamanan.

| Aksi | admin | estimator | manager | client |
|---|---:|---:|---:|---:|
| Login, lihat profil sendiri | Allow | Allow | Allow | Allow |
| Ubah profil sendiri | Allow | Allow | Allow | Allow |
| Ubah company settings | Allow | Deny | Conditional: assigned company | Deny |
| Buat proyek | Allow | Allow | Allow | Deny |
| Lihat proyek perusahaan | Allow | Assigned/own | Assigned/own | Shared only |
| Edit metadata proyek | Allow | Own/assigned | Assigned | Deny |
| Hapus proyek | Allow | Own + policy | Deny | Deny |
| Tambah/edit item RAB | Allow | Allow assigned | Conditional review | Deny |
| Hapus item RAB | Allow | Allow assigned | Deny/conditional | Deny |
| Kelola master material | Allow | Allow own/company | Read | Deny |
| Simpan revisi | Allow | Allow | Allow | Deny |
| Lihat revisi | Allow | Assigned/own | Assigned | Shared final only |
| Ajukan change order | Allow | Allow | Allow | Deny |
| Approve/reject change order | Allow | Deny | Allow | Deny |
| Meminta rekomendasi AI | Allow | Allow | Allow | Deny |
| Terima saran AI jadi item | Allow | Allow | Allow | Deny |
| Export PDF | Allow | Allow assigned | Allow assigned | Allow shared |
| Lihat analytics internal | Allow | Own/assigned | Company | Deny |
| Kelola quotation request | Allow | Read/conditional | Read | Create public request |
| Kelola user/role | Allow | Deny | Deny | Deny |

**Assumption:** istilah `company` pada matrix adalah target multi-user yang belum lengkap di schema. Implementasi fase awal dapat memakai ownership user; migration organisasi harus dilakukan sebelum akses lintas user diaktifkan.

---

# 7. Functional Requirements Catalogue

## Authentication & account

### FR-AUTH-001 — Register
- **Actor:** visitor.
- **Precondition:** email belum terdaftar.
- **Input:** nama, email, password.
- **Logic:** validasi Zod; cek email unik; hash password dengan bcrypt; buat `User` dan `ProfileSetting` default.
- **Output:** akun tersimpan; redirect ke login.
- **Alternative/error:** email duplikat → 409; input invalid → 400; DB failure → 500 tanpa password bocor.
- **Priority:** Must Have.

### FR-AUTH-002 — Login/session
- **Actor:** registered user.
- **Logic:** NextAuth Credentials memverifikasi password hash dan membuat session.
- **Output:** dashboard.
- **Error:** kredensial salah → pesan generik; jangan mengungkap apakah email ada.
- **Priority:** Must Have.

### FR-AUTH-003 — Role authorization
- **Actor:** authenticated user.
- **Logic:** middleware/API guard membaca role dari server-side profile; cek permission dan ownership sebelum mutation/read.
- **Output:** 401 bila belum login; 403 bila role tidak berhak.
- **Priority:** Must Have; **gap saat ini**.

### FR-AUTH-004 — Profile management
- **Input:** name, phone, department, notes.
- **Logic:** update record user/profile sendiri.
- **Priority:** Should Have.

## Project & RAB

### FR-PROJ-001 — Create project
- **Input:** projectName, clientName, description, dates, status, pricing parameters.
- **Logic:** owner dari session, bukan request body; default status `planning`, tax 11%, margin 15% bila tidak dikirim.
- **Output:** project ID.
- **Error:** tanggal invalid, angka negatif, owner tidak valid.
- **Priority:** Must Have.

### FR-PROJ-002 — Read/update/delete project
- **Logic:** hanya owner/role yang berhak; delete cascade item/revision/change order/AI request sesuai policy.
- **Priority:** Must Have.

### FR-RAB-001 — Manage RAB item
- **Input:** projectId, materialId optional, groupName, name, category, volume, unit, unitPrice.
- **Logic:** validasi ownership; jika material dipilih, gunakan harga material sebagai default; hitung subtotal server-side.
- **Output:** item dengan subtotal 2 desimal.
- **Error:** volume/harga negatif, project tidak ditemukan, material bukan milik user.
- **Priority:** Must Have.

### FR-RAB-002 — Calculate summary
- **Logic:**
  ```text
  itemsSubtotal = Σ(volume × unitPrice)
  afterDiscount = max(0, itemsSubtotal − discount)
  taxAmount = afterDiscount × taxPercent / 100
  marginAmount = (afterDiscount + serviceFee) × marginPercent / 100
  grandTotal = afterDiscount + taxAmount + serviceFee + marginAmount
  ```
- **Priority:** Must Have.

### FR-RAB-003 — Save revision
- **Input:** label, notes.
- **Logic:** snapshot immutable item state, summary, actor, timestamp ke `RabRevision`.
- **Output:** revision ID.
- **Priority:** Should Have; **planned endpoint**.

### FR-RAB-004 — Preview/export PDF
- **Logic:** fetch authorized project, calculate summary, load company settings, generate PDFKit stream.
- **Error:** no company settings → fallback identity atau validation message; missing project → 404.
- **Priority:** Must Have.

## Materials

### FR-MAT-001 — Material CRUD
- **Input:** name, category, unit, unitPrice, supplier, description.
- **Logic:** scope by `ownerId`; material deletion sets existing `RabItem.materialId` null, item tetap ada.
- **Priority:** Must Have.

## Change order

### FR-CO-001 — Create and submit change order
- **Input:** title, description, amount, requestedAt.
- **Logic:** create `draft`; submit changes to `submitted`; actor and project authorization checked.
- **Priority:** Should Have; **planned endpoint**.

### FR-CO-002 — Approve/reject change order
- **Actor:** admin/manager.
- **Logic:** only `submitted` can become `approved` or `rejected`; invalid transition → 409.
- **Priority:** Should Have; **planned endpoint**.

## AI

### FR-AI-001 — Request recommendation
- **Input:** prompt and project context.
- **Logic:** create `AiRequest(pending)`; call Gemini; set `processing`, then `completed` + JSON suggestions or `failed` + safe error.
- **Security:** API key server-only; rate limit proposed.
- **Priority:** Should Have.

### FR-AI-002 — Accept suggestion
- **Logic:** validate suggestion schema; create RAB item; set `acceptedAt`; recalculate summary.
- **Priority:** Should Have; **planned completion path**.

## House estimation & analytics

### FR-EST-001 — Create house estimation
- **Input:** houseType, floorArea, landArea, bedrooms, bathrooms, quality, location, features.
- **Logic:** calculate total and breakdown using versioned estimation rules; save `HouseEstimation`.
- **Priority:** Could Have; **planned endpoint**.

### FR-EST-002 — Estimation analytics
- **Logic:** aggregate count/average/data by user and period; hide personally sensitive data from unauthorized roles.
- **Priority:** Could Have; **planned endpoint**.

## Quotation request

### FR-QUOTE-001 — Public quotation request
- **Input:** name, email, phone, location, message.
- **Logic:** sanitize, validate, save `pending`; no auth required.
- **Priority:** Should Have; **planned endpoint**.

### FR-QUOTE-002 — Review/contact status
- **Actor:** admin/authorized staff.
- **Logic:** `pending → reviewed → contacted`; invalid transition → 409.
- **Priority:** Should Have; **planned endpoint**.

---

# 8. Business Rules

| ID | Rule |
|---|---|
| BR-001 | Semua angka uang disimpan dengan decimal precision; jangan memakai float sebagai sumber kebenaran. |
| BR-002 | `subtotal = volume × unitPrice`, dibulatkan dua desimal. |
| BR-003 | Diskon nominal tidak boleh membuat dasar biaya di bawah nol. |
| BR-004 | Pajak dihitung dari `afterDiscount`. |
| BR-005 | Margin dihitung dari `afterDiscount + serviceFee`. |
| BR-006 | `grandTotal` tidak boleh dipercaya dari client; backend menghitung ulang. |
| BR-007 | `createdBy`, `ownerId`, dan `userId` mutation berasal dari session. |
| BR-008 | User hanya boleh membaca/mengubah data dalam scope aksesnya. |
| BR-009 | Status proyek valid: `planning`, `progress`, `completed`, `cancelled`. |
| BR-010 | Status AI valid: `pending`, `processing`, `completed`, `failed`. |
| BR-011 | Change order valid: `draft → submitted → approved/rejected`; hanya admin/manager approve. |
| BR-012 | Revisi adalah snapshot; perubahan item setelahnya tidak mengubah revisi lama. |
| BR-013 | Penghapusan material tidak menghapus RAB item; relasi menjadi null. |
| BR-014 | Password tidak pernah ditulis ke log, response, atau PDF. |
| BR-015 | AI suggestion wajib tervalidasi sebelum menjadi item RAB. |

---

# 9. Data Requirements

| Entity | Key & purpose | Relationship |
|---|---|---|
| `User` | PK `id`; account identity | 1:many projects/materials/AI/revisions |
| `ProfileSetting` | unique FK `userId`; role/profile | 1:1 User |
| `CompanySettings` | unique FK `ownerId`; branding | 1:1 User |
| `Project` | PK `id`, FK `createdBy`; project header + pricing | 1:many items/revisions/change orders/AI |
| `RabItem` | PK `id`, FK project, optional material | many:1 Project/Material |
| `Material` | PK `id`, FK owner | 1:many RabItem |
| `RabRevision` | snapshot immutable | many:1 Project/User |
| `ChangeOrder` | amount + workflow status | many:1 Project/User |
| `AiRequest` | prompt, status, suggestions | many:1 Project/User |
| `HouseEstimation` | estimation input/output | optional many:1 User |
| `EstimationAnalytic` | aggregate metric | optional many:1 User |
| `QuotationRequest` | lead public | standalone |

## Data lifecycle

- Account deletion: cascade owned profile/company/projects per retention policy.
- Project deletion: cascade items, revisions, change orders, AI requests according to current schema.
- Revision: append-only; no in-place overwrite of snapshot.
- Logs: proposed retention 90 days; confirm with business owner.

## Data gaps requiring implementation

1. `Material.ownerId` default `1` berisiko salah ownership; harus selalu diisi dari session.
2. Schema belum memiliki organization/company membership; role lintas user belum aman untuk shared company.
3. Schema belum memiliki audit log generik untuk perubahan status/permission.
4. Schema tidak menunjukkan relation langsung `QuotationRequest` ke company owner.

---

# 10. Information Architecture

```text
/
├── /login
├── /register
├── /dashboard
│   ├── /projects
│   │   ├── /projects/new
│   │   └── /projects/[id]
│   │       ├── RAB items
│   │       ├── summary
│   │       ├── revisions
│   │       ├── change orders
│   │       ├── AI recommendations
│   │       └── PDF export
│   ├── /materials
│   ├── /profile
│   ├── /company-settings
│   ├── /house-estimations (planned)
│   └── /analytics (planned)
└── /quotation-request (public/planned)
```

---

# 11. UI/UX Requirements

- Navigation menampilkan menu sesuai role.
- Form angka memakai format lokal tetapi mengirim numeric value tervalidasi.
- Loading state pada dashboard, tabel, summary, AI, dan export.
- Empty state harus memiliki CTA: buat proyek, tambah material, atau buat estimasi.
- Error state menampilkan pesan bisnis yang aman dan action pemulihan.
- Mutation sukses memberi feedback dan refresh data terkait.
- Tabel RAB tidak overflow pada viewport 390px; gunakan card/scroll horizontal terkontrol.
- Tombol destructive membutuhkan konfirmasi.
- Status menggunakan label teks, bukan warna saja.
- Kontras dan keyboard navigation memenuhi WCAG 2.1 AA sebagai target proposed.

---

# 12. Integration Requirements

| Service | Purpose | Auth | Failure handling |
|---|---|---|---|
| NextAuth Credentials | login/session | `NEXTAUTH_SECRET` | generic invalid credential; session expiry |
| MariaDB/MySQL + Prisma | persistence | `DATABASE_URL` | structured 500, rollback transaction |
| Gemini API | suggestion | `GEMINI_API_KEY` server-only | `AiRequest.failed`, retry bounded, manual fallback |
| PDFKit | PDF stream | internal | return safe error; no partial sensitive data |

API contracts must validate all request bodies with Zod (or equivalent) and return stable JSON errors: `{ error: { code, message, fieldErrors? } }`.

## Current endpoint inventory

- `POST /api/auth/register`
- `GET/POST /api/projects`
- `GET/PATCH/DELETE /api/projects/[id]`
- `GET/POST /api/projects/[id]/items`
- `PATCH/DELETE /api/projects/[id]/items/[itemId]`
- `GET /api/projects/[id]/summary`
- `GET /api/projects/[id]/pdf`
- `POST /api/projects/[id]/ai/recommend`
- `GET/PUT /api/materials`
- `PATCH/DELETE /api/materials/[id]`
- `GET/PUT /api/profile`
- `GET/PUT /api/company-settings`
- `GET /api/health`

## Planned endpoints

- `GET/POST /api/projects/[id]/revisions`
- `GET /api/projects/[id]/revisions/[revisionId]`
- `GET/POST /api/projects/[id]/change-orders`
- `PATCH /api/projects/[id]/change-orders/[changeOrderId]`
- `POST /api/projects/[id]/ai/recommend/[requestId]/accept`
- `GET/POST /api/house-estimations`
- `GET /api/analytics/estimations`
- `POST /api/quotation-requests`
- `GET/PATCH /api/quotation-requests/[id]`
- `GET/POST /api/users` (admin only)

---

# 13. Technical Architecture Recommendations

1. **Server authority:** semua authorization dan calculation di route/server layer.
2. **Service layer:** pindahkan business rules dari route ke service modules agar mudah dites.
3. **Transactions:** project mutation + related records gunakan Prisma transaction bila lebih dari satu write.
4. **Validation:** schema terpisah per endpoint; reject unknown/negative values.
5. **RBAC:** `requireSession()` + `requirePermission()` + `assertProjectAccess()`.
6. **Organization:** tambah `Company/Organization`, membership, dan role membership sebelum shared-company access.
7. **Audit:** tambah `AuditLog` untuk actor, action, entity, entityId, before/after, timestamp.
8. **AI:** queue/background job bila latency tinggi; timeout, rate limit, idempotency key.
9. **Observability:** structured server logs dengan request ID; redaction secrets/passwords.
10. **Deployment:** Node runtime, MariaDB backup, environment secrets, HTTPS, migration gate.
11. **Backup:** daily database backup, tested restore, retention sesuai policy bisnis.

---

# 14. User Stories & Acceptance Criteria

### US-001 — Membuat RAB
Sebagai estimator, saya ingin membuat proyek dan item RAB agar dapat menghitung penawaran.

- **Given** user login dan memiliki akses proyek
- **When** user membuat proyek lalu menambah item volume 10 dan harga 100.000
- **Then** subtotal item menjadi 1.000.000
- **And** project summary memakai angka server-side

### US-002 — Review change order
Sebagai manager, saya ingin approve/reject change order agar perubahan biaya terkendali.

- **Given** change order berstatus `submitted`
- **When** manager menekan approve
- **Then** status menjadi `approved`
- **And** user non-manager menerima 403

### US-003 — Export dokumen
Sebagai estimator, saya ingin export PDF agar dapat mengirim RAB ke klien.

- **Given** project valid dan user authorized
- **When** user menekan export
- **Then** PDF berisi identitas perusahaan, item, summary, dan grand total

### US-004 — Data isolation
Sebagai user, saya tidak ingin melihat proyek user lain.

- **Given** project milik User A
- **When** User B meminta project ID tersebut
- **Then** server mengembalikan 404 atau 403 sesuai policy, tanpa data project

---

# 15. Reporting & Analytics

- Dashboard: jumlah proyek per status, total estimasi, proyek terakhir.
- Project report: subtotal, diskon, pajak, service fee, margin, grand total.
- Revision report: label, actor, timestamp, total per versi.
- Change order report: jumlah per status dan nilai approved.
- Estimation analytics: count dan average menurut quality/location/period.
- Semua report internal harus discope ke owner/company dan role.

---

# 16. Acceptance & Definition of Done

Feature selesai bila:

1. Requirement ID memiliki endpoint/UI/DB mapping.
2. Permission check diuji di backend.
3. Input invalid menghasilkan error terstruktur.
4. Happy path dan failure path memiliki test.
5. Build production berhasil.
6. Unit tests calculation berhasil.
7. Tidak ada credential/API key di repository.
8. UI responsive pada desktop dan 390px.
9. Database migration dapat dijalankan dari environment bersih.
10. Dokumentasi dan RTM diperbarui.

---

# 17. Development Readiness Assessment

**Status: Ready for review, belum ready for full production build.**

| Area | Status | Catatan |
|---|---|---|
| Product direction | Ready | scope dan persona jelas |
| Core RAB calculation | Ready | engine tersedia; perlu test coverage final |
| Basic project/material API | Partial | endpoint tersedia; audit permission wajib |
| Authentication | Partial | route tersedia; role guard perlu diperkuat |
| Role model | Not ready | enum ada, enforcement dan org membership belum lengkap |
| Revision/change order | Not ready | schema ada, endpoint/workflow belum lengkap |
| AI | Partial | recommendation endpoint ada, acceptance flow belum lengkap |
| PDF | Partial/Ready | endpoint tersedia; perlu test output dan access control |
| House estimation/analytics | Not ready | schema ada, endpoint/UI belum lengkap |
| Quotation request | Not ready | schema ada, endpoint/UI belum lengkap |
| Documentation | Draft ready | menunggu review keputusan bisnis |
