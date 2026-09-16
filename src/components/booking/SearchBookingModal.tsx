import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { Booking } from '../../types';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { formatDateIndonesian } from '../../utils/dateUtils';
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

interface SearchBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBookingForDetail: (booking: Booking) => void;
}

export const SearchBookingModal: React.FC<SearchBookingModalProps> = ({
  isOpen,
  onClose,
  onSelectBookingForDetail,
}) => {
  const { bookings } = useBooking();
  const [email, setEmail] = useState('');
  const [bookingCode, setBookingCode] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<Booking[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = bookingCode.trim().toLowerCase();

    if (!cleanEmail) {
      return;
    }

    const results = bookings.filter((b) => {
      // Wajib cocok email pemohon
      const matchesEmail = b.organizerEmail.trim().toLowerCase() === cleanEmail;
      if (!matchesEmail) return false;

      // Jika kode booking diisi, periksa apakah cocok atau mengandung kode tersebut
      if (cleanCode) {
        const matchesCode = b.id.trim().toLowerCase().includes(cleanCode);
        return matchesCode;
      }

      return true;
    }).sort((a, b) => {
      // Urutkan dari tanggal & waktu terbaru
      return `${b.date} ${b.startTime}`.localeCompare(`${a.date} ${a.startTime}`);
    });

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Search size={19} />
          </div>
          <div>
            <h2 className="text-lg font-black text-text-primary">Cari & Lacak Status Booking</h2>
          </div>
        </div>
      }
      subtitle="Pantau status persetujuan, riwayat permohonan, atau kelola jadwal peminjaman Anda."
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Form Pencarian */}
        <form onSubmit={handleSearch} className="bg-stone-50 dark:bg-stone-800/60 p-4 sm:p-5 rounded-2xl border border-border space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Input Email (Wajib) */}
            <div>
              <label className="block text-sm font-bold text-text-primary mb-1.5 flex items-center gap-1.5">
                <Mail size={15} className="text-primary" />
                <span>Email Pemohon</span>
                <span className="text-red-500 font-black">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@gmail.com"
                className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs"
              />
              <p className="text-[11px] text-text-secondary mt-1">
                Email yang digunakan saat mengajukan booking.
              </p>
            </div>

            {/* Input Kode Booking (Opsional) */}
            <div>
              <label className="block text-sm font-bold text-text-primary mb-1.5 flex items-center gap-1.5">
                <Hash size={15} className="text-stone-400" />
                <span>Kode Booking</span>
                <span className="text-xs text-text-muted font-normal">(Opsional)</span>
              </label>
              <input
                type="text"
                value={bookingCode}
                onChange={(e) => setBookingCode(e.target.value)}
                placeholder="bk-1789... / Kosongkan jika lupa"
                className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs"
              />
              <p className="text-[11px] text-text-secondary mt-1">
                Opsional untuk mempersempit pencarian spesifik.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 gap-3">
            {hasSearched ? (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-bold text-text-secondary hover:text-text-primary underline transition-colors"
              >
                Reset Pencarian
              </button>
            ) : (
              <div className="text-[11px] text-text-muted flex items-center gap-1">
                <span>Seluruh riwayat booking dengan email Anda akan ditampilkan.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!email.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-sm transition-all active:scale-95"
            >
              <Search size={16} />
              <span>Cari Riwayat Booking</span>
            </button>
          </div>
        </form>

        {/* Hasil Pencarian */}
        {hasSearched && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                Hasil Pencarian ({searchResults.length} Permohonan Ditemukan)
              </h3>
              <span className="text-xs text-text-secondary">
                Email: <strong className="text-text-primary">{email}</strong>
              </span>
            </div>

            {searchResults.length === 0 ? (
              <div className="py-10 text-center space-y-3 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-dashed border-border p-6">
                <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-400 flex items-center justify-center mx-auto">
                  <SearchX size={24} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-text-primary">Tidak Ada Data Booking</h4>
                  <p className="text-xs text-text-secondary mt-1 max-w-md mx-auto">
                    Tidak ditemukan permohonan peminjaman ruangan dengan email <strong className="text-text-primary">{email}</strong>
                    {bookingCode ? ` dan kode booking "${bookingCode}"` : ''}.
                  </p>
                </div>
                <p className="text-[11px] text-text-muted">
                  Pastikan penulisan alamat email sama persis dengan yang Anda isi pada formulir permohonan.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {searchResults.map((booking) => {
                  const isPending = booking.status === 'pending';
                  const isRejected = booking.status === 'rejected';

                  return (
                    <div
                      key={booking.id}
                      className={`p-4 rounded-2xl border transition-all bg-surface hover:shadow-md space-y-3 ${isPending
                          ? 'border-amber-200 bg-amber-50/20'
                          : isRejected
                            ? 'border-red-200 bg-red-50/20'
                            : 'border-border hover:border-primary/40'
                        }`}
                    >
                      {/* Baris Atas: Kode & Status Badge */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-stone-500 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-lg border border-border">
                            #{booking.id}
                          </span>
                          <span className="text-xs text-text-secondary font-medium">
                            {formatDateIndonesian(booking.date)}
                          </span>
                        </div>

                        <StatusBadge status={booking.status} size="sm" />
                      </div>

                      {/* Judul & Info Ruangan */}
                      <div>
                        <h4 className="text-base font-black text-text-primary">
                          {booking.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-text-secondary font-medium mt-1 flex-wrap">
                          <span className="flex items-center gap-1 font-bold text-primary">
                            <Building size={14} />
                            <span>{booking.roomName}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono text-stone-700 dark:text-stone-300">
                            <Clock size={14} />
                            <span>{booking.startTime} – {booking.endTime} WIB</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            <span>{booking.attendeeCount} Orang ({booking.organizerDept})</span>
                          </span>
                        </div>
                      </div>

                      {/* Pesan Khusus jika Ditolak */}
                      {isRejected && booking.rejectionReason && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-900 dark:text-red-200 flex items-start gap-2">
                          <ShieldAlert size={16} className="text-red-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="block font-bold">Alasan Penolakan:</strong>
                            <p className="mt-0.5 leading-relaxed">{booking.rejectionReason}</p>
                          </div>
                        </div>
                      )}

                      {/* Pesan jika Pending */}
                      {isPending && (
                        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                          <AlertCircle size={15} className="text-amber-600 shrink-0" />
                          <span>Permohonan sedang dalam proses verifikasi oleh Tim Pengelola TU SEKJEN.</span>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectBookingForDetail(booking);
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-surface-secondary hover:bg-primary hover:text-white border border-border hover:border-primary rounded-xl text-xs font-bold text-text-primary transition-all shadow-2xs group"
                        >
                          <span>Lihat Rincian & Kelola</span>
                          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
