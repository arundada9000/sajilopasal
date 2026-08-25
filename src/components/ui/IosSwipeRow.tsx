'use client';

import React, { useState, useRef } from 'react';
import { soundbox } from '@/lib/audio';

interface IosSwipeRowProps {
  children: React.ReactNode;
  rightAction?: {
    icon: React.ReactNode;
    label: string;
    bgColor?: string;
    onClick: () => void;
  };
  leftAction?: {
    icon: React.ReactNode;
    label: string;
    bgColor?: string;
    onClick: () => void;
  };
}

export function IosSwipeRow({ children, rightAction, leftAction }: IosSwipeRowProps) {
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsSwiping(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    startX.current = clientX;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isSwiping) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = clientX - startX.current;

    // Constrain swipe boundaries
    if (diff < 0 && rightAction) {
      setOffsetX(Math.max(-80, diff));
    } else if (diff > 0 && leftAction) {
      setOffsetX(Math.min(80, diff));
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (offsetX < -45 && rightAction) {
      setOffsetX(-75);
    } else if (offsetX > 45 && leftAction) {
      setOffsetX(75);
    } else {
      setOffsetX(0);
    }
  };

  const resetSwipe = () => setOffsetX(0);

  return (
    <div className="relative overflow-hidden rounded-md select-none">
      {/* Left Action Background (Reveal on swipe right) */}
      {leftAction && (
        <div
          onClick={() => {
            soundbox.playTap();
            leftAction.onClick();
            resetSwipe();
          }}
          className={`absolute inset-y-0 left-0 w-20 flex flex-col items-center justify-center text-white cursor-pointer ${
            leftAction.bgColor || 'bg-emerald-500'
          }`}
        >
          {leftAction.icon}
          <span className="text-[10px] font-bold mt-0.5">{leftAction.label}</span>
        </div>
      )}

      {/* Right Action Background (Reveal on swipe left) */}
      {rightAction && (
        <div
          onClick={() => {
            soundbox.playWarningThud();
            rightAction.onClick();
            resetSwipe();
          }}
          className={`absolute inset-y-0 right-0 w-20 flex flex-col items-center justify-center text-white cursor-pointer ${
            rightAction.bgColor || 'bg-destructive'
          }`}
        >
          {rightAction.icon}
          <span className="text-[10px] font-bold mt-0.5">{rightAction.label}</span>
        </div>
      )}

      {/* Foreground Swipeable Content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="relative bg-card z-10"
      >
        {children}
      </div>
    </div>
  );
}
