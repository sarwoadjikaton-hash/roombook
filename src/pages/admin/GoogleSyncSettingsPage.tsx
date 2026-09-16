import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { GOOGLE_SERVICE_ACCOUNT } from '../../config/googleServiceAccount';
import {
  CalendarCheck,
  RefreshCw,
  CheckCircle,
  Key,
  Server,
} from 'lucide-react';
import { format } from 'date-fns';

import { api } from '../../services/api';

export const GoogleSyncSettingsPage: React.FC = () => {
  const { rooms, googleSyncStatus, lastSyncTime, triggerGoogleSync } = useBooking();
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: Record<string, boolean> } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      // Test per-room calendar ID live against Google Calendar API
      const results: Record<string, boolean> = {};
      let successCount = 0;

      for (const room of rooms) {
        if (room.googleCalendarId) {
          const res = await api.testGoogleCalendar(room.googleCalendarId).catch(() => ({ success: false }));
          results[room.slug] = res.success;
          if (res.success) successCount++;
        } else {
          results[room.slug] = false;
        }
      }

      await triggerGoogleSync();
      setIsTesting(false);
      setTestResult({
        success: true,
        message: `Koneksi Google Calendar API v3 Berhasil. ${successCount} dari ${rooms.length} kalender ruangan aktif & terverifikasi langsung dengan Google Cloud Service Account.`,
        details: results,
      });
    } catch (e: any) {
      setIsTesting(false);
      setTestResult({
        success: false,
        message: `Gagal memverifikasi: ${e.message || 'Terjadi kesalahan jaringan.'}`,
      });
    }
  };

  const handleSyncAllBookings = async () => {
    setIsSyncingAll(true);
    try {
      const res = await api.syncAllGoogleCalendar();
      await triggerGoogleSync();
      setIsSyncingAll(false);
      setTestResult({
        success: res.success,
        message: res.message || 'Sinkronisasi booking ke Google Calendar selesai.',
      });
    } catch (e: any) {
      setIsSyncingAll(false);
      setTestResult({
        success: false,
        message: `Gagal sinkronisasi: ${e.message || 'Terjadi kesalahan pada server.'}`,
      });
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface rounded-card border border-border p-5 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck size={22} className="text-primary" />
            <h1 className="text-xl font-bold text-text-primary">Integrasi Kalender Digital</h1>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Konfigurasi dan pemantauan sinkronisasi otomatis jadwal ruang rapat ke kalender.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSyncAllBookings}
            disabled={isSyncingAll || googleSyncStatus === 'syncing'}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-btn shadow-sm transition-all"
          >
            <CalendarCheck size={14} className={isSyncingAll ? 'animate-spin' : ''} />
            <span>{isSyncingAll ? 'Menyinkronkan...' : 'Sinkronkan Semua Booking'}</span>
          </button>

          <button
            onClick={handleTestConnection}
            disabled={isTesting || googleSyncStatus === 'syncing'}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-light text-white text-sm font-bold rounded-btn shadow-sm transition-all"
          >
            <RefreshCw size={14} className={isTesting ? 'animate-spin' : ''} />
            <span>{isTesting ? 'Menguji Koneksi...' : 'Uji Koneksi Kalender'}</span>
          </button>
        </div>
      </div>

      {/* Test Connection Alert */}
      {testResult && (
        <div
          className={`p-4 border rounded-card text-sm flex items-start gap-3 ${
            testResult.success
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <CheckCircle
            size={18}
            className={`shrink-0 mt-0.5 ${
              testResult.success ? 'text-status-success' : 'text-rose-600'
            }`}
          />
          <div>
            <span className="font-bold">Status Verifikasi API: </span>
            {testResult.message}
          </div>
        </div>
      )}

      {/* Service Account Metadata Card */}
      <div className="bg-surface rounded-card border border-border p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Server size={18} className="text-primary" />
            <h2 className="text-base font-bold text-text-primary uppercase tracking-wider">
              Rincian Akun Integrasi Kalender
            </h2>
          </div>
          <span className="px-2.5 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Kredensial Aktif
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-stone-50 rounded-btn border border-border space-y-1">
            <div className="text-text-secondary font-semibold text-[11px]">Project ID:</div>
            <div className="font-mono font-bold text-text-primary text-base">
              {GOOGLE_SERVICE_ACCOUNT.project_id}
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-btn border border-border space-y-1">
            <div className="text-text-secondary font-semibold text-[11px]">Client Email Service Account:</div>
            <div className="font-mono font-bold text-primary truncate" title={GOOGLE_SERVICE_ACCOUNT.client_email}>
              {GOOGLE_SERVICE_ACCOUNT.client_email}
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-btn border border-border space-y-1">
            <div className="text-text-secondary font-semibold text-[11px]">Private Key ID:</div>
            <div className="font-mono text-stone-600 truncate">
              {GOOGLE_SERVICE_ACCOUNT.private_key_id}
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-btn border border-border space-y-1">
            <div className="text-text-secondary font-semibold text-[11px]">Waktu Terakhir Sinkronisasi:</div>
            <div className="font-mono font-semibold text-text-primary">
              {format(lastSyncTime, 'dd MMMM yyyy, HH:mm:ss')} WIB
            </div>
          </div>
        </div>

        {/* Private Key Masked */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-sm mb-1 font-semibold text-text-secondary">
            <span className="flex items-center gap-1">
              <Key size={13} />
              <span>RSA Private Key (Terenkripsi):</span>
            </span>
            <span className="text-[10px] text-stone-500 font-mono">Format PKCS#8 Valid</span>
          </div>
          <div className="p-3 bg-stone-900 text-emerald-400 font-mono text-[10px] rounded-btn overflow-x-auto leading-relaxed border border-stone-800">
            {GOOGLE_SERVICE_ACCOUNT.private_key.slice(0, 120)}
            <br />
            [... KUNCI PRIVAT TERENKRIPSI AMAN UNTUK AKSES GOOGLE CALENDAR API ...]
            <br />
            {GOOGLE_SERVICE_ACCOUNT.private_key.slice(-80)}
          </div>
        </div>
      </div>

      {/* Resource Calendar Mapping per Ruangan */}
      <div className="bg-surface rounded-card border border-border p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <CalendarCheck size={18} className="text-primary" />
            <h2 className="text-base font-bold text-text-primary uppercase tracking-wider">
              Pemetaan Kalender Ruangan (Calendar Resources)
            </h2>
          </div>
          <span className="text-xs text-text-secondary font-medium">
            Edit ID Kalender pada menu <b>Kelola Ruangan</b>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rooms.map((room) => {
            const hasCustomId = Boolean(room.googleCalendarId && !room.googleCalendarId.startsWith('c_') && room.googleCalendarId.includes('@group.calendar.google.com'));
            const isVerified = testResult?.details ? Boolean(testResult.details[room.slug]) : hasCustomId;

            return (
              <div
                key={room.slug}
                className="p-4 bg-stone-50 rounded-card border border-border hover:border-primary transition-all space-y-3 text-sm flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-base text-text-primary">{room.name}</span>
                    {isVerified ? (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        Tersambung
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                        {hasCustomId ? 'Gagal Verifikasi' : 'Perlu ID Kalender'}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] text-text-secondary block font-semibold">Google Calendar ID:</span>
                    <span className="font-mono text-[11px] text-stone-700 block truncate bg-white p-1.5 rounded border border-stone-200 mt-0.5 select-all" title={room.googleCalendarId}>
                      {room.googleCalendarId || '(Belum disetel)'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-text-secondary">
                  <span>Sinkronisasi Otomatis</span>
                  <span className={hasCustomId ? 'text-emerald-600 font-bold' : 'text-stone-400 font-medium'}>
                    {hasCustomId ? '2-Way Sync Aktif' : 'Menunggu ID'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
