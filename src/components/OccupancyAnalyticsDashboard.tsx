import React, { useState, useMemo } from 'react';
import { Room, Booking } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  ReferenceLine
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Clock,
  Users,
  Percent,
  Download,
  Filter,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  Building2,
  FileSpreadsheet,
  Activity,
  Award,
  ChevronRight,
  Lightbulb,
  Sparkles,
  ShieldAlert,
  Zap,
  CheckCheck,
  FileText,
  Printer,
  Sliders,
  AlertCircle,
  X
} from 'lucide-react';

interface OccupancyAnalyticsDashboardProps {
  rooms: Room[];
  bookings: Booking[];
}

// Helper to convert "HH:MM" to fractional hour number (e.g. "09:30" => 9.5)
const parseTimeToFraction = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map(Number);
  return h + (m || 0) / 60;
};

// Colors adhering to Concierge Ledger aesthetic
const PALETTE = {
  sekjen: '#16191C',   // Primary Dark Charcoal
  vip: '#A9822D',      // Brushed Brass / Gold
  transit: '#26392E',  // Deep Bottle Green
  accent: '#6B2A2E',   // Bordeaux Wine
  muted: '#55524A',    // Muted Granite
  parchment: '#E4DBC8',// Warm Parchment
  bgLight: '#F1ECDF',  // Cream Paper
};

const PIE_COLORS = [
  '#16191C', // Dark Charcoal
  '#A9822D', // Brushed Gold
  '#26392E', // Forest Green
  '#6B2A2E', // Wine Bordeaux
  '#4A5568', // Slate Navy
  '#8A6D3B', // Antique Gold
  '#3E4E42', // Moss Green
];

