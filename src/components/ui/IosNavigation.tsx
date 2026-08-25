'use client';

import React from 'react';
import {
  ShoppingBag,
  BookOpen,
  Truck,
  Receipt,
  Package,
  BarChart3,
  Settings,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { soundbox } from '@/lib/audio';

export function IosNavigation() {
  const { activeTab, setActiveTab, language, cart, heldCarts } = useAppStore();

  const navItems = [
    {
      id: 'pos' as const,
      labelNp: 'बिक्री',
      labelEn: 'POS',
      icon: ShoppingBag,
      badge: cart.length > 0 ? cart.length : (heldCarts.length > 0 ? heldCarts.length : null),
    },
    {
      id: 'khata' as const,
      labelNp: 'खाता',
      labelEn: 'Udharo',
      icon: BookOpen,
    },
    {
      id: 'supplier' as const,
      labelNp: 'खरिद',
      labelEn: 'Stock',
      icon: Truck,
    },
    {
      id: 'expenses' as const,
      labelNp: 'खर्च',
      labelEn: 'Expense',
      icon: Receipt,
    },
    {
      id: 'reports' as const,
      labelNp: 'नाफा',
      labelEn: 'Reports',
      icon: BarChart3,
    },
    {
      id: 'inventory' as const,
      labelNp: 'सामान',
      labelEn: 'Items',
      icon: Package,
    },
    {
      id: 'settings' as const,
      labelNp: 'सेटिङ',
      labelEn: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 ios-glass border-t pb-safe"
        style={{ borderColor: 'var(--glass-border)' }}
      >
        <div className="grid grid-cols-5 h-14 max-w-lg mx-auto">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  soundbox.playTap();
                  setActiveTab(item.id);
                }}
                className="relative flex flex-col items-center justify-center gap-0.5 select-none ios-press"
                style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                  {item.badge && (
                    <span
                      className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] px-0.5 text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm bg-primary text-on-primary"
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}
                  style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}
                >
                  {language === 'ne' ? item.labelNp : item.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Left Sidebar */}
      <aside
        className="hidden md:flex flex-col w-52 shrink-0 p-3 gap-1 select-none"
        style={{
          backgroundColor: 'var(--surface)',
          borderRight: '0.5px solid var(--border)',
        }}
      >
        <div className="px-3 py-1.5 mb-1">
          <p
            className="text-[12px] font-bold uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            {language === 'ne' ? 'मुख्य मेनु' : 'Navigation'}
          </p>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                soundbox.playTap();
                setActiveTab(item.id);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-[13px] font-bold transition-all ios-press"
              style={{
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? 'var(--on-primary)' : 'var(--text)',
              }}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span>{language === 'ne' ? item.labelNp : item.labelEn}</span>
              </div>
              {item.badge && (
                <span
                  className="px-1.5 py-0.5 text-[10px] font-bold rounded-full"
                  style={{
                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--primary-soft)',
                    color: isActive ? 'var(--on-primary)' : 'var(--primary)',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </aside>
    </>
  );
}
