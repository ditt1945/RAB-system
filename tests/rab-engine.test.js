import { describe, it, expect } from 'vitest';
import {
  calculateAhspPrice,
  calculateRabItemSubtotal,
  calculateProjectSummary,
  calculateMaterialNeeds,
  calculateCostComposition,
  groupRabItems,
  LIMITS,
} from '../src/lib/calculations/rab.js';
import { terbilang } from '../src/lib/format.js';
import { projectSchema, rabItemSchema } from '../src/lib/validation/schemas.js';

const galian = {
  overheadPercent: '10',
  components: [
    { coefficient: '0.75', resource: { type: 'upah', unitPrice: '120000' } },
    { coefficient: '0.025', resource: { type: 'upah', unitPrice: '180000' } },
  ],
};

describe('Harga satuan pekerjaan (AHSP)', () => {
  it('PRD skenario 3: galian tanah = Rp103.950', () => {
    const result = calculateAhspPrice(galian);
    expect(result.upah).toBe(94500);
    expect(result.bahan).toBe(0);
    expect(result.base).toBe(94500);
    expect(result.overhead).toBe(9450);
    expect(result.unitPrice).toBe(103950);
  });

  it('memisahkan upah, bahan, dan alat', () => {
    const result = calculateAhspPrice({
      overheadPercent: 0,
      components: [
        { coefficient: 1, resource: { type: 'upah', unitPrice: 100 } },
        { coefficient: 2, resource: { type: 'bahan', unitPrice: 50 } },
        { coefficient: 0.5, resource: { type: 'alat', unitPrice: 40 } },
      ],
    });
    expect([result.upah, result.bahan, result.alat, result.unitPrice]).toEqual([100, 100, 20, 220]);
  });

  it('AHSP tanpa komponen bernilai 0', () => {
    expect(calculateAhspPrice({ overheadPercent: 10, components: [] }).unitPrice).toBe(0);
  });
});

describe('Subtotal item', () => {
  it('PRD skenario 4: 12,5 m3 × 103.950 = 1.299.375', () => {
    expect(calculateRabItemSubtotal(12.5, 103950)).toBe(1299375);
  });

  it('bebas error float (0,1 × 0,2)', () => {
    expect(calculateRabItemSubtotal(0.1, 0.2)).toBe(0.02);
  });
});

describe('Rekapitulasi RAB', () => {
  it('PRD skenario 6: PPN dihitung dari DPP, lalu dibulatkan per seribu', () => {
    const summary = calculateProjectSummary({
      items: [{ volume: 1, unitPrice: 10_000_000 }],
      rabDiscount: 500_000,
      rabServiceFee: 1_000_000,
      targetMarginPercent: 10,
      rabTaxPercent: 11,
    });
    expect(summary.afterDiscount).toBe(9_500_000);
    expect(summary.marginAmount).toBe(1_050_000);
    expect(summary.dpp).toBe(11_550_000);
    expect(summary.taxAmount).toBe(1_270_500);
    expect(summary.total).toBe(12_820_500);
    expect(summary.grandTotal).toBe(12_820_000);
  });

  it('diskon tidak bisa membuat nilai pekerjaan negatif', () => {
    const summary = calculateProjectSummary({ items: [{ volume: 1, unitPrice: 100_000 }], rabDiscount: 500_000, rabTaxPercent: 11 });
    expect(summary.discountAmount).toBe(100_000);
    expect(summary.dpp).toBe(0);
    expect(summary.grandTotal).toBe(0);
  });

  it('tanpa item, semua nol', () => {
    const summary = calculateProjectSummary({ items: [], rabTaxPercent: 11 });
    expect(summary.grandTotal).toBe(0);
  });
});

describe('Pengelompokan item', () => {
  it('mengelompokkan per groupName dengan subtotal', () => {
    const groups = groupRabItems([
      { groupName: 'Tanah', volume: 1, unitPrice: 100 },
      { groupName: 'Pondasi', volume: 2, unitPrice: 25 },
      { groupName: 'Tanah', volume: 0.5, unitPrice: 50 },
    ]);
    expect(groups.map((g) => [g.name, g.subtotal, g.items.length])).toEqual([
      ['Tanah', 125, 2],
      ['Pondasi', 50, 1],
    ]);
  });

  it('jumlah semua kelompok selalu sama dengan jumlah harga pekerjaan di rekap', () => {
    // Volume 4 desimal: database menyimpan 3 desimal, jadi keduanya harus memakai 1,000
    const items = [
      { groupName: 'A', volume: 1.0004, unitPrice: 1_000_000 },
      { groupName: 'B', volume: 2.3456, unitPrice: 333_333.333 },
    ];
    const groupsTotal = groupRabItems(items).reduce((sum, g) => sum + g.subtotal, 0);
    const summary = calculateProjectSummary({ items, rabTaxPercent: 11 });
    expect(groupsTotal).toBe(summary.itemsSubtotal);
    expect(calculateRabItemSubtotal(1.0004, 1_000_000)).toBe(1_000_000);
  });

  it('mengurutkan kelompok sesuai urutan kategori, kelompok lain di akhir', () => {
    const groups = groupRabItems(
      [
        { groupName: 'Lain-lain', volume: 1, unitPrice: 1 },
        { groupName: 'Pondasi', volume: 1, unitPrice: 1 },
        { groupName: 'Persiapan', volume: 1, unitPrice: 1 },
      ],
      ['Persiapan', 'Tanah', 'Pondasi'],
    );
    expect(groups.map((g) => g.name)).toEqual(['Persiapan', 'Pondasi', 'Lain-lain']);
  });
});

