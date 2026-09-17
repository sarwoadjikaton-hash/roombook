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
  Building,
  CalendarCheck,
  QrCode,
  Play,
  Pause,
  Info,
  ShieldCheck,
  Trash2,
  Power,
  Camera,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { QRCodeDisplay } from '../components/common/QRCodeDisplay';
import { KemnakerLogo } from '../components/common/Logo';
import { FacilityIcons } from '../components/common/FacilityIcons';

export const DisplayRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId?: string }>();
  const { rooms, bookings, currentTime } = useBooking();

  // Slideshow Ruangan: Auto-slide setiap 10 detik
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [isAutoSlidePlaying, setIsAutoSlidePlaying] = useState<boolean>(true);
  const slideDurationSec = 10;
  const initialRoomSetRef = React.useRef<boolean>(false);

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

  // Auto-Slide Timer
  useEffect(() => {
    if (rooms.length <= 1 || !isAutoSlidePlaying) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentRoomIndex((prev) => (prev + 1) % rooms.length);
    }, slideDurationSec * 1000);

    return () => clearInterval(timer);
  }, [rooms.length, isAutoSlidePlaying]);

  // Ruangan yang sedang aktif ditampilkan
  const currentRoom = rooms[currentRoomIndex % (rooms.length || 1)] || rooms[0];
  const todayStr = format(currentTime, 'yyyy-MM-dd');

  // Galeri Foto Ruangan & Lightbox
  const [photoIndex, setPhotoIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  const roomImages = useMemo(() => {
    if (currentRoom?.images && currentRoom.images.length > 0) {
      return currentRoom.images;
    }
    if (currentRoom?.imageUrl) {
      return [currentRoom.imageUrl];
    }
    if (currentRoom?.slug === 'ruang-vip') {
      return [
        '/rooms/ruang-vip-1.jpg',
        '/rooms/ruang-vip-2.jpg',
      ];
    }
    if (currentRoom?.slug === 'ruang-transit') {
      return [
        '/rooms/ruang-transit-1.jpg',
        '/rooms/ruang-transit-2.jpg',
        '/rooms/ruang-transit-3.jpg',
      ];
    }
    return [
      '/rooms/ruang-sekjen-1.jpg',
      '/rooms/ruang-sekjen-2.jpg',
      '/rooms/ruang-sekjen-3.jpg',
      '/rooms/ruang-sekjen-4.jpg',
      '/rooms/ruang-sekjen-5.jpg',
    ];
  }, [currentRoom]);

  // Reset photo index when room changes
  useEffect(() => {
    setPhotoIndex(0);
  }, [currentRoom?.slug]);

  // Auto-slide foto dalam ruangan aktif (berputar setiap 5 detik)
  useEffect(() => {
    if (roomImages.length <= 1) return;
    const photoTimer = setInterval(() => {
      setPhotoIndex((prev) => (prev + 1) % roomImages.length);
    }, 5000);
    return () => clearInterval(photoTimer);
  }, [roomImages.length]);

  // Booking hari ini untuk ruangan aktif (diurutkan kronologis)
  const todayBookings = useMemo(() => {
    if (!currentRoom) return [];
    return bookings
      .filter((b) => b.roomSlug === currentRoom.slug && b.date === todayStr && b.status === 'confirmed')
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [bookings, currentRoom, todayStr]);

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

  // Hitung sisa waktu rapat jika sedang occupied
  const remainingTimeStr = useMemo(() => {
    if (statusInfo.status !== 'occupied' || !statusInfo.activeBooking) return null;
    const [endH, endM] = statusInfo.activeBooking.endTime.split(':').map(Number);
    const nowH = currentTime.getHours();
    const nowM = currentTime.getMinutes();
    const totalMinutesLeft = (endH * 60 + endM) - (nowH * 60 + nowM);
    if (totalMinutesLeft <= 0) return 'Segera Selesai';
    if (totalMinutesLeft < 60) return `${totalMinutesLeft} Menit Lagi`;
    const hours = Math.floor(totalMinutesLeft / 60);
    const mins = totalMinutesLeft % 60;
    return mins > 0 ? `${hours} Jam ${mins} Menit Lagi` : `${hours} Jam Lagi`;
  }, [statusInfo, currentTime]);

  // URL untuk QR Code Reservasi Smartphone
  const appBaseUrl = (import.meta as unknown as { env?: { VITE_APP_URL?: string } }).env?.VITE_APP_URL || window.location.origin;
  const quickBookUrl = currentRoom ? `${appBaseUrl}/quick-book/${currentRoom.slug}` : `${appBaseUrl}/booking`;

  // Status Visual Palette (Institutional Wayfinding Standard)
  const getStatusTheme = () => {
    switch (statusInfo.status) {
      case 'occupied':
        return {
          plateBg: 'bg-[#4C0519]',
          plateBorder: 'border-[#BE123C]',
          indicatorColor: 'bg-[#F43F5E]',
          titleColor: 'text-[#FFE4E6]',
          badgeText: 'SEDANG DIGUNAKAN',
          subText: `Rapat sedang berlangsung hingga pukul ${statusInfo.activeBooking?.endTime || ''} WIB.`,
          icon: <Radio size={28} className="text-[#F43F5E] animate-pulse shrink-0" />,
        };
      case 'starting_soon':
        return {
          plateBg: 'bg-[#451A03]',
          plateBorder: 'border-[#D97706]',
          indicatorColor: 'bg-[#F59E0B]',
          titleColor: 'text-[#FEF3C7]',
          badgeText: 'SEGERA DIMULAI',
          subText: `Persiapan rapat pukul ${statusInfo.activeBooking?.startTime || ''} WIB. Peserta dipersilakan bersiap.`,
          icon: <Clock size={28} className="text-[#F59E0B] animate-spin shrink-0" style={{ animationDuration: '4s' }} />,
        };
      case 'available':
      default:
        return {
          plateBg: 'bg-[#064E3B]',
          plateBorder: 'border-[#059669]',
          indicatorColor: 'bg-[#10B981]',
          titleColor: 'text-[#D1FAE5]',
          badgeText: 'RUANGAN TERSEDIA',
          subText: statusInfo.nextBooking
            ? `Ruangan dapat digunakan hingga pukul ${statusInfo.nextBooking.startTime} WIB.`
            : 'Ruangan kosong dan siap digunakan untuk rapat kedinasan.',
          icon: <CheckCircle2 size={28} className="text-[#10B981] shrink-0" />,
        };
    }
  };

  // Badge BerAKHLAK Resmi KemenPAN-RB / Kemnaker (Warna Merah Resmi KemenPAN-RB)
  const BerakhlakBadge: React.FC = () => {
    return (
      <div className="flex items-center select-none pl-4 border-l border-[#243C5E]">
        <div className="flex flex-col items-end text-right">
          <div className="flex items-start font-black tracking-tight leading-none relative">
            <span className="text-xl sm:text-2xl font-black text-[#B81D24] drop-shadow-sm">
              BerAKHLAK
            </span>
          </div>
          <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 italic tracking-wider mt-0.5">
            #banggamelayanibangsa
          </div>
        </div>
      </div>
    );
  };

  const theme = getStatusTheme();

  return (
    <div className="h-screen max-h-screen bg-[#0D192B] text-slate-100 flex flex-col justify-between font-sans select-none overflow-hidden p-4 sm:p-5 lg:p-6">
      {/* 1. TOP INSTITUTIONAL HEADER BAR */}
      <header className="flex items-center justify-between pb-3.5 border-b border-[#243C5E] shrink-0">
        {/* Left: Kemnaker RI Brand Identity */}
        <div className="flex items-center gap-4">
          <KemnakerLogo size="md" subtitle="TU SEKJEN" />
          <div className="hidden md:block h-8 w-px bg-[#243C5E]" />
          <div className="hidden md:block">
            <div className="text-xs font-bold text-slate-300 tracking-wide uppercase">
              Sistem Informasi Status Ruang Rapat
            </div>
            <div className="text-[11px] text-slate-400">
              Sekretariat Jenderal Kementerian Ketenagakerjaan RI
            </div>
          </div>
        </div>

        {/* Right: Realtime Date, Clock & BerAKHLAK */}
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="text-right">
            <div className="text-xs sm:text-sm font-semibold text-slate-300">
              {format(currentTime, 'EEEE, d MMMM yyyy', { locale: idLocale })}
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-black font-mono tracking-tight text-white">
              {format(currentTime, 'HH:mm:ss')}{' '}
              <span className="text-xs font-sans text-sky-400 font-bold ml-0.5">WIB</span>
            </div>
          </div>

          <BerakhlakBadge />
        </div>
      </header>

      {/* 2. MAIN 2-COLUMN VIEWPORT (Wayfinding & Gate Information Display) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 py-3.5 min-h-0">
        {/* LEFT COLUMN: ROOM NAME, MASSIVE STATUS PLATE & ACTIVE AGENDA (7 of 12 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full gap-2.5 min-h-0">
          {/* Main Hero Signage Card */}
          <div className="flex-1 flex flex-col gap-2.5 sm:gap-3 bg-[#132238] border border-[#243C5E] rounded-xl p-4 sm:p-5 shadow-xl relative overflow-hidden min-h-0">
            {/* 1. Header: Room Location & Authoritative Room Name */}
            <div className="border-b border-[#243C5E] pb-2.5 shrink-0 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-extrabold text-sky-400 uppercase tracking-wider">
                  <Building size={15} className="shrink-0" />
                  <span>{currentRoom?.location || 'Gedung Kemnaker RI'}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mt-1 tracking-tight leading-none">
                  {currentRoom?.name || 'Memuat Ruangan...'}
                </h1>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 bg-[#182C47] border border-[#243C5E] text-slate-300 rounded-lg flex items-center gap-1.5">
                  <Camera size={13} className="text-sky-400" />
                  <span>{roomImages.length} Foto Ruangan</span>
                </span>
              </div>
            </div>

            {/* 2. Status Plate: Large, High-Contrast Visual Indicator (Full Width) */}
            <div className={`p-3 sm:p-3.5 rounded-xl border-2 ${theme.plateBorder} ${theme.plateBg} transition-colors duration-300 shrink-0`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="shrink-0">{theme.icon}</div>
                  <div>
                    <div className="text-base sm:text-xl font-black tracking-wide text-white uppercase leading-tight">
                      {theme.badgeText}
                    </div>
                    <div className={`text-xs font-medium mt-0.5 ${theme.titleColor}`}>
                      {theme.subText}
                    </div>
                  </div>
                </div>

                {/* Sisa waktu badge saat occupied */}
                {statusInfo.status === 'occupied' && remainingTimeStr && (
                  <div className="hidden sm:flex flex-col items-end bg-black/40 border border-rose-500/40 px-3 py-1 rounded-lg shrink-0">
                    <span className="text-[10px] font-bold text-rose-300 uppercase">Sisa Waktu</span>
                    <span className="text-xs sm:text-sm font-black font-mono text-white">{remainingTimeStr}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Middle: Landscape Immersive Photo Card with Glassmorphic Overlay (Sesuai Referensi) */}
            <div
              className="flex-1 relative rounded-2xl overflow-hidden border border-[#243C5E]/80 shadow-2xl group cursor-pointer select-none min-h-[160px] flex flex-col justify-between"
              onClick={() => setIsLightboxOpen(true)}
            >
              {/* Background Photo Landscape */}
              <img
                src={roomImages[photoIndex % roomImages.length]}
                alt={currentRoom?.name || 'Foto Ruangan'}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80';
                }}
              />

              {/* Subtle Ambient Vignette (Transparent) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 pointer-events-none" />

              {/* Top Floating Glassmorphic Bar */}
              <div className="relative z-10 p-3 sm:p-3.5 flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/25 text-[11px] font-bold text-white flex items-center gap-1.5 shadow-md">
                    <Camera size={13} className="text-sky-300" />
                    <span>Foto {photoIndex + 1} dari {roomImages.length}</span>
                  </div>
                  <span className="hidden sm:inline-block px-2.5 py-1 bg-black/30 backdrop-blur-md rounded-full border border-white/20 text-[11px] font-bold text-white drop-shadow">
                    {currentRoom?.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Auto-Slide Indicator Dots */}
                  {roomImages.length > 1 && (
                    <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full backdrop-blur-md border border-white/25 shadow-md">
                      {roomImages.map((_, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPhotoIndex(pIdx);
                          }}
                          className={`h-1.5 rounded-full transition-all ${
                            pIdx === photoIndex % roomImages.length
                              ? 'bg-sky-400 w-3.5'
                              : 'bg-white/50 hover:bg-white/90 w-1.5'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Maximize / Lightbox Action Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLightboxOpen(true);
                    }}
                    className="p-2 rounded-full bg-black/40 hover:bg-sky-600 backdrop-blur-md text-white border border-white/25 transition-all shadow-md hover:scale-105"
                    title="Buka Layar Penuh"
                  >
                    <Maximize2 size={13} />
                  </button>
                </div>
              </div>

              {/* Hover Navigation Arrows */}
              {roomImages.length > 1 && (
                <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoIndex((prev) => (prev - 1 + roomImages.length) % roomImages.length);
                    }}
                    className="pointer-events-auto p-2 rounded-full bg-black/40 hover:bg-sky-600 backdrop-blur-md text-white border border-white/25 opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoIndex((prev) => (prev + 1) % roomImages.length);
                    }}
                    className="pointer-events-auto p-2 rounded-full bg-black/40 hover:bg-sky-600 backdrop-blur-md text-white border border-white/25 opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {/* Bottom Transparent Content Area (Foto Terlihat Jelas di Belakang Teks) */}
              <div className="relative z-10 p-3.5 sm:p-4.5 bg-transparent space-y-2 pointer-events-auto">
                {statusInfo.status === 'occupied' && statusInfo.activeBooking ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-600/90 text-white border border-white/30 flex items-center gap-1 shadow-md">
                        <Radio size={11} className="animate-pulse" />
                        <span>Agenda Sedang Berlangsung</span>
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-white leading-tight line-clamp-1 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                      {statusInfo.activeBooking.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <div className="px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/25 text-sky-300 font-mono font-bold flex items-center gap-1.5 shadow-md">
                        <Clock size={12} className="text-sky-300" />
                        <span>{statusInfo.activeBooking.startTime} – {statusInfo.activeBooking.endTime} WIB</span>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/25 text-white font-semibold shadow-md">
                        PIC: <strong className="text-white font-bold">{statusInfo.activeBooking.organizerName}</strong>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/25 text-white font-semibold flex items-center gap-1.5 shadow-md">
                        <Users size={12} className="text-sky-300" />
                        <span>{statusInfo.activeBooking.attendeeCount} Orang</span>
                      </div>
                    </div>
                  </div>
                ) : statusInfo.status === 'starting_soon' && statusInfo.activeBooking ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/90 text-white border border-white/30 flex items-center gap-1 shadow-md">
                        <Clock size={11} className="animate-spin" style={{ animationDuration: '4s' }} />
                        <span>Persiapan Rapat Mendatang</span>
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-white leading-tight line-clamp-1 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                      {statusInfo.activeBooking.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <div className="px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/25 text-amber-300 font-mono font-bold shadow-md">
                        Pukul {statusInfo.activeBooking.startTime} WIB
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/25 text-white font-semibold shadow-md">
                        PIC: <strong className="text-white font-bold">{statusInfo.activeBooking.organizerName}</strong>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/25 text-white font-semibold flex items-center gap-1.5 shadow-md">
                        <Users size={12} className="text-amber-300" />
                        <span>{statusInfo.activeBooking.attendeeCount} Orang</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {statusInfo.nextBooking ? (
                      <div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-sky-300 mb-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                          <Info size={12} />
                          <span>Agenda Berikutnya:</span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-white line-clamp-1 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                          {statusInfo.nextBooking.title}
                        </h2>
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-white">
                          <span className="font-mono font-bold text-sky-300 bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-white/25 shadow-md">
                            {statusInfo.nextBooking.startTime} – {statusInfo.nextBooking.endTime} WIB
                          </span>
                          <span className="bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-white/25 font-semibold shadow-md">
                            PIC: {statusInfo.nextBooking.organizerName}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                        <CheckCircle2 size={22} className="text-emerald-400 shrink-0 drop-shadow" />
                        <div>
                          <div className="text-base sm:text-lg font-black text-white leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                            Ruangan Bebas & Siap Digunakan
                          </div>
                          <div className="text-xs text-slate-100 font-medium drop-shadow mt-0.5">
                            Tidak ada agenda rapat kedinasan saat ini.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Deskripsi Ruangan Transparan */}
                    <p className="text-xs text-white font-medium leading-relaxed line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] pt-1">
                      {currentRoom?.description || 'Ruang rapat eksekutif representatif untuk pertemuan dan koordinasi strategis pimpinan.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Room Usage Rules & Etiquette Strip (Tata Tertib & Himbauan Ruang Rapat) */}
            <div className="p-2.5 sm:p-3 bg-[#182C47]/80 border border-[#243C5E] rounded-xl shrink-0">
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-400 mb-1.5">
                <ShieldCheck size={13} className="shrink-0" />
                <span>Tata Tertib & Himbauan Penggunaan Ruangan:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="flex items-center gap-2 text-slate-300">
                  <Trash2 size={13} className="text-emerald-400 shrink-0" />
                  <span className="truncate">Jaga Kebersihan & Buang Sampah</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Power size={13} className="text-amber-400 shrink-0" />
                  <span className="truncate">Matikan AC, TV Display & Lampu</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock size={13} className="text-sky-400 shrink-0" />
                  <span className="truncate">Tepat Waktu Sesuai Jadwal</span>
                </div>
              </div>
            </div>

            {/* 5. Bottom Specifications Bar: Capacity & Facilities */}
            <div className="pt-2.5 border-t border-[#243C5E] flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm shrink-0">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <Users size={15} className="text-sky-400" />
                <span>Kapasitas Ruang: <strong className="text-white">{currentRoom?.capacity || 0} Orang</strong></span>
              </div>

              {currentRoom?.facilities && currentRoom.facilities.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-xs hidden sm:inline">Fasilitas:</span>
                  <FacilityIcons facilities={currentRoom.facilities} size={14} />
                </div>
              )}
            </div>
          </div>

          {/* Room Navigation & Slide Controls (Wayfinding Tabs) */}
          <div className="flex items-center justify-between gap-2 bg-[#132238] border border-[#243C5E] rounded-xl p-2 shrink-0">
            {/* Room Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {rooms.map((r, idx) => (
                <button
                  key={r.slug}
                  onClick={() => setCurrentRoomIndex(idx)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${idx === currentRoomIndex
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-[#182C47]'
                    }`}
                >
                  {r.name}
                </button>
              ))}
            </div>

            {/* Auto-Slide Toggle */}
            {rooms.length > 1 && (
              <button
                onClick={() => setIsAutoSlidePlaying((prev) => !prev)}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border shrink-0 transition-all ${isAutoSlidePlaying
                  ? 'bg-sky-500/10 border-sky-500/40 text-sky-300 hover:bg-sky-500/20'
                  : 'bg-[#182C47] border-[#243C5E] text-slate-300 hover:text-white'
                  }`}
              >
                {isAutoSlidePlaying ? (
                  <>
                    <Pause size={12} className="text-sky-400" />
                    <span>Slide Otomatis</span>
                  </>
                ) : (
                  <>
                    <Play size={12} className="text-amber-400" />
                    <span>Slide Jeda</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: QR INSTANT BOOKING & FLIGHT-BOARD SCHEDULE (5 of 12 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-3 min-h-0">
          {/* 1. QR Code Quick Book Banner (High Contrast, Clean Instruction) */}
          <div className="bg-[#132238] border border-[#243C5E] rounded-xl p-4 sm:p-5 flex items-center gap-4 shrink-0 shadow-xl">
            <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
              <QRCodeDisplay value={quickBookUrl} size={90} />
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-sky-400 uppercase tracking-wider">
                <QrCode size={14} />
                <span>Pesan Cepat via Smartphone</span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white leading-tight">
                Pindai QR untuk Reservasi Langsung
              </h3>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Scan dengan kamera ponsel untuk mengajukan peminjaman {currentRoom?.name || 'ruangan'} secara instan.
              </p>
            </div>
          </div>

          {/* 2. Today's Schedule Board (Airport Gate / Conference Schedule Style) */}
          <div className="flex-1 bg-[#132238] border border-[#243C5E] rounded-xl p-4 sm:p-5 flex flex-col justify-between min-h-0 shadow-xl">
            {/* Table Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#243C5E] shrink-0">
              <div className="flex items-center gap-2">
                <CalendarCheck size={16} className="text-sky-400" />
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                  Jadwal Hari Ini ({format(currentTime, 'd MMM yyyy', { locale: idLocale })})
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 bg-[#182C47] border border-[#243C5E] text-slate-200 rounded-md">
                {todayBookings.length} Agenda
              </span>
            </div>

            {/* Schedule Flight-Board Rows */}
            <div className="flex-1 overflow-y-auto space-y-2 py-2.5 pr-1 min-h-0">
              {todayBookings.length > 0 ? (
                todayBookings.map((b) => {
                  const isPast =
                    b.endTime < format(currentTime, 'HH:mm') &&
                    b.date === format(currentTime, 'yyyy-MM-dd');
                  const isOccupiedCurrent = statusInfo.status === 'occupied' && statusInfo.activeBooking?.id === b.id;
                  const isStartingSoonCurrent = statusInfo.status === 'starting_soon' && statusInfo.activeBooking?.id === b.id;

                  return (
                    <div
                      key={b.id}
                      className={`p-3 rounded-lg border transition-all ${isOccupiedCurrent
                        ? 'bg-[#4C0519]/70 border-[#E11D48] shadow-md'
                        : isStartingSoonCurrent
                          ? 'bg-[#451A03]/70 border-[#F59E0B] shadow-md'
                          : isPast
                            ? 'bg-[#0F1A2A]/50 border-[#1E324D]/60 opacity-40'
                            : 'bg-[#182C47] border-[#243C5E] hover:border-[#385987]'
                        }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        {/* Waktu Rapat */}
                        <span className="text-xs font-mono font-black text-sky-400">
                          {b.startTime} – {b.endTime} WIB
                        </span>

                        {/* Status Badge */}
                        {isOccupiedCurrent ? (
                          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-[#E11D48] text-white animate-pulse">
                            Berlangsung
                          </span>
                        ) : isStartingSoonCurrent ? (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#F59E0B]/20 text-[#FCD34D] border border-[#F59E0B]/50 flex items-center gap-1">
                            <Clock size={11} className="animate-spin shrink-0" style={{ animationDuration: '4s' }} />
                            <span>Segera Dimulai</span>
                          </span>
                        ) : isPast ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#243C5E] text-slate-400">
                            Selesai
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
                            Terjadwal
                          </span>
                        )}
                      </div>

                      {/* Judul Rapat */}
                      <div className="text-xs sm:text-sm font-bold text-white mt-1.5 line-clamp-1">
                        {b.title}
                      </div>

                      {/* Penyelenggara & Peserta */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 pt-1.5 border-t border-white/5">
                        <span className="truncate max-w-[180px] text-slate-300">{b.organizerName}</span>
                        <span className="shrink-0 flex items-center gap-1 font-semibold text-slate-300">
                          <Users size={11} className="text-sky-400" />
                          {b.attendeeCount} Org
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
                  <CheckCircle2 size={28} className="text-emerald-400 mb-2" />
                  <p className="text-xs font-bold text-slate-200">Belum Ada Agenda Hari Ini</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Ruangan siap dan bebas digunakan untuk rapat kedinasan.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Official Signage Footer */}
            <div className="pt-2 border-t border-[#243C5E] text-center text-[10px] text-slate-400 font-semibold tracking-wider shrink-0">
              SIRAPAT • TATA USAHA SEKRETARIAT JENDERAL KEMNAKER RI
            </div>
          </div>
        </div>
      </div>

      {/* 3. LIGHTBOX MODAL FULLSCREEN FOTO RUANGAN */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Lightbox Top Header */}
          <div
            className="flex items-center justify-between text-white shrink-0 pb-3 border-b border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <Camera size={22} className="text-sky-400" />
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">{currentRoom?.name}</h3>
                <p className="text-xs text-slate-300">
                  {currentRoom?.location} • Foto {photoIndex + 1} dari {roomImages.length}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <X size={18} />
              <span className="hidden sm:inline">Tutup (ESC)</span>
            </button>
          </div>

          {/* Lightbox Main Image & Navigation */}
          <div
            className="flex-1 flex items-center justify-center relative py-4 min-h-0"
            onClick={(e) => e.stopPropagation()}
          >
            {roomImages.length > 1 && (
              <button
                type="button"
                onClick={() => setPhotoIndex((prev) => (prev - 1 + roomImages.length) % roomImages.length)}
                className="absolute left-2 sm:left-6 z-10 p-3.5 rounded-full bg-black/70 hover:bg-sky-600 text-white transition-all border border-white/20 shadow-2xl"
                title="Foto Sebelumnya"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            <img
              src={roomImages[photoIndex % roomImages.length]}
              alt={currentRoom?.name || 'Foto Ruang Rapat'}
              className="max-h-[72vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/20 transition-all duration-300"
            />

            {roomImages.length > 1 && (
              <button
                type="button"
                onClick={() => setPhotoIndex((prev) => (prev + 1) % roomImages.length)}
                className="absolute right-2 sm:right-6 z-10 p-3.5 rounded-full bg-black/70 hover:bg-sky-600 text-white transition-all border border-white/20 shadow-2xl"
                title="Foto Selanjutnya"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {/* Lightbox Thumbnails Strip */}
          {roomImages.length > 1 && (
            <div
              className="flex items-center justify-center gap-2.5 pt-3 border-t border-white/10 overflow-x-auto shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {roomImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPhotoIndex(idx)}
                  className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    idx === photoIndex % roomImages.length
                      ? 'border-sky-400 scale-105 shadow-lg shadow-sky-500/40'
                      : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Sudut ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