export const OccupancyAnalyticsDashboard: React.FC<OccupancyAnalyticsDashboardProps> = ({
  rooms,
  bookings,
}) => {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'comparison'>('weekly');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-10');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('all');
  const [metricDisplay, setMetricDisplay] = useState<'hours' | 'rate'>('hours');
  const [appliedSuggestions, setAppliedSuggestions] = useState<string[]>(['sug-3']);
  const [suggestionCategoryFilter, setSuggestionCategoryFilter] = useState<'all' | 'high' | 'operational'>('all');
  const [showMemoModal, setShowMemoModal] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);

  // Toggle single suggestion
  const handleToggleSuggestion = (id: string, title: string) => {
    setAppliedSuggestions((prev) => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter((item) => item !== id) : [...prev, id];
      setShowSuccessToast(
        exists
          ? `Kebijakan "${title}" dinonaktifkan.`
          : `Rekomendasi "${title}" berhasil diterapkan ke sistem buku kendali.`
      );
      setTimeout(() => setShowSuccessToast(null), 3500);
      return updated;
    });
  };

  // Apply all suggestions
  const handleApplyAllSuggestions = () => {
    const allIds = ['sug-1', 'sug-2', 'sug-3', 'sug-4', 'sug-5'];
    setAppliedSuggestions(allIds);
    setShowSuccessToast('Semua 5 rekomendasi efisiensi berhasil diterapkan serentak!');
    setTimeout(() => setShowSuccessToast(null), 3500);
  };

  // Filter non-cancelled bookings
  const validBookings = useMemo(() => {
    return bookings.filter((b) => b.status !== 'cancelled');
  }, [bookings]);

  // Operational definition: 08:00 - 18:00 = 10 hours daily per active room
  const dailyOperatingHours = 10;
  const activeRooms = useMemo(() => rooms.filter((r) => r.status === 'active'), [rooms]);

  // -------------------------------------------------------------
  // 1. DAILY HOURLY OCCUPANCY CALCULATION (08:00 - 18:00)
  // -------------------------------------------------------------
  const dailyHourlyData = useMemo(() => {
    const hoursSlots = [
      '08:00', '09:00', '10:00', '11:00', '12:00', 
      '13:00', '14:00', '15:00', '16:00', '17:00'
    ];

    const dayBookings = validBookings.filter((b) => b.date === selectedDate);

    return hoursSlots.map((slot) => {
      const slotStart = parseTimeToFraction(slot);
      const slotEnd = slotStart + 1;

      // Check overlap for each room
      let sekjenHours = 0;
      let vipHours = 0;
      let transitHours = 0;
      const meetingTitles: string[] = [];

      dayBookings.forEach((b) => {
        const bStart = parseTimeToFraction(b.startTime);
        const bEnd = parseTimeToFraction(b.endTime);

        const overlap = Math.max(0, Math.min(slotEnd, bEnd) - Math.max(slotStart, bStart));
        if (overlap > 0) {
          if (b.roomId === 'sekjen') sekjenHours += overlap;
          else if (b.roomId === 'vip') vipHours += overlap;
          else if (b.roomId === 'transit') transitHours += overlap;

          meetingTitles.push(`${b.roomName}: ${b.meetingTitle} (${b.startTime} - ${b.endTime})`);
        }
      });

      const totalOccupiedHours = sekjenHours + vipHours + transitHours;
      const totalRoomCapacity = activeRooms.length; // 3 rooms
      const occupancyRate = Math.min(100, Math.round((totalOccupiedHours / totalRoomCapacity) * 100));

      const isPeak = occupancyRate >= 65;

      return {
        hour: slot,
        hourEnd: `${String(parseInt(slot) + 1).padStart(2, '0')}:00`,
        'Ruang Rapat Sekjen': Number(sekjenHours.toFixed(1)),
        'Ruang VIP': Number(vipHours.toFixed(1)),
        'Ruang Transit': Number(transitHours.toFixed(1)),
        totalHours: Number(totalOccupiedHours.toFixed(1)),
        occupancyRate,
        isPeak,
        meetings: meetingTitles,
      };
    });
  }, [validBookings, selectedDate, activeRooms]);

  // -------------------------------------------------------------
  // 2. WEEKLY OCCUPANCY CALCULATION (Senin - Sabtu)
  // -------------------------------------------------------------
  const weeklyData = useMemo(() => {
    const daysConfig = [
      { key: '2026-09-07', label: 'Senin', shortDate: '07/09' },
      { key: '2026-09-08', label: 'Selasa', shortDate: '08/09' },
      { key: '2026-09-09', label: 'Rabu', shortDate: '09/09' },
      { key: '2026-09-10', label: 'Kamis', shortDate: '10/09' },
      { key: '2026-09-11', label: 'Jumat', shortDate: '11/09' },
      { key: '2026-09-12', label: 'Sabtu', shortDate: '12/09' },
    ];

    return daysConfig.map((day) => {
      const dayBookings = validBookings.filter((b) => b.date === day.key);

      let sekjenHours = 0;
      let vipHours = 0;
      let transitHours = 0;
      let totalParticipants = 0;

      dayBookings.forEach((b) => {
        const dur = Math.max(0.5, parseTimeToFraction(b.endTime) - parseTimeToFraction(b.startTime));
        totalParticipants += b.participantCount || 0;

        if (b.roomId === 'sekjen') sekjenHours += dur;
        else if (b.roomId === 'vip') vipHours += dur;
        else if (b.roomId === 'transit') transitHours += dur;
      });

      const totalHours = sekjenHours + vipHours + transitHours;
      // 10 operating hours * active rooms capacity
      const maxDailyRoomHours = dailyOperatingHours * activeRooms.length; // 30 hours max per day
      const occupancyRate = Math.min(100, Math.round((totalHours / maxDailyRoomHours) * 100));

      return {
        day: day.label,
        date: day.key,
        shortDate: day.shortDate,
        'Ruang Rapat Sekjen': Number(sekjenHours.toFixed(1)),
        'Ruang VIP': Number(vipHours.toFixed(1)),
        'Ruang Transit': Number(transitHours.toFixed(1)),
        totalHours: Number(totalHours.toFixed(1)),
        sessionsCount: dayBookings.length,
        totalParticipants,
        occupancyRate,
        targetRate: 70, // Benchmark KPI 70%
      };
    });
  }, [validBookings, activeRooms]);

  // -------------------------------------------------------------
  // 3. ROOM COMPARISON METRICS (Utilisasi per Bilik)
  // -------------------------------------------------------------
  const roomComparisonData = useMemo(() => {
    return rooms.map((room) => {
      const roomBookings = validBookings.filter((b) => b.roomId === room.id);
      const totalHours = roomBookings.reduce((sum, b) => {
        return sum + Math.max(0.5, parseTimeToFraction(b.endTime) - parseTimeToFraction(b.startTime));
      }, 0);

      // 6 days * 10 operating hours = 60 hours weekly availability per room
      const totalWeeklyAvailableHours = 6 * dailyOperatingHours;
      const occupancyRate = Math.min(100, Math.round((totalHours / totalWeeklyAvailableHours) * 100));

      const totalAttendees = roomBookings.reduce((sum, b) => sum + (b.participantCount || 0), 0);
      const avgAttendees = roomBookings.length > 0 ? Math.round(totalAttendees / roomBookings.length) : 0;
      const capacityUtilization = Math.min(100, Math.round((avgAttendees / room.capacity) * 100));

      return {
        id: room.id,
        name: room.name,
        capacity: room.capacity,
        totalHours: Number(totalHours.toFixed(1)),
        sessions: roomBookings.length,
        occupancyRate,
        avgAttendees,
        capacityUtilization,
      };
    });
  }, [rooms, validBookings]);

  // -------------------------------------------------------------
  // 4. DIVISION / UNIT KERJA BREAKDOWN (Pie & Distribution)
  // -------------------------------------------------------------
  const divisionData = useMemo(() => {
    const divMap: { [key: string]: { count: number; hours: number } } = {};

    validBookings.forEach((b) => {
      const dur = Math.max(0.5, parseTimeToFraction(b.endTime) - parseTimeToFraction(b.startTime));
      const dName = b.division || 'Unit Lainnya';
      if (!divMap[dName]) {
        divMap[dName] = { count: 0, hours: 0 };
      }
      divMap[dName].count += 1;
      divMap[dName].hours += dur;
    });

    return Object.entries(divMap)
      .map(([name, stat]) => ({
        name,
        sessions: stat.count,
        hours: Number(stat.hours.toFixed(1)),
      }))
      .sort((a, b) => b.hours - a.hours);
  }, [validBookings]);

  // -------------------------------------------------------------
  // 5. HIGH-LEVEL KPI AGGREGATES
  // -------------------------------------------------------------
  const kpiSummary = useMemo(() => {
    const totalWeeklyHours = weeklyData.reduce((acc, d) => acc + d.totalHours, 0);
    const totalSessions = validBookings.length;
    const avgWeeklyOccupancy = Math.round(
      weeklyData.reduce((acc, d) => acc + d.occupancyRate, 0) / (weeklyData.length || 1)
    );

    // Day-specific KPI
    const selectedDayData = weeklyData.find((d) => d.date === selectedDate);
    const dayOccupancy = selectedDayData ? selectedDayData.occupancyRate : 74;
    const dayHours = selectedDayData ? selectedDayData.totalHours : 18.5;

    // Highest used room
    const sortedRooms = [...roomComparisonData].sort((a, b) => b.totalHours - a.totalHours);
    const topRoom = sortedRooms[0] || { name: 'Ruang Rapat Sekjen', occupancyRate: 82 };

    return {
      totalWeeklyHours: Number(totalWeeklyHours.toFixed(1)),
      totalSessions,
      avgWeeklyOccupancy,
      dayOccupancy,
      dayHours,
      topRoomName: topRoom.name,
      topRoomRate: topRoom.occupancyRate,
    };
  }, [weeklyData, validBookings, selectedDate, roomComparisonData]);

  // Export Analytics Summary CSV
  const handleExportAnalyticsCSV = () => {
    let csv = 'Tanggal,Hari,Ruang Sekjen (Jam),Ruang VIP (Jam),Ruang Transit (Jam),Total Jam,Okupansi (%),Jumlah Sesi,Peserta\n';
    weeklyData.forEach((w) => {
      csv += `${w.date},${w.day},${w['Ruang Rapat Sekjen']},${w['Ruang VIP']},${w['Ruang Transit']},${w.totalHours},${w.occupancyRate}%,${w.sessionsCount},${w.totalParticipants}\n`;
    });

    csv += '\nDistribusi Unit Kerja\nUnit Kerja,Jumlah Sesi,Total Jam Rapat\n';
    divisionData.forEach((d) => {
      csv += `"${d.name}",${d.sessions},${d.hours}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `laporan-analitik-okupansi-${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fade-in w-full text-[#16191C]">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#55524A]/20">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#A9822D] font-semibold tracking-wider uppercase mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>Executive Analytics & Occupancy Engine</span>
          </div>
          <h2 className="font-serif-title text-2xl md:text-3xl text-[#16191C] font-normal">
            Dashboard Statistik Okupansi Bilik Rapat
          </h2>
          <p className="text-xs text-[#55524A] mt-1 max-w-2xl">
            Visualisasi kurva okupansi harian per jam (08:00 - 18:00 WIB), utilisasi mingguan per bilik, dan evaluasi beban kerja unit instansi secara real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="inline-flex rounded border border-[#55524A]/30 bg-[#E4DBC8]/60 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 font-medium rounded-xs transition-colors cursor-pointer ${
                viewMode === 'weekly'
                  ? 'bg-[#16191C] text-[#F1ECDF] shadow-xs'
                  : 'text-[#55524A] hover:text-[#16191C]'
              }`}
            >
              Tren Mingguan
            </button>
            <button
              type="button"
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 font-medium rounded-xs transition-colors cursor-pointer ${
                viewMode === 'daily'
                  ? 'bg-[#16191C] text-[#F1ECDF] shadow-xs'
                  : 'text-[#55524A] hover:text-[#16191C]'
              }`}
            >
              Kurva Harian
            </button>
            <button
              type="button"
              onClick={() => setViewMode('comparison')}
              className={`px-3 py-1.5 font-medium rounded-xs transition-colors cursor-pointer ${
                viewMode === 'comparison'
                  ? 'bg-[#16191C] text-[#F1ECDF] shadow-xs'
                  : 'text-[#55524A] hover:text-[#16191C]'
              }`}
            >
              Komparasi Bilik
            </button>
          </div>

          {/* Executive Memo Button */}
          <button
            type="button"
            onClick={() => setShowMemoModal(true)}
            className="px-3.5 py-1.5 bg-[#E4DBC8] border border-[#55524A]/30 text-[#16191C] text-xs font-medium rounded hover:bg-[#F1ECDF] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Lihat dan cetak memo dinas rekomendasi optimalisasi okupansi"
          >
            <Printer className="w-3.5 h-3.5 text-[#A9822D]" />
            <span>Cetak Memo Rekomendasi</span>
          </button>

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExportAnalyticsCSV}
            className="px-3.5 py-1.5 bg-[#16191C] text-[#F1ECDF] text-xs font-medium rounded hover:bg-[#A9822D] hover:text-[#16191C] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Unduh data statistik lengkap dalam format CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Unduh CSV</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="p-3 bg-[#26392E] text-[#F1ECDF] rounded border border-[#A9822D]/50 shadow-lg text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-[#A9822D]" />
            <span>{showSuccessToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowSuccessToast(null)}
            className="text-[#F1ECDF]/70 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Okupansi Mingguan */}
        <div className="p-5 bg-[#E4DBC8]/50 rounded border border-[#55524A]/20 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between text-[#55524A] text-xs mb-1">
            <span className="uppercase tracking-wider font-semibold">Rata-Rata Okupansi Pekan Ini</span>
            <TrendingUp className="w-4 h-4 text-[#A9822D]" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-serif-title text-3xl md:text-4xl font-normal text-[#16191C] leading-none">
              {kpiSummary.avgWeeklyOccupancy}%
            </span>
            <span className="text-xs text-[#26392E] font-medium bg-[#26392E]/10 px-1.5 py-0.5 rounded">
              +4.8% vs Target
            </span>
          </div>
          <p className="text-[11px] text-[#55524A] mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#26392E]" />
            <span>Ambang batas sehat (65% - 80%) terpenuhi</span>
          </p>
        </div>

        {/* Card 2: Total Jam Rapat */}
        <div className="p-5 bg-[#E4DBC8]/50 rounded border border-[#55524A]/20 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between text-[#55524A] text-xs mb-1">
            <span className="uppercase tracking-wider font-semibold">Total Jam Terpakai (W1)</span>
            <Clock className="w-4 h-4 text-[#A9822D]" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-serif-title text-3xl md:text-4xl font-normal text-[#16191C] leading-none">
              {kpiSummary.totalWeeklyHours}
            </span>
            <span className="text-xs text-[#55524A]">Jam Rapat</span>
          </div>
          <p className="text-[11px] text-[#55524A] mt-2">
            Dari total {6 * dailyOperatingHours * activeRooms.length} jam kapasitas bilik mingguan
          </p>
        </div>

        {/* Card 3: Bilik Terpadat */}
        <div className="p-5 bg-[#E4DBC8]/50 rounded border border-[#55524A]/20 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between text-[#55524A] text-xs mb-1">
            <span className="uppercase tracking-wider font-semibold">Bilik Paling Diminati</span>
            <Award className="w-4 h-4 text-[#A9822D]" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-serif-title text-2xl font-normal text-[#16191C] leading-tight truncate">
              {kpiSummary.topRoomName}
            </span>
          </div>
          <p className="text-[11px] text-[#55524A] mt-2 flex items-center justify-between">
            <span>Okupansi Utilisasi:</span>
            <span className="font-semibold text-[#16191C] font-mono">{kpiSummary.topRoomRate}%</span>
          </p>
        </div>

        {/* Card 4: Status Harian Tertentu */}
        <div className="p-5 bg-[#E4DBC8]/50 rounded border border-[#55524A]/20 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between text-[#55524A] text-xs mb-1">
            <span className="uppercase tracking-wider font-semibold">Okupansi Hari Ini ({selectedDate.slice(5)})</span>
            <Calendar className="w-4 h-4 text-[#A9822D]" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-serif-title text-3xl md:text-4xl font-normal text-[#16191C] leading-none">
              {kpiSummary.dayOccupancy}%
            </span>
            <span className="text-xs text-[#55524A]">({kpiSummary.dayHours} Jam)</span>
          </div>
          <p className="text-[11px] text-[#55524A] mt-2 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#26392E] animate-pulse"></span>
            <span>Jam padat: 10:00 - 11:30 & 14:00 - 15:30</span>
          </p>
        </div>
      </div>

      {/* Main Interactive Charts Section */}
      <div className="bg-[#F1ECDF] p-6 md:p-8 rounded border border-[#55524A]/20 shadow-xs space-y-6">
        {/* Top Chart Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#55524A]/15">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#A9822D] rounded-xs"></div>
            <h3 className="font-serif-title text-xl text-[#16191C] font-normal">
              {viewMode === 'weekly' && 'Statistik Okupansi Mingguan (Senin — Sabtu)'}
              {viewMode === 'daily' && `Distribusi Okupansi Harian per Jam (${selectedDate})`}
              {viewMode === 'comparison' && 'Analisis Utilisasi & Efisiensi Kursi Antar Bilik'}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Filter Date when in daily mode */}
            {viewMode === 'daily' && (
              <div className="flex items-center gap-1.5">
                <span className="text-[#55524A]">Pilih Tanggal:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-[#E4DBC8] border border-[#55524A]/30 rounded px-2.5 py-1 font-mono text-xs text-[#16191C] focus:outline-hidden focus:border-[#A9822D]"
                />
              </div>
            )}

            {/* Metric Toggle for Weekly */}
            {viewMode === 'weekly' && (
              <div className="flex items-center gap-1.5">
                <span className="text-[#55524A]">Metrik Tampilan:</span>
                <select
                  value={metricDisplay}
                  onChange={(e) => setMetricDisplay(e.target.value as 'hours' | 'rate')}
                  className="bg-[#E4DBC8] border border-[#55524A]/30 rounded px-2.5 py-1 text-xs text-[#16191C] focus:outline-hidden cursor-pointer"
                >
                  <option value="hours">Total Durasi Jam Rapat</option>
                  <option value="rate">Persentase Okupansi (%)</option>
                </select>
              </div>
            )}

            {/* Room Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#55524A]">Filter Bilik:</span>
              <select
                value={selectedRoomFilter}
                onChange={(e) => setSelectedRoomFilter(e.target.value)}
                className="bg-[#E4DBC8] border border-[#55524A]/30 rounded px-2.5 py-1 text-xs text-[#16191C] focus:outline-hidden cursor-pointer"
              >
                <option value="all">Semua Bilik (Akumulasi)</option>
                <option value="sekjen">Ruang Rapat Sekjen (30 Pax)</option>
                <option value="vip">Ruang VIP (15 Pax)</option>
                <option value="transit">Ruang Transit (10 Pax)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ----------------- VIEW 1: WEEKLY CHART ----------------- */}
        {viewMode === 'weekly' && (
          <div>
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={weeklyData}
                  margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#55524A" opacity={0.15} />
                  <XAxis
                    dataKey="day"
                    stroke="#55524A"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(val, idx) => `${val} (${weeklyData[idx]?.shortDate})`}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#55524A"
                    fontSize={11}
                    tickLine={false}
                    unit={metricDisplay === 'hours' ? 'j' : '%'}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#A9822D"
                    fontSize={11}
                    tickLine={false}
                    domain={[0, 100]}
                    unit="%"
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#16191C] text-[#F1ECDF] p-3.5 rounded border border-[#A9822D]/60 shadow-xl text-xs space-y-1.5 max-w-xs">
                            <div className="font-serif-title text-sm text-[#A9822D] border-b border-[#55524A]/40 pb-1 font-medium">
                              {label} — {data.date}
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-[#E4DBC8]">Tingkat Okupansi:</span>
                              <span className="font-mono font-bold text-amber-300">{data.occupancyRate}%</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-[#E4DBC8]">Total Jam Rapat:</span>
                              <span className="font-mono font-bold">{data.totalHours} Jam</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-[#E4DBC8]">Jumlah Sesi:</span>
                              <span className="font-mono">{data.sessionsCount} Sesi</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-[#E4DBC8]">Total Peserta:</span>
                              <span className="font-mono">{data.totalParticipants} Orang</span>
                            </div>
                            <div className="pt-1 text-[10px] text-[#A9822D] border-t border-[#55524A]/30">
                              • Sekjen: {data['Ruang Rapat Sekjen']}j | VIP: {data['Ruang VIP']}j | Transit: {data['Ruang Transit']}j
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: 12, fontSize: '11px' }}
                  />

                  {/* Render based on room filter */}
                  {(selectedRoomFilter === 'all' || selectedRoomFilter === 'sekjen') && (
                    <Bar
                      yAxisId="left"
                      dataKey="Ruang Rapat Sekjen"
                      fill={PALETTE.sekjen}
                      stackId={selectedRoomFilter === 'all' ? 'stack' : undefined}
                      name="R. Rapat Sekjen (Jam)"
                      radius={[2, 2, 0, 0]}
                    />
                  )}
                  {(selectedRoomFilter === 'all' || selectedRoomFilter === 'vip') && (
                    <Bar
                      yAxisId="left"
                      dataKey="Ruang VIP"
                      fill={PALETTE.vip}
                      stackId={selectedRoomFilter === 'all' ? 'stack' : undefined}
                      name="R. VIP (Jam)"
                      radius={[2, 2, 0, 0]}
                    />
                  )}
                  {(selectedRoomFilter === 'all' || selectedRoomFilter === 'transit') && (
                    <Bar
                      yAxisId="left"
                      dataKey="Ruang Transit"
                      fill={PALETTE.transit}
                      stackId={selectedRoomFilter === 'all' ? 'stack' : undefined}
                      name="R. Transit (Jam)"
                      radius={[2, 2, 0, 0]}
                    />
                  )}

                  {/* Line overlay for Occupancy Rate */}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="occupancyRate"
                    stroke="#A9822D"
                    strokeWidth={2.5}
                    dot={{ fill: '#16191C', stroke: '#A9822D', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#A9822D' }}
                    name="Tingkat Okupansi (%)"
                  />

                  {/* Reference Line for Target 70% */}
                  <ReferenceLine
                    yAxisId="right"
                    y={70}
                    stroke="#26392E"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: 'Target KPI: 70%',
                      position: 'insideTopLeft',
                      fill: '#26392E',
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-[#55524A]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#55524A]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#16191C] rounded-xs"></span>
                  <span>Sekjen</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#A9822D] rounded-xs"></span>
                  <span>VIP</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#26392E] rounded-xs"></span>
                  <span>Transit</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 bg-[#A9822D]"></span>
                  <span>Kurva Okupansi (%)</span>
                </span>
              </div>
              <span className="italic">
                Catatan: Kapasitas harian adalah 10 jam per bilik aktif (08:00 - 18:00 WIB).
              </span>
            </div>
          </div>
        )}

        {/* ----------------- VIEW 2: DAILY HOURLY CURVE ----------------- */}
        {viewMode === 'daily' && (
          <div>
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dailyHourlyData}
                  margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorSekjen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PALETTE.sekjen} stopOpacity={0.7} />
                      <stop offset="95%" stopColor={PALETTE.sekjen} stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="colorVip" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PALETTE.vip} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={PALETTE.vip} stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorTransit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PALETTE.transit} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={PALETTE.transit} stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#55524A" opacity={0.15} />
                  <XAxis dataKey="hour" stroke="#55524A" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#55524A"
                    fontSize={11}
                    tickLine={false}
                    domain={[0, 1]}
                    unit="j"
                    ticks={[0, 0.5, 1]}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#16191C] text-[#F1ECDF] p-3 rounded border border-[#A9822D]/60 shadow-xl text-xs space-y-1.5 max-w-sm">
                            <div className="font-serif-title text-sm text-[#A9822D] border-b border-[#55524A]/40 pb-1 font-medium flex justify-between">
                              <span>Pukul {label} - {d.hourEnd} WIB</span>
                              <span className="font-mono text-amber-300">{d.occupancyRate}% Okupansi</span>
                            </div>
                            <div className="text-[11px] space-y-1">
                              <div>• Sekjen: {d['Ruang Rapat Sekjen']} Jam</div>
                              <div>• VIP: {d['Ruang VIP']} Jam</div>
                              <div>• Transit: {d['Ruang Transit']} Jam</div>
                            </div>
                            {d.meetings.length > 0 ? (
                              <div className="pt-1.5 border-t border-[#55524A]/30 text-[10px] space-y-1">
                                <span className="text-[#A9822D] font-medium block">Agenda Berlangsung:</span>
                                {d.meetings.map((m: string, i: number) => (
                                  <div key={i} className="text-[#E4DBC8] truncate">{m}</div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-[10px] text-emerald-400 italic">Seluruh bilik bebas reservasi</div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 12, fontSize: '11px' }} />

                  {(selectedRoomFilter === 'all' || selectedRoomFilter === 'sekjen') && (
                    <Area
                      type="monotone"
                      dataKey="Ruang Rapat Sekjen"
                      stroke={PALETTE.sekjen}
                      fillOpacity={1}
                      fill="url(#colorSekjen)"
                      strokeWidth={2}
                      name="Ruang Sekjen"
                    />
                  )}
                  {(selectedRoomFilter === 'all' || selectedRoomFilter === 'vip') && (
                    <Area
                      type="monotone"
                      dataKey="Ruang VIP"
                      stroke={PALETTE.vip}
                      fillOpacity={1}
                      fill="url(#colorVip)"
                      strokeWidth={2}
                      name="Ruang VIP"
                    />
                  )}
                  {(selectedRoomFilter === 'all' || selectedRoomFilter === 'transit') && (
                    <Area
                      type="monotone"
                      dataKey="Ruang Transit"
                      stroke={PALETTE.transit}
                      fillOpacity={1}
                      fill="url(#colorTransit)"
                      strokeWidth={2}
                      name="Ruang Transit"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Peak Hours Indicator Bar */}
            <div className="mt-4 pt-3 border-t border-[#55524A]/15 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              {dailyHourlyData.map((slot) => (
                <div
                  key={slot.hour}
                  className={`p-2 rounded border flex items-center justify-between ${
                    slot.isPeak
                      ? 'bg-[#A9822D]/15 border-[#A9822D]/50 text-[#16191C]'
                      : 'bg-[#E4DBC8]/40 border-[#55524A]/15 text-[#55524A]'
                  }`}
                >
                  <span className="font-mono font-medium">{slot.hour}</span>
                  <span className={`text-[11px] font-semibold ${slot.isPeak ? 'text-[#8F6C22]' : ''}`}>
                    {slot.occupancyRate}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------- VIEW 3: ROOM COMPARISON ----------------- */}
        {viewMode === 'comparison' && (
          <div>
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={roomComparisonData}
                  margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#55524A" opacity={0.15} />
                  <XAxis dataKey="name" stroke="#55524A" fontSize={12} tickLine={false} />
                  <YAxis stroke="#55524A" fontSize={11} tickLine={false} unit="%" domain={[0, 100]} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#16191C] text-[#F1ECDF] p-3 rounded border border-[#A9822D]/60 shadow-xl text-xs space-y-1 max-w-xs">
                            <div className="font-serif-title text-sm text-[#A9822D] border-b border-[#55524A]/40 pb-1 font-medium">
                              {label}
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#E4DBC8]">Tingkat Okupansi:</span>
                              <span className="font-bold text-amber-300">{d.occupancyRate}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#E4DBC8]">Total Jam Terpakai:</span>
                              <span>{d.totalHours} Jam</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#E4DBC8]">Total Sesi Rapat:</span>
                              <span>{d.sessions} Sesi</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#E4DBC8]">Efisiensi Kursi:</span>
                              <span className="text-emerald-400 font-bold">{d.capacityUtilization}%</span>
                            </div>
                            <div className="text-[10px] text-[#A9822D] pt-1">
                              Kapasitas Maksimal: {d.capacity} Orang
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 12, fontSize: '11px' }} />
                  <Bar
                    dataKey="occupancyRate"
                    fill={PALETTE.vip}
                    name="Tingkat Okupansi Bilik (%)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="capacityUtilization"
                    fill={PALETTE.sekjen}
                    name="Efisiensi Utilisasi Kursi (%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Room Specs Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t border-[#55524A]/15">
              {roomComparisonData.map((item) => (
                <div key={item.id} className="p-4 bg-[#E4DBC8]/50 rounded border border-[#55524A]/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-serif-title text-base font-normal text-[#16191C]">{item.name}</span>
                    <span className="text-xs font-mono font-bold text-[#A9822D]">{item.occupancyRate}%</span>
                  </div>
                  <div className="text-xs text-[#55524A] space-y-1 mt-2">
                    <div className="flex justify-between">
                      <span>Total Pemakaian:</span>
                      <span className="font-medium text-[#16191C]">{item.totalHours} Jam ({item.sessions} Sesi)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rata-Rata Hadir:</span>
                      <span className="font-medium text-[#16191C]">{item.avgAttendees} dari {item.capacity} Kursi</span>
                    </div>
                    <div className="w-full bg-[#55524A]/20 h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-[#16191C] h-full rounded-full"
                        style={{ width: `${item.capacityUtilization}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Two-Column Deep Analytical Insights: Division Breakdown + Peak Hours Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (6 cols): Division Proportion Chart */}
        <div className="lg:col-span-6 bg-[#F1ECDF] p-6 rounded border border-[#55524A]/20 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#55524A]/15 mb-4">
              <div>
                <h3 className="font-serif-title text-lg text-[#16191C] font-normal">
                  Distribusi Pemakaian per Unit Kerja
                </h3>
                <p className="text-xs text-[#55524A]">
                  Proporsi durasi jam rapat yang dibukukan oleh masing-masing biro dan direktorat.
                </p>
              </div>
              <Building2 className="w-4 h-4 text-[#A9822D]" />
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={divisionData}
                    dataKey="hours"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {divisionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                        stroke="#F1ECDF"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#16191C] text-[#F1ECDF] p-2.5 rounded border border-[#A9822D]/60 shadow-xl text-xs space-y-1">
                            <span className="font-medium text-[#A9822D] block">{d.name}</span>
                            <div className="flex justify-between gap-3">
                              <span>Durasi Rapat:</span>
                              <span className="font-mono font-bold">{d.hours} Jam</span>
                            </div>
                            <div className="flex justify-between gap-3">
                              <span>Jumlah Agenda:</span>
                              <span className="font-mono">{d.sessions} Sesi</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Division Legend Pills */}
          <div className="space-y-2 pt-2 border-t border-[#55524A]/15 text-xs">
            {divisionData.slice(0, 4).map((div, i) => (
              <div key={div.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                  ></span>
                  <span className="truncate text-[#16191C] font-medium">{div.name}</span>
                </div>
                <span className="text-[#55524A] font-mono shrink-0 ml-2">
                  {div.hours} Jam ({div.sessions} sesi)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (6 cols): Weekly Operational Schedule Matrix */}
        <div className="lg:col-span-6 bg-[#F1ECDF] p-6 rounded border border-[#55524A]/20 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#55524A]/15 mb-4">
              <div>
                <h3 className="font-serif-title text-lg text-[#16191C] font-normal">
                  Ringkasan Kepadatan Harian (Weekly Matrix)
                </h3>
                <p className="text-xs text-[#55524A]">
                  Tingkat okupansi per hari kerja beserta status kapasitas beban.
                </p>
              </div>
              <Calendar className="w-4 h-4 text-[#A9822D]" />
            </div>

            <div className="space-y-3">
              {weeklyData.map((d) => {
                const isOptimal = d.occupancyRate >= 65 && d.occupancyRate <= 85;
                const isHeavy = d.occupancyRate > 85;

                return (
                  <div
                    key={d.day}
                    className="p-3 bg-[#E4DBC8]/40 border border-[#55524A]/15 rounded flex items-center justify-between hover:bg-[#E4DBC8]/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#16191C] text-[#F1ECDF] flex flex-col items-center justify-center text-[10px] font-mono leading-none">
                        <span className="font-semibold">{d.day.slice(0, 3)}</span>
                        <span className="text-[9px] text-[#A9822D]">{d.shortDate.split('/')[0]}</span>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-[#16191C] block">{d.day}</span>
                        <span className="text-[11px] text-[#55524A]">
                          {d.sessionsCount} Sesi • {d.totalHours} Jam Terpakai
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-[#16191C] block">
                          {d.occupancyRate}%
                        </span>
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.2 rounded inline-block ${
                            isHeavy
                              ? 'bg-[#6B2A2E]/10 text-[#6B2A2E]'
                              : isOptimal
                              ? 'bg-[#26392E]/10 text-[#26392E]'
                              : 'bg-[#55524A]/10 text-[#55524A]'
                          }`}
                        >
                          {isHeavy ? 'Sangat Padat' : isOptimal ? 'Optimal' : 'Tersedia Banyak'}
                        </span>
                      </div>
                      <div className="w-16 bg-[#55524A]/20 h-2 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className={`h-full ${isHeavy ? 'bg-[#6B2A2E]' : 'bg-[#16191C]'}`}
                          style={{ width: `${d.occupancyRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[#55524A]/15 text-xs text-[#55524A] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#26392E]" />
              <span>Sinkronisasi Google Calendar Real-Time</span>
            </span>
            <span className="text-[#A9822D] font-medium">Buku Kendali Terintegrasi</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 4: PUSAT REKOMENDASI & SARAN OPTIMALISASI OKUPANSI    */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#F1ECDF] p-6 md:p-8 rounded border border-[#55524A]/20 shadow-xs space-y-6">
        {/* Section Header & Directives Control */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#55524A]/15">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#A9822D]">
              <Sparkles className="w-3.5 h-3.5 text-[#A9822D]" />
              <span>Saran Berbasis Data Buku Kendali (Executive Suggestions Engine)</span>
            </div>
            <h3 className="font-serif-title text-xl md:text-2xl text-[#16191C] mt-1 font-normal">
              Rekomendasi & Kebijakan Optimalisasi Fasilitas Ruang Rapat
            </h3>
            <p className="text-xs text-[#55524A] mt-1 max-w-2xl">
              Analisis komprehensif terhadap pola jam sibuk (peak hours), efisiensi alokasi kapasitas kursi, dan pencegahan pemesanan fiktif (ghost booking) demi utilisasi fasilitas yang akuntabel.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Buttons */}
            <div className="inline-flex rounded border border-[#55524A]/30 bg-[#E4DBC8]/60 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setSuggestionCategoryFilter('all')}
                className={`px-3 py-1 font-medium rounded-xs transition-colors cursor-pointer ${
                  suggestionCategoryFilter === 'all'
                    ? 'bg-[#16191C] text-[#F1ECDF] shadow-xs'
                    : 'text-[#55524A] hover:text-[#16191C]'
                }`}
              >
                Semua Saran (5)
              </button>
              <button
                type="button"
                onClick={() => setSuggestionCategoryFilter('high')}
                className={`px-3 py-1 font-medium rounded-xs transition-colors cursor-pointer ${
                  suggestionCategoryFilter === 'high'
                    ? 'bg-[#16191C] text-[#F1ECDF] shadow-xs'
                    : 'text-[#55524A] hover:text-[#16191C]'
                }`}
              >
                Prioritas Utama (2)
              </button>
              <button
                type="button"
                onClick={() => setSuggestionCategoryFilter('operational')}
                className={`px-3 py-1 font-medium rounded-xs transition-colors cursor-pointer ${
                  suggestionCategoryFilter === 'operational'
                    ? 'bg-[#16191C] text-[#F1ECDF] shadow-xs'
                    : 'text-[#55524A] hover:text-[#16191C]'
                }`}
              >
                Operasional & Energi (3)
              </button>
            </div>

            {/* Apply All Action */}
            <button
              type="button"
              onClick={handleApplyAllSuggestions}
              className="px-3.5 py-1.5 bg-[#A9822D] text-[#16191C] hover:bg-[#A9822D]/90 font-medium text-xs rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Terapkan Semua Saran ({appliedSuggestions.length}/5 Aktif)</span>
            </button>
          </div>
        </div>

        {/* Suggestion Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              id: 'sug-1',
              category: 'high',
              priority: 'Prioritas Utama',
              badgeColor: 'bg-[#6B2A2E]/10 text-[#6B2A2E] border-[#6B2A2E]/30',
              title: 'Redistribusi Beban Rapat Jam Puncak (10:00 & 14:00 WIB)',
              problem: 'Tingkat kepadatan permintaan ruang rapat melonjak hingga 91% - 94% pada jam 10:00 - 11:30 dan 14:00 - 15:30 WIB, memicu risiko bentrok dan penolakan agenda.',
              recommendation: 'Tetapkan kebijakan "Green Hours" (08:00 - 09:30 & 15:30 - 17:00 WIB) untuk rapat koordinasi internal non-eselon, membebaskan jam emas bagi rapat pleno pimpinan.',
              impact: 'Menurunkan kepadatan jam puncak sebesar ~35% dan menjamin ketersediaan bilik pimpinan.',
              savingMetric: '+14 Jam Slot Efektif/Pekan',
              actionLabel: 'Terapkan Green Hours',
            },
            {
              id: 'sug-2',
              category: 'high',
              priority: 'Prioritas Utama',
              badgeColor: 'bg-[#6B2A2E]/10 text-[#6B2A2E] border-[#6B2A2E]/30',
              title: 'Right-Sizing Bilik: Minimal 15 Peserta untuk Ruang Rapat Sekjen',
              problem: 'Ditemukan 3 sesi rapat dengan peserta ≤ 8 orang yang memesan Ruang Sekjen (kapasitas 30 pax), menyebabkan efisiensi kursi hanya 26% saat bilik besar sangat dibutuhkan.',
              recommendation: 'Terapkan batas minimal 15 peserta saat memilih Ruang Sekjen. Sistem otomatis mengarahkan rapat ≤ 10 orang ke Ruang Transit dan 11-15 orang ke Ruang VIP.',
              impact: 'Meningkatkan efisiensi okupansi kursi dari 48% ke 76% serta mencegah monopoli bilik besar.',
              savingMetric: '+3 Slot Pleno Terselamatkan',
              actionLabel: 'Terapkan Batas 15 Pax',
            },
            {
              id: 'sug-3',
              category: 'operational',
              priority: 'Operasional Kritis',
              badgeColor: 'bg-[#26392E]/10 text-[#26392E] border-[#26392E]/30',
              title: 'Auto-Release Ghost Meeting (Toleransi Check-In 15 Menit)',
              problem: 'Terdapat risiko pemesanan ruang yang tidak dihadiri pemohon (ghost booking) tanpa konfirmasi pembatalan, memblokir pegawai lain yang membutuhkan ruang mendesak.',
              recommendation: 'Aktifkan aturan rilis otomatis: pemesan wajib tap kartu/check-in di tablet kiosk ruangan maksimal 15 menit setelah waktu mulai. Jika nihil, slot otomatis dilepas kembali ke ledger publik.',
              impact: 'Memulihkan 4 - 6 jam kuota ruang per pekan yang sebelumnya terbuang sia-sia.',
              savingMetric: 'Zero Ghost Meetings',
              actionLabel: 'Aktifkan Auto-Release',
            },
            {
              id: 'sug-4',
              category: 'operational',
              priority: 'Kebijakan Kuota',
              badgeColor: 'bg-[#A9822D]/15 text-[#A9822D] border-[#A9822D]/40',
              title: 'Kebijakan Kuota Adil (Fair-Share) Antar Unit Kerja & Biro',
              problem: 'Sekretariat Jenderal dan Biro Perencanaan menyerap 44.5% dari seluruh total jam rapat pekan ini, berpotensi membatasi akses biro teknis dan pusat litbang lainnya.',
              recommendation: 'Berlakukan pagu reservasi maksimal 12 jam per pekan per biro untuk Ruang Sekjen & VIP. Permohonan di atas batas memerlukan persetujuan khusus Kepala Biro Umum.',
              impact: 'Pemerataan kesempatan utilisasi fasilitas bagi 7 unit kerja di lingkungan kementerian/instansi.',
              savingMetric: 'Akses Merata 100%',
              actionLabel: 'Terapkan Pagu 12 Jam/Pekan',
            },
            {
              id: 'sug-5',
              category: 'operational',
              priority: 'Efisiensi Energi',
              badgeColor: 'bg-[#26392E]/10 text-[#26392E] border-[#26392E]/30',
              title: 'Otomasi Eco-Energy: Sinkronisasi Jadwal AC Central Daikin',
              problem: 'Pendingin AC sentral di Ruang Sekjen dan VIP tetap menyala dengan beban penuh pada jeda antar rapat yang lebih dari 1.5 jam.',
              recommendation: 'Integrasikan API Daikin Smart Hub: sistem otomatis menurunkan daya ke mode Eco (25°C) saat jeda > 30 menit dan melakukan pra-pendinginan 10 menit sebelum agenda dimulai.',
              impact: 'Mengurangi konsumsi listrik pendingin udara ruang rapat hingga 22% per bulan.',
              savingMetric: 'Hemat Listrik 22%',
              actionLabel: 'Sinkronkan Daikin Eco',
            },
          ]
            .filter((sug) => {
              if (suggestionCategoryFilter === 'all') return true;
              return sug.category === suggestionCategoryFilter;
            })
            .map((sug) => {
              const isApplied = appliedSuggestions.includes(sug.id);

              return (
                <div
                  key={sug.id}
                  className={`p-5 rounded border transition-all duration-200 flex flex-col justify-between ${
                    isApplied
                      ? 'bg-[#E4DBC8]/70 border-[#26392E]/40 shadow-xs ring-1 ring-[#26392E]/20'
                      : 'bg-[#E4DBC8]/30 border-[#55524A]/20 hover:border-[#A9822D]/50 hover:bg-[#E4DBC8]/50'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Badge & Metric */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${sug.badgeColor}`}
                      >
                        {sug.priority}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-[#A9822D] bg-[#16191C] px-2 py-0.5 rounded-xs text-[#F1ECDF]">
                        {sug.savingMetric}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="font-serif-title text-base text-[#16191C] font-normal leading-snug">
                      {sug.title}
                    </h4>

                    {/* Problem & Recommendation Box */}
                    <div className="space-y-2 text-xs">
                      <div className="bg-[#F1ECDF] p-2.5 rounded border border-[#55524A]/15 text-[#55524A]">
                        <span className="font-semibold text-[#6B2A2E] block text-[11px] mb-0.5">
                          Kondisi Terdeteksi:
                        </span>
                        {sug.problem}
                      </div>

                      <div className="bg-[#F1ECDF] p-2.5 rounded border border-[#55524A]/15 text-[#16191C]">
                        <span className="font-semibold text-[#26392E] block text-[11px] mb-0.5 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3 text-[#A9822D]" />
                          Saran Tindakan:
                        </span>
                        {sug.recommendation}
                      </div>
                    </div>

                    {/* Impact Note */}
                    <p className="text-[11px] text-[#55524A] italic">
                      <span className="font-semibold not-italic text-[#16191C]">Estimasi Dampak: </span>
                      {sug.impact}
                    </p>
                  </div>

                  {/* Card Action Button */}
                  <div className="pt-4 mt-4 border-t border-[#55524A]/15 flex items-center justify-between">
                    <div className="text-[11px] flex items-center gap-1.5">
                      {isApplied ? (
                        <span className="text-[#26392E] font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#26392E]" />
                          Kebijakan Aktif
                        </span>
                      ) : (
                        <span className="text-[#55524A]">Belum Diterapkan</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleSuggestion(sug.id, sug.title)}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1 cursor-pointer ${
                        isApplied
                          ? 'bg-[#26392E] text-[#F1ECDF] hover:bg-[#16191C]'
                          : 'bg-[#16191C] text-[#F1ECDF] hover:bg-[#A9822D] hover:text-[#16191C]'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <CheckCheck className="w-3 h-3 text-[#A9822D]" />
                          <span>Batalkan</span>
                        </>
                      ) : (
                        <>
                          <span>{sug.actionLabel}</span>
                          <ChevronRight className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* EXECUTIVE MEMORANDUM MODAL (PRINTABLE OFFICIAL ADVISORY)      */}
      {/* ------------------------------------------------------------- */}
      {showMemoModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#16191C]/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#F1ECDF] rounded-lg border border-[#55524A]/30 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col justify-between overflow-hidden">
            {/* Modal Bar */}
            <div className="p-4 bg-[#16191C] text-[#F1ECDF] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <FileText className="w-4 h-4 text-[#A9822D]" />
                <span className="font-semibold uppercase tracking-wider">
                  Memo Dinas Rekomendasi Optimalisasi Fasilitas Ruang Rapat
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-2.5 py-1 bg-[#A9822D] text-[#16191C] rounded text-xs font-medium hover:bg-[#A9822D]/90 flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3 h-3" />
                  <span>Cetak Dokumen</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowMemoModal(false)}
                  className="p-1 text-[#F1ECDF]/70 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Official Memorandum Body */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-5 text-[#16191C] bg-[#F1ECDF]">
              {/* Header Garuda / Lembaga */}
              <div className="text-center border-b-2 border-[#16191C] pb-4 space-y-1">
                <div className="font-serif-title text-xl font-bold tracking-wider uppercase text-[#16191C]">
                  KEMENTERIAN / LEMBAGA REPUBLIK INDONESIA
                </div>
                <div className="text-xs font-semibold uppercase tracking-widest text-[#55524A]">
                  SEKRETARIAT JENDERAL — BIRO UMUM & RUMAH TANGGA
                </div>
                <div className="text-[11px] text-[#55524A]">
                  Jalan Medan Merdeka Barat No. 12, Jakarta Pusat 10110 • Telepon (021) 381-0000
                </div>
              </div>

              {/* Memo Info Box */}
              <div className="grid grid-cols-2 text-xs gap-2 pt-2 border-b border-[#55524A]/20 pb-3">
                <div>
                  <span className="text-[#55524A] block text-[11px]">NOMOR DOKUMEN:</span>
                  <span className="font-mono font-semibold">042/MEMO-BU/IX/2026</span>
                </div>
                <div>
                  <span className="text-[#55524A] block text-[11px]">TANGGAL PENERBITAN:</span>
                  <span className="font-mono font-semibold">10 September 2026</span>
                </div>
                <div>
                  <span className="text-[#55524A] block text-[11px]">KEPADA YTH:</span>
                  <span className="font-semibold">Para Kepala Biro / Kepala Pusat / Pimpinan Unit Kerja</span>
                </div>
                <div>
                  <span className="text-[#55524A] block text-[11px]">DARI:</span>
                  <span className="font-semibold">Kepala Bagian Pengelolaan Fasilitas & Protokol</span>
                </div>
                <div className="col-span-2 pt-1">
                  <span className="text-[#55524A] block text-[11px]">PERIHAL:</span>
                  <span className="font-serif-title font-bold text-sm text-[#16191C]">
                    Hasil Analisis Okupansi Bilik Rapat & Rekomendasi Efisiensi Tata Kelola Ruangan
                  </span>
                </div>
              </div>

              {/* Body Content */}
              <div className="space-y-3 text-xs leading-relaxed text-[#16191C]">
                <p>
                  Berdasarkan audit dan rekapitulasi data buku kendali reservasi ruang rapat periode bulan berjalan, tingkat rata-rata okupansi bilik rapat tercatat sebesar <strong className="font-mono">{kpiSummary.avgWeeklyOccupancy}%</strong> dengan total akumulasi pemakaian mencapai <strong className="font-mono">{kpiSummary.totalWeeklyHours} Jam Rapat</strong>.
                </p>
                <p>
                  Guna menjamin ketersediaan sarana rapat pimpinan serta mengoptimalkan efisiensi energi gedung, berikut 5 (lima) butir rekomendasi yang telah disimulasikan:
                </p>

                {/* Table of 5 Directives */}
                <div className="overflow-x-auto border border-[#55524A]/20 rounded">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#E4DBC8] text-[#16191C] font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="py-2 px-3">No</th>
                        <th className="py-2 px-3">Subjek Rekomendasi</th>
                        <th className="py-2 px-3">Tindakan Efisiensi</th>
                        <th className="py-2 px-3">Target Dampak</th>
                        <th className="py-2 px-3">Status Sistem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#55524A]/10 text-[11px]">
                      <tr>
                        <td className="py-2 px-3 font-mono">1</td>
                        <td className="py-2 px-3 font-medium">Pengalihan Jam Puncak</td>
                        <td className="py-2 px-3">Rapat rutin internal dialihkan ke slot 08:00 - 09:30 & 15:30 - 17:00 WIB</td>
                        <td className="py-2 px-3 font-mono text-[#A9822D]">+14 Jam Jam Bebas</td>
                        <td className="py-2 px-3 font-medium text-[#26392E]">
                          {appliedSuggestions.includes('sug-1') ? 'Diterapkan' : 'Siap Diterapkan'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono">2</td>
                        <td className="py-2 px-3 font-medium">Right-Sizing Sekjen (15 Pax)</td>
                        <td className="py-2 px-3">Batas minimal 15 orang untuk Ruang Sekjen; rapat kecil dialihkan ke Transit/VIP</td>
                        <td className="py-2 px-3 font-mono text-[#A9822D]">Kursi Naik ke 76%</td>
                        <td className="py-2 px-3 font-medium text-[#26392E]">
                          {appliedSuggestions.includes('sug-2') ? 'Diterapkan' : 'Siap Diterapkan'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono">3</td>
                        <td className="py-2 px-3 font-medium">Auto-Release Ghost Meeting</td>
                        <td className="py-2 px-3">Toleransi 15 menit keterlambatan check-in; pembatalan otomatis jika pemohon tidak hadir</td>
                        <td className="py-2 px-3 font-mono text-[#A9822D]">Zero Ruang Menganggur</td>
                        <td className="py-2 px-3 font-medium text-[#26392E]">
                          {appliedSuggestions.includes('sug-3') ? 'Diterapkan' : 'Siap Diterapkan'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono">4</td>
                        <td className="py-2 px-3 font-medium">Pagu Kuota Adil (12 Jam/Unit)</td>
                        <td className="py-2 px-3">Batas maksimal booking 12 jam per pekan per biro untuk menghindari monopoli satu unit</td>
                        <td className="py-2 px-3 font-mono text-[#A9822D]">Pemerataan 7 Biro</td>
                        <td className="py-2 px-3 font-medium text-[#26392E]">
                          {appliedSuggestions.includes('sug-4') ? 'Diterapkan' : 'Siap Diterapkan'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono">5</td>
                        <td className="py-2 px-3 font-medium">Eco Daikin Central Sync</td>
                        <td className="py-2 px-3">Sistem otomatis standby 25°C pada jeda kosong & pre-cooling 10 menit sebelum mulai</td>
                        <td className="py-2 px-3 font-mono text-[#A9822D]">Hemat Listrik 22%</td>
                        <td className="py-2 px-3 font-medium text-[#26392E]">
                          {appliedSuggestions.includes('sug-5') ? 'Diterapkan' : 'Siap Diterapkan'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-[11px] text-[#55524A] pt-1">
                  Demikian memorandum rekomendasi ini disampaikan sebagai rujukan operasional tata kelola sarana persidangan instansi.
                </p>
              </div>

              {/* Signatures & Stamp */}
              <div className="pt-4 border-t border-[#55524A]/20 flex items-end justify-between text-xs">
                <div>
                  <span className="text-[#55524A] block text-[10px]">VERIFIKASI SISTEM:</span>
                  <span className="font-mono text-[11px] text-[#26392E] font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Terotentikasi Ledger Digital (ID: GOV-AUDIT-2026)
                  </span>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-[#55524A] block text-[11px]">Jakarta, 10 September 2026</span>
                  <div className="w-24 h-10 border border-dashed border-[#A9822D]/60 rounded flex items-center justify-center text-[10px] text-[#A9822D] uppercase font-mono font-bold tracking-wider mx-auto">
                    TERVERIFIKASI
                  </div>
                  <span className="font-serif-title font-bold text-sm block">Dr. H. Bambang Soediro, M.Si</span>
                  <span className="text-[11px] text-[#55524A] block">NIP. 19740512 199803 1 002</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#E4DBC8] border-t border-[#55524A]/20 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowMemoModal(false)}
                className="px-4 py-2 bg-[#16191C] text-[#F1ECDF] rounded hover:bg-[#16191C]/90 font-medium cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
