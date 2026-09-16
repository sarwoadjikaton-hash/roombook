import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useBooking } from '../../context/BookingContext';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  UserPlus,
  Server,
  ArrowRight,
  X,
  Calendar,
  Building2,
  User,
  ShieldCheck,
} from 'lucide-react';
import { AdminNotification } from '../../types';

export const NotificationPopover: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedNotif, setSelectedNotif] = useState<AdminNotification | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    approveBooking,
    rejectBooking,
    bookings,
  } = useBooking();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayedNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const handleNotificationClick = (notif: AdminNotification) => {
    markNotificationAsRead(notif.id);
    setSelectedNotif(notif);
    setIsOpen(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'pending_approval':
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <Clock size={18} strokeWidth={2.5} />
          </div>
        );
      case 'booking_approved':
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <CheckCircle2 size={18} strokeWidth={2.5} />
          </div>
        );
      case 'booking_rejected':
        return (
          <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <XCircle size={18} strokeWidth={2.5} />
          </div>
        );
      case 'user_created':
        return (
          <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <UserPlus size={18} strokeWidth={2.5} />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <Server size={18} strokeWidth={2.5} />
          </div>
        );
    }
  };

  // Terkait booking jika ada bookingId
  const relatedBooking = selectedNotif?.bookingId
    ? bookings.find((b) => b.id === selectedNotif.bookingId)
    : null;

  return (
    <>
      <div className="relative" ref={popoverRef}>
        {/* Bell Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:text-stone-900 transition-all active:scale-95 shadow-sm"
          aria-label="Notifikasi Admin"
        >
          <Bell size={19} />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-amber-500 text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
              {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Popover Card - Responsif: Fixed di tengah pada mobile, Absolute di bawah tombol pada desktop */}
        {isOpen && (
          <div
            className="fixed inset-x-3 top-[62px] sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:absolute w-auto sm:w-[380px] md:w-[420px] max-w-[calc(100vw-1.5rem)] bg-white dark:bg-stone-900 border-2 border-stone-300 dark:border-stone-700 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
          >
            {/* Header Popover */}
            <div className="p-4 border-b-2 border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-100 dark:bg-stone-800">
              <div className="flex items-center gap-2.5">
                <span className="font-black text-base text-stone-900 dark:text-white">Permohonan Masuk</span>
                {unreadNotificationsCount > 0 && (
                  <span className="px-2.5 py-0.5 text-[11px] font-black bg-amber-500 text-white rounded-full shadow-sm">
                    {unreadNotificationsCount} Baru
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {unreadNotificationsCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllNotificationsAsRead()}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 text-stone-800 dark:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-600 transition-colors text-sm font-bold flex items-center gap-1 shadow-xs"
                    title="Tandai semua sudah dibaca"
                  >
                    <CheckCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Dibaca</span>
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={() => clearNotifications()}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
                    title="Hapus semua notifikasi permohonan"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tab */}
            <div className="px-4 py-2.5 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 flex items-center gap-2 text-sm">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white font-black shadow-sm'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700'
                }`}
              >
                Semua ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('unread')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                  filter === 'unread'
                    ? 'bg-blue-600 text-white font-black shadow-sm'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700'
                }`}
              >
                Belum Dibaca ({unreadNotificationsCount})
              </button>
            </div>

            {/* List Notifikasi */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-stone-200 dark:divide-stone-800 bg-white dark:bg-stone-900 custom-scrollbar">
              {displayedNotifications.length === 0 ? (
                <div className="py-12 px-4 text-center text-sm space-y-2">
                  <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center mx-auto">
                    <Bell size={22} />
                  </div>
                  <p className="font-extrabold text-stone-900 dark:text-stone-100 text-base">Tidak Ada Permohonan Baru</p>
                  <p className="text-stone-600 dark:text-stone-400 text-sm max-w-xs mx-auto">
                    Semua pengajuan peminjaman ruangan yang baru masuk dan membutuhkan persetujuan pengelola akan tampil di sini.
                  </p>
                </div>
              ) : (
                displayedNotifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-4 flex items-start gap-3.5 transition-all cursor-pointer group ${
                      !n.isRead
                        ? 'bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 dark:hover:bg-blue-900 border-l-4 border-l-blue-600'
                        : 'bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    {getIcon(n.type)}

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-black text-base text-stone-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 shadow-sm" />
                        )}
                      </div>

                      {/* Deskripsi Notifikasi */}
                      <p className="text-sm font-semibold text-stone-800 dark:text-stone-200 leading-relaxed">
                        {n.message}
                      </p>

                      <div className="flex items-center justify-between text-[11px] font-bold text-stone-600 dark:text-stone-400 pt-1.5">
                        <span className="font-mono bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700">
                          {n.timestamp}
                        </span>
                        <span className="text-blue-600 dark:text-blue-400 font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Rincian</span>
                          <ArrowRight size={13} strokeWidth={2.5} />
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL DETAIL NOTIFIKASI - Dirender via Portal ke document.body agar benar-benar di tengah layar */}
      {selectedNotif && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setSelectedNotif(null)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-stone-900 border-2 border-stone-300 dark:border-stone-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b-2 border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getIcon(selectedNotif.type)}
                <div>
                  <h3 className="text-base font-black text-stone-900 dark:text-white">
                    {selectedNotif.title}
                  </h3>
                  <p className="text-sm font-semibold text-stone-600 dark:text-stone-400">
                    Waktu: {selectedNotif.timestamp}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotif(null)}
                className="p-2 rounded-xl bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-200 hover:bg-stone-100 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 bg-white dark:bg-stone-900">
              {/* Pesan Utama */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-semibold text-base leading-relaxed">
                {selectedNotif.message}
              </div>

              {/* Rincian Tambahan jika permohonan booking */}
              {relatedBooking && (
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 space-y-3">
                  <div className="flex items-center gap-2 text-blue-900 dark:text-blue-100 font-black text-sm uppercase tracking-wider">
                    <ShieldCheck size={16} />
                    <span>Rincian Peminjaman Ruangan</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200">
                      <Building2 size={15} className="text-blue-600 shrink-0" />
                      <span className="font-extrabold">{relatedBooking.roomName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200">
                      <User size={15} className="text-blue-600 shrink-0" />
                      <span className="font-semibold">{relatedBooking.organizerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200 col-span-2">
                      <Calendar size={15} className="text-blue-600 shrink-0" />
                      <span className="font-semibold">
                        {relatedBooking.date} • {relatedBooking.startTime} - {relatedBooking.endTime} WIB
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-blue-200 dark:border-blue-800 flex items-center justify-between text-sm">
                    <span className="font-bold text-stone-600 dark:text-stone-400">Status Saat Ini:</span>
                    <span
                      className={`px-3 py-1 rounded-full font-black text-[11px] ${
                        relatedBooking.status === 'confirmed'
                          ? 'bg-emerald-500 text-white'
                          : relatedBooking.status === 'rejected'
                          ? 'bg-rose-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {relatedBooking.status === 'confirmed'
                        ? 'Disetujui'
                        : relatedBooking.status === 'rejected'
                        ? 'Ditolak'
                        : 'Menunggu Persetujuan'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer & Actions */}
            <div className="p-4 border-t-2 border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 flex items-center justify-end gap-2.5 flex-wrap">
              {relatedBooking && relatedBooking.status === 'pending' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      rejectBooking(relatedBooking.id, 'Ditolak melalui panel notifikasi');
                      setSelectedNotif(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle size={15} />
                    <span>Tolak Peminjaman</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      approveBooking(relatedBooking.id);
                      setSelectedNotif(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 size={15} />
                    <span>Setujui Peminjaman</span>
                  </button>
                </>
              )}

              {selectedNotif.actionUrl && (
                <button
                  type="button"
                  onClick={() => {
                    navigate(selectedNotif.actionUrl!);
                    setSelectedNotif(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Buka Halaman Terkait</span>
                  <ArrowRight size={14} />
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedNotif(null)}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-200 hover:bg-stone-100 font-bold text-sm transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};


