# Product Requirements Document (PRD)
## Sistem Booking Ruang Rapat Berbasis Website (ROOMBOOK)

| Attribute | Detail |
|---|---|
| **Nama Produk** | Meeting Room Booking System (ROOMBOOK) |
| **Versi Dokumen** | 2.0 (Final Architecture & Implementation) |
| **Tanggal Pembaruan** | 16 September 2026 |
| **Status** | Approved & Production Ready |
| **Target Lingkungan** | Instansi Pemerintah / Korporat (Web & Display Kiosk) |

---

## 1. Latar Belakang & Masalah
Sebelum digitalisasi, pemesanan ruang rapat dilakukan secara manual melalui formulir kertas, WhatsApp, atau buku agenda fisik. Kendala yang dihadapi:
- **Bentrok Jadwal (Double Booking)**: Terjadinya tumpang tindih waktu antar unit pemohon karena tidak adanya kalender terpusat.
- **Ketiadaan Status Real-time**: Pegawai tidak mengetahui apakah suatu ruangan sedang kosong atau terisi tanpa mendatangi lokasi fisik ruangan.
- **Proses Persetujuan Lambat**: Khususnya ruangan strategis (seperti Ruang Rapat Sekjen) yang memerlukan persetujuan berjenjang dari pejabat/PIC terkait.
- **Minim Jejak Audit**: Tidak ada rekam jejak historis pemakaian ruangan untuk evaluasi pemeliharaan, utilisasi fasilitas, dan pelaporan pimpinan.

Sistem **ROOMBOOK** dirancang sebagai solusi end-to-end berbasis web dengan integrasi **Google Calendar API** (Google Service Account), sinkronisasi basis data **PostgreSQL**, dan layar monitor **Display TV Kiosk** di depan masing-masing pintu ruangan.

---

## 2. Tujuan & Nilai Manfaat
1. **Single Source of Truth**: Satu sistem terpadu untuk mengecek ketersediaan dan memesan ruang rapat.
2. **Zero Conflict**: Pencegahan bentrok jadwal secara otomatis baik di level aplikasi maupun Google Calendar.
3. **Smart Display Kiosk**: Tampilan layar interaktif landscape di depan ruangan (menampilkan status *TERSEDIA* / *SEDANG DIGUNAKAN*, agenda aktif, countdown waktu, serta QR Code pemesanan cepat / Quick Book).
4. **Alur Persetujuan Fleksibel**:
   - **Ruang Rapat Sekjen**: Wajib Approval PIC / Superadmin sebelum kalender dijadwalkan.
   - **Ruang VIP**: Kebijakan approval adaptif (bisa diatur manual/otomatis).
   - **Ruang Transit**: Auto-approved / Instant booking untuk rapat koordinasi taktis.
5. **Pelaporan & Audit Log Lengkap**: Rekapitulasi pemakaian per unit, per rentang tanggal, dengan fitur ekspor cetak/PDF dan log audit keamanan.

---

## 3. Profil Pengguna & Peran (Role-Based Access Control)

| Role | Deskripsi | Hak Akses Utama |
|---|---|---|
| **Pemohon (Staf/Pegawai)** | Pegawai instansi yang mengajukan peminjaman | Membuat pemesanan baru, memantau status persetujuan, scan QR Quick Book, membatalkan booking miliknya, melihat kalender publik. |
| **Approver / PIC Ruangan** | Penanggung jawab ruangan (PIC Sekjen / VIP) | Menerima notifikasi persetujuan baru, menyetujui (*Approve*) atau menolak (*Reject*) pemesanan disertai catatan resmi. |
| **Superadmin / Pengelola** | Tim Bagian Rumah Tangga / Protokol / IT | Akses penuh ke Dashboard, Manajemen Ruangan & Fasilitas, Manajemen Admin/Approver, Integrasi Google Calendar, Audit Log, dan Laporan Pemakaian. |
| **Display Kiosk (Smart TV)** | Monitor digital di dinding depan setiap ruang rapat | Tampilan *Read-only* interaktif layar penuh (Landscape), carousel foto ruangan, countdown rapat, jadwal agenda harian, dan QR code pemesanan instan. |

---

## 4. Spesifikasi Master Ruang Rapat

