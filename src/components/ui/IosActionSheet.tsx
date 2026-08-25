'use client';

import React, { useEffect, useState, useRef } from 'react';
import { soundbox } from '@/lib/audio';

export interface ActionSheetOption {
  label: string;
  icon?: React.ReactNode;
  isDestructive?: boolean;
  onClick: () => void;
}

interface IosActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  options: ActionSheetOption[];
}

export function IosActionSheet({ isOpen, onClose, title, options }: IosActionSheetProps) {
  const [visible, setVisible] = useState(false);
  const [animState, setAnimState] = useState<'entering' | 'exiting'>('entering');
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setAnimState('entering');
      document.body.style.overflow = 'hidden';
    } else if (visible) {
      setAnimState('exiting');
      document.body.style.overflow = 'unset';
      const timer = setTimeout(() => {
        setVisible(false);
        setAnimState('entering');
      }, 200);
      return () => clearTimeout(timer);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!visible) return null;

  const isExiting = animState === 'exiting';

  return (
    <div
      ref={backdropRef}
      className={`fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-3 sm:p-4 ${isExiting ? 'opacity-0' : 'opacity-100'} transition-opacity duration-150`}
      style={{ backgroundColor: 'var(--overlay-bg)' }}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div
        className={`w-full max-w-sm flex flex-col gap-2 ${isExiting ? 'sheet-exit' : 'sheet-enter'}`}
      >
        {/* Main Options Group */}
        <div
          className="overflow-hidden"
          style={{
            background: 'var(--sheet-bg)',
            borderRadius: 'var(--radius)',
            border: '0.5px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {title && (
            <div
              className="px-4 py-2.5 text-center"
              style={{ borderBottom: '0.5px solid var(--border)' }}
            >
              <p
                className="text-[13px] font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                {title}
              </p>
            </div>
          )}

          <div>
            {options.map((opt, idx) => (
              <React.Fragment key={idx}>
                <button
                  type="button"
                  onClick={() => {
                    soundbox.playTap();
                    opt.onClick();
                    onClose();
                  }}
                  className="w-full py-3.5 px-4 text-[17px] font-normal flex items-center justify-center gap-3 transition-colors active:opacity-60"
                  style={{
                    color: opt.isDestructive ? 'var(--red)' : 'var(--text)',
                  }}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
                {idx < options.length - 1 && (
                  <div style={{ borderBottom: '0.5px solid var(--border)', marginLeft: 0 }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={() => {
            soundbox.playTap();
            onClose();
          }}
          className="w-full py-3.5 text-[17px] font-semibold active:opacity-60 transition-colors ios-press text-center"
          style={{
            background: 'var(--sheet-bg)',
            borderRadius: 'var(--radius)',
            color: 'var(--primary)',
            border: '0.5px solid var(--border)',
            boxShadow: 'var(--shadow)',
          }}
        >
          रद्द गर्नुहोस् (Cancel)
        </button>
      </div>
    </div>
  );
}
