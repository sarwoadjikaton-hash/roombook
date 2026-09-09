import React, { useState, useMemo } from 'react';
import { Room, Booking } from '../types';
import { 
  Users, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Wifi, 
  Tv, 
  Video, 
  Wind, 
  Sparkles,
  ArrowRight,
  Filter,
  Search,
  X,
  RotateCcw,
  SlidersHorizontal,
  Check
} from 'lucide-react';
import { isOverlapping } from '../data/initialData';

interface DirectoryViewProps {
  rooms: Room[];
  bookings: Booking[];
  onOpenBookingDrawer: (roomId: string, startTime?: string, endTime?: string) => void;
  onNavigate: (view: any) => void;
}

export const DirectoryView: React.FC<DirectoryViewProps> = ({
  rooms,
  bookings,
  onOpenBookingDrawer,
  onNavigate,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-10');
  const [capacityFilter, setCapacityFilter] = useState<number | 'all'>('all');
  const [filterStartTime, setFilterStartTime] = useState<string>('11:00');
  const [filterEndTime, setFilterEndTime] = useState<string>('12:30');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFacility, setSelectedFacility] = useState<string>('all');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [showAllInLedger, setShowAllInLedger] = useState<boolean>(false);

  // Distinct facilities gathered from rooms for quick filtering
  const allFacilities = useMemo(() => {
    const set = new Set<string>();
    rooms.forEach((r) => r.facilities.forEach((f) => set.add(f)));
    return Array.from(set).sort();
  }, [rooms]);

  // Filter rooms by search query (name/location/description/facility), capacity, facility selection, and availability
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = r.name.toLowerCase().includes(q);
        const matchLoc = r.location.toLowerCase().includes(q);
        const matchDesc = r.description.toLowerCase().includes(q);
        const matchFac = r.facilities.some((f) => f.toLowerCase().includes(q));
        if (!matchName && !matchLoc && !matchDesc && !matchFac) return false;
      }

      // 2. Capacity Filter
      if (capacityFilter !== 'all') {
        if (r.capacity < capacityFilter) return false;
      }

      // 3. Facility Filter
      if (selectedFacility !== 'all') {
        const hasFac = r.facilities.some((f) =>
          f.toLowerCase().includes(selectedFacility.toLowerCase())
        );
        if (!hasFac) return false;
      }

      // 4. Availability Filter
      if (onlyAvailable) {
        const active = bookings.find(
          (b) =>
            b.roomId === r.id &&
            b.date === selectedDate &&
            b.status !== 'cancelled' &&
            isOverlapping(filterStartTime, filterEndTime, b.startTime, b.endTime)
        );
        if (active) return false;
      }

      return true;
    });
  }, [rooms, searchQuery, capacityFilter, selectedFacility, onlyAvailable, bookings, selectedDate, filterStartTime, filterEndTime]);

  const isFilterActive =
    Boolean(searchQuery.trim()) ||
    capacityFilter !== 'all' ||
    selectedFacility !== 'all' ||
    onlyAvailable;

  const handleResetFilters = () => {
    setSearchQuery('');
    setCapacityFilter('all');
    setSelectedFacility('all');
    setOnlyAvailable(false);
  };

  // Calculate current status for each room on selectedDate around current time / filter time
  const getRoomStatus = (roomId: string) => {
    const active = bookings.find(
      (b) =>
        b.roomId === roomId &&
        b.date === selectedDate &&
        b.status !== 'cancelled' &&
        isOverlapping(filterStartTime, filterEndTime, b.startTime, b.endTime)
    );
    return active;
  };

  // Time slots for the Ledger
  const timeSlots = [
    { label: '08:00 - 09:00', start: '08:00', end: '09:00' },
    { label: '09:00 - 10:30', start: '09:00', end: '10:30' },
    { label: '10:30 - 11:30', start: '10:30', end: '11:30', isCurrent: true },
    { label: '11:30 - 13:00', start: '11:30', end: '13:00' },
    { label: '13:00 - 15:30', start: '13:00', end: '15:30' },
    { label: '15:30 - 16:30', start: '15:30', end: '16:30' },
    { label: '16:30 - 18:00', start: '16:30', end: '18:00' },
  ];

  // Pick primary featured room from filteredRooms if available
  const primaryRoom = filteredRooms.find((r) => r.id === 'sekjen') || filteredRooms[0];
  const otherRooms = filteredRooms.filter((r) => r.id !== primaryRoom?.id);

  // Rooms to display in ledger
  const roomsInLedger = showAllInLedger ? rooms : filteredRooms;

  return (
    <div className="w-full">
      {/* Editorial Header Section */}
      <section className="px-4 md:px-12 py-8 md:py-12 border-b border-[#55524A]/15 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-[12px] font-semibold uppercase tracking-widest text-[#A9822D]">
              Direktori Bilik Pertemuan & Buku Induk
            </span>
            <h1 className="font-serif-title text-3xl md:text-5xl text-[#16191C] mt-1 font-normal tracking-tight">
              Reservasi Ruang Rapat
            </h1>
            <p className="text-base text-[#55524A] mt-2.5 font-normal leading-relaxed">
              Pesan bilik kerja resmi instansi langsung tanpa login. Konfirmasi instan, slip voucher ber-QR rahasia, serta undangan kalender resmi otomatis terdistribusi.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-6 self-start lg:self-auto bg-[#E4DBC8]/70 px-6 py-4 border border-[#55524A]/15 rounded shadow-xs">
            <div className="flex flex-col">
              <span className="text-[12px] text-[#55524A]">Ruangan Terdaftar</span>
              <span className="font-serif-title text-2xl font-medium text-[#16191C] leading-none mt-1">
                {rooms.length} Bilik
              </span>
            </div>
            <div className="w-px h-8 bg-[#55524A]/20"></div>
            <div className="flex flex-col">
              <span className="text-[12px] text-[#55524A]">Hasil Pencarian</span>
              <span className="font-serif-title text-2xl font-medium text-[#26392E] leading-none mt-1">
                {filteredRooms.length} Bilik
              </span>
            </div>
          </div>
        </div>

        {/* Concierge Interactive Search & Filter Bar */}
        <div className="mt-8 bg-[#F1ECDF] border border-[#55524A]/20 p-5 md:p-6 shadow-xs rounded space-y-5">
          {/* Top Search Input */}
          <div className="relative w-full">
            <div className="flex items-center bg-[#E4DBC8]/70 border border-[#55524A]/30 focus-within:border-[#A9822D] focus-within:bg-[#F1ECDF] rounded-xs px-3.5 py-2.5 transition-all shadow-inner">
              <Search className="w-4 h-4 text-[#A9822D] mr-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari bilik berdasarkan nama (Sekjen, VIP, Transit), lokasi lantai, atau fasilitas..."
                className="w-full bg-transparent text-sm text-[#16191C] placeholder:text-[#55524A]/60 focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-[#55524A] hover:text-[#16191C] p-1 ml-2 cursor-pointer transition-colors"
                  title="Hapus pencarian"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tanggal */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-[#55524A] mb-1.5 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-[#A9822D]" />
                <span>Tanggal Reservasi</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-[#55524A]/40 py-1.5 text-sm font-medium text-[#16191C] focus:border-[#A9822D] focus:outline-hidden cursor-pointer"
              />
            </div>

            {/* Jam Mulai */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-[#55524A] mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#A9822D]" />
                <span>Mulai Pukul</span>
              </label>
              <select
                value={filterStartTime}
                onChange={(e) => setFilterStartTime(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-[#55524A]/40 py-1.5 text-sm font-medium text-[#16191C] focus:border-[#A9822D] focus:outline-hidden cursor-pointer"
              >
                <option value="08:00">08:00 WIB</option>
                <option value="09:00">09:00 WIB</option>
                <option value="10:00">10:00 WIB</option>
                <option value="11:00">11:00 WIB</option>
                <option value="13:00">13:00 WIB</option>
                <option value="14:00">14:00 WIB</option>
                <option value="15:30">15:30 WIB</option>
                <option value="16:00">16:00 WIB</option>
              </select>
            </div>

            {/* Jam Selesai */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-[#55524A] mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#A9822D]" />
                <span>Hingga Pukul</span>
              </label>
              <select
                value={filterEndTime}
                onChange={(e) => setFilterEndTime(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-[#55524A]/40 py-1.5 text-sm font-medium text-[#16191C] focus:border-[#A9822D] focus:outline-hidden cursor-pointer"
              >
                <option value="10:00">10:00 WIB</option>
                <option value="11:00">11:00 WIB</option>
                <option value="12:30">12:30 WIB (1.5 Jam)</option>
                <option value="14:00">14:00 WIB (3 Jam)</option>
                <option value="15:30">15:30 WIB</option>
                <option value="17:00">17:00 WIB</option>
                <option value="18:00">18:00 WIB</option>
              </select>
            </div>

            {/* Filter Fasilitas Utama */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-[#55524A] mb-1.5 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#A9822D]" />
                <span>Filter Fasilitas</span>
              </label>
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-[#55524A]/40 py-1.5 text-sm font-medium text-[#16191C] focus:border-[#A9822D] focus:outline-hidden cursor-pointer"
              >
                <option value="all">Semua Fasilitas</option>
                <option value="Smart TV">Smart TV / Screen Layar Lebar</option>
                <option value="Zoom">Video Conference / Zoom Cam</option>
                <option value="WiFi">WiFi Dedicated Gigabit / Cepat</option>
                <option value="Audio">Audio Ceiling Mic Array / Pod</option>
                <option value="AC Central">Pendingin AC Central Daikin</option>
                <option value="Whiteboard">Whiteboard Kaca / Flipchart</option>
                <option value="Soundproof">Akustik Kedap Suara (Soundproof)</option>
              </select>
            </div>
          </div>

          {/* Kapasitas & Quick Filter Chips */}
          <div className="pt-2 border-t border-[#55524A]/15 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-[#55524A] font-medium mr-1 flex items-center gap-1">
                <Users className="w-3 h-3 text-[#A9822D]" /> Kapasitas Min:
              </span>
              {(['all', 10, 15, 30] as const).map((cap) => (
                <button
                  key={String(cap)}
                  type="button"
                  onClick={() => setCapacityFilter(cap)}
                  className={`text-xs px-3 py-1.5 rounded transition-colors cursor-pointer ${
                    capacityFilter === cap
                      ? 'bg-[#16191C] text-[#F1ECDF] font-medium shadow-xs'
                      : 'bg-transparent text-[#16191C] border border-[#55524A]/30 hover:border-[#16191C]'
                  }`}
                >
                  {cap === 'all' ? 'Semua' : `≥ ${cap} Orang`}
                </button>
              ))}

              <div className="h-4 w-px bg-[#55524A]/20 mx-1 hidden sm:block"></div>

              {/* Only Available Toggle */}
              <button
                type="button"
                onClick={() => setOnlyAvailable(!onlyAvailable)}
                className={`text-xs px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 border ${
                  onlyAvailable
                    ? 'bg-[#26392E] text-[#F1ECDF] border-[#26392E] font-medium'
                    : 'bg-transparent text-[#16191C] border-[#55524A]/30 hover:border-[#16191C]'
                }`}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${onlyAvailable ? 'text-emerald-400' : 'text-[#55524A]'}`} />
                <span>Hanya Bilik Tersedia</span>
              </button>
            </div>

            {/* Reset All Filters Button */}
            {isFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-[#6B2A2E] hover:text-[#8A373C] font-medium flex items-center gap-1.5 py-1 px-2 rounded hover:bg-[#6B2A2E]/10 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Asymmetric Room Directory Grid */}
      <section className="px-4 md:px-12 py-10 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <span className="text-xs font-semibold text-[#A9822D] uppercase tracking-wider">
              Direktori Bilik Pilihan
            </span>
            <h2 className="font-serif-title text-2xl md:text-3xl text-[#16191C] mt-0.5 font-normal">
              Status Ketersediaan Bilik ({filteredRooms.length})
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#55524A]">
            <span className="tabular-nums">
              Diperbarui secara real-time • Sinkronisasi Google Calendar
            </span>
            {isFilterActive && (
              <span className="bg-[#A9822D]/15 text-[#8F6C22] border border-[#A9822D]/30 px-2 py-0.5 rounded text-[11px] font-medium">
                Filter Aktif
              </span>
            )}
          </div>
        </div>

        {/* Empty State when no rooms match */}
        {filteredRooms.length === 0 ? (
          <div className="bg-[#E4DBC8]/50 border border-dashed border-[#55524A]/30 p-12 text-center rounded shadow-xs my-6">
            <AlertCircle className="w-10 h-10 text-[#A9822D] mx-auto mb-3 opacity-90" />
            <h3 className="font-serif-title text-2xl text-[#16191C] mb-2 font-normal">
              Tidak Ada Bilik Rapat yang Sesuai
            </h3>
            <p className="text-sm text-[#55524A] max-w-lg mx-auto mb-5 leading-relaxed">
              {searchQuery ? `Tidak ditemukan bilik dengan kata kunci "${searchQuery}". ` : ''}
              {selectedFacility !== 'all' ? `Tidak ada bilik dengan fasilitas "${selectedFacility}". ` : ''}
              {capacityFilter !== 'all' ? `Kapasitas minimum ${capacityFilter} orang tidak terpenuhi. ` : ''}
              {onlyAvailable ? 'Tidak ada bilik yang bebas pada rentang waktu ini. ' : ''}
              Silakan sesuaikan kriteria pencarian atau klik tombol di bawah untuk mereset seluruh filter.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-5 py-2.5 bg-[#16191C] text-[#F1ECDF] text-xs font-semibold rounded hover:bg-[#A9822D] hover:text-[#16191C] transition-all cursor-pointer shadow-xs"
            >
              Reset Semua Filter Pencarian
            </button>
          </div>
        ) : filteredRooms.length === 1 ? (
          /* Single Match - Full Width Card */
          (() => {
            const singleRoom = filteredRooms[0];
            const activeConflict = getRoomStatus(singleRoom.id);
            const isOccupied = Boolean(activeConflict);

            return (
              <div className="bg-[#E4DBC8]/50 border border-[#55524A]/20 p-6 md:p-8 rounded shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#55524A]/15">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        isOccupied ? 'bg-[#6B2A2E]' : 'bg-[#26392E] animate-pulse'
                      }`}
                    ></span>
                    <span className="text-xs font-semibold text-[#16191C]">
                      {isOccupied ? 'Sedang Digunakan' : 'Tersedia Sekarang — Bebas Reservasi'}
                    </span>
                  </div>
                  <span className="text-xs text-[#55524A] tabular-nums font-medium">
                    Resource: {singleRoom.googleCalendarId}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-6 relative h-64 md:h-80 overflow-hidden bg-[#16191C] rounded-xs group">
                    <img
                      src={singleRoom.image}
                      alt={singleRoom.name}
                      className="w-full h-full object-cover grayscale contrast-125 brightness-90 mix-blend-luminosity opacity-90 transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#16191C] via-transparent to-transparent opacity-60"></div>
                    <div className="absolute bottom-3 left-4 right-4 text-[#F1ECDF] flex justify-between items-end">
                      <span className="text-xs text-[#E4DBC8] font-medium">Hasil Pencarian Terpilih</span>
                      <span className="text-xs tabular-nums bg-[#16191C] px-2.5 py-1 border border-[#55524A]/30 font-medium">
                        {singleRoom.location}
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-6 flex flex-col justify-between h-full">
                    <div>
                      <h3 className="font-serif-title text-2xl md:text-3xl text-[#16191C] mb-2 font-normal">
                        {singleRoom.name}
                      </h3>
                      <p className="text-sm text-[#55524A] mb-4 leading-relaxed font-normal">
                        {singleRoom.description}
                      </p>

                      <div className="py-2.5 border-y border-[#55524A]/15 mb-4 text-[#55524A] text-xs flex flex-wrap gap-2 items-center">
                        <span className="text-[#16191C] font-semibold flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#A9822D]" /> Kapasitas {singleRoom.capacity} Orang
                        </span>
                        {singleRoom.facilities.map((fac) => {
                          const isHighlighted =
                            (selectedFacility !== 'all' && fac.toLowerCase().includes(selectedFacility.toLowerCase())) ||
                            (Boolean(searchQuery.trim()) && fac.toLowerCase().includes(searchQuery.toLowerCase().trim()));

                          return (
                            <span
                              key={fac}
                              className={`px-2 py-0.5 rounded text-[11px] ${
                                isHighlighted
                                  ? 'bg-[#A9822D]/20 text-[#16191C] font-semibold border border-[#A9822D]/50'
                                  : 'bg-[#F1ECDF] text-[#55524A] border border-[#55524A]/20'
                              }`}
                            >
                              {fac}
                            </span>
                          );
                        })}
                      </div>

                      {isOccupied && activeConflict && (
                        <div className="bg-[#F1ECDF] p-3 border-l-2 border-[#6B2A2E] mb-4 text-xs">
                          <span className="text-[11px] text-[#55524A] block font-medium">Sesi Berjalan Saat Ini:</span>
                          <span className="font-semibold text-[#16191C] block mt-0.5">
                            {activeConflict.meetingTitle} ({activeConflict.startTime} – {activeConflict.endTime} WIB)
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs text-[#55524A]">
                        <CheckCircle2 className="w-4 h-4 text-[#26392E]" />
                        <span>Reservasi instan tanpa login • Slip voucher QR</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onOpenBookingDrawer(singleRoom.id, filterStartTime, filterEndTime)}
                        className="px-6 py-2.5 bg-[#16191C] text-[#F1ECDF] text-sm font-medium hover:underline decoration-[#A9822D] decoration-2 underline-offset-4 transition-all text-center rounded-xs shadow-xs cursor-pointer"
                      >
                        Pesan Ruangan Ini
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          /* Multi-Match - Asymmetric Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Prominent Wide Column */}
            <div className="lg:col-span-7 bg-[#E4DBC8]/50 border border-[#55524A]/20 p-6 md:p-8 flex flex-col justify-between rounded shadow-xs">
              <div>
                {/* Room Card Header Status */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#55524A]/15">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#26392E] flex-shrink-0 animate-pulse"></span>
                    <span className="text-xs font-semibold text-[#16191C]">
                      Tersedia Sekarang — Slot Bebas
                    </span>
                  </div>
                  <span className="text-xs text-[#55524A] tabular-nums font-medium">
                    Resource: {primaryRoom.googleCalendarId}
                  </span>
                </div>

                {/* Duotone Photo */}
                <div className="relative w-full h-64 md:h-72 overflow-hidden bg-[#16191C] mb-5 rounded-xs group">
                  <img
                    src={primaryRoom.image}
                    alt={primaryRoom.name}
                    className="w-full h-full object-cover grayscale contrast-125 brightness-90 mix-blend-luminosity opacity-90 transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#16191C] via-transparent to-transparent opacity-60"></div>
                  <div className="absolute bottom-3 left-4 right-4 text-[#F1ECDF] flex justify-between items-end">
                    <span className="text-xs text-[#E4DBC8] font-medium">Bilik Unggulan</span>
                    <span className="text-xs tabular-nums bg-[#16191C] px-2.5 py-1 border border-[#55524A]/30 font-medium">
                      {primaryRoom.location}
                    </span>
                  </div>
                </div>

                {/* Specs */}
                <h3 className="font-serif-title text-2xl md:text-3xl text-[#16191C] mb-2 font-normal">
                  {primaryRoom.name}
                </h3>
                <p className="text-sm text-[#55524A] mb-4 leading-relaxed font-normal">
                  {primaryRoom.description}
                </p>

                {/* Facilities Chips */}
                <div className="py-2.5 border-y border-[#55524A]/15 mb-6 text-[#55524A] text-xs flex flex-wrap gap-2 items-center">
                  <span className="text-[#16191C] font-semibold flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#A9822D]" /> Kapasitas {primaryRoom.capacity} Orang
                  </span>
                  {primaryRoom.facilities.map((fac) => {
                    const isHighlighted =
                      (selectedFacility !== 'all' && fac.toLowerCase().includes(selectedFacility.toLowerCase())) ||
                      (Boolean(searchQuery.trim()) && fac.toLowerCase().includes(searchQuery.toLowerCase().trim()));

                    return (
                      <span
                        key={fac}
                        className={`px-2 py-0.5 rounded text-[11px] ${
                          isHighlighted
                            ? 'bg-[#A9822D]/20 text-[#16191C] font-semibold border border-[#A9822D]/50'
                            : 'bg-[#F1ECDF] text-[#55524A] border border-[#55524A]/20'
                        }`}
                      >
                        {fac}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-[#55524A]">
                  <CheckCircle2 className="w-4 h-4 text-[#26392E]" />
                  <span>Reservasi instan tanpa verifikasi admin</span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenBookingDrawer(primaryRoom.id, filterStartTime, filterEndTime)}
                  className="px-6 py-2.5 bg-[#16191C] text-[#F1ECDF] text-sm font-medium hover:underline decoration-[#A9822D] decoration-2 underline-offset-4 transition-all text-center rounded-xs shadow-xs cursor-pointer"
                >
                  Pesan Ruangan Ini
                </button>
              </div>
            </div>

            {/* Right Column: Stacked Cards */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {otherRooms.map((room) => {
                const activeConflict = getRoomStatus(room.id);
                const isOccupied = Boolean(activeConflict);

                return (
                  <div
                    key={room.id}
                    className="bg-[#E4DBC8]/50 border border-[#55524A]/20 p-5 md:p-6 flex flex-col justify-between rounded shadow-xs flex-1"
                  >
                    <div>
                      {/* Status Pill */}
                      <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-[#55524A]/15">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                              isOccupied ? 'bg-[#6B2A2E]' : 'bg-[#26392E]'
                            }`}
                          ></span>
                          <span className="text-xs font-semibold text-[#16191C]">
                            {isOccupied ? 'Sedang Digunakan' : 'Tersedia Sekarang'}
                          </span>
                        </div>
                        <span
                          className={`text-xs tabular-nums font-medium ${
                            isOccupied ? 'text-[#6B2A2E]' : 'text-[#26392E]'
                          }`}
                        >
                          {isOccupied ? 'Terisi Sesi Ini' : 'Bebas Reservasi'}
                        </span>
                      </div>

                      {/* Image Thumbnail */}
                      <div className="relative w-full h-32 overflow-hidden bg-[#16191C] mb-3 rounded-xs">
                        <img
                          src={room.image}
                          alt={room.name}
                          className="w-full h-full object-cover grayscale contrast-125 brightness-90 mix-blend-luminosity opacity-85"
                        />
                      </div>

                      <h3 className="font-serif-title text-xl text-[#16191C] font-normal mb-1">
                        {room.name}
                      </h3>
                      <p className="text-xs text-[#55524A] mb-3 leading-relaxed">
                        {room.description}
                      </p>

                      <div className="py-2 border-y border-[#55524A]/15 mb-3 text-xs text-[#55524A] flex items-center flex-wrap gap-1.5">
                        <span className="text-[#16191C] font-medium mr-1">Kapasitas {room.capacity} Pax</span>
                        {room.facilities.slice(0, 3).map((fac) => {
                          const isHighlighted =
                            (selectedFacility !== 'all' && fac.toLowerCase().includes(selectedFacility.toLowerCase())) ||
                            (Boolean(searchQuery.trim()) && fac.toLowerCase().includes(searchQuery.toLowerCase().trim()));

                          return (
                            <span
                              key={fac}
                              className={`px-1.5 py-0.5 rounded text-[10px] ${
                                isHighlighted
                                  ? 'bg-[#A9822D]/20 text-[#16191C] font-semibold border border-[#A9822D]/50'
                                  : 'bg-[#F1ECDF] text-[#55524A]'
                              }`}
                            >
                              {fac}
                            </span>
                          );
                        })}
                      </div>

                      {/* If occupied, show running meeting banner */}
                      {isOccupied && activeConflict && (
                        <div className="bg-[#F1ECDF] p-2.5 border-l-2 border-[#6B2A2E] mb-3 text-xs">
                          <span className="text-[11px] text-[#55524A] block">Agenda Berjalan:</span>
                          <span className="font-medium text-[#16191C] truncate block">
                            {activeConflict.meetingTitle} ({activeConflict.startTime} - {activeConflict.endTime} WIB)
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => onOpenBookingDrawer(room.id, isOccupied ? '15:30' : filterStartTime, isOccupied ? '17:00' : filterEndTime)}
                        className={`w-full sm:w-auto px-5 py-2 text-xs font-medium transition-all text-center rounded-xs cursor-pointer ${
                          isOccupied
                            ? 'bg-transparent border border-[#16191C] text-[#16191C] hover:bg-[#16191C] hover:text-[#F1ECDF]'
                            : 'bg-[#16191C] text-[#F1ECDF] hover:underline decoration-[#A9822D] decoration-2 underline-offset-4'
                        }`}
                      >
                        {isOccupied ? 'Pesan Slot Berikutnya' : 'Pesan Ruangan'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Daily Ledger Timeline Section */}
      <section className="px-4 md:px-12 py-10 border-t border-[#55524A]/15 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <span className="text-xs font-semibold text-[#A9822D] uppercase tracking-wider">
              Ledger Harian • {selectedDate}
            </span>
            <h2 className="font-serif-title text-2xl md:text-3xl text-[#16191C] mt-0.5 font-normal">
              Buku Jadwal Bilik Rapat
            </h2>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 bg-[#16191C] border border-[#16191C] rounded-xs"></span>
              <span className="text-[#16191C] font-medium">Terjadwal (Occupied)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 bg-[#E4DBC8] border border-[#55524A]/30 rounded-xs"></span>
              <span className="text-[#55524A]">Slot Bebas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 bg-[#A9822D] rounded-xs"></span>
              <span className="text-[#55524A]">Waktu Berjalan</span>
            </div>
          </div>
        </div>

        {/* Ledger Table Filter Sub-bar */}
        {filteredRooms.length > 0 && filteredRooms.length < rooms.length && (
          <div className="flex items-center justify-between bg-[#E4DBC8]/70 px-4 py-2 text-xs text-[#55524A] border border-[#55524A]/20 rounded-t mb-0 border-b-0">
            <span>
              Menampilkan {roomsInLedger.length} dari {rooms.length} bilik di buku jadwal.
            </span>
            <button
              type="button"
              onClick={() => setShowAllInLedger(!showAllInLedger)}
              className="text-[#A9822D] hover:text-[#16191C] font-medium hover:underline cursor-pointer"
            >
              {showAllInLedger ? 'Saring Sesuai Filter Pencarian' : 'Tampilkan Semua Bilik di Ledger'}
            </button>
          </div>
        )}

        {/* Ledger Table */}
        <div className="overflow-x-auto border border-[#55524A]/20 bg-[#F1ECDF] shadow-xs rounded">
          <table className="w-full border-collapse text-left min-w-[780px]">
            <thead>
              <tr className="border-b border-[#55524A]/20 bg-[#E4DBC8]">
                <th className="py-3.5 px-4 text-xs uppercase tracking-wider text-[#55524A] font-semibold border-r border-[#55524A]/20 w-32">
                  Pukul (WIB)
                </th>
                {(roomsInLedger.length > 0 ? roomsInLedger : rooms).map((room) => (
                  <th
                    key={room.id}
                    className="py-3.5 px-5 font-serif-title text-base text-[#16191C] font-normal border-r last:border-r-0 border-[#55524A]/20"
                  >
                    {room.name}
                    <span className="text-xs text-[#55524A] font-sans font-normal block">
                      {room.capacity} Pax • {room.location}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#55524A]/15 text-sm">
              {timeSlots.map((slot) => (
                <tr
                  key={slot.label}
                  className={`h-20 transition-colors ${
                    slot.isCurrent ? 'bg-[#E4DBC8]/30' : 'hover:bg-[#E4DBC8]/20'
                  }`}
                >
                  <td className="py-3 px-4 font-mono text-xs text-[#55524A] border-r border-[#55524A]/20 bg-[#E4DBC8]/30 font-medium">
                    <div className="flex flex-col">
                      <span>{slot.label}</span>
                      {slot.isCurrent && (
                        <span className="text-[10px] font-bold text-[#A9822D] uppercase tracking-wider mt-0.5">
                          SAAT INI
                        </span>
                      )}
                    </div>
                  </td>

                  {(roomsInLedger.length > 0 ? roomsInLedger : rooms).map((room) => {
                    const match = bookings.find(
                      (b) =>
                        b.roomId === room.id &&
                        b.date === selectedDate &&
                        b.status !== 'cancelled' &&
                        isOverlapping(slot.start, slot.end, b.startTime, b.endTime)
                    );

                    if (match) {
                      return (
                        <td
                          key={room.id}
                          className="p-2 border-r last:border-r-0 border-[#55524A]/20 align-top"
                        >
                          <div className="h-full bg-[#16191C] text-[#F1ECDF] p-2.5 rounded-xs flex flex-col justify-between border-l-2 border-[#A9822D] shadow-xs">
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-medium text-xs text-[#F1ECDF] truncate">
                                {match.meetingTitle}
                              </span>
                              <span className="font-mono text-[10px] text-[#E4DBC8]/70 shrink-0">
                                {match.startTime} - {match.endTime}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-[#E4DBC8]/70 mt-1">
                              <span className="truncate">{match.division}</span>
                              <span className="shrink-0">{match.participantCount} Pax</span>
                            </div>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={room.id}
                        onClick={() => onOpenBookingDrawer(room.id, slot.start, slot.end)}
                        className="p-2 border-r last:border-r-0 border-[#55524A]/20 cursor-pointer group transition-colors hover:bg-[#F1ECDF]"
                      >
                        <div className="h-full border border-dashed border-[#55524A]/25 rounded-xs flex flex-col items-center justify-center p-2 text-center group-hover:border-[#A9822D] group-hover:bg-[#E4DBC8]/40 transition-all">
                          <span className="text-xs text-[#26392E] font-medium flex items-center gap-1">
                            <Plus className="w-3 h-3 text-[#A9822D]" />
                            Tersedia
                          </span>
                          <span className="text-[11px] text-[#55524A] group-hover:text-[#16191C]">
                            Klik untuk pesan slot ini
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Ledger Bottom Helper Note */}
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#55524A]">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#A9822D]" />
            <span>Klik langsung pada bilik dan jam yang kosong di atas untuk membuka formulir pemesanan kilat.</span>
          </div>
          <span>Jam operasional concierge bilik: 07:30 – 19:00 WIB</span>
        </div>
      </section>
    </div>
  );
};
