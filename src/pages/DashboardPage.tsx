import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { getRoomRealTimeStatus } from '../utils/dateUtils';
import { StatusBadge } from '../components/common/StatusBadge';
import { FacilityIcons, CapacityBadge } from '../components/common/FacilityIcons';
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const statusInfo = getRoomRealTimeStatus(bookings, room.slug, currentTime);

            // Placeholder gradient jika tidak ada imageUrl
            const roomGradients: Record<string, string> = {
              'ruang-rapat-a': 'from-blue-100 to-blue-200',
              'ruang-rapat-b': 'from-emerald-100 to-emerald-200',
              'ruang-rapat-c': 'from-violet-100 to-violet-200',
            };
            const gradientClass = roomGradients[room.slug] || 'from-stone-100 to-stone-200';

            return (
              <div
                key={room.slug}
                className="bg-white rounded-2xl border border-stone-200 shadow-md hover:shadow-lg transition-all flex flex-col overflow-hidden group"
              >
                {/* Gambar Ruangan */}
                <div className="relative h-44 overflow-hidden">
                  {room.imageUrl || (room.images && room.images.length > 0) ? (
                    <img
                      src={room.imageUrl || room.images?.[0]}
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                    <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
                      <div className="text-center space-y-1 opacity-60">
                        <div className="text-4xl">🏢</div>
                        <p className="text-sm font-bold text-stone-500">{room.name}</p>
                      </div>
                    </div>
                  )}
                  {/* Badge Status di atas gambar */}
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={statusInfo.status} size="md" />
                  </div>
                </div>

                {/* Info Ruangan */}
                <div className="p-5 border-b border-stone-100 space-y-3">
                  <div>
                    <h3 className="text-lg font-black text-text-primary group-hover:text-primary transition-colors">
                      {room.name}
                    </h3>
                    <p className="text-base text-text-secondary mt-0.5 font-medium">{room.location}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <CapacityBadge capacity={room.capacity} size="md" />
                    <FacilityIcons facilities={room.facilities} size={15} />
                  </div>
                </div>

                {/* Body: Deskripsi Ruangan */}
                <div className="p-5 flex-1 bg-stone-50 flex flex-col justify-between">
                  <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
                    {room.description || 'Ruangan siap digunakan untuk kegiatan rapat dan koordinasi.'}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-white border-t border-stone-200 flex items-center gap-2">
                  {adminUser && (
                    <Link
                      to={`/display/${room.slug}`}
                      target="_blank"
                      className="p-2.5 text-text-secondary hover:text-primary hover:bg-stone-100 rounded-xl transition-colors border border-stone-200"
                      title="Buka Layar Display TV Kiosk"
                    >
                      <Tv size={17} />
                    </Link>
                  )}
                  <button
                    onClick={() => handleOpenBookingModal(room.slug, selectedDate)}
                    className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary-light text-white text-base font-black rounded-xl transition-all text-center shadow-sm hover:shadow-md active:scale-95"
                  >
                    Pesan Ruangan
                  </button>
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
        <div className="lg:col-span-2 bg-surface rounded-2xl border border-border p-7 sm:p-8 shadow-card">
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
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-secondary/60 p-3 rounded-xl transition-all cursor-pointer group"
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
        <div className="bg-surface rounded-2xl border border-border p-7 sm:p-8 shadow-card flex flex-col justify-between space-y-6">
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
