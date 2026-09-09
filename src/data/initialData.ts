import { Room, Booking, ActivityLog, AdminUser } from '../types';

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'sekjen',
    name: 'Ruang Rapat Sekjen',
    capacity: 30,
    facilities: ['Smart TV 85" 4K', 'Zoom Room Dual PTZ Cam', 'Dual AC Central Daikin', 'WiFi Dedicated Gigabit', 'Audio Ceiling Mic Array'],
    location: 'Lantai 3, Sayap Barat',
    googleCalendarId: 'cal-sekjen@instansi.go.id',
    status: 'active',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdiH3J350p32a5sjZGeHeu64in3yMJmMaL20fAW5CsO5S6EJ6NLWhlYO6HHl_7s63iQwyA27CV6t2TbIzlsCbioGa7lGSbEfZi-L4-KyK4C8vXmoHeYXMTZ827iw8XUtSZMs9Xev83Tb2s9FjocyQoU3abWYWwEmW1bNj54jKW1UhtVUFc65U8DZEKhfOsQpBBacu6a6zDDhodDdCxPDnylLQVPaNcLczD44Ut7dKBAd_cx_hA7GZD',
    description: 'Bilik representatif berskala penuh dengan meja U-shape kenari solid, sistem audio-visual ceiling mikrofon akustik kedap gema, serta stasiun penyegar kopi mandiri.',
  },
  {
    id: 'vip',
    name: 'Ruang VIP',
    capacity: 15,
    facilities: ['Smart Touchscreen 65"', 'AC Central Daikin', 'High-Speed Dedicated WiFi 300 Mbps', 'Soundproof Acoustic Wall', 'Wireless Pod Conference Mic'],
    location: 'Lantai 2, Sayap Timur',
    googleCalendarId: 'cal-vip@instansi.go.id',
    status: 'active',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVdPMIASBGuxELVFMYsx4GLZ347oKo8lXFIYRRFk8M9pihH2mMroGFWkvG3yHuOO0_Ib_AkVefaxlSSzku18NRDFRRX86ypJ9ssfeKRXNX81pHKNF9NR57gURoVkpxcxvcacqvDNB8BTpjj99KylptJrfyoYS0U9YAAlTGsUkmVAOB30rFYcJyoOIt_9hXXJtz88omPWqomSOOD-jIC7al7bNyC0Hy2Ds3E2t8iBJPIWSrdNdIHGv0',
    description: 'Dirancang untuk diskusi negosiasi bilateral tertutup, rapat audiensi khusus menteri, dan pertemuan jajaran direksi.',
  },
  {
    id: 'transit',
    name: 'Ruang Transit',
    capacity: 10,
    facilities: ['AC Central Daikin', 'Glass Whiteboard', 'Standard Flipchart', 'Dedicated Gigabit WiFi', 'Smart Screen 50"'],
    location: 'Lantai 1, Sayap Barat Laut',
    googleCalendarId: 'cal-transit@instansi.go.id',
    status: 'active',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpVHM2IT4AzC0KjDLn6ZcfSiU3cFtJ-PXuIDsHhFnm3Ygp6y9_v4nmdTWUNUAaE9mIoxH21ohN8E7i7UBEf4CqLfgao47MTHyIQ1sAmvu5wHZIrqm2habepSDQxm8jnGgf2NmWx6aBICr0gVRlherm1G0SFRqZcOkIEnET3GFNuyYdCvp3tAPMWYKN-DCUoDYCed5o2QL1cbAW5GcrhM4kRAJvB8drPIdxtE_GFOscqlha5NYn91hB',
    description: 'Cocok untuk sprint mingguan kilat, sinkronisasi manajerial, brainstorming terdesentralisasi, atau sesi interview kandidat.',
  },
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bkg-1',
    bookingCode: 'BKG-883921',
    roomId: 'sekjen',
    roomName: 'Ruang Rapat Sekjen',
    bookerName: 'Raden Satria Wibawa, S.T.',
    bookerEmail: 'satria.wibawa@instansi.go.id',
    division: 'Biro Keuangan & Perencanaan',
    meetingTitle: 'Koordinasi Anggaran Q4 & Sinkronisasi Belanja Modal',
    date: '2026-09-10',
    startTime: '09:00',
    endTime: '10:30',
    participantCount: 18,
    attendeesEmails: ['satria.wibawa@instansi.go.id', 'keuangan.q4@instansi.go.id'],
    extraNotes: 'Siapkan Zoom Bridge dan mic array',
    status: 'completed',
    googleEventId: 'gcal_8f99e3a1d04',
    manageToken: 'tok_883921_k9f02a',
    createdAt: '2026-09-08 10:15',
  },
  {
    id: 'bkg-2',
    bookingCode: 'BKG-441029',
    roomId: 'vip',
    roomName: 'Ruang VIP',
    bookerName: 'Dr. Hendra Prasetya',
    bookerEmail: 'hendra.p@instansi.go.id',
    division: 'Puslitbang & Kerja Sama Luar Negeri',
    meetingTitle: 'Kunjungan Tamu Eksternal & Negosiasi Bilateral',
    date: '2026-09-10',
    startTime: '13:00',
    endTime: '15:30',
    participantCount: 14,
    attendeesEmails: ['hendra.p@instansi.go.id', 'bilateral.partner@diplomat.org'],
    extraNotes: 'Layanan air mineral concierge & setting rapat diplomatik',
    status: 'in-progress',
    googleEventId: 'gcal_44a2b109e7c',
    manageToken: 'tok_441029_m8z31x',
    createdAt: '2026-09-09 14:20',
  },
  {
    id: 'bkg-3',
    bookingCode: 'BKG-772150',
    roomId: 'sekjen',
    roomName: 'Ruang Rapat Sekjen',
    bookerName: 'Bambang Hartono, M.Si.',
    bookerEmail: 'bambang.h@instansi.go.id',
    division: 'Biro SDM & Organisasi',
    meetingTitle: 'Rapat Kerja Pleno Divisi SDM & Evaluasi Kinerja',
    date: '2026-09-10',
    startTime: '14:00',
    endTime: '16:30',
    participantCount: 24,
    attendeesEmails: ['bambang.h@instansi.go.id', 'sdm.pleno@instansi.go.id'],
    extraNotes: 'Perlu dua layar smart TV menyala untuk pemaparan data',
    status: 'confirmed',
    googleEventId: 'gcal_11f4d920bb3',
    manageToken: 'tok_772150_w3v78p',
    createdAt: '2026-09-09 16:45',
  },
  {
    id: 'bkg-4',
    bookingCode: 'BKG-992301',
    roomId: 'transit',
    roomName: 'Ruang Transit',
    bookerName: 'Maya Wardani, S.Kom.',
    bookerEmail: 'maya.w@instansi.go.id',
    division: 'Tim TI & Transformasi Digital',
    meetingTitle: 'Sprint Evaluasi Proyek Digitalisasi Arsip',
    date: '2026-09-10',
    startTime: '16:00',
    endTime: '17:30',
    participantCount: 8,
    attendeesEmails: ['maya.w@instansi.go.id', 'sprint.team@instansi.go.id'],
    extraNotes: 'Whiteboard spidol hitam dan biru',
    status: 'confirmed',
    googleEventId: 'gcal_99bc042fa11',
    manageToken: 'tok_992301_d2q99a',
    createdAt: '2026-09-10 08:30',
  },
  {
    id: 'bkg-5',
    bookingCode: 'BKG-551201',
    roomId: 'sekjen',
    roomName: 'Ruang Rapat Sekjen',
    bookerName: 'Dra. Sri Wahyuni, M.M.',
    bookerEmail: 'sri.wahyuni@instansi.go.id',
    division: 'Sekretariat Jenderal',
    meetingTitle: 'Rapat Pimpinan Mingguan & Arahan Reformasi Birokrasi',
    date: '2026-09-07',
    startTime: '09:00',
    endTime: '12:00',
    participantCount: 28,
    attendeesEmails: ['sri.wahyuni@instansi.go.id'],
    extraNotes: 'Konfigurasi pleno pimpinan',
    status: 'completed',
    googleEventId: 'gcal_55a109',
    manageToken: 'tok_551201_a9',
    createdAt: '2026-09-04 11:00',
  },
  {
    id: 'bkg-6',
    bookingCode: 'BKG-551202',
    roomId: 'vip',
    roomName: 'Ruang VIP',
    bookerName: 'Ir. Ahmad Zarkasih',
    bookerEmail: 'ahmad.z@instansi.go.id',
    division: 'Biro Umum & Pengadaan',
    meetingTitle: 'Klarifikasi Dokumen Lelang Server Data Center',
    date: '2026-09-07',
    startTime: '13:30',
    endTime: '15:30',
    participantCount: 12,
    attendeesEmails: ['ahmad.z@instansi.go.id'],
    status: 'completed',
    googleEventId: 'gcal_55a110',
    manageToken: 'tok_551202_b1',
    createdAt: '2026-09-05 09:15',
  },
  {
    id: 'bkg-7',
    bookingCode: 'BKG-662301',
    roomId: 'transit',
    roomName: 'Ruang Transit',
    bookerName: 'Fajar Nugroho, S.T.',
    bookerEmail: 'fajar.n@instansi.go.id',
    division: 'Tim TI & Transformasi Digital',
    meetingTitle: 'Review Arsitektur Microservices API Gateway',
    date: '2026-09-08',
    startTime: '10:00',
    endTime: '12:00',
    participantCount: 8,
    attendeesEmails: ['fajar.n@instansi.go.id'],
    status: 'completed',
    googleEventId: 'gcal_66b201',
    manageToken: 'tok_662301_c3',
    createdAt: '2026-09-06 14:00',
  },
  {
    id: 'bkg-8',
    bookingCode: 'BKG-662302',
    roomId: 'sekjen',
    roomName: 'Ruang Rapat Sekjen',
    bookerName: 'Bambang Hartono, M.Si.',
    bookerEmail: 'bambang.h@instansi.go.id',
    division: 'Biro SDM & Organisasi',
    meetingTitle: 'Sosialisasi Penilaian Kinerja ASN Berbasis Kinerja',
    date: '2026-09-08',
    startTime: '13:00',
    endTime: '16:00',
    participantCount: 26,
    attendeesEmails: ['bambang.h@instansi.go.id'],
    status: 'completed',
    googleEventId: 'gcal_66b202',
    manageToken: 'tok_662302_d4',
    createdAt: '2026-09-06 15:30',
  },
  {
    id: 'bkg-9',
    bookingCode: 'BKG-773401',
    roomId: 'vip',
    roomName: 'Ruang VIP',
    bookerName: 'Dewi Lestari, S.H.',
    bookerEmail: 'dewi.l@instansi.go.id',
    division: 'Biro Hukum',
    meetingTitle: 'Harmonisasi Draft Peraturan Lembaga tentang AI',
    date: '2026-09-09',
    startTime: '09:30',
    endTime: '12:00',
    participantCount: 14,
    attendeesEmails: ['dewi.l@instansi.go.id'],
    status: 'completed',
    googleEventId: 'gcal_77c301',
    manageToken: 'tok_773401_e5',
    createdAt: '2026-09-07 10:20',
  },
  {
    id: 'bkg-10',
    bookingCode: 'BKG-773402',
    roomId: 'sekjen',
    roomName: 'Ruang Rapat Sekjen',
    bookerName: 'Raden Satria Wibawa, S.T.',
    bookerEmail: 'satria.wibawa@instansi.go.id',
    division: 'Biro Keuangan & Perencanaan',
    meetingTitle: 'Sinkronisasi RKA-K/L Tahun Anggaran 2027',
    date: '2026-09-09',
    startTime: '13:30',
    endTime: '16:30',
    participantCount: 22,
    attendeesEmails: ['satria.wibawa@instansi.go.id'],
    status: 'completed',
    googleEventId: 'gcal_77c302',
    manageToken: 'tok_773402_f6',
    createdAt: '2026-09-07 16:00',
  },
  {
    id: 'bkg-11',
    bookingCode: 'BKG-884501',
    roomId: 'sekjen',
    roomName: 'Ruang Rapat Sekjen',
    bookerName: 'Prof. Dr. Ir. Gunawan',
    bookerEmail: 'gunawan@instansi.go.id',
    division: 'Puslitbang & Kerja Sama Luar Negeri',
    meetingTitle: 'Focus Group Discussion Kerjasama Riset Multilateral',
    date: '2026-09-11',
    startTime: '09:00',
    endTime: '11:30',
    participantCount: 25,
    attendeesEmails: ['gunawan@instansi.go.id'],
    status: 'confirmed',
    googleEventId: 'gcal_88d401',
    manageToken: 'tok_884501_g7',
    createdAt: '2026-09-08 13:10',
  },
  {
    id: 'bkg-12',
    bookingCode: 'BKG-884502',
    roomId: 'transit',
    roomName: 'Ruang Transit',
    bookerName: 'Nurul Hidayah, S.Sos.',
    bookerEmail: 'nurul.h@instansi.go.id',
    division: 'Biro Hubungan Masyarakat',
    meetingTitle: 'Briefing Press Conference Peluncuran Sistem Terpadu',
    date: '2026-09-11',
    startTime: '13:30',
    endTime: '15:00',
    participantCount: 9,
    attendeesEmails: ['nurul.h@instansi.go.id'],
    status: 'confirmed',
    googleEventId: 'gcal_88d402',
    manageToken: 'tok_884502_h8',
    createdAt: '2026-09-09 11:45',
  },
  {
    id: 'bkg-13',
    bookingCode: 'BKG-995601',
    roomId: 'vip',
    roomName: 'Ruang VIP',
    bookerName: 'Dr. Hendra Prasetya',
    bookerEmail: 'hendra.p@instansi.go.id',
    division: 'Puslitbang & Kerja Sama Luar Negeri',
    meetingTitle: 'Penandatanganan Nota Kesepahaman Riset Bersama',
    date: '2026-09-12',
    startTime: '10:00',
    endTime: '12:00',
    participantCount: 12,
    attendeesEmails: ['hendra.p@instansi.go.id'],
    status: 'confirmed',
    googleEventId: 'gcal_99e501',
    manageToken: 'tok_995601_i9',
    createdAt: '2026-09-09 15:30',
  },
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    timestamp: '10 Sep 2026, 08:30 WIB',
    actor: 'Maya Wardani',
    division: 'Tim TI & Transformasi Digital',
    action: 'created',
    roomName: 'Ruang Transit',
    bookingCode: 'BKG-992301',
    googleSyncId: 'gcal_99bc042fa11',
    details: 'Pemesanan baru (16:00 - 17:30 WIB) untuk Sprint Evaluasi Proyek Digitalisasi Arsip.',
  },
  {
    id: 'log-2',
    timestamp: '09 Sep 2026, 16:45 WIB',
    actor: 'Bambang Hartono',
    division: 'Biro SDM & Organisasi',
    action: 'created',
    roomName: 'Ruang Rapat Sekjen',
    bookingCode: 'BKG-772150',
    googleSyncId: 'gcal_11f4d920bb3',
    details: 'Pemesanan baru (14:00 - 16:30 WIB) 24 Pax disinkronkan ke Google Workspace.',
  },
  {
    id: 'log-3',
    timestamp: '09 Sep 2026, 14:20 WIB',
    actor: 'Dr. Hendra Prasetya',
    division: 'Puslitbang',
    action: 'created',
    roomName: 'Ruang VIP',
    bookingCode: 'BKG-441029',
    googleSyncId: 'gcal_44a2b109e7c',
    details: 'Pemesanan baru sesi negosiasi bilateral (13:00 - 15:30 WIB).',
  },
  {
    id: 'log-4',
    timestamp: '08 Sep 2026, 11:15 WIB',
    actor: 'Raden Mas Admin (Office Manager)',
    division: 'Meja Resepsionis & Concierge',
    action: 'overridden',
    roomName: 'Ruang Rapat Sekjen',
    bookingCode: 'BKG-883921',
    googleSyncId: 'gcal_8f99e3a1d04',
    details: 'Verifikasi concierge dan penambahan audio-visual priority override.',
  },
];

