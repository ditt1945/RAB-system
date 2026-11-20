# System Architecture & Modeling Diagrams — RABKita

Semua diagram menggunakan Mermaid syntax.

---

## 1. Information Architecture & Sitemap

```mermaid
flowchart TD
    subgraph Public["Public Zone"]
        P_LANDING["Landing Page (/)"]
        P_LOGIN["Login (/login)"]
        P_REGISTER["Register (/register)"]
        P_QUOTE["Permintaan Penawaran (Public CTA)"]
    end

    subgraph Auth["Authenticated Area (/dashboard)"]
        D_HOME["Dashboard Utama (/dashboard)"]
        
        subgraph Projects["Project Management"]
            PROJ_LIST["Daftar Proyek (/projects)"]
            PROJ_NEW["Buat Proyek Baru (/projects/new)"]
            PROJ_DETAIL["Detail Proyek (/projects/[id])"]
            PROJ_ITEMS["Item RAB (Tabel & Editor)"]
            PROJ_SUMMARY["Summary & Pricing Parameters"]
            PROJ_REV["Riwayat Revisi (Snapshot)"]
            PROJ_CO["Change Orders"]
            PROJ_AI["AI Recommendation Workspace"]
            PROJ_PDF["Export PDF Preview/Download"]
        end

        subgraph MasterData["Master Data & Configuration"]
            MAT_LIST["Master Material & Harga (/materials)"]
            COMP_SET["Pengaturan Perusahaan & Kop (/company-settings)"]
            USER_PROF["Profil Pengguna (/profile)"]
        end

        subgraph Estimation["Quick Tools (Planned)"]
            HOUSE_EST["Estimasi Rumah Cepat (/house-estimations)"]
            ANALYTICS["Estimation Analytics (/analytics)"]
        end

        subgraph AdminOnly["Admin Area (Planned)"]
            USER_MGMT["Manajemen User & Role (/admin/users)"]
            QUOTE_MGMT["Kelola Penawaran Masuk (/admin/quotations)"]
        end
    end

    P_LANDING --> P_LOGIN
    P_LANDING --> P_REGISTER
    P_LANDING --> P_QUOTE

    P_LOGIN --> D_HOME
    P_REGISTER --> P_LOGIN

    D_HOME --> PROJ_LIST
    D_HOME --> MAT_LIST
    D_HOME --> COMP_SET
    D_HOME --> USER_PROF
    D_HOME --> HOUSE_EST
    D_HOME --> ANALYTICS
    D_HOME --> USER_MGMT
    D_HOME --> QUOTE_MGMT

    PROJ_LIST --> PROJ_NEW
    PROJ_LIST --> PROJ_DETAIL

    PROJ_DETAIL --> PROJ_ITEMS
    PROJ_DETAIL --> PROJ_SUMMARY
    PROJ_DETAIL --> PROJ_REV
    PROJ_DETAIL --> PROJ_CO
    PROJ_DETAIL --> PROJ_AI
    PROJ_DETAIL --> PROJ_PDF
```

---

## 2. Use Case Diagram

