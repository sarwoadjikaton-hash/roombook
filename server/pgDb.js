import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { readDb } from './db.js';

dotenv.config();

const { Pool, Client, types } = pg;

// Override parser untuk DATE (OID 1082) agar selalu dikembalikan sebagai string 'YYYY-MM-DD' murni tanpa konversi zona waktu UTC
types.setTypeParser(1082, (str) => str);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCHEMA_FILE = path.join(__dirname, 'schema.sql');

const DB_NAME = process.env.PGDATABASE || 'roombook_tusekjen';
const PG_USER = process.env.PGUSER || 'postgres';
const PG_PASSWORD = process.env.PGPASSWORD || 'postgres';
const PG_HOST = process.env.PGHOST || 'localhost';
const PG_PORT = parseInt(process.env.PGPORT || '5432', 10);

const isCloudDb = Boolean(
  process.env.DATABASE_URL &&
  (process.env.DATABASE_URL.includes('neon.tech') ||
   process.env.DATABASE_URL.includes('supabase.co') ||
   process.env.DATABASE_URL.includes('render.com') ||
   process.env.DATABASE_URL.includes('sslmode=require') ||
   process.env.PGSSLMODE === 'require')
);

// Pool utama ke database target
let pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${DB_NAME}`,
  ssl: isCloudDb ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
});

let isPostgreConnected = false;

// Helper format tanggal murni lokal (YYYY-MM-DD)
export const formatDateOnly = (d) => {
  if (!d) return '';
  if (typeof d === 'string') return d.split('T')[0];
  if (d instanceof Date) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return String(d);
};

// Format helper DB <-> JS
export const mapRoomFromDb = (r) => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  capacity: Number(r.capacity),
  location: r.location,
  facilities: r.facilities || [],
  requiresApproval: Boolean(r.requires_approval),
  approverName: r.approver_name,
  approverEmail: r.approver_email,
  description: r.description,
  googleCalendarId: r.google_calendar_id,
  isSpecialAccent: Boolean(r.is_special_accent),
  imageUrl: r.image_url,
  images: r.images && r.images.length > 0 ? r.images : (r.image_url ? [r.image_url] : []),
});

export const mapBookingFromDb = (b) => ({
  id: b.id,
  roomSlug: b.room_slug,
  roomName: b.room_name,
  title: b.title,
  description: b.description || '',
  organizerId: b.organizer_id,
  organizerName: b.organizer_name,
  organizerEmail: b.organizer_email,
  organizerDept: b.organizer_dept,
  date: formatDateOnly(b.date),
  startTime: b.start_time,
  endTime: b.end_time,
  attendeeCount: Number(b.attendee_count),
  attendees: b.attendees || [],
  status: b.status,
  requiresApproval: Boolean(b.requires_approval),
  rejectionReason: b.rejection_reason || undefined,
  approvedBy: b.approved_by || undefined,
  approvedAt: b.approved_at || undefined,
  rescheduledAt: b.rescheduled_at || undefined,
  rescheduleReason: b.reschedule_reason || undefined,
  createdAt: b.created_at,
  googleCalendarEventId: b.google_calendar_event_id || undefined,
  syncedToGoogle: Boolean(b.synced_to_google),
});

export const mapUserFromDb = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  department: u.department,
  avatarUrl: u.avatar_url,
  isActive: Boolean(u.is_active),
  createdAt: u.created_at,
});

export const mapNotifFromDb = (n) => ({
  id: n.id,
  type: n.type,
  title: n.title,
  message: n.message,
  timestamp: n.timestamp,
  isRead: Boolean(n.is_read),
  bookingId: n.booking_id || undefined,
  actionUrl: n.action_url || undefined,
});

export const mapAuditLogFromDb = (l) => ({
  id: l.id,
  timestamp: l.timestamp,
  action: l.action,
  actorName: l.actor_name,
  actorRole: l.actor_role,
  details: l.details,
  targetId: l.target_id || undefined,
});

// Helper untuk membuat database jika belum ada (khusus local PostgreSQL)
const ensureDatabaseExists = async () => {
  if (process.env.DATABASE_URL) {
    // Cloud database (Neon/Supabase) sudah menyediakan DB target secara otomatis
    return;
  }
  // Sambungkan ke database default 'postgres'
  const rootClient = new Client({
    user: PG_USER,
    password: PG_PASSWORD,
    host: PG_HOST,
    port: PG_PORT,
    database: 'postgres',
    connectionTimeoutMillis: 4000,
  });

  try {
    await rootClient.connect();
    const checkDb = await rootClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [DB_NAME]
    );

    if (checkDb.rows.length === 0) {
      console.log(`[PostgreSQL] Database "${DB_NAME}" belum ada. Sedang membuat database otomatis...`);
      await rootClient.query(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`[PostgreSQL] Database "${DB_NAME}" BERHASIL DIBUAT di PostgreSQL!`);
    } else {
      console.log(`[PostgreSQL] Database "${DB_NAME}" sudah tersedia di server.`);
    }
  } catch (err) {
    console.warn(`[PostgreSQL] Tidak dapat memeriksa/membuat database di server root postgres: ${err.message}`);
  } finally {
    try {
      await rootClient.end();
    } catch {}
  }
};

import bcrypt from 'bcryptjs';

const DEFAULT_HASH = bcrypt.hashSync('admin123', 10);

// Inisialisasi Skema & Seeding
export const initPostgreDb = async () => {
  try {
    // 1. Pastikan database `roombook_tusekjen` sudah dibuat
    await ensureDatabaseExists();

    // 2. Hubungkan ke database target
    const client = await pool.connect();
    isPostgreConnected = true;
    console.log(`[PostgreSQL] Terhubung ke database "${DB_NAME}" di PostgreSQL.`);

    // 3. Eksekusi skema DDL jika tabel belum ada
    if (fs.existsSync(SCHEMA_FILE)) {
      const ddl = fs.readFileSync(SCHEMA_FILE, 'utf-8');
      await client.query(ddl);
      console.log('[PostgreSQL] Skema tabel (rooms, bookings, users, notifications, audit_logs) berhasil dimuat.');
    }

    // Pastikan kolom password_hash ada di tabel users
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);');
    // Set default password hash jika masih null
    await client.query('UPDATE users SET password_hash = $1 WHERE password_hash IS NULL;', [DEFAULT_HASH]);

    // Pastikan kolom images ada di tabel rooms
    await client.query('ALTER TABLE rooms ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT \'{}\';');
    await client.query(`UPDATE rooms SET image_url = '/rooms/ruang-sekjen-1.jpg', images = ARRAY['/rooms/ruang-sekjen-1.jpg', '/rooms/ruang-sekjen-2.jpg', '/rooms/ruang-sekjen-3.jpg', '/rooms/ruang-sekjen-4.jpg', '/rooms/ruang-sekjen-5.jpg'] WHERE slug = 'ruang-sekjen';`);
    await client.query(`UPDATE rooms SET image_url = '/rooms/ruang-transit-1.jpg', images = ARRAY['/rooms/ruang-transit-1.jpg', '/rooms/ruang-transit-2.jpg', '/rooms/ruang-transit-3.jpg'] WHERE slug = 'ruang-transit';`);

    // 4. Periksa apakah tabel rooms kosong untuk seeding
    const roomsCountRes = await client.query('SELECT COUNT(*) FROM rooms');
    if (parseInt(roomsCountRes.rows[0].count, 10) === 0) {
      console.log('[PostgreSQL] Menyemai data awal (seeding) ke PostgreSQL...');
      const defaultData = readDb();

      // Seed Rooms
      for (const r of (defaultData.rooms || [])) {
        await client.query(
          `INSERT INTO rooms (id, slug, name, capacity, location, facilities, requires_approval, approver_name, approver_email, description, google_calendar_id, is_special_accent, image_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT (id) DO NOTHING`,
          [r.id, r.slug, r.name, r.capacity, r.location, r.facilities, r.requiresApproval, r.approverName, r.approverEmail, r.description, r.googleCalendarId, r.isSpecialAccent || false, r.imageUrl]
        );
      }

      // Seed Users
      for (const u of (defaultData.users || [])) {
        await client.query(
          `INSERT INTO users (id, name, email, password_hash, role, department, avatar_url, is_active, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO NOTHING`,
          [u.id, u.name, u.email, u.passwordHash || DEFAULT_HASH, u.role, u.department, u.avatarUrl, u.isActive ?? true, u.createdAt]
        );
      }

      // Seed Bookings
      for (const b of (defaultData.bookings || [])) {
        await client.query(
          `INSERT INTO bookings (id, room_slug, room_name, title, description, organizer_id, organizer_name, organizer_email, organizer_dept, date, start_time, end_time, attendee_count, attendees, status, requires_approval, rejection_reason, approved_by, approved_at, created_at, google_calendar_event_id, synced_to_google)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
           ON CONFLICT (id) DO NOTHING`,
          [b.id, b.roomSlug, b.roomName, b.title, b.description || '', b.organizerId || 'guest-public', b.organizerName, b.organizerEmail, b.organizerDept || '-', b.date, b.startTime, b.endTime, b.attendeeCount || 1, b.attendees || [], b.status, b.requiresApproval, b.rejectionReason || null, b.approvedBy || null, b.approvedAt || null, b.createdAt, b.googleCalendarEventId || null, b.syncedToGoogle || false]
        );
      }

      // Seed Notifications
      for (const n of (defaultData.notifications || [])) {
        await client.query(
          `INSERT INTO notifications (id, type, title, message, timestamp, is_read, booking_id, action_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO NOTHING`,
          [n.id, n.type, n.title, n.message, n.timestamp, n.isRead, n.bookingId || null, n.actionUrl || null]
        );
      }

      // Seed Audit Logs
      for (const l of (defaultData.auditLogs || [])) {
        await client.query(
          `INSERT INTO audit_logs (id, timestamp, action, actor_name, actor_role, details, target_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO NOTHING`,
          [l.id, l.timestamp, l.action, l.actorName, l.actorRole, l.details, l.targetId || null]
        );
      }

      console.log(`[PostgreSQL] Seeding data awal ke database "${DB_NAME}" selesai.`);
    }

    client.release();
    return true;
  } catch (error) {
    isPostgreConnected = false;
    console.warn(`[PostgreSQL] Catatan: Tidak dapat terhubung ke PostgreSQL (${error.message}). Menggunakan persistent file database fallback.`);
    return false;
  }
};

export const getPgStatus = () => isPostgreConnected;
export { pool };
