// Format angka untuk tampilan. Aman dipakai di server maupun client.

export function rupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value) || 0);
}

export function angka(value, maxDigits = 3) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: maxDigits }).format(Number(value) || 0);
}

export function tanggal(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value));
}

export const STATUS_LABEL = {
  planning: 'Perencanaan',
  progress: 'Berjalan',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

export const RESOURCE_TYPE_LABEL = { upah: 'Upah', bahan: 'Bahan', alat: 'Alat' };

const SATUAN = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];

function terbilangRaw(n) {
  if (n < 12) return SATUAN[n];
  if (n < 20) return `${terbilangRaw(n - 10)} belas`;
  if (n < 100) return `${terbilangRaw(Math.floor(n / 10))} puluh ${terbilangRaw(n % 10)}`;
  if (n < 200) return `seratus ${terbilangRaw(n - 100)}`;
  if (n < 1000) return `${terbilangRaw(Math.floor(n / 100))} ratus ${terbilangRaw(n % 100)}`;
  if (n < 2000) return `seribu ${terbilangRaw(n - 1000)}`;
  if (n < 1e6) return `${terbilangRaw(Math.floor(n / 1000))} ribu ${terbilangRaw(n % 1000)}`;
  if (n < 1e9) return `${terbilangRaw(Math.floor(n / 1e6))} juta ${terbilangRaw(n % 1e6)}`;
  if (n < 1e12) return `${terbilangRaw(Math.floor(n / 1e9))} miliar ${terbilangRaw(n % 1e9)}`;
  return `${terbilangRaw(Math.floor(n / 1e12))} triliun ${terbilangRaw(n % 1e12)}`;
}

/** 12820000 → "Dua belas juta delapan ratus dua puluh ribu rupiah" */
export function terbilang(value) {
  const n = Math.floor(Math.abs(Number(value) || 0));
  if (n === 0) return 'Nol rupiah';
  const text = terbilangRaw(n).replace(/\s+/g, ' ').trim();
  return `${text.charAt(0).toUpperCase()}${text.slice(1)} rupiah`;
}