```mermaid
flowchart LR
    subgraph Actors
        GUEST["Visitor / Guest"]
        EST["Estimator"]
        MGR["Manager"]
        ADM["Admin / Owner"]
        SYS["Gemini AI Service"]
    end

    subgraph Boundaries["Sistem RABKita"]
        UC_REG["Registrasi Akun"]
        UC_LOG["Login & Manage Profile"]
        UC_COMP["Konfigurasi Kop & Perusahaan"]
        UC_MAT["Kelola Master Material"]
        UC_PROJ["Kelola Proyek"]
        UC_RAB["Kelola Item RAB & Subtotal"]
        UC_SUM["Hitung Grand Total & Parameter Biaya"]
        UC_REV["Simpan & Bandingkan Revisi"]
        UC_CO_CREATE["Ajukan Change Order"]
        UC_CO_APPR["Review (Approve/Reject) Change Order"]
        UC_AI["Minta Rekomendasi AI"]
        UC_PDF["Cetak Dokumen PDF RAB"]
        UC_EST["Hitung Estimasi Rumah Cepat"]
        UC_QUOTE["Submit Permintaan Penawaran"]
        UC_QUOTE_MGT["Tindak Lanjuti Penawaran"]
    end

    GUEST --> UC_REG
    GUEST --> UC_LOG
    GUEST --> UC_QUOTE

    EST --> UC_LOG
    EST --> UC_PROJ
    EST --> UC_RAB
    EST --> UC_SUM
    EST --> UC_MAT
    EST --> UC_REV
    EST --> UC_CO_CREATE
    EST --> UC_AI
    EST --> UC_PDF
    EST --> UC_EST

    MGR --> UC_LOG
    MGR --> UC_PROJ
    MGR --> UC_SUM
    MGR --> UC_CO_APPR
    MGR --> UC_REV
    MGR --> UC_PDF

    ADM --> UC_LOG
    ADM --> UC_COMP
    ADM --> UC_MAT
    ADM --> UC_PROJ
    ADM --> UC_CO_APPR
    ADM --> UC_QUOTE_MGT
    ADM --> UC_PDF

    UC_AI -.->|includes external call| SYS
    UC_RAB -.->|triggers| UC_SUM
    UC_PDF -.->|requires| UC_COMP
    UC_PDF -.->|requires| UC_SUM
```

---

## 3. User Flow Diagrams

### 3.1 Alur Inti: Estimator Menyusun RAB

```mermaid
flowchart TD
    START([Mulai]) --> LOGIN[Login ke Akun]
    LOGIN --> DASH[Akses Dashboard]
    DASH --> PROJ_CHOICE{Proyek Baru atau Ada?}
    
    PROJ_CHOICE -->|Proyek Baru| NEW_PROJ[Isi Form Proyek & Parameter: Pajak, Margin, Jasa]
    NEW_PROJ --> SAVE_PROJ[Simpan Proyek Baru]
    SAVE_PROJ --> DET_PROJ[Masuk ke Detail Proyek]
    
    PROJ_CHOICE -->|Ada| SEL_PROJ[Pilih Proyek dari Daftar]
    SEL_PROJ --> DET_PROJ

    DET_PROJ --> ITEM_METHOD{Cara Input Item?}
    
    ITEM_METHOD -->|Pilih dari Master| PICK_MAT[Pilih Master Material]
    PICK_MAT --> FILL_VOL[Isi Volume & Unit]
    
    ITEM_METHOD -->|Input Manual| FILL_MAN[Ketik Nama, Kategori, Volume, Satuan, Harga Satuan]
    
    ITEM_METHOD -->|Rekomendasi AI| AI_REQ[Input Deskripsi Kebutuhan Proyek]
    AI_REQ --> AI_WAIT[Tunggu Respon AI]
    AI_WAIT --> AI_PICK[Pilih Saran Pekerjaan/Material]
    AI_PICK --> FILL_VOL

    FILL_VOL --> SAVE_ITEM[Simpan Item RAB]
    FILL_MAN --> SAVE_ITEM

    SAVE_ITEM --> RECALC[Sistem Hitung Subtotal & Grand Total Server-Side]
    RECALC --> CHECK_SUM{Cek Ringkasan Biaya}
    
    CHECK_SUM -->|Perlu Tambah/Edit| DET_PROJ
    CHECK_SUM -->|Sudah Sesuai| SAVE_REV{Perlu Kunci Versi?}
    
    SAVE_REV -->|Ya| REV_DO[Klik Simpan Revisi & Beri Catatan]
    REV_DO --> EXPORT_PDF[Klik Export PDF]
    SAVE_REV -->|Tidak| EXPORT_PDF

    EXPORT_PDF --> DOWNLOAD[Download PDF Siap Kirim]
    DOWNLOAD --> FINISH([Selesai])
```

### 3.2 Alur Persetujuan Change Order (Manager)

