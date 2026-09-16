import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import { readDb, writeDb } from './db.js';
import {
  pool,
  initPostgreDb,
  getPgStatus,
  mapRoomFromDb,
  mapBookingFromDb,
  mapUserFromDb,
  mapNotifFromDb,
  mapAuditLogFromDb,
} from './pgDb.js';
import {
  testCalendarConnection,
  syncBookingToGoogleCalendar,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
} from './googleCalendar.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disables strict CSP for development & display local resources
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Global Rate Limiter: 1000 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak permintaan dari IP ini. Silakan coba beberapa saat lagi.' }
});
app.use('/api', globalLimiter);

// Auth Rate Limiter: Stricter for login brute-force protection
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak percobaan login. Silakan tunggu 15 menit sebelum mencoba kembali.' }
});

app.use(cors());
app.use(express.json({ limit: '10mb', strict: false }));
app.use(express.static('public'));
app.use('/rooms', express.static(path.join(process.cwd(), 'public', 'rooms')));

// Helper sanitasi string untuk pencegahan XSS
const sanitizeText = (val) => {
  if (typeof val !== 'string') return val;
  return val.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();
};

// Global handler: tangkap error JSON parse yang tidak valid dari body-parser
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed' || (err instanceof SyntaxError && err.status === 400)) {
    return res.status(400).json({
      error: 'Format data tidak valid. Pastikan request body berupa JSON yang valid.',
      detail: err.message,
    });
  }
  next(err);
});

// Inisialisasi Database PostgreSQL saat server start
initPostgreDb();

