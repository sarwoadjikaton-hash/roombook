import React from 'react';
import { FacilityType } from '../../types';
import {
  Tv,
  Video,
  Wind,
  Wifi,
  Presentation,
  FileSpreadsheet,
  Volume2,
  Users,
} from 'lucide-react';

interface FacilityIconsProps {
  facilities: FacilityType[];
  showLabels?: boolean;
  size?: number;
  className?: string;
}

export const FacilityIcons: React.FC<FacilityIconsProps> = ({
  facilities,
  showLabels = false,
  size = 14,
  className = '',
}) => {
  const getFacilityConfig = (type: FacilityType) => {
    switch (type) {
      case 'smart_tv':
        return {
          icon: <Tv size={size} strokeWidth={1.75} />,
          label: 'TV Pintar',
          color: 'text-amber-700 bg-amber-50 border-amber-200',
        };
      case 'zoom_room':
        return {
          icon: <Video size={size} strokeWidth={1.75} />,
          label: 'Konferensi Video',
          color: 'text-blue-700 bg-blue-50 border-blue-200',
        };
      case 'ac':
        return {
          icon: <Wind size={size} strokeWidth={1.75} />,
          label: 'AC',
          color: 'text-sky-700 bg-sky-50 border-sky-200',
        };
      case 'wifi':
        return {
          icon: <Wifi size={size} strokeWidth={1.75} />,
          label: 'WiFi',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        };
      case 'projector':
        return {
          icon: <Presentation size={size} strokeWidth={1.75} />,
          label: 'Proyektor',
          color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
        };
      case 'whiteboard':
        return {
          icon: <FileSpreadsheet size={size} strokeWidth={1.75} />,
          label: 'Papan Tulis',
          color: 'text-stone-700 bg-stone-100 border-stone-200',
        };
      case 'sound_system':
        return {
          icon: <Volume2 size={size} strokeWidth={1.75} />,
          label: 'Pengeras Suara',
          color: 'text-purple-700 bg-purple-50 border-purple-200',
        };
      default: {
        const formattedLabel = type
          .split('_')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        return {
          icon: <Presentation size={size} strokeWidth={1.75} />,
          label: formattedLabel,
          color: 'text-blue-700 bg-blue-50 border-blue-200',
        };
      }
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {facilities.map((fac) => {
        const { icon, label, color } = getFacilityConfig(fac);
        if (!icon) return null;

        if (showLabels) {
          return (
            <span
              key={fac}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-semibold border ${color}`}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </span>
          );
        }

        return (
          <span
            key={fac}
            title={label}
            className={`p-1.5 rounded-md border flex items-center justify-center transition-transform hover:scale-105 ${color}`}
          >
            {icon}
          </span>
        );
      })}
    </div>
  );
};

export const CapacityBadge: React.FC<{ capacity: number; size?: 'sm' | 'md'; className?: string }> = ({
  capacity,
  size = 'md',
  className = '',
}) => {
  const isSm = size === 'sm';
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold text-text-primary ${
        isSm ? 'text-sm' : 'text-base'
      } ${className}`}
    >
      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        <Users size={isSm ? 12 : 14} strokeWidth={2} />
      </div>
      <span>{capacity} Orang</span>
    </span>
  );
};
