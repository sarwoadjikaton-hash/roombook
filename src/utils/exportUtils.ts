import { Booking, RoomOccupancyStat } from '../types';

export const exportBookingsToCSV = (bookings: Booking[], filename: string = 'laporan-booking-ruang-rapat.csv') => {
  const headers = [
    'ID Booking',
    'Ruangan',
    'Nama Rapat',
    'Tanggal',
    'Waktu Mulai',
    'Waktu Selesai',
    'Pemohon',
    'Email Pemohon',
    'Unit Kerja',
    'Jumlah Peserta',
    'Status',
    'Sinkron Google Calendar'
  ];

  const rows = bookings.map((b) => [
    b.id,
    `"${b.roomName}"`,
    `"${b.title.replace(/"/g, '""')}"`,
    b.date,
    b.startTime,
    b.endTime,
    `"${b.organizerName}"`,
    b.organizerEmail,
    `"${b.organizerDept}"`,
    b.attendeeCount,
    b.status.toUpperCase(),
    b.syncedToGoogle ? 'YA' : 'TIDAK'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(','))
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportStatsToCSV = (stats: RoomOccupancyStat[], filename: string = 'rekap-okupansi-ruangan.csv') => {
  const headers = ['Ruangan', 'Total Booking', 'Total Jam Pemakaian', 'Tingkat Okupansi (%)', 'Tingkat Pembatalan (%)'];
  const rows = stats.map((s) => [
    `"${s.roomName}"`,
    s.totalBookings,
    s.totalHours.toFixed(1),
    `${s.occupancyRate.toFixed(1)}%`,
    `${s.cancellationRate.toFixed(1)}%`
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
