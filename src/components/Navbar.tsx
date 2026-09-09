import React, { useEffect, useState } from 'react';
import { AppView } from '../types';
import { 
  Building2, 
  Calendar, 
  Search, 
  Tv, 
  ShieldCheck, 
  Code2, 
  FileText, 
  Mail, 
  Menu, 
  X,
  Clock
} from 'lucide-react';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  bookingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, bookingCount }) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${h}:${m}:${s} WIB`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'directory' as AppView, label: 'Daftar Ruangan & Jadwal', icon: Calendar },
    { id: 'my-booking' as AppView, label: 'Cek Booking Saya', icon: Search },
    { id: 'kiosk' as AppView, label: 'Display Kiosk Pintu', icon: Tv },
    { id: 'admin' as AppView, label: 'Dashboard Admin', icon: ShieldCheck },
    { id: 'stack-code' as AppView, label: 'Laravel & Docker Stack', icon: Code2 },
  ];

  return (
    <header className="sticky top-0 left-0 right-0 z-40 bg-[#F1ECDF]/95 backdrop-blur-md border-b border-[#55524A]/15 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      {/* Top Ledger Strip */}
      <div className="w-full bg-[#E4DBC8] py-1.5 px-4 md:px-12 border-b border-[#55524A]/15 flex items-center justify-between text-[12px] text-[#55524A]">
        <div className="flex items-center gap-3">
          <span className="font-medium text-[#16191C]">Kamis, 10 September 2026</span>
          <span className="text-[#55524A]/30">|</span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[#26392E] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#26392E] animate-pulse"></span>
            Google Calendar Sync 2-Arah Aktif
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-[#55524A]">Zona: WIB (GMT+7)</span>
          <span className="hidden md:inline text-[#55524A]/30">|</span>
          <span className="font-medium text-[#16191C] tabular-nums flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#A9822D]" />
            {currentTime || '10:00:00 WIB'}
          </span>
        </div>
      </div>

      {/* Main Nav */}
      <div className="h-16 px-4 md:px-12 max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <button 
          onClick={() => { onNavigate('directory'); setMobileMenuOpen(false); }}
          className="flex items-center gap-3 text-left focus:outline-none group"
        >
          <div className="w-9 h-9 rounded-sm bg-[#16191C] flex items-center justify-center text-[#A9822D] shadow-sm">
            <Building2 className="w-5 h-5 text-[#A9822D]" />
          </div>
          <div>
            <div className="font-serif-title text-[20px] font-medium tracking-tight text-[#16191C] leading-none group-hover:text-[#A9822D] transition-colors">
              The Concierge Ledger
            </div>
            <div className="text-[11px] text-[#55524A] tracking-wider uppercase mt-0.5">
              Sistem Booking Ruang Rapat
            </div>
          </div>
        </button>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-1.5 rounded text-[13px] font-medium transition-all flex items-center gap-2 ${
                  isActive 
                    ? 'bg-[#16191C] text-[#F1ECDF] shadow-sm' 
                    : 'text-[#55524A] hover:text-[#16191C] hover:bg-[#E4DBC8]/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#A9822D]' : 'text-[#55524A]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('my-booking')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#16191C] text-[#16191C] text-[12px] font-medium hover:bg-[#16191C] hover:text-[#F1ECDF] transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Cek Tiket</span>
          </button>

          <button
            onClick={() => onNavigate('admin')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#A9822D] text-[#16191C] text-[12px] font-semibold hover:bg-[#C5A047] transition-colors shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin Desk</span>
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#16191C] hover:bg-[#E4DBC8] rounded"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#F1ECDF] border-b border-[#55524A]/20 px-4 py-3 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-[14px] text-left font-medium ${
                  isActive ? 'bg-[#16191C] text-[#F1ECDF]' : 'text-[#55524A] hover:bg-[#E4DBC8]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#A9822D]' : 'text-[#55524A]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
