// Generator PDF RAB (A4 portrait). Isi sama persis dengan halaman preview:
// data berasal dari loadProjectRab() → { project, groups, summary, company, preparedBy }.
import PDFDocument from 'pdfkit';
import { angka, rupiah, tanggal, terbilang } from '@/lib/format';

const MARGIN = 40;
const COLUMNS = [
  { key: 'no', label: 'No', width: 26, align: 'center' },
  { key: 'code', label: 'Kode', width: 58, align: 'left' },
  { key: 'name', label: 'Uraian Pekerjaan', width: 187, align: 'left' },
  { key: 'volume', label: 'Volume', width: 48, align: 'right' },
  { key: 'unit', label: 'Sat.', width: 34, align: 'center' },
  { key: 'unitPrice', label: 'Harga Satuan', width: 80, align: 'right' },
  { key: 'subtotal', label: 'Jumlah', width: 82, align: 'right' },
];
const TABLE_WIDTH = COLUMNS.reduce((sum, c) => sum + c.width, 0); // 515
const PAD = 3;
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * @param {{ project, groups, summary, company, preparedBy, materials?: { items: any[], total: number } | null, composition?: object | null, logo?: Buffer | null }} rab
 * materials & composition diisi hanya untuk PDF versi internal.
 */
export function generateRabPdfBuffer({ project, groups, summary, company, preparedBy, materials, composition, logo }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: MARGIN, bufferPages: true, info: { Title: `RAB ${project.projectName}` } });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const left = MARGIN;
    const bottom = () => doc.page.height - MARGIN - 20;

    // ── Kop ────────────────────────────────────────────────────────────
    if (company?.companyName) {
      if (logo) {
        try {
          doc.image(logo, left, MARGIN - 4, { fit: [56, 44] });
        } catch {
          // Gambar rusak: kop tetap dibuat tanpa logo
        }
      }
      doc.font('Helvetica-Bold').fontSize(14).text(company.companyName.toUpperCase(), left, MARGIN, { align: 'center', width: TABLE_WIDTH });
      doc.font('Helvetica').fontSize(9).fillColor('#444');
      const contact = [company.address, company.phone && `Telp. ${company.phone}`, company.email].filter(Boolean).join('  ·  ');
      doc.text(contact, { align: 'center' });
      doc.fillColor('#000');
      doc.moveTo(left, doc.y + 4).lineTo(left + TABLE_WIDTH, doc.y + 4).lineWidth(1.2).stroke();
      doc.moveDown(1);
    }

    doc.font('Helvetica-Bold').fontSize(13).text('RENCANA ANGGARAN BIAYA (RAB)', { align: 'center' });
    doc.moveDown(0.6);

    // ── Identitas proyek ───────────────────────────────────────────────
    doc.font('Helvetica').fontSize(9.5);
    const info = [
      project.rabNumber && ['Nomor RAB', project.rabNumber],
      ['Pekerjaan', project.projectName],
      ['Pemilik / Klien', project.clientName],
      ['Lokasi', project.location || '-'],
      ['Tanggal', tanggal(new Date())],
    ].filter(Boolean);
    for (const [label, value] of info) {
      const y = doc.y;
      doc.text(label, left, y, { width: 90 });
      doc.text(`: ${value}`, left + 90, y, { width: TABLE_WIDTH - 90 });
    }
    doc.moveDown(0.8);

    // ── Tabel ──────────────────────────────────────────────────────────
    const drawRow = (cells, { bold = false, fill = null, header = false } = {}) => {
      doc.font(bold || header ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.5);
      const heights = COLUMNS.map((col) => doc.heightOfString(String(cells[col.key] ?? ''), { width: col.width - PAD * 2 }));
      const height = Math.max(...heights) + PAD * 2;

      if (doc.y + height > bottom()) {
        doc.addPage();
        if (!header) drawHeader();
      }
      const y = doc.y;
      if (fill) doc.rect(left, y, TABLE_WIDTH, height).fill(fill).fillColor('#000');

      let x = left;
      for (const col of COLUMNS) {
        doc.rect(x, y, col.width, height).lineWidth(0.5).strokeColor('#666').stroke();
        doc.text(String(cells[col.key] ?? ''), x + PAD, y + PAD, { width: col.width - PAD * 2, align: header ? 'center' : col.align });
        x += col.width;
      }
      doc.x = left;
      doc.y = y + height;
    };

    // Baris yang menggabungkan kolom kiri (label) dan kolom Jumlah
    const drawSpanRow = (label, value, { bold = false, fill = null, repeatHeader = true } = {}) => {
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.5);
      const labelWidth = TABLE_WIDTH - COLUMNS.at(-1).width;
      const height = doc.heightOfString(label, { width: labelWidth - PAD * 2 }) + PAD * 2;
      if (doc.y + height > bottom()) {
        doc.addPage();
        if (repeatHeader) drawHeader();
      }
      const y = doc.y;
      if (fill) doc.rect(left, y, TABLE_WIDTH, height).fill(fill).fillColor('#000');
      doc.rect(left, y, labelWidth, height).lineWidth(0.5).strokeColor('#666').stroke();
      doc.rect(left + labelWidth, y, COLUMNS.at(-1).width, height).stroke();
      doc.text(label, left + PAD, y + PAD, { width: labelWidth - PAD * 2, align: 'right' });
      doc.text(value, left + labelWidth + PAD, y + PAD, { width: COLUMNS.at(-1).width - PAD * 2, align: 'right' });
      doc.x = left;
      doc.y = y + height;
    };

    const drawHeader = () =>
      drawRow(Object.fromEntries(COLUMNS.map((c) => [c.key, c.label])), { header: true, fill: '#e5e7eb' });

    drawHeader();
    groups.forEach((group, groupIndex) => {
      drawRow({ no: LETTERS[groupIndex] ?? groupIndex + 1, name: group.name.toUpperCase() }, { bold: true, fill: '#f3f4f6' });
      group.items.forEach((item, index) => {
        drawRow({
          no: index + 1,
          code: item.code || '-',
          name: item.name,
          volume: angka(item.volume),
          unit: item.unit,
          unitPrice: rupiah(item.unitPrice),
          subtotal: rupiah(item.subtotal),
        });
      });
      drawSpanRow(`Jumlah ${group.name}`, rupiah(group.subtotal), { bold: true });
    });

    // ── Rekapitulasi ───────────────────────────────────────────────────
    doc.moveDown(0.6);
    drawSpanRow('JUMLAH HARGA PEKERJAAN', rupiah(summary.itemsSubtotal), { bold: true });
    if (summary.discountAmount > 0) drawSpanRow('Diskon', `- ${rupiah(summary.discountAmount)}`);
    if (summary.serviceFee > 0) drawSpanRow('Biaya Jasa', rupiah(summary.serviceFee));
    if (summary.marginAmount > 0) drawSpanRow(`Margin ${angka(summary.marginPercent, 2)}%`, rupiah(summary.marginAmount));
    drawSpanRow('Dasar Pengenaan Pajak (DPP)', rupiah(summary.dpp));
    drawSpanRow(`PPN ${angka(summary.taxPercent, 2)}%`, rupiah(summary.taxAmount));
    drawSpanRow('JUMLAH TOTAL', rupiah(summary.total), { bold: true });
    drawSpanRow('DIBULATKAN', rupiah(summary.grandTotal), { bold: true, fill: '#e5e7eb' });

    doc.moveDown(0.5);
    doc.font('Helvetica-Oblique').fontSize(9).text(`Terbilang: ${terbilang(summary.grandTotal)}`, left, doc.y, { width: TABLE_WIDTH });

    // ── Tanda tangan: kiri pemilik/klien (menyetujui), kanan pembuat RAB ─
    if (doc.y + 120 > bottom()) doc.addPage();
    doc.moveDown(2);
    const signWidth = 200;
    const rightX = left + TABLE_WIDTH - signWidth;
    const top = doc.y;
    doc.font('Helvetica').fontSize(9.5);
    doc.text(`${project.location || '..................'}, ${tanggal(new Date())}`, rightX, top, { width: signWidth, align: 'center' });
    const labelY = doc.y;
    doc.text('Disetujui oleh,', left, labelY, { width: signWidth, align: 'center' });
    doc.text('Pemilik / Klien', left, doc.y, { width: signWidth, align: 'center' });
    doc.text('Dibuat oleh,', rightX, labelY, { width: signWidth, align: 'center' });
    doc.text(company?.companyName || ' ', rightX, doc.y, { width: signWidth, align: 'center' });
    const nameY = doc.y + 52;
    doc.font('Helvetica-Bold');
    doc.text(project.approvedBy || project.clientName || '(..............................)', left, nameY, { width: signWidth, align: 'center', underline: true });
    doc.text(preparedBy || '(..............................)', rightX, nameY, { width: signWidth, align: 'center', underline: true });
    doc.x = left;

    // ── Lampiran: kebutuhan material ──────────────────────────────────
    if (materials?.items?.length) {
      doc.addPage();
      doc.font('Helvetica-Bold').fontSize(12).text('LAMPIRAN: PERKIRAAN KEBUTUHAN MATERIAL', left, MARGIN, { align: 'center', width: TABLE_WIDTH });
      doc.font('Helvetica').fontSize(8.5).fillColor('#444');
      doc.text(
        `${project.projectName}. Dihitung dari koefisien bahan AHSP × volume pekerjaan (item manual tidak termasuk). Harga bahan sesuai master harga saat dokumen dibuat.`,
        left,
        doc.y + 4,
        { align: 'center', width: TABLE_WIDTH },
      );
      doc.fillColor('#000').moveDown(0.8);

      const cols = [
        { label: 'No', width: 26, align: 'center' },
        { label: 'Kode', width: 58, align: 'left' },
        { label: 'Nama Bahan', width: 189, align: 'left' },
        { label: 'Jumlah', width: 70, align: 'right' },
        { label: 'Sat.', width: 40, align: 'center' },
        { label: 'Harga Satuan', width: 66, align: 'right' },
        { label: 'Perkiraan Biaya', width: 66, align: 'right' },
      ];
      const row = (cells, { bold = false, fill = null } = {}) => {
        doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.5);
        const height = Math.max(...cols.map((c, i) => doc.heightOfString(String(cells[i] ?? ''), { width: c.width - PAD * 2 }))) + PAD * 2;
        if (doc.y + height > bottom()) doc.addPage();
        const y = doc.y;
        if (fill) doc.rect(left, y, TABLE_WIDTH, height).fill(fill).fillColor('#000');
        let x = left;
        cols.forEach((c, i) => {
          doc.rect(x, y, c.width, height).lineWidth(0.5).strokeColor('#666').stroke();
          doc.text(String(cells[i] ?? ''), x + PAD, y + PAD, { width: c.width - PAD * 2, align: bold && fill ? 'center' : c.align });
          x += c.width;
        });
        doc.x = left;
        doc.y = y + height;
      };
      row(cols.map((c) => c.label), { bold: true, fill: '#e5e7eb' });
      materials.items.forEach((m, i) => row([i + 1, m.code, m.name, angka(m.quantity, 3), m.unit, rupiah(m.unitPrice), rupiah(m.amount)]));
      drawSpanRow('PERKIRAAN TOTAL BIAYA BAHAN', rupiah(materials.total), { bold: true, repeatHeader: false });
    }

    // ── Lampiran internal: komposisi biaya ─────────────────────────────
    if (composition?.total > 0) {
      if (doc.y + 150 > bottom()) doc.addPage();
      else doc.moveDown(1.5);
      doc.font('Helvetica-Bold').fontSize(11).text('KOMPOSISI BIAYA PEKERJAAN', left, doc.y, { align: 'center', width: TABLE_WIDTH });
      doc.moveDown(0.5);
      const parts = [
        ['Upah tenaga kerja', composition.upah, composition.upahPercent],
        ['Bahan / material', composition.bahan, composition.bahanPercent],
        ['Peralatan', composition.alat, composition.alatPercent],
        ['Overhead & keuntungan', composition.overhead, composition.overheadPercent],
        ['Item manual (di luar AHSP)', composition.manual, composition.manualPercent],
      ].filter(([, value]) => value > 0);
      for (const [label, value, percent] of parts) {
        drawSpanRow(`${label} (${angka(percent, 1)}%)`, rupiah(value), { repeatHeader: false });
      }
      drawSpanRow('JUMLAH HARGA PEKERJAAN', rupiah(composition.total), { bold: true, repeatHeader: false });
    }

    // ── Nomor halaman ──────────────────────────────────────────────────
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i += 1) {
      doc.switchToPage(i);
      // Footer ada di area margin bawah; nolkan margin supaya pdfkit tidak membuat halaman baru
      doc.page.margins.bottom = 0;
      doc.font('Helvetica').fontSize(8).fillColor('#666');
      doc.text(`Halaman ${i + 1} dari ${range.count}`, left, doc.page.height - MARGIN, {
        width: TABLE_WIDTH,
        align: 'right',
        lineBreak: false,
      });
    }

    doc.end();
  });
}
