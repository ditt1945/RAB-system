# Agent Guide - RAB System

Panduan ini untuk agent/developer yang mengerjakan aplikasi `rab-system`.

## Ringkasan Aplikasi

`rab-system` adalah web app RAB kontraktor untuk mengelola project, material, item RAB, ringkasan biaya, export/print, dan bantuan AI berbasis Gemini.

Stack utama:

- Backend: Laravel 12, PHP 8.2
- Frontend: Inertia React, React 19, Vite
- Styling: Tailwind CSS dengan utility class global di `resources/css/app.css`
- Auth: Laravel Breeze/Inertia
- Role/permission: `spatie/laravel-permission`
- Route helper frontend: Ziggy, gunakan `route('name')`
- Database lokal: SQLite di `database/database.sqlite`
- AI: Gemini API lewat `app/Services/GeminiService.php`

## Domain Penting

Entitas utama:

- `Project`: data project kontraktor dan scope kepemilikan user.
- `Material`: database harga material.
- `RabItem`: item pekerjaan/material RAB per project.
- `AiRequest`: histori request AI untuk generate, analyze, dan assistant.
- `User`: user aplikasi dengan role, terutama `admin`.

Aturan akses:

- Selalu gunakan `Project::visibleTo($user)` untuk list project.
- Sebelum menampilkan/mengubah project tertentu, pastikan `Project::isVisibleTo($user)` atau authorization setara dipanggil.
- Admin bisa melihat semua project.
- User non-admin hanya boleh melihat project dengan `created_by` miliknya.
- Jangan bocorkan data project/RAB antar user melalui controller, API, export, print, atau response Inertia.

## Struktur File

Backend:

- Routes utama: `routes/web.php`
- Controller domain: `app/Http/Controllers/ProjectController.php`, `MaterialController.php`, `RabItemController.php`, `AiRabController.php`, `UserController.php`
- Model: `app/Models`
- AI service: `app/Services/GeminiService.php`
- Job async AI: `app/Jobs/GenerateRabItems.php`
- Migration/seed: `database/migrations`, `database/seeders`

Frontend:

- Entry Inertia: `resources/js/app.jsx`
- Layout utama: `resources/js/Layouts/AppLayout.jsx`
- Navigasi: `resources/js/Components/AppNavbar.jsx`, `resources/js/Components/AppSidebar.jsx`
- Pages: `resources/js/Pages`
- Shared components: `resources/js/Components`
- Formatter: `resources/js/Utils/formatters.js`
- Global component classes: `resources/css/app.css`

## Pola Backend

- Validasi request di controller dengan `$request->validate([...])` kecuali sudah ada Form Request yang cocok.
- Untuk relasi RAB, gunakan route berbasis project seperti `/projects/{project}/rab`.
- Hitung `subtotal` di server dari `volume * unit_price`; jangan percaya nilai subtotal dari client jika bisa dihitung ulang.
- Gunakan redirect Inertia standar setelah store/update/delete.
- Gunakan pagination dengan `->paginate(...)->withQueryString()` untuk index yang punya filter/search.
- Untuk status project, nilai valid: `planning`, `progress`, `completed`, `cancelled`.
- Untuk role admin, ikuti middleware `role:admin` yang sudah dipakai di `routes/web.php`.

## Pola Frontend

- Gunakan Inertia components: `Head`, `Link`, `useForm`, `router`, `usePage` sesuai kebutuhan.
- Gunakan alias import `@/` untuk file di `resources/js`.
- Gunakan `route('nama.route')` dari Ziggy, bukan hardcoded URL, kecuali benar-benar perlu.
- Gunakan `AppLayout` untuk halaman yang butuh navbar/sidebar aplikasi.
- Gunakan komponen shared sebelum membuat komponen baru:
  - Form: `InputField`, `SelectField`, `TextAreaField`, `CurrencyInput`
  - Table: `DataTable`, `EmptyState`, `TableHeader`, `TablePagination`
  - Feedback: `LoadingOverlay`, `Spinner`
  - UI umum: button dan label di `Components/UI` atau utility class global
