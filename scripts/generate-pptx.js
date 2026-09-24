import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pptxgen = require('pptxgenjs');
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9'; // 10.0 x 5.625 inches
pres.author = 'Bagian Tata Usaha Sekretariat Jenderal Kemnaker RI';
pres.company = 'Kementerian Ketenagakerjaan RI';
pres.subject = 'Presentasi Sistem Peminjaman Ruang Rapat (SIRAPAT / ROOMBOOK)';
pres.title = 'SIRAPAT — ROOMBOOK Presentasi Sistem';

// Color Palette
const C = {
  bgDark: '0B0F17',
  emeraldDark: '064E3B',
  emeraldMid: '059669',
  emeraldLight: '10B981',
  emeraldSubtle: '042F24',
  gold: 'F59E0B',
  goldLight: 'FDE68A',
  cardBg: '161F2E',
  cardBgLight: '1E293B',
  cardBorder: '2B3B52',
  white: 'FFFFFF',
  slateLight: 'E2E8F0',
  slateMuted: '94A3B8',
  danger: 'EF4444',
  blue: '3B82F6'
};

const logoKemnakerPath = path.join(rootDir, 'public', 'logo-kemnaker.png');
const qrPath = path.join(rootDir, 'public', 'qr-sirapat.png');
const sekjenPhoto = path.join(rootDir, 'public', 'rooms', 'ruang-sekjen-1.jpg');
const vipPhoto = path.join(rootDir, 'public', 'rooms', 'ruang-vip-1.jpg');
const transitPhoto = path.join(rootDir, 'public', 'rooms', 'ruang-transit-1.jpg');

// Standard Slide Header (Width max 9.0 inches, fits inside 10.0 x 5.625)
function addHeader(slide, category, title, subtitle) {
  // Category Tag
  slide.addShape(pres.ShapeType.rect, {
    x: 0.5, y: 0.35, w: 0.08, h: 0.45,
    fill: { color: C.gold }
  });

  slide.addText(category.toUpperCase(), {
    x: 0.65, y: 0.33, w: 8.8, h: 0.22,
    fontSize: 9.5, fontFace: 'Arial', bold: true, color: C.gold, letterSpacing: 1.5
  });

  slide.addText(title, {
    x: 0.65, y: 0.55, w: 8.8, h: 0.35,
    fontSize: 17, fontFace: 'Arial', bold: true, color: C.white
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.65, y: 0.92, w: 8.8, h: 0.25,
      fontSize: 10.5, fontFace: 'Arial', color: C.slateMuted
    });
  }

  // Top-right tiny branding pill
  slide.addText('SIRAPAT • TU SEKJEN KEMNAKER RI', {
    x: 6.8, y: 0.35, w: 2.7, h: 0.25,
    fontSize: 8, fontFace: 'Arial', bold: true, color: C.emeraldLight, align: 'right'
  });
}

// -------------------------------------------------------------
// SLIDE 1: COVER
// -------------------------------------------------------------
{
  const slide = pres.addSlide();
  slide.background = { color: C.bgDark };

  // Top Accent Line
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 10.0, h: 0.08,
    fill: { color: C.emeraldLight }
  });

  // Logo Kemnaker if exists
  if (fs.existsSync(logoKemnakerPath)) {
    slide.addImage({
      path: logoKemnakerPath,
      x: 4.6, y: 0.55, w: 0.8, h: 0.8
    });
  }

  // Instansi Pill
  slide.addShape(pres.ShapeType.roundRect, {
    x: 1.8, y: 1.45, w: 6.4, h: 0.35,
    rectRadius: 0.15,
    fill: { color: '152332' },
    line: { color: '2B3B52', width: 1 }
  });

  slide.addText('BAGIAN TATA USAHA SEKRETARIAT JENDERAL KEMNAKER RI', {
    x: 1.8, y: 1.52, w: 6.4, h: 0.22,
    fontSize: 9.5, fontFace: 'Arial', bold: true, color: C.gold, align: 'center', letterSpacing: 1.2
  });

  // Main Title
  slide.addText('Sistem Peminjaman &\nTata Kelola Ruang Rapat Digital', {
    x: 0.8, y: 1.95, w: 8.4, h: 1.15,
    fontSize: 26, fontFace: 'Arial', bold: true, color: C.white, align: 'center', lineSpacingMultiple: 1.1
  });

  // App Tagline
  slide.addText('SIRAPAT (ROOMBOOK) v2.0 Production Ready\nIntegrasi Google Calendar API, Layar Smart TV 16:9, SOP Approval H-2, & Cetak Laporan Resmi', {
    x: 1.0, y: 3.2, w: 8.0, h: 0.65,
    fontSize: 11, fontFace: 'Arial', color: C.slateMuted, align: 'center', lineSpacingMultiple: 1.2
  });

  // Bottom Meta Box
  slide.addShape(pres.ShapeType.roundRect, {
    x: 1.5, y: 4.15, w: 7.0, h: 0.95,
    rectRadius: 0.15,
    fill: { color: C.emeraldDark },
    line: { color: C.emeraldLight, width: 1.5 }
  });

  slide.addText([
    { text: '🌐 TAUTAN RESMI APLIKASI: ', options: { bold: true, color: C.goldLight, fontSize: 10 } },
    { text: 'https://sirapatsekjen.vercel.app\n', options: { color: C.white, bold: true, fontSize: 11.5 } },
    { text: '✓ 100% Bebas Bentrok  •  ✓ Self-Service Pegawai  •  ✓ Smart TV Kiosk Real-Time', options: { color: 'A7F3D0', fontSize: 9.5 } }
  ], {
    x: 1.6, y: 4.25, w: 6.8, h: 0.75,
    align: 'center'
  });
}

