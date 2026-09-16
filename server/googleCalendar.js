import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'];

// Kredensial Google Service Account
const SERVICE_ACCOUNT_CREDENTIALS = {
  client_email: 'id-booking-ruang-rapat@booking-ruang-rapat-508313.iam.gserviceaccount.com',
  private_key: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDWrk5P8MwtFazt
clGNmaFUxVJC5JjtLLcwb6h2SAA56yyT0/G+Hq54aSBe4fDG/NK6Kkuy31WGPRxE
32xj9KV9F4R5c9Q7+oPubkrq9m8gyoJ/BiX6e8/L6S/q57kF6wGPzANT9pjxKqLa
yUsKPY7fL2knOZko1e7HUrSIZLtJeJFymP8dQVjMs+CsWfMkK7WAv9Z7Fzm44FXP
pA8bzpcUaWRYS2P8DElqZ4HwxUiAjB260/Z5sbN1vbENIJWqxtbFIgm0Ci7vpKXN
Wm0wVizG+w8ZZJ/piHZMuV8CrevWOtxxGcKhaXK3AvN/GExSZMwuz2H9Ojd2KkV1
FJ1ot2tHAgMBAAECggEAXqe8H8MsQzSraoZdLvHuEFJwUs44H1r36oNQ49YbQ25N
2WA51nnws2amvy8f2pzezPaZKeUO8IFBVZytTeUwklcsMeDAUzHBuf8nSTIfDXY8
04UCec7dcCsA1bIWAmX76ksprHuuM6d45r6aN4ms1PsygfkDbt3kyj3NG9ZOPbX8
gdoj3v//akGoP3QFQKDppFBXF8q818bEcJYMYnW2jtggQGSPpLaUL8zNlo9uDip9
8Qoi5JbdbJgsLb1PfthMpaQccaQvAwekt8JoNTux29NXKVHthCM7r6sbpH0Z2dRX
JTR07zu6jabiQzsHuCg4MQAfv/cG5KzYihA5hwF7AQKBgQD0eY94bhLs5Tjx1uD1
2Cr92IrYfnVHh3tAp5iCsSSD0xMCxo/F4q9ZHBQjFG1+I8Lk4NvhPEe1Rjmo7T9I
R6bV5vaag6+f18oVxBLpREIevlPBnv1fXy0sF6UcbTlI5CuFCK0mSo+4GK8woYu8
t8bhTS0J8rgNo5xsNGo7MaMZ2wKBgQDgzS161o2w/LuwvNdaYqDNuUUxOmtU1Bdv
8+4XZdOHKocCYTY7E1q7zVMcNWNfgSPVqo2YFhAbEmhQFL1ShjW7JS33pJU80H6j
4vGdgt2PYnoO2rZt/QaGbN5LhIKK7a6Eip/53IO97/ZZUGPsa/tT1hQpi92sRTJN
kWKgYRTeBQKBgAwu6qlzwtmvarESpk9aIHpaCkFTvAB+jfPg5kbNESbIpA/lWVDh
RR/JuG8vG23H1nSViB+nY2NzRnhWqmqtt3C9e9ija2Mp29ZN2StqzWi+z2m8xJ+2
HIgv/Xh3MP2i8VBF6GsaGCNyh3iC9HXJKs4bjH0MbYOwfaEe05Rzms81AoGAQyYG
h8K+4Dcd+VTvHtiHH+xPdrz0goo31gEPBX4tCRry6QsQn+TQHXjfcnWgEU8J3TDs
ypkMhomhDwqi4pukQRqB+I745QmCSoHnmh0VAVdxDi7Wf1QtNsoePICAXe9RSdX+
oyvzTjD3bQZOUriOgiRYMXDN7j9dHz5mL3HQQeECgYEArBI1gvxvxdpNE5IG23yl
hxNWN9qzYTYUrrS+zQDZnkCfVu//AVvzzespkaIuxuFNvV+GQL9Lyb0mhSCarAXl
xzoAYlPD6Awt36XKoXhtk6yeDkNx08xn3uQH83xamwnb/kHluONVIr8p7QYWxDnR
SIT0zNqaxMxWYdn2dmQX9EI=
-----END PRIVATE KEY-----`,
};

function getCalendarClient() {
  const auth = new google.auth.JWT({
    email: SERVICE_ACCOUNT_CREDENTIALS.client_email,
    key: SERVICE_ACCOUNT_CREDENTIALS.private_key,
    scopes: SCOPES,
  });

  return google.calendar({ version: 'v3', auth });
}

/**
 * Uji koneksi ke Google Calendar ID tertentu
 */
export async function testCalendarConnection(calendarId) {
  if (!calendarId) {
    return { success: false, message: 'Google Calendar Resource ID belum diisi pada ruangan ini.' };
  }

  try {
    const calendar = getCalendarClient();
    const res = await calendar.calendars.get({ calendarId });
    return {
      success: true,
      summary: res.data.summary,
      timeZone: res.data.timeZone,
      message: `Koneksi Google Calendar API berhasil terhubung ke kalender "${res.data.summary}" (${res.data.id}).`,
    };
  } catch (error) {
    console.error('Google Calendar test connection error:', error.message);
    let errorMessage = error.message;
    if (error.code === 404) {
      errorMessage = 'Kalender tidak ditemukan atau Service Account belum diberi izin akses.';
    } else if (error.code === 403) {
      errorMessage = 'Akses ditolak. Pastikan email Service Account sudah ditambahkan di Shared with dengan izin "Make changes to events".';
    }
    return { success: false, error: errorMessage, code: error.code };
  }
}

/**
 * Sinkronisasi pembuatan event ke Google Calendar
 */
export async function syncBookingToGoogleCalendar(calendarId, booking) {
  if (!calendarId || !booking) return null;

  try {
    const calendar = getCalendarClient();

    // Format ISO string dengan timezone Asia/Jakarta (+07:00)
    const startDateTime = `${booking.date}T${booking.startTime}:00+07:00`;
    const endDateTime = `${booking.date}T${booking.endTime}:00+07:00`;

    const eventBody = {
      summary: `[ROOMBOOK] ${booking.title}`,
      description: `Agenda: ${booking.title}\nRuangan: ${booking.roomName}\nPenyelenggara: ${booking.organizerName} (${booking.organizerDept || booking.department || '-'})\nEmail: ${booking.organizerEmail || '-'}\nPeserta: ${Array.isArray(booking.attendees) ? booking.attendees.join(', ') : (booking.attendees || '-')}\n\nDipesan via Sistem ROOMBOOK`,
      location: booking.roomName,
      start: {
        dateTime: startDateTime,
        timeZone: 'Asia/Jakarta',
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'Asia/Jakarta',
      },
    };

    const res = await calendar.events.insert({
      calendarId,
      requestBody: eventBody,
    });

    console.log(`[Google Calendar] Event created: ${res.data.id} for "${booking.title}" in calendar ${calendarId}`);
    return res.data.id;
  } catch (error) {
    console.error(`[Google Calendar] Failed to create event for booking ${booking.id}:`, error.message);
    return null;
  }
}

/**
 * Update event yang sudah ada di Google Calendar (misal setelah reschedule)
 */
export async function updateGoogleCalendarEvent(calendarId, googleEventId, booking) {
  if (!calendarId || !googleEventId || !booking) return null;

  try {
    const calendar = getCalendarClient();

    const startDateTime = `${booking.date}T${booking.startTime}:00+07:00`;
    const endDateTime = `${booking.date}T${booking.endTime}:00+07:00`;

    const eventBody = {
      summary: `[ROOMBOOK] ${booking.title}`,
      description: `Agenda: ${booking.title}\nRuangan: ${booking.roomName}\nPenyelenggara: ${booking.organizerName} (${booking.organizerDept || booking.department || '-'})\nEmail: ${booking.organizerEmail || '-'}\nPeserta: ${Array.isArray(booking.attendees) ? booking.attendees.join(', ') : (booking.attendees || '-')}\n\nDipesan via Sistem ROOMBOOK`,
      location: booking.roomName,
      start: {
        dateTime: startDateTime,
        timeZone: 'Asia/Jakarta',
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'Asia/Jakarta',
      },
    };

    const res = await calendar.events.update({
      calendarId,
      eventId: googleEventId,
      requestBody: eventBody,
    });

    console.log(`[Google Calendar] Event updated: ${res.data.id}`);
    return res.data.id;
  } catch (error) {
    console.error(`[Google Calendar] Failed to update event ${googleEventId}:`, error.message);
    return null;
  }
}

/**
 * Hapus event dari Google Calendar (misal setelah pembatalan / penolakan)
 */
export async function deleteGoogleCalendarEvent(calendarId, googleEventId) {
  if (!calendarId || !googleEventId) return false;

  try {
    const calendar = getCalendarClient();
    await calendar.events.delete({
      calendarId,
      eventId: googleEventId,
    });
    console.log(`[Google Calendar] Event deleted: ${googleEventId}`);
    return true;
  } catch (error) {
    console.error(`[Google Calendar] Failed to delete event ${googleEventId}:`, error.message);
    return false;
  }
}
