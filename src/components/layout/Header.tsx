import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { Menu, UserCheck, LogIn, Crown, KeyRound } from 'lucide-react';
import { NotificationPopover } from '../common/NotificationPopover';
import { ChangePasswordModal } from '../common/ChangePasswordModal';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const { adminUser } = useBooking();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'Beranda';
    if (path === '/booking') return 'Jadwal Ruangan';
    if (path === '/admin/dashboard') return 'Panel Pengelola';
    if (path === '/admin/approvals') return 'Persetujuan Peminjaman Ruang';
    if (path === '/admin/rooms') return 'Kelola Ruangan & Fasilitas';
    if (path === '/admin/users') return 'Manajemen Akun Pengelola';
    if (path === '/admin/reports') return 'Laporan Penggunaan Ruangan';
    if (path === '/admin/google-sync') return 'Integrasi Kalender';
    if (path === '/admin/audit') return 'Catatan Aktivitas Sistem';
    return 'Peminjaman Ruang Rapat TU SEKJEN';
  };

  const isSuperAdmin = adminUser?.role === 'superadmin';

  return (
    <>
      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur-md border-b border-border py-3.5 px-4 sm:px-8 flex items-center justify-between w-full">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Mobile Hamburger Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl bg-surface-secondary text-text-primary hover:bg-border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Buka Menu"
          >
            <Menu size={20} />
          </button>

          {/* Page Title & Breadcrumb */}
          <div className="flex flex-col min-w-0">
            <h1 className="text-base sm:text-lg font-black text-text-primary truncate tracking-tight">
              {getPageTitle()}
            </h1>
            <span className="hidden sm:inline-block text-sm font-semibold text-text-muted">
              {location.pathname.startsWith('/admin')
                ? 'Panel Pengelola TU SEKJEN'
                : 'Sistem Peminjaman Ruang Rapat TU SEKJEN'}
            </span>
          </div>
        </div>

        {/* Right Header Badges, Notification Bell, & Account Info */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Notifikasi Popover Lonceng */}
          {adminUser && <NotificationPopover />}

          {/* Status Mode Badge & Ganti Sandi */}
          {adminUser ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setIsChangePasswordOpen(true)}
                title="Klik untuk Ubah Kata Sandi"
                className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-sm font-black transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                {isSuperAdmin ? <Crown size={14} className="text-amber-500" /> : <UserCheck size={14} />}
                <span className="hidden sm:inline">
                  {isSuperAdmin ? 'Superadmin:' : 'Pengelola:'}
                </span>
                <span className="truncate max-w-[120px]">{adminUser.name}</span>
                <KeyRound size={13} className="text-primary/70 hover:text-primary shrink-0 ml-0.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-secondary hover:bg-border text-text-secondary hover:text-text-primary border border-border rounded-xl text-sm font-black transition-colors"
            >
              <LogIn size={13} />
              <span>Masuk Pengelola</span>
            </Link>
          )}
        </div>
      </header>

      {/* Modal Ubah Kata Sandi */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </>
  );
};
