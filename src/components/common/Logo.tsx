import React from 'react';

// 1. Logo Resmi Kementerian Ketenagakerjaan RI (KEMNAKER) — Render Langsung dari File Asset
interface KemnakerLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  subtitle?: string;
  className?: string;
}

export const KemnakerLogo: React.FC<KemnakerLogoProps> = ({
  size = 'lg',
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
        alt="Logo Resmi KEMNAKER RI"
        style={{
          width: iconDimensions.size,
          height: iconDimensions.size,
          filter: 'brightness(0) invert(1)',
        }}
        className="shrink-0 object-contain drop-shadow-[0_4px_14px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-105"
        onError={(e) => {
          // Fallback jika .png gagal coba .webp
          const target = e.currentTarget;
          if (!target.src.includes('.webp')) {
            target.src = '/logo-kemnaker.webp';
          }
        }}
      />

      {/* Teks KEMNAKER & TU SEKJEN */}
      <div className="flex flex-col justify-center min-w-0">
        <span className={`font-black text-white leading-none uppercase tracking-wider drop-shadow-md ${iconDimensions.title}`}>
          KEMNAKER
        </span>
        <span className={`font-extrabold text-sky-300 tracking-widest uppercase mt-1 leading-none drop-shadow-sm ${iconDimensions.sub}`}>
          {subtitle}
        </span>
      </div>
    </div>
  );
};

// 2. Logo Umum Aplikasi SIRAPAT TU SEKJEN
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
    sm: { width: 28, height: 28 },
    md: { width: 36, height: 36 },
    lg: { width: 44, height: 44 },
    xl: { width: 56, height: 56 },
  }[size];

  const textSizes = {
    sm: { title: 'text-base', subtitle: 'text-[9px]' },
    md: { title: 'text-lg', subtitle: 'text-[10px]' },
    lg: { title: 'text-xl', subtitle: 'text-sm' },
    xl: { title: 'text-2xl', subtitle: 'text-base' },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* SVG Icon Graphic */}
      <svg
        width={iconDimensions.width}
        height={iconDimensions.height}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="logoKemnakerBlue" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0A2540" />
            <stop offset="0.5" stopColor="#0F3B68" />
            <stop offset="1" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="logoGoldAccent" x1="16" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F59E0B" />
            <stop offset="1" stopColor="#D97706" />
          </linearGradient>
          <filter id="logoBlueGlow" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1D4ED8" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Background Shield */}
        <rect
          x="3"
          y="3"
          width="42"
          height="42"
          rx="12"
          fill="url(#logoKemnakerBlue)"
          filter="url(#logoBlueGlow)"
        />

        <rect
          x="3"
          y="3"
          width="42"
          height="42"
          rx="12"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1.5"
        />

        {/* Room Frame */}
        <path
          d="M12 15C12 13.8954 12.8954 13 14 13H24V35H14C12.8954 35 12 34.1046 12 33V15Z"
          fill="white"
          fillOpacity="0.22"
        />

        {/* Open Door */}
        <path
          d="M24 13L35 17.5C35.5523 17.7209 36 18.2565 36 18.8522V32.1478C36 32.7435 35.5523 33.2791 35 33.5L24 35V13Z"
          fill="white"
          fillOpacity="0.96"
        />

        <circle cx="28" cy="22" r="1.5" fill="#0F3B68" />
        <circle cx="32" cy="23.5" r="1.5" fill="#0F3B68" />
        <circle cx="28" cy="27" r="1.5" fill="#0F3B68" />
        <circle cx="32" cy="28.5" r="1.5" fill="#0F3B68" />

        <circle cx="26.5" cy="24" r="2" fill="url(#logoGoldAccent)" />
        <path
          d="M26.5 24V28"
          stroke="url(#logoGoldAccent)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        <path
          d="M16 17H21"
          stroke="#38BDF8"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* Logotype Text */}
      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1 leading-none">
            <span
              className={`font-black tracking-tight ${textSizes.title} ${
                variant === 'light'
                  ? 'text-white'
                  : 'text-slate-900'
              }`}
            >
              SI
            </span>
            <span className={`font-black tracking-tight text-primary dark:text-emerald-500 ${textSizes.title}`}>
              RAPAT
            </span>
          </div>
          {showSubtitle && (
            <span
              className={`font-semibold tracking-wider uppercase mt-1 leading-none ${textSizes.subtitle} ${
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
