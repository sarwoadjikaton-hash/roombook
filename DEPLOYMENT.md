# Panduan Deployment Produksi (Production Deployment Guide)
## Sistem Booking Ruang Rapat (ROOMBOOK)

Dokumen ini memuat panduan teknis langkah demi langkah untuk melakukan deployment aplikasi **ROOMBOOK** ke server produksi (VPS Linux Ubuntu/Debian, Docker, PM2, dan Nginx Reverse Proxy).

---

## 1. Prasyarat Server (Server Requirements)

- **OS**: Ubuntu 22.04 / 24.04 LTS atau Debian 12
- **Hardware Minimum**: 2 vCPU, 2 GB RAM, 20 GB SSD Storage
- **Software Stack**:
  - Node.js v20.x atau v22.x LTS & npm
  - PostgreSQL 15+ atau 16+
  - Nginx Web Server
  - PM2 Process Manager (`npm install -g pm2`)
  - Certbot (Let's Encrypt SSL)

---

## 2. Persiapan Database PostgreSQL

1. Masuk ke PostgreSQL shell:
   ```bash
   sudo -u postgres psql
   ```
2. Buat database dan user baru:
   ```sql
   CREATE DATABASE roombook_db;
   CREATE USER roombook_user WITH ENCRYPTED PASSWORD 'StrongPassword123!';
   GRANT ALL PRIVILEGES ON DATABASE roombook_db TO roombook_user;
   \c roombook_db
   GRANT ALL ON SCHEMA public TO roombook_user;
   \q
   ```

---

## 3. Konfigurasi Environment (`.env`)

Buat file `.env` di root direktori proyek:
```env
NODE_ENV=production
PORT=5000

# PostgreSQL Database
DATABASE_URL=postgresql://roombook_user:StrongPassword123!@localhost:5432/roombook_db
PGHOST=localhost
PGPORT=5432
PGDATABASE=roombook_db
PGUSER=roombook_user
PGPASSWORD=StrongPassword123!

# URL Publik Aplikasi
VITE_API_URL=https://roombook.instansi.go.id/api
```

---

## 4. Instalasi & Build Aplikasi

1. Clone repositori dan install dependencies:
   ```bash
   git clone <repo-url> /var/www/roombook
   cd /var/www/roombook
   npm install --production=false
   ```
2. Build frontend bundle:
   ```bash
   npm run build
   ```
3. Inisialisasi dan verifikasi koneksi Google Calendar:
   ```bash
   npm run calendar:health
   ```

---

## 5. Menjalankan Backend dengan PM2

1. Jalankan backend Express:
   ```bash
   pm2 start server/index.js --name "roombook-api" -i max
   ```
2. Atur PM2 agar otomatis berjalan saat server booting:
   ```bash
   pm2 save
   pm2 startup
   ```

---

## 6. Konfigurasi Nginx Reverse Proxy & SSL

1. Buat file konfigurasi virtual host Nginx:
   ```bash
   sudo nano /etc/nginx/sites-available/roombook
   ```
2. Salin konfigurasi berikut:
   ```nginx
   server {
       listen 80;
       server_name roombook.instansi.go.id;

       # Frontend Static Build
       location / {
           root /var/www/roombook/dist;
           index index.html;
           try_files $uri $uri/ /index.html;
       }

       # Backend REST API Proxy
       location /api/ {
           proxy_pass http://127.0.0.1:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       # Room Photos & Static Assets
       location /rooms/ {
           alias /var/www/roombook/public/rooms/;
           expires 30d;
           add_header Cache-Control "public, no-transform";
       }
   }
   ```
3. Aktifkan konfigurasi dan reload Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/roombook /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```
4. Pasang Sertifikat SSL Gratis (Let's Encrypt):
   ```bash
   sudo certbot --nginx -d roombook.instansi.go.id
   ```

---

## 7. Pengaturan Layar Smart TV Display Kiosk

Untuk TV Ruangan (Raspberry Pi / Android TV Box / Mini PC):
1. **Autostart Browser Fullscreen**:
   - Di Linux:
     ```bash
     chromium-browser --kiosk --noerrdialogs --disable-infobars --check-for-update-interval=31536000 https://roombook.instansi.go.id/display/ruang-sekjen
     ```
   - Di Windows:
     Jalankan script `scripts/kiosk-launch.bat ruang-sekjen`.
2. **TV Sleep & Wakeup Timer**:
   Atur HDMI CEC / TV on-timer pada pukul 07:00 dan off-timer pukul 18:00 WIB.

---

## 8. Pemeliharaan & Monitoring Rutin

- **Lihat Log Server**: `pm2 logs roombook-api`
- **Uji Integrasi E2E**: `npm run test:e2e`
- **Cek Status Google Calendar**: `npm run calendar:health`
- **Reset Pemesanan (Awal Tahun/Sesi)**: `npm run db:reset`
- **Backup Database Harian**:
  ```bash
  pg_dump -U roombook_user roombook_db > /backup/roombook_$(date +%Y%m%d).sql
  ```
