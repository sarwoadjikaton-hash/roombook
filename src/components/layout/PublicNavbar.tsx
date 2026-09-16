import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CalendarDays, LayoutDashboard, PlusCircle, Search } from 'lucide-react';
import { BookingModal } from '../booking/BookingModal';
import { SearchBookingModal } from '../booking/SearchBookingModal';
import { BookingDetailModal } from '../booking/BookingDetailModal';
import { Booking } from '../../types';
import { Logo } from '../common/Logo';

// ── SVG constants ──────────────────────────────────────────────
const W = 375;   // viewBox width
const H = 72;    // viewBox height (bar height)
const R = 38;    // notch radius (half-width at top)
const D = 42;    // notch depth (px)

/** Build the notch-shaped fill path centered at cx */
function shapePath(cx: number) {
  return (
    `M0,0 H${cx - R} ` +
    `C${cx - R + 12},0 ${cx - R + 13},${D} ${cx},${D} ` +
    `C${cx + R - 13},${D} ${cx + R - 12},0 ${cx + R},0 ` +
    `H${W} V${H} H0 Z`
  );
}

/** Build the top-border path following the notch curve */
function borderPath(cx: number) {
  return (
    `M0,0.5 H${cx - R} ` +
    `C${cx - R + 12},0.5 ${cx - R + 13},${D} ${cx},${D} ` +
    `C${cx + R - 13},${D} ${cx + R - 12},0.5 ${cx + R},0.5 ` +
    `H${W}`
  );
}

// Nav items (3 slots → slot width = W/3 = 125px each)
const SLOT = W / 3;
const CX = {
  dashboard: SLOT * 0.5,   // ~62.5 (left slot center)
  pesan:     SLOT * 1.5,   // ~187.5 (center slot — default / fallback)
  booking:   SLOT * 2.5,   // ~312.5 (right slot center)
};

