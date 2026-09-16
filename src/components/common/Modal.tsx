import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  }[maxWidth];

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop with Transition */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div
          className={`w-full ${maxWidthClasses} transform overflow-hidden rounded-card bg-surface text-left align-middle shadow-xl transition-all duration-200 ease-out animate-in zoom-in-95 fade-in border border-border relative z-10`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-border px-6 py-4">
            <div>
              <h3 className="text-lg font-bold text-text-primary">{title}</h3>
              {subtitle && <p className="mt-0.5 text-sm text-text-secondary">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-btn p-1 text-text-secondary hover:bg-stone-100 hover:text-text-primary transition-colors cursor-pointer"
            >
              <X size={20} strokeWidth={1.75} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
};


