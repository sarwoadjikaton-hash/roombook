import React, { useState } from 'react';
import { Booking, Room } from '../types';
import { 
  Monitor, 
  Smartphone, 
  Printer, 
  Download, 
  ShieldCheck, 
  Calendar, 
  Building2, 
  Lock, 
  Reply, 
  Forward, 
  ArrowRight,
  Key,
  Clock,
  Tv,
  Wifi,
  Video
} from 'lucide-react';

interface EmailPreviewViewProps {
  booking: Booking;
  room?: Room;
  onManageBooking: (booking: Booking) => void;
  onViewVoucher?: (booking: Booking) => void;
}

export const EmailPreviewView: React.FC<EmailPreviewViewProps> = ({
  booking,
  room,
  onManageBooking,
  onViewVoucher,
}) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [downloadToast, setDownloadToast] = useState<boolean>(false);

  const simulateDownload = () => {
    setDownloadToast(true);
    setTimeout(() => setDownloadToast(false), 3000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-12 py-8 md:py-12 flex flex-col gap-8">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#55524A]/15">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#55524A]">
            <span className="w-2 h-2 rounded-full bg-[#A9822D]"></span>
            <span className="uppercase tracking-wider">FR-11 & FR-30 • Notifikasi Surel Dinas</span>
          </div>
          <h1 className="font-serif-title text-2xl md:text-4xl text-[#16191C] font-normal mt-1">
            Pratinjau Surel Konfirmasi & Undangan Kalender
          </h1>
          <p className="text-sm text-[#55524A] mt-1 max-w-2xl">
            Tampilan surel resmi yang dikirimkan otomatis ke kotak masuk pemesan rapat dan peserta undangan (Google Workspace / Outlook).
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-[#E4DBC8] p-1 rounded self-start md:self-auto text-xs">
          <button
            onClick={() => setViewMode('desktop')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all font-medium ${
              viewMode === 'desktop' ? 'bg-[#F1ECDF] text-[#16191C] shadow-xs' : 'text-[#55524A] hover:text-[#16191C]'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>

          <button
            onClick={() => setViewMode('mobile')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all font-medium ${
              viewMode === 'mobile' ? 'bg-[#F1ECDF] text-[#16191C] shadow-xs' : 'text-[#55524A] hover:text-[#16191C]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Seluler</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 text-[#55524A] hover:text-[#16191C] rounded flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* Mock Email Client Window */}
      <div
        className={`mx-auto w-full transition-all duration-300 ${
          viewMode === 'mobile' ? 'max-w-md' : 'max-w-4xl'
        }`}
      >
        <div className="bg-[#F1ECDF] rounded border border-[#55524A]/25 shadow-md overflow-hidden">
          {/* Email Client Header Bar */}
          <div className="bg-[#E4DBC8] px-5 py-3 border-b border-[#55524A]/15 flex items-center justify-between text-xs text-[#55524A]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#55524A]/30"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#55524A]/30"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#55524A]/30"></div>
              <span className="font-medium text-[#16191C] ml-2">Kotak Masuk Resmi Dinas</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#26392E]" />
              <span>TLS 1.3 Terenkripsi</span>
            </div>
          </div>

          {/* Email Headers Meta */}
          <div className="p-4 md:p-5 border-b border-[#55524A]/15 bg-[#F1ECDF] text-xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <h2 className="font-serif-title text-base md:text-lg font-medium text-[#16191C]">
                [Terkonfirmasi] Lembar Reservasi Bilik Rapat — {booking.bookingCode} ({booking.roomName})
              </h2>
              <span className="text-[11px] text-[#55524A] font-mono">10 Sep 2026, 08:14 WIB</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-1 text-xs pt-1">
              <div className="md:col-span-1 text-[#55524A]">Dari:</div>
              <div className="md:col-span-11 text-[#16191C] font-medium flex items-center gap-2 flex-wrap">
                <span>The Concierge Ledger</span>
                <span className="text-[#55524A] font-normal">&lt;reservasi@instansi.go.id&gt;</span>
                <span className="text-[#26392E] bg-[#26392E]/10 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                  SPF/DKIM Valid
                </span>
              </div>

              <div className="md:col-span-1 text-[#55524A]">Kepada:</div>
              <div className="md:col-span-11 text-[#16191C]">
                <span>{booking.bookerName}</span>
                <span className="text-[#55524A] font-normal"> &lt;{booking.bookerEmail}&gt;</span>
              </div>

              <div className="md:col-span-1 text-[#55524A]">Lampiran:</div>
              <div className="md:col-span-11 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-[#E4DBC8] px-2.5 py-1 rounded text-[#16191C] text-[11px] font-mono">
                  <Calendar className="w-3 h-3 text-[#A9822D]" />
                  <span>invite-event.ics (Undangan Google Calendar Otomatis)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Email Body Canvas (Parchment Concierge Letter) */}
          <div className="p-4 md:p-8 bg-[#E4DBC8]/40">
            <div className="bg-[#F1ECDF] max-w-2xl mx-auto p-6 md:p-8 rounded border border-[#55524A]/20 shadow-xs space-y-6">
              {/* Letterhead */}
              <div className="text-center pb-4 border-b border-[#55524A]/20">
                <div className="w-10 h-10 rounded bg-[#16191C] text-[#A9822D] flex items-center justify-center mx-auto mb-2">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-serif-title text-xl text-[#16191C] font-medium tracking-wide uppercase">
                  The Concierge Ledger
                </h3>
                <p className="text-[11px] text-[#55524A] uppercase tracking-wider">
                  Administrasi Pengelolaan Bilik Pertemuan & Arsip Kedinasan
                </p>
                <div className="w-16 h-0.5 bg-[#A9822D] mx-auto mt-2"></div>
              </div>

              {/* Salutation */}
              <div className="space-y-2 text-sm text-[#16191C]">
                <p className="font-serif-title text-base font-medium">
                  Yth. {booking.bookerName},
                </p>
                <p className="text-xs text-[#55524A] leading-relaxed">
                  Permohonan penggunaan bilik rapat Anda telah berhasil dijadwalkan secara definitif pada sistem ledger sentral dan sinkronisasi agenda telah dipublikasikan ke kalender kerja Google Workspace Anda.
                </p>
              </div>

              {/* Room Card Thumbnail */}
              <div className="relative w-full h-36 md:h-44 rounded overflow-hidden bg-[#16191C]">
                <img
                  src={
                    room?.image ||
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuDdiH3J350p32a5sjZGeHeu64in3yMJmMaL20fAW5CsO5S6EJ6NLWhlYO6HHl_7s63iQwyA27CV6t2TbIzlsCbioGa7lGSbEfZi-L4-KyK4C8vXmoHeYXMTZ827iw8XUtSZMs9Xev83Tb2s9FjocyQoU3abWYWwEmW1bNj54jKW1UhtVUFc65U8DZEKhfOsQpBBacu6a6zDDhodDdCxPDnylLQVPaNcLczD44Ut7dKBAd_cx_hA7GZD'
                  }
                  alt={booking.roomName}
                  className="w-full h-full object-cover grayscale contrast-125 brightness-90 mix-blend-luminosity opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#16191C] via-transparent to-transparent opacity-70"></div>
                <div className="absolute bottom-2.5 left-4 right-4 text-[#F1ECDF] flex justify-between items-end">
                  <div>
                    <span className="text-[10px] text-[#E4DBC8] uppercase tracking-wider block">Bilik Terdaftar</span>
                    <span className="font-serif-title text-lg font-normal">{booking.roomName}</span>
                  </div>
                  <span className="text-xs bg-[#26392E] text-[#F1ECDF] px-2 py-0.5 rounded font-medium">
                    Jadwal Terkunci
                  </span>
                </div>
              </div>

              {/* Detailed Voucher Slip */}
              <div className="bg-[#E4DBC8]/50 p-4 rounded border border-[#55524A]/20 text-xs space-y-3 relative">
                <div className="flex items-center justify-between border-b border-[#55524A]/15 pb-2">
                  <div>
                    <span className="text-[10px] text-[#55524A] uppercase tracking-wider block">Kode Reservasi</span>
                    <span className="font-mono text-sm font-bold text-[#16191C]">{booking.bookingCode}</span>
                  </div>
                  <span className="border border-[#A9822D]/40 text-[#A9822D] px-2 py-0.5 rounded font-mono font-semibold text-[10px] uppercase">
                    CONFIRMED • EXT-104
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[#55524A] block text-[11px]">Waktu & Durasi</span>
                    <span className="font-medium text-[#16191C]">{booking.date}</span>
                    <span className="text-[#16191C] font-mono block">{booking.startTime} – {booking.endTime} WIB</span>
                  </div>

                  <div>
                    <span className="text-[#55524A] block text-[11px]">Lokasi Bilik</span>
                    <span className="font-medium text-[#16191C]">{room?.location || 'Lantai 2'}</span>
                    <span className="text-[#55524A] block">{booking.participantCount} Orang Hadir</span>
                  </div>

                  <div className="sm:col-span-2 pt-1">
                    <span className="text-[#55524A] block text-[11px]">Agenda Rapat</span>
                    <p className="font-medium text-[#16191C]">{booking.meetingTitle}</p>
                  </div>
                </div>
              </div>

              {/* Magic Link Direct Access Box (FR-3 & FR-10) */}
              <div className="bg-[#E4DBC8] p-4 rounded border border-[#55524A]/15 text-xs flex flex-col sm:flex-row items-center gap-4">
                <div className="w-16 h-16 bg-[#F1ECDF] p-1.5 rounded flex items-center justify-center shrink-0">
                  <svg className="w-full h-full text-[#16191C]" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="0" y="0" width="30" height="30" />
                    <rect x="4" y="4" width="22" height="22" fill="#F1ECDF" />
                    <rect x="8" y="8" width="14" height="14" />
                    <rect x="70" y="0" width="30" height="30" />
                    <rect x="74" y="4" width="22" height="22" fill="#F1ECDF" />
                    <rect x="78" y="8" width="14" height="14" />
                    <rect x="0" y="70" width="30" height="30" />
                    <rect x="4" y="74" width="22" height="22" fill="#F1ECDF" />
                    <rect x="8" y="78" width="14" height="14" />
                    <rect x="40" y="40" width="20" height="20" />
                  </svg>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[#16191C] font-semibold">
                    <Key className="w-3.5 h-3.5 text-[#A9822D]" />
                    <span>Akses Kelola Cepat Tanpa Sandi</span>
                  </div>
                  <p className="text-[#55524A] text-[11px] leading-relaxed mt-1">
                    Ubah jam rapat atau batalkan pemesanan ini langsung melalui tautan aman di bawah ini:
                  </p>
                  <button
                    onClick={() => onManageBooking(booking)}
                    className="inline-flex items-center gap-1 text-[#16191C] font-semibold text-xs mt-1.5 underline decoration-[#A9822D] hover:text-[#A9822D]"
                  >
                    <span>Kelola atau Batalkan Reservasi Ini</span>
                    <ArrowRight className="w-3 h-3 text-[#A9822D]" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-[#16191C] text-[#F1ECDF] text-xs font-medium rounded flex items-center gap-2 hover:bg-[#16191C]/90 shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#A9822D]" />
                  <span>Buka di Google Calendar</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    if (onViewVoucher) {
                      onViewVoucher(booking);
                    } else {
                      simulateDownload();
                    }
                  }}
                  className="px-4 py-2.5 border border-[#16191C] text-[#16191C] text-xs font-medium rounded flex items-center gap-2 hover:bg-[#E4DBC8] transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#A9822D]" />
                  <span>Buka & Unduh Voucher PDF Resmi</span>
                </button>
              </div>

              {/* Protocol Footer */}
              <div className="pt-4 border-t border-[#55524A]/15 text-[11px] text-[#55524A] text-center space-y-1">
                <span className="font-semibold text-[#16191C] block">Layanan Concierge Meja Resepsionis:</span>
                <p>Saluran Internal: Ext. 104 • Direct Line: +62 21 555 0192 • Lantai Dasar Lobi Menara</p>
                <p className="text-[#55524A]/70 text-[10px] pt-1">
                  Surel ini dihasilkan secara otomatis oleh sistem Concierge Ledger. Jangan membalas surel ini secara langsung.
                </p>
              </div>
            </div>
          </div>

          {/* Email Footer Bar */}
          <div className="bg-[#E4DBC8] px-5 py-3 border-t border-[#55524A]/15 flex items-center justify-between text-xs text-[#55524A]">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#26392E]" />
              <span>Surat resmi ini dilindungi protokol enkripsi end-to-end instansi.</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1 hover:text-[#16191C]">
                <Reply className="w-3 h-3" /> Balas
              </button>
              <button className="flex items-center gap-1 hover:text-[#16191C]">
                <Forward className="w-3 h-3" /> Teruskan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification for download */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 bg-[#16191C] text-[#F1ECDF] px-4 py-3 rounded shadow-xl flex items-center gap-2 text-xs z-50 animate-fade-in border-l-2 border-[#A9822D]">
          <ShieldCheck className="w-4 h-4 text-[#A9822D]" />
          <span>Voucher PDF berhasil disimulasikan dan diunduh ke perangkat Anda.</span>
        </div>
      )}
    </div>
  );
};
