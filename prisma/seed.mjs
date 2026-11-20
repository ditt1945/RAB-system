// Seed data awal: master AHSP + akun admin + satu proyek contoh.
// Jalankan: npx prisma db seed
// Aman dijalankan berulang (upsert berdasarkan kode).

import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const url = new URL(process.env.DATABASE_URL || 'mysql://root:@127.0.0.1:3306/rab_system_next');
const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
  }),
});

const legacy = JSON.parse(readFileSync(new URL('./seed-data/ahsp-legacy.json', import.meta.url), 'utf8'));

const TYPE_MAP = { labor: 'upah', material: 'bahan', equipment: 'alat' };
const SUMBER_ESTIMASI = 'Estimasi harga pasar 2026 (sesuaikan dengan daerah)';

// ── Sumber daya ────────────────────────────────────────────────────────
const resources = [
  ...legacy.resources.map((r) => ({
    code: r.code,
    name: r.name,
    type: TYPE_MAP[r.type],
    unit: r.unit,
    unitPrice: r.unitPrice,
    source: r.source,
    effectiveDate: r.effectiveDate ? new Date(r.effectiveDate) : null,
  })),
  { code: 'L.07', name: 'Tukang Cat', type: 'upah', unit: 'OH', unitPrice: 145000 },
  { code: 'M.12', name: 'Pasir Urug', type: 'bahan', unit: 'm3', unitPrice: 200000 },
  { code: 'M.13', name: 'Plamir Tembok', type: 'bahan', unit: 'kg', unitPrice: 25000 },
  { code: 'M.14', name: 'Cat Dasar Tembok', type: 'bahan', unit: 'kg', unitPrice: 35000 },
  { code: 'M.15', name: 'Cat Tembok Penutup', type: 'bahan', unit: 'kg', unitPrice: 40000 },
  { code: 'M.16', name: 'Keramik Lantai 40x40 cm', type: 'bahan', unit: 'buah', unitPrice: 9000 },
  { code: 'M.17', name: 'Semen Warna (Nat)', type: 'bahan', unit: 'kg', unitPrice: 15000 },
];

// ── Kategori pekerjaan ─────────────────────────────────────────────────
const categories = [
  { code: 'DIV-00', name: 'Pekerjaan Persiapan', sortOrder: 0 },
  ...legacy.categories.map((c) => ({ code: c.code, name: c.name, sortOrder: c.sortOrder })),
  { code: 'DIV-05', name: 'Pekerjaan Lantai', sortOrder: 5 },
  { code: 'DIV-06', name: 'Pekerjaan Pengecatan', sortOrder: 6 },
];

// ── Analisa pekerjaan (koefisien mengacu SNI / Permen PUPR) ────────────
const legacyResourceCode = Object.fromEntries(legacy.resources.map((r) => [r.id, r.code]));
const legacyCategoryCode = Object.fromEntries(legacy.categories.map((c) => [c.id, c.code]));

const ahspList = [
  ...legacy.workItems.map((w) => ({
    code: w.code,
    name: w.name,
    unit: w.unit,
    categoryCode: legacyCategoryCode[w.categoryId],
    overheadPercent: w.overheadPercent,
    description: w.description,
    components: legacy.components
      .filter((c) => c.workItemId === w.id)
      .map((c) => [legacyResourceCode[c.resourceId], c.coefficient]),
  })),
  {
    code: 'A.2.2.1.1', name: 'Pembersihan 1 m2 Lapangan dan Perataan', unit: 'm2', categoryCode: 'DIV-00',
    components: [['L.01', 0.1], ['L.06', 0.05]],
  },
  {
    code: 'A.2.2.1.4', name: 'Pengukuran dan Pemasangan 1 m Bouwplank', unit: 'm', categoryCode: 'DIV-00',
    components: [['M.10', 0.012], ['M.11', 0.02], ['L.01', 0.1], ['L.04', 0.1], ['L.05', 0.01], ['L.06', 0.005]],
  },
  {
    code: 'A.2.3.1.11', name: 'Urugan Kembali 1 m3 Galian Tanah', unit: 'm3', categoryCode: 'DIV-01',
    components: [['L.01', 0.192], ['L.06', 0.019]],
  },
  {
    code: 'A.2.3.1.12', name: 'Urugan 1 m3 Pasir Bawah Pondasi / Lantai', unit: 'm3', categoryCode: 'DIV-01',
    components: [['M.12', 1.2], ['L.01', 0.3], ['L.06', 0.01]],
  },
  {
    code: 'A.4.1.1.17', name: 'Pembesian 1 kg Besi Beton Polos / Ulir', unit: 'kg', categoryCode: 'DIV-03',
    components: [['M.08', 1.05], ['M.09', 0.015], ['L.01', 0.007], ['L.03', 0.007], ['L.05', 0.0007], ['L.06', 0.0004]],
  },
  {
    code: 'A.4.4.2.27', name: 'Pekerjaan 1 m2 Acian Dinding', unit: 'm2', categoryCode: 'DIV-04',
    components: [['M.01', 3.25], ['L.01', 0.2], ['L.02', 0.1], ['L.05', 0.01], ['L.06', 0.01]],
  },
  {
    code: 'A.4.4.3.38', name: 'Pemasangan 1 m2 Lantai Keramik 40x40 cm', unit: 'm2', categoryCode: 'DIV-05',
    components: [['M.16', 6.43], ['M.01', 10], ['M.02', 0.045], ['M.17', 1.5], ['L.01', 0.7], ['L.02', 0.35], ['L.05', 0.035], ['L.06', 0.035]],
  },
  {
    code: 'A.4.7.1.10', name: 'Pengecatan 1 m2 Tembok Baru (Plamir, Cat Dasar, 2 Lapis Penutup)', unit: 'm2', categoryCode: 'DIV-06',
    components: [['M.13', 0.1], ['M.14', 0.1], ['M.15', 0.26], ['L.01', 0.02], ['L.07', 0.063], ['L.05', 0.0063], ['L.06', 0.0025]],
  },
];

