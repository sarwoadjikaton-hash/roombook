import { pool } from '../server/pgDb.js';

async function main() {
  const b = await pool.query("SELECT id, title, organizer_name, room_slug, status, date, start_time, end_time, created_at FROM bookings WHERE status = 'pending'");
  console.log('Pending bookings count:', b.rows.length);
  console.log(b.rows);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
