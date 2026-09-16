import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Booking } from '../../types';
import { formatDateIndonesian, getGoogleCalendarUrl } from '../../utils/dateUtils';
import {
  CheckCircle2,
  Calendar,
  Clock,
  Building,
  User as UserIcon,
  Copy,
  Check,
  CalendarPlus,
  ShieldAlert,
  Users,
} from 'lucide-react';

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const [copied, setCopied] = useState(false);

  if (!booking) return null;

  const googleCalUrl = getGoogleCalendarUrl(booking);

  const handleCopyDetails = () => {
    const textToCopy = `📌 *RINCIAN PEMINJAMAN RUANG RAPAT — TU SEKJEN KEMNAKER*
No. Peminjaman: #${booking.id}
Ruang Rapat: ${booking.roomName}
Agenda: ${booking.title}
Tanggal: ${formatDateIndonesian(booking.date)}
Waktu: ${booking.startTime} - ${booking.endTime} WIB
Pemohon: ${booking.organizerName} (${booking.organizerDept})
Status: Menunggu Persetujuan Tim Pengelola TU SEKJEN (Batas H-2)

Diselenggarakan melalui Sistem Peminjaman Ruang Rapat (ROOMBOOK).`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="lg"
    >
      <div className="text-center space-y-5 -mt-2">
        {/* Success Icon Header with Rings */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 ring-8 ring-emerald-50 animate-in zoom-in-50 duration-200">
              <CheckCircle2 size={36} className="stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
            Permohonan Berhasil Diajukan!
          </h2>
          <p className="text-sm sm:text-base text-text-secondary max-w-md mx-auto">
            Pengajuan peminjaman ruangan Anda telah masuk ke sistem dan tercatat dengan nomor reservasi{' '}
            <span className="font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
              #{booking.id}
            </span>
          </p>
        </div>

        {/* Status Notice Alert (Batas H-2 & Alur Persetujuan) */}
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-left space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm sm:text-base">
            <ShieldAlert size={18} className="text-amber-600 shrink-0" />
            <span>Status: Menunggu Persetujuan Tim TU SEKJEN (Batas H-2)</span>
          </div>
          <p className="text-sm text-amber-800 leading-relaxed">
            Sesuai Standar Operasional Prosedur (SOP), Tim Pengelola TU SEKJEN akan memverifikasi permohonan Anda selambat-lambatnya <strong>H-2 sebelum jadwal rapat</strong>. Setelah disetujui, jadwal resmi aktif dan tampil di Layar TV Ruangan.
          </p>
        </div>

        {/* Rincian Peminjaman Card */}
        <div className="bg-stone-50 border border-border rounded-2xl p-4 text-left space-y-3">
          <div className="font-extrabold text-sm uppercase tracking-wider text-text-secondary border-b border-border pb-2 flex items-center justify-between">
            <span>Rincian Peminjaman Ruang</span>
            <span className="font-mono font-bold text-primary">#{booking.id}</span>
          </div>

          <div className="space-y-2.5 text-sm sm:text-base">
            <div className="font-bold text-text-primary text-base">
              {booking.title}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-text-secondary text-sm">
              <div className="flex items-center gap-2">
                <Building size={15} className="text-primary shrink-0" />
                <span className="font-semibold text-text-primary">{booking.roomName}</span>
              </div>

              <div className="flex items-center gap-2">
                <Users size={15} className="text-primary shrink-0" />
                <span>{booking.attendeeCount} Orang Peserta</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-primary shrink-0" />
                <span>{formatDateIndonesian(booking.date)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock size={15} className="text-primary shrink-0" />
                <span className="font-bold text-text-primary font-mono">{booking.startTime} - {booking.endTime} WIB</span>
              </div>

              <div className="flex items-center gap-2 sm:col-span-2">
                <UserIcon size={15} className="text-primary shrink-0" />
                <span>Pemohon: <strong className="text-text-primary">{booking.organizerName}</strong> ({booking.organizerDept})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Google Calendar Direct Link Banner */}
        <div className="p-3.5 bg-blue-50/90 border border-blue-200 rounded-2xl text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-sm font-black text-blue-950 flex items-center gap-1.5">
              <CalendarPlus size={16} className="text-blue-600 shrink-0" />
              <span>Jadwalkan di Google Kalender Anda</span>
            </div>
            <p className="text-[11px] text-blue-800">
              Simpan agenda ini ke akun Google Calendar pribadi/kantor Anda sekarang.
            </p>
          </div>

          <a
            href={googleCalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-xs shrink-0"
          >
            <CalendarPlus size={14} />
            <span>Buka Google Kalender</span>
          </a>
        </div>

        {/* Action Footer Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-border">
          <button
            type="button"
            onClick={handleCopyDetails}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-text-primary rounded-xl text-sm font-bold transition-colors border border-stone-200"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copied ? 'Rincian Berhasil Disalin!' : 'Salin Rincian Peminjaman'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-black transition-all shadow-sm"
          >
            Selesai & Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};
