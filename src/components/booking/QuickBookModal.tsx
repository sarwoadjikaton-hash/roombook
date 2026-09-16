import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { Room } from '../../types';
import { Zap, Clock, User, X, AlertTriangle } from 'lucide-react';

interface QuickBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
}

export const QuickBookModal: React.FC<QuickBookModalProps> = ({ isOpen, onClose, room }) => {
  const { quickBook } = useBooking();
  const [duration, setDuration] = useState<number>(30);
  const [title, setTitle] = useState<string>('');
  const [organizerName, setOrganizerName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = quickBook(
      room.slug,
      title.trim() || `Diskusi Singkat (${duration} Menit)`,
      duration,
      organizerName.trim() || 'Tamu / Staf Kiosk'
    );

    if (!result.success) {
      setError(result.message);
      return;
    }

    onClose();
  };

  const durations = [15, 30, 45, 60];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Dark backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-kiosk-surface text-kiosk-text border border-kiosk-border rounded-card p-6 shadow-2xl z-10">
        <div className="flex items-center justify-between pb-4 border-b border-kiosk-border">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-btn bg-accent/20 text-accent">
              <Zap size={20} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Quick Book — {room.name}</h3>
              <p className="text-sm text-kiosk-muted">Pesan ruangan langsung untuk penggunaan sekarang</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-kiosk-muted hover:text-white rounded-btn hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-950/60 border border-red-800 rounded-btn text-sm text-red-200 flex items-start gap-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Pilih Durasi */}
          <div>
            <label className="block text-sm font-semibold text-kiosk-muted mb-2">Pilih Durasi Rapat</label>
            <div className="grid grid-cols-4 gap-2">
              {durations.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`py-3 px-2 rounded-btn text-center text-base font-bold border transition-all ${
                    duration === d
                      ? 'bg-primary border-primary-light text-white shadow-md'
                      : 'bg-kiosk-card border-kiosk-border text-kiosk-muted hover:text-white hover:border-stone-500'
                  }`}
                >
                  <Clock size={16} className="mx-auto mb-1 opacity-80" />
                  <span>{d} Min</span>
                </button>
              ))}
            </div>
          </div>

          {/* Nama Rapat */}
          <div>
            <label className="block text-sm font-semibold text-kiosk-muted mb-1">Nama Agenda / Pertemuan</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Koordinasi Singkat Tim Teknis"
              className="w-full px-3.5 py-2.5 bg-kiosk-card border border-kiosk-border rounded-btn text-base text-white focus:outline-none focus:border-accent"
            />
          </div>

          {/* Nama Pemesan */}
          <div>
            <label className="block text-sm font-semibold text-kiosk-muted mb-1">Nama Pemesan / PIC</label>
            <div className="relative">
              <input
                type="text"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                placeholder="Nama Anda"
                className="w-full pl-9 pr-3.5 py-2.5 bg-kiosk-card border border-kiosk-border rounded-btn text-base text-white focus:outline-none focus:border-accent"
              />
              <User size={16} className="absolute left-3 top-3 text-kiosk-muted" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-kiosk-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-kiosk-muted hover:text-white rounded-btn"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-accent hover:bg-accent-light text-primary-dark font-extrabold text-base rounded-btn shadow-md transition-all flex items-center gap-2"
            >
              <Zap size={16} />
              <span>Pesan Sekarang ({duration} Menit)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
