'use client';

import React from 'react';
import { soundbox } from '@/lib/audio';

interface IosSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}

export function IosSwitch({ checked, onChange, disabled = false, id }: IosSwitchProps) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => {
        soundbox.playTap();
        onChange(!checked);
      }}
      className="relative inline-flex h-[31px] w-[51px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none select-none"
      style={{
        backgroundColor: checked ? 'var(--green)' : 'var(--surface-3)',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none inline-block h-[27px] w-[27px] transform rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15)] ring-0 transition duration-200 ease-in-out"
        style={{
          transform: checked ? 'translateX(20px)' : 'translateX(0)',
        }}
      />
    </button>
  );
}
