import { Room, Booking, User, AuditLog, AdminNotification, CustomFacility } from '../types';
import { format } from 'date-fns';

export const INITIAL_FACILITIES: CustomFacility[] = [
  { id: 'smart_tv', name: 'TV Pintar', isDefault: true },
  { id: 'zoom_room', name: 'Konferensi Video', isDefault: true },
  { id: 'ac', name: 'AC', isDefault: true },
  { id: 'wifi', name: 'WiFi', isDefault: true },
  { id: 'projector', name: 'Proyektor', isDefault: true },
  { id: 'whiteboard', name: 'Papan Tulis', isDefault: true },
  { id: 'sound_system', name: 'Pengeras Suara', isDefault: true },
];

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-1',
    slug: 'ruang-sekjen',
    name: 'Ruang Rapat Sekjen',
    capacity: 30,
    location: 'Lantai 3, Gedung Utama (Sayap Barat)',
    facilities: ['smart_tv', 'zoom_room', 'ac', 'wifi', 'sound_system'],
    requiresApproval: true,
    approverName: 'Administrator Pengelola',
    approverEmail: 'admin.mrbs@gmail.com',
    description: 'Ruang rapat eksekutif berkapasitas besar dengan integrasi Zoom Room terdedikasi dan Smart TV 85 inch. Dikhususkan untuk rapat pimpinan, audiensi, dan koordinasi strategis.',
    googleCalendarId: 'c_sekjen_instansi@group.calendar.google.com',
    isSpecialAccent: true,
    imageUrl: '/rooms/ruang-sekjen-1.jpg',
    images: [
      '/rooms/ruang-sekjen-1.jpg',
      '/rooms/ruang-sekjen-2.jpg',
      '/rooms/ruang-sekjen-3.jpg',
      '/rooms/ruang-sekjen-4.jpg',
      '/rooms/ruang-sekjen-5.jpg',
    ],
  },
  {
    id: 'room-2',
    slug: 'ruang-vip',
    name: 'Ruang VIP',
    capacity: 15,
    location: 'Lantai 2, Gedung Utama',
    facilities: ['ac', 'wifi', 'smart_tv', 'whiteboard'],
    requiresApproval: true,
    approverName: 'Administrator Pengelola',
    approverEmail: 'admin.mrbs@gmail.com',
    description: 'Ruang rapat representatif untuk pertemuan semi-formal, penerimaan tamu khusus, atau rapat koordinasi antar divisi.',
    googleCalendarId: 'c_vip_instansi@group.calendar.google.com',
    isSpecialAccent: false,
    imageUrl: '/rooms/ruang-vip-1.jpg',
    images: [
      '/rooms/ruang-vip-1.jpg',
      '/rooms/ruang-vip-2.jpg',
    ],
  },
  {
    id: 'room-3',
    slug: 'ruang-transit',
    name: 'Ruang Transit',
    capacity: 10,
    location: 'Lantai 1, Dekat Lobby',
    facilities: ['ac', 'wifi', 'whiteboard'],
    requiresApproval: true,
    approverName: 'Administrator Pengelola',
    approverEmail: 'admin.mrbs@gmail.com',
    description: 'Ruang diskusi cepat, rapat kerja taktis, dan transit peserta sebelum acara utama. Wajib disetujui Administrator Pengelola.',
    googleCalendarId: 'c_transit_instansi@group.calendar.google.com',
    isSpecialAccent: false,
    imageUrl: '/rooms/ruang-transit-1.jpg',
    images: [
      '/rooms/ruang-transit-1.jpg',
      '/rooms/ruang-transit-2.jpg',
      '/rooms/ruang-transit-3.jpg',
    ],
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Siti Rahmawati (Super Admin)',
    email: 'superadmin@gmail.com',
    role: 'superadmin',
    department: 'Biro Umum & Pengelola Fasilitas',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    isActive: true,
    createdAt: '2026-01-01 08:00:00',
  },
  {
    id: 'usr-2',
    name: 'Budi Santoso, M.Si (Admin Layanan)',
    email: 'admin.mrbs@gmail.com',
    role: 'admin',
    department: 'Bagian Umum & Protokol',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    isActive: true,
    createdAt: '2026-01-15 09:00:00',
  },
  {
    id: 'usr-3',
    name: 'Ahmad Fauzi (Admin Operasional)',
    email: 'ahmad.fauzi@gmail.com',
    role: 'admin',
    department: 'Subbag Rumah Tangga & Fasilitas',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    isActive: true,
    createdAt: '2026-02-01 10:00:00',
  },
  {
    id: 'usr-4',
    name: 'Kiosk Monitor',
    email: 'display@gmail.com',
    role: 'display',
    department: 'Layar Display Ruangan',
    isActive: true,
    createdAt: '2026-01-01 00:00:00',
  }
];

const todayStr = format(new Date(), 'yyyy-MM-dd');

export const INITIAL_BOOKINGS: Booking[] = [];

export const INITIAL_NOTIFICATIONS: AdminNotification[] = [];


export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: `${todayStr} 08:30:00`,
    action: 'approve_booking',
    actorName: 'Administrator Pengelola',
    actorRole: 'admin',
    details: 'Menyetujui booking "Evaluasi Implementasi Kebijakan SPBE" pada Ruang Rapat Sekjen.',
    targetId: 'bk-102',
  },
  {
    id: 'log-2',
    timestamp: `${todayStr} 08:15:00`,
    action: 'create_booking',
    actorName: 'Ahmad Fauzi',
    actorRole: 'employee',
    details: 'Mengajukan pemesanan baru "Audiensi Asosiasi Industri Digital" (Menunggu Persetujuan Admin).',
    targetId: 'bk-103',
  },
  {
    id: 'log-3',
    timestamp: `${todayStr} 08:00:00`,
    action: 'approve_booking',
    actorName: 'Administrator Pengelola',
    actorRole: 'admin',
    details: 'Menyetujui booking "Rakor Pimpinan Anggaran Q4" pada Ruang Rapat Sekjen.',
    targetId: 'bk-101',
  },
  {
    id: 'log-4',
    timestamp: `${todayStr} 07:30:00`,
    action: 'create_booking',
    actorName: 'Ahmad Fauzi',
    actorRole: 'employee',
    details: 'Mengajukan pemesanan "Koordinasi Tim Hukum & Regulasi" pada Ruang VIP (Menunggu Persetujuan Admin).',
    targetId: 'bk-202',
  },
  {
    id: 'log-5',
    timestamp: `${todayStr} 07:00:00`,
    action: 'sync_calendar',
    actorName: 'Sistem Sinkronisasi',
    actorRole: 'admin',
    details: 'Sinkronisasi 2-arah Google Calendar Resource berhasil untuk 3 ruangan.',
  }
];
