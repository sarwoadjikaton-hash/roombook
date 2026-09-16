import React, { useState, useEffect } from 'react';
import { useBooking } from '../../context/BookingContext';
import { Modal } from '../common/Modal';
import { checkBookingConflict, OPERATING_HOURS } from '../../utils/dateUtils';
import { format } from 'date-fns';
import {
  AlertTriangle,
  CheckCircle2,
  X,
  Plus,
  ShieldAlert,
  User as UserIcon,
} from 'lucide-react';
import { CustomDatePicker } from '../common/CustomDatePicker';
import { CustomDropdown } from '../common/CustomDropdown';
import { BookingSuccessModal } from './BookingSuccessModal';
import { Booking } from '../../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRoomSlug?: string;
  defaultDate?: string;
  defaultStartTime?: string;
  defaultEndTime?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  defaultRoomSlug,
  defaultDate,
  defaultStartTime,
  defaultEndTime,
}) => {
  const { rooms, bookings, adminUser, createBooking } = useBooking();

  const [roomSlug, setRoomSlug] = useState<string>(defaultRoomSlug || rooms[0]?.slug || 'ruang-sekjen');
  const [date, setDate] = useState<string>(defaultDate || format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState<string>(defaultStartTime || '09:00');
  const [endTime, setEndTime] = useState<string>(defaultEndTime || '10:30');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [attendeeCount, setAttendeeCount] = useState<number | string>(0);
  const [attendees, setAttendees] = useState<string[]>([]);
  const [attendeeInput, setAttendeeInput] = useState<string>('');
  
  // State untuk Notifikasi & Modal Berhasil
  const [successBooking, setSuccessBooking] = useState<Booking | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // Field Identitas Pemohon untuk Publik (Selalu kosong secara default untuk pemohon baru)
  const [applicantName, setApplicantName] = useState<string>(() => (adminUser ? adminUser.name : ''));
  const [applicantEmail, setApplicantEmail] = useState<string>(() => (adminUser ? adminUser.email : ''));
  const [applicantDept, setApplicantDept] = useState<string>(() => (adminUser ? adminUser.department : ''));

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const selectedRoom = rooms.find((r) => r.slug === roomSlug) || rooms[0];

  useEffect(() => {
    if (isOpen) {
      if (defaultRoomSlug) setRoomSlug(defaultRoomSlug);
      if (defaultDate) setDate(defaultDate);
      if (defaultStartTime) setStartTime(defaultStartTime);
      if (defaultEndTime) setEndTime(defaultEndTime);
      setErrorMessage(null);
      setTitle('');
      setDescription('');
      setAttendees([]);
      setAttendeeCount(0);

      if (adminUser) {
        setApplicantName(adminUser.name);
        setApplicantEmail(adminUser.email);
        setApplicantDept(adminUser.department);
      } else {
        setApplicantName('');
        setApplicantEmail('');
        setApplicantDept('');
      }
    }
  }, [isOpen, defaultRoomSlug, defaultDate, defaultStartTime, defaultEndTime, adminUser]);

  useEffect(() => {
    if (!roomSlug || !date || !startTime || !endTime) return;

    if (startTime >= endTime) {
      setConflictWarning('Waktu selesai harus lebih besar dari waktu mulai.');
      return;
    }

    const conflict = checkBookingConflict(bookings, roomSlug, date, startTime, endTime);
    if (conflict.hasConflict && conflict.conflictingBooking) {
      setConflictWarning(
        `Jadwal bentrok dengan: "${conflict.conflictingBooking.title}" (${conflict.conflictingBooking.startTime} - ${conflict.conflictingBooking.endTime})`
      );
    } else {
      setConflictWarning(null);
    }
  }, [roomSlug, date, startTime, endTime, bookings]);

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
    const finalEmail = applicantEmail.trim() || 'pegawai@gmail.com';
    const finalDept = applicantDept.trim() || 'Unit Kerja';

    // Simpan ke local storage untuk kemudahan pengisian berikutnya
    if (!adminUser) {
      localStorage.setItem('mrbs_guest_name', finalName);
      localStorage.setItem('mrbs_guest_email', finalEmail);
      localStorage.setItem('mrbs_guest_dept', finalDept);
    }

    if (!title.trim()) {
      setErrorMessage('Silakan isi nama / judul rapat.');
      return;
    }

    if (startTime >= endTime) {
      setErrorMessage('Waktu selesai harus setelah waktu mulai rapat.');
      return;
    }

    const numAttendees = Number(attendeeCount) || 0;

    if (numAttendees > (selectedRoom?.capacity || 0)) {
      setErrorMessage(
        `Jumlah peserta (${numAttendees}) melebihi kapasitas maksimum ${selectedRoom?.name} (${selectedRoom?.capacity} orang).`
      );
      return;
    }

    const result = createBooking({
      roomSlug,
      roomName: selectedRoom.name,
      title: title.trim(),
      description: description.trim(),
      organizerId: adminUser ? adminUser.id : `guest-${Date.now()}`,
      organizerName: finalName,
      organizerEmail: finalEmail,
      organizerDept: finalDept,
      date,
      startTime,
      endTime,
      attendeeCount: numAttendees,
      attendees,
      requiresApproval: selectedRoom.requiresApproval,
    });

    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    // Reset formulir & tampilkan modal sukses
    setTitle('');
    setDescription('');
    setAttendees([]);
    setAttendeeCount(0);

    if (result.booking) {
      setSuccessBooking(result.booking);
      setShowSuccessModal(true);
    } else {
      onClose();
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !showSuccessModal}
        onClose={onClose}
        title="Peminjaman Ruang Rapat"
        subtitle="Lengkapi formulir di bawah ini untuk mengajukan peminjaman ruangan"
        maxWidth="lg"
      >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {errorMessage && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-status-danger flex items-start gap-2 font-medium">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Pilihan Ruangan */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary">Pilih Ruangan *</label>
          <div className="grid grid-cols-3 gap-2">
            {rooms.map((room) => {
              const isSelected = room.slug === roomSlug;
              return (
                <div
                  key={room.slug}
                  onClick={() => setRoomSlug(room.slug)}
                  className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all text-left ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-xs'
                      : 'border-border hover:border-stone-400 bg-surface'
                  }`}
                >
                  <div className="font-bold text-xs sm:text-sm text-text-primary truncate">{room.name}</div>
                  <div className="text-[11px] text-text-secondary mt-0.5 font-medium">Kapasitas: {room.capacity} org</div>
                </div>
              );
            })}
          </div>

          {/* Kotak Notice Status Wajib Persetujuan Administrator */}
          <div className="mt-1.5 p-2 bg-amber-50/80 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-900 font-medium">
            <ShieldAlert size={15} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Verifikasi: </span>
              Pengajuan <strong>{selectedRoom?.name || 'ruangan'}</strong> akan diverifikasi oleh{' '}
              <strong className="font-bold underline">Tim Pengelola TU SEKJEN</strong>.
            </div>
          </div>
        </div>

        {/* Informasi Pemohon (Publik) */}
        {!adminUser ? (
          <div className="p-3.5 bg-stone-50 border border-border rounded-xl space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <UserIcon size={14} />
              <span>Data Pemohon</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="Nama Lengkap"
                  className="w-full px-3 py-1.5 border border-border rounded-lg text-xs sm:text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Email *</label>
                <input
                  type="email"
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  placeholder="email@instansi.go.id"
                  className="w-full px-3 py-1.5 border border-border rounded-lg text-xs sm:text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Unit Kerja / Bagian *</label>
                <input
                  type="text"
                  value={applicantDept}
                  onChange={(e) => setApplicantDept(e.target.value)}
                  placeholder="Contoh: Bagian TU"
                  className="w-full px-3 py-1.5 border border-border rounded-lg text-xs sm:text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2.5 bg-primary/5 border border-primary/20 rounded-xl text-xs sm:text-sm flex items-center justify-between text-text-secondary">
            <div>
              Pemohon: <strong className="text-text-primary">{adminUser.name}</strong> ({adminUser.department})
            </div>
            <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">
              Petugas TU
            </span>
          </div>
        )}

        {/* Judul Rapat */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
            Nama / Agenda Kegiatan *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Rapat Koordinasi Tim Kerja"
            className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
            required
          />
        </div>

        {/* Tanggal & Waktu */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <CustomDatePicker
              label="Tanggal Rapat *"
              value={date}
              onChange={(newDate) => setDate(newDate)}
              minDate={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>

          <div>
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
          </div>

          <div>
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
        </div>

        {/* Conflict Warning Box */}
        {conflictWarning && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-status-danger flex items-start gap-2 font-medium">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>{conflictWarning}</span>
          </div>
        )}

        {/* Jumlah Peserta */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
            Jumlah Peserta (Maks: {selectedRoom?.capacity} Orang) *
          </label>
          <div className="relative max-w-xs">
            <input
              type="number"
              min={0}
              max={selectedRoom?.capacity || 30}
              value={attendeeCount}
              onChange={(e) => setAttendeeCount(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
            <span className="absolute right-3.5 top-2 text-xs text-text-secondary font-medium">Orang</span>
          </div>
          {(Number(attendeeCount) || 0) > (selectedRoom?.capacity || 0) && (
            <p className="text-xs text-red-600 mt-1 font-medium">Melebihi kapasitas ruangan ({selectedRoom?.capacity} org)</p>
          )}
        </div>

        {/* Undangan Peserta (Chips Tagging) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
            Undang Peserta Tambahan (Email / Nama)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={attendeeInput}
              onChange={(e) => setAttendeeInput(e.target.value)}
              onKeyDown={handleAddAttendee}
              placeholder="Ketik email / nama peserta lalu tekan Enter"
              className="flex-1 px-3 py-2 border border-border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <button
              type="button"
              onClick={handleAddAttendee}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-text-primary text-xs sm:text-sm font-bold rounded-xl border border-border transition-colors cursor-pointer"
            >
              <Plus size={15} />
            </button>
          </div>

          {attendees.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {attendees.map((att) => (
                <span
                  key={att}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-stone-100 border border-border text-xs rounded-full text-text-primary font-medium"
                >
                  <span>{att}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttendee(att)}
                    className="hover:text-status-danger cursor-pointer ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Deskripsi / Agenda */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
            Deskripsi / Catatan Rapat (Opsional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Catatan tambahan, fasilitas khusus yang dibutuhkan, dll..."
            className="w-full px-3 py-2 border border-border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-text-secondary hover:text-text-primary hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={!!conflictWarning}
            className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              conflictWarning
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-light text-white active:scale-95'
            }`}
          >
            <CheckCircle2 size={16} />
            <span>Ajukan Peminjaman</span>
          </button>
        </div>
      </form>
    </Modal>

    {/* Modal Konfirmasi Peminjaman Berhasil */}
    <BookingSuccessModal
      isOpen={showSuccessModal}
      onClose={() => {
        setShowSuccessModal(false);
        setSuccessBooking(null);
        onClose();
      }}
      booking={successBooking}
    />
  </>
  );
};