describe('Kebutuhan material', () => {
  const semen = { id: 1, code: 'M.01', name: 'Semen portland', unit: 'kg', type: 'bahan', unitPrice: 1500 };
  const pasir = { id: 2, code: 'M.02', name: 'Pasir pasang', unit: 'm3', type: 'bahan', unitPrice: 250000 };
  const pekerja = { id: 3, code: 'L.01', name: 'Pekerja', unit: 'OH', type: 'upah', unitPrice: 120000 };

  it('koefisien bahan × volume, dijumlahkan per bahan, upah tidak dihitung', () => {
    const result = calculateMaterialNeeds([
      { volume: 10, components: [{ coefficient: 9.68, resource: semen }, { coefficient: 0.045, resource: pasir }, { coefficient: 0.3, resource: pekerja }] },
      { volume: 2, components: [{ coefficient: 5, resource: semen }] },
    ]);
    expect(result.items.map((m) => [m.code, m.quantity, m.amount])).toEqual([
      ['M.01', 106.8, 160_200],
      ['M.02', 0.45, 112_500],
    ]);
    expect(result.total).toBe(272_700);
  });

  it('tanpa pekerjaan AHSP, daftar material kosong', () => {
    expect(calculateMaterialNeeds([])).toEqual({ items: [], total: 0 });
  });
});

describe('Komposisi biaya', () => {
  it('memecah jumlah pekerjaan menjadi upah/bahan/alat/overhead/manual dan totalnya sama', () => {
    const price = calculateAhspPrice({
      overheadPercent: 10,
      components: [
        { coefficient: 1, resource: { type: 'upah', unitPrice: 100 } },
        { coefficient: 1, resource: { type: 'bahan', unitPrice: 300 } },
      ],
    }); // dasar 400, overhead 40, HSP 440
    const result = calculateCostComposition(
      [
        { ahspId: '1', volume: 2, unitPrice: 440 },
        { ahspId: null, volume: 1, unitPrice: 120 },
      ],
      new Map([['1', price]]),
    );
    expect([result.upah, result.bahan, result.alat, result.overhead, result.manual]).toEqual([200, 600, 0, 80, 120]);
    expect(result.total).toBe(1000);
    expect(result.bahanPercent).toBe(60);
  });

  it('item dengan harga snapshot lama diskalakan ke harga snapshotnya', () => {
    const price = { upah: 50, bahan: 50, alat: 0, overhead: 0, unitPrice: 100 };
    const result = calculateCostComposition([{ ahspId: 7, volume: 1, unitPrice: 80 }], new Map([['7', price]]));
    expect([result.upah, result.bahan, result.total]).toEqual([40, 40, 80]);
  });
});

describe('Validasi input', () => {
  it('volume dibulatkan 3 desimal dan harga 2 desimal', () => {
    const parsed = rabItemSchema.parse({ name: 'Mobilisasi', unit: 'ls', volume: '1.23456', unitPrice: '1000.555' });
    expect([parsed.volume, parsed.unitPrice]).toEqual([1.235, 1000.56]);
  });

  it('angka yang tidak muat di database ditolak (bukan error 500)', () => {
    expect(rabItemSchema.safeParse({ name: 'X item', unit: 'ls', volume: 1, unitPrice: LIMITS.price + 1 }).success).toBe(false);
    expect(rabItemSchema.safeParse({ name: 'X item', unit: 'ls', volume: LIMITS.volume + 1, unitPrice: 1 }).success).toBe(false);
    expect(rabItemSchema.safeParse({ ahspId: '1'.repeat(19), volume: 1 }).success).toBe(false);
  });

  it('tahun di luar 1900–2100 ditolak', () => {
    expect(projectSchema.safeParse({ projectName: 'Rumah', clientName: 'Budi', startDate: '12000-01-01' }).success).toBe(false);
  });
});

describe('Terbilang', () => {
  it.each([
    [0, 'Nol rupiah'],
    [1000, 'Seribu rupiah'],
    [115, 'Seratus lima belas rupiah'],
    [12_820_000, 'Dua belas juta delapan ratus dua puluh ribu rupiah'],
    [1_250_000_000, 'Satu miliar dua ratus lima puluh juta rupiah'],
  ])('%d → %s', (value, text) => {
    expect(terbilang(value)).toBe(text);
  });
});
