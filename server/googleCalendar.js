import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'];

// Kredensial Google Service Account
const SERVICE_ACCOUNT_CREDENTIALS = {
  client_email: 'ruangku-calendar-sync@ruangku-510707.iam.gserviceaccount.com',
  private_key: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCnE28n5g8hMTEy
tgbMKVB1wHp/lfIdVE6fET3d9RDp/Xns7ym3hs9Tc8KJBFx+RcXDV5xZS2eJLHbw
mw32I1F7qq/jZbIigXIlQrYls/XawPw95g6zXgq37z8xTOdDgjAFtuEvsNgx5c2y
+FYesT4K+OPvZqf7a/TntRrHKt1nu6l5l8UYtoyIW1yQHNXx/8yjwVjRlIkm1Qzr
5Gj6dbjB5qVTc2ag3KLYzwW5+A/usrXqmuVsI08mMrsIURANKFZWHo1xeijIPRxp
jB8BjHlMC/HnMJVHptloNvDwYnXXDSQEmDgwZTONZYkKCAZ1EBA9+rQBEwIfiNUn
+ijOeLuXAgMBAAECggEAO0va8fqlGP8n+lr/G5t4GmqHL1vs03r18l+AqRNOfvU+
vhf9osyeLXySqOVa3FfwAc3IyCpKYzVcOzWUpWxQgYcJKLgRmkx90fqUwdnWYl6G
x4MsaX1xaWlocJteIqgEWirXTgFCIadxM1kO25LFNciywOcarFFa2Jd+mvw8GxG9
HUZPXKmcIg5QTe996coRYREfFwKSKdUSZ28U5FHdEm3U9qFShQgZPGrZvsCTTuCI
HOjatNQ6layck4eh2uPneVX8mEuPjGqyyejBfU2g5l1Iptn8CqVBChK0kLyt7gYR
Z9TkS340QrF1lfdHAbfOPXGSXJtGtr90FpCeGbCmlQKBgQDQBG+rJ0Et/69+LRiM
fIpJEL6DcCW4ZmOvEWezqziYH0AMGdGkkDofgtF3jZIB9qNEMw+ss2/pSflQvgDW
gDTzQF3qK1tAzs0dY+7mGRKV7LyDa5C1imtkbnoPsYLl6mu9WIZgCfoA4MAtcYKh
jSMi17cLrFKY+Kh5uI7o57XvLQKBgQDNnWE9ItD7aktwXZIl8xWrbSqCZFkG0i6t
VzAsMz8/VB3f3+wXuQd7QdN3NS8BkMHjhEyPyjqcVjcn+d3J3Ubrp0h7tt35+bAa
+JwZzFv+MdMtIFN8elPVcRerP+IXgK5faiT7mjzR/x/X5VAvSf5I4A5bPFw3n5on
06JW8IrwUwKBgC8t0mXvMUlNhHAJqleyp2qK8aq99NAt6M38FJkbbGqUK+KSuImq
bIRZF0kWQtdPKRh+vD9fMzKmJHW7olUEHv5MywAhdUDtpnfUAosNhLmcR+VGsDt8
eX79z5FfoWCkGmuHeHKv0JQCZZPo+sfJSv7MDigHnXQ0cYGp6j/IzerBAoGBAKjO
lZ+oruRKf0bwO2WWrerAxE6q7gBQnOvJEg6nwDxQ5foAEAfl68OA5okPC9mAK/6L
hoPipr3ldoEGfdUWKvybqUGQf6uUF8X858OyaLBH3bVFveULVTp+D82TtB5RkldZ
gKVkGpzZlR4d8PfyCqdv87lp09gC23/pG3W/JIJrAoGAN5lE51P4G14x+KLbdpNI
6ooDxSPmxcugflZ6E+v16kov2MxPpIYO/ejyZ23OVu/jwfQ06+s+WhxtGX2tqb9q
HIZ/rOOeJARH1MeU2u3YNotSX+0gTZokz8T6SY1JDE8beNBWurk3q5dtPwlGVsh3
KijBkCW5hmwqMkfAUmSjWTU=
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