- Format rupiah dengan `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })` atau helper yang sudah ada.
- Teks aplikasi boleh campuran Indonesia/English seperti pola existing, tetapi untuk domain RAB/AI prioritaskan bahasa Indonesia yang ringkas dan praktis.

## Desain UI

Ikuti desain operasional yang sudah ada, bukan landing page marketing.

Gunakan class global dari `resources/css/app.css`:

- Surface: `panel`, `panel-strong`
- Button: `btn-primary`, `btn-secondary`, `btn-accent`, `btn-success`, `btn-danger`
- Form: `input-field`, `textarea-field`, `form-label`, `form-error`
- Table: `table-surface`, `table-heading`, `table-actions`
- Status: `badge-status`, `badge-planning`, `badge-progress`, `badge-completed`, `badge-cancelled`
- Layout: `content-shell`, `form-shell`, `card-grid`

Prinsip visual:

- Interface harus rapi, padat, dan mudah dipindai untuk pekerjaan RAB.
- Dominan putih, hitam, dan abu netral.
- Warna `info`, `success`, dan `sale` hanya untuk aksi/status penting.
- Radius komponen mengikuti Tailwind config, umumnya `rounded-md` atau lebih kecil.
- Jangan membuat dekorasi visual yang tidak membantu pekerjaan estimator.
- Jangan membuat card di dalam card kecuali modal atau item berulang memang membutuhkan frame.
- Pastikan UI mobile tidak overlap, tombol tetap mudah ditekan, dan tabel punya strategi overflow/responsif.

Referensi desain:

- `UI-DESIGN-REFERENCE.md`
- `DESIGN.md`
- `tailwind.config.js`
- `resources/css/app.css`

## Aturan AI Gemini

File utama: `app/Services/GeminiService.php`.

Jaga batasan ini:

- Gemini hanya membantu konteks RAB, konstruksi, project, material, biaya, margin, risiko, dan produktivitas.
- Prompt harus meminta JSON valid tanpa markdown.
- Parser harus toleran terhadap response yang masih dibungkus code fence.
- Jangan memasukkan secret/API key ke repository.
- Error untuk user harus jelas dalam bahasa Indonesia, terutama saat `GEMINI_API_KEY` belum ada atau koneksi API gagal.
- Jika menambah output AI, update juga parser, controller, dan UI flash/result yang menampilkannya.

## Perintah Kerja

Install dependency jika belum ada:

```bash
composer install
npm install
```

Jalankan dev server:

```bash
composer run dev
```

Alternatif jika ingin terpisah:

```bash
php artisan serve
npm run dev
```

Build frontend:

```bash
npm run build
```

Test backend:

```bash
composer test
```

Format PHP:

```bash
vendor/bin/pint
```

Migrasi database:

```bash
php artisan migrate
```

Seed role/data awal:

```bash
php artisan db:seed
```

## Checklist Sebelum Selesai

- Jalankan `npm run build` setelah mengubah frontend.
- Jalankan `composer test` setelah mengubah backend, auth, model, migration, controller, atau route.
- Cek akses admin vs user biasa untuk fitur project/RAB.
- Pastikan validasi server dan error UI tetap jelas.
- Pastikan route name yang dipakai React memang ada di `routes/web.php`.
- Pastikan perubahan UI memakai class global/desain existing.
- Jangan mengubah `.env`, secret, `vendor`, `node_modules`, atau file generated yang tidak relevan.

## Catatan Untuk Agent

- Baca pola existing sebelum refactor.
- Buat perubahan kecil dan terarah.
- Jangan melakukan rewrite besar jika bug/fitur bisa diselesaikan dengan patch lokal.
- Jangan menghapus perubahan user yang tidak terkait.
- Jika ada instruksi yang bertentangan dengan perilaku aplikasi, prioritaskan keamanan data project dan integritas hitungan RAB.