// ── Component ─────────────────────────────────────────────────
export const PublicNavbar: React.FC = () => {
  const location = useLocation();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<Booking | null>(null);

  const isActive = (path: string) => {
    if (path === '/dashboard' && (location.pathname === '/' || location.pathname === '/dashboard')) return true;
    return location.pathname === path;
  };

  const activeDashboard = isActive('/dashboard');
  const activeBooking   = isActive('/booking');

  // Notch follows: active route → left/right, otherwise center (Pesan)
  const cx = activeDashboard ? CX.dashboard : activeBooking ? CX.booking : CX.pesan;

  // Transition style for SVG path `d` property (Chrome/Firefox)
  const pathTransition = 'd 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)';

  // Shared style for notch-fab circle
  function fabStyle(active: boolean) {
    return {
      top: '-22px',
      opacity: active ? 1 : 0,
      transform: active ? 'scale(1)' : 'scale(0.35)',
      transition: 'opacity 0.3s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      pointerEvents: 'none' as const,
    };
  }

  return (
    <>
      {/* ── Top Navbar ─────────────────────────────────────────── */}
      <header className="sticky top-4 z-40 w-full px-4 sm:px-8 lg:px-12 pointer-events-none">
        <div className="w-full bg-surface/95 backdrop-blur-md border border-border/90 rounded-2xl shadow-xl px-4 sm:px-8 py-3.5 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-3.5 group">
              <Logo size="md" />
            </Link>
            <nav className="hidden md:flex items-center gap-2 pl-4 border-l border-border/80">
              <Link
                to="/dashboard"
                className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-base font-bold transition-all duration-200 hover:translate-x-0.5 active:scale-95 ${
                  activeDashboard ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                }`}
              >
                <LayoutDashboard size={17} className="transition-transform group-hover:scale-110" />
                <span>Beranda</span>
              </Link>
              <Link
                to="/booking"
                className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-base font-bold transition-all duration-200 hover:translate-x-0.5 active:scale-95 ${
                  activeBooking ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                }`}
              >
                <CalendarDays size={17} className="transition-transform group-hover:scale-110" />
                <span>Jadwal Ruangan</span>
              </Link>
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Tombol Lacak Booking (Desktop & Mobile) */}
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-text-primary text-sm font-bold rounded-xl border border-border shadow-2xs transition-all duration-200 hover:shadow-xs active:scale-95"
              title="Cari & lacak permohonan booking dengan email"
            >
              <Search size={16} className="text-primary shrink-0" />
              <span className="hidden sm:inline">Lacak Booking</span>
              <span className="sm:hidden text-xs">Lacak</span>
            </button>

            {/* Tombol Pesan Ruangan (Desktop) */}
            <button
              type="button"
              onClick={() => setIsBookingModalOpen(true)}
              className="hidden md:flex items-center gap-2.5 px-6 py-3 bg-primary hover:bg-primary-light text-white text-base font-black rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
            >
              <PlusCircle size={18} strokeWidth={2.5} />
              <span>Pesan Ruangan</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Notched Bottom Navbar ───────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{ height: `${H}px`, overflow: 'visible' }}
      >
        {/* SVG — animated notch shape */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 w-full"
          style={{ height: `${H}px`, filter: 'drop-shadow(0 -3px 10px rgba(0,0,0,0.09))' }}
          aria-hidden="true"
        >
          {/* White fill */}
          <path d={shapePath(cx)} fill="white" style={{ transition: pathTransition }} />
          {/* Top border following notch */}
          <path d={borderPath(cx)} fill="none" stroke="#e7e5e4" strokeWidth="1" style={{ transition: pathTransition }} />
        </svg>

        {/* 3-column grid over the SVG */}
        <div
          className="absolute inset-0 grid grid-cols-3"
          style={{ overflow: 'visible' }}
        >
          {/* ── Beranda ──────────────────────────────────────── */}
          <Link
            to="/dashboard"
            className="relative flex flex-col items-center justify-end pb-2 gap-0.5"
          >
            {/* Notch-fab: pops up when active */}
            <div
              className="absolute w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/40"
              style={fabStyle(activeDashboard)}
            >
              <LayoutDashboard size={20} strokeWidth={2.5} />
            </div>
            {/* Base icon — fades out when active */}
            <LayoutDashboard
              size={22}
              strokeWidth={activeDashboard ? 2.5 : 1.75}
              className={`transition-all duration-300 ${activeDashboard ? 'text-primary' : 'text-stone-400'}`}
              style={{ opacity: activeDashboard ? 0 : 1, transition: 'opacity 0.25s ease' }}
            />
            <span
              className="text-[10px] font-bold transition-colors duration-300"
              style={{ color: activeDashboard ? '#4a63e7' : '#a8a29e' }}
            >
              Beranda
            </span>
          </Link>

          {/* ── Pesan (modal trigger, permanent raised) ──────── */}
          <div className="relative flex flex-col items-center justify-end pb-2 gap-0.5">
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="absolute w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/40 active:scale-90 hover:bg-primary-light transition-all duration-200"
              style={{
                top: '-22px',
                // Fade Pesan FAB slightly when a route item is active (to not compete visually)
                opacity: (activeDashboard || activeBooking) ? 0.85 : 1,
                transform: (activeDashboard || activeBooking) ? 'scale(0.9)' : 'scale(1)',
                transition: 'opacity 0.3s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
              }}
              aria-label="Pesan Ruangan"
            >
              <PlusCircle size={22} strokeWidth={2.5} />
            </button>
            {/* Spacer matching icon height */}
            <div style={{ height: 22 }} />
            <span className="text-[10px] font-bold text-primary">Pesan</span>
          </div>

          {/* ── Jadwal ───────────────────────────────────────── */}
          <Link
            to="/booking"
            className="relative flex flex-col items-center justify-end pb-2 gap-0.5"
          >
            <div
              className="absolute w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/40"
              style={fabStyle(activeBooking)}
            >
              <CalendarDays size={20} strokeWidth={2.5} />
            </div>
            <CalendarDays
              size={22}
              strokeWidth={activeBooking ? 2.5 : 1.75}
              className={`transition-all duration-300 ${activeBooking ? 'text-primary' : 'text-stone-400'}`}
              style={{ opacity: activeBooking ? 0 : 1, transition: 'opacity 0.25s ease' }}
            />
            <span
              className="text-[10px] font-bold transition-colors duration-300"
              style={{ color: activeBooking ? '#4a63e7' : '#a8a29e' }}
            >
              Jadwal
            </span>
          </Link>
        </div>
      </nav>

      {/* Booking Modal */}
      <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />

      {/* Search / Lacak Booking Modal */}
      <SearchBookingModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectBookingForDetail={(b) => setSelectedBookingForDetail(b)}
      />

      {/* Booking Detail Modal (dari hasil pencarian) */}
      <BookingDetailModal
        booking={selectedBookingForDetail}
        isOpen={!!selectedBookingForDetail}
        onClose={() => setSelectedBookingForDetail(null)}
      />
    </>
  );
};
