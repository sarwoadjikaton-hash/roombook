import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface DropdownOption<T = string> {
  value: T;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  avatarText?: string;
  avatarBgColor?: string;
  badge?: string;
  badgeColor?: string;
}

interface CustomDropdownProps<T = string> {
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  hideAvatar?: boolean;
}

export function CustomDropdown<T = string>({
  options,
  value,
  onChange,
  label,
  placeholder = 'Pilih...',
  className = '',
  hideAvatar = false,
}: CustomDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hitung posisi dialog / dropdown agar selalu within screen bounds
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < 260 && spaceAbove > spaceBelow) {
        setPlacement('top');
      } else {
        setPlacement('bottom');
      }
    }
  }, [isOpen]);

  const defaultColors = [
    'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
    'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  ];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-bold text-text-secondary mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 bg-surface hover:bg-surface-secondary/60 border rounded-xl text-sm font-bold text-text-primary shadow-xs transition-all focus:outline-none cursor-pointer ${
          isOpen
            ? 'border-primary ring-2 ring-primary/20 shadow-sm'
            : 'border-border hover:border-text-muted'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {!hideAvatar && (
            <>
              {selectedOption?.icon ? (
                <span className="text-primary shrink-0">{selectedOption.icon}</span>
              ) : selectedOption?.avatarText ? (
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                    selectedOption.avatarBgColor || defaultColors[0]
                  }`}
                >
                  {selectedOption.avatarText}
                </div>
              ) : null}
            </>
          )}

          <span className="truncate text-text-primary font-bold text-sm">
            {selectedOption?.label || placeholder}
          </span>

          {selectedOption?.badge && (
            <span
              className={`px-2 py-0.5 text-[10px] font-black rounded-md shrink-0 ml-auto mr-1 ${
                selectedOption.badgeColor || 'bg-primary/10 text-primary border border-primary/20'
              }`}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          size={16}
          className={`text-text-muted shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      {/* Popover Menu Dropdown */}
      {isOpen && (
        <div
          className={`absolute ${
            placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          } right-0 min-w-full w-max max-w-[calc(100vw-1.5rem)] sm:min-w-[280px] p-1.5 bg-surface border-2 border-border dark:border-stone-700 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 max-h-72 overflow-y-auto custom-scrollbar`}
        >
          <div className="space-y-1">
            {options.map((option, idx) => {
              const isSelected = option.value === value;
              const colorClass =
                option.avatarBgColor || defaultColors[idx % defaultColors.length];

              const hasVisual = !hideAvatar && (option.icon || option.avatarText);

              return (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl transition-all text-left cursor-pointer group ${
                    isSelected
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'hover:bg-surface-secondary text-text-primary'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Avatar Bulat / Icon jika ada */}
                    {hasVisual && (
                      <>
                        {option.icon ? (
                          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            {option.icon}
                          </div>
                        ) : option.avatarText ? (
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${colorClass}`}
                          >
                            {option.avatarText}
                          </div>
                        ) : null}
                      </>
                    )}

                    {/* Label & Sublabel */}
                    <div className="flex flex-col min-w-0">
                      <span className="font-extrabold text-sm text-text-primary truncate">
                        {option.label}
                      </span>
                      {option.sublabel && (
                        <span className="text-xs text-text-muted font-medium truncate mt-0.5">
                          {option.sublabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Badge & Checkmark */}
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {option.badge && (
                      <span
                        className={`px-2 py-0.5 text-[10px] font-black rounded-md border ${
                          option.badgeColor ||
                          'bg-primary/10 text-primary border-primary/20'
                        }`}
                      >
                        {option.badge}
                      </span>
                    )}

                    {isSelected && (
                      <Check size={16} className="text-primary shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

