import React from 'react';
import { useBooking } from '../../context/BookingContext';
import { RoomOccupancyStat } from '../../types';
import { exportBookingsToCSV, exportStatsToCSV } from '../../utils/exportUtils';
import {
  BarChart3,
  Download,
  Printer,
  Building,
  TrendingUp,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { format } from 'date-fns';

export const ReportsPage: React.FC = () => {
  const { rooms, bookings } = useBooking();

  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');
  const nowTimeStr = format(now, 'HH:mm');

  // Filter khusus data laporan: Hanya yang SUDAH DISETUJUI dan SUDAH BERLANGSUNG / SEDANG BERLANGSUNG
  const completedConfirmedBookings = bookings
    .filter((b) => {
      if (b.status !== 'confirmed') return false;
      // Berlangsung jika tanggal sebelum hari ini ATAU hari ini dengan jam mulai <= jam sekarang
      if (b.date < todayStr) return true;
      if (b.date === todayStr && b.startTime <= nowTimeStr) return true;
      return false;
    })
    .sort((a, b) => `${b.date} ${b.startTime}`.localeCompare(`${a.date} ${a.startTime}`));

  // Kalkulasi statistik per ruangan berdasarkan rapat yang sudah disetujui & berlangsung
  const stats: RoomOccupancyStat[] = rooms.map((room) => {
    const roomCompletedBookings = completedConfirmedBookings.filter((b) => b.roomSlug === room.slug);
    const roomAllBookings = bookings.filter((b) => b.roomSlug === room.slug);
    const cancelledBookings = roomAllBookings.filter((b) => b.status === 'cancelled' || b.status === 'rejected');

    // Hitung total jam pemakaian yang terlaksana
    let totalHours = 0;
    roomCompletedBookings.forEach((b) => {
      const [startH, startM] = b.startTime.split(':').map(Number);
      const [endH, endM] = b.endTime.split(':').map(Number);
      const hours = (endH * 60 + endM - (startH * 60 + startM)) / 60;
      totalHours += Math.max(0, hours);
    });

    // Kapasitas kerja per bulan ~ 22 hari * 10 jam = 220 jam operasional
    const maxOperatingHours = 220;
    const occupancyRate = Math.min(100, (totalHours / maxOperatingHours) * 100);
    const cancellationRate =
      roomAllBookings.length > 0 ? (cancelledBookings.length / roomAllBookings.length) * 100 : 0;

    return {
      roomSlug: room.slug,
      roomName: room.name,
      totalBookings: roomCompletedBookings.length,
      totalHours,
      occupancyRate,
      cancellationRate,
    };
  });

  const totalCompletedBookings = completedConfirmedBookings.length;
  const totalAllBookings = bookings.length;
  const totalHoursAll = stats.reduce((acc, curr) => acc + curr.totalHours, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface rounded-card border border-border p-5 shadow-card no-print">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 size={22} className="text-primary" />
            <h1 className="text-xl font-bold text-text-primary">Laporan & Analitik Pemakaian Ruangan</h1>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Data metrik okupansi, total jam rapat, dan riwayat pemesanan untuk evaluasi manajemen.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportBookingsToCSV(completedConfirmedBookings)}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-text-primary rounded-btn text-sm font-semibold border border-border transition-colors"
          >
            <FileSpreadsheet size={14} className="text-emerald-700" />
            <span>Ekspor CSV Jadwal</span>
          </button>

          <button
            onClick={() => exportStatsToCSV(stats)}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-text-primary rounded-btn text-sm font-semibold border border-border transition-colors"
          >
            <Download size={14} />
            <span>Ekspor CSV Statistik</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-light text-white rounded-btn text-sm font-bold shadow-sm transition-colors"
          >
            <Printer size={14} />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Print-Only Official Report Header */}
      <div className="hidden print-only mb-6">
        <div className="text-center pb-3 border-b-2 border-black">
          <h2 className="text-sm font-bold tracking-widest uppercase">Kementerian Ketenagakerjaan Republik Indonesia</h2>
          <h1 className="text-lg font-black uppercase mt-0.5">Sekretariat Jenderal • Tata Usaha Sekjen</h1>
          <p className="text-xs text-stone-700 mt-1">Sistem Informasi Reservasi Ruang Rapat (SIRAPAT)</p>
          <div className="mt-3 pt-2 border-t border-stone-400">
            <h3 className="text-base font-extrabold uppercase tracking-wide">Laporan Rekapitulasi Pemakaian Ruang Rapat</h3>
            <p className="text-xs text-stone-600 mt-0.5">
              Dicetak pada: {format(new Date(), 'dd MMMM yyyy, HH:mm')} WIB
            </p>
          </div>
        </div>

        {/* Ringkasan Angka Kunci Cetak */}
        <div className="mt-4 mb-2 p-3 border border-black bg-stone-50 text-xs">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <span className="text-stone-600">Rapat Terlaksana: </span>
              <strong>{totalCompletedBookings} Rapat</strong>
            </div>
            <div>
              <span className="text-stone-600">Total Jam Pemakaian: </span>
              <strong>{totalHoursAll.toFixed(1)} Jam</strong>
            </div>
            <div>
              <span className="text-stone-600">Rata-rata Okupansi: </span>
              <strong>{(stats.reduce((acc, s) => acc + s.occupancyRate, 0) / (stats.length || 1)).toFixed(1)}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards (Web Only) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
        <div className="bg-surface rounded-card border border-border p-4 shadow-card">
          <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
            Total Rapat Terlaksana
          </div>
          <div className="text-2xl sm:text-3xl font-black text-text-primary mt-1">
            {totalCompletedBookings} <span className="text-sm text-text-secondary font-normal">Disetujui & Berlangsung</span>
          </div>
          <div className="text-sm text-text-secondary mt-1 flex items-center gap-1">
            <CheckCircle size={13} className="text-status-success" />
            <span>Dari total {totalAllBookings} permohonan masuk</span>
          </div>
        </div>

        <div className="bg-surface rounded-card border border-border p-4 shadow-card">
          <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
            Total Jam Pemakaian
          </div>
          <div className="text-2xl sm:text-3xl font-black text-primary mt-1 font-mono">
            {totalHoursAll.toFixed(1)} <span className="text-sm text-text-secondary font-normal">Jam</span>
          </div>
          <div className="text-sm text-text-secondary mt-1 flex items-center gap-1">
            <TrendingUp size={13} className="text-primary-light" />
            <span>Akumulasi seluruh ruangan</span>
          </div>
        </div>

        <div className="bg-surface rounded-card border border-border p-4 shadow-card">
          <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
            Rata-rata Okupansi Ruang
          </div>
          <div className="text-2xl sm:text-3xl font-black text-accent-dark mt-1 font-mono">
            {(stats.reduce((acc, s) => acc + s.occupancyRate, 0) / (stats.length || 1)).toFixed(1)}%
          </div>
          <div className="text-sm text-text-secondary mt-1 flex items-center gap-1">
            <Building size={13} className="text-accent" />
            <span>Target optimal instansi: 60 - 80%</span>
          </div>
        </div>
      </div>

      {/* Visual Okupansi per Ruangan (Web Only) */}
      <div className="bg-surface rounded-card border border-border p-5 shadow-card space-y-4 no-print">
        <h3 className="text-base font-bold text-text-primary uppercase tracking-wider">
          Perbandingan Okupansi & Jam Pemakaian per Ruangan
        </h3>

        <div className="space-y-4">
          {stats.map((s) => (
            <div key={s.roomSlug} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-text-primary">{s.roomName}</span>
                <span className="font-mono font-semibold text-text-secondary">
                  {s.totalHours.toFixed(1)} Jam ({s.occupancyRate.toFixed(1)}% Okupansi)
                </span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-3.5 overflow-hidden border border-border flex">
                <div
                  className="bg-primary h-full rounded-full transition-all"
                  style={{ width: `${Math.max(5, s.occupancyRate)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabel 1: Rekapitulasi Okupansi Ruangan (Web & Print) */}
      <div className="bg-surface rounded-card border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border bg-stone-50/50 flex items-center justify-between">
          <h3 className="text-base font-bold text-text-primary">
            I. Rekapitulasi Penggunaan & Okupansi Ruang Rapat
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm print-table">
            <thead className="bg-stone-100 text-text-secondary font-semibold border-b border-border">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center">No</th>
                <th className="py-2.5 px-3">Nama Ruangan</th>
                <th className="py-2.5 px-3 text-center">Jumlah Rapat</th>
                <th className="py-2.5 px-3 text-center">Total Jam</th>
                <th className="py-2.5 px-3 text-center">Tingkat Okupansi</th>
                <th className="py-2.5 px-3 text-center">Tingkat Pembatalan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.map((s, idx) => (
                <tr key={s.roomSlug} className="hover:bg-stone-50">
                  <td className="py-2.5 px-3 text-center font-medium">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-bold text-text-primary">{s.roomName}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-semibold">{s.totalBookings} kali</td>
                  <td className="py-2.5 px-3 text-center font-mono font-semibold">{s.totalHours.toFixed(1)} jam</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-primary">
                    {s.occupancyRate.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-stone-500">
                    {s.cancellationRate.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabel 2: Rincian Daftar Booking & Agenda Rapat (Hanya Rapat Disetujui & Terlaksana) */}
      <div className="bg-surface rounded-card border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border bg-stone-50/50 flex items-center justify-between">
          <h3 className="text-base font-bold text-text-primary">
            II. Daftar Riwayat Agenda Rapat (Disetujui & Terlaksana)
          </h3>
          <span className="text-xs text-text-secondary font-medium no-print">
            Total {completedConfirmedBookings.length} Agenda Terlaksana
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm print-table">
            <thead className="bg-stone-100 text-text-secondary font-semibold border-b border-border">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">No</th>
                <th className="py-2.5 px-3 w-28">Tanggal</th>
                <th className="py-2.5 px-3 w-24 text-center">Waktu</th>
                <th className="py-2.5 px-3 w-40">Ruangan</th>
                <th className="py-2.5 px-3">Agenda / Nama Kegiatan</th>
                <th className="py-2.5 px-3 w-36">Pemohon</th>
                <th className="py-2.5 px-3 w-36">Unit Kerja</th>
                <th className="py-2.5 px-3 w-24 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {completedConfirmedBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-text-secondary">
                    Belum ada data rapat yang disetujui dan telah berlangsung.
                  </td>
                </tr>
              ) : (
                completedConfirmedBookings.map((b, idx) => (
                  <tr key={b.id} className="hover:bg-stone-50">
                    <td className="py-2.5 px-3 text-center font-medium">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono text-xs">{b.date}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-xs whitespace-nowrap">
                      {b.startTime} - {b.endTime}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-text-primary">{b.roomName}</td>
                    <td className="py-2.5 px-3 font-medium text-text-primary">{b.title}</td>
                    <td className="py-2.5 px-3">{b.organizerName}</td>
                    <td className="py-2.5 px-3 text-stone-600">{b.organizerDept}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-xs text-emerald-800">
                      Disetujui
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print-Only Signature Section */}
      <div className="hidden print-only mt-8 pt-4">
        <div className="flex justify-end">
          <div className="text-center w-64">
            <p className="text-xs">Jakarta, {format(new Date(), 'dd MMMM yyyy')}</p>
            <p className="text-xs font-bold mt-1">Pengelola Ruang Rapat TU SEKJEN</p>
            <div className="h-20" />
            <p className="text-xs font-bold border-t border-black pt-1">
              ( ___________________________ )
            </p>
            <p className="text-[10px] text-stone-600">NIP. ...................................................</p>
          </div>
        </div>
      </div>
    </div>
  );
};
