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
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import { QRCodeDisplay } from '../components/common/QRCodeDisplay';
import { KemnakerLogo } from '../components/common/Logo';

export const DisplayRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId?: string }>();
  const { rooms, bookings, currentTime } = useBooking();

  // Selected active room index (default 0 or from URL param)
  const [currentRoomIndex, setCurrentRoomIndex] = useState<number>(0);
  const [isAutoSlidePlaying, setIsAutoSlidePlaying] = useState<boolean>(true);
  const slideDurationSec = 12;
  const initialRoomSetRef = React.useRef<boolean>(false);

  // Filter jadwal di kolom kanan bawah: 'all' atau room slug
  const [selectedScheduleFilter, setSelectedScheduleFilter] = useState<string>('all');

  // Lightbox state for viewing full photos
  const [lightboxRoomIndex, setLightboxRoomIndex] = useState<number | null>(null);
  const [lightboxPhotoIndex, setLightboxPhotoIndex] = useState<number>(0);

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

  // Status Visual Palette
  const getStatusTheme = () => {
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

  const theme = getStatusTheme();

  // List booking hari ini terfilter (Kolom Kanan Bawah)
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
      return { label: 'Terpakai', color: 'bg-rose-500 text-white', dot: 'bg-rose-400 animate-pulse' };
    }
    if (s.status === 'starting_soon') {
      return { label: 'Persiapan', color: 'bg-amber-500 text-white', dot: 'bg-amber-400 animate-ping' };
    }
    return { label: 'Tersedia', color: 'bg-emerald-600 text-white', dot: 'bg-emerald-400' };
  };

  // Badge BerAKHLAK Resmi
  const BerakhlakBadge: React.FC = () => (
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
              Sistem Informasi Reservasi Ruang Rapat
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

      {/* 2. MAIN 2-COLUMN VIEWPORT (LAYOUT SESUAI SKETSA) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 py-3 min-h-0">
        {/* ========================================================================= */}
        {/* KOLOM KIRI (5 / 12 Cols): STATUS RUANGAN (TANPA FOTO & TANPA FASILITAS) + SCAN QR */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full gap-3 min-h-0">
          {/* Card Atas Kiri: Room Info & Realtime Status Plate */}
          <div className="flex-1 flex flex-col justify-between bg-[#132238] border border-[#243C5E] rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden min-h-0">
            {/* Header: Lokasi, Nama Ruangan, Kapasitas & Navigasi */}
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

              {/* Room Quick Switcher Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
                {rooms.map((r, idx) => (
                  <button
                    key={r.slug}
                    onClick={() => setCurrentRoomIndex(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      idx === currentRoomIndex
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-[#182C47]'
                    }`}
                  >
                    {r.name}
                  </button>
                ))}
                {rooms.length > 1 && (
                  <button
                    onClick={() => setIsAutoSlidePlaying((prev) => !prev)}
                    className={`ml-auto flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md border shrink-0 transition-all ${
                      isAutoSlidePlaying
                        ? 'bg-sky-500/10 border-sky-500/40 text-sky-300'
                        : 'bg-[#182C47] border-[#243C5E] text-slate-400'
                    }`}
                    title={isAutoSlidePlaying ? 'Jeda Auto-Slide' : 'Putar Auto-Slide'}
                  >
                    {isAutoSlidePlaying ? <Pause size={11} /> : <Play size={11} />}
                    <span>{isAutoSlidePlaying ? 'Auto' : 'Jeda'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Massive Status Plate */}
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

            {/* Middle: Active Agenda / Next Agenda / Ready Details Card (Tanpa Foto di background) */}
            <div className="flex-1 bg-[#182C47]/90 border border-[#243C5E] rounded-xl p-3.5 sm:p-4 flex flex-col justify-center min-h-0 overflow-y-auto">
              {statusInfo.status === 'occupied' && statusInfo.activeBooking ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-600 text-white flex items-center gap-1 shadow-sm">
                      <Radio size={11} className="animate-pulse" />
                      <span>Agenda Sedang Berlangsung</span>
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-black text-white leading-snug line-clamp-2">
                    {statusInfo.activeBooking.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <div className="px-2.5 py-1 rounded-lg bg-[#132238] border border-[#243C5E] text-sky-300 font-mono font-bold flex items-center gap-1.5">
                      <Clock size={12} className="text-sky-300" />
                      <span>{statusInfo.activeBooking.startTime} – {statusInfo.activeBooking.endTime} WIB</span>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-[#132238] border border-[#243C5E] text-slate-200 font-semibold">
                      PIC: <strong className="text-white font-bold">{statusInfo.activeBooking.organizerName}</strong>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-[#132238] border border-[#243C5E] text-slate-200 font-semibold flex items-center gap-1.5">
                      <Users size={12} className="text-sky-300" />
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

                  <h2 className="text-lg sm:text-xl font-black text-white leading-snug line-clamp-2">
                    {statusInfo.activeBooking.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <div className="px-2.5 py-1 rounded-lg bg-[#132238] border border-[#243C5E] text-amber-300 font-mono font-bold">
                      Pukul {statusInfo.activeBooking.startTime} WIB
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-[#132238] border border-[#243C5E] text-slate-200 font-semibold">
                      PIC: <strong className="text-white font-bold">{statusInfo.activeBooking.organizerName}</strong>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-[#132238] border border-[#243C5E] text-slate-200 font-semibold flex items-center gap-1.5">
                      <Users size={12} className="text-amber-300" />
                      <span>{statusInfo.activeBooking.attendeeCount} Orang</span>
                    </div>
                  </div>
                </div>
              ) : statusInfo.nextBooking ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-sky-400">
                    <Info size={13} />
                    <span>Agenda Berikutnya:</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-white line-clamp-2">
                    {statusInfo.nextBooking.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-white">
                    <span className="font-mono font-bold text-sky-300 bg-[#132238] px-2.5 py-1 rounded-md border border-[#243C5E]">
                      {statusInfo.nextBooking.startTime} – {statusInfo.nextBooking.endTime} WIB
                    </span>
                    <span className="bg-[#132238] px-2.5 py-1 rounded-md border border-[#243C5E] font-semibold text-slate-200">
                      PIC: {statusInfo.nextBooking.organizerName}
                    </span>
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
                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    {currentRoom?.description || 'Ruang rapat eksekutif representatif untuk pertemuan dan koordinasi strategis pimpinan.'}
                  </p>
                </div>
              )}
            </div>

            {/* Tata Tertib & Himbauan Ruang Rapat */}
            <div className="p-2.5 bg-[#182C47]/80 border border-[#243C5E] rounded-xl shrink-0 mt-2.5">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-400 mb-1">
                <ShieldCheck size={12} className="shrink-0" />
                <span>Tata Tertib & Himbauan:</span>
              </div>
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

          {/* Card Bawah Kiri: Scan QR Code */}
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
              <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                Scan dengan kamera ponsel untuk mengajukan peminjaman <strong>{currentRoom?.name}</strong> secara instan.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* KOLOM KANAN (7 / 12 Cols): 3 FOTO RUANGAN DI ATAS + JADWAL AGENDA DI BAWAH */}
        {/* ========================================================================= */}
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
                  className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-300 shadow-lg select-none h-32 sm:h-36 flex flex-col justify-between ${
                    isSelected
                      ? 'border-sky-400 ring-2 ring-sky-400/50 shadow-sky-500/20 scale-[1.02]'
                      : 'border-[#243C5E] hover:border-sky-500/60 opacity-85 hover:opacity-100'
                  }`}
                >
                  {/* Foto Ruangan */}
                  <img
                    src={rImages[0]}
                    alt={room.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80';
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40 pointer-events-none" />

                  {/* Top Bar inside thumbnail */}
                  <div className="relative z-10 p-2 flex items-center justify-between">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${rStatus.color} shadow-md flex items-center gap-1`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${rStatus.dot}`} />
                      <span>{rStatus.label}</span>
                    </span>

                    {/* Button Lightbox View */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxRoomIndex(rIdx);
                        setLightboxPhotoIndex(0);
                      }}
                      className="p-1 rounded-md bg-black/50 hover:bg-sky-600 text-white backdrop-blur-sm transition-all border border-white/20"
                      title="Lihat Galeri Foto"
                    >
                      <Maximize2 size={11} />
                    </button>
                  </div>

                  {/* Bottom Room Label */}
                  <div className="relative z-10 p-2.5">
                    <div className="text-xs sm:text-sm font-black text-white leading-tight drop-shadow-md line-clamp-1">
                      {room.name}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-300 font-semibold mt-0.5">
                      <span>{room.capacity} Org</span>
                      {isSelected && (
                        <span className="text-[9px] font-bold text-sky-300 bg-sky-950/80 border border-sky-400/50 px-1.5 py-0.2 rounded">
                          Aktif
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* BAGIAN BAWAH KANAN: JADWAL AGENDA HARI INI DENGAN TAB FILTER NAMA RUANGAN */}
          <div className="flex-1 bg-[#132238] border border-[#243C5E] rounded-2xl p-4 sm:p-5 flex flex-col justify-between min-h-0 shadow-xl overflow-hidden">
            {/* Header & Tabs Filter Nama Ruangan */}
            <div className="pb-3 border-b border-[#243C5E] shrink-0 space-y-2.5">
              <div className="flex items-center justify-between">
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

              {/* Tabs Nama Ruangan (Sesuai Sketsa: Panah Nama Ruangan) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedScheduleFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    selectedScheduleFilter === 'all'
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'bg-[#182C47] text-slate-300 hover:text-white hover:bg-[#203654] border border-[#243C5E]'
                  }`}
                >
                  <Layers size={12} />
                  <span>Semua Ruangan</span>
                </button>

                {rooms.map((r) => (
                  <button
                    key={r.slug}
                    onClick={() => setSelectedScheduleFilter(r.slug)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      selectedScheduleFilter === r.slug
                        ? 'bg-sky-600 text-white shadow-md'
                        : 'bg-[#182C47] text-slate-300 hover:text-white hover:bg-[#203654] border border-[#243C5E]'
                    }`}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>

            {/* List Flight-Board Agenda Hari Ini */}
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
                      className={`p-3 rounded-xl border transition-all ${
                        isOccupiedCurrent
                          ? 'bg-[#4C0519]/70 border-[#E11D48] shadow-md'
                          : isStartingSoonCurrent
                          ? 'bg-[#451A03]/70 border-[#F59E0B] shadow-md'
                          : isPast
                          ? 'bg-[#0F1A2A]/50 border-[#1E324D]/60 opacity-45'
                          : 'bg-[#182C47] border-[#243C5E] hover:border-[#385987]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        {/* Waktu & Nama Ruangan Tag */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black text-sky-400">
                            {b.startTime} – {b.endTime} WIB
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#132238] border border-[#243C5E] text-slate-300">
                            {targetRoom?.name || b.roomSlug}
                          </span>
                        </div>

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

                      {/* Judul Agenda Rapat */}
                      <div className="text-xs sm:text-sm font-bold text-white mt-1.5 line-clamp-1">
                        {b.title}
                      </div>

                      {/* Penyelenggara & Peserta */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 pt-1.5 border-t border-white/5">
                        <span className="truncate max-w-[220px] text-slate-300">{b.organizerName}</span>
                        <span className="shrink-0 flex items-center gap-1 font-semibold text-slate-300">
                          <Users size={11} className="text-sky-400" />
                          {b.attendeeCount} Org
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <CheckCircle2 size={32} className="text-emerald-400 mb-2" />
                  <p className="text-xs sm:text-sm font-bold text-slate-200">
                    {selectedScheduleFilter === 'all'
                      ? 'Belum Ada Agenda Hari Ini'
                      : `Belum Ada Agenda untuk ${rooms.find((r) => r.slug === selectedScheduleFilter)?.name || 'Ruangan Ini'}`}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Ruangan bebas dan siap digunakan untuk rapat kedinasan.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Institutional Footer */}
            <div className="pt-2 border-t border-[#243C5E] text-center text-[10px] text-slate-400 font-semibold tracking-wider shrink-0">
              SIRAPAT • TATA USAHA SEKRETARIAT JENDERAL KEMNAKER RI
            </div>
          </div>
        </div>
      </div>

      {/* 3. LIGHTBOX MODAL FULLSCREEN FOTO RUANGAN */}
      {lightboxRoomIndex !== null && rooms[lightboxRoomIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200"
          onClick={() => setLightboxRoomIndex(null)}
        >
          {/* Lightbox Top Header */}
          <div
            className="flex items-center justify-between text-white shrink-0 pb-3 border-b border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="text-sky-400" />
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">{rooms[lightboxRoomIndex].name}</h3>
                <p className="text-xs text-slate-300">
                  {rooms[lightboxRoomIndex].location} • Foto {lightboxPhotoIndex + 1} dari{' '}
                  {getRoomImages(rooms[lightboxRoomIndex]).length}
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

          {/* Lightbox Main Image & Navigation */}
          <div
            className="flex-1 flex items-center justify-center relative py-4 min-h-0"
            onClick={(e) => e.stopPropagation()}
          >
            {getRoomImages(rooms[lightboxRoomIndex]).length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setLightboxPhotoIndex(
                    (prev) =>
                      (prev - 1 + getRoomImages(rooms[lightboxRoomIndex]).length) %
                      getRoomImages(rooms[lightboxRoomIndex]).length
                  )
                }
                className="absolute left-2 sm:left-6 z-10 p-3.5 rounded-full bg-black/70 hover:bg-sky-600 text-white transition-all border border-white/20 shadow-2xl"
                title="Foto Sebelumnya"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            <img
              src={getRoomImages(rooms[lightboxRoomIndex])[lightboxPhotoIndex % getRoomImages(rooms[lightboxRoomIndex]).length]}
              alt={rooms[lightboxRoomIndex].name}
              className="max-h-[72vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/20 transition-all duration-300"
            />

            {getRoomImages(rooms[lightboxRoomIndex]).length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setLightboxPhotoIndex((prev) => (prev + 1) % getRoomImages(rooms[lightboxRoomIndex]).length)
                }
                className="absolute right-2 sm:right-6 z-10 p-3.5 rounded-full bg-black/70 hover:bg-sky-600 text-white transition-all border border-white/20 shadow-2xl"
                title="Foto Selanjutnya"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {/* Lightbox Thumbnails Strip */}
          {getRoomImages(rooms[lightboxRoomIndex]).length > 1 && (
            <div
              className="flex items-center justify-center gap-2.5 pt-3 border-t border-white/10 overflow-x-auto shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {getRoomImages(rooms[lightboxRoomIndex]).map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setLightboxPhotoIndex(idx)}
                  className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    idx === lightboxPhotoIndex % getRoomImages(rooms[lightboxRoomIndex]).length
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
