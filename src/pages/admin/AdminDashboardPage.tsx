import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { BookingDetailModal } from '../../components/booking/BookingDetailModal';
import { Booking } from '../../types';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  DoorOpen,
  BarChart3,
  CheckCheck,
  Eye,
  TrendingUp,
  Clock,
  ArrowRight,
  Server,
  PlusCircle,
} from 'lucide-react';
import { BookingModal } from '../../components/booking/BookingModal';

export const AdminDashboardPage: React.FC = () => {
  const {
    rooms,
    bookings,
    auditLogs,
    approveBooking,
    rejectBooking,
  } = useBooking();

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  // Perhitungan KPI
  const pendingApprovals = bookings.filter((b) => b.status === 'pending');
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');

  let totalOperatingHours = 0;
  confirmedBookings.forEach((b) => {
    const [startH, startM] = b.startTime.split(':').map(Number);
    const [endH, endM] = b.endTime.split(':').map(Number);
    const hours = (endH * 60 + endM - (startH * 60 + startM)) / 60;
    totalOperatingHours += Math.max(0, hours);
  });

  const avgOccupancy = Math.min(100, (totalOperatingHours / (rooms.length * 220)) * 100);

  const handleApprove = (bookingId: string) => {
    approveBooking(bookingId);
  };

  const handleConfirmReject = (bookingId: string) => {
    if (!rejectReason.trim()) {
      alert('Mohon isi alasan penolakan.');
      return;
    }
    rejectBooking(bookingId, rejectReason.trim());
    setRejectingBookingId(null);
    setRejectReason('');
  };

  return (
    <div className="w-full space-y-8">
      {/* Header Admin Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-surface rounded-2xl border border-border p-7 sm:p-8 shadow-card">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 text-sm font-black bg-primary text-white rounded-md tracking-wider">
              PENGELOLA
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
              Panel Pengelola Ruang Rapat
            </h1>
          </div>
          <p className="text-base sm:text-base text-text-secondary">
            Pantau permohonan peminjaman, ketersediaan ruangan, dan ringkasan jadwal rapat.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-light text-white text-base font-black rounded-xl shadow-md transition-all active:scale-95"
          >
            <PlusCircle size={17} />
            <span>Buat Jadwal Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Pending Approvals */}
        <div className="bg-surface rounded-2xl border-2 border-amber-300 p-6 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-amber-800 uppercase tracking-wider">
              Menunggu Persetujuan
            </span>
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
              <ShieldCheck size={22} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-amber-900 tracking-tight">
            {pendingApprovals.length}
          </div>
          <p className="text-sm sm:text-base text-amber-800/80 font-medium">
            {pendingApprovals.length > 0 ? 'Perlu tindakan verifikasi Anda' : 'Semua permohonan sudah diproses'}
          </p>
        </div>

        {/* KPI 2: Total Active Rooms */}
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-text-secondary uppercase tracking-wider">
              Ruangan Aktif
            </span>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <DoorOpen size={22} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight">
            {rooms.length} Ruang
          </div>
          <p className="text-sm sm:text-base text-text-secondary font-medium">
            Siap digunakan
          </p>
        </div>

        {/* KPI 3: Total Confirmed Bookings */}
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-text-secondary uppercase tracking-wider">
              Total Rapat Terjadwal
            </span>
            <div className="p-2.5 rounded-xl bg-green-50 text-status-success">
              <CheckCheck size={22} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight">
            {confirmedBookings.length}
          </div>
          <p className="text-sm sm:text-base text-text-secondary font-medium">
            Jadwal rapat disetujui
          </p>
        </div>

        {/* KPI 4: Occupancy Rate & Google Service Account */}
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-text-secondary uppercase tracking-wider">
              Tingkat Penggunaan
            </span>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight">
            {avgOccupancy.toFixed(0)}%
          </div>
          <p className="text-sm sm:text-base text-text-secondary font-medium">
            Rata-rata okupansi ruangan
          </p>
        </div>
      </div>


      {/* Main Grid: Pending Approval Table & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom 1 & 2: Quick Approval Queue Table */}
        <div className="lg:col-span-2 bg-surface rounded-card border border-border p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-primary" />
              <h2 className="text-base font-bold text-text-primary">
                Permohonan Menunggu Persetujuan (Pending)
              </h2>
            </div>
            <Link
              to="/admin/approvals"
              className="text-sm text-primary hover:underline font-semibold flex items-center gap-1"
            >
              <span>Lihat Semua ({pendingApprovals.length})</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="text-center py-8 text-text-secondary text-sm">
              <CheckCheck size={32} className="mx-auto text-emerald-600 mb-1" />
              <p className="font-bold text-text-primary text-base">Tidak Ada Antrian Pending</p>
              <p className="text-stone-500 mt-0.5">Semua permohonan peminjaman ruangan telah diproses.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.slice(0, 4).map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text-primary text-base">{b.title}</span>
                      <span className="text-[10px] font-bold bg-accent/20 text-accent-dark px-1.5 py-0.2 rounded">
                        {b.roomName}
                      </span>
                    </div>
                    <div className="text-text-secondary flex flex-wrap items-center gap-2 text-[11px]">
                      <span>{b.date}</span>
                      <span>•</span>
                      <span className="font-mono font-bold text-text-primary">{b.startTime} - {b.endTime}</span>
                      <span>•</span>
                      <span>Pemohon: <strong>{b.organizerName}</strong> ({b.organizerDept})</span>
                    </div>
                  </div>

                  {rejectingBookingId === b.id ? (
                    <div className="w-full sm:w-auto p-2 bg-white rounded border border-red-300 space-y-2">
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Alasan penolakan..."
                        className="w-full p-1.5 border border-border text-sm rounded"
                      />
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setRejectingBookingId(null)}
                          className="px-2 py-0.5 text-[11px] bg-stone-200 rounded"
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => handleConfirmReject(b.id)}
                          className="px-2 py-0.5 text-[11px] bg-status-danger text-white rounded font-bold"
                        >
                          Kirim Tolak
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-white rounded transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => setRejectingBookingId(b.id)}
                        className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-status-danger rounded text-sm font-bold transition-colors"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => handleApprove(b.id)}
                        className="px-3 py-1 bg-status-success hover:bg-green-700 text-white rounded text-sm font-bold shadow-sm transition-all"
                      >
                        Setujui
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kolom 3: Shortcut & Audit Logs Feed */}
        <div className="space-y-6">
          {/* Quick Nav Cards */}
          <div className="bg-surface rounded-card border border-border p-4 shadow-card space-y-2">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider pb-2 border-b border-border">
              Menu Manajemen Cepat
            </h3>
            <div className="grid grid-cols-1 gap-2 pt-1">
              <Link
                to="/admin/rooms"
                className="flex items-center justify-between p-2.5 rounded-btn bg-stone-50 hover:bg-stone-100 border border-border text-sm font-semibold text-text-primary"
              >
                <div className="flex items-center gap-2">
                  <DoorOpen size={16} className="text-primary" />
                  <span>Master Data 3 Ruangan</span>
                </div>
                <ArrowRight size={13} className="text-stone-400" />
              </Link>

              <Link
                to="/admin/reports"
                className="flex items-center justify-between p-2.5 rounded-btn bg-stone-50 hover:bg-stone-100 border border-border text-sm font-semibold text-text-primary"
              >
                <div className="flex items-center gap-2">
                  <BarChart3 size={16} className="text-primary" />
                  <span>Laporan & Ekspor CSV/PDF</span>
                </div>
                <ArrowRight size={13} className="text-stone-400" />
              </Link>

              <Link
                to="/admin/google-sync"
                className="flex items-center justify-between p-2.5 rounded-btn bg-stone-50 hover:bg-stone-100 border border-border text-sm font-semibold text-text-primary"
              >
                <div className="flex items-center gap-2">
                  <Server size={16} className="text-primary" />
                  <span>Google Service Account</span>
                </div>
                <ArrowRight size={13} className="text-stone-400" />
              </Link>

              <Link
                to="/admin/audit"
                className="flex items-center justify-between p-2.5 rounded-btn bg-stone-50 hover:bg-stone-100 border border-border text-sm font-semibold text-text-primary"
              >
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-primary" />
                  <span>Rekam Jejak Audit Log</span>
                </div>
                <ArrowRight size={13} className="text-stone-400" />
              </Link>
            </div>
          </div>

          {/* Recent Audit Trail */}
          <div className="bg-surface rounded-card border border-border p-4 shadow-card space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-text-primary">Aktivitas Sistem Terkini</h3>
              <Link to="/admin/audit" className="text-[11px] text-primary hover:underline">
                Audit Trail →
              </Link>
            </div>

            <div className="space-y-2">
              {auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="text-sm pb-2 border-b border-border/50 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-[10px] text-text-secondary">
                    <span className="font-semibold text-text-primary">{log.actorName}</span>
                    <span className="font-mono">{log.timestamp.split(' ')[1]}</span>
                  </div>
                  <p className="text-[11px] text-stone-600 line-clamp-1 mt-0.5">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />

      {/* Detail Modal */}
      <BookingDetailModal
        booking={selectedBooking}
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    </div>
  );
};
