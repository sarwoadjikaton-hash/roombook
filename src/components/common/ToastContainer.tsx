import React from 'react';
import { useBooking } from '../../context/BookingContext';
import {
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  X,
} from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useBooking();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl border-2 shadow-2xl backdrop-blur-md flex items-start gap-3.5 transition-all animate-in slide-in-from-top-4 fade-in duration-200 ${
              isSuccess
                ? 'bg-white border-emerald-400 text-stone-900 ring-4 ring-emerald-500/10'
                : isError
                ? 'bg-white border-rose-400 text-stone-900 ring-4 ring-rose-500/10'
                : isWarning
                ? 'bg-white border-amber-400 text-stone-900 ring-4 ring-amber-500/10'
                : 'bg-white border-blue-400 text-stone-900 ring-4 ring-blue-500/10'
            }`}
          >
            {/* Icon */}
            <div className="shrink-0 mt-0.5">
              {isSuccess && (
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                  <CheckCircle2 size={19} className="stroke-[2.5]" />
                </div>
              )}
              {isError && (
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-xs">
                  <XCircle size={19} className="stroke-[2.5]" />
                </div>
              )}
              {isWarning && (
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
                  <AlertTriangle size={19} className="stroke-[2.5]" />
                </div>
              )}
              {!isSuccess && !isError && !isWarning && (
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                  <Info size={19} className="stroke-[2.5]" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="text-sm sm:text-base font-black text-stone-950 tracking-tight">
                {toast.title}
              </div>
              <p className="text-sm text-stone-600 font-medium leading-relaxed">
                {toast.message}
              </p>
            </div>

            {/* Dismiss button */}
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors shrink-0"
              title="Tutup Notifikasi"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