```mermaid
flowchart TD
    START([Mulai]) --> LOGIN[Manager/Admin Login]
    LOGIN --> VIEW_PROJ[Buka Detail Proyek]
    VIEW_PROJ --> TAB_CO[Buka Tab Change Order]
    TAB_CO --> LIST_CO[Pilih Change Order Berstatus 'submitted']
    LIST_CO --> REVIEW[Review Judul, Deskripsi & Nominal Biaya]
    REVIEW --> DECISION{Keputusan?}
    
    DECISION -->|Setuju| APPROVE[Klik Approve]
    APPROVE --> DB_APP[Update Status: approved]
    DB_APP --> UPDATE_IMPACT[Catat Dampak ke Total Anggaran]
    
    DECISION -->|Tolak| REJECT[Klik Reject & Beri Alasan]
    REJECT --> DB_REJ[Update Status: rejected]
    
    UPDATE_IMPACT --> NOTIF[Tampilkan Status Baru]
    DB_REJ --> NOTIF
    NOTIF --> FINISH([Selesai])
```

---

## 4. System Flowchart (End-to-End Business Logic & Exceptions)

```mermaid
flowchart TD
    START([Mulai Request Client]) --> AUTH_CHECK{Memiliki Sesi Aktif?}
    
    AUTH_CHECK -->|Tidak| RET_401[Kembalikan HTTP 401 Unauthorized]
    AUTH_CHECK -->|Ya| GET_USER[Ambil Session User & Role dari DB]
    
    GET_USER --> ROLE_GUARD{Role & Izin Memenuhi Syarat?}
    ROLE_GUARD -->|Tidak| RET_403[Kembalikan HTTP 403 Forbidden]
    
    ROLE_GUARD -->|Ya| ROUTE_TYPE{Tipe Endpoint}

    %% PROJECT MUTATION
    ROUTE_TYPE -->|Project Mutation| VAL_PROJ_INPUT{Validasi Schema Zod}
    VAL_PROJ_INPUT -->|Gagal| RET_400[Kembalikan HTTP 400 Bad Request]
    VAL_PROJ_INPUT -->|Valid| OWN_PROJ{Verifikasi Ownership Proyek}
    OWN_PROJ -->|Bukan Milik Sendiri & Bukan Admin| RET_404[Kembalikan HTTP 404 / 403]
    OWN_PROJ -->|Valid| DB_PROJ[Eksekusi Query DB Prisma]
    DB_PROJ --> RET_200[Kembalikan HTTP 200/201 JSON]

    %% RAB ITEM CALCULATION
    ROUTE_TYPE -->|Tambah/Update Item RAB| VAL_ITEM{Validasi Input Angka}
    VAL_ITEM -->|Volume/Harga < 0| RET_400
    VAL_ITEM -->|Valid| MAT_LINK{Memakai Material ID?}
    MAT_LINK -->|Ya| VER_MAT{Material Milik Akun?}
    VER_MAT -->|Tidak| RET_400
    VER_MAT -->|Ya| USE_MAT_PRICE[Pakai Harga Master Material]
    MAT_LINK -->|Tidak| USE_MAN_PRICE[Pakai Harga Input Manual]
    
    USE_MAT_PRICE --> CALC_SUB[Hitung Subtotal = Volume * UnitPrice]
    USE_MAN_PRICE --> CALC_SUB
    CALC_SUB --> DB_SAVE_ITEM[Simpan Item via Prisma]
    DB_SAVE_ITEM --> TRIGGER_SUM[Hitung Ulang Ringkasan Server-Side]
    TRIGGER_SUM --> RET_200

    %% AI RECOMMENDATION
    ROUTE_TYPE -->|Request AI Gemini| VAL_PROMPT{Prompt Valid?}
    VAL_PROMPT -->|Kosong| RET_400
    VAL_PROMPT -->|Valid| CREATE_AI_REC[Simpan AiRequest Status: pending]
    CREATE_AI_REC --> CALL_GEMINI{Panggil Gemini 2.0 Flash API}
    CALL_GEMINI -->|Timeout / Quota / Error| UPDATE_AI_FAIL[Update Status: failed + simpan error]
    UPDATE_AI_FAIL --> RET_502[Kembalikan Respon Error Terstruktur]
    CALL_GEMINI -->|Sukses| PARSE_AI{Validasi JSON Response AI}
    PARSE_AI -->|Format Rusak| UPDATE_AI_FAIL
    PARSE_AI -->|Sesuai Schema| UPDATE_AI_OK[Update Status: completed + simpan JSON]
    UPDATE_AI_OK --> RET_200

    %% PDF EXPORT
    ROUTE_TYPE -->|Export PDF| GET_ALL_DATA[Fetch Proyek, Items, & CompanySettings]
    GET_ALL_DATA --> HAS_COMP{Data Perusahaan Lengkap?}
    HAS_COMP -->|Tidak| FALLBACK_COMP[Gunakan Data Default Akun]
    HAS_COMP -->|Ya| STREAM_PDF[Inisialisasi PDFKit Document]
    FALLBACK_COMP --> STREAM_PDF
    STREAM_PDF --> BUILD_HEADER[Gambar Kop Perusahaan & Info Klien]
    BUILD_HEADER --> BUILD_TABLE[Loop Item RAB & Cetak Tabel]
    BUILD_TABLE --> BUILD_SUMMARY[Cetak Subtotal, Diskon, Pajak, Margin, Grand Total]
    BUILD_SUMMARY --> FLUSH_STREAM[Kirim binary stream application/pdf]
    FLUSH_STREAM --> FINISH([Selesai])

    RET_401 --> FINISH
    RET_403 --> FINISH
    RET_400 --> FINISH
    RET_404 --> FINISH
    RET_502 --> FINISH
    RET_200 --> FINISH
```

