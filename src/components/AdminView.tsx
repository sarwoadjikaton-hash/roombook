import React, { useState } from 'react';
import { Room, Booking, ActivityLog, AdminUser } from '../types';
import { 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Power, 
  Download, 
  BarChart3, 
  History, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Search, 
  Filter,
  FileSpreadsheet,
  Printer,
  SlidersHorizontal,
  Building
} from 'lucide-react';
import { CURRENT_ADMIN, isOverlapping, generateBookingCode } from '../data/initialData';
import { OccupancyAnalyticsDashboard } from './OccupancyAnalyticsDashboard';

interface AdminViewProps {
  rooms: Room[];
  bookings: Booking[];
  logs: ActivityLog[];
  onUpdateRooms: (rooms: Room[]) => void;
  onUpdateBooking: (booking: Booking, log: ActivityLog) => void;
  onCancelBooking: (bookingId: string, log: ActivityLog) => void;
  onCreateBooking: (booking: Booking, log: ActivityLog) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  rooms,
  bookings,
  logs,
  onUpdateRooms,
  onUpdateBooking,
  onCancelBooking,
  onCreateBooking,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'reports' | 'logs'>('overview');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Manual Walk-in form state
  const [walkinRoomId, setWalkinRoomId] = useState<string>('sekjen');
  const [walkinStartTime, setWalkinStartTime] = useState<string>('16:00');
  const [walkinEndTime, setWalkinEndTime] = useState<string>('17:30');
  const [walkinName, setWalkinName] = useState<string>('Bagas Prakoso (Biro Hukum)');
  const [walkinTitle, setWalkinTitle] = useState<string>('Telaah Berkas Kontrak Kerjasama Luar Negeri');
  const [walkinParticipants, setWalkinParticipants] = useState<number>(8);
  const [walkinSuccessMsg, setWalkinSuccessMsg] = useState<string | null>(null);

  // Edit Room modal
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    if (selectedRoomFilter !== 'all' && b.roomId !== selectedRoomFilter) return false;
    if (selectedStatusFilter !== 'all' && b.status !== selectedStatusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        b.meetingTitle.toLowerCase().includes(q) ||
        b.bookerName.toLowerCase().includes(q) ||
        b.bookingCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleWalkinSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const targetRoom = rooms.find((r) => r.id === walkinRoomId) || rooms[0];
    const bookingCode = generateBookingCode();
    const token = `tok_${bookingCode.replace('BKG-', '')}_adm`;
    const googleId = `gcal_${Math.random().toString(36).substring(2, 11)}`;

    const newBooking: Booking = {
      id: `bkg-${Date.now()}`,
      bookingCode,
      roomId: targetRoom.id,
      roomName: targetRoom.name,
      bookerName: walkinName,
      bookerEmail: 'admin.office@instansi.go.id',
      division: 'Disposisi Sekretariat / Walk-in',
      meetingTitle: walkinTitle,
      date: '2026-09-10',
      startTime: walkinStartTime,
      endTime: walkinEndTime,
      participantCount: walkinParticipants,
      attendeesEmails: ['admin.office@instansi.go.id'],
      extraNotes: 'Reservasi manual walk-in concierge',
      status: 'confirmed',
      googleEventId: googleId,
      manageToken: token,
      createdAt: '2026-09-10 10:00',
    };

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: '10 Sep 2026, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      actor: CURRENT_ADMIN.name + ' (Admin)',
      division: 'Office Manager',
      action: 'overridden',
      roomName: targetRoom.name,
      bookingCode,
      googleSyncId: googleId,
      details: `Reservasi manual walk-in didelegasikan untuk "${walkinTitle}" (${walkinStartTime} - ${walkinEndTime} WIB).`,
    };

