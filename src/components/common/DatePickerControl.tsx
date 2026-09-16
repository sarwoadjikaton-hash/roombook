import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { CustomDropdown, DropdownOption } from './CustomDropdown';
import { CustomDatePicker } from './CustomDatePicker';
import { Room } from '../../types';

interface DatePickerControlProps {
  selectedDate: string; // 'YYYY-MM-DD'
  onDateChange: (newDate: string) => void;
  rooms?: Room[];
  selectedRoomSlug?: string;
  onRoomChange?: (roomSlug: string) => void;
}

export const DatePickerControl: React.FC<DatePickerControlProps> = ({
  selectedDate,
  onDateChange,
  rooms,
  selectedRoomSlug = 'all',
  onRoomChange,
}) => {
  const roomOptions: DropdownOption<string>[] = [
    {
      value: 'all',
      label: 'Semua Ruangan',
      icon: <SlidersHorizontal size={16} />,
      badge: `${rooms?.length || 3} Ruang`,
      badgeColor: 'bg-primary/10 text-primary border-primary/20',
    },
    ...(rooms || []).map((r) => ({
      value: r.slug,
      label: r.name,
      sublabel: `Kapasitas ${r.capacity} Orang`,
    })),
  ];

  return (
    <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* 1. Custom Date Picker */}
      <div className="w-full sm:w-80">
        <CustomDatePicker
          value={selectedDate}
          onChange={onDateChange}
          placeholder="Pilih Tanggal Rapat"
        />
      </div>

      {/* 2. Room Selector Dropdown */}
      {onRoomChange && rooms && (
        <div className="w-full sm:w-80 shrink-0">
          <CustomDropdown
            options={roomOptions}
            value={selectedRoomSlug}
            onChange={onRoomChange}
            placeholder="Filter Ruangan..."
          />
        </div>
      )}
    </div>
  );
};
