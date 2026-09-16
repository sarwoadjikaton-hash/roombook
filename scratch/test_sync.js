import { syncBookingToGoogleCalendar } from '../server/googleCalendar.js';
import { pool, mapBookingFromDb } from '../server/pgDb.js';

async function main() {
  const calendarId = '7bdae51c223e13e3ef53b8a2a18ee937698991b53a0ced45b9c495f6cf33a38a@group.calendar.google.com';
  const bRes = await pool.query("SELECT * FROM bookings WHERE status = 'confirmed' AND room_slug = 'ruang-sekjen'");
  const bookings = bRes.rows.map(mapBookingFromDb);
  console.log(`Found ${bookings.length} confirmed bookings for Ruang Sekjen`);

  for (const b of bookings) {
    const eventId = await syncBookingToGoogleCalendar(calendarId, b);
    console.log(`✓ Synced "${b.title}" (${b.date}, ${b.startTime}-${b.endTime}) -> Google Event ID: ${eventId}`);
    if (eventId) {
      await pool.query('UPDATE bookings SET google_calendar_event_id = $1, synced_to_google = TRUE WHERE id = $2', [eventId, b.id]);
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