    onCreateBooking(newBooking, newLog);
    setWalkinSuccessMsg(`Reservasi manual ${bookingCode} berhasil dibukukan dan disinkronisasi ke Google Calendar!`);
    setTimeout(() => setWalkinSuccessMsg(null), 4000);
  };

  const handleToggleRoomStatus = (roomId: string) => {
    const updated = rooms.map((r) => {
      if (r.id === roomId) {
        return {
          ...r,
          status: (r.status === 'active' ? 'maintenance' : 'active') as 'active' | 'maintenance',
        };
      }
      return r;
    });
    onUpdateRooms(updated);
  };

  const handleSaveRoomEdit = (updatedRoom: Room) => {
    const updated = rooms.map((r) => (r.id === updatedRoom.id ? updatedRoom : r));
    onUpdateRooms(updated);
    setEditingRoom(null);
  };

  const exportReport = () => {
    alert('Laporan Okupansi & Ledger Reservasi berhasil diekspor dalam format CSV/Excel.');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-12 py-8 md:py-12 flex flex-col gap-8">
      {/* Top Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#55524A]/15">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#55524A]">
            <span>RUANG KERJA CONCIERGE BACK-OFFICE</span>
            <span className="w-1 h-1 rounded-full bg-[#A9822D]"></span>
            <span>GOOGLE SSO TERHUBUNG ({CURRENT_ADMIN.email})</span>
          </div>
          <h1 className="font-serif-title text-3xl md:text-5xl text-[#16191C] font-normal mt-1 tracking-tight">
            Buku Kendali & Manajemen Ruangan
          </h1>
          <p className="text-sm text-[#55524A] mt-1 max-w-2xl">
            Kelola alokasi bilik rapat, sinkronisasi Google Calendar dua arah, dan pengawasan reservasi harian tanpa jeda (FR-13 s/d FR-20).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportReport}
            className="px-4 py-2 border border-[#16191C] text-[#16191C] text-xs font-medium rounded hover:bg-[#E4DBC8] transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-[#16191C] text-[#F1ECDF] text-xs font-medium rounded hover:bg-[#16191C]/90 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-[#A9822D]" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </section>

      {/* Admin Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-[#55524A]/20 pb-1 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium transition-all relative ${
            activeTab === 'overview'
              ? 'text-[#16191C] border-b-2 border-[#A9822D] font-semibold'
              : 'text-[#55524A] hover:text-[#16191C]'
          }`}
        >
          Ikhtisar & Jadwal Ledger
        </button>

        <button
          onClick={() => setActiveTab('rooms')}
          className={`px-4 py-2 font-medium transition-all relative ${
            activeTab === 'rooms'
              ? 'text-[#16191C] border-b-2 border-[#A9822D] font-semibold'
              : 'text-[#55524A] hover:text-[#16191C]'
          }`}
        >
          Manajemen Bilik Ruangan
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 font-medium transition-all relative flex items-center gap-1.5 ${
            activeTab === 'reports'
              ? 'text-[#16191C] border-b-2 border-[#A9822D] font-semibold'
              : 'text-[#55524A] hover:text-[#16191C]'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-[#A9822D]" />
          <span>Dashboard Analitik & Okupansi</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 font-medium transition-all relative ${
            activeTab === 'logs'
              ? 'text-[#16191C] border-b-2 border-[#A9822D] font-semibold'
              : 'text-[#55524A] hover:text-[#16191C]'
          }`}
        >
          Log Audit Trail ({logs.length})
        </button>
      </div>

      {/* Tab 1: Overview & Ledger */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* 3 Room Status Panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rooms.map((room) => {
              const active = bookings.find(
                (b) =>
                  b.roomId === room.id &&
                  b.date === '2026-09-10' &&
                  b.status === 'in-progress'
              );
              const isOccupied = Boolean(active);
              const roomSessions = bookings.filter(
                (b) => b.roomId === room.id && b.date === '2026-09-10' && b.status !== 'cancelled'
              ).length;

              return (
                <div
                  key={room.id}
                  className="bg-[#E4DBC8]/50 p-5 rounded border border-[#55524A]/20 flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-[#55524A]">{room.location}</span>
                      <span
                        className={`flex items-center gap-1.5 font-semibold ${
                          room.status === 'maintenance'
                            ? 'text-[#55524A]'
                            : isOccupied
                            ? 'text-[#6B2A2E]'
                            : 'text-[#26392E]'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            room.status === 'maintenance'
                              ? 'bg-[#55524A]'
                              : isOccupied
                              ? 'bg-[#6B2A2E]'
                              : 'bg-[#26392E]'
                          }`}
                        ></span>
                        {room.status === 'maintenance'
                          ? 'Perawatan'
                          : isOccupied
                          ? 'Sedang Digunakan'
                          : 'Tersedia'}
                      </span>
                    </div>

                    <h3 className="font-serif-title text-xl text-[#16191C] font-normal">
                      {room.name}
                    </h3>
                    <p className="text-xs text-[#55524A] mt-0.5">
                      Kapasitas {room.capacity} Orang • ID: <code className="font-mono text-[#16191C]">{room.id}</code>
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#55524A]/15 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[#55524A] block text-[11px]">Sesi Hari Ini:</span>
                      <span className="font-medium text-sm text-[#16191C]">{roomSessions} Agenda</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('reports')}
                      className="text-right group hover:opacity-80 transition-opacity cursor-pointer"
                      title="Buka analisis okupansi bilik ini di Dashboard Analitik"
                    >
                      <span className="text-[#55524A] block text-[11px] group-hover:text-[#A9822D]">
                        Okupansi ↗:
                      </span>
                      <span className="font-serif-title text-xl text-[#16191C] font-medium group-hover:text-[#A9822D]">
                        {room.id === 'sekjen' ? '82%' : room.id === 'vip' ? '76%' : '58%'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ledger Table & Quick Filter Controls */}
          <div className="bg-[#F1ECDF] p-6 rounded border border-[#55524A]/20 shadow-xs space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#55524A]/15">
              <div>
                <h2 className="font-serif-title text-xl text-[#16191C] font-medium">
                  Ledger Reservasi Seluruh Bilik
                </h2>
                <p className="text-xs text-[#55524A] mt-0.5">
                  Pantau, ubah, atau batalkan agenda rapat dari bilik mana pun secara terpusat.
                </p>
              </div>

              {/* Search & Filters */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari agenda / pemesan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border border-[#55524A]/30 rounded px-3 py-1.5 pl-8 text-xs text-[#16191C] focus:outline-none focus:border-[#A9822D]"
                  />
                  <Search className="w-3.5 h-3.5 text-[#55524A] absolute left-2.5 top-2" />
                </div>

                <select
                  value={selectedRoomFilter}
                  onChange={(e) => setSelectedRoomFilter(e.target.value)}
                  className="bg-transparent border border-[#55524A]/30 rounded px-3 py-1.5 text-xs text-[#16191C] focus:outline-none"
                >
                  <option value="all">Semua Ruangan</option>
                  <option value="sekjen">Ruang Sekjen</option>
                  <option value="vip">Ruang VIP</option>
                  <option value="transit">Ruang Transit</option>
                </select>

                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-transparent border border-[#55524A]/30 rounded px-3 py-1.5 text-xs text-[#16191C] focus:outline-none"
                >
                  <option value="all">Semua Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in-progress">Sedang Berjalan</option>
                  <option value="completed">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#E4DBC8] text-[#55524A] font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4">Ruangan</th>
                    <th className="py-3 px-4">Agenda Rapat & Pemohon</th>
                    <th className="py-3 px-4">Peserta</th>
                    <th className="py-3 px-4">Sync ID</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#55524A]/10 text-xs">
                  {filteredBookings.map((b) => {
                    const isInProgress = b.status === 'in-progress';

                    return (
                      <tr
                        key={b.id}
                        className={`hover:bg-[#E4DBC8]/30 transition-colors ${
                          isInProgress ? 'bg-[#E4DBC8]/50 border-l-2 border-[#A9822D]' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono whitespace-nowrap text-[#16191C] font-medium">
                          {b.startTime} - {b.endTime}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-[#16191C] whitespace-nowrap">
                          {b.roomName}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-[#16191C] text-[13px]">{b.meetingTitle}</span>
                            <span className="text-[#55524A]">
                              {b.bookerName} • {b.division}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-[#55524A]">
                          {b.participantCount} Pax
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#55524A] whitespace-nowrap">
                          {b.googleEventId}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                              b.status === 'confirmed'
                                ? 'bg-[#26392E]/10 text-[#26392E]'
                                : b.status === 'in-progress'
                                ? 'bg-[#6B2A2E]/10 text-[#6B2A2E]'
                                : b.status === 'cancelled'
                                ? 'bg-[#55524A]/10 text-[#55524A] line-through'
                                : 'bg-[#55524A]/10 text-[#55524A]'
                            }`}
                          >
                            ● {b.status === 'in-progress' ? 'Sedang Berjalan' : b.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {b.status !== 'cancelled' && (
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const newLog: ActivityLog = {
                                    id: `log-${Date.now()}`,
                                    timestamp: '10 Sep 2026, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
                                    actor: 'Admin Office',
                                    division: 'Meja Concierge',
                                    action: 'cancelled',
                                    roomName: b.roomName,
                                    bookingCode: b.bookingCode,
                                    googleSyncId: b.googleEventId,
                                    details: `Booking ${b.bookingCode} dibatalkan langsung oleh Admin.`,
                                  };
                                  onCancelBooking(b.id, newLog);
                                }}
                                className="text-[#6B2A2E] hover:underline font-medium"
                              >
                                Batalkan
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Walk-in Manual Reservation Form (FR-16) */}
          <div className="bg-[#E4DBC8]/50 p-6 rounded border border-[#55524A]/20 shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <Plus className="w-4 h-4 text-[#A9822D]" />
              <h2 className="font-serif-title text-xl text-[#16191C] font-medium">
                Reservasi Petugas & Walk-In Cepat (FR-16)
              </h2>
            </div>
            <p className="text-xs text-[#55524A] mb-4">
              Gunakan instrumen ini untuk delegasi mendesak atau disposisi pimpinan tanpa perlu verifikasi surel publik.
            </p>

            {walkinSuccessMsg && (
              <div className="p-3 bg-[#26392E]/10 border border-[#26392E]/30 text-[#26392E] rounded text-xs mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{walkinSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleWalkinSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="text-[#55524A] block mb-1 font-medium">Bilik Ruangan</label>
                <select
                  value={walkinRoomId}
                  onChange={(e) => setWalkinRoomId(e.target.value)}
                  className="w-full bg-[#F1ECDF] border border-[#55524A]/30 rounded px-3 py-2 text-xs text-[#16191C] focus:outline-none"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.capacity} Pax)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#55524A] block mb-1 font-medium">Jam Mulai - Selesai</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    value={walkinStartTime}
                    onChange={(e) => setWalkinStartTime(e.target.value)}
                    className="bg-[#F1ECDF] border border-[#55524A]/30 rounded px-2 py-2 text-xs font-mono"
                  />
                  <input
                    type="time"
                    value={walkinEndTime}
                    onChange={(e) => setWalkinEndTime(e.target.value)}
                    className="bg-[#F1ECDF] border border-[#55524A]/30 rounded px-2 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#55524A] block mb-1 font-medium">Nama Pemohon & Unit</label>
                <input
                  type="text"
                  required
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  className="w-full bg-[#F1ECDF] border border-[#55524A]/30 rounded px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="text-[#55524A] block mb-1 font-medium">Perihal Agenda Rapat</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={walkinTitle}
                    onChange={(e) => setWalkinTitle(e.target.value)}
                    className="w-full bg-[#F1ECDF] border border-[#55524A]/30 rounded px-3 py-2 text-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#16191C] text-[#F1ECDF] font-medium rounded hover:bg-[#16191C]/90 shrink-0 text-xs shadow-xs"
                  >
                    Bukukan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Room Management */}
      {activeTab === 'rooms' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-[#55524A]/15">
            <div>
              <h2 className="font-serif-title text-xl text-[#16191C] font-medium">
                Inventaris & Manajemen Bilik Ruangan (FR-4 & FR-5)
              </h2>
              <p className="text-xs text-[#55524A]">
                Konfigurasikan kapasitas, fasilitas, dan status aktif bilik secara langsung tanpa mengganggu sinkronisasi kalender.
              </p>
            </div>
            <span className="text-xs text-[#26392E] font-medium bg-[#26392E]/10 px-3 py-1 rounded">
              {rooms.filter((r) => r.status === 'active').length} Bilik Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className={`bg-[#F1ECDF] p-6 rounded border shadow-xs flex flex-col justify-between ${
                  room.status === 'maintenance' ? 'border-[#6B2A2E]/30 opacity-75' : 'border-[#55524A]/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-[#55524A]">{room.location}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        room.status === 'active'
                          ? 'bg-[#26392E]/10 text-[#26392E]'
                          : 'bg-[#6B2A2E]/10 text-[#6B2A2E]'
                      }`}
                    >
                      {room.status === 'active' ? 'Aktif' : 'Perawatan'}
                    </span>
                  </div>

                  <h3 className="font-serif-title text-2xl text-[#16191C] font-normal mb-1">
                    {room.name}
                  </h3>
                  <p className="text-xs text-[#55524A] mb-4">{room.description}</p>

                  <div className="space-y-2 text-xs bg-[#E4DBC8]/40 p-3 rounded">
                    <div>
                      <strong className="text-[#16191C]">Kapasitas:</strong> {room.capacity} Orang
                    </div>
                    <div>
                      <strong className="text-[#16191C]">Google Calendar ID:</strong>
                      <code className="font-mono text-[11px] block mt-0.5 text-[#16191C]">{room.googleCalendarId}</code>
                    </div>
                    <div>
                      <strong className="text-[#16191C]">Fasilitas:</strong>
                      <ul className="list-disc list-inside text-[#55524A] mt-1 space-y-0.5">
                        {room.facilities.map((f) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#55524A]/15 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setEditingRoom(room)}
                    className="text-[#16191C] hover:text-[#A9822D] font-medium flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Sunting Data</span>
                  </button>

                  <button
                    onClick={() => handleToggleRoomStatus(room.id)}
                    className={`flex items-center gap-1 font-medium ${
                      room.status === 'active' ? 'text-[#6B2A2E] hover:underline' : 'text-[#26392E] hover:underline'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{room.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Usage Reports & Occupancy Analytics (FR-18) */}
      {activeTab === 'reports' && (
        <OccupancyAnalyticsDashboard rooms={rooms} bookings={bookings} />
      )}

      {/* Tab 4: Activity Log & Audit Trail (FR-19) */}
      {activeTab === 'logs' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-[#55524A]/15">
            <div>
              <h2 className="font-serif-title text-xl text-[#16191C] font-medium">
                Log Aktivitas & Audit Trail Reservasi (FR-19)
              </h2>
              <p className="text-xs text-[#55524A]">
                Pencatatan real-time aksi booking, modifikasi, dan pelepasan ruangan dengan Google Calendar Sync ID.
              </p>
            </div>
            <span className="text-xs text-[#26392E] font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#26392E]" /> Live Logging Aktif
            </span>
          </div>

          <div className="bg-[#F1ECDF] rounded border border-[#55524A]/20 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#E4DBC8] text-[#55524A] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Waktu Aksi</th>
                  <th className="py-3 px-4">Aktor / Pemohon</th>
                  <th className="py-3 px-4">Aksi Ledger</th>
                  <th className="py-3 px-4">Ruangan</th>
                  <th className="py-3 px-4">Kode Tiket</th>
                  <th className="py-3 px-4">Rincian Perubahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#55524A]/10 text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#E4DBC8]/30">
                    <td className="py-3 px-4 font-mono text-[#55524A] whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-3 px-4 font-medium text-[#16191C]">
                      <div>{log.actor}</div>
                      <div className="text-[11px] text-[#55524A] font-normal">{log.division}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          log.action === 'created'
                            ? 'bg-[#26392E]/10 text-[#26392E]'
                            : log.action === 'modified'
                            ? 'bg-[#A9822D]/10 text-[#A9822D]'
                            : log.action === 'cancelled'
                            ? 'bg-[#6B2A2E]/10 text-[#6B2A2E]'
                            : 'bg-[#16191C]/10 text-[#16191C]'
                        }`}
                      >
                        ● {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-[#16191C] whitespace-nowrap">{log.roomName}</td>
                    <td className="py-3 px-4 font-mono text-[#A9822D]">{log.bookingCode}</td>
                    <td className="py-3 px-4 text-[#55524A] max-w-sm">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {editingRoom && (
        <div className="fixed inset-0 z-50 bg-[#16191C]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F1ECDF] max-w-lg w-full p-6 rounded shadow-2xl border border-[#55524A]/20">
            <h3 className="font-serif-title text-xl text-[#16191C] mb-1">
              Sunting Data {editingRoom.name}
            </h3>
            <p className="text-xs text-[#55524A] mb-4">
              Konfigurasi kapasitas, fasilitas, dan Google Calendar ID.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-[#55524A] block mb-1">Nama Bilik</label>
                <input
                  type="text"
                  value={editingRoom.name}
                  onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })}
                  className="w-full bg-transparent border-b border-[#55524A]/40 py-1.5 text-sm text-[#16191C] focus:outline-none focus:border-[#A9822D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-[#55524A] block mb-1">Kapasitas (Pax)</label>
                  <input
                    type="number"
                    value={editingRoom.capacity}
                    onChange={(e) => setEditingRoom({ ...editingRoom, capacity: Number(e.target.value) })}
                    className="w-full bg-transparent border-b border-[#55524A]/40 py-1.5 text-sm text-[#16191C] focus:outline-none focus:border-[#A9822D]"
                  />
                </div>
                <div>
                  <label className="font-medium text-[#55524A] block mb-1">Lokasi Gedung</label>
                  <input
                    type="text"
                    value={editingRoom.location}
                    onChange={(e) => setEditingRoom({ ...editingRoom, location: e.target.value })}
                    className="w-full bg-transparent border-b border-[#55524A]/40 py-1.5 text-sm text-[#16191C] focus:outline-none focus:border-[#A9822D]"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-[#55524A] block mb-1">Google Calendar Resource ID</label>
                <input
                  type="text"
                  value={editingRoom.googleCalendarId}
                  onChange={(e) => setEditingRoom({ ...editingRoom, googleCalendarId: e.target.value })}
                  className="w-full bg-transparent border-b border-[#55524A]/40 py-1.5 text-sm font-mono text-[#16191C] focus:outline-none focus:border-[#A9822D]"
                />
              </div>

              <div>
                <label className="font-medium text-[#55524A] block mb-1">Deskripsi Bilik</label>
                <textarea
                  rows={2}
                  value={editingRoom.description}
                  onChange={(e) => setEditingRoom({ ...editingRoom, description: e.target.value })}
                  className="w-full bg-transparent border-b border-[#55524A]/40 py-1.5 text-xs text-[#16191C] focus:outline-none focus:border-[#A9822D]"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingRoom(null)}
                className="px-4 py-2 text-xs text-[#55524A]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleSaveRoomEdit(editingRoom)}
                className="px-5 py-2 bg-[#16191C] text-[#F1ECDF] text-xs font-medium rounded hover:bg-[#16191C]/90"
              >
                Simpan Data Ruangan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
