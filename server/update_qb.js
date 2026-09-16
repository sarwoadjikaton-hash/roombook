const { pool } = require('./server/db');

async function run() {
  try {
    const res = await pool.query(`
      UPDATE bookings 
      SET date = '2026-09-13', status = 'confirmed' 
      WHERE id IN ('qb-982075', 'qb-549621') 
      RETURNING id, title, room_slug, date, start_time, end_time, status
    `);
    console.log('Updated rows:', res.rows);
  } catch (err) {
    console.error('Error updating:', err);
  } finally {
    process.exit(0);
  }
}

run();
