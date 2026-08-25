'use client';

import React from 'react';
import { Delete } from 'lucide-react';
import { soundbox } from '@/lib/audio';

interface IosNumpadProps {
  value: string;
  onChange: (val: string) => void;
  onQuickAdd?: (amount: number) => void;
  quickChips?: number[];
  showDecimals?: boolean;
}

export function IosNumpad({
  value,
  onChange,
  onQuickAdd,
  quickChips = [10, 50, 100, 500, 1000],
  showDecimals = true,
}: IosNumpadProps) {
  const handleDigit = (digit: string) => {
    soundbox.playTap();
    if (digit === '.' && value.includes('.')) return;
    if (value === '0' && digit !== '.') {
      onChange(digit);
      return;
    }
    onChange(value + digit);
  };

  const handleBackspace = () => {
    soundbox.playTap();
    if (value.length <= 1) {
      onChange('0');
    } else {
      onChange(value.slice(0, -1));
    }
  };

  const handleClear = () => {
    soundbox.playTap();
    onChange('0');
  };

  const handleChip = (amt: number) => {
    soundbox.playTap();
    if (onQuickAdd) {
      onQuickAdd(amt);
    } else {
      const current = parseFloat(value) || 0;
      onChange((current + amt).toString());
    }
  };

  const keyStyle = {
    color: 'var(--text)',
  };

  const keyHoverStyle = 'hover:opacity-80 active:opacity-60';

  return (
    <div className="flex flex-col gap-3">
      {/* Quick Rupee Note Chips */}
      {quickChips.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {quickChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleChip(chip)}
              className="flex-1 py-2.5 px-3 font-bold text-[15px] rounded-md transition-all active:scale-95 whitespace-nowrap text-center"
              style={{
                backgroundColor: 'var(--primary-soft)',
                color: 'var(--primary)',
              }}
            >
              +{chip}
            </button>
          ))}
        </div>
      )}

      {/* 3x4 Compact Keypad Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleDigit(digit)}
            className={`h-12 sm:h-14 text-xl font-medium rounded-md flex items-center justify-center transition-all active:scale-95 bg-numpad-key ${keyHoverStyle}`}
            style={keyStyle}
          >
            {digit}
          </button>
        ))}

        {showDecimals ? (
          <button
            type="button"
            onClick={() => handleDigit('.')}
            className={`h-12 sm:h-14 text-2xl font-medium rounded-md flex items-center justify-center transition-all active:scale-95 bg-numpad-key ${keyHoverStyle}`}
            style={keyStyle}
          >
            .
          </button>
        ) : (
          <button
            type="button"
            onClick={handleClear}
            className={`h-12 sm:h-14 text-lg font-medium rounded-md flex items-center justify-center transition-all active:scale-95 bg-numpad-key ${keyHoverStyle}`}
            style={{ color: 'var(--text-muted)' }}
          >
            C
          </button>
        )}

        <button
          type="button"
          onClick={() => handleDigit('0')}
          className={`h-12 sm:h-14 text-xl font-medium rounded-md flex items-center justify-center transition-all active:scale-95 bg-numpad-key ${keyHoverStyle}`}
            style={keyStyle}
          >
            0
          </button>

        <button
          type="button"
          onClick={handleBackspace}
          className="h-12 sm:h-14 text-lg rounded-md flex items-center justify-center transition-all active:scale-95 hover:opacity-80 active:opacity-60 bg-numpad-key"
          style={{ color: 'var(--text-muted)' }}
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
