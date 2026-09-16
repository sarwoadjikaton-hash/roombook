import { Booking, Room, User, AdminNotification, AuditLog } from '../types';

const API_BASE = '/api';

/**
 * Membersihkan nilai string dari karakter kontrol (ASCII 0-31) dan karakter
 * non-printable yang dapat menyebabkan JSON parse error di server.
 */
function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    // Hapus karakter kontrol kecuali tab (\t), newline (\n), carriage return (\r)
    return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, sanitizeValue(v)])
    );
  }
  return value;
}

// Helper fetch wrapper
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }

  return res.json();
}

// Helper untuk serialize body dengan sanitasi otomatis
function safeBody(data: unknown): string {
  return JSON.stringify(sanitizeValue(data));
}


export const api = {
  // Health
  checkHealth: () => fetchJson<{ status: string; time: string }>(`${API_BASE}/health`),

  // Auth: Verifikasi Login dengan Hash Bcrypt di Server
  login: (email: string, password: string) =>
    fetchJson<{ success: boolean; user: User }>(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: safeBody({ email, password }),
    }),
  resetPassword: (data: { email: string; newPassword?: string }) =>
    fetchJson<{ success: boolean; message: string; tempPassword?: string }>(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      body: safeBody(data),
    }),

  // Rooms
  getRooms: () => fetchJson<Room[]>(`${API_BASE}/rooms`),
  getRoomBySlug: (slug: string) => fetchJson<Room>(`${API_BASE}/rooms/${slug}`),
  createRoom: (room: Partial<Room>) =>
    fetchJson<Room>(`${API_BASE}/rooms`, {
      method: 'POST',
      body: safeBody(room),
    }),
  updateRoom: (id: string, room: Partial<Room>) =>
    fetchJson<Room>(`${API_BASE}/rooms/${id}`, {
      method: 'PUT',
      body: safeBody(room),
    }),
  deleteRoom: (id: string) =>
    fetchJson<{ success: boolean }>(`${API_BASE}/rooms/${id}`, {
      method: 'DELETE',
    }),

  // Bookings
  getBookings: () => fetchJson<Booking[]>(`${API_BASE}/bookings`),
  createBooking: (booking: Partial<Booking>) =>
    fetchJson<Booking>(`${API_BASE}/bookings`, {
      method: 'POST',
      body: safeBody(booking),
    }),
  updateBooking: (id: string, booking: Partial<Booking>) =>
    fetchJson<Booking>(`${API_BASE}/bookings/${id}`, {
      method: 'PUT',
      body: safeBody(booking),
    }),
  rescheduleBooking: (id: string, data: { date: string; startTime: string; endTime: string; reason?: string; requestedBy?: string }) =>
    fetchJson<Booking>(`${API_BASE}/bookings/${id}/reschedule`, {
      method: 'POST',
      body: safeBody(data),
    }),
  approveBooking: (id: string, data: { adminName?: string; adminRole?: string; booking?: Booking }) =>
    fetchJson<Booking>(`${API_BASE}/bookings/${id}/approve`, {
      method: 'POST',
      body: safeBody(data),
    }),
  rejectBooking: (id: string, data: { reason: string; adminName?: string; adminRole?: string }) =>
    fetchJson<Booking>(`${API_BASE}/bookings/${id}/reject`, {
      method: 'POST',
      body: safeBody(data),
    }),
  cancelBooking: (id: string, data?: { cancelledBy?: string; cancelReason?: string }) =>
    fetchJson<{ success: boolean }>(`${API_BASE}/bookings/${id}`, {
      method: 'DELETE',
      body: safeBody(data || {}),
    }),

  // Users
  getUsers: () => fetchJson<User[]>(`${API_BASE}/users`),
  createUser: (user: Partial<User>) =>
    fetchJson<User>(`${API_BASE}/users`, {
      method: 'POST',
      body: safeBody(user),
    }),
  updateUser: (id: string, user: Partial<User>) =>
    fetchJson<User>(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      body: safeBody(user),
    }),
  updateUserPassword: (id: string, data: { currentPassword?: string; newPassword: string; adminName?: string; adminRole?: string }) =>
    fetchJson<{ success: boolean; message: string }>(`${API_BASE}/users/${id}/password`, {
      method: 'PUT',
      body: safeBody(data),
    }),
  deleteUser: (id: string) =>
    fetchJson<{ success: boolean }>(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
    }),

  // Notifications
  getNotifications: () => fetchJson<AdminNotification[]>(`${API_BASE}/notifications`),
  markNotificationAsRead: (id: string) =>
    fetchJson<AdminNotification>(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
    }),
  markAllNotificationsAsRead: () =>
    fetchJson<{ success: boolean; notifications: AdminNotification[] }>(`${API_BASE}/notifications/mark-all-read`, {
      method: 'POST',
    }),
  deleteNotification: (id: string) =>
    fetchJson<{ success: boolean }>(`${API_BASE}/notifications/${id}`, {
      method: 'DELETE',
    }),
  clearAllNotifications: () =>
    fetchJson<{ success: boolean; count: number }>(`${API_BASE}/notifications/clear-all`, {
      method: 'DELETE',
    }),

  // Audit Logs
  getAuditLogs: () => fetchJson<AuditLog[]>(`${API_BASE}/audit-logs`),
  createAuditLog: (log: Partial<AuditLog>) =>
    fetchJson<AuditLog>(`${API_BASE}/audit-logs`, {
      method: 'POST',
      body: safeBody(log),
    }),

  // Google Calendar Integration
  testGoogleCalendar: (calendarId: string) =>
    fetchJson<{ success: boolean; summary?: string; message?: string; error?: string }>(
      `${API_BASE}/google-calendar/test`,
      {
        method: 'POST',
        body: safeBody({ calendarId }),
      }
    ),
  syncAllGoogleCalendar: () =>
    fetchJson<{ success: boolean; syncedCount: number; message: string }>(
      `${API_BASE}/google-calendar/sync-all`,
      {
        method: 'POST',
      }
    ),
};

