export interface Room {
  id: string;
  name: string;
  capacity: number;
  facilities: string[];
  location: string;
  googleCalendarId: string;
  status: 'active' | 'maintenance';
  image: string;
  description: string;
}

export interface Booking {
  id: string;
  bookingCode: string; // e.g. BKG-883921
  roomId: string;
  roomName: string;
  bookerName: string;
  bookerEmail: string;
  division: string;
  meetingTitle: string;
  date: string; // e.g. "2026-09-10"
  startTime: string; // e.g. "11:00"
  endTime: string; // e.g. "12:30"
  participantCount: number;
  attendeesEmails: string[];
  extraNotes?: string;
  status: 'confirmed' | 'cancelled' | 'in-progress' | 'completed';
  googleEventId: string;
  manageToken: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  actor: string;
  division: string;
  action: 'created' | 'modified' | 'cancelled' | 'overridden';
  roomName: string;
  bookingCode: string;
  googleSyncId: string;
  details: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super-admin' | 'admin' | 'concierge';
  division: string;
}

export type AppView = 
  | 'directory'      // Public room directory & daily ledger
  | 'my-booking'     // Cek & kelola booking tanpa login
  | 'voucher'        // Konfirmasi slip voucher resmi
  | 'email-preview'   // Pratinjau surel konfirmasi & kalender
  | 'kiosk'          // Tampilan monitor display luar bilik rapat (Sekjen, VIP, Transit)
  | 'admin'          // Dashboard Admin & laporan okupansi
  | 'stack-code';    // Laravel + Vue 3 + Inertia + Docker + Spatie code architecture
