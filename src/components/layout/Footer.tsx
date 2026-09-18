import React from 'react';
import { useLocation } from 'react-router-dom';

interface FooterProps {
  variant?: 'auto' | 'full' | 'admin';
}

export const Footer: React.FC<FooterProps> = ({ variant = 'auto' }) => {
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  const isAdmin = variant === 'admin' || (variant === 'auto' && location.pathname.startsWith('/admin'));

  // Footer Ringkas Khusus Panel Admin (Latar Belakang Putih)
  if (isAdmin) {
    return (
      <footer className="mt-auto bg-white dark:bg-surface border-t border-border py-3.5 text-xs text-text-secondary select-none">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center gap-2.5">
          {/* Badge Tag SIRAPAT: [ Logo Aplikasi | Logo Kemnaker ] */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-2xs">
            <img
              src="/logo.svg"
              alt="Logo Aplikasi SIRAPAT"
              className="w-4 h-4 object-contain rounded-xs shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="w-px h-3.5 bg-stone-300 dark:bg-stone-600" />
            <img
              src="/logo-kemnaker.png"
              alt="Logo Resmi Kemnaker"
              className="w-4 h-4 object-contain shrink-0"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('.webp')) {
                  target.src = '/logo-kemnaker.webp';
                }
              }}
            />
            <span className="font-extrabold tracking-wider text-text-primary text-xs ml-0.5">SIRAPAT</span>
          </div>

          <span className="text-stone-300 dark:text-stone-700">|</span>

          {/* Keterangan Lembaga & Copyright */}
          <div className="flex items-center gap-1.5 text-text-muted text-[11px] sm:text-xs">
            <span className="text-primary font-bold">❖</span>
            <span className="font-medium text-text-secondary">
              Sekretariat Jenderal Kementerian Ketenagakerjaan RI • TU SEKJEN © {currentYear}
            </span>
          </div>
        </div>
      </footer>
    );
  }

  // Footer Lengkap Resmi Kemnaker (Public View dengan Dark Navy Theme)
  return (
    <footer className="mt-auto bg-[#102A45] text-white border-t border-white/10 select-none">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Section: Logo, Nama Lembaga, dan Alamat Kontak */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Sisi Kiri: Logo [ Aplikasi | Kemnaker ] & Identitas Kementerian */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              {/* Logo Aplikasi */}
              <img
                src="/logo.svg"
                alt="Logo Aplikasi SIRAPAT"
                className="w-9 h-9 object-contain rounded-md shrink-0 drop-shadow-sm"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />

              {/* Separator Garis */}
              <span className="w-px h-7 bg-white/25" />

              {/* Logo Kemnaker */}
              <img
                src="/logo-kemnaker.png"
                alt="Logo Resmi Kementerian Ketenagakerjaan Republik Indonesia"
                className="w-9 h-9 object-contain shrink-0"
                style={{ filter: 'brightness(0) invert(1)' }}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('.webp')) {
                    target.src = '/logo-kemnaker.webp';
                  }
                }}
              />

              <div className="flex flex-col text-[11px] font-extrabold uppercase tracking-wider text-white leading-tight ml-1">
                <span>KEMENTERIAN</span>
                <span>KETENAGAKERJAAN</span>
                <span>REPUBLIK INDONESIA</span>
              </div>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-white tracking-wide mt-1">
              Sekretariat Jenderal Kementerian Ketenagakerjaan Republik Indonesia
            </h3>
          </div>

          {/* Sisi Kanan: Alamat Lengkap & Layanan Kontak */}
          <div className="text-xs text-slate-300 md:text-right space-y-1.5 shrink-0">
            <p className="leading-relaxed">
              Jl. Jendral Gatot Subroto Kav. 51, Daerah Khusus Ibukota Jakarta 12950
            </p>
            <p className="flex items-center md:justify-end gap-2 text-slate-300">
              <span>
                Telp: <strong className="text-white font-bold">021-5255733</strong>
              </span>
              <span className="text-sky-400">•</span>
              <span>
                Call Center: <strong className="text-white font-bold">1500630</strong>
              </span>
            </p>
          </div>
        </div>

        {/* Garis Pembatas (Divider) */}
        <div className="w-full h-px bg-white/15 my-4"></div>

        {/* Bottom Section: Tag Nama Aplikasi & Hak Cipta */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs text-slate-300">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#16375a] border border-white/20 shadow-sm text-white">
            <img
              src="/logo.svg"
              alt="Logo SIRAPAT"
              className="w-4 h-4 object-contain rounded-xs shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="w-px h-3.5 bg-white/30" />
            <img
              src="/logo-kemnaker.png"
              alt="Logo Kemnaker"
              className="w-4 h-4 object-contain shrink-0"
              style={{ filter: 'brightness(0) invert(1)' }}
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('.webp')) {
                  target.src = '/logo-kemnaker.webp';
                }
              }}
            />
            <span className="font-bold tracking-wider text-white text-xs ml-0.5">SIRAPAT</span>
          </div>

          <span className="text-slate-500">|</span>

          <div className="flex items-center gap-1.5 text-slate-300 text-[11px] sm:text-xs">
            <span className="text-sky-400 font-bold">❖</span>
            <span>
              Sekretariat Jenderal Kementerian Ketenagakerjaan RI • TU SEKJEN © {currentYear}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
