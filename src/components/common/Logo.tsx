import React from 'react';

// 1. Logo Resmi Kementerian Ketenagakerjaan RI (SIRAPAT) — Render Langsung dari File Asset
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
    sm: { size: 36, title: 'text-base', sub: 'text-[10px]' },
    md: { size: 48, title: 'text-xl', sub: 'text-sm' },
    lg: { size: 60, title: 'text-2xl sm:text-3xl', sub: 'text-sm sm:text-base' },
    xl: { size: 76, title: 'text-3xl sm:text-4xl', sub: 'text-base sm:text-base' },
  }[size];

  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      {/* Gambar Asli File Logo KEMNAKER RI (Render Langsung dengan Filter Putih Solid Transparan) */}
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
      <div className="flex flex-col justify-center min-w-0">
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

// 2. Logo Utama Aplikasi SIRAPAT TU SEKJEN (Menggunakan Logo Resmi Kemnaker)
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
    sm: { size: 28, title: 'text-base', subtitle: 'text-[9px]' },
    md: { size: 36, title: 'text-lg', subtitle: 'text-[10px]' },
    lg: { size: 44, title: 'text-xl', subtitle: 'text-sm' },
    xl: { size: 56, title: 'text-2xl', subtitle: 'text-base' },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Logo Resmi Kemnaker */}
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

      {/* Logotype Text */}
      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center leading-none">
            <span
              className={`font-black tracking-tight ${iconDimensions.title} ${
                variant === 'light'
                  ? 'text-white'
                  : 'text-slate-900'
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
              className={`font-semibold tracking-wider uppercase mt-1 leading-none ${iconDimensions.subtitle} ${
                variant === 'light' ? 'text-slate-300' : 'text-slate-500'
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
