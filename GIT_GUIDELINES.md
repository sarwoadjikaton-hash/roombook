# Panduan Standar Git Commit & Version Control (ROOMBOOK)

Dokumen ini memuat standar penulisan pesan commit (*Conventional Commits*) dan alur kerja Git untuk menjaga riwayat kode tetap rapi, jelas, dan mudah dilacak.

---

## 1. Format Dasar Pesan Commit

```
<type>(<scope>): <deskripsi singkat dalam bahasa yang konsisten>

[optional body: penjelasan lebih detail mengenai latar belakang perubahan]

[optional footer: referensi issue / task ID]
```

---

## 2. Daftar Tipe Commit (`<type>`)

| Type | Arti & Penggunaan | Contoh |
|---|---|---|
| **`feat`** | Penambahan fitur baru untuk pengguna | `feat(display): add multi-photo carousel with fade transition` |
| **`fix`** | Perbaikan bug atau penanganan error | `fix(rooms): allow relative photo paths by changing input type to text` |
| **`refactor`** | Perapian kode tanpa mengubah fungsi bisnis | `refactor(backend): consolidate database scripts to scripts/ directory` |
| **`perf`** | Optimasi performa dan kecepatan muat | `perf(calendar): debounce polling and add response caching` |
| **`security`** | Penguatan keamanan, rate limiting, sanitasi | `security(server): add helmet headers and brute-force rate limiter` |
| **`test`** | Penambahan atau perbaikan skrip pengujian | `test(e2e): add automated booking approval and cleanup test suite` |
| **`docs`** | Pembaruan dokumentasi, PRD, atau manual book | `docs(prd): update PRD v2.0 and deployment instructions` |
| **`chore`** | Pemeliharaan dependensi atau konfigurasi build | `chore(deps): update package.json with utility scripts` |

---

## 3. Scope yang Digunakan (`<scope>`)
- `auth`: Login, reset password, bcrypt.
- `rooms`: Master data ruangan & fasilitas.
- `booking`: Alur pemesanan & reschedule.
- `approval`: Persetujuan/penolakan oleh PIC.
- `display`: Layar kiosk Smart TV & slideshow foto.
- `calendar`: Integrasi Google Calendar Service Account.
- `db`: PostgreSQL schema, migrasi, dan seed.

---

## 4. Contoh Nyata Riwayat Commit ROOMBOOK

```bash
feat(display): add landscape 16:9 layout and QR quick book for Ruang Transit
fix(rooms): resolve url validation issue for local room photo assets
security(api): implement express-rate-limit and XSS text sanitization
test(e2e): implement automated end-to-end integration test runner
docs(manual): add complete administrator and user guide in MANUAL_BOOK.md
refactor(scripts): add npm run db:reset and calendar:health commands
```
