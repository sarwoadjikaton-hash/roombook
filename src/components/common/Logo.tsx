import React from 'react';

// 1. Logo Resmi Kementerian Ketenagakerjaan RI (SIRAPAT) — Render [ Logo Aplikasi | Logo Kemnaker ]
interface KemnakerLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  title?: string;
  subtitle?: string;
  className?: string;
}

export const KemnakerLogo: React.FC<KemnakerLogoProps> = ({
  size = 'lg',
  title = 'SIRAPAT',
  subtitle = 'TU SEKJEN',
  className = '',
}) => {
  const iconDimensions = {
    sm: { size: 30, dividerH: 'h-6', title: 'text-base', sub: 'text-[10px]' },
    md: { size: 40, dividerH: 'h-8', title: 'text-xl', sub: 'text-sm' },
    lg: { size: 50, dividerH: 'h-10', title: 'text-2xl sm:text-3xl', sub: 'text-sm sm:text-base' },
    xl: { size: 64, dividerH: 'h-12', title: 'text-3xl sm:text-4xl', sub: 'text-base sm:text-base' },
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* 1. Logo Aplikasi SIRAPAT */}
      <img
        src="/logo.svg"
        alt="Logo Aplikasi SIRAPAT"
        style={{
          width: iconDimensions.size,
          height: iconDimensions.size,
        }}
        className="shrink-0 object-contain rounded-md drop-shadow-md transition-transform duration-300 hover:scale-105"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />

      {/* Pembatas Tanda Silang X (Separator: Logo Aplikasi ✕ Logo Kemnaker) */}
      <span className="text-slate-400 font-black text-xs sm:text-sm mx-0.5 select-none">
        ✕
      </span>

      {/* 2. Logo Resmi KEMNAKER RI */}
      <img
        src="/logo-kemnaker.png"
        alt="Logo Resmi SIRAPAT KEMNAKER RI"
        style={{
          width: iconDimensions.size,
          height: iconDimensions.size,
          filter: 'brightness(0) invert(1)',
        }}
        className="shrink-0 object-contain drop-shadow-[0_4px_14px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-105"
        onError={(e) => {
          const target = e.currentTarget;
          if (!target.src.includes('.webp')) {
            target.src = '/logo-kemnaker.webp';
          }
        }}
      />

      {/* Teks SIRAPAT & TU SEKJEN */}
      <div className="flex flex-col justify-center min-w-0 ml-0.5">
        <span className={`font-black text-white leading-none uppercase tracking-wider drop-shadow-md ${iconDimensions.title}`}>
          {title}
        </span>
        <span className={`font-extrabold text-sky-300 tracking-widest uppercase mt-1 leading-none drop-shadow-sm ${iconDimensions.sub}`}>
          {subtitle}
        </span>
      </div>
    </div>
  );
};

// 2. Logo Header & Navbar: [ Logo Aplikasi | Logo Kemnaker ] + Teks SIRAPAT TU SEKJEN
interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'auto';
  showText?: boolean;
  showSubtitle?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'auto',
  showText = true,
  showSubtitle = true,
  className = '',
}) => {
  const iconDimensions = {
    sm: { size: 26, dividerH: 'h-5', title: 'text-base', subtitle: 'text-[9px]' },
    md: { size: 34, dividerH: 'h-6', title: 'text-lg', subtitle: 'text-[10px]' },
    lg: { size: 42, dividerH: 'h-8', title: 'text-xl', subtitle: 'text-sm' },
    xl: { size: 52, dividerH: 'h-10', title: 'text-2xl', subtitle: 'text-base' },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* 1. Logo Aplikasi SIRAPAT */}
      <img
        src="/logo.svg"
        alt="Logo Aplikasi SIRAPAT"
        style={{
          width: iconDimensions.size,
          height: iconDimensions.size,
        }}
        className="shrink-0 object-contain rounded-md drop-shadow-xs transition-transform duration-300 hover:scale-105"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />

      {/* Pembatas Garis Vertikal (Separator: Logo Aplikasi | Logo Kemnaker) */}
      <span
        className={`w-px ${iconDimensions.dividerH} ${
          variant === 'light'
            ? 'bg-white/30'
            : 'bg-stone-300 dark:bg-stone-700'
        }`}
      />

      {/* 2. Logo Resmi Kementerian Ketenagakerjaan RI */}
      <img
        src="/logo-kemnaker.png"
        alt="Logo Resmi Kemnaker RI"
        style={{
          width: iconDimensions.size,
          height: iconDimensions.size,
        }}
        className={`shrink-0 object-contain transition-transform duration-300 hover:scale-105 ${
          variant === 'light' ? 'filter brightness-0 invert' : ''
        }`}
        onError={(e) => {
          const target = e.currentTarget;
          if (!target.src.includes('.webp')) {
            target.src = '/logo-kemnaker.webp';
          }
        }}
      />

      {/* 3. Logotype Text */}
      {showText && (
        <div className="flex flex-col min-w-0 ml-0.5">
          <div className="flex items-center leading-none">
            <span
              className={`font-black tracking-tight ${iconDimensions.title} ${
                variant === 'light'
                  ? 'text-white'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              SI
            </span>
            <span className={`font-black tracking-tight text-primary dark:text-emerald-500 ${iconDimensions.title}`}>
              RAPAT
            </span>
          </div>
          {showSubtitle && (
            <span
              className={`font-bold tracking-wider uppercase mt-1 leading-none ${iconDimensions.subtitle} ${
                variant === 'light' ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              TU SEKJEN
            </span>
          )}
        </div>
      )}
    </div>
  );
};
