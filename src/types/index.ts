export type UserRole = 'superadmin' | 'admin' | 'employee' | 'display' | 'public';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatarUrl?: string;
  password?: string;
  isActive?: boolean;
  createdAt?: string;
}

export type FacilityType = string;

export interface CustomFacility {
  id: string;
  name: string;
  iconName?: string;
  isDefault?: boolean;
}

export interface Room {
  id: string;
  slug: string;
  name: string;
  capacity: number;
  location: string;
  facilities: FacilityType[];
  requiresApproval: boolean;
  approverName?: string;
  approverEmail?: string;
  description: string;
  googleCalendarId: string;
  isSpecialAccent?: boolean;
  imageUrl?: string;
  images?: string[];
}

export type BookingStatus = 'confirmed' | 'pending' | 'rejected' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  roomSlug: string;
  roomName: string;
  title: string;
  description?: string;
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  organizerDept: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  attendeeCount: number;
  attendees: string[]; // email / names
  status: BookingStatus;
  requiresApproval: boolean;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  googleCalendarEventId?: string;
  syncedToGoogle: boolean;
}

export interface AdminNotification {
  id: string;
  type: 'pending_approval' | 'booking_approved' | 'booking_rejected' | 'user_created' | 'system_alert';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  bookingId?: string;
  actionUrl?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action:
    | 'create_booking'
    | 'approve_booking'
    | 'reject_booking'
    | 'cancel_booking'
    | 'edit_booking'
    | 'quick_book'
    | 'sync_calendar'
    | 'create_room'
    | 'update_room'
    | 'delete_room'
    | 'manage_facilities'
    | 'create_user'
    | 'update_user'
    | 'delete_user';
  actorName: string;
  actorRole: UserRole;
  details: string;
  targetId?: string;
}

export interface TimeSlot {
  time: string; // HH:mm
  isAvailable: boolean;
  booking?: Booking;
}

export interface RoomOccupancyStat {
  roomSlug: string;
  roomName: string;
  totalBookings: number;
  totalHours: number;
  occupancyRate: number;
  cancellationRate: number;
}
