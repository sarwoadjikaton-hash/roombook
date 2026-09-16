import React, { useState } from 'react';
import { Booking } from '../../types';
import { useBooking } from '../../context/BookingContext';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { formatDateIndonesian, OPERATING_HOURS, getGoogleCalendarUrl } from '../../utils/dateUtils';
import { CustomDatePicker } from '../common/CustomDatePicker';
import { CustomDropdown } from '../common/CustomDropdown';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  Users,
  CheckCheck,
  XCircle,
  Ban,
  Mail,
  Building,
  CalendarCheck,
  ShieldCheck,
  CalendarClock,
  Lock,
  KeyRound,
  AlertCircle,
  CalendarPlus,
} from 'lucide-react';

interface BookingDetailModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({ booking, isOpen, onClose }) => {
  const { currentUser, adminUser, approveBooking, rejectBooking, cancelBooking, rescheduleBooking, rooms } = useBooking();
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Verifikasi Hak Akses Pemohon (Owner Security Verification)
  const [isOwnerVerified, setIsOwnerVerified] = useState(false);
  const [isVerifyingOwner, setIsVerifyingOwner] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [pendingAction, setPendingAction] = useState<'reschedule' | 'cancel' | null>(null);

  // Reschedule Form States
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleStartTime, setRescheduleStartTime] = useState('');
  const [rescheduleEndTime, setRescheduleEndTime] = useState('');
  const [rescheduleRoomSlug, setRescheduleRoomSlug] = useState('');
  const [rescheduleError, setRescheduleError] = useState('');

  // Sinkronkan state saat modal dibuka atau booking berubah
  React.useEffect(() => {
    if (booking) {
      setRescheduleDate(booking.date);
      setRescheduleStartTime(booking.startTime);
      setRescheduleEndTime(booking.endTime);
      setRescheduleRoomSlug(booking.roomSlug);
      setIsRescheduling(false);
      setIsRejecting(false);
      setIsVerifyingOwner(false);
      setVerifyEmail('');
      setVerifyError('');
      setPendingAction(null);
      // Jika login sebagai admin, otomatis memiliki hak akses
      setIsOwnerVerified(!!adminUser);
    }
  }, [booking, isOpen, adminUser]);

  if (!booking) return null;

  const room = rooms.find((r) => r.slug === booking.roomSlug);
  const canApprove = (currentUser.role === 'admin' || !!adminUser) && booking.status === 'pending';
  const canModify = (booking.status === 'confirmed' || booking.status === 'pending');

  const handleRequestAction = (action: 'reschedule' | 'cancel') => {
    if (isOwnerVerified) {
      if (action === 'reschedule') {
        setIsRescheduling(true);
      } else {
        handleCancel();
      }
    } else {
      setPendingAction(action);
      setIsVerifyingOwner(true);
      setVerifyError('');
    }
  };

  const handleVerifyOwner = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');

    if (!verifyEmail.trim()) {
      setVerifyError('Silakan masukkan email pemohon terdaftar.');
      return;
    }

    if (verifyEmail.trim().toLowerCase() !== booking.organizerEmail.trim().toLowerCase()) {
      setVerifyError('Akses Ditolak: Email tidak cocok dengan data pemohon asli reservasi ini (#bk-' + booking.id + '). Anda tidak berhak mengubah/membatalkan jadwal ini.');
      return;
    }

    setIsOwnerVerified(true);
    setIsVerifyingOwner(false);
    setVerifyError('');

    if (pendingAction === 'reschedule') {
      setIsRescheduling(true);
    } else if (pendingAction === 'cancel') {
      handleCancel();
    }
    setPendingAction(null);
  };

  const handleApprove = () => {
    approveBooking(booking.id);
    onClose();
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert('Silakan tuliskan alasan penolakan.');
      return;
    }
    rejectBooking(booking.id, rejectReason.trim());
    setIsRejecting(false);
    setRejectReason('');
    onClose();
  };

  const handleCancel = () => {
    if (confirm(`Apakah Anda yakin ingin membatalkan peminjaman "${booking.title}"? Jadwal ruangan akan kembali tersedia.`)) {
      cancelBooking(booking.id);
      onClose();
    }
  };

  const handleConfirmReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    setRescheduleError('');

    if (rescheduleStartTime >= rescheduleEndTime) {
      setRescheduleError('Jam selesai harus lebih akhir dari jam mulai.');
      return;
    }

    const result = rescheduleBooking(
      booking.id,
      rescheduleDate,
      rescheduleStartTime,
      rescheduleEndTime,
      rescheduleRoomSlug
    );

    if (result.success) {
      alert(result.message);
      setIsRescheduling(false);
      onClose();
    } else {
      setRescheduleError(result.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rincian Peminjaman Ruang"
      subtitle={`ID: #${booking.id} • Dibuat: ${booking.createdAt}`}
      maxWidth="lg"
    >
      <div className="space-y-4 text-sm">
        {/* Header Status & Title */}
        <div className="flex items-start justify-between gap-4 p-3.5 bg-stone-50 rounded-card border border-border">
          <div>
            <h4 className="text-base font-bold text-text-primary">{booking.title}</h4>
            <div className="flex items-center gap-1.5 text-text-secondary mt-1">
              <Building size={14} className="text-primary-light" />
              <span className="font-semibold text-text-primary">{booking.roomName}</span>
              <span>•</span>
              <span className="text-[11px]">{room?.location || 'Gedung Utama'}</span>
            </div>
          </div>
          <StatusBadge status={booking.status} size="md" />
        </div>

        {/* Info Waktu & Peserta */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-surface border border-border rounded-card">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 text-primary rounded-btn">
              <Calendar size={16} strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-[11px] text-text-secondary">Tanggal</div>
              <div className="font-bold text-text-primary">{formatDateIndonesian(booking.date)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 text-primary rounded-btn">
              <Clock size={16} strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-[11px] text-text-secondary">Waktu / Durasi</div>
              <div className="font-bold text-text-primary tabular-nums">
                {booking.startTime} – {booking.endTime} WIB
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-stone-100 text-stone-700 rounded-btn">
              <Users size={16} strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-[11px] text-text-secondary">Jumlah Peserta</div>
              <div className="font-bold text-text-primary">{booking.attendeeCount} Orang</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-stone-100 text-stone-700 rounded-btn">
              <CalendarCheck size={16} strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-[11px] text-text-secondary">Kalender Digital</div>
              <div className="font-semibold text-text-primary">
                {booking.syncedToGoogle ? (
                  <span className="text-status-success">Tersinkronisasi</span>
                ) : (
                  <span className="text-text-secondary">Belum Terhubung</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pemohon (Organizer) */}
        <div className="p-3 bg-surface border border-border rounded-card space-y-1.5">
          <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
            Informasi Pemohon
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-text-primary">{booking.organizerName}</span>
            <span className="text-text-secondary">{booking.organizerDept}</span>
          </div>
          {adminUser && (
            <div className="text-text-secondary flex items-center gap-1.5 pt-0.5 font-medium">
              <Mail size={13} />
              <span>{booking.organizerEmail}</span>
            </div>
          )}
        </div>

        {/* Undangan Peserta */}
        {booking.attendees.length > 0 && (
          <div>
            <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
              Daftar Peserta Rapat ({booking.attendees.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {booking.attendees.map((att) => (
                <span
                  key={att}
                  className="px-2.5 py-1 bg-stone-100 border border-border rounded-md text-[11px] text-text-primary"
                >
                  {att}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Deskripsi */}
        {booking.description && (
          <div className="p-3 bg-surface border border-border rounded-card">
            <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">
              Catatan / Agenda
            </div>
            <p className="text-text-secondary leading-relaxed">{booking.description}</p>
          </div>
        )}

        {/* Status Approval & Alasan */}
        {booking.approvedBy && (
          <div className="p-2.5 bg-green-50 border border-green-200 rounded-btn flex items-center gap-2 text-green-900">
            <ShieldCheck size={16} className="text-status-success shrink-0" />
            <span>
              Disetujui oleh <strong className="font-semibold">{booking.approvedBy}</strong> pada {booking.approvedAt}.
            </span>
          </div>
        )}

        {booking.status === 'rejected' && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-btn space-y-1 text-red-900">
            <div className="font-bold flex items-center gap-1.5 text-status-danger">
              <XCircle size={15} />
              <span>Alasan Penolakan:</span>
            </div>
            <p className="text-sm text-stone-700 italic">"{booking.rejectionReason || 'Tidak disetujui'}"</p>
          </div>
        )}

        {/* Tombol Simpan ke Google Kalender */}
        {booking.status !== 'rejected' && booking.status !== 'cancelled' && (
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between gap-3">
            <div className="space-y-0.5 text-sm text-blue-950">
              <div className="font-extrabold flex items-center gap-1.5 text-blue-900">
                <CalendarPlus size={15} className="text-blue-600" />
                <span>Google Kalender</span>
              </div>
              <p className="text-[11px] text-blue-800">
                {booking.status === 'confirmed'
                  ? 'Jadwal resmi telah disetujui. Tambahkan ke kalender Anda:'
                  : 'Simpan jadwal ini ke Google Kalender pribadi/kantor Anda:'}
              </p>
            </div>
            <a
              href={getGoogleCalendarUrl(booking)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-xs shrink-0"
            >
              <CalendarPlus size={13} />
              <span>Buka Kalender</span>
            </a>
          </div>
        )}


        {/* Formulir Ubah Jadwal (Jika Klik Ubah Jadwal) */}
        {isRescheduling && (
          <form onSubmit={handleConfirmReschedule} className="p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl space-y-3.5">
            <div className="flex items-center gap-2 text-blue-900 font-extrabold text-base">
              <CalendarClock size={18} className="text-blue-600" />
              <span>Pilih Jadwal Baru</span>
            </div>

            {rescheduleError && (
              <div className="p-2.5 bg-rose-100 border border-rose-300 rounded-xl text-sm font-bold text-rose-800">
                {rescheduleError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-text-primary text-[11px] mb-1">Tanggal Baru *</label>
                <CustomDatePicker
                  value={rescheduleDate}
                  onChange={(d) => setRescheduleDate(d)}
                  minDate={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>

              <div>
                <label className="block font-bold text-text-primary text-[11px] mb-1">Pilihan Ruangan *</label>
                <CustomDropdown
                  options={rooms.map((r) => ({
                    value: r.slug,
                    label: r.name,
                    sublabel: `Kapasitas: ${r.capacity} org`,
                  }))}
                  value={rescheduleRoomSlug}
                  onChange={(slug) => setRescheduleRoomSlug(slug)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-text-primary text-[11px] mb-1">Jam Mulai *</label>
                <CustomDropdown
                  options={OPERATING_HOURS.slice(0, -1).map((h) => ({
                    value: h,
                    label: `${h} WIB`,
                  }))}
                  value={rescheduleStartTime}
                  onChange={(val) => setRescheduleStartTime(val)}
                  hideAvatar={true}
                />
              </div>
              <div>
                <label className="block font-bold text-text-primary text-[11px] mb-1">Jam Selesai *</label>
                <CustomDropdown
                  options={OPERATING_HOURS.filter((h) => h > rescheduleStartTime).map((h) => ({
                    value: h,
                    label: `${h} WIB`,
                  }))}
                  value={rescheduleEndTime}
                  onChange={(val) => setRescheduleEndTime(val)}
                  hideAvatar={true}
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-blue-200">
              <button
                type="button"
                onClick={() => {
                  setIsRescheduling(false);
                  setRescheduleError('');
                }}
                className="px-3.5 py-1.5 bg-white hover:bg-stone-100 text-stone-700 rounded-xl text-sm font-bold border border-stone-300"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black shadow-sm flex items-center gap-1.5"
              >
                <CheckCheck size={14} />
                <span>Simpan Jadwal Baru</span>
              </button>
            </div>
          </form>
        )}

        {/* Form Verifikasi Identitas Pemohon (Proteksi Keamanan) */}
        {isVerifyingOwner && (
          <form onSubmit={handleVerifyOwner} className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-base">
              <KeyRound size={18} className="text-amber-600" />
              <span>Verifikasi Email Pemohon</span>
            </div>
            <p className="text-sm text-amber-800 leading-relaxed font-medium">
              Untuk {pendingAction === 'reschedule' ? 'mengubah jadwal' : 'membatalkan pemesanan'}, silakan masukkan <strong>Email Pemohon</strong> terdaftar:
            </p>

            <div className="space-y-1.5">
              <input
                type="email"
                value={verifyEmail}
                onChange={(e) => {
                  setVerifyEmail(e.target.value);
                  setVerifyError('');
                }}
                placeholder="nama@gmail.com"
                className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
                required
              />
              {verifyError && (
                <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-sm font-bold text-rose-700 flex items-center gap-1.5">
                  <AlertCircle size={14} className="shrink-0 text-rose-600" />
                  <span>{verifyError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsVerifyingOwner(false);
                  setVerifyError('');
                  setPendingAction(null);
                }}
                className="px-3.5 py-1.5 bg-white hover:bg-stone-100 text-stone-700 rounded-xl text-sm font-bold border border-stone-300"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-black shadow-xs flex items-center gap-1.5"
              >
                <ShieldCheck size={14} />
                <span>Verifikasi</span>
              </button>
            </div>
          </form>
        )}

        {/* Form Alasan Tolak (Jika Klik Tolak) */}
        {isRejecting && (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-card space-y-2">
            <label className="block font-bold text-amber-900">Masukkan Alasan Penolakan Permohonan:</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Ruangan digunakan untuk agenda pimpinan yang mendadak."
              rows={2}
              className="w-full p-2 border border-amber-300 rounded-btn text-sm bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRejecting(false)}
                className="px-3 py-1.5 bg-stone-200 text-stone-700 rounded-btn text-sm font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="px-3 py-1.5 bg-status-danger text-white rounded-btn text-sm font-bold"
              >
                Konfirmasi Tolak
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {canModify && !isRejecting && !isRescheduling && !isVerifyingOwner && (
              <>
                <button
                  type="button"
                  onClick={() => handleRequestAction('reschedule')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl font-bold transition-colors shadow-xs"
                  title={isOwnerVerified ? 'Ubah jadwal reservasi ini' : 'Verifikasi email pemohon untuk mengubah jadwal'}
                >
                  {isOwnerVerified ? <CalendarClock size={14} /> : <Lock size={13} className="text-blue-500" />}
                  <span>Ubah Jadwal</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRequestAction('cancel')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-status-danger hover:bg-red-50 rounded-xl font-semibold transition-colors border border-transparent hover:border-red-200"
                  title={isOwnerVerified ? 'Batalkan pemesanan ini' : 'Verifikasi email pemohon untuk membatalkan'}
                >
                  {isOwnerVerified ? <Ban size={14} /> : <Lock size={13} className="text-red-400" />}
                  <span>Batalkan Peminjaman</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canApprove && !isRejecting && !isRescheduling && !isVerifyingOwner && (
              <>
                <button
                  onClick={() => setIsRejecting(true)}
                  className="flex items-center gap-1 px-3.5 py-1.5 bg-red-100 text-status-danger hover:bg-red-200 rounded-xl font-bold transition-colors"
                >
                  <XCircle size={14} />
                  <span>Tolak</span>
                </button>
                <button
                  onClick={handleApprove}
                  className="flex items-center gap-1 px-4 py-1.5 bg-status-success hover:bg-green-700 text-white rounded-xl font-bold transition-colors shadow-sm"
                >
                  <CheckCheck size={14} />
                  <span>Setujui Permohonan</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-stone-100 hover:bg-stone-200 text-text-primary rounded-xl font-semibold transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