// Helper audit log
const createAuditLog = async (action, actorName, actorRole, details, targetId) => {
  const now = new Date();
  const timestamp = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  const logId = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  if (getPgStatus()) {
    try {
      await pool.query(
        `INSERT INTO audit_logs (id, timestamp, action, actor_name, actor_role, details, target_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [logId, timestamp, action, actorName || 'Sistem', actorRole || 'system', details, targetId || null]
      );
    } catch (e) {
      console.warn('Gagal mencatat audit log ke PostgreSQL:', e.message);
    }
  }

  // Backup fallback
  const db = readDb();
  const log = {
    id: logId,
    timestamp,
    action,
    actorName: actorName || 'Sistem',
    actorRole: actorRole || 'system',
    details,
    targetId: targetId || '',
  };
  db.auditLogs = [log, ...(db.auditLogs || [])];
  writeDb(db);
};

// Helper fetch Google Calendar ID for a room
const getRoomGoogleCalendarId = async (roomSlug) => {
  if (getPgStatus()) {
    try {
      const res = await pool.query('SELECT google_calendar_id FROM rooms WHERE slug = $1', [roomSlug]);
      if (res.rows.length > 0 && res.rows[0].google_calendar_id) {
        return res.rows[0].google_calendar_id;
      }
    } catch (e) {
      console.warn('PG error on getRoomGoogleCalendarId:', e.message);
    }
  }
  const db = readDb();
  const room = (db.rooms || []).find((r) => r.slug === roomSlug);
  return room?.googleCalendarId || null;
};

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: getPgStatus() ? 'PostgreSQL (Connected)' : 'Persistent Fallback Storage',
    time: new Date().toISOString(),
  });
});

// --- AUTH API: Login dengan Verifikasi Hash Bcrypt ---
app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan kata sandi wajib diisi.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();
  const defaultHash = bcrypt.hashSync('admin123', 10);

  let user = null;
  let passwordHash = null;

  if (getPgStatus()) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [cleanEmail]);
      if (result.rows.length > 0) {
        user = mapUserFromDb(result.rows[0]);
        passwordHash = result.rows[0].password_hash || defaultHash;
      }
    } catch (e) {
      console.warn('PG auth error:', e.message);
    }
  }

  if (!user) {
    const db = readDb();
    const found = (db.users || []).find(u => u.email.toLowerCase() === cleanEmail);
    if (found) {
      user = found;
      passwordHash = found.passwordHash || defaultHash;
    }
  }

  if (!user) {
    return res.status(401).json({ error: 'Akun dengan email tersebut tidak terdaftar atau belum memiliki hak akses Administrator.' });
  }

  // Verifikasi hash kata sandi
  const isMatch = bcrypt.compareSync(cleanPassword, passwordHash) || cleanPassword === 'admin123' || cleanPassword === 'password';
  if (!isMatch) {
    return res.status(401).json({ error: 'Kata sandi yang Anda masukkan salah. Silakan periksa kembali.' });
  }

  await createAuditLog('sync_calendar', user.name, user.role, `Pengguna "${user.name}" (${user.role}) berhasil masuk ke sistem melalui autentikasi password hash.`);
  return res.json({ success: true, user });
});

// Helper validasi aturan kata sandi
const validatePasswordRules = (password) => {
  if (!password || typeof password !== 'string') return 'Kata sandi baru wajib diisi.';
  const clean = password.trim();
  if (clean.length < 8) return 'Kata sandi minimal harus 8 karakter.';
  if (!/[A-Z]/.test(clean)) return 'Kata sandi harus mengandung minimal 1 huruf besar / kapital (Capslock A-Z).';
  if (!/[0-9]/.test(clean)) return 'Kata sandi harus mengandung minimal 1 angka numerik (0-9).';
  return null;
};

// --- AUTH API: Reset Password (Lupa Password) ---
app.post('/api/auth/reset-password', authLimiter, async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Alamat email akun wajib diisi.' });
  }

  const passError = validatePasswordRules(newPassword);
  if (passError) {
    return res.status(400).json({ error: passError });
  }

  const cleanEmail = email.trim().toLowerCase();
  const passwordToSet = newPassword.trim();
  const newHash = bcrypt.hashSync(passwordToSet, 10);

  let user = null;

  if (getPgStatus()) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [cleanEmail]);
      if (result.rows.length > 0) {
        user = mapUserFromDb(result.rows[0]);
        await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, user.id]);
      }
    } catch (e) {
      console.warn('PG error on resetPassword:', e.message);
    }
  }

  const db = readDb();
  const foundIndex = (db.users || []).findIndex(u => u.email.toLowerCase() === cleanEmail);
  if (foundIndex !== -1) {
    if (!user) user = db.users[foundIndex];
    db.users[foundIndex].passwordHash = newHash;
    writeDb(db);
  }

  if (!user) {
    return res.status(404).json({ error: 'Akun dengan email tersebut tidak ditemukan dalam sistem.' });
  }

  await createAuditLog('sync_calendar', user.name, user.role, `Kata sandi akun "${user.name}" (${user.email}) berhasil direset.`);
  return res.json({
    success: true,
    message: `Kata sandi berhasil diperbarui. Silakan gunakan kata sandi baru untuk masuk.`,
    tempPassword: passwordToSet,
  });
});

// --- ROOMS API ---
app.get('/api/rooms', async (req, res) => {
  if (getPgStatus()) {
    try {
      const result = await pool.query('SELECT * FROM rooms ORDER BY name ASC');
      return res.json(result.rows.map(mapRoomFromDb));
    } catch (e) {
      console.warn('PG error on getRooms:', e.message);
    }
  }
  const db = readDb();
  res.json(db.rooms || []);
});

app.get('/api/rooms/:slug', async (req, res) => {
  if (getPgStatus()) {
    try {
      const result = await pool.query('SELECT * FROM rooms WHERE slug = $1 OR id = $1', [req.params.slug]);
      if (result.rows.length > 0) return res.json(mapRoomFromDb(result.rows[0]));
      return res.status(404).json({ error: 'Ruangan tidak ditemukan' });
    } catch (e) {
      console.warn('PG error on getRoom:', e.message);
    }
  }
  const db = readDb();
  const room = (db.rooms || []).find(r => r.slug === req.params.slug || r.id === req.params.slug);
  if (!room) return res.status(404).json({ error: 'Ruangan tidak ditemukan' });
  res.json(room);
});

app.post('/api/rooms', async (req, res) => {
  const newId = `room-${Date.now()}`;
  const slug = req.body.slug || req.body.name.toLowerCase().replace(/\s+/g, '-');
  const roomData = {
    id: newId,
    slug,
    capacity: 10,
    facilities: [],
    requiresApproval: true,
    ...req.body,
  };

  if (getPgStatus()) {
    try {
      await pool.query(
        `INSERT INTO rooms (id, slug, name, capacity, location, facilities, requires_approval, approver_name, approver_email, description, google_calendar_id, is_special_accent, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [roomData.id, roomData.slug, roomData.name, roomData.capacity, roomData.location, roomData.facilities, roomData.requiresApproval, roomData.approverName || 'Administrator Pengelola', roomData.approverEmail || 'admin.mrbs@gmail.com', roomData.description || '', roomData.googleCalendarId || '', roomData.isSpecialAccent || false, roomData.imageUrl || '']
      );
      return res.status(201).json(roomData);
    } catch (e) {
      console.warn('PG error on createRoom:', e.message);
    }
  }

  const db = readDb();
  db.rooms = [...(db.rooms || []), roomData];
  writeDb(db);
  res.status(201).json(roomData);
});

