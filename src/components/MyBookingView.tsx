import React, { useState } from 'react';
import { Booking, ActivityLog, Room } from '../types';
import { isOverlapping } from '../data/initialData';
import { 
  Search, 
  Calendar, 
  Clock, 
  Users, 
  Mail, 
  Copy, 
  Check, 
  Edit3, 
  XCircle, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  ExternalLink,
  PhoneCall,
  History,
  ArrowRight
} from 'lucide-react';

interface MyBookingViewProps {
  bookings: Booking[];
  rooms: Room[];
  onUpdateBooking: (booking: Booking, log: ActivityLog) => void;
  onCancelBooking: (bookingId: string, log: ActivityLog) => void;
  onViewVoucher: (booking: Booking) => void;
  onNavigateNewBooking: () => void;
}

export const MyBookingView: React.FC<MyBookingViewProps> = ({
  bookings,
  rooms,
  onUpdateBooking,
  onCancelBooking,
  onViewVoucher,
  onNavigateNewBooking,
}) => {
  const [emailInput, setEmailInput] = useState<string>('satria.wibawa@instansi.go.id');
  const [codeInput, setCodeInput] = useState<string>('BKG-883921');
  const [hasSearched, setHasSearched] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [magicLinkSent, setMagicLinkSent] = useState<boolean>(false);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState<string>('');
  const [editStartTime, setEditStartTime] = useState<string>('');
  const [editEndTime, setEditEndTime] = useState<string>('');
  const [editParticipants, setEditParticipants] = useState<number>(18);
  const [editConflictMsg, setEditConflictMsg] = useState<string | null>(null);

  // Find active matched booking
  const matchedBooking = bookings.find(
    (b) =>
      b.bookerEmail.toLowerCase().trim() === emailInput.toLowerCase().trim() &&
      b.bookingCode.toUpperCase().trim() === codeInput.toUpperCase().trim()
  );

  // Find all bookings for this email
  const userBookings = bookings.filter(
    (b) => b.bookerEmail.toLowerCase().trim() === emailInput.toLowerCase().trim()
  );

  const currentRoom = matchedBooking
    ? rooms.find((r) => r.id === matchedBooking.roomId)
    : null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    setMagicLinkSent(false);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openEditModal = () => {
    if (!matchedBooking) return;
    setEditTitle(matchedBooking.meetingTitle);
    setEditStartTime(matchedBooking.startTime);
    setEditEndTime(matchedBooking.endTime);
    setEditParticipants(matchedBooking.participantCount);
    setEditConflictMsg(null);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!matchedBooking) return;

    // Check conflict with other bookings (excluding self)
    const conflict = bookings.find(
      (b) =>
        b.id !== matchedBooking.id &&
        b.roomId === matchedBooking.roomId &&
        b.date === matchedBooking.date &&
        b.status !== 'cancelled' &&
        isOverlapping(editStartTime, editEndTime, b.startTime, b.endTime)
    );

    if (conflict) {
      setEditConflictMsg(`Slot waktu bertabrakan dengan agenda "${conflict.meetingTitle}" (${conflict.startTime} - ${conflict.endTime} WIB). Silakan pilih rentang waktu lain.`);
      return;
    }

    const updatedBooking: Booking = {
      ...matchedBooking,
      meetingTitle: editTitle,
      startTime: editStartTime,
      endTime: editEndTime,
      participantCount: editParticipants,
    };

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: '10 Sep 2026, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      actor: matchedBooking.bookerName,
      division: matchedBooking.division,
      action: 'modified',
      roomName: matchedBooking.roomName,
      bookingCode: matchedBooking.bookingCode,
      googleSyncId: matchedBooking.googleEventId,
      details: `Jadwal diubah menjadi ${editStartTime} - ${editEndTime} WIB ("${editTitle}").`,
    };

    onUpdateBooking(updatedBooking, newLog);
    setIsEditModalOpen(false);
  };

  const handleConfirmCancel = () => {
    if (!matchedBooking) return;

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: '10 Sep 2026, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      actor: matchedBooking.bookerName,
      division: matchedBooking.division,
      action: 'cancelled',
      roomName: matchedBooking.roomName,
      bookingCode: matchedBooking.bookingCode,
      googleSyncId: matchedBooking.googleEventId,
      details: `Reservasi dibatalkan mandiri via magic link token. Ruangan telah dikosongkan.`,
    };

    onCancelBooking(matchedBooking.id, newLog);
    setIsCancelModalOpen(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-12 py-8 md:py-12 flex flex-col gap-10">
      {/* Header */}
      <header className="flex flex-col gap-2 max-w-3xl">
        <div className="flex items-center gap-2 text-[#55524A] text-xs">
          <span>Arsip & Penata Buku Tamu</span>
          <span className="w-1 h-1 rounded-full bg-[#A9822D] inline-block"></span>
          <span>Autentikasi Tanpa Sandi (FR-10 & FR-12)</span>
        </div>
        <h1 className="font-serif-title text-3xl md:text-5xl text-[#16191C] tracking-tight font-normal">
          Cek & Kelola Reservasi
        </h1>
        <p className="text-base text-[#55524A] leading-relaxed">
          Lacak status pemesanan, perbarui agenda, atau batalkan reservasi tanpa perlu akun kata sandi. Masukkan email kedinasan dan kode booking 6-digit Anda.
        </p>
      </header>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Search & Verification Panel (5 Cols) */}
        <section className="lg:col-span-5 bg-[#E4DBC8]/60 rounded p-6 md:p-8 flex flex-col gap-6 shadow-xs border border-[#55524A]/15">
          <div className="flex flex-col gap-1">
            <span className="font-serif-title text-xl text-[#16191C] font-medium">Buku Verifikasi Tamu</span>
            <p className="text-xs text-[#55524A]">
              Akses langsung slip reservasi resmi, plakat pintu, dan kendali bilik.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col gap-5">
            {/* Email Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#55524A]" htmlFor="email-input">
                Email Kedinasan
              </label>
              <input
                id="email-input"
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="nama@instansi.go.id"
                className="w-full bg-transparent border-0 border-b border-[#55524A]/40 focus:border-[#16191C] focus:outline-none py-2 text-sm text-[#16191C] transition-colors"
              />
            </div>

            {/* Booking Code Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#55524A]" htmlFor="code-input">
                  Kode Booking Unik (6-Digit)
                </label>
                <span className="text-[11px] text-[#55524A]/70">Format: BKG-XXXXXX</span>
              </div>
              <input
                id="code-input"
                type="text"
                required
                maxLength={10}
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder="BKG-883921"
                className="w-full bg-transparent border-0 border-b border-[#55524A]/40 focus:border-[#16191C] focus:outline-none py-2 text-sm font-mono tracking-wider text-[#16191C] uppercase transition-colors"
              />
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              className="w-full bg-[#16191C] text-[#F1ECDF] py-3 px-6 rounded font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#16191C]/90 active:scale-[0.99] transition-all"
            >
              <Search className="w-4 h-4 text-[#A9822D]" />
              <span>Cari Reservasi</span>
            </button>
          </form>

          {/* Magic Link / Quick recovery */}
          <div className="bg-[#F1ECDF] p-4 rounded border border-[#55524A]/15 flex flex-col gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#16191C] font-medium">
              <Mail className="w-4 h-4 text-[#A9822D]" />
              <span>Lupa kode booking Anda?</span>
            </div>
            <p className="text-[#55524A] leading-relaxed">
              Kirim tautan akses rahasia (magic link) langsung ke surel dinas Anda untuk melihat semua booking aktif tanpa kode.
            </p>
            <button
              type="button"
              onClick={() => setMagicLinkSent(true)}
              className="text-left font-medium text-[#16191C] underline underline-offset-4 decoration-[#A9822D] hover:text-[#A9822D] transition-colors self-start mt-1"
            >
              Kirimkan tautan akses ke surel saya
            </button>
            {magicLinkSent && (
              <div className="p-2 bg-[#26392E]/10 text-[#26392E] rounded text-xs flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Tautan magic link telah dikirimkan ke {emailInput}.</span>
              </div>
            )}
          </div>

          {/* Concierge Desk Direct Contact Note */}
          <div className="flex items-start gap-3 pt-2 text-xs text-[#55524A]">
            <PhoneCall className="w-4 h-4 text-[#A9822D] shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-[#16191C] block">Bantuan Resepsionis Fisik:</span>
              <span>Hubungi concierge ekstensi 104 atau meja lobi untuk perubahan jadwal mendesak.</span>
            </div>
          </div>
        </section>

        {/* Right Column: Search Result Slip OR Empty State (7 Cols) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          {matchedBooking ? (
            <div className="bg-[#F1ECDF] rounded p-6 md:p-8 flex flex-col gap-6 border border-[#55524A]/20 shadow-sm relative">
              {/* Duotone Visual Banner */}
              <div className="relative w-full h-44 rounded overflow-hidden bg-[#16191C]">
                <img
                  src={
                    currentRoom?.image ||
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuDMC5IVgadw6CRpBpf6j_i07ypMG7Qd3H8uCqWOGtxbGdKJWPRPUz_W_-OBthnLxJGz4pkRVOT77ixFheLWcCxWigZLIyTrHyT60UuG7nEsATV4V2E3gdNSrnR1WBy55E59nmCN3X8_TwLhU2RTyvG37aa6pifjbd_S6tKAdmTh5wWBxYpDaQ3Gc1VbCWACInsOEZzOCK7K-45-VPCFBZnmJvpH3axufdq_3UYgPHOQge46ya34KOGY'
                  }
                  alt={matchedBooking.roomName}
                  className="w-full h-full object-cover filter grayscale contrast-125 opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#16191C]/80 via-[#16191C]/20 to-transparent"></div>
                <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end text-[#F1ECDF]">
                  <div>
                    <span className="text-xs text-[#E4DBC8]">Penempatan Ruangan</span>
                    <h3 className="font-serif-title text-xl md:text-2xl font-normal leading-tight">
                      {matchedBooking.roomName}
                    </h3>
                  </div>
                  <span className="text-xs text-[#E4DBC8]">{currentRoom?.location}</span>
                </div>
              </div>

              {/* Slip Header Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#55524A]/15">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full inline-block ${
                      matchedBooking.status === 'cancelled'
                        ? 'bg-[#6B2A2E]'
                        : matchedBooking.status === 'in-progress'
                        ? 'bg-[#A9822D]'
                        : 'bg-[#26392E]'
                    }`}
                  ></span>
                  <span className="text-sm font-semibold text-[#16191C]">
                    {matchedBooking.status === 'cancelled'
                      ? 'Dibatalkan'
                      : matchedBooking.status === 'in-progress'
                      ? 'Sedang Berlangsung'
                      : 'Slip Reservasi Aktif • Terkonfirmasi'}
                  </span>
                </div>

                {/* Booking Code with Copy */}
                <div className="flex items-center gap-2 bg-[#E4DBC8] px-3 py-1 rounded">
                  <span className="text-xs text-[#55524A]">No. Ledger:</span>
                  <span className="font-mono text-sm font-semibold text-[#16191C]">
                    {matchedBooking.bookingCode}
                  </span>
                  <button
                    onClick={() => copyCode(matchedBooking.bookingCode)}
                    className="hover:text-[#A9822D] text-[#55524A] transition-colors"
                    title="Salin Kode Booking"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#26392E]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#E4DBC8]/40 p-5 rounded">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-[#55524A]">Waktu & Durasi Sesi</span>
                  <span className="font-medium text-sm text-[#16191C]">{matchedBooking.date}</span>
                  <span className="text-xs text-[#16191C] font-mono">
                    {matchedBooking.startTime} – {matchedBooking.endTime} WIB
                  </span>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-[#55524A]">Pemesan & Unit Kerja</span>
                  <span className="font-medium text-sm text-[#16191C]">{matchedBooking.bookerName}</span>
                  <span className="text-xs text-[#55524A]">{matchedBooking.division}</span>
                </div>

                <div className="flex flex-col gap-0.5 md:col-span-2 pt-2 border-t border-[#55524A]/10">
                  <span className="text-xs text-[#55524A]">Agenda Rapat Kedinasan</span>
                  <p className="font-serif-title text-lg text-[#16191C] font-normal leading-snug">
                    {matchedBooking.meetingTitle}
                  </p>
                </div>

                <div className="flex flex-col gap-0.5 md:col-span-2">
                  <span className="text-xs text-[#55524A]">Peserta & Fasilitas</span>
                  <p className="text-xs text-[#16191C]">
                    {matchedBooking.participantCount} Peserta • {matchedBooking.extraNotes || 'Standar Bilik Lengkap'}
                  </p>
                </div>
              </div>

              {/* Synchronization Banner */}
              <div className="flex items-start gap-2.5 p-3.5 bg-[#26392E]/10 rounded text-xs text-[#16191C]">
                <CheckCircle2 className="w-4 h-4 text-[#26392E] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Sinkronisasi Google Workspace Aktif</span>
                  <p className="text-[#55524A]">
                    Terkunci pada resource <code className="font-mono text-[#16191C]">{currentRoom?.googleCalendarId}</code> dan plakat digital pintu luar.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={openEditModal}
                    disabled={matchedBooking.status === 'cancelled'}
                    className="px-4 py-2 bg-[#16191C] text-[#F1ECDF] text-xs font-medium rounded hover:bg-[#16191C]/90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#A9822D]" />
                    <span>Ubah Jadwal</span>
                  </button>

                  <button
                    onClick={() => onViewVoucher(matchedBooking)}
                    className="px-4 py-2 border border-[#16191C] text-[#16191C] text-xs font-medium rounded hover:bg-[#E4DBC8] flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#A9822D]" />
                    <span>Lihat Slip Voucher</span>
                  </button>
                </div>

                {matchedBooking.status !== 'cancelled' && (
                  <button
                    onClick={() => setIsCancelModalOpen(true)}
                    className="px-3.5 py-2 text-[#6B2A2E] hover:bg-[#6B2A2E]/10 text-xs font-medium rounded flex items-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Batalkan Booking</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Classical Empty State (from Mockup 8) */
            <div className="bg-[#E4DBC8] rounded p-8 md:p-10 flex flex-col justify-between relative overflow-hidden shadow-xs border border-[#55524A]/20">
              <div className="flex flex-col gap-5 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 px-3 py-1 bg-[#F1ECDF] rounded text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#6B2A2E]"></span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#16191C]">
                      Catatan Nihil • Folio 00
                    </span>
                  </div>
                  <span className="text-xs text-[#55524A]">Sinkronisasi: Real-Time</span>
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="font-serif-title text-2xl md:text-3xl text-[#16191C] font-normal leading-tight">
                    Tidak Ada Rekaman Reservasi Ditemukan
                  </h2>
                  <p className="text-sm text-[#55524A] leading-relaxed">
                    Sistem tidak menemukan jadwal pemesanan bilik yang cocok dengan kombinasi data <strong className="text-[#16191C]">{codeInput}</strong> dan surel <strong className="text-[#16191C]">{emailInput}</strong>.
                  </p>
                </div>
              </div>

              {/* 3 Steps Roadmap */}
              <div className="my-6 py-5 border-y border-[#55524A]/15 grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10 text-xs">
                <div className="bg-[#F1ECDF]/80 p-3 rounded">
                  <span className="font-bold text-[#A9822D] block mb-1">01. Periksa Kode</span>
                  <p className="text-[#55524A]">Cek surel konfirmasi awal Anda untuk kode 6-digit (format: BKG-XXXXXX).</p>
                </div>
                <div className="bg-[#F1ECDF]/80 p-3 rounded">
                  <span className="font-bold text-[#A9822D] block mb-1">02. Surel Pemohon</span>
                  <p className="text-[#55524A]">Pastikan email sesuai dengan yang dipakai saat registrasi bilik.</p>
                </div>
                <div className="bg-[#F1ECDF]/80 p-3 rounded">
                  <span className="font-bold text-[#A9822D] block mb-1">03. Bantuan Meja</span>
                  <p className="text-[#55524A]">Hubungi concierge ext. 104 untuk memeriksa status pendaftaran manual.</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 relative z-10">
                <button
                  type="button"
                  onClick={onNavigateNewBooking}
                  className="px-5 py-2.5 bg-[#16191C] text-[#F1ECDF] text-xs font-medium rounded hover:bg-[#16191C]/90 transition-colors"
                >
                  Buat Reservasi Baru
                </button>

                <button
                  type="button"
                  onClick={() => setMagicLinkSent(true)}
                  className="px-4 py-2.5 border border-[#16191C] text-[#16191C] text-xs font-medium rounded hover:bg-[#F1ECDF] transition-colors"
                >
                  Kirim Magic Link ke Surel
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* History Table for this email (FR-12) */}
      {userBookings.length > 0 && (
        <section className="mt-6 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#55524A]/15">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#A9822D]" />
              <h2 className="font-serif-title text-xl text-[#16191C] font-medium">
                Riwayat Reservasi Terdaftar ({emailInput})
              </h2>
            </div>
            <span className="text-xs text-[#55524A]">{userBookings.length} Catatan Ditemukan</span>
          </div>

          <div className="overflow-x-auto bg-[#F1ECDF] rounded border border-[#55524A]/15 shadow-xs">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#E4DBC8] text-[#55524A] text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Tanggal & Jam</th>
                  <th className="py-3 px-4">Ruangan</th>
                  <th className="py-3 px-4">Agenda Rapat</th>
                  <th className="py-3 px-4">Kode Tiket</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#55524A]/10 text-xs">
                {userBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#E4DBC8]/40 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      {b.date} ({b.startTime} - {b.endTime})
                    </td>
                    <td className="py-3 px-4 font-medium text-[#16191C]">{b.roomName}</td>
                    <td className="py-3 px-4 max-w-xs truncate">{b.meetingTitle}</td>
                    <td className="py-3 px-4 font-mono text-[#A9822D] font-medium">{b.bookingCode}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                          b.status === 'confirmed'
                            ? 'bg-[#26392E]/10 text-[#26392E]'
                            : b.status === 'in-progress'
                            ? 'bg-[#A9822D]/10 text-[#A9822D]'
                            : b.status === 'cancelled'
                            ? 'bg-[#6B2A2E]/10 text-[#6B2A2E]'
                            : 'bg-[#55524A]/10 text-[#55524A]'
                        }`}
                      >
                        ● {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setCodeInput(b.bookingCode);
                        }}
                        className="text-[#16191C] hover:text-[#A9822D] font-medium underline"
                      >
                        Buka Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Edit Schedule Modal */}
      {isEditModalOpen && matchedBooking && (
        <div className="fixed inset-0 z-50 bg-[#16191C]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F1ECDF] max-w-lg w-full p-6 md:p-8 rounded shadow-2xl border border-[#55524A]/20">
            <h3 className="font-serif-title text-xl text-[#16191C] mb-1">Ubah Jadwal & Agenda Rapat</h3>
            <p className="text-xs text-[#55524A] mb-5">
              Perubahan waktu akan memvalidasi ulang ketersediaan Google Calendar dan plakat pintu luar ruangan.
            </p>

            {editConflictMsg && (
              <div className="p-3 bg-[#6B2A2E]/10 border border-[#6B2A2E]/30 text-[#6B2A2E] rounded text-xs mb-4 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{editConflictMsg}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-medium text-[#55524A] block mb-1">Judul Agenda</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-transparent border-b border-[#55524A]/40 py-1.5 text-sm text-[#16191C] focus:outline-none focus:border-[#A9822D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-[#55524A] block mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    className="w-full bg-transparent border-b border-[#55524A]/40 py-1.5 text-sm text-[#16191C] focus:outline-none focus:border-[#A9822D]"
                  />
                </div>
                <div>
                  <label className="font-medium text-[#55524A] block mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    className="w-full bg-transparent border-b border-[#55524A]/40 py-1.5 text-sm text-[#16191C] focus:outline-none focus:border-[#A9822D]"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-[#55524A] block mb-1">Jumlah Peserta</label>
                <input
                  type="number"
                  min="1"
                  max={currentRoom?.capacity || 30}
                  value={editParticipants}
                  onChange={(e) => setEditParticipants(Number(e.target.value))}
                  className="w-full bg-transparent border-b border-[#55524A]/40 py-1.5 text-sm text-[#16191C] focus:outline-none focus:border-[#A9822D]"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-xs text-[#55524A] hover:text-[#16191C]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-[#16191C] text-[#F1ECDF] text-xs font-medium rounded hover:bg-[#16191C]/90"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {isCancelModalOpen && matchedBooking && (
        <div className="fixed inset-0 z-50 bg-[#16191C]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F1ECDF] max-w-md w-full p-6 rounded shadow-2xl border border-[#6B2A2E]/30">
            <div className="flex items-center gap-2.5 text-[#6B2A2E] mb-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-serif-title text-xl font-normal">Batalkan Reservasi Bilik?</h3>
            </div>
            <p className="text-xs text-[#55524A] leading-relaxed mb-5">
              Apakah Anda yakin ingin membatalkan pemesanan bilik <strong className="text-[#16191C]">{matchedBooking.roomName}</strong> untuk kode <strong className="text-[#16191C] font-mono">{matchedBooking.bookingCode}</strong>? Jadwal pada plakat pintu luar bilik dan Google Workspace akan langsung dibebaskan untuk pemesan lain.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 text-xs text-[#55524A] hover:text-[#16191C]"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-5 py-2 bg-[#6B2A2E] text-[#F1ECDF] text-xs font-medium rounded hover:bg-[#6B2A2E]/90"
              >
                Ya, Batalkan Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
