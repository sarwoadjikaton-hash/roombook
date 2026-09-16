import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { RoomTimeline } from '../components/timeline/RoomTimeline';
import { DatePickerControl } from '../components/common/DatePickerControl';
import { BookingModal } from '../components/booking/BookingModal';
import { BookingDetailModal } from '../components/booking/BookingDetailModal';
import { Booking } from '../types';
import { format } from 'date-fns';
import { CalendarCheck } from 'lucide-react';

export const CalendarBookingPage: React.FC = () => {
  const { rooms, bookings, currentTime } = useBooking();
  const [selectedDate, setSelectedDate] = useState<string>(() => format(new Date(), 'yyyy-MM-dd'));
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('all');

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingModalDefaults, setBookingModalDefaults] = useState<{
    roomSlug?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
  }>({});
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<Booking | null>(null);

  const handleOpenBookingModal = (roomSlug?: string, date?: string, startTime?: string, endTime?: string) => {
    setBookingModalDefaults({ roomSlug, date: date || selectedDate, startTime, endTime });
    setIsBookingModalOpen(true);
  };

  const filteredRooms = selectedRoomFilter === 'all'
    ? rooms
    : rooms.filter((r) => r.slug === selectedRoomFilter);

  return (
    <div className="w-full space-y-6">
      {/* Date Picker & Filter Bar */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <CalendarCheck size={18} className="text-primary" />
          <h2 className="text-base font-extrabold text-text-secondary uppercase tracking-wider">
            Jadwal Penggunaan Ruang Rapat
          </h2>
        </div>

        <DatePickerControl
          selectedDate={selectedDate}
          onDateChange={(newDate) => setSelectedDate(newDate)}
          rooms={rooms}
          selectedRoomSlug={selectedRoomFilter}
          onRoomChange={(slug) => setSelectedRoomFilter(slug)}
        />
      </div>

      {/* Main Room Timeline Gantt */}
      <RoomTimeline
        rooms={filteredRooms}
        bookings={bookings}
        selectedDate={selectedDate}
        currentTime={currentTime}
        onSelectSlot={(roomSlug, date, startTime, endTime) => {
          handleOpenBookingModal(roomSlug, date, startTime, endTime);
        }}
        onSelectBooking={(booking) => {
          setSelectedBookingForDetail(booking);
        }}
      />

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
