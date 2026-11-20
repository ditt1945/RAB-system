# Consistency Audit, Risk & Readiness — RABKita

Audit dilakukan terhadap source code, `prisma/schema.prisma`, dan requirement di `SRS-RABKita.md`.

## 1. Consistency Audit Report

| # | Check | Temuan | Koreksi usulan | Status |
|---|---|---|---|---|
| 1 | Requirement tanpa user flow? | FR-EST-001/002, FR-QUOTE-001/002 punya flow di diagram, tapi endpoint belum ada | Dokumentasikan sebagai planned; kerjakan setelah MVP | Gap |
| 2 | Flowchart tanpa requirement? | Tidak ditemukan | - | Pass |
| 3 | Entity tanpa purpose bisnis? | `EstimationAnalytic` hanya relevan setelah HouseEstimation jalan | Kaitkan ke FR-EST-002; pastikan ada data writer | Gap kecil |
| 4 | Fitur tanpa permission? | `QuotationRequest`, `HouseEstimation` belum ada di matrix kode | Tambahkan route guard sesuai matriks | Gap |
| 5 | Validation/exception path? | Item RAB & project sudah validasi; AI accept path belum ada | Zod schema terpisah per endpoint | Gap |
| 6 | Status transition valid? | Enum `ProjectStatus`, `AiRequestStatus`, `ChangeOrderStatus`, `QuotationRequestStatus` konsisten; belum ada guard server | Validasi transisi di service layer | Gap |
| 7 | Kontradiksi aturan bisnis? | Tidak ada kontradiksi rumus | Formula §SRS 7 FR-RAB-002 dipakai sumber tunggal | Pass |
| 8 | API vs arsitektur? | 14 endpoint konsisten dengan App Router + Prisma; endpoint planned terdaftar | Implement sesuai API-AND-RTM.md | Pass |
| 9 | Acceptance criteria testable? | Ya; ditambah test ID di RTM | - | Pass |
| 10 | MVP vs future jelas? | Ya; gap di §SRS 17 | - | Pass |

## 2. Critical Gaps (blocker produksi)

1. **RBAC belum di-enforce.** Role ada di `ProfileSetting`, tetapi route tidak memakai role guard; cross-user access bergantung pada penulisan query tiap endpoint. Perbaikan: helper `requireSession()`, `requireRole()`, `assertProjectAccess()` dipakai semua route.
2. **Ownership default berbahaya.** `Material.ownerId @default(1)` — material baru bisa jatuh ke user ID 1 bila field tidak dikirim. Perbaikan: wajib set dari session; tambahkan constraint/tes.
3. **Entity tanpa endpoint:** `RabRevision`, `ChangeOrder`, `HouseEstimation`, `EstimationAnalytic`, `QuotationRequest`. Sesuai keputusan discovery: requirement wajib, implementasi bertahap.
4. **Tidak ada audit log** untuk perubahan status/approval. Revisi menyimpan snapshot, tetapi tidak mencatat siapa mengubah harga/status.

## 3. Risk Analysis

| ID | Risiko | Dampat | Prob. | Mitigasi |
|---|---|---|---|---|
| R-001 | Kebocoran data lintas user | Tinggi | Medium | RBAC backend + tes integrasi cross-user |
| R-002 | Selisih angka client vs server | Tinggi | Low | Hitung server-side, client hanya render |
| R-003 | Kunci Gemini bocor/habis kuot | Sedang | Medium | env server-only, state `AiRequest.failed`, fallback manual |
| R-004 | Data legacy skema berbeda | Sedang | Medium | `docs/migrasi-legacy.md`, skrip staging |
| R-005 | Desimal float error | Tinggi | Low | Decimal.js wajib di semua kalkulasi |
| R-006 | Rollout role/organisasi setelah data user banyak | Sedang | Medium | tambah `Organization` + membership sebelum shared-company |
| R-007 | PDF gagal saat settings kosong | Rendah | Medium | fallback identitas akun + tes export |

## 4. Development Readiness Assessment

| Aspek | Penilaian | Alasan |
|---|---|---|
| Arsitektur teknis | Ready | Stack jelas, schema lengkap, engine hitung ada |
| Core RAB (project + item + summary + PDF) | Ready | endpoint aktif, perlu hardening RBAC |
| Auth & session | Ready | NextAuth aktif |
| Role & permission | Not ready | belum di-enforce; organisasi belum ada |
| Revisi & change order | Not ready | schema tanpa endpoint |
| AI & estimasi | Partial | AI endpoint ada; accept flow & estimasi belum |
| Test | Partial | vitest terpasang, coverage perlu dinaikkan |
| Dokumen spesifikasi | Ready untuk review | SRS + diagrams + API/RTM + audit |

## 5. Urutan pengerjaan yang direkomendasikan

1. RBAC + ownership guard (blocker keamanan).
2. Tes unit perhitungan + tes integrasi cross-user.
3. Revisi snapshot + change order endpoint & UI.
4. AI accept flow + validasi schema saran.
5. House estimation + analytics.
6. Quotation request + admin follow-up.
7. Audit log + hardening PDF.
8. Migrasi data legacy & uji end-to-end.

## 6. File deliverable

| File | Isi |
|---|---|
| `docs/SRS-RABKita.md` | PRD/SRS lengkap, role matrix, FR, business rules, UI/UX, integrasi |
| `docs/SYSTEM-ARCHITECTURE-AND-DIAGRAMS.md` | Sitemap, use case, user flow, system flowchart, activity/sequence, ERD |
| `docs/API-AND-RTM.md` | Kontrak endpoint + Requirement Traceability Matrix + test case |
| `docs/CONSISTENCY-AUDIT.md` | Audit konsistensi, risiko, readiness (dokumen ini) |
| `docs/PRD.md`, `docs/FLOWCHART.md` | Dokumen ringkas v1.0 sebelumnya |
