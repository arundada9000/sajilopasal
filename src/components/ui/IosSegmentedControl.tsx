'use client';

import React from 'react';
import { soundbox } from '@/lib/audio';

interface Option<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface IosSegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function IosSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: IosSegmentedControlProps<T>) {
  return (
    <div
      className={`inline-flex p-[3px] select-none ${className}`}
      style={{
        backgroundColor: 'var(--surface-2)',
        borderRadius: 'var(--radius-sm)',
      }}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              if (!isActive) {
                soundbox.playTap();
                onChange(option.value);
              }
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-[5px] text-[13px] font-semibold transition-all duration-200 ios-press ${
              isActive ? 'shadow-sm' : ''
            }`}
            style={{
              backgroundColor: isActive ? 'var(--surface)' : 'transparent',
              color: isActive ? 'var(--text)' : 'var(--text-muted)',
              borderRadius: 'calc(var(--radius-sm) - 2px)',
            }}
          >
            {option.icon}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
