import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { Booking } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { BookingDetailModal } from '../components/booking/BookingDetailModal';
import { formatDateIndonesian } from '../utils/dateUtils';
import {
  Search,
  Mail,
  Hash,
  Clock,
  Building,
  Users,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  SearchX,
} from 'lucide-react';

export const MyBookingsPage: React.FC = () => {
  const { bookings } = useBooking();
  const [email, setEmail] = useState('');
  const [bookingCode, setBookingCode] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<Booking[]>([]);
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<Booking | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = bookingCode.trim().toLowerCase();

    if (!cleanEmail) {
      return;
    }

    const results = bookings
      .filter((b) => {
        // Wajib cocok email pemohon
        const matchesEmail = b.organizerEmail.trim().toLowerCase() === cleanEmail;
        if (!matchesEmail) return false;

        // Jika kode booking diisi, periksa apakah cocok atau mengandung kode tersebut
        if (cleanCode) {
          const matchesCode = b.id.trim().toLowerCase().includes(cleanCode);
          return matchesCode;
        }

        return true;
      })
      .sort((a, b) => `${b.date} ${b.startTime}`.localeCompare(`${a.date} ${a.startTime}`));

    setSearchResults(results);
    setHasSearched(true);
  };

  const handleReset = () => {
    setEmail('');
    setBookingCode('');
    setHasSearched(false);
    setSearchResults([]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-card space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Search size={22} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-text-primary">
              Cari & Lacak Status Booking
            </h1>
            <p className="text-sm text-text-secondary mt-0.5">
              Masukkan email pemohon untuk memantau status persetujuan, jadwal permohonan, atau melihat detail peminjaman.
            </p>
          </div>
        </div>
      </div>

      {/* Form Pencarian */}
      <div className="bg-surface rounded-2xl border border-border p-6 shadow-card space-y-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Input Email (Wajib) */}
            <div>
              <label className="block text-sm font-bold text-text-primary mb-1.5 flex items-center gap-1.5">
                <Mail size={16} className="text-primary" />
                <span>Email Pemohon</span>
                <span className="text-red-500 font-black">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@gmail.com"
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/60 border border-border rounded-xl text-base font-medium text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <p className="text-xs text-text-secondary mt-1">
                Gunakan alamat email yang Anda isi saat memesan ruangan.
              </p>
            </div>

            {/* Input Kode Booking (Opsional) */}
            <div>
              <label className="block text-sm font-bold text-text-primary mb-1.5 flex items-center gap-1.5">
                <Hash size={16} className="text-stone-400" />
                <span>Kode Booking</span>
                <span className="text-xs text-text-muted font-normal">(Opsional)</span>
              </label>
              <input
                type="text"
                value={bookingCode}
                onChange={(e) => setBookingCode(e.target.value)}
                placeholder="bk-1789... / Kosongkan jika lupa"
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/60 border border-border rounded-xl text-base font-medium text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <p className="text-xs text-text-secondary mt-1">
                Opsional untuk mencari ID permohonan tertentu secara langsung.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 gap-3 flex-wrap">
            {hasSearched ? (
              <button
                type="button"
                onClick={handleReset}
                className="text-sm font-bold text-text-secondary hover:text-text-primary underline transition-colors"
              >
                Reset Pencarian
              </button>
            ) : (
              <div className="text-xs text-text-muted flex items-center gap-1.5">
                <span>Seluruh riwayat booking dengan email Anda akan ditampilkan.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!email.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed text-white text-base font-black rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <Search size={18} />
              <span>Cari Riwayat Booking</span>
            </button>
          </div>
        </form>
      </div>

      {/* Hasil Pencarian */}
      {hasSearched && (
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-base font-black text-text-primary">
              Hasil Pencarian ({searchResults.length} Permohonan)
            </h3>
            <span className="text-sm text-text-secondary">
              Email: <strong className="text-text-primary">{email}</strong>
            </span>
          </div>

          {searchResults.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-dashed border-border p-6">
              <div className="w-14 h-14 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-400 flex items-center justify-center mx-auto">
                <SearchX size={28} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-text-primary">Tidak Ada Permohonan Ditemukan</h4>
                <p className="text-sm text-text-secondary mt-1 max-w-md mx-auto">
                  Tidak ditemukan permohonan booking dengan email <strong className="text-text-primary">{email}</strong>
                  {bookingCode ? ` dan kode booking "${bookingCode}"` : ''}.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map((booking) => {
                const isPending = booking.status === 'pending';
                const isRejected = booking.status === 'rejected';

                return (
                  <div
                    key={booking.id}
                    className={`p-5 rounded-2xl border transition-all bg-surface hover:shadow-md space-y-3 ${
                      isPending
                        ? 'border-amber-200 bg-amber-50/20'
                        : isRejected
                        ? 'border-red-200 bg-red-50/20'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-stone-600 bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-lg border border-border">
                          #{booking.id}
                        </span>
                        <span className="text-sm text-text-secondary font-medium">
                          {formatDateIndonesian(booking.date)}
                        </span>
                      </div>

                      <StatusBadge status={booking.status} size="md" />
                    </div>

                    <div>
                      <h4 className="text-lg font-black text-text-primary">
                        {booking.title}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-text-secondary font-medium mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1.5 font-bold text-primary">
                          <Building size={16} />
                          <span>{booking.roomName}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5 font-mono text-stone-700 dark:text-stone-300">
                          <Clock size={16} />
                          <span>{booking.startTime} – {booking.endTime} WIB</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <Users size={16} />
                          <span>{booking.attendeeCount} Orang ({booking.organizerDept})</span>
                        </span>
                      </div>
                    </div>

                    {isRejected && booking.rejectionReason && (
                      <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-sm text-red-900 dark:text-red-200 flex items-start gap-2.5">
                        <ShieldAlert size={18} className="text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">Alasan Penolakan:</strong>
                          <p className="mt-0.5 leading-relaxed">{booking.rejectionReason}</p>
                        </div>
                      </div>
                    )}

                    {isPending && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2.5">
                        <AlertCircle size={16} className="text-amber-600 shrink-0" />
                        <span>Permohonan sedang diverifikasi oleh Administrator Pengelola TU SEKJEN.</span>
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedBookingForDetail(booking)}
                        className="flex items-center gap-2 px-4 py-2 bg-surface-secondary hover:bg-primary hover:text-white border border-border hover:border-primary rounded-xl text-sm font-bold text-text-primary transition-all shadow-2xs group"
                      >
                        <span>Lihat Rincian & Kelola</span>
                        <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Booking Detail Modal */}
      <BookingDetailModal
        booking={selectedBookingForDetail}
        isOpen={!!selectedBookingForDetail}
        onClose={() => setSelectedBookingForDetail(null)}
      />
    </div>
  );
};