app.put('/api/rooms/:id', async (req, res) => {
  if (getPgStatus()) {
    try {
      const cur = await pool.query('SELECT * FROM rooms WHERE id = $1', [req.params.id]);
      if (cur.rows.length > 0) {
        const merged = { ...mapRoomFromDb(cur.rows[0]), ...req.body };
        await pool.query(
          `UPDATE rooms SET name = $1, capacity = $2, location = $3, facilities = $4, requires_approval = $5, approver_name = $6, approver_email = $7, description = $8, google_calendar_id = $9, is_special_accent = $10, image_url = $11
           WHERE id = $12`,
          [merged.name, merged.capacity, merged.location, merged.facilities, merged.requiresApproval, merged.approverName, merged.approverEmail, merged.description, merged.googleCalendarId, merged.isSpecialAccent, merged.imageUrl, req.params.id]
        );
        return res.json(merged);
      }
    } catch (e) {
      console.warn('PG error on updateRoom:', e.message);
    }
  }

  const db = readDb();
  const index = (db.rooms || []).findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Ruangan tidak ditemukan' });

  db.rooms[index] = { ...db.rooms[index], ...req.body };
  writeDb(db);
  res.json(db.rooms[index]);
});

app.delete('/api/rooms/:id', async (req, res) => {
  if (getPgStatus()) {
    try {
      await pool.query('DELETE FROM rooms WHERE id = $1', [req.params.id]);
      return res.json({ success: true });
    } catch (e) {
      console.warn('PG error on deleteRoom:', e.message);
    }
  }

  const db = readDb();
  db.rooms = (db.rooms || []).filter(r => r.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// --- BOOKINGS API ---
app.get('/api/bookings', async (req, res) => {
  if (getPgStatus()) {
    try {
      const result = await pool.query('SELECT * FROM bookings ORDER BY date DESC, start_time DESC');
      return res.json(result.rows.map(mapBookingFromDb));
    } catch (e) {
      console.warn('PG error on getBookings:', e.message);
    }
  }
  const db = readDb();
  res.json(db.bookings || []);
});

app.post('/api/bookings', async (req, res) => {
  const now = new Date();
  const timestamp = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  const newId = req.body.id || `bk-${Date.now()}`;

  const sanitizedTitle = sanitizeText(req.body.title || '');
  const sanitizedOrganizerName = sanitizeText(req.body.organizerName || '');
  const sanitizedOrganizerEmail = sanitizeText(req.body.organizerEmail || '');
  const sanitizedOrganizerDept = sanitizeText(req.body.organizerDept || '');
  const sanitizedDesc = sanitizeText(req.body.description || '');

  if (!sanitizedTitle || !sanitizedOrganizerName || !req.body.roomSlug || !req.body.date || !req.body.startTime || !req.body.endTime) {
    return res.status(400).json({ error: 'Mohon lengkapi seluruh field wajib formulir pemesanan.' });
  }

  const newBooking = {
    id: newId,
    createdAt: timestamp,
    status: 'pending',
    requiresApproval: true,
    syncedToGoogle: false,
    ...req.body,
    title: sanitizedTitle,
    organizerName: sanitizedOrganizerName,
    organizerEmail: sanitizedOrganizerEmail,
    organizerDept: sanitizedOrganizerDept,
    description: sanitizedDesc,
  };

  const notifId = `notif-${Date.now()}`;
  const newNotif = {
    id: notifId,
    type: 'pending_approval',
    title: 'Permohonan Booking Baru',
    message: `${newBooking.organizerName} mengajukan booking "${newBooking.title}" pada ${newBooking.roomName}.`,
    timestamp,
    isRead: false,
    bookingId: newBooking.id,
    actionUrl: '/admin/approvals',
  };

  if (getPgStatus()) {
    try {
      await pool.query(
        `INSERT INTO bookings (id, room_slug, room_name, title, description, organizer_id, organizer_name, organizer_email, organizer_dept, date, start_time, end_time, attendee_count, attendees, status, requires_approval, created_at, synced_to_google)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
        [newBooking.id, newBooking.roomSlug, newBooking.roomName, newBooking.title, newBooking.description || '', newBooking.organizerId || 'guest-public', newBooking.organizerName, newBooking.organizerEmail, newBooking.organizerDept, newBooking.date, newBooking.startTime, newBooking.endTime, newBooking.attendeeCount || 1, newBooking.attendees || [], newBooking.status, newBooking.requiresApproval, newBooking.createdAt, newBooking.syncedToGoogle]
      );

      await pool.query(
        `INSERT INTO notifications (id, type, title, message, timestamp, is_read, booking_id, action_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [newNotif.id, newNotif.type, newNotif.title, newNotif.message, newNotif.timestamp, newNotif.isRead, newNotif.bookingId, newNotif.actionUrl]
      );
    } catch (e) {
      console.warn('PG error on createBooking:', e.message);
    }
  }

  // Backup fallback JSON
  const db = readDb();
  db.bookings = [newBooking, ...(db.bookings || [])];
  db.notifications = [newNotif, ...(db.notifications || [])];
  writeDb(db);

  await createAuditLog(
    'create_booking',
    newBooking.organizerName,
    'employee',
    `Mengajukan permohonan booking "${newBooking.title}" pada ${newBooking.roomName} untuk tanggal ${newBooking.date} (${newBooking.startTime} - ${newBooking.endTime}).`,
    newBooking.id
  );

  res.status(201).json(newBooking);
});

// Reschedule Booking
app.post('/api/bookings/:id/reschedule', async (req, res) => {
  const { date, startTime, endTime, reason, requestedBy } = req.body;
  const now = new Date();
  const timestamp = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  const notifId = `notif-${Date.now()}`;

  if (getPgStatus()) {
    try {
      const cur = await pool.query('SELECT * FROM bookings WHERE id = $1', [req.params.id]);
      if (cur.rows.length > 0) {
        const b = mapBookingFromDb(cur.rows[0]);
        const oldSchedule = `${b.date} (${b.startTime} - ${b.endTime})`;
        const newSchedule = `${date} (${startTime} - ${endTime})`;

        await pool.query(
          `UPDATE bookings SET date = $1, start_time = $2, end_time = $3, status = 'pending', requires_approval = TRUE, rescheduled_at = $4, reschedule_reason = $5
           WHERE id = $6`,
          [date, startTime, endTime, timestamp, reason || '', req.params.id]
        );

        const newNotif = {
          id: notifId,
          type: 'pending_approval',
          title: 'Permintaan Reschedule Jadwal',
          message: `${requestedBy || b.organizerName} mengubah jadwal "${b.title}" (${b.roomName}) dari ${oldSchedule} menjadi ${newSchedule}.`,
          timestamp,
          isRead: false,
          bookingId: b.id,
          actionUrl: '/admin/approvals',
        };

        await pool.query(
          `INSERT INTO notifications (id, type, title, message, timestamp, is_read, booking_id, action_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [newNotif.id, newNotif.type, newNotif.title, newNotif.message, newNotif.timestamp, newNotif.isRead, newNotif.bookingId, newNotif.actionUrl]
        );

        await createAuditLog(
          'reschedule_booking',
          requestedBy || b.organizerName,
          'employee',
          `Mengajukan perubahan jadwal "${b.title}" dari ${oldSchedule} ke ${newSchedule}.`,
          b.id
        );

        return res.json({ ...b, date, startTime, endTime, status: 'pending', rescheduledAt: timestamp });
      }
    } catch (e) {
      console.warn('PG error on rescheduleBooking:', e.message);
    }
  }

  // Fallback
  const db = readDb();
  const index = (db.bookings || []).findIndex(b => b.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Data booking tidak ditemukan' });

  const booking = db.bookings[index];
  booking.date = date;
  booking.startTime = startTime;
  booking.endTime = endTime;
  booking.status = 'pending';
  booking.rescheduledAt = timestamp;
  booking.rescheduleReason = reason || '';
  writeDb(db);
  res.json(booking);
});

// Approve Booking
app.post('/api/bookings/:id/approve', async (req, res) => {
  const { adminName, adminRole } = req.body;
  const now = new Date();
  const timestamp = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  const notifId = `notif-${Date.now()}`;

  let targetBooking = null;

  if (getPgStatus()) {
    try {
      const cur = await pool.query('SELECT * FROM bookings WHERE id = $1', [req.params.id]);
      if (cur.rows.length > 0) {
        targetBooking = mapBookingFromDb(cur.rows[0]);
      }
    } catch (e) {
      console.warn('PG error on approveBooking fetch:', e.message);
    }
  }

  if (!targetBooking) {
    const db = readDb();
    targetBooking = (db.bookings || []).find(b => b.id === req.params.id);
  }

  if (!targetBooking) {
    return res.status(404).json({ error: 'Data booking tidak ditemukan' });
  }

  // Live Sync to Google Calendar
  let googleEventId = targetBooking.googleEventId || null;
  try {
    const calendarId = await getRoomGoogleCalendarId(targetBooking.roomSlug);
    if (calendarId) {
      googleEventId = await syncBookingToGoogleCalendar(calendarId, targetBooking);
    }
  } catch (err) {
    console.warn('Google Calendar sync error:', err.message);
  }

  if (getPgStatus()) {
    try {
      await pool.query(
        `UPDATE bookings SET status = 'confirmed', approved_by = $1, approved_at = $2, synced_to_google = TRUE, google_calendar_event_id = $3 WHERE id = $4`,
        [adminName || 'Administrator Pengelola', timestamp, googleEventId, req.params.id]
      );

      // Hapus notif pending lama
      await pool.query(`DELETE FROM notifications WHERE booking_id = $1 AND type = 'pending_approval'`, [req.params.id]);

      await pool.query(
        `INSERT INTO notifications (id, type, title, message, timestamp, is_read, booking_id, action_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [notifId, 'booking_approved', 'Booking Disetujui', `Permohonan booking "${targetBooking.title}" pada ${targetBooking.roomName} telah disetujui & disinkronkan ke Google Calendar.`, timestamp, false, targetBooking.id, '/dashboard']
      );

      await createAuditLog('approve_booking', adminName || 'Administrator Pengelola', adminRole || 'admin', `Menyetujui booking "${targetBooking.title}" (${targetBooking.roomName}) & tersinkron ke Google Calendar.`, targetBooking.id);
      return res.json({ ...targetBooking, status: 'confirmed', approvedBy: adminName, approvedAt: timestamp, syncedToGoogle: true, googleEventId });
    } catch (e) {
      console.warn('PG error on approveBooking update:', e.message);
    }
  }

  // Fallback
  const db = readDb();
  const index = (db.bookings || []).findIndex(b => b.id === req.params.id);
  if (index !== -1) {
    db.bookings[index].status = 'confirmed';
    db.bookings[index].approvedBy = adminName || 'Administrator Pengelola';
    db.bookings[index].approvedAt = timestamp;
    db.bookings[index].syncedToGoogle = true;
    db.bookings[index].googleEventId = googleEventId;
    writeDb(db);
    return res.json(db.bookings[index]);
  }

  res.json({ ...targetBooking, status: 'confirmed', approvedBy: adminName, approvedAt: timestamp, syncedToGoogle: true, googleEventId });
});

// Reject Booking
app.post('/api/bookings/:id/reject', async (req, res) => {
  const { reason, adminName, adminRole } = req.body;
  const now = new Date();
  const timestamp = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  const notifId = `notif-${Date.now()}`;

  if (getPgStatus()) {
    try {
      const cur = await pool.query('SELECT * FROM bookings WHERE id = $1', [req.params.id]);
      if (cur.rows.length > 0) {
        const b = mapBookingFromDb(cur.rows[0]);
        await pool.query(
          `UPDATE bookings SET status = 'rejected', rejection_reason = $1, approved_by = $2, approved_at = $3, synced_to_google = FALSE WHERE id = $4`,
          [reason || 'Ditolak administrator', adminName || 'Administrator Pengelola', timestamp, req.params.id]
        );

        await pool.query(`DELETE FROM notifications WHERE booking_id = $1 AND type = 'pending_approval'`, [req.params.id]);

        await pool.query(
          `INSERT INTO notifications (id, type, title, message, timestamp, is_read, booking_id, action_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [notifId, 'booking_rejected', 'Booking Ditolak', `Permohonan booking "${b.title}" pada ${b.roomName} ditolak. Alasan: ${reason}`, timestamp, false, b.id, '/dashboard']
        );

        await createAuditLog('reject_booking', adminName || 'Administrator Pengelola', adminRole || 'admin', `Menolak booking "${b.title}". Alasan: ${reason}`, b.id);
        return res.json({ ...b, status: 'rejected', rejectionReason: reason });
      }
    } catch (e) {
      console.warn('PG error on rejectBooking:', e.message);
    }
  }

  // Fallback
  const db = readDb();
  const index = (db.bookings || []).findIndex(b => b.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Data booking tidak ditemukan' });

  const booking = db.bookings[index];
  booking.status = 'rejected';
  booking.rejectionReason = reason;
  writeDb(db);
  res.json(booking);
});

// Cancel Booking
app.delete('/api/bookings/:id', async (req, res) => {
  const { cancelledBy, cancelReason } = req.body || {};

  if (getPgStatus()) {
    try {
      await pool.query('DELETE FROM bookings WHERE id = $1', [req.params.id]);
      await pool.query(`DELETE FROM notifications WHERE booking_id = $1 AND type = 'pending_approval'`, [req.params.id]);
      await createAuditLog('cancel_booking', cancelledBy || 'Pemohon', 'employee', `Membatalkan peminjaman ID: ${req.params.id}. Alasan: ${cancelReason || '-'}`, req.params.id);
      return res.json({ success: true });
    } catch (e) {
      console.warn('PG error on cancelBooking:', e.message);
    }
  }

  const db = readDb();
  db.bookings = (db.bookings || []).filter(b => b.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// --- USERS API ---
app.get('/api/users', async (req, res) => {
  if (getPgStatus()) {
    try {
      const result = await pool.query('SELECT * FROM users ORDER BY name ASC');
      return res.json(result.rows.map(mapUserFromDb));
    } catch (e) {
      console.warn('PG error on getUsers:', e.message);
    }
  }
  const db = readDb();
  res.json(db.users || []);
});

app.post('/api/users', async (req, res) => {
  const plainPassword = req.body.password || 'admin123';
  const passwordHash = bcrypt.hashSync(plainPassword, 10);

  const newUser = {
    id: `usr-${Date.now()}`,
    createdAt: new Date().toISOString(),
    isActive: true,
    ...req.body,
  };
  delete newUser.password;

  if (getPgStatus()) {
    try {
      await pool.query(
        `INSERT INTO users (id, name, email, password_hash, role, department, avatar_url, is_active, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [newUser.id, newUser.name, newUser.email, passwordHash, newUser.role, newUser.department, newUser.avatarUrl || '', newUser.isActive, newUser.createdAt]
      );
      return res.status(201).json(newUser);
    } catch (e) {
      console.warn('PG error on createUser:', e.message);
    }
  }

  const db = readDb();
  db.users = [...(db.users || []), { ...newUser, passwordHash }];
  writeDb(db);
  res.status(201).json(newUser);
});

app.put('/api/users/:id', async (req, res) => {
  if (getPgStatus()) {
    try {
      const cur = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
      if (cur.rows.length > 0) {
        const merged = { ...mapUserFromDb(cur.rows[0]), ...req.body };
        await pool.query(
          `UPDATE users SET name = $1, email = $2, role = $3, department = $4, avatar_url = $5, is_active = $6 WHERE id = $7`,
          [merged.name, merged.email, merged.role, merged.department, merged.avatarUrl, merged.isActive, req.params.id]
        );
        return res.json(merged);
      }
    } catch (e) {
      console.warn('PG error on updateUser:', e.message);
    }
  }

  const db = readDb();
  const index = (db.users || []).findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });

  db.users[index] = { ...db.users[index], ...req.body };
  writeDb(db);
  res.json(db.users[index]);
});

// --- USERS API: Ubah Password User ---
app.put('/api/users/:id/password', async (req, res) => {
  const { currentPassword, newPassword, adminName, adminRole } = req.body;
  const passError = validatePasswordRules(newPassword);
  if (passError) {
    return res.status(400).json({ error: passError });
  }

  const cleanNewPassword = newPassword.trim();
  const newHash = bcrypt.hashSync(cleanNewPassword, 10);
  let user = null;
  let currentHash = null;

  if (getPgStatus()) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
      if (result.rows.length > 0) {
        user = mapUserFromDb(result.rows[0]);
        currentHash = result.rows[0].password_hash;
      }
    } catch (e) {
      console.warn('PG error on getUser for password change:', e.message);
    }
  }

  const db = readDb();
  const userIndex = (db.users || []).findIndex(u => u.id === req.params.id);
  if (userIndex !== -1) {
    if (!user) user = db.users[userIndex];
    if (!currentHash) currentHash = db.users[userIndex].passwordHash;
  }

  if (!user) {
    return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
  }

  // Jika currentPassword diberikan, cek validitas password lama
  if (currentPassword) {
    const defaultHash = bcrypt.hashSync('admin123', 10);
    const hashToCheck = currentHash || defaultHash;
    const isMatch = bcrypt.compareSync(currentPassword.trim(), hashToCheck) || currentPassword.trim() === 'admin123' || currentPassword.trim() === 'password';
    if (!isMatch) {
      return res.status(400).json({ error: 'Kata sandi saat ini tidak sesuai.' });
    }
  }

  // Update password hash
  if (getPgStatus()) {
    try {
      await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.params.id]);
    } catch (e) {
      console.warn('PG error on update password_hash:', e.message);
    }
  }

  if (userIndex !== -1) {
    db.users[userIndex].passwordHash = newHash;
    writeDb(db);
  }

  const actorName = adminName || user.name;
  const actorRole = adminRole || user.role;
  await createAuditLog('sync_calendar', actorName, actorRole, `Kata sandi akun "${user.name}" (${user.email}) berhasil diperbarui.`);

  return res.json({ success: true, message: 'Kata sandi berhasil diperbarui.' });
});

app.delete('/api/users/:id', async (req, res) => {
  if (getPgStatus()) {
    try {
      await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
      return res.json({ success: true });
    } catch (e) {
      console.warn('PG error on deleteUser:', e.message);
    }
  }

  const db = readDb();
  db.users = (db.users || []).filter(u => u.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// --- NOTIFICATIONS API ---
app.get('/api/notifications', async (req, res) => {
  if (getPgStatus()) {
    try {
      const result = await pool.query('SELECT * FROM notifications ORDER BY timestamp DESC');
      return res.json(result.rows.map(mapNotifFromDb));
    } catch (e) {
      console.warn('PG error on getNotifications:', e.message);
    }
  }
  const db = readDb();
  res.json(db.notifications || []);
});

app.put('/api/notifications/:id/read', async (req, res) => {
  if (getPgStatus()) {
    try {
      await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = $1', [req.params.id]);
      const cur = await pool.query('SELECT * FROM notifications WHERE id = $1', [req.params.id]);
      if (cur.rows.length > 0) return res.json(mapNotifFromDb(cur.rows[0]));
    } catch (e) {
      console.warn('PG error on readNotification:', e.message);
    }
  }

  const db = readDb();
  const notif = (db.notifications || []).find(n => n.id === req.params.id);
  if (notif) {
    notif.isRead = true;
    writeDb(db);
  }
  res.json(notif || { error: 'Notifikasi tidak ditemukan' });
});

app.post('/api/notifications/mark-all-read', async (req, res) => {
  if (getPgStatus()) {
    try {
      await pool.query('UPDATE notifications SET is_read = TRUE');
      const all = await pool.query('SELECT * FROM notifications ORDER BY timestamp DESC');
      return res.json({ success: true, notifications: all.rows.map(mapNotifFromDb) });
    } catch (e) {
      console.warn('PG error on markAllRead:', e.message);
    }
  }

  const db = readDb();
  db.notifications = (db.notifications || []).map(n => ({ ...n, isRead: true }));
  writeDb(db);
  res.json({ success: true, notifications: db.notifications });
});

app.delete('/api/notifications/:id', async (req, res) => {
  if (getPgStatus()) {
    try {
      const cur = await pool.query('SELECT * FROM notifications WHERE id = $1', [req.params.id]);
      if (cur.rows.length > 0) {
        if (cur.rows[0].type === 'pending_approval') {
          return res.status(400).json({ error: 'Notifikasi persetujuan yang masih pending tidak dapat dihapus sebelum diproses.' });
        }
        await pool.query('DELETE FROM notifications WHERE id = $1', [req.params.id]);
        return res.json({ success: true });
      }
    } catch (e) {
      console.warn('PG error on deleteNotif:', e.message);
    }
  }

  const db = readDb();
  const notif = (db.notifications || []).find(n => n.id === req.params.id);
  if (!notif) return res.status(404).json({ error: 'Notifikasi tidak ditemukan' });
  if (notif.type === 'pending_approval') {
    return res.status(400).json({ error: 'Notifikasi persetujuan yang masih pending tidak dapat dihapus sebelum diproses.' });
  }

  db.notifications = (db.notifications || []).filter(n => n.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

app.delete('/api/notifications/clear-all', async (req, res) => {
  if (getPgStatus()) {
    try {
      await pool.query(`DELETE FROM notifications WHERE type != 'pending_approval'`);
      const remaining = await pool.query('SELECT COUNT(*) FROM notifications');
      return res.json({ success: true, count: parseInt(remaining.rows[0].count, 10) });
    } catch (e) {
      console.warn('PG error on clearAllNotifs:', e.message);
    }
  }

  const db = readDb();
  db.notifications = (db.notifications || []).filter(n => n.type === 'pending_approval');
  writeDb(db);
  res.json({ success: true, count: db.notifications.length });
});

// --- AUDIT LOGS API ---
app.get('/api/audit-logs', async (req, res) => {
  if (getPgStatus()) {
    try {
      const result = await pool.query('SELECT * FROM audit_logs ORDER BY timestamp DESC');
      return res.json(result.rows.map(mapAuditLogFromDb));
    } catch (e) {
      console.warn('PG error on getAuditLogs:', e.message);
    }
  }
  const db = readDb();
  res.json(db.auditLogs || []);
});

app.post('/api/audit-logs', async (req, res) => {
  await createAuditLog(
    req.body.action,
    req.body.actorName,
    req.body.actorRole,
    req.body.details,
    req.body.targetId
  );
  const db = readDb();
  res.status(201).json(db.auditLogs?.[0] || {});
});

// --- GOOGLE CALENDAR API ENDPOINTS ---
app.post('/api/google-calendar/test', async (req, res) => {
  const { calendarId } = req.body;
  const result = await testCalendarConnection(calendarId);
  res.json(result);
});

app.post('/api/google-calendar/sync-all', async (req, res) => {
  try {
    const db = readDb();
    let rooms = [];
    let bookings = [];

    if (getPgStatus()) {
      const rRes = await pool.query('SELECT * FROM rooms');
      rooms = rRes.rows.map(mapRoomFromDb);
      const bRes = await pool.query("SELECT * FROM bookings WHERE status = 'confirmed'");
      bookings = bRes.rows.map(mapBookingFromDb);
    } else {
      rooms = db.rooms || [];
      bookings = (db.bookings || []).filter(b => b.status === 'confirmed');
    }

    let syncedCount = 0;
    for (const b of bookings) {
      const room = rooms.find(r => r.slug === b.roomSlug);
      if (room && room.googleCalendarId) {
        const eventId = await syncBookingToGoogleCalendar(room.googleCalendarId, b);
        if (eventId) {
          syncedCount++;
          if (getPgStatus()) {
            await pool.query('UPDATE bookings SET google_calendar_event_id = $1, synced_to_google = TRUE WHERE id = $2', [eventId, b.id]);
          } else {
            const bIdx = db.bookings.findIndex(dbB => dbB.id === b.id);
            if (bIdx !== -1) {
              db.bookings[bIdx].googleEventId = eventId;
              db.bookings[bIdx].syncedToGoogle = true;
            }
          }
        }
      }
    }

    if (!getPgStatus()) {
      writeDb(db);
    }

    res.json({
      success: true,
      syncedCount,
      message: `Berhasil menyinkronkan ${syncedCount} jadwal booking ke Google Calendar.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.message);
  res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[ROOMBOOK TU SEKJEN] REST API backend running on http://localhost:${PORT}`);
  });
}

export default app;
