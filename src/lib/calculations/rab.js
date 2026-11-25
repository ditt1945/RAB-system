// Mesin perhitungan RAB. Satu-satunya tempat rumus uang dihitung.
// Semua angka memakai decimal.js agar bebas error pembulatan float.
import Decimal from 'decimal.js';

const d = (value) => new Decimal(value == null || value === '' ? 0 : value.toString());
const money = (value) => value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

/**
 * Batas angka, disesuaikan dengan ukuran kolom database:
 * harga Decimal(15,2), volume Decimal(15,3), jumlah Decimal(17,2), koefisien Decimal(12,6).
 */
export const LIMITS = {
  price: 999_999_999_999, // < 1 triliun per satuan
  volume: 999_999_999,
  subtotal: 999_999_999_999_999, // < 1.000 triliun per item
  coefficient: 999_999,
};

/** Bulatkan seperti cara database menyimpan: volume 3 desimal, harga 2 desimal. */
export const roundVolume = (value) => d(value).toDecimalPlaces(3, Decimal.ROUND_HALF_UP).toNumber();
export const roundMoney = (value) => money(d(value)).toNumber();

/**
 * Harga satuan pekerjaan (HSP) dari satu AHSP.
 * Format Permen PUPR No. 1/2022:
 *   A. Upah  = Σ koef × harga upah
 *   B. Bahan = Σ koef × harga bahan
 *   C. Alat  = Σ koef × harga alat
 *   D. Jumlah (A+B+C)
 *   E. Overhead & profit = D × overhead%
 *   F. HSP = D + E
 *
 * @param {{ overheadPercent: any, components: Array<{ coefficient: any, resource: { type: 'upah'|'bahan'|'alat', unitPrice: any } }> }} ahsp
 */
export function calculateAhspPrice(ahsp) {
  const totals = { upah: d(0), bahan: d(0), alat: d(0) };
  const lines = (ahsp.components || []).map((component) => {
    const amount = money(d(component.coefficient).times(d(component.resource.unitPrice)));
    totals[component.resource.type] = totals[component.resource.type].plus(amount);
    return { ...component, amount: amount.toNumber() };
  });

  const base = totals.upah.plus(totals.bahan).plus(totals.alat);
  const overhead = money(base.times(d(ahsp.overheadPercent)).dividedBy(100));
  const unitPrice = money(base.plus(overhead));

  return {
    lines,
    upah: totals.upah.toNumber(),
    bahan: totals.bahan.toNumber(),
    alat: totals.alat.toNumber(),
    base: base.toNumber(),
    overhead: overhead.toNumber(),
    unitPrice: unitPrice.toNumber(),
  };
}

/**
 * Subtotal satu item RAB = volume × harga satuan.
 * Volume dan harga dibulatkan dulu seperti di database, supaya angka di layar, rekap, dan PDF selalu sama.
 */
export function calculateRabItemSubtotal(volume, unitPrice) {
  return money(d(roundVolume(volume)).times(d(roundMoney(unitPrice)))).toNumber();
}

/**
 * Rekapitulasi RAB sesuai praktik umum kontraktor di Indonesia.
 *
 *   Jumlah harga pekerjaan  = Σ (volume × harga satuan)
 *   Diskon                  = rabDiscount (Rp), maksimal sebesar jumlah pekerjaan
 *   Biaya jasa              = rabServiceFee (Rp)
 *   Margin                  = (jumlah − diskon + jasa) × margin%
 *   DPP                     = jumlah − diskon + jasa + margin
 *   PPN                     = DPP × PPN%       (jasa konstruksi: efektif 11%)
 *   Jumlah total            = DPP + PPN
 *   Dibulatkan (grand total)= dibulatkan ke bawah per Rp1.000
 *
 * Catatan: overhead & profit kontraktor sudah termasuk di HSP (AHSP),
 * jadi margin proyek default 0% dan hanya dipakai bila perlu tambahan.
 */
export function calculateProjectSummary({ items = [], rabDiscount, rabServiceFee, targetMarginPercent, rabTaxPercent }) {
  const itemsSubtotal = items.reduce((sum, item) => sum.plus(calculateRabItemSubtotal(item.volume, item.unitPrice)), d(0));

  const discountAmount = Decimal.min(d(rabDiscount), itemsSubtotal);
  const afterDiscount = itemsSubtotal.minus(discountAmount);
  const serviceFee = d(rabServiceFee);
  const marginAmount = money(afterDiscount.plus(serviceFee).times(d(targetMarginPercent)).dividedBy(100));
  const dpp = afterDiscount.plus(serviceFee).plus(marginAmount);
  const taxAmount = money(dpp.times(d(rabTaxPercent)).dividedBy(100));
  const total = dpp.plus(taxAmount);
  const grandTotal = total.dividedBy(1000).floor().times(1000);

  return {
    itemsSubtotal: itemsSubtotal.toNumber(),
    discountAmount: discountAmount.toNumber(),
    afterDiscount: afterDiscount.toNumber(),
    serviceFee: serviceFee.toNumber(),
    marginPercent: d(targetMarginPercent).toNumber(),
    marginAmount: marginAmount.toNumber(),
    dpp: dpp.toNumber(),
    taxPercent: d(rabTaxPercent).toNumber(),
    taxAmount: taxAmount.toNumber(),
    total: total.toNumber(),
    grandTotal: grandTotal.toNumber(),
  };
}

