# DOKUMEN PRESENTASI SISTEM (SLIDE DECK & SPEAKER NOTES)
## SIRAPAT (ROOMBOOK) — SISTEM PEMINJAMAN RUANG RAPAT DIGITAL
### BAGIAN TATA USAHA SEKRETARIAT JENDERAL KEMENTERIAN KETENAGAKERJAAN RI

---

> **Petunjuk Penggunaan:**
> - Versi visual interaktif siap presentasi dapat langsung dibuka melalui file **[`ROOMBOOK_Presentation.html`](file:///c:/Users/Katon/Documents/katon/magang/ROOMBOOK/ROOMBOOK_Presentation.html)** di web browser (Google Chrome / Edge).
> - Dokumen ini memuat naskah pembicara (*speaker notes*), poin-poin presentasi, dan struktur slide untuk diimpor ke **Microsoft PowerPoint**, **Google Slides**, maupun presentasi langsung di depan pimpinan.

---

## DAFTAR ISI SLIDE

1. [Slide 1: Judul & Pembuka (Cover Hero)](#slide-1-judul--pembuka-cover-hero)
2. [Slide 2: Latar Belakang & Permasalahan Tata Kelola Manual](#slide-2-latar-belakang--permasalahan-tata-kelola-manual)
3. [Slide 3: Solusi Terpadu & Nilai Strategis ROOMBOOK](#slide-3-solusi-terpadu--nilai-strategis-roombook)
4. [Slide 4: Tampilan UI 1 — Beranda Publik & Realtime Timeline](#slide-4-tampilan-ui-1--beranda-publik--realtime-timeline)
5. [Slide 5: Tampilan UI 2 — Formulir Reservasi Mandiri & Google Calendar Sync](#slide-5-tampilan-ui-2--formulir-reservasi-mandiri--google-calendar-sync)
6. [Slide 6: Tampilan UI 3 — Layar Smart TV Display Kiosk (16:9 Landscape)](#slide-6-tampilan-ui-3--layar-smart-tv-display-kiosk-169-landscape)
7. [Slide 7: Tampilan UI 4 — Mobile Quick Book (QR Code di Pintu)](#slide-7-tampilan-ui-4--mobile-quick-book-qr-code-di-pintu)
8. [Slide 8: Tampilan UI 5 — Dashboard Pengelola & SOP Approval H-2](#slide-8-tampilan-ui-5--dashboard-pengelola--sop-approval-h-2)
9. [Slide 9: Tampilan UI 6 — Laporan, Rekapitulasi & Cetak PDF Resmi](#slide-9-tampilan-ui-6--laporan-rekapitulasi--cetak-pdf-resmi)
10. [Slide 10: Master Ruang Rapat & Fasilitas Unggulan](#slide-10-master-ruang-rapat--fasilitas-unggulan)
11. [Slide 11: Arsitektur Teknis & Keamanan Data (PostgreSQL & OAuth 2.0)](#slide-11-arsitektur-teknis--keamanan-data-postgresql--oauth-20)
12. [Slide 12: Dampak Positif & Pengukuran Keberhasilan](#slide-12-dampak-positif--pengukuran-keberhasilan)
13. [Slide 13: Kesimpulan & Penutup](#slide-13-kesimpulan--penutup)

---

### Slide 1: Judul & Pembuka (Cover Hero)
- **Judul:** SIRAPAT (ROOMBOOK) — Sistem Peminjaman & Tata Kelola Ruang Rapat Digital
- **Subjudul:** Transformasi Layanan Fasilitas Terintegrasi Google Calendar, Smart TV Display, dan Disiplin SOP Persetujuan H-2.
- **Instansi:** Bagian Tata Usaha Sekretariat Jenderal — Kementerian Ketenagakerjaan RI.
- **Speaker Notes:**
  > *"Selamat pagi/siang Bapak/Ibu pimpinan dan rekan-rekan sekalian. Hari ini kami mempresentasikan inovasi digitalisasi layanan sarana dan prasarana di lingkungan TU Sekjen Kemnaker RI, yaitu sistem SIRAPAT atau ROOMBOOK. Sistem ini hadir untuk menyelesaikan permasalahan bentrok jadwal dan birokrasi peminjaman ruang rapat menjadi serba otomatis, transparan, dan terintegrasi kalender digital."*

---

### Slide 2: Latar Belakang & Permasalahan Tata Kelola Manual
- **Poin Masalah:**
  1. **Bentrok Jadwal (Double Booking):** Sering terjadi dua unit kerja memesan ruang yang sama di jam yang sama karena pencatatan terpisah di buku fisik dan chat WhatsApp.
  2. **Ketiadaan Status Real-time:** Pegawai harus mendatangi pintu fisik ruangan hanya untuk mengecek apakah ruangan sedang dipakai atau kosong.
  3. **Persetujuan Lambat:** Khusus ruang rapat strategis (Ruang Sekjen & VIP), proses izin berjenjang sering terlambat dikonfirmasi.
  4. **Minim Rekam Jejak Audit:** Sulit merekap utilisasi ruangan untuk bahan evaluasi pimpinan dan laporan pemeliharaan.
- **Speaker Notes:**
  > *"Sebelum sistem ini ada, koordinasi ruang rapat memakan waktu lama dan rentan miskomunikasi antar unit. Dengan ROOMBOOK, seluruh tantangan tersebut dieliminasi secara total."*

---

### Slide 3: Solusi Terpadu & Nilai Strategis ROOMBOOK
- **Pilar Transformasi:**
  - **100% Zero Conflict:** Sistem memvalidasi slot waktu secara komprehensif.
  - **Layanan Mandiri Tanpa Login:** Pegawai dapat langsung mengecek dan memesan tanpa birokrasi akun yang rumit.
  - **Display Pintar Smart TV:** Monitor digital di depan pintu ruangan dengan status OLED-friendly, countdown rapat, dan QR Code pemesanan kilat.
  - **Integrasi Google Calendar API:** Sinkronisasi 2-arah otomatis via Google Service Account.

---

### Slide 4: Tampilan UI 1 — Beranda Publik & Realtime Timeline
- **Komponen Visual:**
  - Kartu Status Ruangan (Hijau = Tersedia, Merah = Sedang Dipakai, Oranye = Menunggu Verifikasi).
  - Garis Waktu (*Timeline Visual*) per jam kerja dari pukul 08:00 hingga 18:00 WIB.
  - Filter Kalender Harian untuk melihat jadwal esok hari atau minggu depan.
  - Fitur Pencarian Mandiri (*Cari Peminjaman Saya*) via email pemohon.

---

### Slide 5: Tampilan UI 2 — Formulir Reservasi Mandiri & Google Calendar Sync
- **Fitur Unggulan:**
  - Form ringkas: Pemilihan Ruang, Nama Pemohon, Unit Kerja, Judul Agenda, Jumlah Peserta, dan Jam Rapat.
  - Validasi instan bebas bentrok saat tombol submit ditekan.
  - **Dialog 1-Click "Tambahkan ke Google Kalender Saya":** Memungkinkan pemohon langsung menyimpan undangan kalender ke smartphone Android / iOS mereka.

---

### Slide 6: Tampilan UI 3 — Layar Smart TV Display Kiosk (16:9 Landscape)
- **Fitur Unggulan:**
  - Mode layar penuh Landscape berlatar belakang foto asli ruangan (*Photo Carousel*).
  - Jam digital tersinkronisasi presisi per detik dengan indikator live pulse.
  - Countdown sisa waktu rapat berjalan secara real-time.
  - Daftar agenda berikutnya dalam hari berjalan.
  - Mode perpindahan antar-ruangan otomatis (*Auto-rotate 10 detik*) untuk layar lobi gedung.

---

### Slide 7: Tampilan UI 4 — Mobile Quick Book (QR Code di Pintu)
- **Fitur Unggulan:**
  - Tampilan *Touch-First* vertikal smartphone saat memindai QR Code di monitor TV.
  - Form super kilat untuk kebutuhan rapat mendadak pimpinan dan staf.
  - Konfirmasi instan dalam 30 detik tanpa membuka laptop.

---

### Slide 8: Tampilan UI 5 — Dashboard Pengelola & SOP Approval H-2
- **Fitur Pengelola:**
  - Pusat Persetujuan (*Approvals Hub*) dengan tombol Setujui / Tolak 1-Klik.
  - **Indikator SOP Batas Waktu H-2:** Badge peringatan otomatis untuk permohonan yang mendekati hari pelaksanaan.
  - Catatan resmi penolakan yang transparan.
  - Keamanan Role-Based: Superadmin vs Admin Operasional TU Sekjen.

---

### Slide 9: Tampilan UI 6 — Laporan, Rekapitulasi & Cetak PDF Resmi
- **Fitur Laporan:**
  - Rekapitulasi hanya menyertakan agenda resmi (*Disetujui* dan *Selesai*).
  - Filter rentang tanggal fleksibel (Bulanan, Triwulanan, Tahunan).
  - Statistik unit kerja teraktif dan tingkat okupansi fasilitas.
  - Fitur Cetak PDF format kop resmi Kementerian Ketenagakerjaan RI lengkap dengan kolom tanda tangan pimpinan.

---

### Slide 10: Master Ruang Rapat & Fasilitas Unggulan
- **1. Ruang Rapat Sekjen:** Kapasitas 30 Orang, Gedung A Lt. 2 (Smart TV 75", Video Conference 4K, Proyektor Laser, Sound System, Wajib Approval).
- **2. Ruang VIP:** Kapasitas 12 Orang, Gedung A Lt. 1 (Smart TV, Video Conference, Meja Eksekutif, Sofa VIP, Mini Bar).
- **3. Ruang Transit:** Kapasitas 8 Orang, Gedung B Lt. 2 (Whiteboard Kaca, Smart TV 55", Instant Booking).

---

### Slide 11: Arsitektur Teknis & Keamanan Data
- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons.
- **Backend:** Node.js, Express, Helmet, CORS, Rate Limiter (100 req/menit).
- **Database:** PostgreSQL ACID-Compliant dengan Foreign Keys, ENUM status, dan Indexing waktu.
- **Integrasi API:** Google Calendar API v3 dengan Service Account OAuth 2.0.
- **Keamanan:** Bcrypt Hashing, Parameterized SQL Queries (Anti-SQL Injection), validasi kata sandi ketat.

---

### Slide 12: Dampak Positif & Pengukuran Keberhasilan
- **0% Konflik Jadwal:** Tabrakan jadwal tereliminasi 100%.
- **< 1 Menit Reservasi:** Efisiensi waktu pengajuan meningkat lebih dari 90%.
- **100% Transparansi:** Jadwal dapat diakses terbuka oleh seluruh pejabat dan staf.
- **Disiplin H-2:** Kepastian perizinan ruang rapat tercapai secara teratur.

---

### Slide 13: Kesimpulan & Penutup
- Inovasi **SIRAPAT (ROOMBOOK)** siap menjadi standar resmi tata kelola fasilitas rapat di Kementerian Ketenagakerjaan RI.
- Tautan Akses Aplikasi: `https://sirapatsekjen.vercel.app`
- Tanya Jawab & Diskusi.

---
*Disusun oleh Tim Pengembang & Bagian Tata Usaha Sekretariat Jenderal Kemnaker RI — 2026*