async function seedAhsp() {
  const resourceId = {};
  for (const r of resources) {
    const data = { ...r, source: r.source ?? SUMBER_ESTIMASI };
    const saved = await prisma.resource.upsert({ where: { code: r.code }, create: data, update: {} });
    resourceId[r.code] = saved.id;
  }

  const categoryId = {};
  for (const c of categories) {
    const saved = await prisma.ahspCategory.upsert({ where: { code: c.code }, create: c, update: {} });
    categoryId[c.code] = saved.id;
  }

  for (const a of ahspList) {
    const existing = await prisma.ahsp.findUnique({ where: { code: a.code } });
    if (existing) continue;
    await prisma.ahsp.create({
      data: {
        code: a.code,
        name: a.name,
        unit: a.unit,
        overheadPercent: a.overheadPercent ?? 10,
        description: a.description ?? null,
        categoryId: categoryId[a.categoryCode],
        components: {
          create: a.components.map(([code, coefficient]) => ({ resourceId: resourceId[code], coefficient })),
        },
      },
    });
  }
  console.log(`AHSP: ${resources.length} sumber daya, ${categories.length} kategori, ${ahspList.length} analisa pekerjaan.`);
}

async function seedAdmin() {
  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@rab.local').toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin ${email} sudah ada, dilewati.`);
    return existing;
  }

  const generated = !process.env.SEED_ADMIN_PASSWORD;
  const password = process.env.SEED_ADMIN_PASSWORD || randomBytes(9).toString('base64url');
  const admin = await prisma.user.create({
    data: {
      name: 'Administrator',
      email,
      password: await bcrypt.hash(password, 12),
      profileSettings: { create: { role: 'admin' } },
      companySettings: {
        create: {
          companyName: 'CV Contoh Konstruksi',
          address: 'Jl. Contoh No. 1, Kota Contoh',
          phone: '0800000000',
          email,
        },
      },
    },
  });
  console.log(`Admin dibuat: ${email}`);
  if (generated) console.log(`Password admin (simpan, hanya tampil sekali): ${password}`);
  return admin;
}

async function seedDemoProject(admin) {
  const count = await prisma.project.count({ where: { createdBy: admin.id } });
  if (count > 0) return;

  const pick = [
    ['A.2.2.1.1', 36],
    ['A.2.3.1.1', 8.5],
    ['A.2.3.1.12', 1.8],
    ['A.3.2.1.2', 6.2],
    ['A.4.4.1.9', 72],
    ['A.4.4.2.4', 144],
    ['A.4.4.3.38', 30],
  ];
  const { calculateAhspPrice } = await import('../src/lib/calculations/rab.js');
  const items = [];
  for (const [index, [code, volume]] of pick.entries()) {
    const ahsp = await prisma.ahsp.findUnique({
      where: { code },
      include: { category: true, components: { include: { resource: true } } },
    });
    if (!ahsp) continue;
    const { unitPrice } = calculateAhspPrice(ahsp);
    items.push({
      ahspId: ahsp.id,
      groupName: ahsp.category.name,
      code: ahsp.code,
      name: ahsp.name,
      unit: ahsp.unit,
      volume,
      unitPrice,
      subtotal: Math.round(volume * unitPrice * 100) / 100,
      sortOrder: index,
    });
  }

  await prisma.project.create({
    data: {
      createdBy: admin.id,
      projectName: 'Contoh: Rumah Tinggal Tipe 36',
      clientName: 'Bapak Contoh',
      location: 'Kota Contoh',
      description: 'Proyek contoh dari seed. Boleh dihapus.',
      rabTaxPercent: 11,
      rabItems: { create: items },
    },
  });
  console.log(`Proyek contoh dibuat dengan ${items.length} item.`);
}

try {
  await seedAhsp();
  const admin = await seedAdmin();
  await seedDemoProject(admin);
} finally {
  await prisma.$disconnect();
}
