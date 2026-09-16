-- ROOMBOOK - Database Schema PostgreSQL (TU SEKJEN)
-- DDL untuk sistem peminjaman ruang rapat

-- 1. Tabel Ruangan (rooms)
CREATE TABLE IF NOT EXISTS rooms (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(128) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  capacity INT NOT NULL DEFAULT 10,
  location VARCHAR(255) NOT NULL,
  facilities TEXT[] NOT NULL DEFAULT '{}',
  requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
  approver_name VARCHAR(255) DEFAULT 'Administrator Pengelola',
  approver_email VARCHAR(255) DEFAULT 'admin.mrbs@gmail.com',
  description TEXT,
  google_calendar_id VARCHAR(255),
  is_special_accent BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Peminjaman (bookings)
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(64) PRIMARY KEY,
  room_slug VARCHAR(128) NOT NULL REFERENCES rooms(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  room_name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  organizer_id VARCHAR(64) NOT NULL,
  organizer_name VARCHAR(255) NOT NULL,
  organizer_email VARCHAR(255) NOT NULL,
  organizer_dept VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  start_time VARCHAR(10) NOT NULL,
  end_time VARCHAR(10) NOT NULL,
  attendee_count INT NOT NULL DEFAULT 1,
  attendees TEXT[] DEFAULT '{}',
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
  rejection_reason TEXT,
  approved_by VARCHAR(255),
  approved_at VARCHAR(64),
  rescheduled_at VARCHAR(64),
  reschedule_reason TEXT,
  created_at VARCHAR(64) NOT NULL,
  google_calendar_event_id VARCHAR(255),
  synced_to_google BOOLEAN DEFAULT FALSE
);

-- 3. Tabel Pengguna (users)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  role VARCHAR(32) NOT NULL DEFAULT 'employee',
  department VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at VARCHAR(64) NOT NULL
);

-- 4. Tabel Notifikasi (notifications)
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  type VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  timestamp VARCHAR(64) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  booking_id VARCHAR(64),
  action_url VARCHAR(255)
);

-- 5. Tabel Audit Log (audit_logs)
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  timestamp VARCHAR(64) NOT NULL,
  action VARCHAR(64) NOT NULL,
  actor_name VARCHAR(255) NOT NULL,
  actor_role VARCHAR(32) NOT NULL,
  details TEXT NOT NULL,
  target_id VARCHAR(64)
);

-- Indeks untuk pencarian cepat
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_room ON bookings(room_slug);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(is_read);