// -------------------------------------------------------------
// SLIDE 2: LATAR BELAKANG & PERMASALAHAN
// -------------------------------------------------------------
{
  const slide = pres.addSlide();
  slide.background = { color: C.bgDark };
  addHeader(slide, 'Latar Belakang & Urgensi', 'Tantangan Pengelolaan Ruang Rapat Manual', 'Kendala operasional sebelum diterapkannya digitalisasi sistem terpusat.');

  const problems = [
    {
      title: 'Bentrok Jadwal (Double Booking)',
      desc: 'Pencatatan terpisah via chat WhatsApp & buku fisik memicu tabrakan jadwal antar unit kerja.',
      color: C.danger
    },
    {
      title: 'Status Ruang Tidak Real-Time',
      desc: 'Pegawai harus mendatangi pintu ruangan hanya untuk mengecek apakah ruangan sedang dipakai atau kosong.',
      color: C.gold
    },
    {
      title: 'Persetujuan Pimpinan Lambat',
      desc: 'Khusus ruangan strategis (Ruang Sekjen & VIP), izin berjenjang sering tertunda tanpa kejelasan status.',
      color: C.blue
    },
    {
      title: 'Minim Rekam Jejak & Audit',
      desc: 'Tidak ada rekapitulasi data utilisasi ruangan untuk bahan laporan pimpinan dan pemeliharaan.',
      color: '8B5CF6'
    }
  ];

  problems.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = 0.5 + (col * 4.6);
    const y = 1.35 + (row * 1.95);

    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w: 4.4, h: 1.75,
      rectRadius: 0.12,
      fill: { color: C.cardBg },
      line: { color: C.cardBorder, width: 1 }
    });

    slide.addShape(pres.ShapeType.rect, {
      x: x + 0.2, y: y + 0.2, w: 0.08, h: 0.4,
      fill: { color: item.color }
    });

    slide.addText(item.title, {
      x: x + 0.35, y: y + 0.18, w: 3.8, h: 0.4,
      fontSize: 12.5, fontFace: 'Arial', bold: true, color: C.white
    });

    slide.addText(item.desc, {
      x: x + 0.35, y: y + 0.65, w: 3.8, h: 0.95,
      fontSize: 10, fontFace: 'Arial', color: C.slateMuted, lineSpacingMultiple: 1.2
    });
  });
}

// -------------------------------------------------------------
// SLIDE 3: SOLUSI ROOMBOOK & NILAI STRATEGIS
// -------------------------------------------------------------
{
  const slide = pres.addSlide();
  slide.background = { color: C.bgDark };
  addHeader(slide, 'Transformasi Digital', 'Solusi Terpadu: ROOMBOOK (SIRAPAT)', 'Satu ekosistem berbasis web terintegrasi untuk seluruh pegawai dan pengelola TU.');

  // Card Left: Nilai Strategis
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.5, y: 1.35, w: 4.4, h: 3.85,
    rectRadius: 0.15,
    fill: { color: C.emeraldSubtle },
    line: { color: C.emeraldLight, width: 1.5 }
  });

  slide.addText('NILAI STRATEGIS INSTANSI', {
    x: 0.7, y: 1.55, w: 4.0, h: 0.3,
    fontSize: 13, fontFace: 'Arial', bold: true, color: C.emeraldLight
  });

  const strategicPoints = [
    '100% Bebas Bentrok: Validasi otomatis slot waktu & sinkronisasi Google Calendar API.',
    'Display Smart TV di Depan Pintu: Status real-time OLED, countdown rapat, & QR Book.',
    'Disiplin SOP Approval H-2: Peringatan batas waktu persetujuan otomatis bagi pengelola.',
    'Laporan Resmi Otomatis: Rekapitulasi siap cetak format dinas dan ekspor file Excel.'
  ];

  slide.addText(strategicPoints.map(p => ({ text: p + '\n\n', options: { fontSize: 10, color: C.slateLight, bullet: true } })), {
    x: 0.7, y: 1.95, w: 4.0, h: 3.1
  });

  // Card Right: Kemudahan Bagi Pegawai
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.1, y: 1.35, w: 4.4, h: 3.85,
    rectRadius: 0.15,
    fill: { color: C.cardBg },
    line: { color: C.gold, width: 1.5 }
  });

  slide.addText('KEMUDAHAN LAYANAN MANDIRI', {
    x: 5.3, y: 1.55, w: 4.0, h: 0.3,
    fontSize: 13, fontFace: 'Arial', bold: true, color: C.gold
  });

  const userPoints = [
    'Pesan Tanpa Perlu Login: Cukup masukkan nama, unit kerja, & agenda rapat.',
    '1-Click Sync ke Google Calendar: Simpan agenda langsung ke HP pemohon.',
    'Mobile Quick Book: Scan barcode QR di monitor TV pintu untuk reservasi kilat 30 detik.',
    'Lacak Peminjaman Saya: Cukup masukkan email untuk memantau status persetujuan.'
  ];

  slide.addText(userPoints.map(p => ({ text: p + '\n\n', options: { fontSize: 10, color: C.slateLight, bullet: true } })), {
    x: 5.3, y: 1.95, w: 4.0, h: 3.1
  });
}

