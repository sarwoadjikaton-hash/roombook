import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  className?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 140,
  bgColor = '#FFFFFF',
  fgColor = '#0B3D2E',
  level = 'M',
  includeMargin = true,
  className = '',
}) => {
  return (
    <div className={`inline-flex items-center justify-center p-2 rounded-card bg-white shadow-sm border border-stone-200 ${className}`}>
      <QRCodeSVG
        value={value}
        size={size}
        bgColor={bgColor}
        fgColor={fgColor}
        level={level}
        includeMargin={includeMargin}
      />
    </div>
  );
};
