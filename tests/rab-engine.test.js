import { describe, it, expect } from 'vitest';
import {
  calculateAhspPrice,
  calculateRabItemSubtotal,
  calculateProjectSummary,
  groupRabItems,
} from '../src/lib/calculations/rab.js';
import { terbilang } from '../src/lib/format.js';

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
      { groupName: 'Tanah', subtotal: 100 },
      { groupName: 'Pondasi', subtotal: 50 },
      { groupName: 'Tanah', subtotal: 25 },
    ]);
    expect(groups.map((g) => [g.name, g.subtotal, g.items.length])).toEqual([
      ['Tanah', 125, 2],
      ['Pondasi', 50, 1],
    ]);
  });

  it('mengurutkan kelompok sesuai urutan kategori, kelompok lain di akhir', () => {
    const groups = groupRabItems(
      [
        { groupName: 'Lain-lain', subtotal: 1 },
        { groupName: 'Pondasi', subtotal: 1 },
        { groupName: 'Persiapan', subtotal: 1 },
      ],
      ['Persiapan', 'Tanah', 'Pondasi'],
    );
    expect(groups.map((g) => g.name)).toEqual(['Persiapan', 'Pondasi', 'Lain-lain']);
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
