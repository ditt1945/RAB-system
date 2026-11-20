// Semua skema validasi input (Zod). Dipakai di API (wajib) dan boleh dipakai di form.
import { z } from 'zod';

/** String opsional: "" / spasi → null */
const optionalText = (max = 255) =>
  z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? null : v), z.string().trim().max(max).nullish());

const optionalDate = z.preprocess(
  (v) => (v === '' || v == null ? null : v),
  z.coerce.date({ message: 'Tanggal tidak valid' }).nullable(),
);

const idString = z.union([z.string(), z.number()]).transform(String).pipe(z.string().regex(/^\d+$/, 'ID tidak valid'));
const rupiah = (label) => z.coerce.number({ message: `${label} harus angka` }).min(0, `${label} tidak boleh negatif`).max(1e13);
const percent = (label) => z.coerce.number({ message: `${label} harus angka` }).min(0, `${label} minimal 0`).max(100, `${label} maksimal 100`);

// ── Akun ──────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(255),
  email: z.string().trim().toLowerCase().email('Format email tidak valid').max(255),
  password: z.string().min(8, 'Password minimal 8 karakter').max(72),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(255),
  email: z.string().trim().toLowerCase().email('Format email tidak valid').max(255),
  phoneNumber: optionalText(20),
  department: optionalText(255),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Password lama wajib diisi'),
  newPassword: z.string().min(8, 'Password baru minimal 8 karakter').max(72),
});

export const companySchema = z.object({
  companyName: z.string().trim().min(2, 'Nama perusahaan minimal 2 karakter').max(255),
  address: z.string().trim().min(5, 'Alamat minimal 5 karakter').max(1000),
  phone: optionalText(20),
  email: z.preprocess((v) => (v === '' ? null : v), z.string().trim().email('Format email tidak valid').nullish()),
  logoUrl: z.preprocess((v) => (v === '' ? null : v), z.string().trim().url('URL logo tidak valid').max(512).nullish()),
});

// ── Proyek ────────────────────────────────────────────────────────────
export const projectSchema = z
  .object({
    projectName: z.string().trim().min(3, 'Nama proyek minimal 3 karakter').max(255),
    clientName: z.string().trim().min(2, 'Nama klien minimal 2 karakter').max(255),
    location: optionalText(255),
    description: optionalText(5000),
    startDate: optionalDate,
    endDate: optionalDate,
    status: z.enum(['planning', 'progress', 'completed', 'cancelled']).default('planning'),
    rabDiscount: rupiah('Diskon').default(0),
    rabServiceFee: rupiah('Biaya jasa').default(0),
    targetMarginPercent: percent('Margin').default(0),
    rabTaxPercent: percent('PPN').default(11),
  })
  .refine((v) => !v.startDate || !v.endDate || v.endDate >= v.startDate, {
    message: 'Tanggal selesai tidak boleh sebelum tanggal mulai',
    path: ['endDate'],
  });

// ── Item RAB ──────────────────────────────────────────────────────────
// Dari AHSP: cukup ahspId + volume. Manual: name, unit, unitPrice, volume.
export const rabItemSchema = z
  .object({
    ahspId: idString.nullish(),
    groupName: optionalText(255),
    name: optionalText(255),
    unit: optionalText(50),
    volume: z.coerce.number({ message: 'Volume harus angka' }).min(0, 'Volume tidak boleh negatif').max(1e9),
    unitPrice: rupiah('Harga satuan').nullish(),
  })
  .superRefine((v, ctx) => {
    if (v.ahspId) return;
    if (!v.name || v.name.length < 2) ctx.addIssue({ code: 'custom', path: ['name'], message: 'Uraian pekerjaan minimal 2 karakter' });
    if (!v.unit) ctx.addIssue({ code: 'custom', path: ['unit'], message: 'Satuan wajib diisi' });
    if (v.unitPrice == null) ctx.addIssue({ code: 'custom', path: ['unitPrice'], message: 'Harga satuan wajib diisi untuk item manual' });
  });

// ── Master AHSP ───────────────────────────────────────────────────────
export const resourceSchema = z.object({
  code: z.string().trim().min(1, 'Kode wajib diisi').max(20),
  name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(255),
  type: z.enum(['upah', 'bahan', 'alat'], { message: 'Jenis harus upah, bahan, atau alat' }),
  unit: z.string().trim().min(1, 'Satuan wajib diisi').max(50),
  unitPrice: rupiah('Harga'),
  source: optionalText(255),
  effectiveDate: optionalDate,
  isActive: z.boolean().default(true),
});

export const categorySchema = z.object({
  code: z.string().trim().min(1, 'Kode wajib diisi').max(20),
  name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(255),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const ahspSchema = z.object({
  code: z.string().trim().min(1, 'Kode wajib diisi').max(30),
  name: z.string().trim().min(3, 'Nama pekerjaan minimal 3 karakter').max(255),
  unit: z.string().trim().min(1, 'Satuan wajib diisi').max(50),
  categoryId: idString,
  overheadPercent: percent('Overhead').default(10),
  description: optionalText(5000),
  isActive: z.boolean().default(true),
  components: z
    .array(
      z.object({
        resourceId: idString,
        coefficient: z.coerce.number({ message: 'Koefisien harus angka' }).positive('Koefisien harus lebih dari 0').max(1e6),
      }),
    )
    .min(1, 'Minimal satu komponen upah/bahan/alat')
    .refine((list) => new Set(list.map((c) => c.resourceId)).size === list.length, 'Sumber daya tidak boleh dobel'),
});

// ── AI ────────────────────────────────────────────────────────────────
export const aiRecommendSchema = z.object({
  prompt: z.string().trim().min(8, 'Deskripsi minimal 8 karakter').max(2000),
});

export const aiAcceptSchema = z.object({
  requestId: idString,
  items: z
    .array(z.object({ ahspId: idString, volume: z.coerce.number().min(0).max(1e9) }))
    .min(1, 'Pilih minimal satu saran'),
});
