import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import {
  CalendarDays,
  LayoutDashboard,
  DoorOpen,
  BarChart3,
  ShieldCheck,
  PlusCircle,
  RefreshCw,
  Tv,
  Server,
  ShieldAlert,
  ArrowRight,
  ChevronDown,
  LogOut,
  LogIn,
  RotateCcw,
} from 'lucide-react';


import { BookingModal } from '../booking/BookingModal';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

import { Logo } from '../common/Logo';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    adminUser,
    logoutAdmin,
    bookings,
    googleSyncStatus,
    rooms,
    resetToDefaultData,
    triggerGoogleSync,
  } = useBooking();

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const adminDropdownRef = useRef<HTMLDivElement>(null);

  const isAdminArea = location.pathname.startsWith('/admin');
  const pendingApprovalsCount = bookings.filter((b) => b.status === 'pending').length;

  // Tutup dropdown admin saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target as Node)) {
        setIsAdminDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string) => {
    if (path === '/dashboard' && (location.pathname === '/' || location.pathname === '/dashboard')) {
      return true;
    }
    return location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
  };

  // Navigasi Publik (Pegawai & Tamu Umum - Tanpa Login)
  const publicNavLinks: NavItem[] = [
    { label: 'Beranda', path: '/dashboard', icon: <LayoutDashboard size={16} strokeWidth={1.75} /> },
    { label: 'Jadwal Ruangan', path: '/booking', icon: <CalendarDays size={16} strokeWidth={1.75} /> },
  ];

  // Navigasi Admin Panel (Khusus Pengelola / Approver yang login)
  const adminNavLinks: NavItem[] = [
    { label: 'Panel Pengelola', path: '/admin/dashboard', icon: <LayoutDashboard size={16} strokeWidth={1.75} /> },
    {
      label: 'Persetujuan Rapat',
      path: '/admin/approvals',
      icon: <ShieldCheck size={16} strokeWidth={1.75} />,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
    },
    { label: 'Kelola Ruangan', path: '/admin/rooms', icon: <DoorOpen size={16} strokeWidth={1.75} /> },
    { label: 'Laporan', path: '/admin/reports', icon: <BarChart3 size={16} strokeWidth={1.75} /> },
    { label: 'Integrasi Kalender', path: '/admin/google-sync', icon: <Server size={16} strokeWidth={1.75} /> },
    { label: 'Catatan Aktivitas', path: '/admin/audit', icon: <ShieldAlert size={16} strokeWidth={1.75} /> },
  ];

  const handleLogout = () => {
    logoutAdmin();
    setIsAdminDropdownOpen(false);
    navigate('/dashboard');
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-surface border-b shadow-subtle ${
          isAdminArea ? 'border-primary/30 bg-[#FAFBF9]' : 'border-border'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Branding */}
            <div className="flex items-center gap-8">
              <Link to={isAdminArea ? '/admin/dashboard' : '/dashboard'} className="flex items-center gap-3.5 group">
                <Logo size="md" />
              </Link>

              {/* Desktop Nav Items */}
              <nav className="hidden md:flex items-center space-x-1.5 ml-3">
                {(isAdminArea ? adminNavLinks : publicNavLinks).map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-btn text-base font-bold tracking-wide transition-all relative ${
                      isActive(item.path)
                        ? 'bg-primary text-white shadow-sm ring-1 ring-primary-light'
                        : 'text-text-secondary hover:text-text-primary hover:bg-stone-100/90'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="ml-1.5 px-2 py-0.5 bg-accent text-primary-dark font-black text-sm rounded-full animate-bounce">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right Action Tools */}
            <div className="flex items-center gap-3">
              {/* Kiosk Display Link Khusus Admin */}
              {adminUser && (
                <div className="hidden sm:block">
                  <Link
                    to={`/display/${rooms[0]?.slug || 'ruang-sekjen'}`}
                    target="_blank"
                    className="flex items-center gap-2 px-3.5 py-2 text-sm font-bold bg-stone-100 hover:bg-stone-200 text-text-primary rounded-btn border border-border transition-colors shadow-2xs"
                    title="Buka Layar Display TV Kiosk (Khusus Petugas TU)"
                  >
                    <Tv size={15} className="text-primary" />
                    <span>Layar TV Kiosk</span>
                  </Link>
                </div>
              )}

              {/* Tombol Booking Ruang */}
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="flex items-center gap-2 px-4.5 py-2.5 bg-primary hover:bg-primary-light text-white text-base font-extrabold rounded-btn shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <PlusCircle size={17} strokeWidth={2.2} />
                <span className="hidden sm:inline">Pesan Ruangan</span>
                <span className="sm:hidden">Pesan</span>
              </button>

              {/* Tampilan Khusus Jika Admin Sedang Login */}
              {adminUser ? (
                <div className="relative pl-2 border-l border-border" ref={adminDropdownRef}>
                  <button
                    onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 rounded-btn hover:bg-stone-100 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-base shadow-xs ring-2 ring-primary/20">
                      {adminUser.name.charAt(0)}
                    </div>
                    <div className="hidden xl:block text-left">
                      <div className="text-sm font-bold text-text-primary leading-none truncate max-w-[130px]">
                        {adminUser.name}
                      </div>
                      <div className="text-[11px] text-accent font-bold leading-tight mt-1 capitalize">
                        Administrator
                      </div>
                    </div>
                    <ChevronDown size={15} className="text-text-secondary" />
                  </button>

                  {/* Dropdown Menu Admin */}
                  {isAdminDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-surface rounded-2xl border border-border shadow-2xl py-3 z-50 animate-fade-in">
                      <div className="px-5 py-3 border-b border-border bg-stone-50/50">
                        <div className="text-base font-bold text-text-primary">{adminUser.name}</div>
                        <div className="text-sm text-text-secondary mt-0.5">{adminUser.email}</div>
                        <div className="mt-2 inline-block text-[11px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-md border border-primary/20">
                          {adminUser.department}
                        </div>
                      </div>

                      <div className="px-3 py-2 space-y-1">
                        {isAdminArea ? (
                          <Link
                            to="/dashboard"
                            onClick={() => setIsAdminDropdownOpen(false)}
                            className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-text-primary hover:bg-stone-100 flex items-center justify-between"
                          >
                            <span>Lihat Tampilan Beranda</span>
                            <ArrowRight size={14} className="text-text-secondary" />
                          </Link>
                        ) : (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setIsAdminDropdownOpen(false)}
                            className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-primary hover:bg-primary/10 flex items-center justify-between"
                          >
                            <span>Buka Panel Pengelola</span>
                            <ShieldCheck size={15} className="text-primary" />
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            triggerGoogleSync();
                            setIsAdminDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-sm text-text-secondary hover:bg-stone-100 flex items-center gap-2.5 font-medium"
                        >
                          <RefreshCw size={14} className={googleSyncStatus === 'syncing' ? 'animate-spin' : ''} />
                          <span>Sinkronkan Kalender</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm('Kembalikan seluruh data ke kondisi awal?')) {
                              resetToDefaultData();
                              setIsAdminDropdownOpen(false);
                            }
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-sm text-text-secondary hover:bg-stone-100 flex items-center gap-2.5 font-medium"
                        >
                          <RotateCcw size={14} />
                          <span>Kembalikan Data Awal</span>
                        </button>
                      </div>

                      <div className="border-t border-border pt-2 px-3">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 rounded-xl text-sm text-status-danger hover:bg-red-50 flex items-center gap-2.5 font-bold transition-colors"
                        >
                          <LogOut size={14} />
                          <span>Keluar dari Akun</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Tombol Masuk Khusus Pengelola */
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold text-text-primary bg-stone-100 hover:bg-stone-200 border border-border rounded-btn transition-colors shadow-2xs"
                  title="Masuk khusus Pengelola Ruangan"
                >
                  <LogIn size={15} className="text-primary" />
                  <span className="hidden md:inline">Masuk Pengelola</span>
                </Link>
              )}


            </div>
          </div>
        </div>

        {/* Mobile Bottom Navbar - Icon Only */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md border-t border-border shadow-2xl">
          <div className="flex items-center justify-around px-2 pt-2 pb-3">
            {(isAdminArea ? adminNavLinks : publicNavLinks).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${
                  isActive(item.path) ? 'text-primary' : 'text-text-secondary'
                }`}
              >
                <span className={isActive(item.path) ? '[&>svg]:stroke-[2.5]' : ''}>
                  {item.icon}
                </span>
                <span className="text-[10px] font-bold">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="absolute -top-0.5 right-1 w-4 h-4 bg-accent text-primary-dark font-black text-[9px] rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}

            {/* FAB Pesan di tengah (publik saja) */}
            {!isAdminArea && (
              <div className="flex flex-col items-center -mt-6">
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 active:scale-90 transition-transform"
                >
                  <PlusCircle size={26} strokeWidth={2.5} className="text-white" />
                </button>
                <span className="text-[10px] font-bold text-primary mt-1">Pesan</span>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Global Booking Modal */}
      <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />
    </>
  );
};

