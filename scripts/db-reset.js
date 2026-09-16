/**
 * Reset Database Script (ROOMBOOK)
 * Clears active bookings and related notifications to start fresh from 0.
 */
import { pool } from '../server/pgDb.js';
import fs from 'fs';
import path from 'path';

async function resetDb() {
  console.log('🔄 Memulai proses reset data pemesanan...');

  try {
    // 1. Bersihkan PostgreSQL Bookings & Notifications
    await pool.query('TRUNCATE TABLE bookings CASCADE;');
    await pool.query("DELETE FROM notifications WHERE type IN ('pending_approval', 'booking_approved', 'booking_rejected');");
    console.log('✅ PostgreSQL bookings & notifikasi pemesanan berhasil dikosongkan.');
  } catch (err) {
    console.warn('⚠️ Gagal membersihkan PostgreSQL (mungkin offline):', err.message);
  }

  // 2. Bersihkan JSON fallback
  const dbPath = path.join(process.cwd(), 'server', 'data', 'database.json');
  if (fs.existsSync(dbPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      data.bookings = [];
      data.notifications = [];
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
      console.log('✅ server/data/database.json berhasil dibersihkan.');
    } catch (err) {
      console.error('⚠️ Gagal update database.json:', err.message);
    }
  }

  console.log('✨ Reset data pemesanan selesai. Sistem kembali ke kondisi awal (0 booking).');
  process.exit(0);
}

resetDb().catch((err) => {
  console.error('Fatal reset error:', err);
  process.exit(1);
});