/**
 * Kelompokkan item per groupName, dengan subtotal per kelompok.
 * Subtotal memakai rumus yang sama dengan rekap, jadi jumlah semua kelompok = jumlah harga pekerjaan.
 * Urutan: kelompok yang ada di `order` (mis. urutan kategori AHSP) lebih dulu, sisanya menurut kemunculan.
 * @param {string[]} [order]
 */
export function groupRabItems(items, order = []) {
  const groups = new Map();
  for (const item of items) {
    const key = item.groupName || 'Lain-lain';
    if (!groups.has(key)) groups.set(key, { name: key, items: [], subtotal: d(0) });
    const group = groups.get(key);
    const subtotal = calculateRabItemSubtotal(item.volume, item.unitPrice);
    group.items.push({ ...item, subtotal });
    group.subtotal = group.subtotal.plus(subtotal);
  }
  const rank = (name) => (order.includes(name) ? order.indexOf(name) : order.length);
  return [...groups.values()]
    .map((group, index) => ({ ...group, index, subtotal: group.subtotal.toNumber() }))
    .sort((a, b) => rank(a.name) - rank(b.name) || a.index - b.index)
    .map(({ index, ...group }) => group);
}

/**
 * Komposisi biaya RAB: berapa bagian untuk upah, bahan, alat, overhead & profit, dan item manual.
 * Porsi tiap item AHSP mengikuti rincian AHSP-nya, diskalakan ke harga snapshot item tersebut,
 * sehingga jumlah semua porsi = jumlah harga pekerjaan.
 *
 * @param {Array<{ ahspId?: any, volume: any, unitPrice: any }>} items
 * @param {Map<string, { upah: number, bahan: number, alat: number, overhead: number, unitPrice: number }>} priceByAhsp
 */
export function calculateCostComposition(items, priceByAhsp) {
  const totals = { upah: d(0), bahan: d(0), alat: d(0), overhead: d(0), manual: d(0) };
  for (const item of items) {
    const subtotal = d(calculateRabItemSubtotal(item.volume, item.unitPrice));
    const price = item.ahspId != null ? priceByAhsp.get(String(item.ahspId)) : null;
    if (!price || !(price.unitPrice > 0)) {
      totals.manual = totals.manual.plus(subtotal);
      continue;
    }
    const ratio = subtotal.dividedBy(price.unitPrice);
    for (const key of ['upah', 'bahan', 'alat', 'overhead']) totals[key] = totals[key].plus(d(price[key]).times(ratio));
  }
  const total = Object.values(totals).reduce((sum, v) => sum.plus(v), d(0));
  const result = { total: money(total).toNumber() };
  for (const [key, value] of Object.entries(totals)) {
    result[key] = money(value).toNumber();
    result[`${key}Percent`] = total.isZero() ? 0 : value.dividedBy(total).times(100).toDecimalPlaces(1).toNumber();
  }
  return result;
}

/**
 * Kebutuhan material (bahan) dari pekerjaan AHSP.
 * Jumlah bahan = Σ (koefisien bahan × volume pekerjaan), dijumlahkan per jenis bahan.
 *
 * @param {Array<{ volume: any, components: Array<{ coefficient: any, resource: { id: any, code: string, name: string, unit: string, type: string, unitPrice: any } }> }>} works
 * @param {{ types?: string[] }} [options] jenis sumber daya yang dihitung, default hanya bahan
 * @returns {{ items: Array<{ resourceId: string, code: string, name: string, unit: string, quantity: number, unitPrice: number, amount: number }>, total: number }}
 */
export function calculateMaterialNeeds(works, { types = ['bahan'] } = {}) {
  const byResource = new Map();
  for (const work of works) {
    for (const component of work.components || []) {
      const resource = component.resource;
      if (!resource || !types.includes(resource.type)) continue;
      const key = String(resource.id ?? resource.code);
      if (!byResource.has(key)) {
        byResource.set(key, { resourceId: key, code: resource.code, name: resource.name, unit: resource.unit, unitPrice: resource.unitPrice, quantity: d(0) });
      }
      const row = byResource.get(key);
      row.quantity = row.quantity.plus(d(component.coefficient).times(d(work.volume)));
    }
  }

  let total = d(0);
  const items = [...byResource.values()]
    .map((row) => {
      const quantity = row.quantity.toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
      const amount = money(quantity.times(d(row.unitPrice)));
      total = total.plus(amount);
      return { ...row, quantity: quantity.toNumber(), unitPrice: d(row.unitPrice).toNumber(), amount: amount.toNumber() };
    })
    .filter((row) => row.quantity > 0)
    .sort((a, b) => a.code.localeCompare(b.code, 'id', { numeric: true }));

  return { items, total: total.toNumber() };
}
