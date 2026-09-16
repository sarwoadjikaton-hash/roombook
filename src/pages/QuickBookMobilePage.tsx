import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { getRoomRealTimeStatus, getGoogleCalendarUrl, checkBookingConflict, OPERATING_HOURS, formatDateIndonesian } from '../utils/dateUtils';
import { format } from 'date-fns';
import {
  Clock,
  User as UserIcon,
  Building,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  CalendarPlus,
  Plus,
  Minus,
  X,
  ShieldCheck,
  Tv,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { FacilityIcons } from '../components/common/FacilityIcons';
import { CustomDatePicker } from '../components/common/CustomDatePicker';
import { CustomDropdown } from '../components/common/CustomDropdown';
import { Booking } from '../types';

export const QuickBookMobilePage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { rooms, bookings, quickBook, currentTime, adminUser } = useBooking();

  const currentRoomSlug = roomId || 'ruang-sekjen';
  const currentRoom = rooms.find((r) => r.slug === currentRoomSlug) || rooms[0];

  // Hitung default jam mulai & selesai yang cerdas (slot 30 menit berikutnya)
  const defaultTimes = useMemo(() => {
    const now = currentTime || new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    let startH = currentHour;
    let startM = currentMin >= 30 ? 0 : 30;
    if (currentMin >= 30) startH += 1;

    if (startH < 8) {
      return { start: '09:00', end: '10:30' };
    }
    if (startH >= 17) {
      return { start: '08:00', end: '09:30' };
    }

    const startStr = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;
    const endMinutes = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startH, startM + 90);
    const endStr = `${String(endMinutes.getHours()).padStart(2, '0')}:${String(endMinutes.getMinutes()).padStart(2, '0')}`;

    return {
      start: OPERATING_HOURS.includes(startStr) ? startStr : '09:00',
      end: OPERATING_HOURS.includes(endStr) ? endStr : '10:30',
    };
  }, [currentTime]);

  // Form States (identik dengan Form Pesan Ruangan / BookingModal)
  const [date, setDate] = useState<string>(() => format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState<string>(defaultTimes.start);
  const [endTime, setEndTime] = useState<string>(defaultTimes.end);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [attendeeCount, setAttendeeCount] = useState<number>(() => (currentRoom?.capacity > 8 ? 8 : currentRoom?.capacity || 4));
  const [attendees, setAttendees] = useState<string[]>([]);
  const [attendeeInput, setAttendeeInput] = useState<string>('');

  // Identitas Pemohon (Selalu kosong untuk pemohon baru)
  const [applicantName, setApplicantName] = useState<string>(() => (adminUser ? adminUser.name : ''));
  const [applicantEmail, setApplicantEmail] = useState<string>(() => (adminUser ? adminUser.email : ''));
  const [applicantDept, setApplicantDept] = useState<string>(() => (adminUser ? adminUser.department : ''));

  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [successBooking, setSuccessBooking] = useState<Booking | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const statusInfo = getRoomRealTimeStatus(bookings, currentRoom?.slug || '', currentTime);

  // Sync admin identity if logged in
  useEffect(() => {
    if (adminUser) {
      setApplicantName(adminUser.name);
      setApplicantEmail(adminUser.email);
      setApplicantDept(adminUser.department);
    }
  }, [adminUser]);

  // Validasi bentrok realtime saat user ganti tanggal, jam mulai, atau jam selesai
  useEffect(() => {
    if (!currentRoom || !date || !startTime || !endTime) return;

    if (startTime >= endTime) {
      setConflictWarning('Waktu selesai harus lebih besar dari waktu mulai.');
      return;
    }

    const conflict = checkBookingConflict(bookings, currentRoom.slug, date, startTime, endTime);

    if (conflict.hasConflict && conflict.conflictingBooking) {
      setConflictWarning(
        `Jadwal bentrok dengan: "${conflict.conflictingBooking.title}" (${conflict.conflictingBooking.startTime} – ${conflict.conflictingBooking.endTime} WIB)`
      );
    } else {
      setConflictWarning(null);
    }
  }, [currentRoom, date, startTime, endTime, bookings]);

  // Tambah Chip Peserta
  const handleAddAttendee = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (attendeeInput.trim() && !attendees.includes(attendeeInput.trim())) {
      setAttendees([...attendees, attendeeInput.trim()]);
      setAttendeeInput('');
    }
  };

  const handleRemoveAttendee = (item: string) => {
    setAttendees(attendees.filter((a) => a !== item));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const finalName = applicantName.trim() || 'Pegawai Instansi';
    const finalEmail = applicantEmail.trim() || 'pemohon@gmail.com';
    const finalDept = applicantDept.trim() || 'Unit Kerja';

    // Simpan ke localStorage untuk kenyamanan pemesanan berikutnya di HP ini
    if (!adminUser) {
      localStorage.setItem('mrbs_guest_name', finalName);
      localStorage.setItem('mrbs_guest_email', finalEmail);
      localStorage.setItem('mrbs_guest_dept', finalDept);
    }

    if (!title.trim()) {
      setErrorMessage('Silakan masukkan nama / agenda kegiatan rapat.');
      return;
    }

    if (startTime >= endTime) {
      setErrorMessage('Waktu selesai harus setelah waktu mulai rapat.');
      return;
    }

    if (attendeeCount > (currentRoom?.capacity || 0)) {
      setErrorMessage(
        `Jumlah peserta (${attendeeCount}) melebihi kapasitas maksimum ${currentRoom?.name} (${currentRoom?.capacity} orang).`
      );
      return;
    }

    const result = quickBook(
      currentRoom.slug,
      title.trim(),
      {
        startTime,
        endTime,
        date,
        description: description.trim() || 'Dipesan instan melalui Scan QR Code HP.',
        attendeeCount,
        attendees,
        organizerName: finalName,
        organizerEmail: finalEmail,
        organizerDept: finalDept,
      },
      finalName
    );

    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    if (result.booking) {
      setSuccessBooking(result.booking);
    }
    setIsSuccess(true);
  };

  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="bg-surface p-6 rounded-card border border-border text-center max-w-sm">
          <p className="text-text-secondary">Ruangan tidak ditemukan.</p>
          <Link to="/dashboard" className="mt-4 inline-block px-4 py-2 bg-primary text-white text-sm font-bold rounded-btn">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between py-5 px-3.5 sm:px-6 max-w-lg mx-auto font-sans">
      <div className="space-y-4">
        {/* Mobile Header Navigasi */}
        <div className="flex items-center justify-between pb-3 border-b border-border/80">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-dark transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Beranda</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 bg-blue-50 text-primary border border-primary/25 rounded-full shadow-xs">
              Pesan Cepat (Scan QR)
            </span>
          </div>
        </div>

        {/* 1. Header Informasi Ruangan Terkunci (Sesuai QR Code Ruangan) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-primary/30 shadow-md space-y-3 bg-gradient-to-br from-blue-50/50 via-white to-sky-50/40 overflow-hidden">
          {/* Room Photo Banner */}
          {currentRoom.imageUrl && (
            <div className="relative h-36 sm:h-44 -mx-4 -mt-4 sm:-mx-5 sm:-mt-5 mb-3 overflow-hidden border-b border-primary/20">
              <img
                src={currentRoom.imageUrl}
                alt={currentRoom.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-white text-xs font-bold drop-shadow">
                <span className="flex items-center gap-1.5">
                  <Building size={13} className="text-sky-300" />
                  <span>{currentRoom.location}</span>
                </span>
                <span className="px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-md text-[10px] border border-white/20">
                  {currentRoom.name}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <Building size={14} />
                <span>{currentRoom.location}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-text-primary mt-0.5 tracking-tight">
                {currentRoom.name}
              </h1>
            </div>
            <StatusBadge status={statusInfo.status} size="sm" />
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm text-text-secondary pt-2.5 border-t border-border/70 gap-2">
            <span className="flex items-center gap-1.5 font-bold text-text-primary">
              <Users size={14} className="text-primary" />
              Kapasitas: {currentRoom.capacity} Orang
            </span>
            <span className="font-semibold text-text-muted">
              {statusInfo.status === 'occupied'
                ? 'Sedang Berlangsung Rapat'
                : `Tersedia s/d ${statusInfo.freeUntil || 'Selesai Hari Ini'}`}
            </span>
          </div>

          {currentRoom.facilities && currentRoom.facilities.length > 0 && (
            <div className="pt-2 border-t border-border/60">
              <FacilityIcons facilities={currentRoom.facilities} size={14} />
            </div>
          )}

          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900 font-semibold">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <span>Pemesanan melalui QR Code ini <strong>langsung aktif</strong> di layar depan ruangan.</span>
          </div>
        </div>

        {/* 2. Success View vs Form View */}
        {isSuccess && successBooking ? (
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-emerald-300 shadow-md text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={32} />
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-black text-text-primary">Ruangan Berhasil Dipesan!</h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                Layar di depan <strong>{currentRoom.name}</strong> telah diperbarui dan jadwal Anda telah aktif.
              </p>
            </div>

            {/* Ringkasan Data Booking */}
            <div className="p-4 bg-stone-50 rounded-xl text-left space-y-2 border border-border text-xs sm:text-sm">
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span className="text-text-secondary font-medium">Ruangan:</span>
                <span className="font-bold text-text-primary">{currentRoom.name}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span className="text-text-secondary font-medium">Tanggal:</span>
                <span className="font-bold text-text-primary">{formatDateIndonesian(successBooking.date)}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span className="text-text-secondary font-medium">Waktu:</span>
                <span className="font-extrabold text-primary">{successBooking.startTime} – {successBooking.endTime} WIB</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span className="text-text-secondary font-medium">Agenda:</span>
                <span className="font-bold text-text-primary">{successBooking.title}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span className="text-text-secondary font-medium">PIC:</span>
                <span className="font-semibold text-text-primary">{successBooking.organizerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary font-medium">Peserta:</span>
                <span className="font-semibold text-text-primary">{successBooking.attendeeCount} Orang</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-2.5">
              <a
                href={getGoogleCalendarUrl({
                  title: successBooking.title,
                  description: `${successBooking.description || 'Pemesanan ruangan via Quick Book.'}\n\nPIC: ${successBooking.organizerName} (${successBooking.organizerDept})`,
                  roomName: currentRoom.name,
                  date: successBooking.date,
                  startTime: successBooking.startTime,
                  endTime: successBooking.endTime,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <CalendarPlus size={16} />
                <span>Simpan di Google Kalender</span>
              </a>

              <Link
                to={`/display/${currentRoom.slug}`}
                className="w-full py-3 px-4 bg-primary hover:bg-primary-light text-white text-sm font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Tv size={16} />
                <span>Lihat Layar Display TV</span>
              </Link>

              <button
                onClick={() => {
                  setIsSuccess(false);
                  setTitle('');
                  setDescription('');
                  setAttendees([]);
                  setSuccessBooking(null);
                }}
                className="w-full py-2.5 px-4 bg-stone-100 text-text-secondary text-sm font-bold rounded-xl hover:bg-stone-200"
              >
                Pesan Jadwal Lain
              </button>
            </div>
          </div>
        ) : (
          /* Formulir Lengkap Pemesanan Cepat (Sama Rapi dengan Form Modal Peminjaman) */
          <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-5 rounded-2xl border border-border shadow-md space-y-4">
            {errorMessage && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-status-danger flex items-start gap-2.5 font-semibold">
                <AlertTriangle size={17} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Identitas Pemohon */}
            <div className="p-3.5 sm:p-4 bg-stone-50/90 border border-border rounded-xl space-y-3">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-primary">
                <UserIcon size={15} />
                <span>Data Pemohon</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="Nama Lengkap Anda"
                  className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    placeholder="email@gmail.com"
                    className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">
                    Unit Kerja / Bagian *
                  </label>
                  <input
                    type="text"
                    value={applicantDept}
                    onChange={(e) => setApplicantDept(e.target.value)}
                    placeholder="Contoh: Biro Umum"
                    className="w-full px-3 py-2 bg-white border border-border rounded-lg text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 2. Nama / Agenda Kegiatan */}
            <div>
              <label className="block text-sm font-extrabold text-text-primary mb-1.5">
                Nama / Agenda Kegiatan *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Rapat Koordinasi Evaluasi Mingguan"
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-sm sm:text-base font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-2xs"
                required
              />
            </div>

            {/* 3. Tanggal & Waktu Pelaksanaan */}
            <div className="space-y-3 p-3.5 sm:p-4 bg-stone-50/90 border border-border rounded-xl">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-text-primary">
                <Clock size={15} className="text-primary" />
                <span>Tanggal & Waktu Rapat *</span>
              </div>

              {/* Tanggal dengan CustomDatePicker */}
              <div>
                <CustomDatePicker
                  label="Tanggal Rapat *"
                  value={date}
                  onChange={(newDate) => setDate(newDate)}
                  minDate={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>

              {/* Jam Mulai & Selesai dengan CustomDropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CustomDropdown
                  label="Jam Mulai *"
                  hideAvatar={true}
                  options={OPERATING_HOURS.map((hour) => ({
                    value: hour,
                    label: `${hour} WIB`,
                  }))}
                  value={startTime}
                  onChange={(val) => setStartTime(val)}
                />

                <CustomDropdown
                  label="Jam Selesai *"
                  hideAvatar={true}
                  options={OPERATING_HOURS.map((hour) => ({
                    value: hour,
                    label: `${hour} WIB`,
                  }))}
                  value={endTime}
                  onChange={(val) => setEndTime(val)}
                />
              </div>

              {/* Conflict Warning Indicator */}
              {conflictWarning && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 font-semibold flex items-start gap-2">
                  <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <span>{conflictWarning}</span>
                </div>
              )}
            </div>

            {/* 4. Jumlah Peserta */}
            <div>
              <label className="block text-sm font-extrabold text-text-primary mb-1.5">
                Jumlah Peserta (Maks: {currentRoom.capacity} Orang) *
              </label>
              <div className="flex items-center gap-2 max-w-xs">
                <button
                  type="button"
                  onClick={() => setAttendeeCount((prev) => Math.max(1, prev - 1))}
                  className="w-10 h-10 rounded-xl bg-stone-100 border border-border hover:bg-stone-200 flex items-center justify-center font-bold text-text-primary text-base active:scale-95"
                >
                  <Minus size={16} />
                </button>
                <div className="relative flex-1">
                  <input
                    type="number"
                    min={1}
                    max={currentRoom.capacity}
                    value={attendeeCount}
                    onChange={(e) => setAttendeeCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-white border border-border rounded-xl text-center font-black text-text-primary text-base focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setAttendeeCount((prev) => Math.min(currentRoom.capacity, prev + 1))}
                  className="w-10 h-10 rounded-xl bg-stone-100 border border-border hover:bg-stone-200 flex items-center justify-center font-bold text-text-primary text-base active:scale-95"
                >
                  <Plus size={16} />
                </button>
                <span className="text-xs font-semibold text-text-secondary">Orang</span>
              </div>
            </div>

            {/* 5. Undangan Peserta Tambahan (Chips Tagging) */}
            <div>
              <label className="block text-sm font-extrabold text-text-primary mb-1.5">
                Undang Peserta Tambahan (Email / Nama)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={attendeeInput}
                  onChange={(e) => setAttendeeInput(e.target.value)}
                  onKeyDown={handleAddAttendee}
                  placeholder="Ketik email / nama dan tekan +"
                  className="flex-1 px-3.5 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-medium"
                />
                <button
                  type="button"
                  onClick={handleAddAttendee}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-text-primary text-sm font-bold rounded-xl border border-border flex items-center justify-center transition-colors active:scale-95"
                >
                  <Plus size={16} />
                </button>
              </div>

              {attendees.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {attendees.map((att) => (
                    <span
                      key={att}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-xs font-semibold rounded-full text-blue-900"
                    >
                      <span>{att}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttendee(att)}
                        className="text-blue-700 hover:text-status-danger"
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 6. Deskripsi / Catatan Tambahan */}
            <div>
              <label className="block text-sm font-extrabold text-text-primary mb-1.5">
                Deskripsi / Catatan Rapat (Opsional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Kebutuhan fasilitas khusus, link materi rapat, dsb..."
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none font-medium"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!!conflictWarning}
                className={`w-full py-3.5 px-4 text-sm sm:text-base font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${conflictWarning
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                    : 'bg-primary hover:bg-primary-light text-white active:scale-98 shadow-primary/20'
                  }`}
              >
                <CheckCircle2 size={18} />
                <span>Konfirmasi Pemesanan Ruangan</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Official Footer Kemnaker */}
      <footer className="mt-8 pt-4 border-t border-border/80 text-center text-xs text-text-muted space-y-1">
        <p className="font-extrabold text-text-secondary">
          ROOMBOOK
        </p>
        <p className="text-[11px]">Sistem Peminjaman Ruang Rapat - TU SEKJEN</p>
      </footer>
    </div>
  );
};