---

## 5. Activity Diagram with Swimlanes (Penyusunan & Pengesahan RAB)

```mermaid
sequenceDiagram
    autonumber
    actor User as Estimator / User
    participant FE as Frontend (Next.js)
    participant BE as Backend (API Route)
    participant DB as MariaDB (Prisma)
    participant AI as Gemini API

    %% AUTENTIKASI & SETUP
    User->>FE: Buka halaman proyek & input item
    FE->>BE: POST /api/projects/{id}/items (payload)
    
    activate BE
    BE->>BE: requireSession() & assertRole()
    alt Belum Login / Akses Ditolak
        BE-->>FE: HTTP 401 / 403
        FE-->>User: Tampilkan notifikasi error otorisasi
    else Otorisasi Valid
        BE->>BE: Validasi Zod (Volume >= 0, UnitPrice >= 0)
        BE->>BE: Hitung subtotal via Decimal.js
        BE->>DB: INSERT INTO rab_items
        DB-->>BE: Record item tersimpan
        BE-->>FE: HTTP 201 Created (Item Data)
        FE-->>User: Render baris item di tabel RAB
    end
    deactivate BE

    %% AI ASSISTED ITEM
    opt Meminta Saran AI
        User->>FE: Input prompt pekerjaan & klik Rekomendasi
        FE->>BE: POST /api/projects/{id}/ai/recommend
        activate BE
        BE->>DB: INSERT INTO ai_requests (status='pending')
        BE->>AI: Panggil generateContent(prompt + context)
        activate AI
        AI-->>BE: JSON array list item & spesifikasi
        deactivate AI
        BE->>DB: UPDATE ai_requests SET status='completed', suggestions=JSON
        BE-->>FE: HTTP 200 OK (Rekomendasi)
        deactivate BE
        FE-->>User: Tampilkan kartu rekomendasi AI
        User->>FE: Klik "Terima Saran"
        FE->>BE: POST /api/projects/{id}/items (dari saran AI)
        BE->>DB: INSERT INTO rab_items
        BE-->>FE: HTTP 201 Created
        FE-->>User: Baris bertambah di tabel RAB
    end

    %% RINGKASAN & PERHITUNGAN OTOMATIS
    FE->>BE: GET /api/projects/{id}/summary
    activate BE
    BE->>DB: SELECT SUM/items, discount, tax, service_fee, margin FROM projects/rab_items
    DB-->>BE: Data angka mentah
    BE->>BE: calculateProjectSummary() dengan Decimal.js
    BE-->>FE: HTTP 200 OK (itemsSubtotal, taxAmount, marginAmount, grandTotal)
    deactivate BE
    FE-->>User: Update kartu total di layar secara real-time

    %% KUNCI REVISI
    User->>FE: Klik "Simpan Revisi" (isi label & catatan)
    FE->>BE: POST /api/projects/{id}/revisions
    activate BE
    BE->>DB: Ambil snapshot seluruh rab_items & summary terkini
    BE->>DB: INSERT INTO rab_revisions (snapshot, subtotal, grand_total)
    DB-->>BE: Revision tersimpan
    BE-->>FE: HTTP 201 Created
    deactivate BE
    FE-->>User: Muncul entri riwayat revisi baru

    %% EXPORT PDF
    User->>FE: Klik tombol "Export PDF"
    FE->>BE: GET /api/projects/{id}/pdf
    activate BE
    BE->>DB: Query detail proyek, item RAB, dan company_settings
    DB-->>BE: Return data lengkap
    BE->>BE: Render PDF stream (PDFKit)
    BE-->>FE: Stream bytes application/pdf (Content-Disposition: attachment)
    deactivate BE
    FE-->>User: Browser trigger dialog simpan file PDF
```

