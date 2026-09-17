import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { getRoomRealTimeStatus } from '../utils/dateUtils';
import { StatusBadge } from '../components/common/StatusBadge';
import { FacilityIcons } from '../components/common/FacilityIcons';
import { RoomTimeline } from '../components/timeline/RoomTimeline';
import { DatePickerControl } from '../components/common/DatePickerControl';
import { BookingModal } from '../components/booking/BookingModal';
import { BookingDetailModal } from '../components/booking/BookingDetailModal';
import { Booking } from '../types';
import { format } from 'date-fns';
import { formatDateIndonesian } from '../utils/dateUtils';
import {
  Clock,
  Tv,
  CalendarCheck,
  PlusCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { rooms, bookings, adminUser, currentTime } = useBooking();
  const [selectedDate, setSelectedDate] = useState<string>(() => format(new Date(), 'yyyy-MM-dd'));
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('all');

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingModalDefaults, setBookingModalDefaults] = useState<{
    roomSlug?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
  }>({});
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<Booking | null>(null);

  const handleOpenBookingModal = (roomSlug?: string, date?: string, startTime?: string, endTime?: string) => {
    setBookingModalDefaults({
      roomSlug,
      date: date || selectedDate,
      startTime,
      endTime,
    });
    setIsBookingModalOpen(true);
  };

  // Filter ruangan
  const filteredRooms = selectedRoomFilter === 'all'
    ? rooms
    : rooms.filter((r) => r.slug === selectedRoomFilter);

  // Agenda rapat pada tanggal yang dipilih
  const dateBookingsList = bookings
    .filter(
      (b) =>
        (b.status === 'confirmed' || b.status === 'pending') &&
        b.date === selectedDate &&
        (selectedRoomFilter === 'all' || b.roomSlug === selectedRoomFilter)
    )
    .sort((a, b) => `${a.startTime}`.localeCompare(`${b.startTime}`));

  return (
    <div className="w-full space-y-8">

      {/* 3 Room Status Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-extrabold text-text-secondary uppercase tracking-wider">
            Daftar Ruangan
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
          {rooms.map((room) => {
            const statusInfo = getRoomRealTimeStatus(bookings, room.slug, currentTime);

            // Placeholder gradient jika tidak ada imageUrl
            const roomGradients: Record<string, string> = {
              'ruang-rapat-a': 'from-blue-900 to-indigo-950',
              'ruang-rapat-b': 'from-emerald-900 to-teal-950',
              'ruang-rapat-c': 'from-purple-900 to-slate-950',
            };
            const gradientClass = roomGradients[room.slug] || 'from-slate-800 to-slate-950';

            return (
              <div
                key={room.slug}
                className="relative h-[490px] sm:h-[530px] rounded-[2.25rem] overflow-hidden shadow-[0_12px_35px_rgba(0,0,0,0.14)] hover:shadow-[0_24px_50px_rgba(0,0,0,0.28)] hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between group select-none border border-slate-200/50"
              >
                {/* Full-bleed Background Image */}
                {room.imageUrl || (room.images && room.images.length > 0) ? (
                  <img
                    src={room.imageUrl || room.images?.[0]}
                    alt={room.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (room.slug === 'ruang-vip') {
                        target.src = '/rooms/ruang-vip-1.jpg';
                      } else if (room.slug === 'ruang-transit') {
                        target.src = '/rooms/ruang-transit-1.jpg';
                      } else if (room.slug === 'ruang-sekjen') {
                        target.src = '/rooms/ruang-sekjen-1.jpg';
                      }
                    }}
                  />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
                    <div className="text-center space-y-1 opacity-60">
                      <div className="text-5xl">🏢</div>
                      <p className="text-base font-bold text-white/80">{room.name}</p>
                    </div>
                  </div>
                )}

                {/* Top Dark Vignette Gradient (Halus & Tipis) */}
                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

                {/* Top Floating Badges */}
                <div className="relative z-10 p-5 flex items-center justify-between">
                  <div className="backdrop-blur-md bg-black/40 text-white border border-white/20 rounded-full px-3 py-1.5 shadow-md flex items-center gap-1.5 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{room.capacity} Orang</span>
                  </div>
                  <div className="backdrop-blur-md bg-black/30 rounded-full shadow-md">
                    <StatusBadge status={statusInfo.status} size="md" />
                  </div>
                </div>

                {/* Multi-layered Dark Progressive Blur Gradient at Bottom (Tipis & Halus) */}
                <div className="absolute inset-x-0 bottom-0 h-[46%] pointer-events-none">
                  <div className="absolute inset-0 backdrop-blur-[1px] [mask-image:linear-gradient(to_top,black_15%,transparent)]" />
                  <div className="absolute inset-0 backdrop-blur-[3px] [mask-image:linear-gradient(to_top,black_40%,transparent)]" />
                  <div className="absolute inset-0 backdrop-blur-[8px] [mask-image:linear-gradient(to_top,black_75%,transparent)]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
                </div>

                {/* Bottom Content Area */}
                <div className="relative z-10 p-6 sm:p-7 pt-0 space-y-3.5 mt-auto">
                  {/* Title & Location */}
                  <div className="space-y-1">
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                      {room.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed drop-shadow-xs">
                      {room.location}
                    </p>
                  </div>

                  {/* Facilities Row */}
                  <div className="flex items-center justify-between py-1.5 border-t border-white/15">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Fasilitas
                    </span>
                    <FacilityIcons facilities={room.facilities} size={14} />
                  </div>

                  {/* Divider Line */}
                  <div className="h-px bg-white/15 w-full" />

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2.5 pt-0.5">
                    {adminUser && (
                      <Link
                        to={`/display/${room.slug}`}
                        target="_blank"
                        className="p-3.5 backdrop-blur-md bg-white/15 hover:bg-white/25 text-white rounded-2xl transition-all border border-white/20 shadow-md shrink-0"
                        title="Buka Layar Display TV Kiosk"
                      >
                        <Tv size={18} />
                      </Link>
                    )}
                    <button
                      onClick={() => handleOpenBookingModal(room.slug, selectedDate)}
                      className="flex-1 py-3.5 px-6 bg-white hover:bg-slate-100 active:scale-[0.98] text-slate-950 text-sm sm:text-base font-black rounded-2xl transition-all duration-200 text-center shadow-xl hover:shadow-2xl flex items-center justify-center gap-2"
                    >
                      <span>Pesan Ruangan</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Date Picker & Filter Dropdown Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <CalendarCheck size={18} className="text-primary" />
            <h2 className="text-base font-extrabold text-text-secondary uppercase tracking-wider">
              Pilih Jadwal & Ruangan
            </h2>
          </div>
        </div>

        <DatePickerControl
          selectedDate={selectedDate}
          onDateChange={(newDate) => setSelectedDate(newDate)}
          rooms={rooms}
          selectedRoomSlug={selectedRoomFilter}
          onRoomChange={(slug) => setSelectedRoomFilter(slug)}
        />
      </div>

      {/* Room Timeline Gantt Horizontal */}
      <RoomTimeline
        rooms={filteredRooms}
        bookings={bookings}
        selectedDate={selectedDate}
        currentTime={currentTime}
        onSelectSlot={(roomSlug, date, startTime, endTime) => {
          handleOpenBookingModal(roomSlug, date, startTime, endTime);
        }}
        onSelectBooking={(b) => setSelectedBookingForDetail(b)}
      />

      {/* Bottom Grid: Agenda Rapat Terpilih & Panduan Penggunaan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom 1-2: Agenda Rapat pada Tanggal yang Dipilih */}
        <div className="lg:col-span-2 bg-white/95 backdrop-blur-md rounded-3xl border border-stone-200/90 p-7 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <Clock size={18} className="text-primary" />
              <h3 className="text-base sm:text-lg font-black text-text-primary">
                Agenda Rapat: <span className="capitalize text-primary font-bold">{formatDateIndonesian(selectedDate)}</span>
              </h3>
            </div>
            <span className="text-sm sm:text-base text-text-secondary font-medium">
              {dateBookingsList.length} Rapat
            </span>
          </div>

          <div className="divide-y divide-border mt-4">
            {dateBookingsList.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-surface-secondary text-text-muted flex items-center justify-center mx-auto">
                  <Clock size={24} />
                </div>
                <p className="text-base font-bold text-text-secondary">
                  Belum ada jadwal rapat pada {formatDateIndonesian(selectedDate)}.
                </p>
                <button
                  onClick={() => handleOpenBookingModal(undefined, selectedDate)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-black rounded-xl border border-primary/20 transition-all"
                >
                  <PlusCircle size={14} />
                  <span>Pesan Ruangan di Tanggal Ini</span>
                </button>
              </div>
            ) : (
              dateBookingsList.map((booking) => {
                const room = rooms.find((r) => r.slug === booking.roomSlug);

                return (
                  <div
                    key={booking.id}
                    onClick={() => setSelectedBookingForDetail(booking)}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-secondary/60 p-3 rounded-2xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-2 h-12 rounded-full bg-primary shrink-0 group-hover:scale-y-110 transition-transform" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-base sm:text-base text-text-primary group-hover:text-primary transition-colors">
                            {booking.title}
                          </span>
                          <span className="text-sm font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/20">
                            {room?.name}
                          </span>
                        </div>
                        <div className="text-sm text-text-secondary flex items-center gap-3 flex-wrap font-medium">
                          <span>Pemohon: <strong className="text-text-primary">{booking.organizerName}</strong> ({booking.organizerDept})</span>
                          <span>•</span>
                          <span>{booking.attendeeCount} Peserta</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <div className="text-sm sm:text-base font-mono font-black text-text-primary bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-lg border border-border">
                        {booking.startTime} – {booking.endTime} WIB
                      </div>
                      <StatusBadge status={booking.status} size="sm" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Kolom 3: Ketentuan Peminjaman Ruang Rapat */}
        <div className="bg-gradient-to-br from-white via-slate-50/60 to-blue-50/20 backdrop-blur-md rounded-3xl border border-stone-200/90 p-7 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-black text-text-primary pb-3 border-b border-border">
              Ketentuan Peminjaman
            </h3>

            <ul className="space-y-3 text-sm sm:text-base text-text-secondary leading-relaxed list-disc list-inside">
              <li>
                Peminjaman ruangan terbuka bagi seluruh unit kerja di lingkungan Kemnaker untuk kegiatan kedinasan, rapat, dan koordinasi.
              </li>
              <li>
                Setiap permohonan akan dicek dan diverifikasi oleh <strong className="text-primary font-bold">Tim Pengelola TU SEKJEN</strong> sebelum ruangan dapat digunakan.
              </li>
              <li>
                Pemohon dapat memantau status peminjaman secara langsung melalui sistem ini.
              </li>
              <li>
                Mohon hadir tepat waktu serta memastikan ruangan tetap rapi dan peralatan elektronik (AC, TV, proyektor) dimatikan setelah rapat selesai.
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-border text-sm sm:text-base text-text-secondary font-medium">
            Ada pertanyaan atau kendala? Silakan hubungi <strong className="text-primary font-bold">Tim TU SEKJEN</strong>.
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        defaultRoomSlug={bookingModalDefaults.roomSlug}
        defaultDate={bookingModalDefaults.date}
        defaultStartTime={bookingModalDefaults.startTime}
        defaultEndTime={bookingModalDefaults.endTime}
      />

      {/* Booking Detail Modal */}
      <BookingDetailModal
        booking={selectedBookingForDetail}
        isOpen={!!selectedBookingForDetail}
        onClose={() => setSelectedBookingForDetail(null)}
      />
    </div>
  );
};
