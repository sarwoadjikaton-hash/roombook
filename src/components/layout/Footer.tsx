import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-surface border-t border-border py-4 text-sm text-text-secondary">
      <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <span className="font-bold text-primary">SIRAPAT</span>
          <span>•</span>
          <span>Sistem Informasi Reservasi Ruang Rapat - TU SEKJEN</span>
        </div>
      </div>
    </footer>
  );
};