export const CURRENT_ADMIN: AdminUser = {
  id: 'adm-01',
  name: 'Raden Mas Admin',
  email: 'admin.office@instansi.go.id',
  role: 'super-admin',
  division: 'Office Manager / Concierge Desk',
};

// Storage helper functions
export const STORAGE_KEY_ROOMS = 'concierge_rooms_v1';
export const STORAGE_KEY_BOOKINGS = 'concierge_bookings_v1';
export const STORAGE_KEY_LOGS = 'concierge_logs_v1';

export function loadSavedRooms(): Room[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ROOMS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load rooms from localStorage', e);
  }
  return INITIAL_ROOMS;
}

export function saveRooms(rooms: Room[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(rooms));
  } catch (e) {
    console.error('Failed to save rooms to localStorage', e);
  }
}

export function loadSavedBookings(): Booking[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load bookings from localStorage', e);
  }
  return INITIAL_BOOKINGS;
}

export function saveBookings(bookings: Booking[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
  } catch (e) {
    console.error('Failed to save bookings to localStorage', e);
  }
}

export function loadSavedLogs(): ActivityLog[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LOGS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load logs from localStorage', e);
  }
  return INITIAL_ACTIVITY_LOGS;
}

export function saveLogs(logs: ActivityLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save logs to localStorage', e);
  }
}

// Convert "HH:MM" to minutes for comparison
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

// Check if two time intervals overlap
export function isOverlapping(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && s2 < e1;
}

// Generate randomized 6-digit booking code
export function generateBookingCode(): string {
  const chars = '0123456789';
  let num = '';
  for (let i = 0; i < 6; i++) {
    num += chars[Math.floor(Math.random() * chars.length)];
  }
  return `BKG-${num}`;
}