// -------------------------------------------------------------
// SLIDE 4: TAMPILAN 1 - BERANDA PUBLIK & TIMELINE
// -------------------------------------------------------------
{
  const slide = pres.addSlide();
  slide.background = { color: C.bgDark };
  addHeader(slide, 'Antarmuka Aplikasi 1', 'Beranda Publik & Timeline Jadwal Real-Time', 'Pegawai dapat memantau ketersediaan seluruh ruangan secara visual.');

  // Simulated Web Frame Left
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.5, y: 1.35, w: 5.0, h: 3.85,
    rectRadius: 0.12,
    fill: { color: '0E1624' },
    line: { color: C.cardBorder, width: 1.5 }
  });

  slide.addShape(pres.ShapeType.rect, {
    x: 0.5, y: 1.35, w: 5.0, h: 0.35,
    fill: { color: C.emeraldDark }
  });
  slide.addText('SIRAPAT — TU SEKJEN KEMNAKER RI | https://sirapatsekjen.vercel.app', {
    x: 0.65, y: 1.42, w: 4.7, h: 0.22,
    fontSize: 8.5, fontFace: 'Arial', bold: true, color: C.white
  });

  // Room 1 Card
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.7, y: 1.85, w: 4.6, h: 0.95,
    rectRadius: 0.08,
    fill: { color: C.cardBgLight },
    line: { color: C.danger, width: 1.2 }
  });
  slide.addText('RUANG RAPAT SEKJEN (30 Org) — [ SEDANG DIGUNAKAN ]', {
    x: 0.85, y: 1.92, w: 4.3, h: 0.22, fontSize: 9.5, bold: true, color: 'F87171'
  });
  slide.addText('Agenda: Rakor Evaluasi Anggaran • 09:00 - 11:30 WIB • Biro Umum', {
    x: 0.85, y: 2.18, w: 4.3, h: 0.45, fontSize: 8.5, color: C.slateLight
  });

  // Room 2 Card
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.7, y: 2.9, w: 4.6, h: 0.95,
    rectRadius: 0.08,
    fill: { color: C.cardBgLight },
    line: { color: C.emeraldLight, width: 1.2 }
  });
  slide.addText('RUANG VIP (12 Org) — [ TERSEDIA ]', {
    x: 0.85, y: 2.97, w: 4.3, h: 0.22, fontSize: 9.5, bold: true, color: C.emeraldLight
  });
  slide.addText('Status: Ruangan Kosong Siap Dipesan • Fasilitas Lengkap', {
    x: 0.85, y: 3.23, w: 4.3, h: 0.45, fontSize: 8.5, color: C.slateLight
  });

  // Timeline representation
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.7, y: 3.95, w: 4.6, h: 1.05,
    rectRadius: 0.08,
    fill: { color: '15202B' },
    line: { color: '2B3B52', width: 1 }
  });
  slide.addText('Timeline Hari Ini: 08:00 - 17:00 WIB', {
    x: 0.85, y: 4.02, w: 4.3, h: 0.22, fontSize: 8.5, bold: true, color: C.gold
  });
  slide.addShape(pres.ShapeType.rect, { x: 0.85, y: 4.35, w: 1.6, h: 0.35, fill: { color: C.danger } });
  slide.addText('09:00 - 11:30', { x: 0.85, y: 4.4, w: 1.6, h: 0.25, fontSize: 8, bold: true, color: C.white, align: 'center' });
  slide.addShape(pres.ShapeType.rect, { x: 2.8, y: 4.35, w: 1.4, h: 0.35, fill: { color: C.blue } });
  slide.addText('13:30 - 15:30', { x: 2.8, y: 4.4, w: 1.4, h: 0.25, fontSize: 8, bold: true, color: C.white, align: 'center' });

  // Feature List Right
  slide.addText('FITUR UTAMA BERANDA PUBLIK:', {
    x: 5.7, y: 1.45, w: 3.8, h: 0.3, fontSize: 13, bold: true, color: C.emeraldLight
  });

  const bPoints = [
    'Status 1 Detik: Kode warna (Hijau=Tersedia, Merah=Terpakai) langsung terbaca.',
    'Filter Tanggal Cerdas: Memeriksa ketersediaan ruangan di hari-hari mendatang.',
    'Tombol "+ Pesan Ruangan": Membuka modal formulir pemesanan cepat.',
    'Pencarian Booking: Cek status permohonan via alamat email pemohon.'
  ];

  slide.addText(bPoints.map(p => ({ text: p + '\n\n', options: { fontSize: 10, color: C.slateLight, bullet: true } })), {
    x: 5.7, y: 1.9, w: 3.8, h: 3.1
  });
}

