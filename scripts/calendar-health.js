/**
 * Google Calendar Integration Health Check
 * Verifies Service Account connectivity and access permissions.
 */
import { testCalendarConnection } from '../server/googleCalendar.js';
import { pool, getPgStatus } from '../server/pgDb.js';
import { readDb } from '../server/db.js';

async function checkHealth() {
  console.log('====================================================');
  console.log('📅 GOOGLE CALENDAR INTEGRATION HEALTH CHECK');
  console.log('====================================================\n');

  let rooms = [];
  try {
    const res = await pool.query('SELECT * FROM rooms');
    rooms = res.rows;
  } catch (e) {
    const db = readDb();
    rooms = db.rooms || [];
  }

  console.log(`Ditemukan ${rooms.length} data master ruangan.\n`);

  for (const room of rooms) {
    const calId = room.google_calendar_id || room.googleCalendarId;
    const roomName = room.name;

    process.stdout.write(`🔍 Memeriksa "${roomName}" ... `);
    if (!calId) {
      console.log('⚠️ BELUM DIKONFIGURASI (Google Calendar ID kosong)');
      continue;
    }

    const result = await testCalendarConnection(calId);
    if (result.success) {
      console.log(`✅ TERHUBUNG`);
      console.log(`   ID: ${calId}`);
      console.log(`   Summary: "${result.summary}" | Timezone: ${result.timeZone}\n`);
    } else {
      console.log(`❌ GAGAL`);
      console.log(`   ID: ${calId}`);
      console.log(`   Error: ${result.error || result.message}\n`);
    }
  }

  console.log('====================================================');
  console.log('✨ Pemeriksaan Google Calendar selesai.');
  process.exit(0);
}

checkHealth().catch((err) => {
  console.error('Fatal health check error:', err);
  process.exit(1);
});
