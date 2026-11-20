// Mesin perhitungan RAB. Satu-satunya tempat rumus uang dihitung.
// Semua angka memakai decimal.js agar bebas error pembulatan float.
import Decimal from 'decimal.js';

const d = (value) => new Decimal(value == null || value === '' ? 0 : value.toString());
const money = (value) => value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

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

/** Subtotal satu item RAB = volume × harga satuan. */
export function calculateRabItemSubtotal(volume, unitPrice) {
  return money(d(volume).times(d(unitPrice))).toNumber();
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
  const itemsSubtotal = items.reduce((sum, item) => sum.plus(money(d(item.volume).times(d(item.unitPrice)))), d(0));

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
 * Urutan: kelompok yang ada di `order` (mis. urutan kategori AHSP) lebih dulu, sisanya menurut kemunculan.
 * @param {string[]} [order]
 */
export function groupRabItems(items, order = []) {
  const groups = new Map();
  for (const item of items) {
    const key = item.groupName || 'Lain-lain';
    if (!groups.has(key)) groups.set(key, { name: key, items: [], subtotal: d(0) });
    const group = groups.get(key);
    group.items.push(item);
    group.subtotal = group.subtotal.plus(d(item.subtotal));
  }
  const rank = (name) => (order.includes(name) ? order.indexOf(name) : order.length);
  return [...groups.values()]
    .map((group, index) => ({ ...group, index, subtotal: group.subtotal.toNumber() }))
    .sort((a, b) => rank(a.name) - rank(b.name) || a.index - b.index)
    .map(({ index, ...group }) => group);
}