// -------------------------------------------------------------
// SLIDE 5: TAMPILAN 2 - FORMULIR RESERVASI & GOOGLE CALENDAR
// -------------------------------------------------------------
{
  const slide = pres.addSlide();
  slide.background = { color: C.bgDark };
  addHeader(slide, 'Antarmuka Aplikasi 2', 'Formulir Reservasi & Sync Google Calendar', 'Pengisian formulir singkat dengan integrasi kalender pribadi pemohon.');

  // Form Mockup Left
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.5, y: 1.35, w: 4.4, h: 3.85,
    rectRadius: 0.12,
    fill: { color: C.cardBg },
    line: { color: C.cardBorder, width: 1.5 }
  });

  slide.addText('FORMULIR PERMOHONAN RUANG RAPAT', {
    x: 0.7, y: 1.55, w: 4.0, h: 0.25, fontSize: 11, bold: true, color: C.gold
  });

  const formFields = [
    '• Pilihan Ruangan: Ruang Rapat Sekjen (Maks 30 Org)',
    '• Nama Pemohon: Budi Santoso, S.Kom',
    '• Unit Kerja: Bagian Tata Usaha / Biro Umum',
    '• Agenda: Rapat Koordinasi Anggaran Triwulan III',
    '• Waktu: 24 September 2026 (09:00 - 11:30 WIB)',
    '• Jumlah Peserta: 20 Orang'
  ];

  slide.addText(formFields.join('\n\n'), {
    x: 0.7, y: 1.95, w: 4.0, h: 2.3, fontSize: 9.5, color: C.slateLight
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.7, y: 4.45, w: 4.0, h: 0.55,
    rectRadius: 0.08,
    fill: { color: C.emeraldDark },
    line: { color: C.emeraldLight, width: 1 }
  });
  slide.addText('✓ Slot Waktu Tersedia & Bebas Bentrok', {
    x: 0.7, y: 4.57, w: 4.0, h: 0.3, fontSize: 9.5, bold: true, color: C.emeraldLight, align: 'center'
  });

  // Google Calendar Right
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.1, y: 1.35, w: 4.4, h: 3.85,
    rectRadius: 0.12,
    fill: { color: '0A192F' },
    line: { color: '4285F4', width: 1.5 }
  });

  slide.addText('SINKRONISASI 1-KLIK GOOGLE CALENDAR', {
    x: 5.3, y: 1.55, w: 4.0, h: 0.3, fontSize: 13, bold: true, color: '60A5FA'
  });

  const gPoints = [
    'Simpan ke HP Pemohon: Tombol "Tambahkan ke Google Kalender Saya" otomatis aktif setelah booking.',
    'Isi Otomatis: Judul, lokasi ruang, jam mulai/selesai, dan unit langsung terisi lengkap.',
    'Alarm Pengingat: Google Calendar smartphone akan mengingatkan H-30 menit sebelum rapat.',
    'Sinkronisasi 2-Arah: Status persetujuan resmi juga langsung sinkron ke kalender instansi.'
  ];

  slide.addText(gPoints.map(p => ({ text: p + '\n\n', options: { fontSize: 10, color: C.slateLight, bullet: true } })), {
    x: 5.3, y: 1.95, w: 4.0, h: 3.1
  });
}

// -------------------------------------------------------------
// SLIDE 6: TAMPILAN 3 - DISPLAY KIOSK SMART TV RUANGAN (16:9)
// -------------------------------------------------------------
{
  const slide = pres.addSlide();
  slide.background = { color: C.bgDark };
  addHeader(slide, 'Antarmuka Aplikasi 3', 'Display Kiosk Layar Smart TV Ruangan (16:9)', 'Layar informasi cerdas di dinding depan setiap ruang rapat.');

  // TV Screen Frame Left
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.5, y: 1.35, w: 5.2, h: 3.85,
    rectRadius: 0.15,
    fill: { color: '020617' },
    line: { color: C.emeraldLight, width: 2 }
  });

  // TV Header Bar
  slide.addText('RUANG RAPAT SEKJEN (Gedung A, Lt.2)', {
    x: 0.7, y: 1.5, w: 3.3, h: 0.3, fontSize: 10.5, bold: true, color: C.white
  });
  slide.addText('10:45:12 WIB', {
    x: 4.0, y: 1.5, w: 1.5, h: 0.3, fontSize: 11, bold: true, color: C.emeraldLight, align: 'right'
  });

  // Status Banner on TV
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.7, y: 1.9, w: 4.8, h: 1.4,
    rectRadius: 0.1,
    fill: { color: '2D0E14' },
    line: { color: C.danger, width: 1.5 }
  });
  slide.addText('STATUS: SEDANG DIGUNAKAN', {
    x: 0.85, y: 2.0, w: 4.5, h: 0.22, fontSize: 9.5, bold: true, color: C.danger
  });
  slide.addText('Rapat Koordinasi Evaluasi Ketenagakerjaan\nBiro Umum & Perencanaan • 09:00 - 11:30 WIB', {
    x: 0.85, y: 2.28, w: 3.2, h: 0.5, fontSize: 9, bold: true, color: C.white
  });
  slide.addText('Sisa Waktu:\n44 Menit', {
    x: 4.0, y: 2.25, w: 1.4, h: 0.55, fontSize: 10, bold: true, color: C.gold, align: 'center'
  });

  // Footer on TV
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.7, y: 3.45, w: 4.8, h: 1.55,
    rectRadius: 0.08,
    fill: { color: '15202B' },
    line: { color: '2B3B52', width: 1 }
  });
  slide.addText('Agenda Berikutnya Hari Ini:', {
    x: 0.85, y: 3.55, w: 3.0, h: 0.22, fontSize: 8.5, bold: true, color: C.slateMuted
  });
  slide.addText('13:30 - 15:30: Rapat Pembahasan DIPA 2027 (Biro Renkeu)', {
    x: 0.85, y: 3.8, w: 3.2, h: 0.45, fontSize: 9, bold: true, color: C.slateLight
  });
  slide.addText('[ QR CODE ]\nPindai untuk Pesan Kilat', {
    x: 4.1, y: 3.65, w: 1.3, h: 0.9, fontSize: 8, bold: true, color: C.emeraldLight, align: 'center'
  });

  // Feature Highlights Right
  slide.addText('KEUNGGULAN SMART DISPLAY:', {
    x: 5.9, y: 1.45, w: 3.6, h: 0.3, fontSize: 13, bold: true, color: C.gold
  });

  const tvPoints = [
    'Carousel Foto Ruangan: Memutar foto asli ruangan di latar belakang.',
    'Status Terbaca Jarak Jauh: Warna kontras OLED (Merah/Hijau) ramah mata.',
    'Countdown Rapat: Membantu peserta disiplin menyelesaikan rapat tepat waktu.',
    'Auto-Rotate 10 Detik: Layar lobi dapat berganti antar-ruangan secara otomatis.'
  ];

  slide.addText(tvPoints.map(p => ({ text: p + '\n\n', options: { fontSize: 9.5, color: C.slateLight, bullet: true } })), {
    x: 5.9, y: 1.9, w: 3.6, h: 3.1
  });
}

