# BUKU PANDUAN PENGGUNAAN SISTEM (MANUAL BOOK)
## SISTEM PEMINJAMAN RUANG RAPAT — TU SEKJEN KEMNAKER (ROOMBOOK)

---

## DAFTAR ISI
1. [Gambaran Umum Sistem](#1-gambaran-umum-sistem)
2. [Spesifikasi & Cara Menjalankan Aplikasi](#2-spesifikasi--cara-menjalankan-aplikasi)
   - [2.1 Prasyarat Sistem](#21-prasyarat-sistem)
   - [2.2 Menjalankan Aplikasi](#22-menjalankan-aplikasi)
   - [2.3 Menghentikan / Mematikan Aplikasi](#23-menghentikan--mematikan-aplikasi)
   - [2.4 Akun Pengelola Bawaan (Default Login)](#24-akun-pengelola-bawaan-default-login)
3. [Panduan Pengguna / Pegawai (Layanan Mandiri)](#3-panduan-pengguna--pegawai-layanan-mandiri)
   - [3.1 Memeriksa Ketersediaan & Jadwal Ruangan](#31-memeriksa-ketersediaan--jadwal-ruangan)
   - [3.2 Mengajukan Peminjaman Ruangan](#32-mengajukan-peminjaman-ruangan)
   - [3.3 Fitur Pencarian Booking (Cari Peminjaman Saya)](#33-fitur-pencarian-booking-cari-peminjaman-saya)
   - [3.4 Pemesanan Cepat via HP (Pindai QR Code)](#34-pemesanan-cepat-via-hp-pindai-qr-code)
   - [3.5 Mengubah Jadwal & Membatalkan Peminjaman](#35-mengubah-jadwal--membatalkan-peminjaman)
4. [Panduan Layar TV Ruangan (Display Kiosk)](#4-panduan-layar-tv-ruangan-display-kiosk)
   - [4.1 Tampilan Header & Jam Realtime](#41-tampilan-header--jam-realtime)
   - [4.2 Status Ruangan Realtime](#42-status-ruangan-realtime)
   - [4.3 Pergantian Ruangan Otomatis (Ganti Otomatis 10 Detik)](#43-pergantian-ruangan-otomatis-ganti-otomatis-10-detik)
   - [4.4 QR Code Pemesanan Cepat](#44-qr-code-pemesanan-cepat)
5. [Panduan Pengelola / Administrator (Panel Pengelola)](#5-panduan-pengelola--administrator-panel-pengelola)
   - [5.1 Masuk ke Akun Pengelola](#51-masuk-ke-akun-pengelola)
   - [5.2 Manajemen Kata Sandi & Keamanan Akun](#52-manajemen-kata-sandi--keamanan-akun)
     - [A. Syarat & Kriteria Kata Sandi Baru](#a-syarat--kriteria-kata-sandi-baru)
     - [B. Bantuan Lupa Kata Sandi di Halaman Login](#b-bantuan-lupa-kata-sandi-di-halaman-login)
     - [C. Ubah Kata Sandi Mandiri (Panel Admin)](#c-ubah-kata-sandi-mandiri-panel-admin)
     - [D. Reset Kata Sandi Pengguna oleh Super Admin](#d-reset-kata-sandi-pengguna-oleh-super-admin)
   - [5.3 Memproses Persetujuan Peminjaman (Approval & Batas H-2)](#53-memproses-persetujuan-peminjaman-approval--batas-h-2)
   - [5.4 Manajemen Ruangan & Fasilitas](#54-manajemen-ruangan--fasilitas)
   - [5.5 Manajemen Akun Pengelola (Khusus Superadmin)](#55-manajemen-akun-pengelola-khusus-superadmin)
   - [5.6 Laporan & Cetak PDF Resmi](#56-laporan--cetak-pdf-resmi)
   - [5.7 Catatan Aktivitas Sistem (Audit Log)](#57-catatan-aktivitas-sistem-audit-log)
   - [5.8 Integrasi Kalender Digital (Google Calendar)](#58-integrasi-kalender-digital-google-calendar)
6. [Tanya Jawab & Penyelesaian Kendala (Troubleshooting)](#6-tanya-jawab--penyelesaian-kendala-troubleshooting)

---

## 1. GAMBARAN UMUM SISTEM

**Sistem Peminjaman Ruang Rapat TU SEKJEN Kemnaker (ROOMBOOK)** adalah platform digital terpadu untuk tata kelola penjadwalan, peminjaman, persetujuan, dan pemantauan ruang rapat di lingkungan Sekretariat Jenderal Kementerian Ketenagakerjaan Republik Indonesia.

### Fitur Utama:
- **Layanan Mandiri Tanpa Login:** Pegawai dapat langsung melihat ketersediaan jadwal, mencari riwayat peminjaman, dan mengajukan permohonan ruang rapat.
- **Pencarian Reservasi Terintegrasi:** Memudahkan pemohon melacak status permohonan menggunakan email pemohon dan kode reservasi (opsional).
- **Layar Informasi TV Ruangan (Display Kiosk):** Layar display di depan ruangan yang menampilkan status rapat realtime, agenda harian, dan QR Code untuk pemesanan cepat.
- **Alur Persetujuan Bertingkat (SOP H-2):** Setiap permohonan diverifikasi oleh Tim Pengelola TU SEKJEN dengan indikator urgensi waktu.
- **Pencegahan Jadwal Bentrok Otomatis:** Sistem secara cerdas memvalidasi slot waktu untuk mencegah bentrokan jadwal rapat.
- **Keamanan Akun & Validasi Password Ketat:** Dilengkapi fitur ubah sandi mandiri, lupa kata sandi, dan reset oleh Super Admin dengan standar keamanan tinggi.
- **Cetak Laporan Rapi & Ekspor Data:** Mencetak dokumen laporan rekapitulasi yang hanya memuat jadwal resmi (disetujui & selesai) dan ekspor ke format Excel/CSV.
- **Integrasi Kalender Digital (Google Calendar):** Terhubung dengan Google Calendar API melalui Service Account OAuth 2.0 untuk sinkronisasi jadwal 2-arah.

---

## 2. SPESIFIKASI & CARA MENJALANKAN APLIKASI

### 2.1 Prasyarat Sistem
- **Sistem Operasi:** Windows 10 / 11, Linux, atau macOS.
- **Node.js:** Versi 18.0.0 atau lebih baru.
- **Web Browser:** Google Chrome, Microsoft Edge, Mozilla Firefox, atau Safari versi terbaru.

---

### 2.2 Menjalankan Aplikasi

Aplikasi terdiri dari dua layanan utama:

#### Langkah 1: Jalankan Server Backend (Port 5000)
Buka terminal (PowerShell / Command Prompt) pada folder proyek, lalu jalankan:
```powershell
node server/index.js
```
*Keterangan: Server backend REST API aktif di `http://localhost:5000`.*

#### Langkah 2: Jalankan Tampilan Web Frontend (Port 3000 / 3001)
Buka jendela terminal baru pada direktori yang sama, lalu jalankan:
```powershell
npm run dev
```
*Keterangan: Antarmuka web frontend aktif di `http://localhost:3000`.*

#### Langkah 3: Akses Melalui Web Browser
Buka browser dan akses alamat berikut:
- **Halaman Beranda Publik:** `http://localhost:3000`
- **Jadwal Ruangan:** `http://localhost:3000/booking`
- **Layar TV Ruangan (Display Kiosk):** `http://localhost:3000/display/ruang-sekjen`
- **Halaman Masuk Pengelola:** `http://localhost:3000/login`

---

### 2.3 Menghentikan / Mematikan Aplikasi

1. Buka jendela terminal tempat server/frontend berjalan.
2. Tekan kombinasi tombol:
   ```
   Ctrl + C
   ```
3. Jika muncul konfirmasi `Terminate batch job (Y/N)?`, ketik **`Y`** lalu tekan **Enter**.
4. Lakukan langkah yang sama pada terminal backend dan frontend.

---

### 2.4 Akun Pengelola Bawaan (Default Login)

| Peran (Role) | Nama Pengguna | Alamat Email | Kata Sandi Awal |
| :--- | :--- | :--- | :--- |
| **Superadmin** | Siti Rahmawati | `superadmin@gmail.com` | `admin123` |
| **Pengelola Ruangan** | Budi Santoso | `admin.mrbs@gmail.com` | `admin123` |
| **Pengelola Operasional** | Ahmad Fauzi | `ahmad.fauzi@gmail.com` | `admin123` |

> *Catatan: Untuk keamanan sistem, pengelola sangat disarankan memperbarui kata sandi setelah pertama kali masuk.*

---

## 3. PANDUAN PENGGUNA / PEGAWAI (LAYANAN MANDIRI)

### 3.1 Memeriksa Ketersediaan & Jadwal Ruangan
1. Buka halaman utama aplikasi di browser (`http://localhost:3000`).
2. Pada bagian atas, Anda dapat melihat status ketersediaan ruangan:
   - **Ruang Rapat Sekjen** (Kapasitas 30 orang)
   - **Ruang VIP** (Kapasitas 12 orang)
   - **Ruang Transit** (Kapasitas 8 orang)
3. Gunakan filter tanggal untuk memeriksa jadwal hari ini atau tanggal mendatang pada diagram garis waktu (*timeline*).

---

### 3.2 Mengajukan Peminjaman Ruangan
1. Klik tombol **"Pesan Ruangan"** di navigasi atas/samping, atau klik slot waktu kosong pada tabel jadwal.
2. Pada formulir yang muncul, lengkapi data permohonan:
   - **Pilih Ruangan:** Pilih Ruang Rapat Sekjen, Ruang VIP, atau Ruang Transit.
   - **Data Pemohon:** Masukkan Nama Lengkap, Email (`@gmail.com`), dan Unit Kerja/Bagian.
   - **Agenda Kegiatan:** Tuliskan judul agenda rapat (contoh: *Rapat Koordinasi Anggaran & Evaluasi Kinerja*).
   - **Tanggal & Waktu:** Tentukan tanggal, jam mulai, dan jam selesai rapat.
   - **Jumlah Peserta:** Masukkan estimasi peserta (tidak boleh melebihi kapasitas ruangan).
   - **Daftar Email Peserta (Opsional):** Tambahkan alamat email rekan kerja yang diundang.
   - **Deskripsi / Catatan (Opsional):** Kebutuhan khusus fasilitas atau arahan pimpinan.
3. Klik tombol **"Ajukan Peminjaman"**.
4. **Pemberitahuan Berhasil & Google Calendar:**
   - Muncul jendela konfirmasi dengan **Nomor Reservasi** (contoh: `#bk-123456`).
   - Terdapat tombol **"Tambahkan ke Google Kalender Saya"** untuk menyimpan agenda langsung ke Google Calendar pemohon hanya dengan 1 klik.
   - Status awal permohonan adalah **"Menunggu Persetujuan Tim TU SEKJEN (Batas H-2)"**.

---

### 3.3 Fitur Pencarian Booking (Cari Peminjaman Saya)
Pegawai dapat mencari dan melacak seluruh riwayat peminjaman mereka:
1. Klik tombol **"Cari Peminjaman"** di navigasi utama atau menu samping.
2. Pada modal pencarian yang terbuka:
   - **Email Pemohon (Wajib):** Masukkan alamat email yang digunakan saat mengajukan peminjaman (contoh: `budi.santoso@gmail.com`).
   - **Kode Reservasi (Opsional):** Masukkan kode booking (contoh: `bk-001` atau `bk-123456`) jika ingin mencari reservasi spesifik.
3. Klik tombol **"Cari Jadwal Peminjaman"**.
4. Sistem akan menampilkan daftar seluruh jadwal permohonan Anda lengkap dengan status:
   - 🟢 **Disetujui (`confirmed`)**
   - 🟡 **Menunggu Persetujuan (`pending`)**
   - 🔴 **Ditolak (`rejected`)**
   - ⚪ **Dibatalkan (`cancelled`)**

---

### 3.4 Pemesanan Cepat via HP (Pindai QR Code)
1. Datangi layar TV display di depan pintu ruang rapat.
2. Buka kamera ponsel pintar (HP) Anda dan arahkan ke **QR Code** di layar.
3. Buka tautan pemesanan yang muncul di layar HP.
4. Pilih durasi penggunaan (15, 30, 45, atau 60 menit), masukkan agenda rapat, lalu klik **"Pesan Ruangan Sekarang"**.
5. Status ruangan di layar TV akan otomatis berubah menjadi **"Sedang Digunakan"**.

---

### 3.5 Mengubah Jadwal & Membatalkan Peminjaman
1. Pada kartu rapat yang ingin diubah atau dibatalkan, klik kartu untuk membuka **Rincian Peminjaman Ruang**.
2. Klik tombol **"Ubah Jadwal"** atau **"Batalkan Peminjaman"**.
3. Untuk keamanan, masukkan **Email Pemohon** yang sesuai, lalu klik **"Verifikasi"**.
4. Setelah terverifikasi, pilih jadwal pengganti atau konfirmasikan pembatalan.

---

## 4. PANDUAN LAYAR TV RUANGAN (DISPLAY KIOSK)

Halaman ini didesain khusus untuk monitor TV digital di depan ruang rapat (`/display/ruang-sekjen`).

### 4.1 Tampilan Header & Jam Realtime
- **Kiri:** Logo Kementerian Ketenagakerjaan dan identitas unit `TU SEKJEN`.
- **Tengah:** Judul `KALENDER RUANG RAPAT`, hari, tanggal, dan jam digital berdetik *realtime* WIB.
- **Kanan:** Logo BerAKHLAK dan slogan `#banggamelayanibangsa`.

### 4.2 Status Ruangan Realtime
- 🔵 **RUANGAN TERSEDIA (Biru):** Ruangan kosong dan siap digunakan.
- 🟡 **SEGERA DIMULAI (Kuning):** 15 menit menjelang waktu rapat. Peserta dipersilakan bersiap.
- 🔴 **SEDANG DIGUNAKAN (Merah):** Rapat sedang berlangsung dengan judul rapat, nama pemohon, dan sisa waktu.

### 4.3 Pergantian Ruangan Otomatis (Ganti Otomatis 10 Detik)
Layar TV akan otomatis berpindah menampilkan informasi ruangan berikutnya setiap **10 detik** disertai bilah progres (*countdown bar*). Pengguna juga dapat memilih tab ruangan secara manual.

### 4.4 QR Code Pemesanan Cepat
Menampilkan QR Code dinamis yang langsung membuka formulir pemesanan cepat pada HP pengguna tanpa perlu mengetik alamat URL.

---

## 5. PANDUAN PENGELOLA / ADMINISTRATOR (PANEL PENGELOLA)

### 5.1 Masuk ke Akun Pengelola
1. Buka halaman masuk melalui tautan **"Masuk Pengelola"** di pojok kanan atas atau akses `http://localhost:3000/login`.
2. Masukkan alamat email terdaftar dan kata sandi.
3. Klik tombol **"Masuk ke Panel Pengelola"**.

---

### 5.2 Manajemen Kata Sandi & Keamanan Akun

#### A. Syarat & Kriteria Kata Sandi Baru
Untuk menjaga keamanan data dan akun sistem, setiap pembuatan dan pembaruan kata sandi wajib memenuhi 3 kriteria:
1. 📏 **Minimal 8 Karakter**
2. 🔠 **Mengandung Huruf Besar / Kapital (Capslock A-Z)**
3. 🔢 **Mengandung Angka Numerik (0-9)**

Setiap formulir pembuatan atau pengubahan kata sandi dilengkapi **Live Checklist Syarat Keamanan** yang otomatis tercentang hijau saat kriteria terpenuhi.

#### B. Bantuan Lupa Kata Sandi di Halaman Login
Jika pengelola lupa kata sandinya:
1. Pada halaman login (`/login`), klik tautan **"Lupa kata sandi?"** di samping label Kata Sandi.
2. Masukkan alamat email akun pengelola yang terdaftar.
3. Masukkan kata sandi baru yang memenuhi kriteria keamanan dan ulangi konfirmasi kata sandi baru.
4. Klik **"Atur Ulang Sandi"**.
5. Setelah berhasil, klik tombol **"Gunakan untuk Masuk Sekarang"** untuk langsung mengisi kredensial baru ke formulir login.

#### C. Ubah Kata Sandi Mandiri (Panel Admin)
Admin atau Superadmin yang sedang aktif dapat mengganti kata sandi kapan saja:
1. **Akses:**
   - Klik badge profil pengelola di pojok kanan atas **Header**, ATAU
   - Klik ikon kunci (`KeyRound`) di sebelah tombol keluar pada **Sidebar Bawah**.
2. Masukkan kata sandi saat ini.
3. Masukkan kata sandi baru (min. 8 karakter, huruf kapital, dan angka) serta ketik ulang konfirmasi sandi.
4. Klik **"Simpan Kata Sandi"**.

#### D. Reset Kata Sandi Pengguna oleh Super Admin
Super Admin memiliki wewenang mereset kata sandi akun admin lain:
1. Buka menu **"Manajemen Pengelola"** (`/admin/users`).
2. Pada tabel akun pengelola, klik tombol **Reset Kata Sandi** (ikon kunci kuning) pada baris akun yang dituju.
3. Masukkan kata sandi baru yang memenuhi syarat keamanan dan ketik ulang konfirmasi.
4. Klik **"Simpan Kata Sandi Baru"**.

---

### 5.3 Memproses Persetujuan Peminjaman (Approval & Batas H-2)
1. Buka menu **"Persetujuan Rapat"** (`/admin/approvals`).
2. Sesuai SOP, batas persetujuan pengelola adalah **maksimal H-2 (48 jam sebelum pelaksanaan rapat)**.
3. **Indikator Tingkat Urgensi:**
   - 🚨 **Sangat Mendesak (< H-2):** Warna merah menyala dengan denyut (*pulse*) karena waktu tersisa kurang dari 48 jam.
   - ⚠️ **Mendekati Batas (H-2 s/d H-3):** Warna kuning/oranye untuk jadwal tersisa 48–72 jam.
   - ⏳ **Waktu Aman (> H-3):** Warna hijau/biru untuk jadwal lebih dari 3 hari ke depan.
4. **Tindakan Persetujuan:**
   - **Menyetujui:** Klik tombol hijau **"Setujui Permohonan"**. Status berubah menjadi disetujui dan disinkronkan ke kalender ruangan.
   - **Menolak:** Klik tombol merah **"Tolak"**, tuliskan alasan penolakan, lalu klik **"Konfirmasi Tolak Permohonan"**.

---

### 5.4 Manajemen Ruangan & Fasilitas
Buka menu **"Kelola Ruangan"** (`/admin/rooms`):
- **Tambah Ruangan:** Klik **"Tambah Ruangan"**, lengkapi nama ruangan, kapasitas, fasilitas, deskripsi, approver email, dan Google Calendar ID.
- **Ubah / Hapus Ruangan:** Klik tombol Ubah (pensil) atau Hapus (tong sampah) pada kartu ruangan.
- **Kelola Fasilitas Kustom:** Tambahkan jenis fasilitas baru (contoh: *Smart Board*, *Microphone Wireless*) agar dapat dipilih pada semua ruangan.

---

### 5.5 Manajemen Akun Pengelola (Khusus Superadmin)
Buka menu **"Manajemen Pengelola"** (`/admin/users`):
- **Tambah Admin Baru:** Klik **"Tambah Pengelola"**, lengkapi nama, email, unit kerja, hak akses (*Admin* atau *Superadmin*), serta kata sandi akun (min. 8 karakter, huruf besar, dan angka).
- **Edit & Hapus Admin:** Perbarui identitas admin atau hapus akun yang sudah tidak aktif.
- **Reset Kata Sandi:** Tombol ikon kunci untuk mereset kata sandi akun pengguna.

---

### 5.6 Laporan & Cetak PDF Resmi
Buka menu **"Laporan"** (`/admin/reports`):
- **Data Laporan Resmi:** Hanya jadwal yang berstatus **Disetujui (`confirmed`)** dan **Selesai (`completed`)** yang disertakan dalam laporan rekapitulasi.
- **Cetak / Simpan Dokumen PDF:** Klik tombol **"Cetak PDF"** untuk mencetak rekapitulasi data tabel yang bersih, rapi, dan profesional tanpa terpotong atau terganggu elemen navigasi web.
- **Ekspor CSV/Excel:** Unduh seluruh riwayat jadwal dan data statistik utilisasi per ruangan.

---

### 5.7 Catatan Aktivitas Sistem (Audit Log)
Buka menu **"Catatan Aktivitas"** (`/admin/audit`):
- Merekam seluruh jejak digital sistem (pengajuan rapat, persetujuan, penolakan, pembatalan, pembaruan kata sandi, dan sinkronisasi).
- Dilengkapi fitur pencarian nama aktor dan filter jenis aksi.

---

### 5.8 Integrasi Kalender Digital (Google Calendar)
Buka menu **"Integrasi Kalender"** (`/admin/google-sync`):
- Memantau status koneksi Google Service Account OAuth 2.0.
- Klik tombol **"Uji Koneksi Kalender"** untuk menguji sinkronisasi dengan Google Calendar API v3.

---

## 6. TANYA JAWAB & PENYELESAIAN KENDALA (TROUBLESHOOTING)

### Q1: Layar menampilkan "Koneksi Backend Terputus"?
**Solusi:** Pastikan server backend `node server/index.js` tetap aktif di terminal port `5000`. Jika tertutup, jalankan kembali perintah tersebut.

### Q2: Port 3000 atau 5000 bentrok / sudah terpakai?
**Solusi:** Buka PowerShell dan jalankan perintah pembersihan port berikut:
```powershell
# Matikan port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force

# Matikan port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Q3: Bagaimana cara mengembalikan data simulasi ke kondisi awal?
**Solusi:** Masuk ke akun pengelola, pada sidebar bawah klik tombol ikon putar balik (**"Kembalikan Data Awal"**).

---

**Sekretariat Jenderal Kementerian Ketenagakerjaan Republik Indonesia**  
*Bagian Tata Usaha & Pengelolaan Fasilitas Ruang Rapat*  
*ROOMBOOK — 2026*
