'use client';

import React, { useState, useEffect, useRef } from 'react';
import { soundbox } from '@/lib/audio';

interface IosAlertDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function IosAlertDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'पुष्टि गर्नुहोस् (OK)',
  cancelLabel = 'रद्द (Cancel)',
  isDestructive = false,
  onConfirm,
  onCancel,
}: IosAlertDialogProps) {
  const [visible, setVisible] = useState(false);
  const [animState, setAnimState] = useState<'entering' | 'exiting'>('entering');

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setAnimState('entering');
    } else if (visible) {
      setAnimState('exiting');
      const timer = setTimeout(() => {
        setVisible(false);
        setAnimState('entering');
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!visible) return null;

  const isExiting = animState === 'exiting';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isExiting ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
      style={{ backgroundColor: 'var(--overlay-bg)' }}
    >
      <div
        className={`w-full max-w-[280px] text-center overflow-hidden ${isExiting ? 'modal-exit' : 'modal-enter'}`}
        style={{
          backgroundColor: 'var(--sheet-bg)',
          borderRadius: 'var(--radius)',
          border: '0.5px solid var(--glass-border)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div className="px-5 pt-5 pb-4">
          <h3
            className="text-[17px] font-semibold tracking-tight"
            style={{ color: 'var(--text)' }}
          >
            {title}
          </h3>
          <p
            className="text-[13px] mt-1.5 leading-normal"
            style={{ color: 'var(--text-muted)' }}
          >
            {message}
          </p>
        </div>

        <div
          className="grid grid-cols-2"
          style={{ borderTop: '0.5px solid var(--border)' }}
        >
          <button
            type="button"
            onClick={() => {
              soundbox.playTap();
              onCancel();
            }}
            className="py-3 text-[17px] font-normal active:opacity-60 transition-colors"
            style={{
              color: 'var(--primary)',
              borderRight: '0.5px solid var(--border)',
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              if (isDestructive) {
                soundbox.playWarningThud();
              } else {
                soundbox.playTap();
              }
              onConfirm();
            }}
            className="py-3 text-[17px] font-semibold active:opacity-60 transition-colors"
            style={{
              color: isDestructive ? 'var(--red)' : 'var(--primary)',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