// -------------------------------------------------------------
// SLIDE 7: TAMPILAN 4 - MOBILE QUICK BOOK (QR CODE)
// -------------------------------------------------------------
{
  const slide = pres.addSlide();
  slide.background = { color: C.bgDark };
  addHeader(slide, 'Antarmuka Aplikasi 4', 'Mobile Quick Book (Pindai QR Code di Pintu)', 'Pemesanan kilat touch-first saat pegawai berada langsung di depan ruangan.');

  // QR Code Image & Box Left
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 1.35, w: 3.8, h: 3.85,
    rectRadius: 0.15,
    fill: { color: C.cardBg },
    line: { color: C.emeraldLight, width: 1.5 }
  });

  if (fs.existsSync(qrPath)) {
    slide.addImage({
      path: qrPath,
      x: 1.7, y: 1.6, w: 2.0, h: 2.0
    });
  }

  slide.addText('PINDAI BARCODE DI ATAS DENGAN KAMERA HP', {
    x: 0.9, y: 3.8, w: 3.6, h: 0.3, fontSize: 8.5, bold: true, color: C.goldLight, align: 'center'
  });
  slide.addText('https://sirapatsekjen.vercel.app', {
    x: 0.9, y: 4.15, w: 3.6, h: 0.25, fontSize: 9.5, bold: true, color: C.emeraldLight, align: 'center'
  });

  // Steps Right
  slide.addText('3 LANGKAH KILAT DI DEPAN PINTU:', {
    x: 5.0, y: 1.45, w: 4.5, h: 0.3, fontSize: 13, bold: true, color: C.emeraldLight
  });

  const qkPoints = [
    '1. Scan Barcode QR: Arahkan kamera smartphone ke QR Code di layar Smart TV.',
    '2. Buka Form Kilat: Halaman otomatis mendeteksi nama ruangan tanpa perlu dicari.',
    '3. Konfirmasi Instan: Klik "Pesan Sekarang" dan slot waktu langsung terkunci.',
    'Sangat Ideal Untuk: Rapat koordinasi taktis mendadak pimpinan tanpa perlu kembali ke meja kerja untuk menyalakan laptop.'
  ];

  slide.addText(qkPoints.map(p => ({ text: p + '\n\n', options: { fontSize: 10, color: C.slateLight, bullet: true } })), {
    x: 5.0, y: 1.9, w: 4.5, h: 3.1
  });
}

