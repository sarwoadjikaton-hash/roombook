# Design Document
## Sistem Booking Ruang Rapat (ROOMBOOK) — UI/UX & Visual Design System

| Attribute | Detail |
|---|---|
| **Versi** | 2.0 (High Fidelity Production) |
| **Tanggal Pembaruan** | 16 September 2026 |
| **Terkait** | PRD-Booking-Ruang-Rapat.md |

---

## 1. Filosofi & Karakter Desain
Tujuan visual ROOMBOOK adalah **Institusional, Modern, Tegas, dan Ergonomis**:
1. **Fungsionalitas Utama**: Informasi ketersediaan ruang, jam, dan penanggung jawab dapat dipahami dalam hitungan 1 detik, baik di desktop, smartphone, maupun Smart TV.
2. **Karakter Institusional Formal**: Perpaduan nuansa Emerald / Slate gelap dengan aksen Gold/Amber elegan untuk ruang representatif instansi.
3. **Hierarchy & Clarity**: Tipografi tegas dengan *tabular numerals* untuk jam real-time.
4. **Accessible Status Indicators**: Status visual didukung kombinasi warna, ikon, dan label teks (Colorblind Safe).
5. **Fluid Micro-Interactions**: Animasi transisi halus (150–250ms), backdrop-filter glassmorphism modern, dan carousel foto ruangan dinamis tanpa blocking UI.

---

## 2. Design Tokens & Visual Hierarchy

### 2.1 Palet Warna Resmi

| Token | Hex / HSL | Penggunaan |
|---|---|---|
| `--color-primary` | `#0B3D2E` / `#064E3B` | Tombol utama, Header navigasi, Brand aksen |
| `--color-primary-hover` | `#1F6E52` / `#047857` | State interaktif hover/fokus |
| `--color-accent-gold` | `#D97706` / `#F59E0B` | Badge VIP & Aksen Khusus Ruang Rapat Sekjen |
| `--color-bg-light` | `#F8FAFC` / `#F1F5F9` | Background dashboard desktop & mobile |
| `--color-display-dark` | `#0B0F14` / `#020617` | Background OLED Smart TV Display Kiosk |
| `--color-surface` | `#FFFFFF` | Kontainer Card, Modal, Panel form |
| `--color-border` | `#E2E8F0` / `#CBD5E1` | Garis batas, pemisah jadwal |
| `--color-success` | `#10B981` / `#059669` | Status *TERSEDIA* / *DISETUJUI* |
| `--color-danger` | `#EF4444` / `#DC2626` | Status *SEDANG DIGUNAKAN* / *DITOLAK* |
| `--color-warning` | `#F59E0B` / `#D97706` | Status *MENUNGGU PERSETUJUAN (PENDING)* |

---

### 2.2 Tipografi & Font Stacks

- **Primary Font**: `Plus Jakarta Sans` / `Inter`, sans-serif.
- **Clock & Numeric Display**: `JetBrains Mono` / `Inter Tight` dengan `font-variant-numeric: tabular-nums`.
- **Ukuran Teks Relatif**:
  - Desktop Header: `24px - 32px` (Bold)
  - Display TV Room Title: `36px - 48px` (Extra Bold)
  - Display TV Clock: `48px - 64px` (Mono Tabular)
  - Body & Form: `14px - 16px` (Regular / Medium)
  - Metadata & Badge: `12px - 13px` (SemiBold)

---

## 3. Komponen Antarmuka Khusus

### 3.1 Display Kiosk Ruangan (Smart TV Landscape 16:9)
- **Hero Image Carousel**: Menampilkan foto asli ruangan (mis. Ruang Rapat Sekjen 5 foto, Ruang VIP 2 foto, Ruang Transit 3 foto) dengan transisi fade halus otomatis.
- **Glassmorphism Status Card**: Panel status mengapung dengan `backdrop-blur-md bg-black/40` sehingga foto ruangan tetap terlihat indah di latar belakang.
- **Live Digital Clock & Pulse**: Jam digital sinkron per detik dengan indikator live pulse hijau.
- **Next Agenda Schedule**: Menampilkan daftar agenda rapat berikutnya dalam hari berjalan.
- **Mobile QR Quick Book**: Pojok kanan bawah menampilkan QR Code dinamis yang langsung membuka formulir booking kilat di smartphone pegawai (`/quick-book?room=...`).

### 3.2 Mobile Quick Book (`/quick-book`)
- **Desain Touch-First**: Diformat khusus untuk layar vertikal smartphone (360px - 430px).
- **Formulir Ringkas**: Input nama pemohon, unit kerja, jam mulai/selesai, dan judul rapat dengan validasi otomatis.
- **Feedback Langsung**: Menampilkan kartu status real-time apakah booking instan berhasil atau masuk antrian persetujuan PIC.

### 3.3 Dashboard Admin & Approval Center
- **Tabel Approval Cepat**: Tombol *Setujui* dan *Tolak* dalam 1 klik beserta modal catatan alasan.
- **Manajemen Ruangan**: Form upload URL foto (lokal `/rooms/...` maupun web), kapasitas, PIC approver, dan Google Calendar Resource ID.
- **Laporan & Ekspor**: Tampilan kalender bulanan, metrik okupansi ruangan, dan tombol ekspor data.
