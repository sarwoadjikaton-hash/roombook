import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Booking } from '../types';

export const formatDateIndonesian = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'EEEE, d MMMM yyyy', { locale: id });
};

export const formatShortDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'd MMM yyyy', { locale: id });
};

export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'HH:mm');
};

/**
 * Mengecek apakah dua rentang waktu saling bertabrakan/bentrok
 */
export const isTimeOverlap = (
  startA: string, // "09:00"
  endA: string,   // "11:00"
  startB: string, // "10:00"
  endB: string    // "12:00"
): boolean => {
  const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const aStart = toMinutes(startA);
  const aEnd = toMinutes(endA);
  const bStart = toMinutes(startB);
  const bEnd = toMinutes(endB);

  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
};

/**
 * Validasi apakah booking baru bentrok dengan jadwal yang sudah ada pada ruangan & tanggal yang sama
 */
export const checkBookingConflict = (
  bookings: Booking[],
  roomSlug: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): { hasConflict: boolean; conflictingBooking?: Booking } => {
  const activeBookings = bookings.filter(
    (b) =>
      b.roomSlug === roomSlug &&
      b.date === date &&
      (b.status === 'confirmed' || b.status === 'pending') &&
      b.id !== excludeBookingId
  );

  for (const b of activeBookings) {
    if (isTimeOverlap(startTime, endTime, b.startTime, b.endTime)) {
      return { hasConflict: true, conflictingBooking: b };
    }
  }

  return { hasConflict: false };
};

export type CurrentRoomStatus = {
  status: 'available' | 'occupied' | 'starting_soon';
  activeBooking?: Booking;
  nextBooking?: Booking;
  upcomingToday: Booking[];
  timeUntilNext?: string;
  freeUntil?: string;
};

/**
 * Menghitung status real-time suatu ruangan berdasarkan waktu sekarang
 */
export const getRoomRealTimeStatus = (
  bookings: Booking[],
  roomSlug: string,
  currentTime: Date = new Date()
): CurrentRoomStatus => {
  const todayStr = format(currentTime, 'yyyy-MM-dd');
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  // Booking hari ini yang aktif / confirmed
  const todayBookings = bookings
    .filter((b) => b.roomSlug === roomSlug && b.date === todayStr && b.status === 'confirmed')
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  let activeBooking: Booking | undefined;
  let startingSoonBooking: Booking | undefined;
  let nextBooking: Booking | undefined;
  const upcomingToday: Booking[] = [];

  for (const b of todayBookings) {
    const startMin = toMinutes(b.startTime);
    const endMin = toMinutes(b.endTime);

    if (currentMinutes >= startMin && currentMinutes < endMin) {
      activeBooking = b;
    } else if (currentMinutes < startMin) {
      upcomingToday.push(b);
      if (!nextBooking) {
        nextBooking = b;
        // Cek jika dimulai dalam <= 15 menit
        if (startMin - currentMinutes <= 15 && startMin - currentMinutes > 0) {
          startingSoonBooking = b;
        }
      }
    }
  }

  if (activeBooking) {
    return {
      status: 'occupied',
      activeBooking,
      nextBooking,
      upcomingToday,
    };
  }

  if (startingSoonBooking) {
    return {
      status: 'starting_soon',
      activeBooking: startingSoonBooking,
      nextBooking,
      upcomingToday,
    };
  }

  return {
    status: 'available',
    nextBooking,
    upcomingToday,
    freeUntil: nextBooking ? nextBooking.startTime : 'Selesai Hari Ini',
  };
};

/**
 * Menghasilkan daftar slot jam operasional (08:00 sampai 18:00)
 */
export const OPERATING_HOURS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00'
];

export interface BookingUrgencyInfo {
  level: 'critical' | 'warning' | 'safe';
  badgeText: string;
  badgeClass: string;
  description: string;
  hoursUntilMeeting: number;
  daysUntilMeeting: number;
  isPastH2: boolean;
  borderClass: string;
  bgClass: string;
}

/**
 * Menghitung tingkat urgensi persetujuan administrator dengan batas waktu H-2
 */
export const getBookingUrgency = (date: string, startTime: string): BookingUrgencyInfo => {
  const now = new Date();
  const meetingDateTime = new Date(`${date}T${startTime}:00`);
  const diffMs = meetingDateTime.getTime() - now.getTime();
  const hoursUntilMeeting = diffMs / (1000 * 60 * 60);
  const daysUntilMeeting = hoursUntilMeeting / 24;

  // Batas H-2 adalah 48 jam sebelum pelaksanaan
  if (hoursUntilMeeting <= 48) {
    const isPastH2 = true;
    let desc = '';
    if (hoursUntilMeeting <= 0) {
      desc = 'Waktu pelaksanaan rapat telah dimulai / terlewat.';
    } else if (hoursUntilMeeting <= 24) {
      desc = `Segera setujui! Rapat dimulai dalam ${Math.max(1, Math.round(hoursUntilMeeting))} jam (Hari H / H-1).`;
    } else {
      desc = `Batas H-2 telah terlewati! Sisa waktu menuju rapat ${Math.round(hoursUntilMeeting)} jam.`;
    }

    return {
      level: 'critical',
      badgeText: '🚨 Sangat Mendesak (< H-2)',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse font-black',
      description: desc,
      hoursUntilMeeting,
      daysUntilMeeting,
      isPastH2,
      borderClass: 'border-rose-400 ring-2 ring-rose-200/80',
      bgClass: 'bg-rose-50/50',
    };
  }

  // Mendekati batas H-2 (antara 48 jam sampai 72 jam / 2 s.d 3 hari)
  if (hoursUntilMeeting <= 72) {
    const hoursToH2 = Math.round(hoursUntilMeeting - 48);
    return {
      level: 'warning',
      badgeText: '⚠️ Mendekati Batas H-2',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
      description: `Tersisa ${hoursToH2} jam menuju batas H-2 (Jadwal rapat ${Math.round(daysUntilMeeting)} hari lagi).`,
      hoursUntilMeeting,
      daysUntilMeeting,
      isPastH2: false,
      borderClass: 'border-amber-300',
      bgClass: 'bg-amber-50/30',
    };
  }

  // Waktu Aman (> 72 jam / > 3 hari)
  const safeDays = Math.round(daysUntilMeeting - 2);
  return {
    level: 'safe',
    badgeText: '⏳ Waktu Aman (> H-3)',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
    description: `Batas persetujuan masih ${safeDays} hari lagi (Jadwal rapat ${Math.round(daysUntilMeeting)} hari lagi).`,
    hoursUntilMeeting,
    daysUntilMeeting,
    isPastH2: false,
    borderClass: 'border-stone-200',
    bgClass: 'bg-surface',
  };
};

/**
 * Menghasilkan URL Google Calendar Add Event untuk pemohon
 */
export const getGoogleCalendarUrl = (booking: {
  title: string;
  description?: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
}): string => {
  const startClean = booking.startTime.replace(':', '');
  const endClean = booking.endTime.replace(':', '');
  const dateClean = booking.date.replace(/-/g, '');
  const datesParam = `${dateClean}T${startClean}00/${dateClean}T${endClean}00`;

  const text = encodeURIComponent(booking.title || 'Rapat di Ruangan');
  const details = encodeURIComponent(
    `${booking.description || ''}\n\nLokasi: ${booking.roomName}\nSIRAPAT - Sistem Informasi Reservasi Ruang Rapat (Kemnaker RI).`
  );
  const location = encodeURIComponent(`${booking.roomName}, Gedung Kementerian Ketenagakerjaan RI`);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${datesParam}&details=${details}&location=${location}`;
};