// -------------------------------------------------------------
// SLIDE 8: TAMPILAN 5 - DASHBOARD APPROVAL SOP H-2
// -------------------------------------------------------------
{
  const slide = pres.addSlide();
  slide.background = { color: C.bgDark };
  addHeader(slide, 'Antarmuka Aplikasi 5', 'Pusat Persetujuan Pengelola (Approval Hub H-2)', 'Tim TU SEKJEN memproses izin dengan sistem peringatan batas waktu.');

  // Approval Table Left
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.5, y: 1.35, w: 4.8, h: 3.85,
    rectRadius: 0.12,
    fill: { color: C.cardBg },
    line: { color: C.cardBorder, width: 1.5 }
  });

  slide.addText('ANTREAN MENUNGGU PERSETUJUAN (PENDING)', {
    x: 0.7, y: 1.5, w: 4.4, h: 0.25, fontSize: 10, bold: true, color: C.gold
  });

  // Item 1: Urgent H-1
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.7, y: 1.85, w: 4.4, h: 1.4,
    rectRadius: 0.08,
    fill: { color: '15202B' },
    line: { color: C.danger, width: 1.2 }
  });
  slide.addText('Rapat Koordinasi Renja 2027 • [ URGENT H-1 ]', {
    x: 0.85, y: 1.95, w: 4.1, h: 0.22, fontSize: 9.5, bold: true, color: C.danger
  });
  slide.addText('Pemohon: Dra. Nurhayati (Biro Renkeu) • Ruang Sekjen • 25 Sep, 09:00', {
    x: 0.85, y: 2.2, w: 4.1, h: 0.35, fontSize: 8.5, color: C.slateLight
  });
  slide.addShape(pres.ShapeType.roundRect, { x: 0.85, y: 2.65, w: 1.9, h: 0.4, rectRadius: 0.05, fill: { color: C.emeraldMid } });
  slide.addText('✓ Setujui (Approve)', { x: 0.85, y: 2.7, w: 1.9, h: 0.25, fontSize: 8.5, bold: true, color: C.white, align: 'center' });
  slide.addShape(pres.ShapeType.roundRect, { x: 2.9, y: 2.65, w: 1.9, h: 0.4, rectRadius: 0.05, fill: { color: 'DC2626' } });
  slide.addText('✕ Tolak (Reject)', { x: 2.9, y: 2.7, w: 1.9, h: 0.25, fontSize: 8.5, bold: true, color: C.white, align: 'center' });

  // Item 2: H-3
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.7, y: 3.4, w: 4.4, h: 1.4,
    rectRadius: 0.08,
    fill: { color: '15202B' },
    line: { color: C.gold, width: 1 }
  });
  slide.addText('Penerimaan Tamu Delegasi ILO • [ H-3 ]', {
    x: 0.85, y: 3.5, w: 4.1, h: 0.22, fontSize: 9.5, bold: true, color: C.gold
  });
  slide.addText('Pemohon: Hendra Setiawan (Biro KSLN) • Ruang VIP • 27 Sep, 14:00', {
    x: 0.85, y: 3.75, w: 4.1, h: 0.35, fontSize: 8.5, color: C.slateLight
  });
  slide.addShape(pres.ShapeType.roundRect, { x: 0.85, y: 4.2, w: 1.9, h: 0.4, rectRadius: 0.05, fill: { color: C.emeraldMid } });
  slide.addText('✓ Setujui (Approve)', { x: 0.85, y: 4.25, w: 1.9, h: 0.25, fontSize: 8.5, bold: true, color: C.white, align: 'center' });

  // Mechanism Right
  slide.addText('MEKANISME SOP PERSETUJUAN:', {
    x: 5.6, y: 1.45, w: 3.9, h: 0.3, fontSize: 13, bold: true, color: C.emeraldLight
  });

  const apPoints = [
    'Persetujuan 1-Klik: Pengelola cukup menekan tombol Setujui untuk mengesahkan jadwal.',
    'Auto-Sync Kalender: Saat disetujui, event Google Calendar resmi otomatis terbentuk.',
    'Catatan Resmi Penolakan: Jika ditolak, pengelola dapat memberi alasan transparan.',
    'Fleksibilitas Admin: Admin dapat mencatat/reschedule tanggal lampau untuk arsip.'
  ];

  slide.addText(apPoints.map(p => ({ text: p + '\n\n', options: { fontSize: 10, color: C.slateLight, bullet: true } })), {
    x: 5.6, y: 1.9, w: 3.9, h: 3.1
  });
}

// -------------------------------------------------------------
// SLIDE 9: TAMPILAN 6 - LAPORAN & CETAK PDF RESMI
// -------------------------------------------------------------
{
  const slide = pres.addSlide();
  slide.background = { color: C.bgDark };
  addHeader(slide, 'Antarmuka Aplikasi 6', 'Laporan Rekapitulasi & Cetak PDF Format Resmi', 'Dokumen laporan resmi berstandar kop surat Kementerian Ketenagakerjaan RI.');

  // Document Box Left
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.5, y: 1.35, w: 4.4, h: 3.85,
    rectRadius: 0.1,
    fill: { color: C.white },
    line: { color: 'CBD5E1', width: 1.5 }
  });

  slide.addText('KEMENTERIAN KETENAGAKERJAAN REPUBLIK INDONESIA\nSEKRETARIAT JENDERAL — BAGIAN TATA USAHA', {
    x: 0.65, y: 1.5, w: 4.1, h: 0.45, fontSize: 8, bold: true, color: '000000', align: 'center'
  });

  slide.addShape(pres.ShapeType.line, { x: 0.65, y: 1.95, w: 4.1, h: 0, line: { color: '000000', width: 1 } });

  slide.addText('LAPORAN REKAPITULASI PEMINJAMAN RUANG RAPAT', {
    x: 0.65, y: 2.05, w: 4.1, h: 0.25, fontSize: 8, bold: true, color: '000000', align: 'center'
  });

  const sampleRows = [
    '24/09/2026 | Ruang Sekjen | Biro Umum | DISETUJUI',
    '24/09/2026 | Ruang VIP    | Biro Renkeu| DISETUJUI',
    '25/09/2026 | Ruang Transit| Biro Humas | SELESAI'
  ];

  slide.addText(sampleRows.join('\n\n'), {
    x: 0.65, y: 2.45, w: 4.1, h: 1.3, fontSize: 8, fontFace: 'Courier New', color: '333333'
  });

  slide.addText('Mengetahui,\nPengelola Ruang Rapat TU Sekjen\n\n( Administrator TU Sekjen )', {
    x: 2.6, y: 3.9, w: 2.1, h: 1.1, fontSize: 7.5, color: '000000', align: 'center'
  });

  // Right Side Notes
  slide.addText('STANDAR DOKUMEN KEDINASAN:', {
    x: 5.2, y: 1.45, w: 4.3, h: 0.3, fontSize: 13, bold: true, color: C.gold
  });

  const repPoints = [
    'Hanya Memuat Jadwal Sah: Rekapitulasi secara cerdas hanya menyaring agenda berstatus Disetujui & Selesai.',
    'Filter Tanggal Fleksibel: Rekap mingguan, bulanan, atau triwulanan dengan 1 klik.',
    'Ekspor Multi-Format: Cetak PDF langsung berstempel kop dinas atau unduh CSV/Excel.',
    'Statistik Utilisasi: Memantau okupansi ruangan & unit kerja paling aktif menggunakan fasilitas.'
  ];

  slide.addText(repPoints.map(p => ({ text: p + '\n\n', options: { fontSize: 10, color: C.slateLight, bullet: true } })), {
    x: 5.2, y: 1.9, w: 4.3, h: 3.1
  });
}