| Ruangan | Kapasitas | Lokasi | Fasilitas Default | Kebijakan Approval | Google Calendar Resource |
|---|---|---|---|---|---|
| **Ruang Rapat Sekjen** | 30 Orang | Gedung A, Lantai 2 | TV Pintar, Konferensi Video, AC, WiFi, Proyektor, Papan Tulis, Pengeras Suara | **Wajib Approval** (PIC: Administrator Pengelola) | Terhubung (`7bdae51c...`) |
| **Ruang VIP** | 15 Orang | Gedung A, Lantai 1 | TV Pintar, AC, WiFi, Konferensi Video, Proyektor | **Wajib Approval** (PIC: Bagian Protokol) | Terhubung |
| **Ruang Transit** | 10 Orang | Gedung B, Lantai 2 | AC, WiFi, TV Pintar, Papan Tulis | **Auto-Approved / Instant** | Terhubung |

---

## 5. Arsitektur Teknis & Database

### 5.1 Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti, HTML5 QR Generator.
- **Backend API**: Node.js, Express, Google APIs Client Library (`googleapis`), PostgreSQL Client (`pg`), CORS, Helmet, Rate Limiter.
- **Database**: PostgreSQL (Relasional, ACID compliant dengan Foreign Keys, Enums, & Indexing waktu).
- **External Integration**: Google Calendar API v3 via Google Cloud Service Account (`id-booking-ruang-rapat@booking-ruang-rapat-508313.iam.gserviceaccount.com`).

### 5.2 Skema Database Relasional

```sql
-- ENUM Status Pemesanan
CREATE TYPE booking_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- Tabel Ruangan
CREATE TABLE rooms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    capacity INT NOT NULL,
    location VARCHAR(200) NOT NULL,
    description TEXT,
    image_url TEXT,
    photos TEXT[], -- Array path foto ruangan untuk display carousel
    facilities TEXT[],
    requires_approval BOOLEAN DEFAULT false,
    approver_name VARCHAR(100),
    approver_email VARCHAR(150),
    google_calendar_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Pemesanan (Bookings)
CREATE TABLE bookings (
    id VARCHAR(50) PRIMARY KEY,
    room_id VARCHAR(50) REFERENCES rooms(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    organizer_name VARCHAR(150) NOT NULL,
    organizer_email VARCHAR(150) NOT NULL,
    organizer_unit VARCHAR(150) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    attendees_count INT DEFAULT 1,
    description TEXT,
    status booking_status DEFAULT 'pending',
    google_event_id VARCHAR(255),
    approval_note TEXT,
    approved_by VARCHAR(150),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Notifikasi
CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'booking_request', 'approved', 'rejected', 'reminder'
    recipient_email VARCHAR(150),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Fasilitas Master
CREATE TABLE facilities (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true
);
```

---

## 6. Integrasi Google Calendar (Dual-Direction Sync)
1. **Pemesanan Baru (Status Pending)**: Disimpan di DB lokal PostgreSQL dan status notifikasi dikirimkan ke dashboard Admin/Approver. Event belum dibuat di Google Calendar agar tidak mengunci slot sebelum sah.
2. **Persetujuan (Status Approved)**:
   - Backend memanggil `calendar.events.insert` via Service Account.
   - Google Calendar Event ID disimpan ke kolom `google_event_id` pada PostgreSQL.
   - Judul event, waktu, ringkasan, dan PIC pemohon tercatat di deskripsi Google Calendar.
3. **Penolakan / Pembatalan (Rejected / Cancelled)**:
   - Backend memanggil `calendar.events.delete` menggunakan `google_event_id`.
   - Slot kalender Google langsung bersih dan terbuka kembali.
4. **Display Room Kiosk Sync**:
   - Display TV melakukan fetching data booking aktif dan menyinkronkan data secara real-time setiap 30 detik tanpa overload.

---

## 7. Metrik Kualitas & Non-Functional Requirements (NFR)
- **Keamanan**: Parameterized SQL query (100% anti-SQL Injection), sanitasi input, CORS terisolasi, Rate Limiting 100 req/menit per IP.
- **Performa Display**: Waktu muat Display TV < 1 detik, auto-reconnect WebSocket/Polling jika jaringan lokal terputus.
- **Ketersediaan**: Mendukung offline local storage cache saat koneksi internet eksternal terganggu.
- **Kepatuhan Privasi**: Informasi sensitif rapat pada Display TV dapat diatur (apakah menampilkan nama agenda penuh atau mode privasi ringkas).
