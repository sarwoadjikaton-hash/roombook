import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
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
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
  Sparkles,
  Sun,
  Flame,
  LayoutGrid,
  Moon,
} from 'lucide-react';
import { QRCodeDisplay } from '../components/common/QRCodeDisplay';
import { KemnakerLogo } from '../components/common/Logo';

type DisplayTheme = 'sekjen_hero' | 'aurora' | 'vibrant' | 'flightboard' | 'dark';

export const DisplayRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { rooms, bookings, currentTime } = useBooking();

  // Active theme: 'sekjen_hero' (Split Sekjen Photo + Bright Schedule), 'aurora', 'vibrant', 'flightboard', 'dark'
  const initialTheme = (searchParams.get('theme') as DisplayTheme) || 'sekjen_hero';
  const [currentTheme, setCurrentTheme] = useState<DisplayTheme>(initialTheme);

  // Selected active room index (default 0 or from URL param)
  const [currentRoomIndex, setCurrentRoomIndex] = useState<number>(0);
  const [isAutoSlidePlaying, setIsAutoSlidePlaying] = useState<boolean>(true);
  const slideDurationSec = 12;
  const initialRoomSetRef = React.useRef<boolean>(false);

  // Filter jadwal di kolom kanan: 'all' atau room slug
  const [selectedScheduleFilter, setSelectedScheduleFilter] = useState<string>('all');

  // Lightbox state for viewing full photos
  const [lightboxRoomIndex, setLightboxRoomIndex] = useState<number | null>(null);
  const [lightboxPhotoIndex, setLightboxPhotoIndex] = useState<number>(0);

  // Switcher bar toggle
  const [isSwitcherOpen, setIsSwitcherOpen] = useState<boolean>(false);

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
    if (currentTheme !== 'sekjen_hero' || !isAutoSlidePlaying) return;
    const photoTimer = setInterval(() => {
      setCurrentSekjenPhotoIdx((prev) => (prev + 1) % sekjenPhotos.length);
    }, 8000);
    return () => clearInterval(photoTimer);
  }, [currentTheme, isAutoSlidePlaying, sekjenPhotos.length]);

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

  // Handle Theme Change & URL sync
  const handleThemeChange = (theme: DisplayTheme) => {
    setCurrentTheme(theme);
    setSearchParams((prev) => {
      prev.set('theme', theme);
      return prev;
    });
  };

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

  // Helper untuk mendapatkan gambar tiap ruangan
  const getRoomImages = (room: (typeof rooms)[0]) => {
    if (!room) return [];
    if (room.images && room.images.length > 0) return room.images;
    if (room.imageUrl) return [room.imageUrl];
    if (room.slug === 'ruang-vip') return ['/rooms/ruang-vip-1.jpg', '/rooms/ruang-vip-2.jpg'];
    if (room.slug === 'ruang-transit') return ['/rooms/ruang-transit-1.jpg', '/rooms/ruang-transit-2.jpg', '/rooms/ruang-transit-3.jpg'];
    return [
      '/rooms/ruang-sekjen-1.jpg',
      '/rooms/ruang-sekjen-2.jpg',
      '/rooms/ruang-sekjen-3.jpg',
      '/rooms/ruang-sekjen-4.jpg',
      '/rooms/ruang-sekjen-5.jpg',
    ];
  };

  // Status Realtime Ruangan Aktif (Kolom Kiri)
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

  // Sisa waktu rapat & persentase progres jika sedang occupied
  const { remainingTimeStr, progressPercentage } = useMemo(() => {
    if (statusInfo.status !== 'occupied' || !statusInfo.activeBooking) {
      return { remainingTimeStr: null, progressPercentage: 0 };
    }
    const [startH, startM] = statusInfo.activeBooking.startTime.split(':').map(Number);
    const [endH, endM] = statusInfo.activeBooking.endTime.split(':').map(Number);
    const nowH = currentTime.getHours();
    const nowM = currentTime.getMinutes();

    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;
    const nowTotal = nowH * 60 + nowM;

    const totalDuration = Math.max(1, endTotal - startTotal);
    const elapsed = Math.max(0, nowTotal - startTotal);
    const pct = Math.min(100, Math.round((elapsed / totalDuration) * 100));

    const totalMinutesLeft = endTotal - nowTotal;
    if (totalMinutesLeft <= 0) {
      return { remainingMinutes: 0, remainingTimeStr: 'Segera Selesai', progressPercentage: 100 };
    }
    if (totalMinutesLeft < 60) {
      return { remainingMinutes: totalMinutesLeft, remainingTimeStr: `${totalMinutesLeft} Menit Lagi`, progressPercentage: pct };
    }
    const hours = Math.floor(totalMinutesLeft / 60);
    const mins = totalMinutesLeft % 60;
    const str = mins > 0 ? `${hours} Jam ${mins} Menit Lagi` : `${hours} Jam Lagi`;
    return { remainingMinutes: totalMinutesLeft, remainingTimeStr: str, progressPercentage: pct };
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

  // Realtime Status Helper untuk masing-masing ruangan di Top Right Cards
  const getRoomStatusBadge = (roomSlug: string) => {
    const s = getRoomRealTimeStatus(bookings, roomSlug, currentTime);
    if (s.status === 'occupied') {
      return {
        label: 'Terpakai',
        bgLight: 'bg-rose-500 text-white',
        borderLight: 'border-rose-400',
        dot: 'bg-rose-400 animate-pulse',
      };
    }
    if (s.status === 'starting_soon') {
      return {
        label: 'Persiapan',
        bgLight: 'bg-amber-500 text-white',
        borderLight: 'border-amber-400',
        dot: 'bg-amber-400 animate-ping',
      };
    }
    return {
      label: 'Tersedia',
      bgLight: 'bg-emerald-600 text-white',
      borderLight: 'border-emerald-400',
      dot: 'bg-emerald-300',
    };
  };

  // Badge BerAKHLAK Resmi
  const BerakhlakBadge: React.FC<{ isLight?: boolean }> = ({ isLight = false }) => (
    <div className={`flex items-center select-none pl-4 border-l ${isLight ? 'border-slate-300' : 'border-[#243C5E]'}`}>
      <div className="flex flex-col items-end text-right">
        <div className="flex items-start font-black tracking-tight leading-none relative">
          <span className="text-xl sm:text-2xl font-black text-[#B81D24] drop-shadow-sm">
            BerAKHLAK
          </span>
        </div>
        <div className={`text-[10px] sm:text-[11px] font-bold italic tracking-wider mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          #banggamelayanibangsa
        </div>
      </div>
    </div>
  );

  // Status Visual Palette Helpers
  const getAuroraStatusConfig = () => {
    switch (statusInfo.status) {
      case 'occupied':
        return {
          bannerBg: 'bg-rose-50 border-rose-300 text-rose-950',
          badgeBg: 'bg-rose-600 text-white',
          badgeText: 'SEDANG DIGUNAKAN',
          subText: `Rapat berlangsung hingga pukul ${statusInfo.activeBooking?.endTime || ''} WIB.`,
          icon: <Radio size={24} className="text-rose-600 animate-pulse shrink-0" />,
          accentBorder: 'border-rose-200',
          progressColor: 'bg-rose-500',
        };
      case 'starting_soon':
        return {
          bannerBg: 'bg-amber-50 border-amber-300 text-amber-950',
          badgeBg: 'bg-amber-500 text-slate-950',
          badgeText: 'SEGERA DIMULAI',
          subText: `Persiapan rapat pukul ${statusInfo.activeBooking?.startTime || ''} WIB.`,
          icon: <Clock size={24} className="text-amber-600 animate-spin shrink-0" style={{ animationDuration: '4s' }} />,
          accentBorder: 'border-amber-200',
          progressColor: 'bg-amber-500',
        };
      case 'available':
      default:
        return {
          bannerBg: 'bg-emerald-50 border-emerald-300 text-emerald-950',
          badgeBg: 'bg-emerald-600 text-white',
          badgeText: 'RUANGAN TERSEDIA',
          subText: statusInfo.nextBooking
            ? `Dapat digunakan hingga pukul ${statusInfo.nextBooking.startTime} WIB.`
            : 'Ruangan kosong dan siap digunakan untuk rapat kedinasan.',
          icon: <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />,
          accentBorder: 'border-emerald-200',
          progressColor: 'bg-emerald-500',
        };
    }
  };

  const getVibrantStatusConfig = () => {
    switch (statusInfo.status) {
      case 'occupied':
        return {
          glowCard: 'bg-white/85 border-rose-300 shadow-rose-500/15',
          bannerBg: 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30',
          badgeText: 'SEDANG DIGUNAKAN',
          subText: `Rapat berlangsung hingga pukul ${statusInfo.activeBooking?.endTime || ''} WIB`,
          icon: <Radio size={26} className="text-white animate-pulse shrink-0" />,
          ringColor: 'ring-rose-500/30',
          accentText: 'text-rose-600',
        };
      case 'starting_soon':
        return {
          glowCard: 'bg-white/85 border-amber-300 shadow-amber-500/15',
          bannerBg: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30',
          badgeText: 'SEGERA DIMULAI',
          subText: `Persiapan rapat pukul ${statusInfo.activeBooking?.startTime || ''} WIB`,
          icon: <Clock size={26} className="text-white animate-spin shrink-0" style={{ animationDuration: '4s' }} />,
          ringColor: 'ring-amber-500/30',
          accentText: 'text-amber-600',
        };
      case 'available':
      default:
        return {
          glowCard: 'bg-white/85 border-emerald-300 shadow-emerald-500/15',
          bannerBg: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30',
          badgeText: 'RUANGAN TERSEDIA',
          subText: statusInfo.nextBooking
            ? `Dapat digunakan hingga pukul ${statusInfo.nextBooking.startTime} WIB.`
            : 'Ruangan kosong dan siap digunakan untuk rapat kedinasan.',
          icon: <CheckCircle2 size={26} className="text-white shrink-0" />,
          ringColor: 'ring-emerald-500/30',
          accentText: 'text-emerald-600',
        };
    }
  };

  // =========================================================================
  // THEME SWITCHER FLOATING BAR (Allows user to immediately compare 3 options)
  // =========================================================================
  const ThemeSwitcherPill = () => (
    <div className="fixed bottom-3 right-3 z-50 flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-300 dark:border-slate-700 shadow-2xl transition-all">
      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 px-2 flex items-center gap-1">
        <Sparkles size={13} className="text-sky-500" />
        <span>Pilih Tampilan:</span>
      </span>

      <button
        onClick={() => handleThemeChange('sekjen_hero')}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${currentTheme === 'sekjen_hero'
            ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 scale-105'
            : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
      >
        <Building size={13} />
        <span>Foto Sekjen + Jadwal</span>
      </button>

      <button
        onClick={() => handleThemeChange('aurora')}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${currentTheme === 'aurora'
            ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 scale-105'
            : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
      >
        <Sun size={13} />
        <span>1. Clean Aurora</span>
      </button>

      <button
        onClick={() => handleThemeChange('vibrant')}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${currentTheme === 'vibrant'
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105'
            : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
      >
        <Flame size={13} />
        <span>2. Vibrant Glass</span>
      </button>

      <button
        onClick={() => handleThemeChange('flightboard')}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${currentTheme === 'flightboard'
            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105'
            : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
      >
        <LayoutGrid size={13} />
        <span>3. Flight-Board</span>
      </button>

      <button
        onClick={() => handleThemeChange('dark')}
        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${currentTheme === 'dark'
            ? 'bg-slate-800 text-white shadow-md scale-105'
            : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        title="Mode Gelap Klasik"
      >
        <Moon size={13} />
        <span className="hidden sm:inline">Gelap</span>
      </button>
    </div>
  );

  // Lightbox Modal for viewing photos across all themes
  const LightboxModalComponent = () => {
    if (lightboxRoomIndex === null || !rooms[lightboxRoomIndex]) return null;
    const targetRoom = rooms[lightboxRoomIndex];
    const images = getRoomImages(targetRoom);

    return (
      <div
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200"
        onClick={() => setLightboxRoomIndex(null)}
      >
        <div
          className="flex items-center justify-between text-white shrink-0 pb-3 border-b border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3">
            <Sparkles size={20} className="text-sky-400" />
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">{targetRoom.name}</h3>
              <p className="text-xs text-slate-300">
                {targetRoom.location} • Foto {lightboxPhotoIndex + 1} dari {images.length}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setLightboxRoomIndex(null)}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
          >
            <X size={18} />
            <span className="hidden sm:inline">Tutup (ESC)</span>
          </button>
        </div>

        <div
          className="flex-1 flex items-center justify-center relative py-4 min-h-0"
          onClick={(e) => e.stopPropagation()}
        >
          {images.length > 1 && (
            <button
              type="button"
              onClick={() =>
                setLightboxPhotoIndex((prev) => (prev - 1 + images.length) % images.length)
              }
              className="absolute left-2 sm:left-6 z-10 p-3.5 rounded-full bg-black/70 hover:bg-sky-600 text-white transition-all border border-white/20 shadow-2xl"
              title="Foto Sebelumnya"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <img
            src={images[lightboxPhotoIndex % images.length]}
            alt={targetRoom.name}
            className="max-h-[72vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/20 transition-all duration-300"
          />

          {images.length > 1 && (
            <button
              type="button"
              onClick={() =>
                setLightboxPhotoIndex((prev) => (prev + 1) % images.length)
              }
              className="absolute right-2 sm:right-6 z-10 p-3.5 rounded-full bg-black/70 hover:bg-sky-600 text-white transition-all border border-white/20 shadow-2xl"
              title="Foto Selanjutnya"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>

        {images.length > 1 && (
          <div
            className="flex items-center justify-center gap-2.5 pt-3 border-t border-white/10 overflow-x-auto shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setLightboxPhotoIndex(idx)}
                className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${idx === lightboxPhotoIndex % images.length
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
    );
  };

  // =========================================================================
  // RENDER THEME: SEKJEN_HERO (Split: Foto Sekjen Kiri & Info Jadwal Terang Kanan)
  // Sesuai contoh foto display TV referensi pengguna
  // =========================================================================
  if (currentTheme === 'sekjen_hero') {
    const auroraCfg = getAuroraStatusConfig();

    return (
      <div className="h-screen max-h-screen w-screen bg-slate-950 text-slate-900 flex flex-col lg:flex-row font-sans select-none overflow-hidden relative">
        <ThemeSwitcherPill />
        <LightboxModalComponent />

        {/* ========================================================================= */}
        {/* KOLOM KIRI (60% LEBAR): FOTO SEKJEN KEMNAKER & LOWER-THIRD TAG RESMI */}
        {/* ========================================================================= */}
        <div className="lg:w-[60%] xl:w-[62%] h-full relative overflow-hidden bg-slate-950 flex flex-col justify-end">
          {/* Foto Sekjen Kemnaker RI Dr. Cris Kuntadi */}
          <img
            key={currentSekjenPhotoIdx}
            src={sekjenPhotos[currentSekjenPhotoIdx % sekjenPhotos.length]}
            alt="Sekjen Kemnaker RI Dr. Cris Kuntadi"
            className="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 animate-in fade-in"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/sekjen.jpg';
            }}
          />

          {/* Vignette Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-transparent to-slate-950/60 pointer-events-none" />

          {/* Top Brand Pill on Photo */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/75 backdrop-blur-md border border-white/20 text-white shadow-xl">
            <KemnakerLogo size="sm" />
            <div className="h-4 w-px bg-white/20" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-200">
              Kementerian Ketenagakerjaan RI
            </span>
          </div>

          {/* Photo Carousel Indicators (Top Right) */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/75 backdrop-blur-md border border-white/20">
            {sekjenPhotos.map((_, pIdx) => (
              <button
                key={pIdx}
                onClick={() => setCurrentSekjenPhotoIdx(pIdx)}
                className={`w-2 h-2 rounded-full transition-all ${pIdx === currentSekjenPhotoIdx
                    ? 'bg-sky-400 w-5'
                    : 'bg-white/40 hover:bg-white/80'
                  }`}
                title={`Lihat Foto ${pIdx + 1}`}
              />
            ))}
          </div>

          {/* LOWER-THIRD NAMEPLATE OVERLAY (SESUAI CONTOH FOTO DISPLAY TV) */}
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
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase flex items-center gap-1.5 shadow-sm ${auroraCfg.badgeBg}`}>
                      {statusInfo.status === 'occupied' ? (
                        <Radio size={12} className="animate-pulse shrink-0" />
                      ) : statusInfo.status === 'starting_soon' ? (
                        <Clock size={12} className="animate-spin shrink-0" style={{ animationDuration: '4s' }} />
                      ) : (
                        <CheckCircle2 size={12} className="shrink-0" />
                      )}
                      <span>{currentRoom?.name}: {auroraCfg.badgeText}</span>
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
        {/* KOLOM KANAN (40% LEBAR): INFORMASI JADWAL TERANG & BERSIH (CRISP WHITE) */}
        {/* ========================================================================= */}
        <div className="lg:w-[40%] xl:w-[38%] h-full bg-[#F8FAFC] border-l border-slate-200 flex flex-col justify-between p-4 sm:p-5 lg:p-6 shadow-2xl relative z-10 overflow-hidden">
          {/* 1. Header Kanan: Jam Digital & Logo */}
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

              <BerakhlakBadge isLight />
            </div>

            {/* Room Selector Quick Switcher */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
              {rooms.map((r, idx) => (
                <button
                  key={r.slug}
                  onClick={() => setCurrentRoomIndex(idx)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${idx === currentRoomIndex
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
                      className={`p-2.5 rounded-xl border transition-all ${isOccupiedCurrent
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
            SIRAPAT • TATA USAHA SEKRETARIAT JENDERAL KEMNAKER RI
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER THEME 1: CLEAN EXECUTIVE AURORA (Ultra-Crisp Bright)
  // =========================================================================
  if (currentTheme === 'aurora') {
    const auroraCfg = getAuroraStatusConfig();

    return (
      <div className="h-screen max-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between font-sans select-none overflow-hidden p-4 sm:p-5 lg:p-6 relative">
        <ThemeSwitcherPill />
        <LightboxModalComponent />

        {/* Ambient Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

        {/* 1. TOP INSTITUTIONAL HEADER BAR */}
        <header className="relative z-10 flex items-center justify-between pb-3.5 border-b border-slate-200 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <KemnakerLogo size="md" subtitle="TU SEKJEN" />
            <div className="hidden md:block h-8 w-px bg-slate-200" />
            <div className="hidden md:block">
              <div className="text-xs font-extrabold text-slate-800 tracking-wide uppercase">
                Sistem Informasi Reservasi Ruang Rapat
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Sekretariat Jenderal Kementerian Ketenagakerjaan RI
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-right">
              <div className="text-xs sm:text-sm font-semibold text-slate-600">
                {format(currentTime, 'EEEE, d MMMM yyyy', { locale: idLocale })}
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black font-mono tracking-tight text-slate-900">
                {format(currentTime, 'HH:mm:ss')}{' '}
                <span className="text-xs font-sans text-sky-600 font-bold ml-0.5">WIB</span>
              </div>
            </div>

            <BerakhlakBadge isLight />
          </div>
        </header>

        {/* 2. MAIN 2-COLUMN VIEWPORT */}
        <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 py-3 min-h-0">
          {/* KOLOM KIRI (5 / 12 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full gap-3 min-h-0">
            {/* Card Atas Kiri: Room Status Plate */}
            <div className="flex-1 flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden min-h-0">
              {/* Header Ruangan */}
              <div className="border-b border-slate-100 pb-3 shrink-0 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-sky-700 uppercase tracking-wider">
                    <Building size={14} className="shrink-0" />
                    <span>{currentRoom?.location || 'Gedung Kemnaker RI'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                    <Users size={13} className="text-sky-600" />
                    <span>Kapasitas: <strong className="text-slate-900">{currentRoom?.capacity || 0} Orang</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    {currentRoom?.name || 'Memuat Ruangan...'}
                  </h1>
                </div>

                {/* Room Quick Switcher Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
                  {rooms.map((r, idx) => (
                    <button
                      key={r.slug}
                      onClick={() => setCurrentRoomIndex(idx)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${idx === currentRoomIndex
                          ? 'bg-sky-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                      {r.name}
                    </button>
                  ))}
                  {rooms.length > 1 && (
                    <button
                      onClick={() => setIsAutoSlidePlaying((prev) => !prev)}
                      className={`ml-auto flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md border shrink-0 transition-all ${isAutoSlidePlaying
                          ? 'bg-sky-50 border-sky-300 text-sky-700'
                          : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                      title={isAutoSlidePlaying ? 'Jeda Auto-Slide' : 'Putar Auto-Slide'}
                    >
                      {isAutoSlidePlaying ? <Pause size={11} /> : <Play size={11} />}
                      <span>{isAutoSlidePlaying ? 'Auto' : 'Jeda'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status Banner */}
              <div className={`p-4 rounded-xl border-2 ${auroraCfg.bannerBg} my-2.5 shrink-0 shadow-sm`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="shrink-0">{auroraCfg.icon}</div>
                    <div>
                      <div className="text-base sm:text-lg font-black tracking-wide uppercase leading-tight">
                        {auroraCfg.badgeText}
                      </div>
                      <div className="text-xs font-medium mt-0.5 opacity-90">
                        {auroraCfg.subText}
                      </div>
                    </div>
                  </div>

                  {statusInfo.status === 'occupied' && remainingTimeStr && (
                    <div className="flex flex-col items-end bg-white/90 border border-rose-300 px-3 py-1.5 rounded-lg shrink-0 shadow-sm">
                      <span className="text-[10px] font-bold text-rose-700 uppercase">Sisa Waktu</span>
                      <span className="text-xs sm:text-sm font-black font-mono text-rose-950">{remainingTimeStr}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Middle: Active Agenda / Next Agenda */}
              <div className="flex-1 bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 sm:p-4 flex flex-col justify-center min-h-0 overflow-y-auto">
                {statusInfo.status === 'occupied' && statusInfo.activeBooking ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-600 text-white flex items-center gap-1 shadow-sm">
                        <Radio size={11} className="animate-pulse" />
                        <span>Agenda Sedang Berlangsung</span>
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug line-clamp-2">
                      {statusInfo.activeBooking.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <div className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-sky-700 font-mono font-bold flex items-center gap-1.5 shadow-2xs">
                        <Clock size={12} className="text-sky-600" />
                        <span>{statusInfo.activeBooking.startTime} – {statusInfo.activeBooking.endTime} WIB</span>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold shadow-2xs">
                        PIC: <strong className="text-slate-900 font-bold">{statusInfo.activeBooking.organizerName}</strong>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold flex items-center gap-1.5 shadow-2xs">
                        <Users size={12} className="text-sky-600" />
                        <span>{statusInfo.activeBooking.attendeeCount} Orang</span>
                      </div>
                    </div>
                  </div>
                ) : statusInfo.status === 'starting_soon' && statusInfo.activeBooking ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 flex items-center gap-1 shadow-sm">
                        <Clock size={11} className="animate-spin" style={{ animationDuration: '4s' }} />
                        <span>Persiapan Rapat Mendatang</span>
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug line-clamp-2">
                      {statusInfo.activeBooking.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <div className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-amber-700 font-mono font-bold">
                        Pukul {statusInfo.activeBooking.startTime} WIB
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold">
                        PIC: <strong className="text-slate-900 font-bold">{statusInfo.activeBooking.organizerName}</strong>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold flex items-center gap-1.5">
                        <Users size={12} className="text-amber-600" />
                        <span>{statusInfo.activeBooking.attendeeCount} Orang</span>
                      </div>
                    </div>
                  </div>
                ) : statusInfo.nextBooking ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-sky-700">
                      <Info size={13} />
                      <span>Agenda Berikutnya:</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 line-clamp-2">
                      {statusInfo.nextBooking.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="font-mono font-bold text-sky-700 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                        {statusInfo.nextBooking.startTime} – {statusInfo.nextBooking.endTime} WIB
                      </span>
                      <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 font-semibold text-slate-700">
                        PIC: {statusInfo.nextBooking.organizerName}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 text-emerald-600">
                      <CheckCircle2 size={24} className="shrink-0" />
                      <div>
                        <div className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                          Ruangan Bebas & Siap Digunakan
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                          Tidak ada agenda rapat kedinasan saat ini.
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      {currentRoom?.description || 'Ruang rapat eksekutif representatif untuk pertemuan dan koordinasi strategis pimpinan.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Tata Tertib */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl shrink-0 mt-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-700 mb-1">
                  <ShieldCheck size={12} className="shrink-0" />
                  <span>Tata Tertib & Himbauan:</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Trash2 size={11} className="text-emerald-600 shrink-0" />
                    <span className="truncate font-medium">Jaga Kebersihan</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Power size={11} className="text-amber-600 shrink-0" />
                    <span className="truncate font-medium">Matikan AC & Lampu</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Clock size={11} className="text-sky-600 shrink-0" />
                    <span className="truncate font-medium">Tepat Waktu</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Bawah Kiri: Scan QR Code */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 flex items-center gap-4 shrink-0 shadow-sm">
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl shrink-0">
                <QRCodeDisplay value={quickBookUrl} size={82} />
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-sky-700 uppercase tracking-wider">
                  <QrCode size={13} />
                  <span>Pesan Cepat via Smartphone</span>
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                  Pindai QR untuk Reservasi Langsung
                </h3>
                <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                  Scan dengan kamera ponsel untuk mengajukan peminjaman <strong>{currentRoom?.name}</strong> secara instan.
                </p>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN (7 / 12 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full gap-3 min-h-0">
            {/* BAGIAN ATAS KANAN: 3 KARTU FOTO RUANGAN */}
            <div className="grid grid-cols-3 gap-3 shrink-0">
              {rooms.slice(0, 3).map((room, rIdx) => {
                const rImages = getRoomImages(room);
                const isSelected = rIdx === currentRoomIndex;
                const rStatus = getRoomStatusBadge(room.slug);

                return (
                  <div
                    key={room.id}
                    onClick={() => setCurrentRoomIndex(rIdx)}
                    className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-300 shadow-sm select-none h-32 sm:h-36 flex flex-col justify-between ${isSelected
                        ? 'border-sky-500 ring-2 ring-sky-500/30 shadow-md scale-[1.02]'
                        : 'border-slate-200 hover:border-sky-400 opacity-90 hover:opacity-100'
                      }`}
                  >
                    <img
                      src={rImages[0]}
                      alt={room.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-slate-950/30 pointer-events-none" />

                    <div className="relative z-10 p-2 flex items-center justify-between">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${rStatus.bgLight} shadow-md flex items-center gap-1`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${rStatus.dot}`} />
                        <span>{rStatus.label}</span>
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxRoomIndex(rIdx);
                          setLightboxPhotoIndex(0);
                        }}
                        className="p-1 rounded-md bg-black/40 hover:bg-sky-600 text-white backdrop-blur-sm transition-all"
                        title="Lihat Galeri Foto"
                      >
                        <Maximize2 size={11} />
                      </button>
                    </div>

                    <div className="relative z-10 p-2.5">
                      <div className="text-xs sm:text-sm font-black text-white leading-tight drop-shadow-md line-clamp-1">
                        {room.name}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-200 font-semibold mt-0.5">
                        <span>{room.capacity} Org</span>
                        {isSelected && (
                          <span className="text-[9px] font-bold text-sky-200 bg-sky-600 px-1.5 py-0.2 rounded shadow-2xs">
                            Aktif
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* BAGIAN BAWAH KANAN: JADWAL AGENDA HARI INI */}
            <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between min-h-0 shadow-sm overflow-hidden">
              <div className="pb-3 border-b border-slate-100 shrink-0 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarCheck size={18} className="text-sky-600" />
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900">
                      Jadwal Agenda Hari Ini
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-md">
                    {filteredTodayBookings.length} Agenda
                  </span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <button
                    onClick={() => setSelectedScheduleFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${selectedScheduleFilter === 'all'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                  >
                    <Layers size={12} />
                    <span>Semua Ruangan</span>
                  </button>

                  {rooms.map((r) => (
                    <button
                      key={r.slug}
                      onClick={() => setSelectedScheduleFilter(r.slug)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${selectedScheduleFilter === r.slug
                          ? 'bg-sky-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* List Agenda */}
              <div className="flex-1 overflow-y-auto space-y-2 py-2.5 pr-1 min-h-0">
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
                        className={`p-3 rounded-xl border transition-all ${isOccupiedCurrent
                            ? 'bg-rose-50 border-rose-300 shadow-sm'
                            : isStartingSoonCurrent
                              ? 'bg-amber-50 border-amber-300 shadow-sm'
                              : isPast
                                ? 'bg-slate-50 border-slate-200 opacity-55'
                                : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:shadow-xs'
                          }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-black text-sky-700">
                              {b.startTime} – {b.endTime} WIB
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 shadow-2xs">
                              {targetRoom?.name || b.roomSlug}
                            </span>
                          </div>

                          {isOccupiedCurrent ? (
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-rose-600 text-white animate-pulse">
                              Berlangsung
                            </span>
                          ) : isStartingSoonCurrent ? (
                            <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-amber-500 text-slate-950 flex items-center gap-1">
                              <Clock size={11} className="animate-spin shrink-0" style={{ animationDuration: '4s' }} />
                              <span>Segera Dimulai</span>
                            </span>
                          ) : isPast ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-600">
                              Selesai
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-300">
                              Terjadwal
                            </span>
                          )}
                        </div>

                        <div className="text-xs sm:text-sm font-bold text-slate-900 mt-1.5 line-clamp-1">
                          {b.title}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-600 mt-1.5 pt-1.5 border-t border-slate-200/60">
                          <span className="truncate max-w-[220px] font-medium">{b.organizerName}</span>
                          <span className="shrink-0 flex items-center gap-1 font-semibold text-slate-700">
                            <Users size={11} className="text-sky-600" />
                            {b.attendeeCount} Org
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
                    <p className="text-xs sm:text-sm font-bold text-slate-700">
                      {selectedScheduleFilter === 'all'
                        ? 'Belum Ada Agenda Hari Ini'
                        : `Belum Ada Agenda untuk ${rooms.find((r) => r.slug === selectedScheduleFilter)?.name || 'Ruangan Ini'}`}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Ruangan bebas dan siap digunakan untuk rapat kedinasan.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center text-[10px] text-slate-500 font-semibold tracking-wider shrink-0">
                SIRAPAT • TATA USAHA SEKRETARIAT JENDERAL KEMNAKER RI
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER THEME 2: VIBRANT GLASSMORPHISM PRO (Dynamic Progress & Glow)
  // =========================================================================
  if (currentTheme === 'vibrant') {
    const vibrantCfg = getVibrantStatusConfig();

    return (
      <div className="h-screen max-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100/70 text-slate-900 flex flex-col justify-between font-sans select-none overflow-hidden p-4 sm:p-5 lg:p-6 relative">
        <ThemeSwitcherPill />

        {/* Dynamic Animated Floating Aurora Orbs */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-sky-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />

        {/* 1. TOP INSTITUTIONAL HEADER BAR */}
        <header className="relative z-10 flex items-center justify-between pb-3.5 border-b border-white/80 bg-white/75 backdrop-blur-xl px-5 py-2.5 rounded-3xl shadow-lg shadow-sky-900/5 shrink-0">
          <div className="flex items-center gap-4">
            <KemnakerLogo size="md" subtitle="TU SEKJEN" />
            <div className="hidden md:block h-8 w-px bg-slate-200" />
            <div className="hidden md:block">
              <div className="text-xs font-black text-slate-800 tracking-wide uppercase">
                Sistem Informasi Reservasi Ruang Rapat
              </div>
              <div className="text-[11px] text-slate-500 font-semibold">
                Sekretariat Jenderal Kementerian Ketenagakerjaan RI
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-right">
              <div className="text-xs sm:text-sm font-bold text-slate-600">
                {format(currentTime, 'EEEE, d MMMM yyyy', { locale: idLocale })}
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black font-mono tracking-tight bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                {format(currentTime, 'HH:mm:ss')}{' '}
                <span className="text-xs font-sans text-indigo-600 font-bold ml-0.5">WIB</span>
              </div>
            </div>

            <BerakhlakBadge isLight />
          </div>
        </header>

        {/* 2. MAIN 2-COLUMN VIEWPORT */}
        <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 py-3 min-h-0">
          {/* KOLOM KIRI (5 / 12 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full gap-3 min-h-0">
            {/* Card Atas Kiri: Room Status Plate */}
            <div className={`flex-1 flex flex-col justify-between bg-white/85 backdrop-blur-xl border border-white/90 rounded-3xl p-4 sm:p-5 shadow-xl shadow-sky-900/5 relative overflow-hidden min-h-0 ring-4 ${vibrantCfg.ringColor}`}>
              <div className="border-b border-slate-100 pb-3 shrink-0 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-700 uppercase tracking-wider">
                    <Building size={14} className="shrink-0" />
                    <span>{currentRoom?.location || 'Gedung Kemnaker RI'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs">
                    <Users size={13} className="text-indigo-600" />
                    <span>Kapasitas: <strong className="text-slate-900">{currentRoom?.capacity || 0} Org</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    {currentRoom?.name || 'Memuat Ruangan...'}
                  </h1>
                </div>

                {/* Switcher Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
                  {rooms.map((r, idx) => (
                    <button
                      key={r.slug}
                      onClick={() => setCurrentRoomIndex(idx)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${idx === currentRoomIndex
                          ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-white/80 text-slate-700 hover:bg-white border border-slate-200'
                        }`}
                    >
                      {r.name}
                    </button>
                  ))}
                  {rooms.length > 1 && (
                    <button
                      onClick={() => setIsAutoSlidePlaying((prev) => !prev)}
                      className={`ml-auto flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl border shrink-0 transition-all ${isAutoSlidePlaying
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                          : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      title={isAutoSlidePlaying ? 'Jeda Auto-Slide' : 'Putar Auto-Slide'}
                    >
                      {isAutoSlidePlaying ? <Pause size={11} /> : <Play size={11} />}
                      <span>{isAutoSlidePlaying ? 'Auto' : 'Jeda'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status Header Plate with Gradient Glow */}
              <div className={`p-4 rounded-2xl ${vibrantCfg.bannerBg} my-2.5 shrink-0`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="shrink-0">{vibrantCfg.icon}</div>
                    <div>
                      <div className="text-base sm:text-lg font-black tracking-wide uppercase leading-tight">
                        {vibrantCfg.badgeText}
                      </div>
                      <div className="text-xs font-medium mt-0.5 opacity-95">
                        {vibrantCfg.subText}
                      </div>
                    </div>
                  </div>

                  {statusInfo.status === 'occupied' && remainingTimeStr && (
                    <div className="flex flex-col items-end bg-black/25 backdrop-blur-md px-3 py-1.5 rounded-xl shrink-0 border border-white/30">
                      <span className="text-[10px] font-bold text-rose-200 uppercase">Sisa Waktu</span>
                      <span className="text-xs sm:text-sm font-black font-mono text-white">{remainingTimeStr}</span>
                    </div>
                  )}
                </div>

                {/* Dynamic Live Progress Bar */}
                {statusInfo.status === 'occupied' && (
                  <div className="mt-3 pt-2.5 border-t border-white/20">
                    <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                      <span>Progres Rapat</span>
                      <span>{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden p-0.5">
                      <div
                        className="bg-white h-full rounded-full transition-all duration-1000 shadow-sm"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Middle: Active Agenda / Details */}
              <div className="flex-1 bg-white/75 backdrop-blur-md border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-center min-h-0 overflow-y-auto">
                {statusInfo.status === 'occupied' && statusInfo.activeBooking ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-600 text-white flex items-center gap-1 shadow-sm">
                        <Radio size={11} className="animate-pulse" />
                        <span>Agenda Sedang Berlangsung</span>
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug line-clamp-2">
                      {statusInfo.activeBooking.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <div className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-indigo-700 font-mono font-bold flex items-center gap-1.5 shadow-xs">
                        <Clock size={12} className="text-indigo-600" />
                        <span>{statusInfo.activeBooking.startTime} – {statusInfo.activeBooking.endTime} WIB</span>
                      </div>
                      <div className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold shadow-xs">
                        PIC: <strong className="text-slate-900 font-bold">{statusInfo.activeBooking.organizerName}</strong>
                      </div>
                      <div className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold flex items-center gap-1.5 shadow-xs">
                        <Users size={12} className="text-indigo-600" />
                        <span>{statusInfo.activeBooking.attendeeCount} Orang</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 text-emerald-600">
                      <CheckCircle2 size={24} className="shrink-0" />
                      <div>
                        <div className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                          Ruangan Bebas & Siap Digunakan
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                          Tidak ada agenda rapat kedinasan saat ini.
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      {currentRoom?.description || 'Ruang rapat eksekutif representatif untuk pertemuan dan koordinasi strategis pimpinan.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Tata Tertib */}
              <div className="p-2.5 bg-white/70 border border-slate-200 rounded-2xl shrink-0 mt-2.5">
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Trash2 size={11} className="text-emerald-600 shrink-0" />
                    <span className="truncate font-medium">Jaga Kebersihan</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Power size={11} className="text-amber-600 shrink-0" />
                    <span className="truncate font-medium">Matikan AC/Lampu</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Clock size={11} className="text-sky-600 shrink-0" />
                    <span className="truncate font-medium">Tepat Waktu</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Bawah Kiri: Scan QR Code */}
            <div className="bg-white/85 backdrop-blur-xl border border-white/90 rounded-3xl p-3.5 sm:p-4 flex items-center gap-4 shrink-0 shadow-xl shadow-sky-900/5">
              <div className="p-2 bg-white border border-slate-200 rounded-2xl shrink-0 shadow-sm">
                <QRCodeDisplay value={quickBookUrl} size={82} />
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-indigo-700 uppercase tracking-wider">
                  <QrCode size={13} />
                  <span>Pesan Cepat via Smartphone</span>
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                  Pindai QR untuk Reservasi Langsung
                </h3>
                <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                  Scan dengan kamera ponsel untuk mengajukan peminjaman <strong>{currentRoom?.name}</strong> secara instan.
                </p>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN (7 / 12 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full gap-3 min-h-0">
            {/* Foto Cards */}
            <div className="grid grid-cols-3 gap-3 shrink-0">
              {rooms.slice(0, 3).map((room, rIdx) => {
                const rImages = getRoomImages(room);
                const isSelected = rIdx === currentRoomIndex;
                const rStatus = getRoomStatusBadge(room.slug);

                return (
                  <div
                    key={room.id}
                    onClick={() => setCurrentRoomIndex(rIdx)}
                    className={`group relative rounded-3xl overflow-hidden border-2 cursor-pointer transition-all duration-300 shadow-md select-none h-32 sm:h-36 flex flex-col justify-between ${isSelected
                        ? 'border-indigo-500 ring-4 ring-indigo-500/20 scale-[1.02]'
                        : 'border-white/80 hover:border-indigo-400 opacity-90 hover:opacity-100'
                      }`}
                  >
                    <img
                      src={rImages[0]}
                      alt={room.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-slate-950/30 pointer-events-none" />

                    <div className="relative z-10 p-2 flex items-center justify-between">
                      <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${rStatus.bgLight} shadow-md flex items-center gap-1`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${rStatus.dot}`} />
                        <span>{rStatus.label}</span>
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxRoomIndex(rIdx);
                          setLightboxPhotoIndex(0);
                        }}
                        className="p-1 rounded-lg bg-black/40 hover:bg-indigo-600 text-white backdrop-blur-sm transition-all"
                      >
                        <Maximize2 size={11} />
                      </button>
                    </div>

                    <div className="relative z-10 p-2.5">
                      <div className="text-xs sm:text-sm font-black text-white leading-tight drop-shadow-md line-clamp-1">
                        {room.name}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-200 font-semibold mt-0.5">
                        <span>{room.capacity} Org</span>
                        {isSelected && (
                          <span className="text-[9px] font-bold text-indigo-200 bg-indigo-600 px-2 py-0.2 rounded-full">
                            Aktif
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Jadwal Card */}
            <div className="flex-1 bg-white/85 backdrop-blur-xl border border-white/90 rounded-3xl p-4 sm:p-5 flex flex-col justify-between min-h-0 shadow-xl shadow-sky-900/5 overflow-hidden">
              <div className="pb-3 border-b border-slate-100 shrink-0 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarCheck size={18} className="text-indigo-600" />
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900">
                      Jadwal Agenda Hari Ini
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-3 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full">
                    {filteredTodayBookings.length} Agenda
                  </span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <button
                    onClick={() => setSelectedScheduleFilter('all')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${selectedScheduleFilter === 'all'
                        ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                  >
                    <Layers size={12} />
                    <span>Semua Ruangan</span>
                  </button>

                  {rooms.map((r) => (
                    <button
                      key={r.slug}
                      onClick={() => setSelectedScheduleFilter(r.slug)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${selectedScheduleFilter === r.slug
                          ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* List Agenda */}
              <div className="flex-1 overflow-y-auto space-y-2 py-2.5 pr-1 min-h-0">
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
                        className={`p-3.5 rounded-2xl border transition-all ${isOccupiedCurrent
                            ? 'bg-gradient-to-r from-rose-50 to-pink-50 border-rose-300 shadow-md shadow-rose-500/10'
                            : isStartingSoonCurrent
                              ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 shadow-md shadow-amber-500/10'
                              : isPast
                                ? 'bg-slate-50/80 border-slate-200 opacity-55'
                                : 'bg-white/90 border-slate-200 hover:border-indigo-300 hover:shadow-md'
                          }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-black text-indigo-700">
                              {b.startTime} – {b.endTime} WIB
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
                              {targetRoom?.name || b.roomSlug}
                            </span>
                          </div>

                          {isOccupiedCurrent ? (
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
                              Berlangsung
                            </span>
                          ) : isStartingSoonCurrent ? (
                            <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 flex items-center gap-1">
                              <Clock size={11} className="animate-spin shrink-0" style={{ animationDuration: '4s' }} />
                              <span>Segera Dimulai</span>
                            </span>
                          ) : isPast ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                              Selesai
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
                              Terjadwal
                            </span>
                          )}
                        </div>

                        <div className="text-xs sm:text-sm font-bold text-slate-900 mt-1.5 line-clamp-1">
                          {b.title}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-600 mt-1.5 pt-1.5 border-t border-slate-200/60">
                          <span className="truncate max-w-[220px] font-medium">{b.organizerName}</span>
                          <span className="shrink-0 flex items-center gap-1 font-semibold text-slate-700">
                            <Users size={11} className="text-indigo-600" />
                            {b.attendeeCount} Org
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
                    <p className="text-xs sm:text-sm font-bold text-slate-700">
                      {selectedScheduleFilter === 'all'
                        ? 'Belum Ada Agenda Hari Ini'
                        : `Belum Ada Agenda untuk ${rooms.find((r) => r.slug === selectedScheduleFilter)?.name || 'Ruangan Ini'}`}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Ruangan bebas dan siap digunakan untuk rapat kedinasan.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center text-[10px] text-slate-500 font-semibold tracking-wider shrink-0">
                SIRAPAT • TATA USAHA SEKRETARIAT JENDERAL KEMNAKER RI
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER THEME 3: SMART FLIGHT-BOARD KIOSK (Dual-Tone Signage)
  // =========================================================================
  if (currentTheme === 'flightboard') {
    const auroraCfg = getAuroraStatusConfig();

    return (
      <div className="h-screen max-h-screen bg-slate-100 text-slate-900 flex flex-col justify-between font-sans select-none overflow-hidden p-3 sm:p-4 relative">
        <ThemeSwitcherPill />

        {/* Top Header */}
        <header className="flex items-center justify-between bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <KemnakerLogo size="md" subtitle="TU SEKJEN" />
            <div className="hidden md:block h-7 w-px bg-slate-200" />
            <div className="hidden md:block text-xs font-bold text-slate-800 uppercase">
              Flight Information Display System (FIDS) • Ruang Rapat
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-600">
                {format(currentTime, 'EEEE, d MMMM yyyy', { locale: idLocale })}
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-slate-900">
                {format(currentTime, 'HH:mm:ss')} WIB
              </div>
            </div>
            <BerakhlakBadge isLight />
          </div>
        </header>

        {/* Main Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 py-2.5 min-h-0">
          {/* Kolom Kiri: Ice-Blue Tone */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full gap-2.5 min-h-0">
            <div className="flex-1 bg-gradient-to-br from-sky-50 to-blue-100/80 border border-sky-200 rounded-xl p-4 flex flex-col justify-between shadow-xs min-h-0">
              <div className="border-b border-sky-200/80 pb-2.5 shrink-0">
                <div className="flex items-center justify-between text-xs font-bold text-sky-800">
                  <span>{currentRoom?.location}</span>
                  <span>Kapasitas: {currentRoom?.capacity} Org</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  {currentRoom?.name}
                </h1>

                {/* Tabs */}
                <div className="flex items-center gap-1 pt-2">
                  {rooms.map((r, idx) => (
                    <button
                      key={r.slug}
                      onClick={() => setCurrentRoomIndex(idx)}
                      className={`px-2.5 py-1 rounded text-xs font-bold ${idx === currentRoomIndex ? 'bg-sky-700 text-white' : 'bg-white/80 text-slate-700 hover:bg-white'
                        }`}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Huge Status Card */}
              <div className={`p-4 rounded-xl border-2 ${auroraCfg.bannerBg} my-2`}>
                <div className="flex items-center gap-3">
                  {auroraCfg.icon}
                  <div>
                    <div className="text-lg font-black uppercase">{auroraCfg.badgeText}</div>
                    <div className="text-xs mt-0.5">{auroraCfg.subText}</div>
                  </div>
                </div>
              </div>

              {/* Agenda Details */}
              <div className="bg-white/90 border border-sky-200 rounded-lg p-3 text-xs flex-1 flex flex-col justify-center min-h-0">
                {statusInfo.status === 'occupied' && statusInfo.activeBooking ? (
                  <div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-rose-600 text-white rounded">
                      Agenda Berlangsung
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5">{statusInfo.activeBooking.title}</h3>
                    <p className="text-slate-600 mt-1">
                      Waktu: <strong>{statusInfo.activeBooking.startTime} - {statusInfo.activeBooking.endTime} WIB</strong> • PIC: <strong>{statusInfo.activeBooking.organizerName}</strong>
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <CheckCircle2 size={24} className="text-emerald-600 mx-auto mb-1" />
                    <div className="font-bold text-slate-800">Ruangan Bebas Digunakan</div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick QR Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 shrink-0">
              <div className="p-1 bg-slate-50 border rounded-lg">
                <QRCodeDisplay value={quickBookUrl} size={64} />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-sky-700">Quick Reservation</div>
                <div className="text-xs font-bold text-slate-900">Pindai QR untuk Booking Langsung</div>
                <div className="text-[11px] text-slate-500">Gunakan kamera smartphone Anda.</div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: White Flight-Board Schedule */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between h-full min-h-0 shadow-xs">
            <div className="pb-2.5 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <CalendarCheck size={18} className="text-sky-700" />
                <h2 className="text-sm font-black uppercase text-slate-900">Jadwal Penerbangan Agenda Hari Ini</h2>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setSelectedScheduleFilter('all')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${selectedScheduleFilter === 'all' ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                >
                  Semua
                </button>
                {rooms.map((r) => (
                  <button
                    key={r.slug}
                    onClick={() => setSelectedScheduleFilter(r.slug)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${selectedScheduleFilter === r.slug ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-2 space-y-1.5 min-h-0">
              {filteredTodayBookings.length > 0 ? (
                filteredTodayBookings.map((b) => {
                  const targetRoom = rooms.find((r) => r.slug === b.roomSlug);
                  const roomStatus = getRoomRealTimeStatus(bookings, b.roomSlug, currentTime);
                  const isOccupiedCurrent = roomStatus.status === 'occupied' && roomStatus.activeBooking?.id === b.id;

                  return (
                    <div
                      key={b.id}
                      className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${isOccupiedCurrent ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-200'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sky-800 shrink-0">{b.startTime}-{b.endTime}</span>
                        <span className="px-2 py-0.5 rounded bg-white border font-bold text-slate-700 text-[10px] shrink-0">
                          {targetRoom?.name || b.roomSlug}
                        </span>
                        <span className="font-bold text-slate-900 truncate max-w-[200px]">{b.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">{b.organizerName}</span>
                        {isOccupiedCurrent ? (
                          <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px]">
                            LIVE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-semibold text-[10px]">
                            OK
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  Tidak ada agenda hari ini
                </div>
              )}
            </div>

            <div className="pt-2 border-t text-center text-[10px] text-slate-500 font-semibold shrink-0">
              SIRAPAT • TATA USAHA SEKRETARIAT JENDERAL KEMNAKER RI
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER THEME 4: CLASSIC DARK MODE
  // =========================================================================
  const darkStatusTheme = () => {
    switch (statusInfo.status) {
      case 'occupied':
        return {
          plateBg: 'bg-[#4C0519]',
          plateBorder: 'border-[#BE123C]',
          indicatorColor: 'bg-[#F43F5E]',
          titleColor: 'text-[#FFE4E6]',
          badgeText: 'SEDANG DIGUNAKAN',
          subText: `Rapat berlangsung hingga pukul ${statusInfo.activeBooking?.endTime || ''} WIB.`,
          icon: <Radio size={26} className="text-[#F43F5E] animate-pulse shrink-0" />,
        };
      case 'starting_soon':
        return {
          plateBg: 'bg-[#451A03]',
          plateBorder: 'border-[#D97706]',
          indicatorColor: 'bg-[#F59E0B]',
          titleColor: 'text-[#FEF3C7]',
          badgeText: 'SEGERA DIMULAI',
          subText: `Persiapan rapat pukul ${statusInfo.activeBooking?.startTime || ''} WIB.`,
          icon: <Clock size={26} className="text-[#F59E0B] animate-spin shrink-0" style={{ animationDuration: '4s' }} />,
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
            ? `Dapat digunakan hingga pukul ${statusInfo.nextBooking.startTime} WIB.`
            : 'Ruangan kosong dan siap digunakan untuk rapat kedinasan.',
          icon: <CheckCircle2 size={26} className="text-[#10B981] shrink-0" />,
        };
    }
  };

  const theme = darkStatusTheme();

  return (
    <div className="h-screen max-h-screen bg-[#0D192B] text-slate-100 flex flex-col justify-between font-sans select-none overflow-hidden p-4 sm:p-5 lg:p-6 relative">
      <ThemeSwitcherPill />

      {/* 1. TOP INSTITUTIONAL HEADER BAR */}
      <header className="flex items-center justify-between pb-3.5 border-b border-[#243C5E] shrink-0">
        <div className="flex items-center gap-4">
          <KemnakerLogo size="md" subtitle="TU SEKJEN" />
          <div className="hidden md:block h-8 w-px bg-[#243C5E]" />
          <div className="hidden md:block">
            <div className="text-xs font-bold text-slate-300 tracking-wide uppercase">
              Sistem Informasi Reservasi Ruang Rapat
            </div>
            <div className="text-[11px] text-slate-400">
              Sekretariat Jenderal Kementerian Ketenagakerjaan RI
            </div>
          </div>
        </div>

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

      {/* 2. MAIN 2-COLUMN VIEWPORT */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 py-3 min-h-0">
        <div className="lg:col-span-5 flex flex-col justify-between h-full gap-3 min-h-0">
          <div className="flex-1 flex flex-col justify-between bg-[#132238] border border-[#243C5E] rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden min-h-0">
            <div className="border-b border-[#243C5E] pb-3 shrink-0 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-sky-400 uppercase tracking-wider">
                  <Building size={14} className="shrink-0" />
                  <span>{currentRoom?.location || 'Gedung Kemnaker RI'}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#182C47] border border-[#243C5E] text-xs font-bold text-slate-300">
                  <Users size={13} className="text-sky-400" />
                  <span>Kapasitas: <strong className="text-white">{currentRoom?.capacity || 0} Orang</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  {currentRoom?.name || 'Memuat Ruangan...'}
                </h1>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
                {rooms.map((r, idx) => (
                  <button
                    key={r.slug}
                    onClick={() => setCurrentRoomIndex(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${idx === currentRoomIndex
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-[#182C47]'
                      }`}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>

            <div className={`p-3.5 rounded-xl border-2 ${theme.plateBorder} ${theme.plateBg} transition-colors duration-300 my-2.5 shrink-0`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="shrink-0">{theme.icon}</div>
                  <div>
                    <div className="text-base sm:text-lg font-black tracking-wide text-white uppercase leading-tight">
                      {theme.badgeText}
                    </div>
                    <div className={`text-xs font-medium mt-0.5 ${theme.titleColor}`}>
                      {theme.subText}
                    </div>
                  </div>
                </div>

                {statusInfo.status === 'occupied' && remainingTimeStr && (
                  <div className="flex flex-col items-end bg-black/40 border border-rose-500/40 px-2.5 py-1 rounded-lg shrink-0">
                    <span className="text-[10px] font-bold text-rose-300 uppercase">Sisa Waktu</span>
                    <span className="text-xs sm:text-sm font-black font-mono text-white">{remainingTimeStr}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 bg-[#182C47]/90 border border-[#243C5E] rounded-xl p-3.5 sm:p-4 flex flex-col justify-center min-h-0 overflow-y-auto">
              {statusInfo.status === 'occupied' && statusInfo.activeBooking ? (
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-600 text-white inline-flex items-center gap-1 shadow-sm">
                    <Radio size={11} className="animate-pulse" />
                    <span>Agenda Sedang Berlangsung</span>
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-white leading-snug line-clamp-2">
                    {statusInfo.activeBooking.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <div className="px-2.5 py-1 rounded-lg bg-[#132238] border border-[#243C5E] text-sky-300 font-mono font-bold">
                      {statusInfo.activeBooking.startTime} – {statusInfo.activeBooking.endTime} WIB
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-[#132238] border border-[#243C5E] text-slate-200">
                      PIC: <strong className="text-white font-bold">{statusInfo.activeBooking.organizerName}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 text-emerald-400">
                    <CheckCircle2 size={24} className="shrink-0" />
                    <div>
                      <div className="text-base sm:text-lg font-black text-white leading-tight">
                        Ruangan Bebas & Siap Digunakan
                      </div>
                      <div className="text-xs text-slate-300 font-medium mt-0.5">
                        Tidak ada agenda rapat kedinasan saat ini.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-2.5 bg-[#182C47]/80 border border-[#243C5E] rounded-xl shrink-0 mt-2.5">
              <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                <div className="flex items-center gap-1 text-slate-300">
                  <Trash2 size={11} className="text-emerald-400 shrink-0" />
                  <span className="truncate">Jaga Kebersihan</span>
                </div>
                <div className="flex items-center gap-1 text-slate-300">
                  <Power size={11} className="text-amber-400 shrink-0" />
                  <span className="truncate">Matikan AC & Lampu</span>
                </div>
                <div className="flex items-center gap-1 text-slate-300">
                  <Clock size={11} className="text-sky-400 shrink-0" />
                  <span className="truncate">Tepat Waktu</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#132238] border border-[#243C5E] rounded-2xl p-3.5 sm:p-4 flex items-center gap-4 shrink-0 shadow-xl">
            <div className="p-2 bg-white rounded-xl shadow-md shrink-0">
              <QRCodeDisplay value={quickBookUrl} size={82} />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-sky-400 uppercase tracking-wider">
                <QrCode size={13} />
                <span>Pesan Cepat via Smartphone</span>
              </div>
              <h3 className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                Pindai QR untuk Reservasi Langsung
              </h3>
            </div>
          </div>
        </div>

        {/* Kolom Kanan */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full gap-3 min-h-0">
          <div className="grid grid-cols-3 gap-3 shrink-0">
            {rooms.slice(0, 3).map((room, rIdx) => {
              const rImages = getRoomImages(room);
              const isSelected = rIdx === currentRoomIndex;
              const rStatus = getRoomStatusBadge(room.slug);

              return (
                <div
                  key={room.id}
                  onClick={() => setCurrentRoomIndex(rIdx)}
                  className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-300 shadow-lg select-none h-32 sm:h-36 flex flex-col justify-between ${isSelected
                      ? 'border-sky-400 ring-2 ring-sky-400/50 shadow-sky-500/20 scale-[1.02]'
                      : 'border-[#243C5E] hover:border-sky-500/60 opacity-85 hover:opacity-100'
                    }`}
                >
                  <img
                    src={rImages[0]}
                    alt={room.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40 pointer-events-none" />

                  <div className="relative z-10 p-2 flex items-center justify-between">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${rStatus.bgLight} shadow-md flex items-center gap-1`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${rStatus.dot}`} />
                      <span>{rStatus.label}</span>
                    </span>
                  </div>

                  <div className="relative z-10 p-2.5">
                    <div className="text-xs sm:text-sm font-black text-white leading-tight drop-shadow-md line-clamp-1">
                      {room.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex-1 bg-[#132238] border border-[#243C5E] rounded-2xl p-4 sm:p-5 flex flex-col justify-between min-h-0 shadow-xl overflow-hidden">
            <div className="pb-3 border-b border-[#243C5E] shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarCheck size={18} className="text-sky-400" />
                <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                  Jadwal Agenda Hari Ini
                </h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 bg-[#182C47] border border-[#243C5E] text-slate-200 rounded-md">
                {filteredTodayBookings.length} Agenda
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 py-2.5 pr-1 min-h-0">
              {filteredTodayBookings.length > 0 ? (
                filteredTodayBookings.map((b) => (
                  <div key={b.id} className="p-3 rounded-xl border bg-[#182C47] border-[#243C5E]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-black text-sky-400">{b.startTime} - {b.endTime} WIB</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">Terjadwal</span>
                    </div>
                    <div className="text-xs font-bold text-white mt-1">{b.title}</div>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  Belum Ada Agenda Hari Ini
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#243C5E] text-center text-[10px] text-slate-400 font-semibold tracking-wider shrink-0">
              SIRAPAT • TATA USAHA SEKRETARIAT JENDERAL KEMNAKER RI
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
