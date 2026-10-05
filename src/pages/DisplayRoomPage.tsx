import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { getRoomRealTimeStatus } from '../utils/dateUtils';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
  Users,
  CheckCircle2,
  Clock,
  Radio,
  CalendarCheck,
} from 'lucide-react';
import { QRCodeDisplay } from '../components/common/QRCodeDisplay';

export const DisplayRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId?: string }>();
  const { rooms, bookings, currentTime } = useBooking();

  // Selected active room index (default 0 or from URL param)
  const [currentRoomIndex, setCurrentRoomIndex] = useState<number>(0);
  const [isAutoSlidePlaying] = useState<boolean>(true);
  const slideDurationSec = 12;
  const initialRoomSetRef = React.useRef<boolean>(false);

  // Filter jadwal di kolom kanan: 'all' atau room slug
  const [selectedScheduleFilter, setSelectedScheduleFilter] = useState<string>('all');

  // List Foto Resmi Sekjen Dr. Cris Kuntadi
  const sekjenPhotos = [
    '/sekjen/sekjen-2.jpg', // Peci hitam & seragam putih Kemnaker
    '/sekjen/sekjen-1.jpg', // Podium SIAPkerja
    '/sekjen/sekjen-3.jpg', // Podium bendera RI & Kemnaker
    '/sekjen/sekjen-4.jpg', // Batik Kemnaker biru
    '/sekjen/sekjen-5.jpg', // Salam kebersamaan
  ];
  const [currentSekjenPhotoIdx, setCurrentSekjenPhotoIdx] = useState<number>(0);

  // Auto-slide Sekjen photo cycling every 8 seconds
  useEffect(() => {
    if (!isAutoSlidePlaying) return;
    const photoTimer = setInterval(() => {
      setCurrentSekjenPhotoIdx((prev) => (prev + 1) % sekjenPhotos.length);
    }, 8000);
    return () => clearInterval(photoTimer);
  }, [isAutoSlidePlaying, sekjenPhotos.length]);

  // Set initial room hanya sekali saat pertama kali ruangan dimuat jika roomId ada di URL
  useEffect(() => {
    if (roomId && rooms.length > 0 && !initialRoomSetRef.current) {
      const normalizedParam = decodeURIComponent(roomId).trim().toLowerCase();
      const idx = rooms.findIndex(
        (r) =>
          r.slug.toLowerCase() === normalizedParam ||
          r.id.toLowerCase() === normalizedParam ||
          r.name.toLowerCase() === normalizedParam ||
          r.slug.replace(/-/g, ' ') === normalizedParam ||
          r.name.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedParam.replace(/[^a-z0-9]/g, '')
      );
      if (idx !== -1) {
        setCurrentRoomIndex(idx);
      }
      initialRoomSetRef.current = true;
    }
  }, [roomId, rooms]);

  // Auto-slide room switcher timer
  useEffect(() => {
    if (rooms.length <= 1 || !isAutoSlidePlaying) return;

    const timer = setInterval(() => {
      setCurrentRoomIndex((prev) => (prev + 1) % rooms.length);
    }, slideDurationSec * 1000);

    return () => clearInterval(timer);
  }, [rooms.length, isAutoSlidePlaying]);

  // Ruangan yang sedang aktif ditampilkan di kolom kiri
  const currentRoom = rooms[currentRoomIndex % (rooms.length || 1)] || rooms[0];
  const todayStr = format(currentTime, 'yyyy-MM-dd');

  // Status Realtime Ruangan Aktif
  const statusInfo = useMemo(() => {
    if (!currentRoom) {
      return {
        status: 'available' as const,
        activeBooking: null,
        nextBooking: null,
        upcomingToday: [],
      };
    }
    return getRoomRealTimeStatus(bookings, currentRoom.slug, currentTime);
  }, [bookings, currentRoom, currentTime]);

  // Sisa waktu rapat jika sedang occupied
  const remainingTimeStr = useMemo(() => {
    if (statusInfo.status !== 'occupied' || !statusInfo.activeBooking) return null;
    const [endH, endM] = statusInfo.activeBooking.endTime.split(':').map(Number);
    const nowH = currentTime.getHours();
    const nowM = currentTime.getMinutes();
    const totalMinutesLeft = endH * 60 + endM - (nowH * 60 + nowM);
    if (totalMinutesLeft <= 0) return 'Segera Selesai';
    if (totalMinutesLeft < 60) return `${totalMinutesLeft} Menit Lagi`;
    const hours = Math.floor(totalMinutesLeft / 60);
    const mins = totalMinutesLeft % 60;
    return mins > 0 ? `${hours} Jam ${mins} Menit Lagi` : `${hours} Jam Lagi`;
  }, [statusInfo, currentTime]);

  // QR Code URL untuk quick book ruangan terpilih
  const appBaseUrl = (import.meta as unknown as { env?: { VITE_APP_URL?: string } }).env?.VITE_APP_URL || window.location.origin;
  const quickBookUrl = currentRoom ? `${appBaseUrl}/quick-book/${currentRoom.slug}` : `${appBaseUrl}/booking`;

  // List booking hari ini terfilter (Kolom Kanan)
  const filteredTodayBookings = useMemo(() => {
    return bookings
      .filter((b) => {
        const matchesDate = b.date === todayStr && b.status === 'confirmed';
        if (!matchesDate) return false;
        if (selectedScheduleFilter === 'all') return true;
        return b.roomSlug === selectedScheduleFilter;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [bookings, todayStr, selectedScheduleFilter]);

  // Status Visual Badge Config
  const getStatusBadgeConfig = () => {
    switch (statusInfo.status) {
      case 'occupied':
        return {
          badgeBg: 'bg-rose-600 text-white',
          badgeText: 'SEDANG DIGUNAKAN',
          icon: <Radio size={12} className="animate-pulse shrink-0" />,
        };
      case 'starting_soon':
        return {
          badgeBg: 'bg-amber-500 text-slate-950',
          badgeText: 'SEGERA DIMULAI',
          icon: <Clock size={12} className="animate-spin shrink-0" style={{ animationDuration: '4s' }} />,
        };
      case 'available':
      default:
        return {
          badgeBg: 'bg-emerald-600 text-white',
          badgeText: 'RUANGAN TERSEDIA',
          icon: <CheckCircle2 size={12} className="shrink-0" />,
        };
    }
  };

  const statusBadge = getStatusBadgeConfig();

  // Badge BerAKHLAK Resmi
  const BerakhlakBadge: React.FC = () => (
    <div className="flex items-center select-none pl-4 border-l border-slate-300">
      <div className="flex flex-col items-end text-right">
        <div className="flex items-start font-black tracking-tight leading-none relative">
          <span className="text-xl sm:text-2xl font-black text-[#B81D24] drop-shadow-sm">
            BerAKHLAK
          </span>
        </div>
        <div className="text-[10px] sm:text-[11px] font-bold italic tracking-wider mt-0.5 text-slate-500">
          #banggamelayanibangsa
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen max-h-screen w-screen bg-slate-950 text-slate-900 flex flex-col lg:flex-row font-sans select-none overflow-hidden relative">
      {/* ========================================================================= */}
      {/* KOLOM KIRI (60-62% LEBAR): FOTO SEKJEN KEMNAKER & HEADER TRANSPARAN */}
      {/* ========================================================================= */}
      <div className="lg:w-[60%] xl:w-[62%] h-full relative overflow-hidden bg-slate-950 flex flex-col justify-between">
        {/* 1. FOTO SEKJEN KEMNAKER RI (DR. CRIS KUNTADI) */}
        <img
          key={currentSekjenPhotoIdx}
          src={sekjenPhotos[currentSekjenPhotoIdx % sekjenPhotos.length]}
          alt="Sekjen Kemnaker RI Dr. Cris Kuntadi"
          className="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 animate-in fade-in"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/sekjen.jpg';
          }}
        />

        {/* 2. GRADIENT VIGNETTE OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/30 via-transparent to-slate-950/50 pointer-events-none" />

        {/* 3. HEADER TRANSPARAN DENGAN LOGO APLIKASI & LOGO ASLI KEMNAKER (POJOK KIRI ATAS) */}
        <div className="relative z-20 p-5 sm:p-6 flex items-center justify-between pointer-events-auto">
          {/* Logo Aplikasi RUANGKU ✕ Logo Kemnaker RI Warna Asli + Teks Transparan */}
          <div className="flex items-center gap-2.5 select-none">
            {/* 1. Logo Aplikasi RUANGKU */}
            <img
              src="/logo.svg"
              alt="Logo Aplikasi RUANGKU"
              className="h-10 w-10 shrink-0 object-contain rounded-md drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />

            {/* Separator ✕ */}
            <span className="text-white/60 font-black text-sm select-none px-0.5">✕</span>

            {/* 2. Logo Resmi Kemnaker RI Warna Asli */}
            <img
              src="/logo-kemnaker.png"
              alt="Logo Resmi Kemnaker RI"
              className="h-11 w-11 shrink-0 object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('.webp')) {
                  target.src = '/logo-kemnaker.webp';
                }
              }}
            />

            {/* Teks Identitas */}
            <div className="flex flex-col text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] ml-1">
              <div className="text-base sm:text-lg font-black tracking-wider uppercase leading-none">
                RUANGKU <span className="text-sky-400 font-extrabold">• TU SEKJEN</span>
              </div>
              <div className="text-xs font-semibold text-slate-200 tracking-wide mt-1 leading-tight">
                Sekretariat Jenderal Kementerian Ketenagakerjaan RI
              </div>
            </div>
          </div>

          {/* Indikator Carousel Foto Pimpinan (Pojok Kanan Atas Foto) */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/30 backdrop-blur-sm border border-white/10">
            {sekjenPhotos.map((_, pIdx) => (
              <button
                key={pIdx}
                onClick={() => setCurrentSekjenPhotoIdx(pIdx)}
                className={`h-2 rounded-full transition-all ${
                  pIdx === currentSekjenPhotoIdx
                    ? 'bg-sky-400 w-5'
                    : 'bg-white/40 hover:bg-white/80 w-2'
                }`}
                title={`Lihat Foto ${pIdx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* 4. LOWER-THIRD NAMEPLATE OVERLAY RESMI SEKJEN KEMNAKER */}
        <div className="relative z-20 p-5 sm:p-6 lg:p-8 max-w-2xl">
          <div className="bg-slate-950/85 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden ring-1 ring-white/10">
            {/* Left Accent Color Bar */}
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-sky-400 via-indigo-500 to-rose-500" />

            <div className="pl-3">
              <div className="text-[11px] font-extrabold tracking-wider text-sky-400 uppercase">
                SEKRETARIS JENDERAL KEMENTERIAN KETENAGAKERJAAN RI
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight mt-0.5 leading-tight">
                Dr. Cris Kuntadi, S.E., M.M
              </h1>

              {/* Real-time Room Status Tag */}
              <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase flex items-center gap-1.5 shadow-sm ${statusBadge.badgeBg}`}>
                    {statusBadge.icon}
                    <span>{currentRoom?.name}: {statusBadge.badgeText}</span>
                  </span>
                </div>

                {statusInfo.status === 'occupied' && remainingTimeStr && (
                  <div className="bg-rose-950/80 border border-rose-600/50 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold text-rose-200">
                    Sisa: {remainingTimeStr}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* KOLOM KANAN (38-40% LEBAR): INFORMASI JADWAL TERANG & BERSIH (CRISP WHITE) */}
      {/* ========================================================================= */}
      <div className="lg:w-[40%] xl:w-[38%] h-full bg-[#F8FAFC] border-l border-slate-200 flex flex-col justify-between p-4 sm:p-5 lg:p-6 shadow-2xl relative z-10 overflow-hidden">
        {/* 1. Header Kanan: Jam Digital & Logo BerAKHLAK */}
        <div className="pb-3 border-b border-slate-200 shrink-0 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600">
                {format(currentTime, 'EEEE, d MMMM yyyy', { locale: idLocale })}
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900">
                {format(currentTime, 'HH:mm:ss')}{' '}
                <span className="text-xs font-sans text-sky-600 font-bold ml-0.5">WIB</span>
              </div>
            </div>

            <BerakhlakBadge />
          </div>

          {/* Room Selector Quick Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
            <button
              onClick={() => setSelectedScheduleFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedScheduleFilter === 'all'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Semua
            </button>
            {rooms.map((r, idx) => (
              <button
                key={r.slug}
                onClick={() => {
                  setCurrentRoomIndex(idx);
                  setSelectedScheduleFilter(r.slug);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedScheduleFilter === r.slug
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Middle: Flight-Board Schedule Table */}
        <div className="flex-1 flex flex-col justify-between bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 my-3 shadow-sm min-h-0 overflow-hidden">
          <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <CalendarCheck size={16} className="text-sky-600" />
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900">
                Jadwal Agenda Hari Ini
              </h3>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-md">
              {filteredTodayBookings.length} Agenda
            </span>
          </div>

          {/* Schedule List Rows */}
          <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1 min-h-0">
            {filteredTodayBookings.length > 0 ? (
              filteredTodayBookings.map((b) => {
                const targetRoom = rooms.find((r) => r.slug === b.roomSlug);
                const isPast =
                  b.endTime < format(currentTime, 'HH:mm') &&
                  b.date === format(currentTime, 'yyyy-MM-dd');

                const roomStatus = getRoomRealTimeStatus(bookings, b.roomSlug, currentTime);
                const isOccupiedCurrent = roomStatus.status === 'occupied' && roomStatus.activeBooking?.id === b.id;
                const isStartingSoonCurrent = roomStatus.status === 'starting_soon' && roomStatus.activeBooking?.id === b.id;

                return (
                  <div
                    key={b.id}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isOccupiedCurrent
                        ? 'bg-rose-50 border-rose-300 shadow-xs'
                        : isStartingSoonCurrent
                        ? 'bg-amber-50 border-amber-300 shadow-xs'
                        : isPast
                        ? 'bg-slate-50 border-slate-200 opacity-55'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-black text-sky-700">
                          {b.startTime} - {b.endTime} WIB
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white border border-slate-200 text-slate-700">
                          {targetRoom?.name || b.roomSlug}
                        </span>
                      </div>

                      {isOccupiedCurrent ? (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-rose-600 text-white animate-pulse">
                          Berlangsung
                        </span>
                      ) : isStartingSoonCurrent ? (
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500 text-slate-950 flex items-center gap-1">
                          <Clock size={10} className="animate-spin shrink-0" style={{ animationDuration: '4s' }} />
                          <span>Segera</span>
                        </span>
                      ) : isPast ? (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                          Selesai
                        </span>
                      ) : (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-300">
                          Terjadwal
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                      {b.title}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-600 mt-1 pt-1 border-t border-slate-200/60">
                      <span className="truncate max-w-[180px] font-medium">{b.organizerName}</span>
                      <span className="shrink-0 flex items-center gap-1 font-semibold text-slate-700">
                        <Users size={10} className="text-sky-600" />
                        {b.attendeeCount} Org
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
                <CheckCircle2 size={28} className="text-emerald-500 mb-1.5" />
                <p className="text-xs font-bold text-slate-700">Ruangan Bebas Digunakan</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Tidak ada agenda rapat saat ini.</p>
              </div>
            )}
          </div>

          {/* Bottom Quick QR */}
          <div className="pt-2.5 border-t border-slate-100 flex items-center gap-3 shrink-0">
            <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg shrink-0">
              <QRCodeDisplay value={quickBookUrl} size={52} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-extrabold uppercase text-sky-700">Scan untuk Booking Cepat</div>
              <div className="text-[11px] font-bold text-slate-800 truncate">Pesan {currentRoom?.name}</div>
              <div className="text-[9px] text-slate-500">Arahkan kamera smartphone ke kode QR.</div>
            </div>
          </div>
        </div>

        {/* 3. Footer */}
        <div className="pt-1 text-center text-[10px] text-slate-500 font-semibold tracking-wider shrink-0">
          RUANGKU • TATA USAHA SEKRETARIAT JENDERAL KEMNAKER RI
        </div>
      </div>
    </div>
  );
};
