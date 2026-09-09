import React, { useState, useEffect } from 'react';
import { Room, Booking, ActivityLog } from '../types';
import { 
  Tv, 
  Clock, 
  Building, 
  QrCode, 
  ExternalLink, 
  CheckCircle2,
  Maximize2,
  Calendar,
  ScanLine,
  X,
  Sparkles,
  ShieldCheck,
  Check,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { isOverlapping } from '../data/initialData';

interface KioskViewProps {
  rooms: Room[];
  bookings: Booking[];
  onScanBookingClick: (roomId: string) => void;
  onUpdateBooking?: (booking: Booking, log: ActivityLog) => void;
}

export const KioskView: React.FC<KioskViewProps> = ({
  rooms,
  bookings,
  onScanBookingClick,
  onUpdateBooking,
}) => {
  const [activeRoomId, setActiveRoomId] = useState<string>('vip');
  const [clock, setClock] = useState<string>('');
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('14:32');
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [scanInputCode, setScanInputCode] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<{ type: 'success' | 'error'; message: string; booking?: Booking } | null>(null);
  const [activeCheckinOverrideId, setActiveCheckinOverrideId] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setClock(`${h}:${m}:${s}`);
      setCurrentTimeStr(`${h}:${m}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];

  // Today's bookings for this room
  const todayBookings = bookings.filter(
    (b) => b.roomId === activeRoom.id && b.status !== 'cancelled'
  );

  // Check if room is currently occupied (e.g. simulated around 14:00 - 15:30 or checked-in override)
  const currentMeeting = todayBookings.find(
    (b) => b.id === activeCheckinOverrideId || b.status === 'in-progress' || isOverlapping('14:00', '14:45', b.startTime, b.endTime)
  );

  const isOccupied = Boolean(currentMeeting);

  // Next meeting
  const upcomingMeetings = todayBookings.filter(
    (b) => b.startTime >= '15:00'
  );
  const nextMeeting = upcomingMeetings[0];

  const handleCheckInByCode = (code: string) => {
    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setIsScanning(false);
      const clean = code.trim().toUpperCase();
      const found = todayBookings.find(
        (b) =>
          b.bookingCode.toUpperCase() === clean ||
          b.manageToken.toUpperCase() === clean ||
          clean.includes(b.bookingCode.toUpperCase())
      );

      if (found) {
        setActiveCheckinOverrideId(found.id);
        const updatedBooking: Booking = { ...found, status: 'in-progress' };
        if (onUpdateBooking) {
          const log: ActivityLog = {
            id: `log-kiosk-${Date.now()}`,
            timestamp: new Date().toISOString(),
            actor: found.bookerName,
            division: found.division,
            action: 'modified',
            roomName: activeRoom.name,
            bookingCode: found.bookingCode,
            googleSyncId: found.googleEventId,
            details: `Check-in tamu fisik berhasil diverifikasi via Kiosk Plakat Bilik ${activeRoom.name}.`,
          };
          onUpdateBooking(updatedBooking, log);
        }
        setScanResult({
          type: 'success',
          message: `Check-in Berhasil! Akses bilik ${activeRoom.name} terbuka untuk sesi: "${found.meetingTitle}".`,
          booking: found,
        });
      } else {
        setScanResult({
          type: 'error',
          message: `Kode booking "${clean}" tidak terdaftar untuk bilik ${activeRoom.name} hari ini. Harap periksa kembali slip voucher Anda.`,
        });
      }
    }, 650);
  };

  const handleEndMeetingEarly = () => {
    if (currentMeeting) {
      const updatedBooking: Booking = { ...currentMeeting, status: 'completed' };
      setActiveCheckinOverrideId(null);
      if (onUpdateBooking) {
        const log: ActivityLog = {
          id: `log-kiosk-checkout-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: currentMeeting.bookerName,
          division: currentMeeting.division,
          action: 'modified',
          roomName: activeRoom.name,
          bookingCode: currentMeeting.bookingCode,
          googleSyncId: currentMeeting.googleEventId,
          details: `Sesi rapat "${currentMeeting.meetingTitle}" diakhiri lebih awal dari Kiosk Display. Bilik telah dikosongkan.`,
        };
        onUpdateBooking(updatedBooking, log);
      }
    }
  };

  return (
    <div className="w-full bg-[#101215] text-[#F1ECDF] min-h-screen flex flex-col justify-between py-6 px-4 md:px-8 select-none">
      {/* Top Room Selector & Mode Switcher */}
      <div className="max-w-6xl mx-auto w-full mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[#8A857B] font-medium">Pilih Tampilan Monitor Bilik:</span>
          <div className="inline-flex bg-[#1E2328] p-1 rounded border border-[#55524A]/30">
            {rooms.map((r) => (
              <button
                key={r.id}
                onClick={() => setActiveRoomId(r.id)}
                className={`px-3 py-1 rounded transition-colors ${
                  activeRoomId === r.id
                    ? 'bg-[#A9822D] text-[#16191C] font-semibold shadow-xs'
                    : 'text-[#8A857B] hover:text-[#F1ECDF]'
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-[#8A857B]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#26392E] animate-pulse"></span>
            <span>Google Workspace Calendar Lock</span>
          </span>
          <span>•</span>
          <span>Mode Monitor Kiosk Display (1080p / 16:9)</span>
        </div>
      </div>

      {/* Main Kiosk Physical Plaque Frame (as in mockup 5 & mockup 7) */}
      <div className="relative max-w-6xl mx-auto w-full bg-[#16191C] border border-[#A9822D]/35 p-6 md:p-10 shadow-[0_0_40px_rgba(0,0,0,0.8)] rounded-xs overflow-hidden flex-1 flex flex-col justify-between">
        {/* Subtle Ambient Radial Highlight */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_rgba(169,130,45,0.06)_0%,transparent_70%)]"></div>
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#A9822D]/60 to-transparent"></div>

        {/* 1. Kiosk Top Bar */}
        <header className="relative z-10 flex items-center justify-between pb-5 border-b border-[#55524A]/30">
          <div className="flex items-center space-x-3.5">
            <div className="w-8 h-8 border border-[#A9822D]/60 flex items-center justify-center text-[#A9822D] bg-[#101215]">
              <Building className="w-4 h-4 text-[#A9822D]" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-[#A9822D] font-medium">
                Bilik Concierge • {activeRoom.location}
              </div>
              <p className="text-[11px] text-[#8A857B] tracking-wide mt-0.5">
                Resource ID: <code className="text-[#F1ECDF]/80 font-mono">{activeRoom.googleCalendarId}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-right">
            <div className="hidden sm:flex items-center space-x-2 bg-[#101215] px-3 py-1 border border-[#55524A]/25 rounded-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] tracking-wider text-[#F1ECDF]/90 font-medium uppercase">
                Live Google Workspace Lock
              </span>
            </div>

            <div>
              <div className="text-2xl md:text-3xl font-medium tracking-tight font-mono text-[#F1ECDF]">
                {clock || '14:32:00'}
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#8A857B] mt-0.5">
                Kamis, 10 Sep 2026
              </div>
            </div>
          </div>
        </header>

        {/* 2. Main Plaque Center Content */}
        <main className="relative z-10 my-6 md:my-8 flex flex-col justify-center items-center text-center max-w-4xl mx-auto w-full">
          {/* Subtitle & Room Name */}
          <div className="mb-4">
            <span className="text-[11px] uppercase tracking-[0.3em] text-[#A9822D] font-medium block mb-1">
              Plakat Bilik Rapat Eksekutif
            </span>
            <h1 className="font-serif-title text-4xl sm:text-6xl md:text-7xl font-light tracking-wide text-[#F1ECDF]">
              {activeRoom.name}
            </h1>

            {/* Room Specs */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-2.5 text-xs text-[#8A857B] tracking-wide">
              <span className="font-medium text-[#F1ECDF]">Kapasitas {activeRoom.capacity} Orang</span>
              {activeRoom.facilities.map((fac) => (
                <React.Fragment key={fac}>
                  <span className="text-[#A9822D]/50">|</span>
                  <span>{fac}</span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Solid Color Status Banner (Bordeaux #6B2A2E for Occupied, Bottle #26392E for Available) */}
          <div
            className={`w-full py-7 px-6 md:px-12 rounded-xs shadow-2xl relative overflow-hidden text-center my-3 transition-colors duration-700 border-y ${
              isOccupied
                ? 'bg-[#6B2A2E] border-[#8A373C] text-[#F1ECDF]'
                : 'bg-[#26392E] border-[#365142] text-[#F1ECDF]'
            }`}
          >
            <div className="relative z-10 flex flex-col items-center justify-center">
              {/* Status Badge */}
              <div className="flex items-center space-x-2 mb-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isOccupied ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'
                  }`}
                ></span>
                <span className="text-xs md:text-sm tracking-[0.25em] uppercase font-semibold text-[#F1ECDF]/90">
                  {isOccupied ? 'Sedang Digunakan' : 'Tersedia Sekarang'}
                </span>
              </div>

              {/* Headline */}
              <h2 className="font-serif-title text-2xl sm:text-3xl md:text-4xl text-[#F1ECDF] font-normal tracking-tight max-w-2xl leading-snug">
                {isOccupied
                  ? `“${currentMeeting?.meetingTitle}”`
                  : '“Bilik Bebas & Siap Digunakan”'}
              </h2>

              {/* Sub-info */}
              {isOccupied && currentMeeting ? (
                <div className="mt-3 flex flex-col items-center gap-2.5">
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs md:text-sm text-[#F1ECDF]/80 font-light">
                    <span className="font-medium text-[#F1ECDF]">{currentMeeting.bookerName}</span>
                    <span className="text-[#F1ECDF]/40">|</span>
                    <span>{currentMeeting.division}</span>
                    <span className="text-[#F1ECDF]/40">|</span>
                    <span className="font-mono text-[#F1ECDF] font-medium">
                      {currentMeeting.startTime} – {currentMeeting.endTime} WIB
                    </span>
                    <span className="text-[#F1ECDF]/40">|</span>
                    <span className="text-amber-200 font-medium">Kode: {currentMeeting.bookingCode}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleEndMeetingEarly}
                    className="mt-1 px-3.5 py-1.5 bg-[#101215]/80 hover:bg-[#101215] text-[#F1ECDF] text-xs rounded border border-[#A9822D]/60 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    title="Klik untuk menyelesaikan sesi rapat dan mengosongkan bilik"
                  >
                    <LogOut className="w-3.5 h-3.5 text-[#A9822D]" />
                    <span>Akhiri Sesi Rapat Lebih Awal (Lepaskan Bilik)</span>
                  </button>
                </div>
              ) : (
                <p className="text-xs md:text-sm text-[#F1ECDF]/80 mt-2 max-w-lg">
                  Tidak ada sesi rapat terjadwal saat ini. Dapat langsung dipesan atau lakukan check-in via kode QR di bawah.
                </p>
              )}
            </div>
          </div>

          {/* Next Availability Note */}
          <div className="text-center mt-2 mb-4 text-xs md:text-sm text-[#8A857B]">
            {isOccupied && currentMeeting ? (
              <span>
                Tersedia kembali mulai pukul{' '}
                <strong className="font-serif-title text-base font-normal text-[#F1ECDF] font-mono ml-1">
                  {currentMeeting.endTime} WIB
                </strong>
              </span>
            ) : nextMeeting ? (
              <span>
                Sesi terjadwal berikutnya: pukul{' '}
                <strong className="font-mono text-[#F1ECDF] font-medium">{nextMeeting.startTime} WIB</strong> (
                {nextMeeting.meetingTitle})
              </span>
            ) : (
              <span>Bilik kosong bebas sepanjang hari.</span>
            )}
          </div>
        </main>

        {/* 3. Kiosk Bottom Grid: Today's Agenda & Scan-To-Book QR Plaque */}
        <footer className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-end pt-5 border-t border-[#55524A]/25">
          {/* Agenda List (7 Cols) */}
          <div className="md:col-span-7 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#A9822D] font-medium">
                Agenda Rapat Hari Ini • 10 September 2026
              </span>
              <span className="text-[11px] text-[#8A857B] font-mono">{todayBookings.length} Sesi Terdaftar</span>
            </div>

            <div className="divide-y divide-[#55524A]/20 border border-[#55524A]/25 bg-[#101215]/80 text-xs max-h-40 overflow-y-auto">
              {todayBookings.length === 0 ? (
                <div className="py-4 text-center text-[#8A857B] text-xs">
                  Tidak ada agenda rapat terjadwal untuk bilik ini hari ini.
                </div>
              ) : (
                todayBookings.map((b) => {
                  const isMeetingActive = b.id === currentMeeting?.id;
                  const isPast = b.status === 'completed' || b.endTime <= '12:00';

                  return (
                    <div
                      key={b.id}
                      className={`flex items-center justify-between px-3.5 py-2 transition-colors ${
                        isMeetingActive
                          ? 'bg-[#1E2328] border-l-2 border-[#A9822D] text-[#F1ECDF]'
                          : isPast
                          ? 'opacity-40 line-through text-[#8A857B]'
                          : 'text-[#F1ECDF]/80 hover:bg-[#1E2328]/40'
                      }`}
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <span className="font-mono text-[11px] w-24 text-[#8A857B] shrink-0">
                          {b.startTime} – {b.endTime}
                        </span>
                        <span className="font-medium truncate max-w-xs">{b.meetingTitle}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] uppercase tracking-wider font-semibold ${
                            isMeetingActive
                              ? 'text-[#A9822D]'
                              : isPast
                              ? 'text-[#8A857B]'
                              : 'text-[#059669] font-medium'
                          }`}
                        >
                          {isMeetingActive ? '● Sedang Berjalan' : isPast ? 'Selesai' : 'Akan Datang'}
                        </span>

                        {!isMeetingActive && !isPast && (
                          <button
                            type="button"
                            onClick={() => handleCheckInByCode(b.bookingCode)}
                            className="px-2 py-0.5 bg-[#A9822D]/20 hover:bg-[#A9822D]/40 text-[#F1ECDF] text-[10px] rounded border border-[#A9822D]/50 transition-colors cursor-pointer"
                            title="Check-in Cepat"
                          >
                            Check-in
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* QR Actions Plaque (5 Cols) */}
          <div className="md:col-span-5 bg-[#181C20] border border-[#55524A]/30 p-3.5 flex flex-col gap-3 rounded-xs">
            <div className="flex items-center space-x-3.5">
              {/* Crisp QR Code with Quiet-Zone */}
              <div 
                onClick={() => onScanBookingClick(activeRoom.id)}
                className="bg-[#F1ECDF] p-2 rounded-xs shrink-0 cursor-pointer shadow-md hover:scale-105 transition-transform"
                title="Klik untuk mensimulasikan scan QR dari ponsel"
              >
                <svg className="w-14 h-14 text-[#16191C]" viewBox="0 0 100 100" fill="currentColor">
                  <rect x="0" y="0" width="30" height="30" />
                  <rect x="4" y="4" width="22" height="22" fill="#F1ECDF" />
                  <rect x="8" y="8" width="14" height="14" />
                  <rect x="70" y="0" width="30" height="30" />
                  <rect x="74" y="4" width="22" height="22" fill="#F1ECDF" />
                  <rect x="78" y="8" width="14" height="14" />
                  <rect x="0" y="70" width="30" height="30" />
                  <rect x="4" y="74" width="22" height="22" fill="#F1ECDF" />
                  <rect x="8" y="78" width="14" height="14" />
                  <rect x="40" y="40" width="20" height="20" />
                  <rect x="36" y="8" width="8" height="8" />
                  <rect x="12" y="40" width="8" height="8" />
                  <rect x="80" y="40" width="8" height="8" />
                  <rect x="40" y="76" width="8" height="8" />
                </svg>
              </div>

              <div className="text-left flex-1">
                <div className="text-xs font-semibold text-[#F1ECDF] flex items-center justify-between">
                  <span>Pindai untuk Pesan</span>
                  <span className="text-[10px] text-[#A9822D] uppercase font-mono">Scan HP</span>
                </div>
                <p className="text-[11px] text-[#8A857B] leading-snug mt-1">
                  Reservasi kilat dari ponsel tanpa login ke bilik {activeRoom.name}.
                </p>
                <button
                  type="button"
                  onClick={() => onScanBookingClick(activeRoom.id)}
                  className="mt-1 text-[11px] text-[#A9822D] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <span>Buka Form Booking Kilat</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Check-In QR Button */}
            <div className="pt-2 border-t border-[#55524A]/25">
              <button
                type="button"
                onClick={() => {
                  setIsScannerOpen(true);
                  setScanResult(null);
                  setScanInputCode('');
                }}
                className="w-full py-2 px-3 bg-[#A9822D]/20 hover:bg-[#A9822D]/30 border border-[#A9822D]/50 text-[#F1ECDF] text-xs rounded flex items-center justify-center gap-2 font-medium transition-colors cursor-pointer shadow-sm"
              >
                <ScanLine className="w-4 h-4 text-[#A9822D]" />
                <span>Pindai QR Voucher / Check-In Fisik</span>
              </button>
            </div>
          </div>
        </footer>

        {/* Kiosk Bottom Device Status */}
        <div className="relative z-10 pt-3 mt-4 border-t border-[#55524A]/15 flex items-center justify-between text-[11px] text-[#8A857B]">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A9822D]"></span>
            <span>Mode Plakat Display Kiosk Pintu • Auto-Refresh 30 Detik</span>
          </div>
          <span>ID Bilik: RM-{activeRoom.id.toUpperCase()}-01</span>
        </div>
      </div>

      {/* Interactive Check-In Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#16191C] border border-[#A9822D]/50 text-[#F1ECDF] max-w-lg w-full rounded p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsScannerOpen(false)}
              className="absolute top-4 right-4 text-[#8A857B] hover:text-[#F1ECDF] transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 text-[#A9822D] text-xs font-semibold uppercase tracking-wider mb-2">
              <ScanLine className="w-4 h-4" />
              <span>Pemindai QR Pass Check-In Kiosk</span>
            </div>

            <h3 className="font-serif-title text-xl text-[#F1ECDF] mb-1">
              Verifikasi Kehadiran • Bilik {activeRoom.name}
            </h3>
            <p className="text-xs text-[#8A857B] mb-5">
              Arahkan QR Code pada Slip Voucher fisik atau digital Anda ke lensa pemindai plakat bilik rapat.
            </p>

            {/* Simulated Optical Viewfinder */}
            <div className="relative bg-[#101215] border border-[#55524A]/40 rounded p-6 flex flex-col items-center justify-center mb-5 overflow-hidden min-h-[160px]">
              <div className="relative w-36 h-36 border-2 border-dashed border-[#A9822D]/60 rounded-xs flex items-center justify-center">
                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#A9822D]"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#A9822D]"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#A9822D]"></div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#A9822D]"></div>

                <QrCode className="w-16 h-16 text-[#8A857B]/40" />

                {/* Laser scan line effect */}
                <div className="absolute inset-x-0 h-0.5 bg-[#A9822D] shadow-[0_0_8px_#A9822D] animate-bounce top-1/2"></div>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-[#8A857B] mt-3 font-mono">
                Sensor Optik Kiosk Aktif • Siap Membaca QR Pass
              </span>
            </div>

            {/* Feedback Alert */}
            {scanResult && (
              <div
                className={`p-3.5 rounded text-xs mb-4 flex items-start gap-2.5 border ${
                  scanResult.type === 'success'
                    ? 'bg-[#059669]/15 border-[#059669]/40 text-emerald-200'
                    : 'bg-[#DC2626]/15 border-[#DC2626]/40 text-red-200'
                }`}
              >
                {scanResult.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold block mb-0.5">
                    {scanResult.type === 'success' ? 'Akses Diberikan' : 'Verifikasi Gagal'}
                  </span>
                  <span>{scanResult.message}</span>
                </div>
              </div>
            )}

            {/* Manual Code Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (scanInputCode.trim()) {
                  handleCheckInByCode(scanInputCode);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs text-[#8A857B] block mb-1">
                  Atau masukkan Kode Booking manual dari slip voucher:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={scanInputCode}
                    onChange={(e) => setScanInputCode(e.target.value)}
                    placeholder="Contoh: BKG-772901"
                    className="flex-1 bg-[#101215] border border-[#55524A]/40 rounded px-3 py-2 text-xs font-mono text-[#F1ECDF] uppercase placeholder:normal-case placeholder:text-[#55524A] focus:outline-hidden focus:border-[#A9822D]"
                  />
                  <button
                    type="submit"
                    disabled={!scanInputCode.trim() || isScanning}
                    className="px-4 py-2 bg-[#A9822D] hover:bg-[#8F6C22] disabled:opacity-50 text-[#16191C] font-semibold text-xs rounded transition-colors cursor-pointer"
                  >
                    {isScanning ? 'Memeriksa...' : 'Validasi'}
                  </button>
                </div>
              </div>
            </form>

            {/* Quick Sesi Selection from today's bookings */}
            {todayBookings.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#55524A]/30">
                <span className="text-[11px] text-[#8A857B] uppercase tracking-wider block mb-2 font-medium">
                  Pilih Cepat Jadwal Hari Ini:
                </span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {todayBookings.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setScanInputCode(b.bookingCode);
                        handleCheckInByCode(b.bookingCode);
                      }}
                      className="w-full text-left p-2 rounded bg-[#101215]/80 hover:bg-[#101215] border border-[#55524A]/30 hover:border-[#A9822D]/60 transition-colors flex items-center justify-between text-xs"
                    >
                      <div className="truncate pr-2">
                        <span className="font-mono text-[#A9822D] font-medium mr-2">{b.bookingCode}</span>
                        <span className="text-[#F1ECDF]">{b.meetingTitle}</span>
                      </div>
                      <span className="text-[10px] text-[#8A857B] font-mono shrink-0">{b.startTime} WIB</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