---

## 6. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    User ||--o| ProfileSetting : "has profile"
    User ||--o| CompanySettings : "owns company info"
    User ||--o{ Project : "creates"
    User ||--o{ Material : "manages"
    User ||--o{ AiRequest : "initiates"
    User ||--o{ RabRevision : "creates revision"
    User ||--o{ ChangeOrder : "submits/approves"
    User ||--o{ HouseEstimation : "runs"
    User ||--o{ EstimationAnalytic : "tracks"

    Project ||--o{ RabItem : "contains"
    Project ||--o{ RabRevision : "has history"
    Project ||--o{ ChangeOrder : "tracks changes"
    Project ||--o{ AiRequest : "context for"
    
    Material ||--o{ RabItem : "referenced by"

    User {
        bigint id PK
        varchar name
        varchar email UK
        datetime email_verified_at
        varchar password
        datetime created_at
        datetime updated_at
    }

    ProfileSetting {
        bigint id PK
        bigint user_id FK,UK
        UserRole role "admin | estimator | manager | client"
        varchar phone_number
        varchar department
        text notes
        datetime created_at
        datetime updated_at
    }

    CompanySettings {
        bigint id PK
        bigint owner_id FK,UK
        varchar company_name
        text address
        varchar phone
        varchar email
        varchar logo_url
        datetime created_at
        datetime updated_at
    }

    Project {
        bigint id PK
        bigint created_by FK
        varchar project_name
        varchar client_name
        text description
        date start_date
        date end_date
        ProjectStatus status "planning | progress | completed | cancelled"
        decimal rab_discount
        decimal rab_tax_percent
        decimal rab_service_fee
        decimal target_margin_percent
        datetime created_at
        datetime updated_at
    }

    RabItem {
        bigint id PK
        bigint project_id FK
        bigint material_id FK "nullable, set null on delete"
        varchar group_name
        varchar name
        varchar category
        decimal volume
        varchar unit
        decimal unit_price
        decimal subtotal
        datetime created_at
        datetime updated_at
    }

    Material {
        bigint id PK
        bigint owner_id FK
        varchar name
        varchar category
        varchar unit
        decimal unit_price
        varchar supplier
        text description
        datetime created_at
        datetime updated_at
    }

    RabRevision {
        bigint id PK
        bigint project_id FK
        bigint user_id FK
        varchar label
        text notes
        json snapshot "Full frozen array of items & summary"
        decimal subtotal
        decimal grand_total
        datetime created_at
        datetime updated_at
    }

    ChangeOrder {
        bigint id PK
        bigint project_id FK
        bigint user_id FK
        varchar title
        text description
        decimal amount
        ChangeOrderStatus status "draft | submitted | approved | rejected"
        date requested_at
        datetime created_at
        datetime updated_at
    }

    AiRequest {
        bigint id PK
        bigint project_id FK
        bigint user_id FK
        text prompt
        AiRequestStatus status "pending | processing | completed | failed"
        json suggestions
        text error
        datetime accepted_at
        datetime created_at
        datetime updated_at
    }

    HouseEstimation {
        bigint id PK
        bigint user_id FK "nullable"
        varchar title
        varchar house_type
        decimal floor_area
        decimal land_area
        int bedrooms
        int bathrooms
        HouseEstimationQuality quality "hemat | standar | premium"
        varchar location
        text notes
        json additional_features
        decimal total_estimate
        json breakdown
        text summary
        HouseEstimationStatus status "pending | completed | archived"
        datetime created_at
        datetime updated_at
    }

    EstimationAnalytic {
        bigint id PK
        bigint user_id FK "nullable"
        varchar metric_type
        json data
        int count
        decimal average
        varchar period
        datetime created_at
        datetime updated_at
    }

    QuotationRequest {
        bigint id PK
        varchar name
        varchar email
        varchar phone
        varchar location
        text message
        QuotationRequestStatus status "pending | reviewed | contacted"
        datetime created_at
        datetime updated_at
    }
```

---

## 7. Sequence Diagrams

### 7.1 Sequence Diagram: Kalkulasi Grand Total Server-Side

```mermaid
sequenceDiagram
    autonumber
    participant UI as Client UI
    participant SummaryAPI as GET /api/projects/{id}/summary
    participant Auth as NextAuth Guard
    participant DB as MariaDB / Prisma
    participant Calc as rab.ts Engine (Decimal.js)

    UI->>SummaryAPI: Request data ringkasan proyek
    activate SummaryAPI
    SummaryAPI->>Auth: Validasi sesi & hak akses
    alt Sesi Tidak Valid
        Auth-->>SummaryAPI: Sesi null / invalid
        SummaryAPI-->>UI: 401 Unauthorized
    else Sesi Valid
        Auth-->>SummaryAPI: User ID & Session OK
        SummaryAPI->>DB: Query Project + RabItems (volume, unitPrice)
        DB-->>SummaryAPI: Project Data & Items List
        
        SummaryAPI->>Calc: calculateProjectSummary(items, discount, tax, serviceFee, margin)
        activate Calc
        Calc->>Calc: Hitung Σ(volume × unitPrice) -> itemsSubtotal
        Calc->>Calc: afterDiscount = max(0, subtotal - discount)
        Calc->>Calc: taxAmount = afterDiscount × (tax% / 100)
        Calc->>Calc: marginAmount = (afterDiscount + serviceFee) × (margin% / 100)
        Calc->>Calc: grandTotal = afterDiscount + tax + serviceFee + margin
        Calc-->>SummaryAPI: Return object hasil kalkulasi (semua 2 desimal)
        deactivate Calc
        
        SummaryAPI-->>UI: HTTP 200 OK { itemsSubtotal, discountAmount, afterDiscount, taxAmount, serviceFee, marginAmount, grandTotal }
    end
    deactivate SummaryAPI
```

### 7.2 Sequence Diagram: Pembuatan Dokumen PDF dengan Kop Perusahaan

```mermaid
sequenceDiagram
    autonumber
    participant Client as User Browser
    participant PdfAPI as GET /api/projects/{id}/pdf
    participant Auth as NextAuth Guard
    participant DB as MariaDB / Prisma
    participant Engine as PDFKit Stream Engine

    Client->>PdfAPI: Unduh PDF RAB
    activate PdfAPI
    PdfAPI->>Auth: Cek autentikasi user
    Auth-->>PdfAPI: User OK

    PdfAPI->>DB: SELECT Project, RabItems, User (CompanySettings) WHERE id = {id}
    DB-->>PdfAPI: Project details, items list, company settings

    PdfAPI->>Engine: Inisialisasi PDFKit(margin: 40, size: A4)
    activate Engine
    
    opt Ada CompanySettings
        Engine->>Engine: Render Logo, Nama Perusahaan, Alamat, Kontak
    end
    
    Engine->>Engine: Render Garis Pemisah & Header Proyek (Nama, Klien, Tanggal)
    Engine->>Engine: Render Tabel Item RAB (No, Nama, Vol, Sat, Harga, Subtotal)
    Engine->>Engine: Render Box Rekapitulasi (Subtotal, Diskon, PPN 11%, Biaya Jasa, Margin, Total Akhir)
    Engine->>Engine: Render Kolom Tanda Tangan (Estimator & Klien)
    
    Engine-->>PdfAPI: Chunk buffer stream siap kirim
    deactivate Engine

    PdfAPI-->>Client: Headers: Content-Type: application/pdf, Content-Disposition: attachment; filename="RAB-{id}.pdf"
    deactivate PdfAPI
    Client->>Client: Unduh file PDF otomatis
```