// -------------------------------------------------------------
// SLIDE 10: MASTER RUANG RAPAT & FOTO RUANGAN
// -------------------------------------------------------------
{
  const slide = pres.addSlide();
  slide.background = { color: C.bgDark };
  addHeader(slide, 'Spesifikasi Ruangan', '3 Ruang Rapat Representatif TU SEKJEN', 'Siap melayani kebutuhan rapat pimpinan, tamu delegasi, & tim teknis.');

  const rooms = [
    {
      name: 'Ruang Rapat Sekjen',
      loc: 'Gedung A, Lantai 2',
      cap: 'Kapasitas: 30 Orang',
      type: 'VIP STRATEGIS',
      fac: 'Smart TV 75", Video Conference 4K, Proyektor Laser, Sound System, WiFi Cepat, AC.',
      color: C.gold,
      photo: sekjenPhoto
    },
    {
      name: 'Ruang VIP',
      loc: 'Gedung A, Lantai 1',
      cap: 'Kapasitas: 12 Orang',
      type: 'EKSEKUTIF',
      fac: 'Smart TV, Video Conference, Meja Eksekutif, Sofa Tamu VIP, Mini Bar & Pantry, WiFi.',
      color: C.emeraldLight,
      photo: vipPhoto
    },
    {
      name: 'Ruang Transit',
      loc: 'Gedung B, Lantai 2',
      cap: 'Kapasitas: 8 Orang',
      type: 'INSTANT BOOK',
      fac: 'Whiteboard Kaca, Smart TV 55", Port LAN & WiFi Cepat, Meja Kolaboratif, AC.',
      color: C.blue,
      photo: transitPhoto
    }
  ];

  rooms.forEach((r, i) => {
    const x = 0.5 + (i * 3.05);
    slide.addShape(pres.ShapeType.roundRect, {
      x, y: 1.35, w: 2.9, h: 3.85,
      rectRadius: 0.12,
      fill: { color: C.cardBg },
      line: { color: r.color, width: 1.5 }
    });

    // Image top if exists
    if (fs.existsSync(r.photo)) {
      slide.addImage({
        path: r.photo,
        x: x + 0.15, y: 1.5, w: 2.6, h: 1.2
      });
    }

    slide.addText(r.type, {
      x: x + 0.15, y: 2.8, w: 2.6, h: 0.22, fontSize: 8.5, bold: true, color: r.color
    });

    slide.addText(r.name, {
      x: x + 0.15, y: 3.05, w: 2.6, h: 0.3, fontSize: 12, bold: true, color: C.white
    });

    slide.addText(`${r.loc} • ${r.cap}`, {
      x: x + 0.15, y: 3.35, w: 2.6, h: 0.25, fontSize: 9, bold: true, color: 'A7F3D0'
    });

    slide.addText(r.fac, {
      x: x + 0.15, y: 3.65, w: 2.6, h: 1.4, fontSize: 8.5, color: C.slateMuted, lineSpacingMultiple: 1.15
    });
  });
}

// -------------------------------------------------------------
// SLIDE 11: ARSITEKTUR TEKNIS & KEAMANAN
// -------------------------------------------------------------
{
  const slide = pres.addSlide();
  slide.background = { color: C.bgDark };
  addHeader(slide, 'Arsitektur & Keamanan', 'Arsitektur Sistem & Integrasi Google Service Account', 'Dibangun di atas fondasi teknologi handal berstandar keamanan institusional.');

  // Tech Stack Left
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.5, y: 1.35, w: 4.4, h: 3.85,
    rectRadius: 0.12,
    fill: { color: C.cardBg },
    line: { color: C.emeraldLight, width: 1.5 }
  });

  slide.addText('TEKNOLOGI PENGEMBANGAN', {
    x: 0.7, y: 1.55, w: 4.0, h: 0.3, fontSize: 13, bold: true, color: C.emeraldLight
  });

  const stacks = [
    'Frontend Modern: React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons.',
    'Backend API: Node.js, Express, Helmet Security, CORS, Rate Limiting (100 req/min).',
    'Database: PostgreSQL ACID-Compliant dengan Foreign Keys, ENUMs, & Indexing waktu.',
    'Google Calendar API v3: OAuth 2.0 Service Account resmi instansi.'
  ];

  slide.addText(stacks.map(s => ({ text: s + '\n\n', options: { fontSize: 9.5, color: C.slateLight, bullet: true } })), {
    x: 0.7, y: 1.95, w: 4.0, h: 3.1
  });

  // Security Right
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.1, y: 1.35, w: 4.4, h: 3.85,
    rectRadius: 0.12,
    fill: { color: C.cardBg },
    line: { color: C.gold, width: 1.5 }
  });

  slide.addText('STANDAR KEAMANAN DATA', {
    x: 5.3, y: 1.55, w: 4.0, h: 0.3, fontSize: 13, bold: true, color: C.gold
  });

  const secs = [
    'Parameterized SQL: 100% Kebal terhadap ancaman SQL Injection pada semua endpoint API.',
    'Bcrypt Password Hashing: Enkripsi kata sandi kuat dengan validasi karakter ketat.',
    'Anti-Bruteforce & Rate Limit: Menolak percobaan akses berulang yang tidak sah.',
    'Audit Logging Lengkap: Seluruh aktivitas (booking, approval, login) tercatat dengan stempel waktu.'
  ];

  slide.addText(secs.map(s => ({ text: s + '\n\n', options: { fontSize: 9.5, color: C.slateLight, bullet: true } })), {
    x: 5.3, y: 1.95, w: 4.0, h: 3.1
  });
}

