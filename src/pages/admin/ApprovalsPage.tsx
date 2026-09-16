import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { BookingDetailModal } from '../../components/booking/BookingDetailModal';
import { Booking } from '../../types';
import { formatDateIndonesian, getBookingUrgency } from '../../utils/dateUtils';
import {
  ShieldCheck,
  CheckCheck,
  XCircle,
  Clock,
  Calendar,
  Building,
  Users,
  Eye,
  Flame,
  CheckCircle2,
  CalendarClock,
} from 'lucide-react';

export const ApprovalsPage: React.FC = () => {
  const { bookings, approveBooking, rejectBooking, rooms } = useBooking();
  const [filterRoom, setFilterRoom] = useState<string>('all');
  const [filterUrgency, setFilterUrgency] = useState<'all' | 'critical' | 'warning' | 'safe'>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  // Seluruh booking yang berstatus pending
  const allPendingBookings = bookings.filter((b) => b.status === 'pending');

  // Hitung jumlah per tingkat urgensi
  const criticalCount = allPendingBookings.filter(
    (b) => getBookingUrgency(b.date, b.startTime).level === 'critical'
  ).length;

  const warningCount = allPendingBookings.filter(
    (b) => getBookingUrgency(b.date, b.startTime).level === 'warning'
  ).length;

  const safeCount = allPendingBookings.filter(
    (b) => getBookingUrgency(b.date, b.startTime).level === 'safe'
  ).length;

  // Filter berdasarkan ruangan dan tingkat urgensi
  const filteredBookings = allPendingBookings
    .filter((b) => {
      if (filterRoom !== 'all' && b.roomSlug !== filterRoom) return false;
      if (filterUrgency !== 'all') {
        const urgency = getBookingUrgency(b.date, b.startTime);
        if (urgency.level !== filterUrgency) return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Prioritas 1: Urutkan berdasarkan level urgensi (critical -> warning -> safe)
      const urgencyRank: Record<string, number> = { critical: 1, warning: 2, safe: 3 };
      const rankA = urgencyRank[getBookingUrgency(a.date, a.startTime).level] || 99;
      const rankB = urgencyRank[getBookingUrgency(b.date, b.startTime).level] || 99;

      if (rankA !== rankB) return rankA - rankB;

      // Prioritas 2: Urutkan berdasarkan tanggal & jam mulai
      return `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`);
    });

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
    <div className="w-full space-y-7">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-card">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={28} className="text-primary" />
            <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
              Persetujuan Peminjaman Ruang
            </h1>
          </div>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            Daftar pengajuan peminjaman ruangan yang menunggu persetujuan pengelola TU SEKJEN. Batas waktu persetujuan adalah <strong>H-2 sebelum jadwal pelaksanaan</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-4 py-2 bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-sm sm:text-base font-black flex items-center gap-2 shadow-xs">
            <Clock size={16} />
            <span>{allPendingBookings.length} Menunggu Persetujuan</span>
          </span>
        </div>
      </div>

      {/* Banner Peringatan Urgensi Kritis (< H-2) */}
      {criticalCount > 0 && (
        <div className="p-4 sm:p-5 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-200 text-rose-800 rounded-xl shrink-0 mt-0.5">
              <Flame size={22} className="animate-pulse text-rose-600" />
            </div>
            <div className="space-y-0.5">
              <div className="font-black text-base sm:text-base text-rose-900 flex items-center gap-2">
                <span>Perhatian Pengelola: Ada {criticalCount} Permohonan Sangat Mendesak!</span>
              </div>
              <p className="text-sm text-rose-800 leading-relaxed">
                Terdapat <strong>{criticalCount} agenda rapat</strong> yang sudah melewati atau berada di bawah batas waktu H-2. Harap prioritaskan persetujuan/penolakan agar pemohon mendapatkan kepastian ruangan.
              </p>
            </div>
          </div>

          <button
            onClick={() => setFilterUrgency('critical')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-black transition-all shadow-xs shrink-0 self-start sm:self-center flex items-center gap-1.5"
          >
            <Flame size={14} />
            <span>Tampilkan Yang Mendesak ({criticalCount})</span>
          </button>
        </div>
      )}

      {/* Baris Filter: Filter Urgensi & Filter Ruangan */}
      <div className="space-y-3 bg-surface p-5 rounded-2xl border border-border shadow-xs">
        {/* Filter Urgensi (H-2 SOP) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <div className="flex items-center gap-2 text-sm font-black text-text-primary uppercase tracking-wider min-w-[130px]">
            <Flame size={15} className="text-primary" />
            <span>Status Urgensi:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterUrgency('all')}
              className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 border ${
                filterUrgency === 'all'
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-stone-50 text-text-secondary border-border hover:bg-stone-150'
              }`}
            >
              <span>Semua</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {allPendingBookings.length}
              </span>
            </button>

            <button
              onClick={() => setFilterUrgency('critical')}
              className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 border ${
                filterUrgency === 'critical'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : criticalCount > 0
                  ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                  : 'bg-stone-50 text-stone-400 border-border opacity-60'
              }`}
            >
              <span>🚨 Sangat Mendesak (&lt; H-2)</span>
              {criticalCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-200 text-rose-900 font-black">
                  {criticalCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setFilterUrgency('warning')}
              className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 border ${
                filterUrgency === 'warning'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : warningCount > 0
                  ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                  : 'bg-stone-50 text-stone-400 border-border opacity-60'
              }`}
            >
              <span>⚠️ Mendekati Batas (H-2 s/d H-3)</span>
              {warningCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 text-amber-900 font-black">
                  {warningCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setFilterUrgency('safe')}
              className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 border ${
                filterUrgency === 'safe'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-stone-50 text-emerald-800 border-stone-200 hover:bg-emerald-50'
              }`}
            >
              <span>⏳ Waktu Aman (&gt; H-3)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-900 font-bold">
                {safeCount}
              </span>
            </button>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-border/70 my-1"></div>

        {/* Filter Ruangan */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <div className="flex items-center gap-2 text-sm font-black text-text-primary uppercase tracking-wider min-w-[130px]">
            <Building size={15} className="text-primary" />
            <span>Pilihan Ruang:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterRoom('all')}
              className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all border ${
                filterRoom === 'all'
                  ? 'bg-stone-800 text-white border-stone-800 shadow-xs'
                  : 'bg-stone-50 text-text-secondary border-border hover:bg-stone-150'
              }`}
            >
              Semua Ruangan
            </button>
            {rooms.map((r) => (
              <button
                key={r.slug}
                onClick={() => setFilterRoom(r.slug)}
                className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all border ${
                  filterRoom === r.slug
                    ? 'bg-stone-800 text-white border-stone-800 shadow-xs'
                    : 'bg-stone-50 text-text-secondary border-border hover:bg-stone-150'
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Daftar Permohonan Pending */}
      {filteredBookings.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border p-12 text-center text-text-secondary shadow-card space-y-2">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={32} />
          </div>
          <p className="text-base font-extrabold text-text-primary">Tidak Ada Pengajuan Pada Kategori Ini</p>
          <p className="text-sm text-text-secondary max-w-sm mx-auto">
            {filterUrgency !== 'all' || filterRoom !== 'all'
              ? 'Silakan ubah filter urgensi atau ruangan di atas untuk melihat data lainnya.'
              : 'Semua permohonan peminjaman ruangan telah diproses oleh Administrator.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const urgency = getBookingUrgency(b.date, b.startTime);

            return (
              <div
                key={b.id}
                className={`bg-surface rounded-2xl border p-5 sm:p-6 shadow-card hover:shadow-hover transition-all flex flex-col lg:flex-row lg:items-start justify-between gap-5 ${urgency.borderClass} ${urgency.bgClass}`}
              >
                {/* Kolom Info Rapat */}
                <div className="space-y-3 flex-1">
                  {/* Header Baris 1: ID, Judul, & Badge Urgensi */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-sm font-mono font-bold text-stone-700 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-md">
                      #{b.id}
                    </span>

                    <h3 className="text-base sm:text-lg font-black text-text-primary tracking-tight">
                      {b.title}
                    </h3>

                    {/* Badge Urgensi Batas Waktu H-2 */}
                    <span
                      className={`px-3 py-0.5 rounded-full text-sm border shadow-2xs inline-flex items-center gap-1 ${urgency.badgeClass}`}
                    >
                      {urgency.badgeText}
                    </span>
                  </div>

                  {/* Penjelasan Urgensi / Countdown Alert */}
                  <div
                    className={`p-2.5 rounded-xl border text-sm flex items-center gap-2 ${
                      urgency.level === 'critical'
                        ? 'bg-rose-100/80 border-rose-300 text-rose-900 font-bold'
                        : urgency.level === 'warning'
                        ? 'bg-amber-100/70 border-amber-300 text-amber-900 font-semibold'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium'
                    }`}
                  >
                    <CalendarClock size={15} className="shrink-0" />
                    <span>{urgency.description}</span>
                  </div>

                  {/* Grid Info Rapat: Ruangan, Tanggal, Jam, Kapasitas */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-sm text-text-secondary pt-0.5">
                    <div className="flex items-center gap-2">
                      <Building size={15} className="text-primary shrink-0" />
                      <span className="font-bold text-text-primary">{b.roomName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar size={15} className="text-primary shrink-0" />
                      <span className="font-semibold text-text-primary">{formatDateIndonesian(b.date)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock size={15} className="text-primary shrink-0" />
                      <span className="font-mono font-black text-text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {b.startTime} – {b.endTime} WIB
                      </span>
                    </div>
                  </div>

                  {/* Info Pemohon */}
                  <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary pt-1 border-t border-border/60">
                    <span>
                      Pemohon: <strong className="text-text-primary">{b.organizerName}</strong> ({b.organizerDept})
                    </span>
                    <span>•</span>
                    <span className="font-mono">{b.organizerEmail}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold text-text-primary">
                      <Users size={13} /> {b.attendeeCount} Orang Peserta
                    </span>
                  </div>

                  {b.description && (
                    <p className="text-sm text-stone-700 bg-white/80 p-3 rounded-xl border border-border">
                      <strong className="text-stone-900">Catatan Pemohon:</strong> {b.description}
                    </p>
                  )}

                  {/* Form Catatan Tolak Inline */}
                  {rejectingBookingId === b.id && (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl space-y-2.5 animate-in fade-in duration-200">
                      <label className="block text-sm font-bold text-red-900">
                        Tuliskan Alasan Penolakan Permohonan Ini:
                      </label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Contoh: Ruangan digunakan untuk agenda pimpinan yang mendadak."
                        rows={2}
                        className="w-full p-2.5 border border-red-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setRejectingBookingId(null);
                            setRejectReason('');
                          }}
                          className="px-3.5 py-1.5 bg-stone-200 text-stone-700 rounded-xl text-sm font-bold hover:bg-stone-300"
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => handleConfirmReject(b.id)}
                          className="px-4 py-1.5 bg-status-danger hover:bg-red-700 text-white rounded-xl text-sm font-black shadow-xs"
                        >
                          Konfirmasi Tolak Permohonan
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {rejectingBookingId !== b.id && (
                  <div className="flex sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border">
                    <button
                      onClick={() => setSelectedBooking(b)}
                      className="p-2.5 text-text-secondary hover:text-text-primary hover:bg-white/80 rounded-xl border border-border transition-colors flex items-center justify-center gap-1.5 text-sm font-bold"
                      title="Lihat Rincian Lengkap"
                    >
                      <Eye size={16} />
                      <span className="lg:hidden">Rincian</span>
                    </button>

                    <button
                      onClick={() => setRejectingBookingId(b.id)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-100 hover:bg-red-200 text-status-danger rounded-xl text-sm font-bold transition-colors"
                    >
                      <XCircle size={15} />
                      <span>Tolak</span>
                    </button>

                    <button
                      onClick={() => handleApprove(b.id)}
                      className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-status-success hover:bg-green-700 text-white rounded-xl text-sm font-black shadow-md transition-all active:scale-95"
                    >
                      <CheckCheck size={16} />
                      <span>Setujui Permohonan</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <BookingDetailModal
        booking={selectedBooking}
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    </div>
  );
};
