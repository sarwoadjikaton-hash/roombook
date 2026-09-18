import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-[#102A45] text-white border-t border-white/10 select-none">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Section: Logo, Nama Lembaga, dan Alamat Kontak */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Sisi Kiri: Logo & Identitas Kementerian */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3.5">
              <img
                src="/logo-kemnaker.png"
                alt="Logo Resmi Kementerian Ketenagakerjaan Republik Indonesia"
                className="w-10 h-10 object-contain shrink-0"
                style={{ filter: 'brightness(0) invert(1)' }}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('.webp')) {
                    target.src = '/logo-kemnaker.webp';
                  }
                }}
              />
              <div className="flex flex-col text-[11px] font-extrabold uppercase tracking-wider text-white leading-tight">
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
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#16375a] border border-white/20 shadow-sm text-white">
            <img
              src="/logo.svg"
              alt="Logo SIRAPAT"
              className="w-4 h-4 object-contain rounded-xs shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="font-bold tracking-wider text-white text-xs">SIRAPAT</span>
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
