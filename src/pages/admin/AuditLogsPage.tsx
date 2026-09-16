import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { AuditLog } from '../../types';
import {
  ShieldAlert,
  Search,
  CheckCircle,
  XCircle,
  PlusCircle,
  RefreshCw,
  Ban,
  Clock,
} from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const { auditLogs } = useBooking();
  const [searchActor, setSearchActor] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filteredLogs = auditLogs
    .filter((log) => {
      if (actionFilter === 'all') return true;
      return log.action === actionFilter;
    })
    .filter((log) => {
      if (!searchActor.trim()) return true;
      return (
        log.actorName.toLowerCase().includes(searchActor.toLowerCase()) ||
        log.details.toLowerCase().includes(searchActor.toLowerCase())
      );
    });

  const getActionBadge = (action: AuditLog['action']) => {
    switch (action) {
      case 'create_booking':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
            <PlusCircle size={12} /> Pengajuan Rapat
          </span>
        );
      case 'approve_booking':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-green-100 text-green-800">
            <CheckCircle size={12} /> Disetujui
          </span>
        );
      case 'reject_booking':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800">
            <XCircle size={12} /> Ditolak
          </span>
        );
      case 'cancel_booking':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-stone-200 text-stone-700">
            <Ban size={12} /> Dibatalkan
          </span>
        );
      case 'quick_book':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
            <Clock size={12} /> Pesan Cepat
          </span>
        );
      case 'sync_calendar':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800">
            <RefreshCw size={12} /> Sinkronisasi Kalender
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-100 text-stone-800">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface rounded-card border border-border p-5 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert size={22} className="text-primary" />
            <h1 className="text-xl font-bold text-text-primary">Catatan Aktivitas Sistem</h1>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Riwayat lengkap pengajuan, persetujuan, penolakan, dan sinkronisasi ruang rapat.
          </p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface p-3 rounded-card border border-border">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {['all', 'create_booking', 'approve_booking', 'reject_booking', 'cancel_booking', 'sync_calendar'].map(
            (act) => (
              <button
                key={act}
                onClick={() => setActionFilter(act)}
                className={`px-3 py-1 rounded-btn text-sm font-semibold capitalize ${
                  actionFilter === act
                    ? 'bg-primary text-white'
                    : 'bg-stone-100 text-text-secondary hover:bg-stone-200'
                }`}
              >
                {act.replace(/_/g, ' ')}
              </button>
            )
          )}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchActor}
            onChange={(e) => setSearchActor(e.target.value)}
            placeholder="Cari pelaku / detail aksi..."
            className="w-full pl-8 pr-3 py-1.5 bg-surface border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <Search size={14} className="absolute left-2.5 top-2.5 text-text-secondary" />
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-surface rounded-card border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-100 text-text-secondary font-semibold border-b border-border">
              <tr>
                <th className="py-3 px-4">Waktu (WIB)</th>
                <th className="py-3 px-4">Aksi</th>
                <th className="py-3 px-4">Pelaku (Actor)</th>
                <th className="py-3 px-4">Rincian Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-stone-50">
                  <td className="py-3 px-4 font-mono text-stone-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">{getActionBadge(log.action)}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-bold text-text-primary">{log.actorName}</div>
                    <div className="text-[10px] text-text-secondary capitalize">{log.actorRole}</div>
                  </td>
                  <td className="py-3 px-4 text-text-primary">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
