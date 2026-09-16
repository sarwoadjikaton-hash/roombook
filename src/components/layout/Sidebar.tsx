import React, { useState } from 'react';
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
  X,
  Tv,
  Server,
  ShieldAlert,
  LogOut,
  LogIn,
  RotateCcw,
  Users,
  Crown,
  KeyRound,
} from 'lucide-react';
import { format } from 'date-fns';
import { BookingModal } from '../booking/BookingModal';
import { Logo } from '../common/Logo';
import { ChangePasswordModal } from '../common/ChangePasswordModal';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    adminUser,
    logoutAdmin,
    bookings,
    googleSyncStatus,
    resetToDefaultData,
    triggerGoogleSync,
    currentTime,
  } = useBooking();

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const pendingApprovalsCount = bookings.filter((b) => b.status === 'pending').length;
  const isSuperAdmin = adminUser?.role === 'superadmin';

  const isActive = (path: string) => {
    if (path === '/dashboard' && (location.pathname === '/' || location.pathname === '/dashboard')) {
      return true;
    }
    return location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
  };

  // Navigasi Publik (Layanan Umum Tanpa Login)
  const publicNavLinks: NavItem[] = [
    { label: 'Beranda', path: '/dashboard', icon: <LayoutDashboard size={18} strokeWidth={2} /> },
    { label: 'Jadwal Ruangan', path: '/booking', icon: <CalendarDays size={18} strokeWidth={2} /> },
  ];

  // Navigasi Khusus Administrator
  const adminNavLinks: NavItem[] = [
    { label: 'Panel Pengelola', path: '/admin/dashboard', icon: <LayoutDashboard size={18} strokeWidth={2} /> },
    {
      label: 'Persetujuan Rapat',
      path: '/admin/approvals',
      icon: <ShieldCheck size={18} strokeWidth={2} />,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
    },
    { label: 'Kelola Ruangan', path: '/admin/rooms', icon: <DoorOpen size={18} strokeWidth={2} /> },
    ...(isSuperAdmin
      ? [{ label: 'Manajemen Admin', path: '/admin/users', icon: <Users size={18} strokeWidth={2} /> }]
      : []),
    { label: 'Laporan', path: '/admin/reports', icon: <BarChart3 size={18} strokeWidth={2} /> },
    { label: 'Integrasi Kalender', path: '/admin/google-sync', icon: <Server size={18} strokeWidth={2} /> },
    { label: 'Catatan Aktivitas', path: '/admin/audit', icon: <ShieldAlert size={18} strokeWidth={2} /> },
  ];

  const handleLogout = () => {
    logoutAdmin();
    navigate('/dashboard');
    setMobileOpen(false);
  };

  const navContent = (
    <div className="flex flex-col h-full bg-surface border-r border-border select-none">
      {/* 1. Header Sidebar: Logo & App Title */}
      <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
        <Link
          to="/dashboard"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3.5 group"
        >
          <Logo size="md" />
        </Link>

        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
          aria-label="Tutup Menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* 2. Tombol Utama Pesan Ruangan */}
      <div className="p-4 border-b border-border bg-surface-secondary/40">
        <button
          onClick={() => {
            setIsBookingModalOpen(true);
            setMobileOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-primary hover:bg-primary-light text-white text-base font-black rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
        >
          <PlusCircle size={18} strokeWidth={2.5} />
          <span>Pesan Ruangan</span>
        </button>
      </div>

      {/* 3. Navigation Links List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
        {/* Navigasi Layanan Publik */}
        <div className="space-y-1.5">
          <div className="px-3 pb-1 text-[11px] font-extrabold text-text-muted uppercase tracking-wider">
            Layanan Publik
          </div>
          {publicNavLinks.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-base font-bold transition-all duration-200 ease-out hover:translate-x-1.5 active:translate-x-2 ${
                  active
                    ? 'bg-primary text-white shadow-sm font-black translate-x-1'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`transition-transform duration-200 group-hover:scale-110 ${active ? 'text-accent' : 'text-text-muted'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {active && (
                  <span className="w-1.5 h-4 bg-accent rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Navigasi Panel Admin */}
        <div className="space-y-1.5">
          <div className="px-3 pb-1 flex items-center justify-between text-[11px] font-extrabold text-text-muted uppercase tracking-wider">
            <span>Panel Pengelola</span>
            {adminUser && (
              <span className="px-1.5 py-0.5 text-[9px] bg-primary/10 text-primary rounded font-black border border-primary/20">
                Aktif
              </span>
            )}
          </div>

          {adminUser ? (
            adminNavLinks.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-base font-bold transition-all duration-200 ease-out hover:translate-x-1.5 active:translate-x-2 ${
                    active
                      ? 'bg-primary text-white shadow-sm font-black translate-x-1'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`transition-transform duration-200 group-hover:scale-110 ${active ? 'text-accent' : 'text-text-muted'}`}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 text-sm font-black rounded-full ${
                          active
                            ? 'bg-accent text-primary-dark'
                            : 'bg-amber-500 text-white animate-pulse'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {active && (
                      <span className="w-1.5 h-4 bg-accent rounded-full" />
                    )}
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="p-3 bg-surface-secondary rounded-xl border border-border space-y-2">
              <p className="text-sm text-text-secondary leading-relaxed">
                Persetujuan dan pengelolaan khusus untuk petugas pengelola ruangan.
              </p>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2 bg-surface hover:bg-surface-secondary border border-border text-sm font-black text-text-primary rounded-lg transition-all duration-200 hover:translate-x-1"
              >
                <LogIn size={14} />
                <span>Masuk Pengelola</span>
              </Link>
            </div>
          )}
        </div>

        {/* Display Kiosk Quick Link (Buka di Tab Baru) */}
        <div className="space-y-1.5">
          <div className="px-3 pb-1 text-[11px] font-extrabold text-text-muted uppercase tracking-wider">
            Layar Informasi
          </div>
          <Link
            to="/display/ruang-sekjen"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-base font-bold text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-all duration-200 ease-out hover:translate-x-1.5"
          >
            <div className="flex items-center gap-3">
              <Tv size={18} className="text-text-muted group-hover:text-primary transition-colors group-hover:scale-110" />
              <span>Layar TV Ruangan</span>
            </div>
            <span className="text-[10px] font-bold text-text-muted px-1.5 py-0.5 bg-border/60 rounded">
              Tab Baru
            </span>
          </Link>
        </div>
      </div>

      {/* 4. Bottom Footer Widget: Server Time, Sync, & User Account */}
      <div className="p-4 border-t border-border bg-surface-secondary/50 space-y-3">
        {/* Status Sinkronisasi Google & Jam */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  googleSyncStatus === 'synced' ? 'bg-emerald-400' : googleSyncStatus === 'syncing' ? 'bg-blue-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  googleSyncStatus === 'synced' ? 'bg-emerald-500' : googleSyncStatus === 'syncing' ? 'bg-blue-500' : 'bg-amber-500'
                }`}
              />
            </span>
            <span className="font-semibold text-text-secondary">
              {googleSyncStatus === 'synced' ? 'Kalender Terhubung' : googleSyncStatus === 'syncing' ? 'Sinkronisasi...' : 'Mode Lokal'}
            </span>
          </div>

          <span className="font-mono font-black text-text-primary">
            {format(currentTime, 'HH:mm:ss')} WIB
          </span>
        </div>

        {/* Account Info / Logout if Admin */}
        {adminUser ? (
          <div className="flex items-center justify-between p-2.5 bg-surface rounded-xl border border-border shadow-subtle">
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-sm font-black text-text-primary truncate">
                {adminUser.name}
              </span>
              <span className="text-[10px] font-bold text-primary truncate flex items-center gap-1">
                {isSuperAdmin ? (
                  <>
                    <Crown size={11} className="text-amber-500 shrink-0" />
                    <span>Superadmin</span>
                  </>
                ) : (
                  'Pengelola Ruangan'
                )}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsChangePasswordOpen(true)}
                title="Ubah Kata Sandi Akun"
                className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <KeyRound size={16} />
              </button>
              <button
                onClick={handleLogout}
                title="Keluar dari Akun"
                className="p-1.5 text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        ) : null}

        {/* Quick Tools: Sync & Reset */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => triggerGoogleSync()}
            title="Sinkronkan Jadwal Sekarang"
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-surface hover:bg-surface-secondary border border-border rounded-lg text-[11px] font-bold text-text-secondary hover:text-text-primary transition-colors"
          >
            <RefreshCw
              size={12}
              className={googleSyncStatus === 'syncing' ? 'animate-spin text-primary' : ''}
            />
            <span>Sinkron Jadwal</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm('Kembalikan seluruh data ke kondisi awal?')) {
                resetToDefaultData();
              }
            }}
            title="Kembalikan Data Awal"
            className="flex items-center justify-center p-1.5 bg-surface hover:bg-surface-secondary border border-border rounded-lg text-text-secondary hover:text-text-primary transition-colors"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:z-30">
        {navContent}
      </aside>

      {/* Mobile Drawer (Slide-in) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}

      {/* Modal Pesan Ruangan Global */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />

      {/* Modal Ubah Kata Sandi */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </>
  );
};
