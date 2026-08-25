'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Globe,
  Palette,
  ShieldCheck,
  ShieldAlert,
  Check,
  Calendar,
  ShoppingBag,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getNepaliDate } from '@/lib/nepali-calendar';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { ThemePreset } from '@/types';
import { soundbox } from '@/lib/audio';

export function IosHeader() {
  const [isMounted, setIsMounted] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  const {
    language,
    setLanguage,
    soundEnabled,
    toggleSound,
    isStaffMode,
    setIsStaffMode,
    themePreset,
    setThemePreset,
    setCustomAccentHsl,
  } = useAppStore();

  const settings = useLiveQuery(() => db.shop_settings.toCollection().first());
  const [bsDate, setBsDate] = useState<string>('');

  useEffect(() => {
    setIsMounted(true);
    const info = getNepaliDate();
    setBsDate(language === 'ne' ? info.bsFormattedNp : `${info.bsFormattedEn}`);
  }, [language]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    if (isThemeMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isThemeMenuOpen]);

  const toggleLanguage = () => {
    soundbox.playTap();
    setLanguage(language === 'ne' ? 'en' : 'ne');
  };

  const themeOptions: { id: ThemePreset; name: string; note: string; swatch: string }[] = [
    { id: 'paper', name: 'Paper', note: 'Daylight iOS Light', swatch: 'sw-paper' },
    { id: 'slate', name: 'Slate', note: 'Night Dark OLED', swatch: 'sw-slate' },
    { id: 'midnight', name: 'Midnight', note: 'Deep OLED Indigo', swatch: 'sw-midnight' },
    { id: 'sepia', name: 'Sepia', note: 'Warm Reading Cream', swatch: 'sw-sepia' },
    { id: 'mist', name: 'Mist', note: 'Cool Crisp Sky', swatch: 'sw-mist' },
    { id: 'ocean', name: 'Ocean', note: 'Deep Ocean Blue', swatch: 'sw-ocean' },
    { id: 'grape', name: 'Grape', note: 'Deep Violet Focus', swatch: 'sw-grape' },
    { id: 'emerald', name: 'Emerald', note: 'Kirana Green', swatch: 'sw-emerald' },
    { id: 'saffron', name: 'Saffron', note: 'Royal Golden Amber', swatch: 'sw-saffron' },
    { id: 'terracotta', name: 'Terracotta', note: 'Warm Clay Dhindo', swatch: 'sw-terracotta' },
  ];

  const accentPills = [
    { color: '#007AFF', label: 'Apple Blue' },
    { color: '#34C759', label: 'Emerald' },
    { color: '#FF9500', label: 'Orange' },
    { color: '#5856D6', label: 'Indigo' },
    { color: '#AF52DE', label: 'Purple' },
    { color: '#FF3B30', label: 'Crimson' },
    { color: '#FF2D55', label: 'Rose' },
    { color: '#30B0C7', label: 'Cyan' },
  ];

  return (
    <header
      className="sticky top-0 z-40 w-full ios-glass border-b transition-colors duration-200"
      style={{ borderColor: 'var(--glass-border)' }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-3">
        {/* Left: Brand + live date */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-sm flex items-center justify-center shadow-sm shrink-0 select-none"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-strong))' }}
          >
            <ShoppingBag className="w-5 h-5" style={{ color: 'var(--on-primary)' }} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1
                className="text-[15px] font-bold truncate tracking-tight"
                style={{ color: 'var(--text)' }}
                suppressHydrationWarning
              >
                {isMounted
                  ? settings?.pasal_name || (language === 'ne' ? 'सजिलो पसल' : 'SajiloPasal')
                  : 'सजिलो पसल'}
              </h1>
            </div>

            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 shrink-0" style={{ color: 'var(--primary)', opacity: 0.7 }} />
              <span
                className="text-[12px] font-medium truncate"
                style={{ color: 'var(--text-muted)' }}
                suppressHydrationWarning
              >
                {bsDate}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Icon Buttons & Theme Popover */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Staff Lock Mode Pill */}
          <button
            type="button"
            onClick={() => {
              soundbox.playTap();
              setIsStaffMode(!isStaffMode);
            }}
            title={isStaffMode ? 'Staff Mode Active' : 'Owner Mode Active'}
            className="h-8 px-2.5 rounded-full text-[12px] font-bold flex items-center gap-1 border transition-all ios-press select-none"
            style={{
              backgroundColor: isStaffMode ? 'var(--amber-soft)' : 'var(--numpad-key)',
              borderColor: isStaffMode ? 'var(--amber)' : 'var(--border)',
              color: isStaffMode ? 'var(--amber)' : 'var(--text-muted)',
            }}
          >
            {isStaffMode ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">स्टाफ मोड</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--green)' }} />
                <span className="hidden sm:inline">साहुजी</span>
              </>
            )}
          </button>

          {/* Theme Selector Popover */}
          <div className="relative" ref={themeMenuRef}>
            <button
              type="button"
              onClick={() => {
                soundbox.playTap();
                setIsThemeMenuOpen(!isThemeMenuOpen);
              }}
              className="w-8 h-8 rounded-full border flex items-center justify-center transition-all ios-press"
              style={{
                backgroundColor: isThemeMenuOpen ? 'var(--primary)' : 'var(--surface)',
                borderColor: isThemeMenuOpen ? 'var(--primary)' : 'var(--border)',
                color: isThemeMenuOpen ? 'var(--on-primary)' : 'var(--text)',
              }}
              title="Change Theme"
            >
              <Palette className="w-4 h-4" />
            </button>

            {isThemeMenuOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-72 backdrop-blur-2xl z-50 sheet-enter"
                style={{
                  background: 'var(--sheet-bg)',
                  borderRadius: 'var(--radius)',
                  border: '0.5px solid var(--border)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                <div className="px-3.5 pt-3.5 pb-1">
                  <p
                    className="text-[12px] font-bold uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {language === 'ne' ? 'थिम छनोट' : 'Themes'}
                  </p>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-0.5 no-scrollbar px-2 pb-2">
                  {themeOptions.map((t) => {
                    const isSelected = themePreset === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setThemePreset(t.id);
                          setIsThemeMenuOpen(false);
                        }}
                        className="w-full p-2 rounded-md flex items-center justify-between text-left transition-all ios-press"
                        style={{
                          backgroundColor: isSelected ? 'var(--primary-soft)' : 'transparent',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-xs border shadow-2xs shrink-0 ${t.swatch}`}
                            style={{ borderColor: 'var(--border)' }}
                          />
                          <div>
                            <p
                              className="text-sm font-bold leading-none"
                              style={{ color: isSelected ? 'var(--primary)' : 'var(--text)' }}
                            >
                              {t.name}
                            </p>
                            <p
                              className="text-[12px] mt-0.5"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {t.note}
                            </p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 stroke-[3]" style={{ color: 'var(--primary)' }} />}
                      </button>
                    );
                  })}
                </div>

                {/* Accent Color Dots */}
                <div className="px-3.5 pt-2 pb-3" style={{ borderTop: '0.5px solid var(--border)' }}>
                  <p
                    className="text-[12px] font-bold uppercase tracking-wider mb-1.5"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Accent Color
                  </p>
                  <div className="grid grid-cols-8 gap-1.5">
                    {accentPills.map((a) => (
                      <button
                        key={a.color}
                        type="button"
                        onClick={() => {
                          soundbox.playTap();
                          setCustomAccentHsl(a.color);
                        }}
                        className="w-5 h-5 rounded-full border ios-press hover:scale-110 transition-transform shadow-2xs"
                        style={{
                          backgroundColor: a.color,
                          borderColor: 'var(--border)',
                        }}
                        title={a.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Soundbox Volume Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Soundbox' : 'Unmute Soundbox'}
            className="w-8 h-8 rounded-full border flex items-center justify-center transition-all ios-press"
            style={{
              backgroundColor: soundEnabled ? 'var(--primary-soft)' : 'var(--surface)',
              borderColor: soundEnabled ? 'var(--primary)' : 'var(--border)',
              color: soundEnabled ? 'var(--primary)' : 'var(--text-muted)',
            }}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* 1-Tap Bilingual Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            title="Toggle Language"
            className="h-8 px-2.5 rounded-full border shadow-2xs flex items-center gap-1 text-[13px] font-bold ios-press"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          >
            <Globe className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
            <span suppressHydrationWarning>{language === 'ne' ? 'EN' : 'ने'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