// -------------------------------------------------------------
// SLIDE 12: DAMPAK & PENGUKURAN KEBERHASILAN
// -------------------------------------------------------------
{
  const slide = pres.addSlide();
  slide.background = { color: C.bgDark };
  addHeader(slide, 'Hasil & Dampak', 'Dampak Positif Implementasi ROOMBOOK', 'Peningkatan efisiensi birokrasi dan transparansi fasilitas secara nyata.');

  const metrics = [
    { val: '0%', lbl: 'Zero Double Booking', desc: 'Tidak ada lagi konflik jadwal tumpang tindih antar unit kerja.', color: C.emeraldLight },
    { val: '< 1 mnt', lbl: 'Waktu Reservasi', desc: 'Dari sebelumnya 30-60 menit koordinasi manual via chat WhatsApp.', color: C.emeraldLight },
    { val: '100%', lbl: 'Transparansi Jadwal', desc: 'Seluruh pegawai dapat memantau status secara langsung.', color: C.gold },
    { val: 'H-2', lbl: 'Disiplin SOP Approval', desc: 'Kepastian perizinan tercapai tepat waktu sebelum rapat.', color: C.gold }
  ];

  metrics.forEach((m, i) => {
    const x = 0.5 + (i * 2.3);
    slide.addShape(pres.ShapeType.roundRect, {
      x, y: 1.5, w: 2.15, h: 3.5,
      rectRadius: 0.12,
      fill: { color: C.cardBg },
      line: { color: C.cardBorder, width: 1.5 }
    });

    slide.addText(m.val, {
      x: x + 0.1, y: 1.8, w: 1.95, h: 0.7, fontSize: 28, bold: true, color: m.color, align: 'center'
    });

    slide.addText(m.lbl, {
      x: x + 0.1, y: 2.6, w: 1.95, h: 0.45, fontSize: 11, bold: true, color: C.white, align: 'center'
    });

    slide.addText(m.desc, {
      x: x + 0.15, y: 3.15, w: 1.85, h: 1.4, fontSize: 9.5, color: C.slateMuted, align: 'center', lineSpacingMultiple: 1.2
    });
  });
}

// -------------------------------------------------------------
// SLIDE 13: KESIMPULAN & PENUTUP
// -------------------------------------------------------------
{
  const slide = pres.addSlide();
  slide.background = { color: C.bgDark };

  slide.addShape(pres.ShapeType.roundRect, {
    x: 1.5, y: 0.8, w: 7.0, h: 0.35,
    rectRadius: 0.15,
    fill: { color: C.emeraldDark },
    line: { color: C.emeraldLight, width: 1 }
  });

  slide.addText('SIAP DIGUNAKAN DI SELURUH UNIT KERJA KEMNAKER RI', {
    x: 1.5, y: 0.87, w: 7.0, h: 0.22, fontSize: 9.5, bold: true, color: C.emeraldLight, align: 'center', letterSpacing: 1.5
  });

  slide.addText('Mewujudkan Tata Kelola Ruang Rapat Modern, Terpercaya, & Profesional', {
    x: 0.8, y: 1.4, w: 8.4, h: 1.0, fontSize: 24, bold: true, color: C.white, align: 'center', lineSpacingMultiple: 1.1
  });

  slide.addText('ROOMBOOK (SIRAPAT) siap menjadi standar operasional peminjaman fasilitas rapat yang efisien, transparan, dan akuntabel.', {
    x: 1.0, y: 2.5, w: 8.0, h: 0.6, fontSize: 11, color: C.slateMuted, align: 'center'
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 2.2, y: 3.3, w: 5.6, h: 1.2,
    rectRadius: 0.15,
    fill: { color: C.cardBg },
    line: { color: C.gold, width: 1.5 }
  });

  slide.addText('🌐 Akses Langsung Aplikasi:\nhttps://sirapatsekjen.vercel.app\n\nSesi Diskusi & Tanya Jawab', {
    x: 2.3, y: 3.45, w: 5.4, h: 0.9, fontSize: 11.5, bold: true, color: C.gold, align: 'center', lineSpacingMultiple: 1.2
  });

  slide.addText('© 2026 Bagian Tata Usaha Sekretariat Jenderal — Kementerian Ketenagakerjaan RI', {
    x: 1.0, y: 4.8, w: 8.0, h: 0.3, fontSize: 9, color: '64748B', align: 'center'
  });
}

// Generate File
const outputPath = path.join(rootDir, 'ROOMBOOK_Presentasi_Kemnaker.pptx');
pres.writeFile({ fileName: outputPath })
  .then(fileName => {
    console.log(`[SUCCESS] Perfect PowerPoint generated at: ${fileName}`);
  })
  .catch(err => {
    console.error(`[ERROR] Failed to generate:`, err);
  });
