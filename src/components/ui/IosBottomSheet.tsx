'use client';

import React, { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import { soundbox } from '@/lib/audio';

interface IosBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxHeight?: string;
  maxWidth?: string;
}

export function IosBottomSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxHeight = 'max-h-[85vh]',
  maxWidth = 'sm:max-w-[420px]',
}: IosBottomSheetProps) {
  const [visible, setVisible] = useState(false);
  const [animState, setAnimState] = useState<'entering' | 'idle' | 'exiting'>('entering');
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
      }, 250);
      return () => clearTimeout(timer);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!visible) return null;

  const isEntering = animState === 'entering';
  const isExiting = animState === 'exiting';

  return (
    <div
      ref={backdropRef}
      className={`fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 ${isExiting ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
      style={{ backgroundColor: 'var(--overlay-bg)' }}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      {/* Mobile: Slide-up Sheet */}
      <div
        className={`w-full ${maxWidth} flex flex-col overflow-hidden ${maxHeight} ${
          isEntering ? 'sheet-enter' : ''
        } ${isExiting ? 'sheet-exit' : ''}`}
        style={{
          background: 'var(--sheet-bg)',
          borderRadius: 'var(--radius-sheet) var(--radius-sheet) 0 0',
          boxShadow: 'var(--shadow-sheet)',
        }}
      >
        {/* Mobile Grabber Bar */}
        <div className="pt-3 pb-2 flex sm:hidden flex-col items-center select-none" onClick={onClose}>
          <div
            className="w-10 h-1 rounded-full cursor-grab"
            style={{ backgroundColor: 'var(--surface-3)' }}
          />
        </div>

        {/* Header */}
        <div
          className="px-5 py-3.5 flex items-center justify-between"
          style={{ borderBottom: '0.5px solid var(--border)' }}
        >
          <div>
            <h2 className="text-[17px] font-semibold tracking-tight" style={{ color: 'var(--text)' }}>
              {title}
            </h2>
            {subtitle && (
              <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              soundbox.playTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{
              backgroundColor: 'var(--numpad-key)',
              color: 'var(--text-muted)',
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 no-scrollbar">
          {children}
        </div>
      </div>

      {/* Desktop: Centered Modal (no slide, just scale) */}
      <style>{`
        @media (min-width: 640px) {
          .sheet-enter > div:last-child {
            animation: none !important;
            animation: modalScaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
          }
        }
      `}</style>
    </div>
  );
}
