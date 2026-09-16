import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Pastikan direktori data ada
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

import bcrypt from 'bcryptjs';

const DEFAULT_HASH = bcrypt.hashSync('admin123', 10);

// Data awal default (Seeding)
const INITIAL_DATA = {
  rooms: [
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
      isSpecialAccent: false,
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
  ],
  bookings: [],
  users: [
    {
      id: 'usr-1',
      name: 'Siti Rahmawati (Super Admin)',
      email: 'superadmin@gmail.com',
      passwordHash: DEFAULT_HASH,
      role: 'superadmin',
      department: 'Biro Umum & Pengelola Fasilitas',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      isActive: true,
      createdAt: '2026-01-01 00:00:00',
    },
    {
      id: 'usr-2',
      name: 'Budi Santoso',
      email: 'admin.mrbs@gmail.com',
      passwordHash: DEFAULT_HASH,
      role: 'admin',
      department: 'Subbag Rumah Tangga & Ruangan',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      isActive: true,
      createdAt: '2026-01-05 09:00:00',
    },
    {
      id: 'usr-3',
      name: 'Ahmad Fauzi',
      email: 'ahmad.fauzi@gmail.com',
      passwordHash: DEFAULT_HASH,
      role: 'employee',
      department: 'Biro Kerjasama & Humas',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
      isActive: true,
      createdAt: '2026-01-10 10:00:00',
    },
  ],
  notifications: [],
  auditLogs: [],
};

// Inisialisasi database jika belum ada
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
}

export const readDb = () => {
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading database file:', error);
    return INITIAL_DATA;
  }
};

export const writeDb = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing database file:', error);
    return false;
  }
};
