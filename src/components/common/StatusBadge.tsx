import React from 'react';
import { BookingStatus } from '../../types';
import { CheckCircle2, Clock, XCircle, Ban, CheckCheck } from 'lucide-react';

interface StatusBadgeProps {
  status: BookingStatus | 'available' | 'occupied' | 'starting_soon';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-sm gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5 font-medium',
    lg: 'px-3 py-1.5 text-base gap-2 font-semibold',
  }[size];

  const iconSize = size === 'sm' ? 13 : size === 'md' ? 15 : 18;

  switch (status) {
    case 'confirmed':
      return (
        <span
          className={`inline-flex items-center rounded-md bg-[#1D8348]/10 text-[#1D8348] border border-[#1D8348]/25 ${sizeClasses} ${className}`}
        >
          <CheckCircle2 size={iconSize} strokeWidth={1.75} />
          <span>Terkonfirmasi</span>
        </span>
      );

    case 'pending':
      return (
        <span
          className={`inline-flex items-center rounded-md bg-[#B8860B]/10 text-[#B8860B] border border-[#B8860B]/30 ${sizeClasses} ${className}`}
        >
          <Clock size={iconSize} strokeWidth={1.75} className="animate-pulse" />
          <span>Menunggu Persetujuan</span>
        </span>
      );

    case 'rejected':
      return (
        <span
          className={`inline-flex items-center rounded-md bg-[#B3261E]/10 text-[#B3261E] border border-[#B3261E]/25 ${sizeClasses} ${className}`}
        >
          <XCircle size={iconSize} strokeWidth={1.75} />
          <span>Ditolak</span>
        </span>
      );

    case 'cancelled':
      return (
        <span
          className={`inline-flex items-center rounded-md bg-stone-200/60 text-stone-600 border border-stone-300 ${sizeClasses} ${className}`}
        >
          <Ban size={iconSize} strokeWidth={1.75} />
          <span>Dibatalkan</span>
        </span>
      );

    case 'completed':
      return (
        <span
          className={`inline-flex items-center rounded-md bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses} ${className}`}
        >
          <CheckCheck size={iconSize} strokeWidth={1.75} />
          <span>Selesai</span>
        </span>
      );

    case 'available':
      return (
        <span
          className={`inline-flex items-center rounded-md bg-white text-green-700 border border-green-300 shadow-sm font-semibold ${sizeClasses} ${className}`}
        >
          <CheckCircle2 size={iconSize} strokeWidth={1.75} />
          <span>Tersedia</span>
        </span>
      );

    case 'occupied':
      return (
        <span
          className={`inline-flex items-center rounded-md bg-white text-red-700 border border-red-300 shadow-sm font-semibold ${sizeClasses} ${className}`}
        >
          <XCircle size={iconSize} strokeWidth={1.75} />
          <span>Sedang Digunakan</span>
        </span>
      );

    case 'starting_soon':
      return (
        <span
          className={`inline-flex items-center rounded-md bg-white text-amber-700 border border-amber-300 shadow-sm font-semibold ${sizeClasses} ${className}`}
        >
          <Clock size={iconSize} strokeWidth={1.75} className="animate-bounce" />
          <span>Akan Dimulai</span>
        </span>
      );

    default:
      return null;
  }
};
