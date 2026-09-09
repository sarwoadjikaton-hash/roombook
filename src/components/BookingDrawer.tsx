import React, { useState, useEffect, useMemo } from 'react';
import { Room, Booking, ActivityLog } from '../types';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  Mail, 
  FileText, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck,
  Building,
  Lightbulb,
  Check
} from 'lucide-react';
import { isOverlapping, generateBookingCode } from '../data/initialData';

interface BookingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  selectedRoomId?: string;
  defaultStartTime?: string;
  defaultEndTime?: string;
  bookings: Booking[];
  onBookingCreated: (booking: Booking, log: ActivityLog) => void;
}

export const BookingDrawer: React.FC<BookingDrawerProps> = ({
  isOpen,
  onClose,
  rooms,
  selectedRoomId = 'sekjen',
  defaultStartTime = '11:00',
  defaultEndTime = '12:30',
  bookings,
  onBookingCreated,
}) => {
  const [roomId, setRoomId] = useState<string>(selectedRoomId);
  const [date, setDate] = useState<string>('2026-09-10');
  const [startTime, setStartTime] = useState<string>(defaultStartTime);
  const [endTime, setEndTime] = useState<string>(defaultEndTime);
  const [bookerName, setBookerName] = useState<string>('');
  const [bookerEmail, setBookerEmail] = useState<string>('');
  const [division, setDivision] = useState<string>('');
  const [meetingTitle, setMeetingTitle] = useState<string>('');
  const [participantCount, setParticipantCount] = useState<number>(8);
  const [extraAmenities, setExtraAmenities] = useState<string>('Standar Bilik Lengkap');
  const [attendeesEmails, setAttendeesEmails] = useState<string>('');
  const [conflictError, setConflictError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedRoomId) setRoomId(selectedRoomId);
  }, [selectedRoomId]);

  useEffect(() => {
    if (defaultStartTime) setStartTime(defaultStartTime);
    if (defaultEndTime) setEndTime(defaultEndTime);
  }, [defaultStartTime, defaultEndTime]);

  // Check for conflict live
  useEffect(() => {
    if (!roomId || !date || !startTime || !endTime) {
      setConflictError(null);
      return;
    }

    const conflicting = bookings.find(
      (b) =>
        b.roomId === roomId &&
        b.date === date &&
        b.status !== 'cancelled' &&
        isOverlapping(startTime, endTime, b.startTime, b.endTime)
    );

    if (conflicting) {
      setConflictError(
        `Bentrok Jadwal: Ruangan ini telah dipesan untuk "${conflicting.meetingTitle}" (${conflicting.startTime} - ${conflicting.endTime} WIB). Silakan pilih slot jam lain.`
      );
    } else {
      setConflictError(null);
    }
  }, [roomId, date, startTime, endTime, bookings]);

  if (!isOpen) return null;

  const currentRoom = rooms.find((r) => r.id === roomId) || rooms[0];

  // Smart suggestion: Available alternative rooms when conflict occurs
  const availableAlternatives = useMemo(() => {
    if (!conflictError || !date || !startTime || !endTime) return [];
    return rooms.filter((r) => {
      if (r.id === roomId || r.status !== 'active') return false;
      const isConflicted = bookings.some(
        (b) =>
          b.roomId === r.id &&
          b.date === date &&
          b.status !== 'cancelled' &&
          isOverlapping(startTime, endTime, b.startTime, b.endTime)
      );
      return !isConflicted;
    });
  }, [conflictError, rooms, roomId, date, startTime, endTime, bookings]);

  // Smart suggestion: Peak hour indicator
  const isPeakHour = ['10:00', '10:30', '11:00', '14:00', '14:30'].includes(startTime);

  // Smart suggestion: Right sizing
  const isRightSizeOversized = roomId === 'sekjen' && participantCount <= 10;
  const isRightSizeUndersized = roomId === 'transit' && participantCount > 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (conflictError) {
      return;
    }

    const bookingCode = generateBookingCode();
    const token = `tok_${bookingCode.replace('BKG-', '')}_${Math.random().toString(36).substring(2, 8)}`;
    const googleId = `gcal_${Math.random().toString(36).substring(2, 11)}`;

    const attendeesList = attendeesEmails
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    const newBooking: Booking = {
      id: `bkg-${Date.now()}`,
      bookingCode,
      roomId: currentRoom.id,
      roomName: currentRoom.name,
      bookerName,
      bookerEmail,
      division: division || 'Umum & Kedinasan',
      meetingTitle,
      date,
      startTime,
      endTime,
      participantCount: Number(participantCount),
      attendeesEmails: attendeesList,
      extraNotes: extraAmenities,
      status: 'confirmed',
      googleEventId: googleId,
      manageToken: token,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: '10 Sep 2026, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      actor: bookerName,
      division: division || 'Instansi Pemohon',
      action: 'created',
      roomName: currentRoom.name,
      bookingCode,
      googleSyncId: googleId,
      details: `Pemesanan mandiri tanpa login: ${meetingTitle} (${startTime} - ${endTime} WIB).`,
    };

    onBookingCreated(newBooking, newLog);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-[#16191C]/60 backdrop-blur-xs transition-opacity" 
      />

      {/* Drawer Container */}
      <aside className="relative z-50 w-full sm:w-[540px] max-w-full bg-[#F1ECDF] text-[#16191C] h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-[#55524A]/20 animate-fade-in">
        <div>
          {/* Header */}
          <div className="p-6 bg-[#E4DBC8] border-b border-[#55524A]/20 flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#A9822D]">
                Registrasi Concierge Tanpa Login
              </span>
              <h2 className="font-serif-title text-2xl text-[#16191C] mt-1 font-normal">
                Formulir Reservasi Ruangan
              </h2>
              <p className="text-[13px] text-[#55524A] mt-1">
                Sistem instan. Kode tiket 6-digit & magic link pembatalan akan diterbitkan langsung.
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 text-[#55524A] hover:text-[#16191C] hover:bg-[#F1ECDF] rounded transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Selected Room Banner */}
            <div className="bg-[#E4DBC8]/60 p-4 border-l-3 border-[#A9822D] rounded-r">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-[#55524A] block">
                Bilik Pertemuan Terpilih
              </label>
              <div className="flex items-center justify-between mt-1">
                <select
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="bg-transparent font-serif-title text-lg font-medium text-[#16191C] focus:outline-none cursor-pointer pr-4"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (Kapasitas {r.capacity} Orang)
                    </option>
                  ))}
                </select>
                <span className="text-xs text-[#26392E] font-semibold bg-[#26392E]/10 px-2 py-0.5 rounded">
                  {currentRoom.location}
                </span>
              </div>
              <div className="mt-2 text-xs text-[#55524A] flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#A9822D]" />
                <span>Google Calendar ID: <code className="text-[#16191C] font-mono">{currentRoom.googleCalendarId}</code></span>
              </div>
            </div>

            {/* Date & Time Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[12px] font-medium text-[#55524A] block mb-1">
                  Tanggal Rapat
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-transparent border-b border-[#55524A]/40 py-1.5 text-sm font-medium text-[#16191C] focus:outline-none focus:border-[#A9822D]"
                />
              </div>

              <div>
                <label className="text-[12px] font-medium text-[#55524A] block mb-1">
                  Mulai Pukul
                </label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-transparent border-b border-[#55524A]/40 py-1.5 text-sm font-medium text-[#16191C] focus:outline-none focus:border-[#A9822D]"
                >
                  <option value="08:00">08:00 WIB</option>
                  <option value="08:30">08:30 WIB</option>
                  <option value="09:00">09:00 WIB</option>
                  <option value="09:30">09:30 WIB</option>
                  <option value="10:00">10:00 WIB</option>
                  <option value="10:30">10:30 WIB</option>
                  <option value="11:00">11:00 WIB</option>
                  <option value="11:30">11:30 WIB</option>
                  <option value="12:00">12:00 WIB</option>
                  <option value="13:00">13:00 WIB</option>
                  <option value="13:30">13:30 WIB</option>
                  <option value="14:00">14:00 WIB</option>
                  <option value="14:30">14:30 WIB</option>
                  <option value="15:00">15:00 WIB</option>
                  <option value="15:30">15:30 WIB</option>
                  <option value="16:00">16:00 WIB</option>
                  <option value="16:30">16:30 WIB</option>
                  <option value="17:00">17:00 WIB</option>
                </select>
              </div>

              <div>
                <label className="text-[12px] font-medium text-[#55524A] block mb-1">
                  Hingga Pukul
                </label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-transparent border-b border-[#55524A]/40 py-1.5 text-sm font-medium text-[#16191C] focus:outline-none focus:border-[#A9822D]"
                >
                  <option value="09:00">09:00 WIB</option>
                  <option value="09:30">09:30 WIB</option>
                  <option value="10:00">10:00 WIB</option>
                  <option value="10:30">10:30 WIB</option>
                  <option value="11:00">11:00 WIB</option>
                  <option value="11:30">11:30 WIB</option>
                  <option value="12:00">12:00 WIB</option>
                  <option value="12:30">12:30 WIB</option>
                  <option value="13:00">13:00 WIB</option>
                  <option value="14:00">14:00 WIB</option>
                  <option value="14:30">14:30 WIB</option>
                  <option value="15:00">15:00 WIB</option>
                  <option value="15:30">15:30 WIB</option>
                  <option value="16:00">16:00 WIB</option>
                  <option value="16:30">16:30 WIB</option>
                  <option value="17:00">17:00 WIB</option>
                  <option value="17:30">17:30 WIB</option>
                  <option value="18:00">18:00 WIB</option>
                </select>
              </div>
            </div>

            {/* Peak Hour Suggestion */}
            {isPeakHour && (
              <div className="p-2.5 bg-[#A9822D]/10 border border-[#A9822D]/30 rounded text-xs text-[#16191C] flex items-start gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-[#A9822D] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold block text-[11px] text-[#A9822D]">
                    Saran Waktu Bebas Kepadatan (Peak Hour Advisory):
                  </span>
                  <p className="text-[#55524A] text-[11px] leading-relaxed">
                    Pukul <strong className="text-[#16191C]">{startTime} WIB</strong> adalah jam paling padat di gedung. Jika jadwal rapat Anda fleksibel, disarankan memilih slot <em>Green Hours</em> (08:30 atau 15:30) untuk kelancaran fasilitas.
                  </p>
                </div>
              </div>
            )}

            {/* Conflict Warning Box if any */}
            {conflictError && (
              <div className="p-3 bg-[#6B2A2E]/10 border border-[#6B2A2E]/30 text-[#6B2A2E] rounded text-xs space-y-2 animate-shake">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{conflictError}</span>
                </div>

                {/* Alternative Room Suggestion */}
                {availableAlternatives.length > 0 && (
                  <div className="pt-2 border-t border-[#6B2A2E]/20 text-[#16191C] text-[11px]">
                    <span className="font-semibold text-[#26392E] flex items-center gap-1 mb-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#A9822D]" />
                      Saran Bilik Alternatif Tersedia pada {startTime} - {endTime} WIB:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {availableAlternatives.map((alt) => (
                        <button
                          key={alt.id}
                          type="button"
                          onClick={() => setRoomId(alt.id)}
                          className="px-2.5 py-1 bg-[#16191C] text-[#F1ECDF] hover:bg-[#A9822D] hover:text-[#16191C] rounded transition-colors text-xs font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <span>Pindah ke {alt.name} ({alt.capacity} Pax)</span>
                          <Check className="w-3 h-3 text-[#A9822D]" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Nama & Email Pemesan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-medium text-[#55524A] block mb-1">
                  Nama Lengkap Pemesan <span className="text-[#6B2A2E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Raden Satria Wibawa"
                  value={bookerName}
                  onChange={(e) => setBookerName(e.target.value)}
                  className="w-full bg-transparent border-b border-[#55524A]/40 py-1.5 text-sm text-[#16191C] placeholder:text-[#55524A]/40 focus:outline-none focus:border-[#A9822D]"
                />
              </div>

              <div>
                <label className="text-[12px] font-medium text-[#55524A] block mb-1">
                  Surel Resmi Instansi <span className="text-[#6B2A2E]">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="nama@instansi.go.id"
                  value={bookerEmail}
                  onChange={(e) => setBookerEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-[#55524A]/40 py-1.5 text-sm text-[#16191C] placeholder:text-[#55524A]/40 focus:outline-none focus:border-[#A9822D]"
                />
              </div>
            </div>

            {/* Unit Kerja / Divisi */}
            <div>
              <label className="text-[12px] font-medium text-[#55524A] block mb-1">
                Unit Kerja / Biro / Divisi Pemohon
              </label>
              <input
                type="text"
                placeholder="Contoh: Biro Perencanaan & Keuangan"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full bg-transparent border-b border-[#55524A]/40 py-1.5 text-sm text-[#16191C] placeholder:text-[#55524A]/40 focus:outline-none focus:border-[#A9822D]"
              />
            </div>

            {/* Judul Rapat */}
            <div>
              <label className="text-[12px] font-medium text-[#55524A] block mb-1">
                Judul Agenda Rapat <span className="text-[#6B2A2E]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Koordinasi Anggaran Q4 & Belanja Modal"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                className="w-full bg-transparent border-b border-[#55524A]/40 py-1.5 text-sm text-[#16191C] placeholder:text-[#55524A]/40 focus:outline-none focus:border-[#A9822D]"
              />
            </div>

            {/* Peserta & Kebutuhan Tambahan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-medium text-[#55524A] block mb-1">
                  Jumlah Peserta (Max: {currentRoom.capacity})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={currentRoom.capacity}
                    value={participantCount}
                    onChange={(e) => setParticipantCount(Math.min(currentRoom.capacity, Number(e.target.value)))}
                    className="w-full bg-transparent border-b border-[#55524A]/40 py-1.5 text-sm font-medium text-[#16191C] focus:outline-none focus:border-[#A9822D]"
                  />
                  <span className="absolute right-2 top-2 text-xs text-[#55524A]">Pax</span>
                </div>
              </div>

              <div>
                <label className="text-[12px] font-medium text-[#55524A] block mb-1">
                  Fasilitas Ekstra
                </label>
                <select
                  value={extraAmenities}
                  onChange={(e) => setExtraAmenities(e.target.value)}
                  className="w-full bg-transparent border-b border-[#55524A]/40 py-1.5 text-xs text-[#16191C] focus:outline-none focus:border-[#A9822D]"
                >
                  <option value="Standar Bilik Lengkap">Standar Bilik Lengkap</option>
                  <option value="Aktifkan Zoom Room & Mic Array">Aktifkan Zoom Room & Mic Array</option>
                  <option value="Siapkan Sambungan Laptop HDMI & Proyektor">Siapkan HDMI & Proyektor</option>
                  <option value="Layanan Air Mineral Concierge">Layanan Air Mineral Concierge</option>
                </select>
              </div>
            </div>

            {/* Right-sizing Smart Suggestion */}
            {isRightSizeOversized && (
              <div className="p-2.5 bg-[#E4DBC8] border border-[#A9822D]/40 rounded text-xs text-[#16191C] space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#A9822D] font-semibold text-[11px]">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Saran Efisiensi Bilik (Right-Sizing):</span>
                </div>
                <p className="text-[#55524A] text-[11px] leading-relaxed">
                  Untuk <strong>{participantCount} peserta</strong>, disarankan memilih bilik yang lebih pas agar Ruang Sekjen tetap lowong untuk rapat pleno pimpinan:
                </p>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setRoomId('transit')}
                    className="px-2.5 py-1 bg-[#16191C] text-[#F1ECDF] hover:bg-[#A9822D] hover:text-[#16191C] rounded text-xs font-medium transition-colors cursor-pointer"
                  >
                    Pindah ke Ruang Transit (10 Pax)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoomId('vip')}
                    className="px-2.5 py-1 bg-[#16191C] text-[#F1ECDF] hover:bg-[#A9822D] hover:text-[#16191C] rounded text-xs font-medium transition-colors cursor-pointer"
                  >
                    Pindah ke Ruang VIP (15 Pax)
                  </button>
                </div>
              </div>
            )}

            {isRightSizeUndersized && (
              <div className="p-2.5 bg-[#6B2A2E]/10 border border-[#6B2A2E]/30 rounded text-xs text-[#6B2A2E] space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Kapasitas Kursi Terlampaui:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Ruang Transit hanya memiliki kapasitas 10 orang (peserta: {participantCount} orang). Disarankan beralih ke:
                </p>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setRoomId('vip')}
                    className="px-2.5 py-1 bg-[#16191C] text-[#F1ECDF] hover:bg-[#A9822D] hover:text-[#16191C] rounded text-xs font-medium transition-colors cursor-pointer"
                  >
                    Pindah ke Ruang VIP (15 Pax)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoomId('sekjen')}
                    className="px-2.5 py-1 bg-[#16191C] text-[#F1ECDF] hover:bg-[#A9822D] hover:text-[#16191C] rounded text-xs font-medium transition-colors cursor-pointer"
                  >
                    Pindah ke Ruang Sekjen (30 Pax)
                  </button>
                </div>
              </div>
            )}

            {/* Attendees Emails (comma separated) */}
            <div>
              <label className="text-[12px] font-medium text-[#55524A] block mb-1">
                Email Peserta / Rekan Kerja (Opsional)
              </label>
              <input
                type="text"
                placeholder="rekan1@instansi.go.id, rekan2@instansi.go.id"
                value={attendeesEmails}
                onChange={(e) => setAttendeesEmails(e.target.value)}
                className="w-full bg-transparent border-b border-[#55524A]/40 py-1.5 text-xs text-[#16191C] placeholder:text-[#55524A]/40 focus:outline-none focus:border-[#A9822D]"
              />
              <span className="text-[11px] text-[#55524A] mt-1 block">
                Undangan kalender Google otomatis dikirimkan ke alamat-alamat ini.
              </span>
            </div>

            {/* Trust Notice */}
            <div className="bg-[#E4DBC8]/50 p-3.5 border border-[#55524A]/15 rounded text-xs text-[#55524A] flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#A9822D] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-[#16191C]">Otentikasi Tanpa Sandi:</strong> Anda akan menerima tautan magic link dan kode booking unik 6-digit untuk mengedit atau membatalkan reservasi ini kapan saja.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={Boolean(conflictError)}
                className={`w-full py-3 px-4 font-medium text-sm text-[#F1ECDF] transition-all text-center flex items-center justify-center gap-2 ${
                  conflictError 
                    ? 'bg-[#55524A] cursor-not-allowed opacity-60' 
                    : 'bg-[#16191C] hover:bg-[#16191C]/90 active:scale-[0.99]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-[#A9822D]" />
                <span>Pesan Ruangan Sekarang</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-xs text-[#55524A] hover:text-[#16191C] transition-colors text-center"
              >
                Kembali ke Buku Jadwal
              </button>
            </div>
          </form>
        </div>
      </aside>
    </div>
  );
};
