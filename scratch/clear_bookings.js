import { pool } from '../server/pgDb.js';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('1. Clearing PostgreSQL bookings and notifications...');
  await pool.query('TRUNCATE TABLE bookings CASCADE;');
  await pool.query("DELETE FROM notifications WHERE type IN ('pending_approval', 'booking_approved', 'booking_rejected');");
  console.log('PostgreSQL bookings cleared successfully.');

  console.log('2. Clearing server/data/database.json...');
  const dbPath = path.join(process.cwd(), 'server', 'data', 'database.json');
  if (fs.existsSync(dbPath)) {
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    data.bookings = [];
    data.notifications = [];
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log('database.json bookings cleared.');
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Error clearing data:', err);
  process.exit(1);
});
