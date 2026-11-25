// Template RAB: titik awal supaya pengguna tidak mulai dari tabel kosong.
// Isinya kode AHSP dari data awal (seed) + perkiraan volume. Volume WAJIB disesuaikan dengan gambar kerja.
// Kode yang tidak ada / nonaktif di katalog dilewati.

export const RAB_TEMPLATES = [
  {
    key: 'rumah-36',
    name: 'Rumah tinggal tipe 36',
    description: '1 lantai ±6×6 m, pondasi batu kali, dinding bata merah diplester & dicat, lantai keramik 40×40.',
    items: [
      ['A.2.2.1.1', 36],
      ['A.2.2.1.4', 26],
      ['A.2.3.1.1', 8.5],
      ['A.2.3.1.11', 2.8],
      ['A.2.3.1.12', 1.8],
      ['A.3.2.1.2', 6.2],
      ['A.4.1.1.17', 350],
      ['A.4.1.1.5', 3.2],
      ['A.4.4.1.9', 72],
      ['A.4.4.2.4', 144],
      ['A.4.4.2.27', 144],
      ['A.4.4.3.38', 30],
      ['A.4.7.1.10', 144],
    ],
  },
  {
    key: 'rumah-45',
    name: 'Rumah tinggal tipe 45',
    description: '1 lantai ±7,5×6 m, struktur dan finishing seperti tipe 36 dengan luas lebih besar.',
    items: [
      ['A.2.2.1.1', 45],
      ['A.2.2.1.4', 30],
      ['A.2.3.1.1', 10.5],
      ['A.2.3.1.11', 3.5],
      ['A.2.3.1.12', 2.3],
      ['A.3.2.1.2', 7.7],
      ['A.4.1.1.17', 440],
      ['A.4.1.1.5', 4],
      ['A.4.4.1.9', 88],
      ['A.4.4.2.4', 176],
      ['A.4.4.2.27', 176],
      ['A.4.4.3.38', 38],
      ['A.4.7.1.10', 176],
    ],
  },
  {
    key: 'renovasi-ringan',
    name: 'Renovasi ringan',
    description: 'Perbaikan satu ruangan: dinding baru sebagian, plester, aci, cat, dan ganti keramik lantai.',
    items: [
      ['A.2.2.1.1', 20],
      ['A.4.4.1.9', 15],
      ['A.4.4.2.4', 30],
      ['A.4.4.2.27', 30],
      ['A.4.4.3.38', 20],
      ['A.4.7.1.10', 60],
    ],
  },
];

export const findTemplate = (key) => RAB_TEMPLATES.find((t) => t.key === key) ?? null;
