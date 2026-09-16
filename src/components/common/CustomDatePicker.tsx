import React, { useState, useRef, useEffect } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
} from 'lucide-react';
import { formatDateIndonesian } from '../../utils/dateUtils';

interface CustomDatePickerProps {
  label?: string;
  value: string; // 'YYYY-MM-DD'
  onChange: (newDate: string) => void;
  placeholder?: string;
  className?: string;
  minDate?: string; // 'YYYY-MM-DD'
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Pilih Tanggal',
  className = '',
  minDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom');
  const [align, setAlign] = useState<'left' | 'right'>('left');
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse tanggal saat ini atau gunakan hari ini
  const parsedCurrentDate = value ? parseISO(value) : new Date();
  const [viewDate, setViewDate] = useState<Date>(parsedCurrentDate);

  // Sync viewDate saat value berubah dari luar
  useEffect(() => {
    if (value) {
      setViewDate(parseISO(value));
    }
  }, [value]);

  // Handle klik di luar untuk menutup kalender
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hitung posisi dialog kalender agar selalu within screen bounds
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < 370 && spaceAbove > spaceBelow) {
        setPlacement('top');
      } else {
        setPlacement('bottom');
      }

      if (rect.left + 330 > window.innerWidth) {
        setAlign('right');
      } else {
        setAlign('left');
      }
    }
  }, [isOpen]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(subMonths(viewDate, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(addMonths(viewDate, 1));
  };

  const handleSelectDay = (day: Date) => {
    const formatted = format(day, 'yyyy-MM-dd');
    onChange(formatted);
    setIsOpen(false);
  };

  // Generate grid hari untuk bulan yang sedang dilihat
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Dimulai dari Minggu (Su) seperti referensi
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const allCalendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-bold text-text-secondary mb-1.5">
          {label}
        </label>
      )}

      {/* Input Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 bg-surface hover:bg-surface-secondary/60 border rounded-xl text-base font-bold text-text-primary shadow-xs transition-all focus:outline-none ${isOpen
            ? 'border-primary ring-2 ring-primary/20 shadow-sm'
            : 'border-border hover:border-text-muted'
          }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 truncate">
          <CalendarIcon size={18} className="text-primary shrink-0" />
          <span className="truncate">
            {value ? formatDateIndonesian(value) : placeholder}
          </span>
        </div>

        <ChevronsUpDown size={16} className="text-text-muted shrink-0" />
      </button>

      {/* Custom Calendar Popover: Within Screen Bounds & Solid 100% */}
      {isOpen && (
        <div
          className={`absolute ${placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
            } ${align === 'right' ? 'right-0' : 'left-0'
            } p-4 bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-700 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 w-[310px] sm:w-[330px] max-w-[calc(100vw-2rem)]`}
        >
          {/* Header Kalender: Prev, Judul Bulan Tahun, Next */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-border hover:bg-surface-secondary text-text-secondary hover:text-text-primary transition-colors active:scale-95"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="font-extrabold text-base text-text-primary capitalize">
              {format(viewDate, 'MMMM yyyy', { locale: idLocale })}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-border hover:bg-surface-secondary text-text-secondary hover:text-text-primary transition-colors active:scale-95"
              title="Bulan Berikutnya"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Baris Nama Hari */}
          <div className="grid grid-cols-7 gap-1 mb-2 text-center">
            {dayNames.map((name) => (
              <div
                key={name}
                className="text-[11px] font-bold text-text-muted tracking-wider py-1"
              >
                {name}
              </div>
            ))}
          </div>

          {/* Grid Hari Kalender */}
          <div className="grid grid-cols-7 gap-1">
            {allCalendarDays.map((day) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const isSelected = value ? isSameDay(day, parseISO(value)) : false;
              const isCurrentMonth = isSameMonth(day, viewDate);
              const isCurrentDay = isToday(day);
              const isDisabled = minDate ? dayStr < minDate : false;

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => !isDisabled && handleSelectDay(day)}
                  className={`h-9 w-full rounded-xl text-sm font-bold transition-all relative flex flex-col items-center justify-center ${isSelected
                      ? 'bg-primary text-white font-black shadow-md scale-105 z-10'
                      : isDisabled
                        ? 'text-text-muted/30 cursor-not-allowed line-through'
                        : !isCurrentMonth
                          ? 'text-text-muted/40 hover:bg-surface-secondary/40'
                          : isCurrentDay
                            ? 'bg-primary/10 text-primary font-black hover:bg-primary/20'
                            : 'text-text-primary hover:bg-surface-secondary'
                    }`}
                >
                  <span>{format(day, 'd')}</span>
                  {/* Dot indikator untuk hari ini jika belum dipilih */}
                  {isCurrentDay && !isSelected && (
                    <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Action Footer: Hari Ini & Besok */}
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                const todayFormatted = format(new Date(), 'yyyy-MM-dd');
                onChange(todayFormatted);
                setViewDate(new Date());
                setIsOpen(false);
              }}
              className="text-primary font-black hover:underline"
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => {
                const tomorrow = addMonths(new Date(), 0);
                tomorrow.setDate(tomorrow.getDate() + 1);
                const tomorrowFormatted = format(tomorrow, 'yyyy-MM-dd');
                onChange(tomorrowFormatted);
                setViewDate(tomorrow);
                setIsOpen(false);
              }}
              className="text-text-secondary font-bold hover:text-text-primary"
            >
              Besok
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
