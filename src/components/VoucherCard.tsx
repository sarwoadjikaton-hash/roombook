import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { Booking, Room } from '../types';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Calendar, 
  Download, 
  Share2, 
  Mail, 
  ArrowLeft, 
  QrCode, 
  Key, 
  ShieldCheck,
  Building,
  Clock,
  Users,
  Smartphone,
  ScanLine,
  ExternalLink,
  Sparkles,
  FileText,
  Printer,
  Loader2
} from 'lucide-react';

interface VoucherCardProps {
  booking: Booking;
  room?: Room;
  onBackToDirectory: () => void;
  onViewEmailPreview: () => void;
}

export const VoucherCard: React.FC<VoucherCardProps> = ({
  booking,
  room,
  onBackToDirectory,
  onViewEmailPreview,
}) => {
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedQrPayload, setCopiedQrPayload] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrMode, setQrMode] = useState<'kiosk_checkin' | 'magic_url'>('kiosk_checkin');
  const [checkInStatus, setCheckInStatus] = useState<'ready' | 'simulating' | 'checked_in'>('ready');
  const [checkInTimestamp, setCheckInTimestamp] = useState<string>('');
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [pdfSuccessToast, setPdfSuccessToast] = useState<boolean>(false);

  const voucherRef = useRef<HTMLDivElement>(null);

  const checkInPayload = qrMode === 'kiosk_checkin'
    ? JSON.stringify({
        schema: 'concierge.checkin.v1',
        bookingCode: booking.bookingCode,
        room: booking.roomId,
        roomName: booking.roomName,
        date: booking.date,
        slot: `${booking.startTime}-${booking.endTime}`,
        token: booking.manageToken,
        booker: booking.bookerName,
        pax: booking.participantCount,
        verifiedOfficeId: 'JKT-SDR-LT14',
      }, null, 2)
    : `https://concierge-ledger.internal/kelola/${booking.manageToken}?checkin=1`;

  useEffect(() => {
    QRCode.toDataURL(checkInPayload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      scale: 8,
      color: {
        dark: '#16191C',
        light: '#F1ECDF',
      },
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('QR code generation failed:', err);
      });
  }, [checkInPayload]);

  const copyCode = () => {
    navigator.clipboard.writeText(booking.bookingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyMagicLink = () => {
    const magicLink = `https://concierge-ledger.internal/kelola/${booking.manageToken}`;
    navigator.clipboard.writeText(magicLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyPayload = () => {
    navigator.clipboard.writeText(checkInPayload);
    setCopiedQrPayload(true);
    setTimeout(() => setCopiedQrPayload(false), 2000);
  };

  const downloadQrCode = () => {
    if (!qrDataUrl) return;
    const downloadLink = document.createElement('a');
    downloadLink.href = qrDataUrl;
    downloadLink.download = `QR-CheckIn-${booking.bookingCode}-${booking.roomId}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleSimulateCheckIn = () => {
    setCheckInStatus('simulating');
    setTimeout(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setCheckInTimestamp(`${timeStr} WIB`);
      setCheckInStatus('checked_in');
    }, 900);
  };

  const handleDownloadPdf = async () => {
    if (!voucherRef.current || isExportingPdf) return;
    try {
      setIsExportingPdf(true);

      const element = voucherRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#F1ECDF',
        windowWidth: 1200,
      });

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm

      const marginX = 14;
      const printableWidth = pageWidth - (marginX * 2); // 182mm
      const imgHeight = (canvas.height * printableWidth) / canvas.width;

      pdf.setProperties({
        title: `Bukti-Reservasi-${booking.bookingCode}`,
        subject: `Reservasi Bilik Rapat: ${booking.roomName}`,
        author: 'Concierge Ledger System',
        keywords: 'voucher, reservasi, meeting room, checkin',
        creator: 'Concierge Ledger System',
      });

      // Top decorative header
      pdf.setFontSize(8);
      pdf.setTextColor(85, 82, 74);
      pdf.text(
        `CONCIERGE LEDGER • SLIP RESMI RESERVASI BILIK RAPAT • TANGGAL CETAK: ${new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}`,
        marginX,
        10
      );

      pdf.setDrawColor(169, 130, 45); // Brass rule
      pdf.setLineWidth(0.4);
      pdf.line(marginX, 12, pageWidth - marginX, 12);

      const startY = 16;
      const maxHeight = pageHeight - startY - 14;
      const renderedHeight = Math.min(imgHeight, maxHeight);
      pdf.addImage(imgData, 'PNG', marginX, startY, printableWidth, renderedHeight);

      // Footer verification text
      const footerY = startY + renderedHeight + 6;
      pdf.setFontSize(7.5);
      pdf.setTextColor(110, 105, 95);
      pdf.text(
        `Kode: ${booking.bookingCode} | Token: ${booking.manageToken.substring(0, 16)}... | Dokumen verifikasi sah untuk check-in fisik di kiosk bilik rapat.`,
        marginX,
        Math.min(footerY, pageHeight - 6)
      );

      pdf.save(`Bukti-Reservasi-${booking.bookingCode}-${booking.roomId}.pdf`);
      setPdfSuccessToast(true);
      setTimeout(() => setPdfSuccessToast(false), 3500);
    } catch (error) {
      console.error('Gagal mengekspor PDF:', error);
      alert('Terjadi kendala saat membuat dokumen PDF. Anda juga dapat menggunakan tombol Cetak Kertas.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Google Calendar URL generator
  const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    booking.meetingTitle
  )}&dates=${booking.date.replace(/-/g, '')}T${booking.startTime.replace(':', '')}00/${booking.date.replace(
    /-/g,
    ''
  )}T${booking.endTime.replace(':', '')}00&details=${encodeURIComponent(
    `Bilik Rapat: ${booking.roomName}. Kode Booking: ${booking.bookingCode}. Pemohon: ${booking.bookerName}`
  )}&location=${encodeURIComponent(booking.roomName + ', ' + (room?.location || 'Lantai 2'))}&add=${encodeURIComponent(
    room?.googleCalendarId || 'cal-sekjen@instansi.go.id'
  )}`;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col gap-8">
      {/* Top Confirmation Header with Animated Brass Ring */}
      <div className="flex flex-col items-center text-center">
        <div className="relative w-16 h-16 md:w-20 md:h-20 mb-3 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="#E4DBC8"
              strokeWidth="2"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="#A9822D"
              strokeWidth="2.5"
              strokeDasharray="226.2"
              strokeDashoffset="0"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-[#A9822D] absolute" />
        </div>

        <h1 className="font-serif-title text-3xl md:text-4xl text-[#16191C] font-normal tracking-tight">
          Reservasi Telah Dikonfirmasi
        </h1>
        <p className="text-sm text-[#55524A] max-w-lg mt-1">
          Voucher fisik resmi dan undangan kalender Google telah terdistribusi otomatis ke kotak masuk dinas Anda.
        </p>

        {/* Live sync banner */}
        <div className="mt-4 flex items-center gap-2 px-4 py-1.5 bg-[#E4DBC8] rounded text-xs text-[#26392E] font-medium">
          <span className="w-2 h-2 rounded-full bg-[#26392E] animate-pulse"></span>
          <span>
            Tersinkronisasi otomatis dengan <code className="font-mono text-[#16191C]">{room?.googleCalendarId || 'cal-sekjen@instansi.go.id'}</code> • Plakat digital pintu luar telah diperbarui
          </span>
        </div>
      </div>

      {/* Main Voucher Card (Paper Parchment Style) */}
      <div ref={voucherRef} className="bg-[#F1ECDF] shadow-md border border-[#55524A]/20 rounded overflow-hidden">
        {/* Upper Voucher Bar */}
        <div className="bg-[#E4DBC8] px-6 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#55524A]/15 text-xs">
          <div className="flex items-center gap-2 text-[#55524A] font-medium">
            <Building className="w-4 h-4 text-[#A9822D]" />
            <span>Slip Voucher Reservasi Bilik Resmi</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#55524A]">Kode Reservasi:</span>
            <span className="font-mono text-sm font-bold text-[#16191C] tracking-wider">
              {booking.bookingCode}
            </span>
            <button
              onClick={copyCode}
              className="p-1 hover:text-[#A9822D] text-[#55524A] transition-colors"
              title="Salin Kode Booking"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-[#26392E]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Main Voucher Body (Editorial Split) */}
        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Agenda & Room details (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#A9822D] block mb-1">
                Bilik Pertemuan Terdaftar
              </span>
              <h2 className="font-serif-title text-2xl md:text-3xl text-[#16191C] font-normal">
                {booking.roomName}
              </h2>
              <p className="text-xs text-[#55524A] mt-0.5">{room?.location || 'Lantai 2 Instansi'}</p>

              {/* Time & Capacity Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 bg-[#E4DBC8]/40 p-4 rounded text-xs">
                <div>
                  <span className="text-[#55524A] block">Hari & Tanggal</span>
                  <span className="text-sm font-medium text-[#16191C] block mt-0.5">{booking.date}</span>
                  <span className="font-mono text-xs text-[#16191C]">
                    {booking.startTime} – {booking.endTime} WIB
                  </span>
                </div>
                <div>
                  <span className="text-[#55524A] block">Kapasitas & Delegasi</span>
                  <span className="text-sm font-medium text-[#16191C] block mt-0.5">
                    {booking.participantCount} Orang
                  </span>
                  <span className="text-xs text-[#55524A]">Maksimal {room?.capacity || 30} Kursi</span>
                </div>
              </div>
            </div>

            {/* Agenda & Booker */}
            <div className="space-y-4 pt-2">
              <div>
                <span className="text-xs text-[#55524A] block">Judul Agenda Rapat</span>
                <p className="font-serif-title text-lg md:text-xl text-[#16191C] font-normal mt-0.5">
                  {booking.meetingTitle}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#55524A] block">Penanggung Jawab Pemesan</span>
                  <span className="font-medium text-[#16191C] block mt-0.5">{booking.bookerName}</span>
                  <span className="text-[#55524A]">{booking.division}</span>
                </div>
                <div>
                  <span className="text-[#55524A] block">Surel Kedinasan</span>
                  <span className="font-medium text-[#16191C] block mt-0.5">{booking.bookerEmail}</span>
                  <span className="text-[#26392E]">Notifikasi otomatis aktif</span>
                </div>
              </div>

              {/* Facilities */}
              <div className="pt-2">
                <span className="text-xs text-[#55524A] block mb-1">Fasilitas Disediakan Concierge</span>
                <div className="bg-[#E4DBC8]/50 p-3 rounded text-xs text-[#16191C]">
                  {booking.extraNotes || 'Standar Bilik Lengkap (AC, WiFi Dedicated, Meja Rapat)'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: QR Plaque Scanner & Magic Link (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between bg-[#E4DBC8]/70 p-5 rounded space-y-5 border border-[#55524A]/20">
            {/* Dynamic QR Generator Section */}
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#A9822D] flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR Pass Check-in Fisik</span>
                </span>
                <span className="text-[10px] font-mono bg-[#16191C] text-[#F1ECDF] px-1.5 py-0.5 rounded">
                  v1.0
                </span>
              </div>

              {/* QR Mode Switcher (Kiosk Reader Payload vs Direct Magic URL) */}
              <div className="grid grid-cols-2 gap-1 w-full bg-[#16191C]/10 p-1 rounded text-[11px] mb-3">
                <button
                  type="button"
                  onClick={() => setQrMode('kiosk_checkin')}
                  className={`py-1 px-2 rounded transition-colors font-medium ${
                    qrMode === 'kiosk_checkin'
                      ? 'bg-[#16191C] text-[#F1ECDF] shadow-xs'
                      : 'text-[#55524A] hover:text-[#16191C]'
                  }`}
                >
                  Scanner Kiosk
                </button>
                <button
                  type="button"
                  onClick={() => setQrMode('magic_url')}
                  className={`py-1 px-2 rounded transition-colors font-medium ${
                    qrMode === 'magic_url'
                      ? 'bg-[#16191C] text-[#F1ECDF] shadow-xs'
                      : 'text-[#55524A] hover:text-[#16191C]'
                  }`}
                >
                  URL Ponsel
                </button>
              </div>

              {/* Dynamic QR Display Canvas Box */}
              <div className="relative bg-[#F1ECDF] p-3.5 rounded-sm shadow-md border border-[#55524A]/20 group">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Check-in ${booking.bookingCode}`}
                    className="w-36 h-36 object-contain rounded-xs select-none"
                  />
                ) : (
                  <div className="w-36 h-36 flex items-center justify-center text-xs text-[#55524A] animate-pulse">
                    Menghasilkan QR...
                  </div>
                )}

                {/* Laser scanline effect during simulation */}
                {checkInStatus === 'simulating' && (
                  <div className="absolute inset-x-2 top-0 h-1 bg-[#10b981] shadow-[0_0_8px_#10b981] animate-bounce"></div>
                )}
              </div>

              {/* Room Location & Code Indicator */}
              <div className="mt-2 text-center">
                <div className="font-mono text-xs font-bold text-[#16191C]">
                  {booking.bookingCode} • {booking.roomId.toUpperCase()}
                </div>
                <span className="text-[11px] text-[#55524A] block">
                  Arahkan ke kamera monitor kiosk pintu {room?.name || booking.roomName}
                </span>
              </div>

              {/* Quick Action Buttons for QR */}
              <div className="flex items-center justify-center gap-2 mt-2.5 w-full">
                <button
                  type="button"
                  onClick={downloadQrCode}
                  className="flex-1 py-1.5 px-2 bg-[#F1ECDF] hover:bg-[#E4DBC8] text-[#16191C] border border-[#55524A]/25 rounded text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                  title="Unduh QR Code format PNG resolusi tinggi"
                >
                  <Download className="w-3 h-3 text-[#A9822D]" />
                  <span>Unduh PNG</span>
                </button>

                <button
                  type="button"
                  onClick={copyPayload}
                  className="flex-1 py-1.5 px-2 bg-[#F1ECDF] hover:bg-[#E4DBC8] text-[#16191C] border border-[#55524A]/25 rounded text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                  title="Salin data mentah check-in payload"
                >
                  {copiedQrPayload ? (
                    <>
                      <Check className="w-3 h-3 text-[#059669]" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-[#55524A]" />
                      <span>Salin Data</span>
                    </>
                  )}
                </button>
              </div>

              {/* Physical Check-in Simulator Card */}
              <div className="w-full mt-3.5 pt-3 border-t border-[#55524A]/20 text-left">
                {checkInStatus === 'checked_in' ? (
                  <div className="bg-[#26392E]/15 border border-[#26392E]/30 rounded p-2.5 text-xs text-[#26392E] space-y-1 animate-fade-in">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-[#26392E]" />
                      <span>Check-In Mandiri Sukses!</span>
                    </div>
                    <p className="text-[11px] text-[#26392E]/90 leading-tight">
                      Akses pintu bilik rapat terbuka. Plakat luar menampilkan nama agenda Anda.
                    </p>
                    <div className="text-[10px] font-mono text-[#26392E]/70 pt-0.5">
                      Waktu Verifikasi: {checkInTimestamp}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSimulateCheckIn}
                    disabled={checkInStatus === 'simulating'}
                    className="w-full py-2 px-3 bg-[#16191C] hover:bg-[#16191C]/90 text-[#F1ECDF] rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <ScanLine className={`w-3.5 h-3.5 text-[#A9822D] ${checkInStatus === 'simulating' ? 'animate-spin' : ''}`} />
                    <span>
                      {checkInStatus === 'simulating'
                        ? 'Memverifikasi di Kiosk...'
                        : 'Simulasikan Scan di Kiosk Pintu'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Magic Link Box (FR-3) */}
            <div className="bg-[#F1ECDF] p-3 rounded border border-[#55524A]/15 text-xs">
              <div className="flex items-center justify-between text-[#16191C] font-semibold mb-1">
                <div className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#A9822D]" />
                  <span>Tautan Rahasia Kelola</span>
                </div>
                <span className="text-[10px] text-[#55524A] font-mono">Tanpa Akun</span>
              </div>
              <p className="text-[11px] text-[#55524A] leading-relaxed mb-1.5">
                Gunakan tautan ini untuk mengubah jadwal atau melepaskan bilik rapat:
              </p>
              <div className="flex items-center justify-between bg-[#E4DBC8] px-2 py-1 rounded font-mono text-[11px] text-[#55524A]">
                <span className="truncate">ledger.internal/kelola/{booking.manageToken.substring(0, 12)}...</span>
                <button
                  type="button"
                  onClick={copyMagicLink}
                  className="text-[#16191C] hover:text-[#A9822D] ml-2 shrink-0 p-0.5"
                  title="Salin Tautan Rahasia"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-[#26392E]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Suite */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* Add to Google Calendar */}
        <a
          href={gCalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 bg-[#16191C] text-[#F1ECDF] text-xs font-medium rounded flex items-center gap-2 hover:bg-[#16191C]/90 shadow-xs transition-colors"
        >
          <Calendar className="w-4 h-4 text-[#A9822D]" />
          <span>Tambahkan ke Google Calendar</span>
        </a>

        {/* Download PDF via jsPDF & html2canvas */}
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isExportingPdf}
          className="px-5 py-2.5 bg-[#A9822D] hover:bg-[#916e23] text-[#F1ECDF] text-xs font-medium rounded flex items-center gap-2 shadow-xs transition-all disabled:opacity-75 cursor-pointer"
          title="Unduh voucher fisik resmi format PDF beresolusi tinggi"
        >
          {isExportingPdf ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#F1ECDF]" />
              <span>Menghasilkan Dokumen PDF...</span>
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 text-[#F1ECDF]" />
              <span>Unduh Bukti Reservasi (PDF)</span>
            </>
          )}
        </button>

        {/* Print on Paper */}
        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2.5 border border-[#16191C] text-[#16191C] text-xs font-medium rounded flex items-center gap-2 hover:bg-[#E4DBC8] transition-colors cursor-pointer"
          title="Cetak langsung ke mesin printer kertas"
        >
          <Printer className="w-4 h-4 text-[#55524A]" />
          <span>Cetak Kertas</span>
        </button>

        {/* View Email Preview */}
        <button
          type="button"
          onClick={onViewEmailPreview}
          className="px-4 py-2.5 bg-[#E4DBC8] text-[#16191C] text-xs font-medium rounded flex items-center gap-2 hover:bg-[#E4DBC8]/70 transition-colors cursor-pointer"
        >
          <Mail className="w-4 h-4 text-[#A9822D]" />
          <span>Lihat Pratinjau Surel Masuk</span>
        </button>

        {/* Back to Directory */}
        <button
          type="button"
          onClick={onBackToDirectory}
          className="px-3 py-2.5 text-[#55524A] hover:text-[#16191C] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Direktori</span>
        </button>
      </div>

      {/* Download Success Toast */}
      {pdfSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#26392E] text-[#F1ECDF] px-4 py-3 rounded shadow-xl border border-[#A9822D]/50 flex items-center gap-3 animate-fade-in text-xs max-w-sm">
          <CheckCircle2 className="w-5 h-5 text-[#A9822D] shrink-0" />
          <div>
            <div className="font-semibold text-sm">PDF Berhasil Dibuat & Diunduh</div>
            <div className="text-[11px] opacity-85 mt-0.5 font-mono">
              Bukti-Reservasi-{booking.bookingCode}-{booking.roomId}.pdf
            </div>
          </div>
        </div>
      )}

      {/* Concierge Policy Guidance Box */}
      <div className="bg-[#E4DBC8]/40 p-6 rounded border border-[#55524A]/15 text-xs text-[#55524A] space-y-2">
        <h4 className="font-serif-title text-base text-[#16191C] font-medium">Petunjuk Kedatangan & Ketentuan Bilik</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div>
            <strong className="text-[#16191C] block mb-0.5">Akses Pintu Masuk:</strong>
            Sistem pintu nirkontak otomatis terbuka 10 menit sebelum jam reservasi. Tunjukkan QR pada kamera kiosk bila pintu terkunci.
          </div>
          <div>
            <strong className="text-[#16191C] block mb-0.5">Dukungan Audio Visual:</strong>
            Asisten concierge meja resepsionis tersedia di ekstensi 104 untuk pengujian bridge video conference hybrid.
          </div>
          <div>
            <strong className="text-[#16191C] block mb-0.5">Kebijakan Pembatalan:</strong>
            Harap batalkan selambat-lambatnya 30 menit sebelum sesi dimulai agar bilik otomatis dibebaskan ke unit lain.
          </div>
        </div>
      </div>
    </div>
  );
};
