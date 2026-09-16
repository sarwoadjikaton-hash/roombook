import React from 'react';
import { Room, Booking } from '../../types';
import { format } from 'date-fns';
import { Users } from 'lucide-react';

interface RoomTimelineProps {
  rooms: Room[];
  bookings: Booking[];
  selectedDate: string; // YYYY-MM-DD
  currentTime: Date;
  onSelectSlot: (roomSlug: string, date: string, startTime: string, endTime: string) => void;
  onSelectBooking: (booking: Booking) => void;
}

export const RoomTimeline: React.FC<RoomTimelineProps> = ({
  rooms,
  bookings,
  selectedDate,
  currentTime,
  onSelectSlot,
  onSelectBooking,
}) => {
  // Rentang jam operasional: 08:00 - 18:00 (10 jam = 600 menit)
  const START_HOUR = 8;
  const END_HOUR = 18;
  const TOTAL_HOURS = END_HOUR - START_HOUR;
  const HOURS_ARRAY = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => START_HOUR + i);

  const getMinuteOffset = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h - START_HOUR) * 60 + m;
  };

  const isToday = selectedDate === format(currentTime, 'yyyy-MM-dd');
  const currentMinutesOffset = (currentTime.getHours() - START_HOUR) * 60 + currentTime.getMinutes();
  const currentPositionPercent = (currentMinutesOffset / (TOTAL_HOURS * 60)) * 100;

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 sm:p-7 shadow-card overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-border">
        <div>
          <h3 className="text-base sm:text-lg font-black text-text-primary tracking-tight">Jadwal Penggunaan Ruang Rapat</h3>
          <p className="text-sm sm:text-base text-text-secondary mt-1 font-medium">
            Jam operasional 08:00 – 18:00 WIB. Klik pada waktu yang kosong untuk mengajukan peminjaman.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-sm sm:text-base">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-primary text-white flex items-center justify-center text-[10px] font-bold">✓</span>
            <span className="text-text-secondary font-semibold">Disetujui</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-amber-400 border border-amber-500" />
            <span className="text-text-secondary font-semibold">Menunggu Persetujuan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-stone-100 border border-stone-300" />
            <span className="text-text-secondary font-semibold">Tersedia</span>
          </div>
        </div>
      </div>

      {/* Timeline Grid Container */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[920px]">
          {/* Header Row: Kolom Nama Ruangan (w-56) + Header Jam (flex-1) */}
          <div className="flex items-center mb-3 pb-2 border-b border-border">
            <div className="w-56 shrink-0 text-sm font-black text-text-secondary uppercase tracking-wider pl-2">
              Daftar Ruangan
            </div>
            <div className="flex-1 relative h-7">
              {HOURS_ARRAY.map((hour, idx) => {
                const percent = (idx / TOTAL_HOURS) * 100;
                return (
                  <div
                    key={hour}
                    style={{ left: `${percent}%` }}
                    className="absolute -translate-x-1/2 text-center font-mono text-sm font-black text-text-secondary"
                  >
                    {String(hour).padStart(2, '0')}:00
                  </div>
                );
              })}
            </div>
          </div>

          {/* Body Rows per Ruangan */}
          <div className="space-y-4 relative">
            {/* Red Line Marker untuk Waktu Saat Ini */}
            {isToday && currentPositionPercent >= 0 && currentPositionPercent <= 100 && (
              <div
                className="absolute top-0 bottom-0 z-30 pointer-events-none"
                style={{ left: `calc(14rem + (100% - 14rem) * ${currentPositionPercent / 100})` }}
              >
                <div className="w-0.5 h-full bg-red-600 shadow-md" />
                <div className="w-3 h-3 -ml-1.25 -mt-1 rounded-full bg-red-600 ring-2 ring-white shadow-sm" />
              </div>
            )}

            {rooms.map((room) => {
              const dayBookings = bookings.filter(
                (b) =>
                  b.roomSlug === room.slug &&
                  b.date === selectedDate &&
                  (b.status === 'confirmed' || b.status === 'pending')
              );

              return (
                <div key={room.slug} className="flex items-center gap-3 group">
                  {/* Info Ruangan (Kiri) */}
                  <div className="w-56 shrink-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-text-primary group-hover:text-primary transition-colors">
                        {room.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-secondary mt-1 font-medium">
                      <Users size={13} className="shrink-0" />
                      <span>Maks {room.capacity} orang</span>
                    </div>
                  </div>

                  {/* Grid Timeline Bar (Kanan) */}
                  <div className="flex-1 relative h-14 bg-stone-100/90 rounded-xl border border-border/80 overflow-hidden flex items-center">
                    {/* Background Hour Grid Lines */}
                    {Array.from({ length: TOTAL_HOURS }).map((_, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          const slotStartHour = START_HOUR + idx;
                          const startTime = `${String(slotStartHour).padStart(2, '0')}:00`;
                          const endTime = `${String(slotStartHour + 1).padStart(2, '0')}:00`;
                          onSelectSlot(room.slug, selectedDate, startTime, endTime);
                        }}
                        style={{ width: `${100 / TOTAL_HOURS}%` }}
                        className="h-full border-r border-border/60 hover:bg-primary/10 cursor-pointer transition-colors"
                        title={`Klik untuk pesan slot ${String(START_HOUR + idx).padStart(2, '0')}:00 - ${String(START_HOUR + idx + 1).padStart(2, '0')}:00`}
                      />
                    ))}

                    {/* Booking Blocks */}
                    {dayBookings.map((b) => {
                      const startOffset = getMinuteOffset(b.startTime);
                      const endOffset = getMinuteOffset(b.endTime);
                      const leftPercent = Math.max(0, (startOffset / (TOTAL_HOURS * 60)) * 100);
                      const widthPercent = Math.min(
                        100 - leftPercent,
                        ((endOffset - startOffset) / (TOTAL_HOURS * 60)) * 100
                      );

                      const isPending = b.status === 'pending';

                      return (
                        <div
                          key={b.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectBooking(b);
                          }}
                          style={{
                            left: `${leftPercent}%`,
                            width: `${Math.max(widthPercent, 4)}%`,
                          }}
                          className={`absolute top-1.5 bottom-1.5 rounded-lg px-2.5 py-1 text-sm font-bold cursor-pointer transition-all shadow-sm flex flex-col justify-center overflow-hidden z-20 hover:scale-[1.02] ${
                            isPending
                              ? 'bg-amber-400 text-amber-950 border border-amber-600 ring-1 ring-amber-500/50'
                              : 'bg-primary text-white border border-primary-light ring-1 ring-primary/40'
                          }`}
                          title={`${b.title} (${b.startTime} - ${b.endTime})\nPIC: ${b.organizerName}`}
                        >
                          <div className="truncate font-extrabold text-sm">{b.title}</div>
                          <div className="text-[10px] font-mono tabular-nums opacity-90 truncate">
                            {b.startTime}–{b.endTime} • {b.organizerName}
                          </div>
                        </div>
                      );

                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
