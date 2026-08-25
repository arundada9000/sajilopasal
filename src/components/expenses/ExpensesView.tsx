'use client';

import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Coffee,
  Zap,
  Home,
  Truck,
  Users,
  Wrench,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Expense } from '@/types';
import { formatNPR, getNepaliDate } from '@/lib/nepali-calendar';
import { soundbox } from '@/lib/audio';
import { IosBottomSheet } from '@/components/ui/IosBottomSheet';
import { IosNumpad } from '@/components/ui/IosNumpad';
import { useAppStore } from '@/lib/store';

export function ExpensesView() {
  const { language } = useAppStore();
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);
  const [amount, setAmount] = useState('0');
  const [category, setCategory] = useState<Expense['category']>('tea_snacks');
  const [notes, setNotes] = useState('');

  const nowBs = getNepaliDate().bsIso;

  // Live queries
  const expenses = useLiveQuery(() => db.expenses.reverse().toArray()) || [];
  const todayTransactions =
    useLiveQuery(() => db.transactions.where('date_bs').equals(nowBs).toArray()) || [];

  const todayExpenses = expenses.filter((e) => e.date_bs === nowBs);
  const todayTotalExpenses = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Today Sales Stats
  const todayGrossSales = todayTransactions.reduce((sum, t) => sum + t.final_amount, 0);
  const todayCashCollected = todayTransactions.reduce((sum, t) => sum + t.cash_paid, 0);
  const todayUdharoIssued = todayTransactions.reduce((sum, t) => sum + t.udharo_amount, 0);

  // Rough Net Cash Flow
  const netCashInDrawer = todayCashCollected - todayTotalExpenses;

  const categories = [
    { id: 'tea_snacks' as const, labelNp: 'चिया / खाजा', labelEn: 'Tea / Snacks', icon: Coffee },
    { id: 'electricity' as const, labelNp: 'बत्ती / पानी', labelEn: 'Electricity', icon: Zap },
    { id: 'rent' as const, labelNp: 'पसल भाडा', labelEn: 'Rent', icon: Home },
    { id: 'transport' as const, labelNp: 'ढुवानी (भाडा)', labelEn: 'Transport', icon: Truck },
    { id: 'staff' as const, labelNp: 'कर्मचारी तलब', labelEn: 'Staff Salary', icon: Users },
    { id: 'maintenance' as const, labelNp: 'मर्मत / अन्य', labelEn: 'Maintenance', icon: Wrench },
  ];

  const handleAddExpense = async () => {
    const amt = parseFloat(amount) || 0;
    if (amt <= 0) return;

    const dateInfo = getNepaliDate();
    await db.expenses.add({
      id: `exp-${Date.now()}`,
      merchant_id: 'merchant-default-001',
      category,
      amount: amt,
      payment_mode: 'cash',
      notes: notes.trim() || undefined,
      date_bs: dateInfo.bsIso,
      created_at: new Date().toISOString(),
    });

    soundbox.playTap();
    setAmount('0');
    setNotes('');
    setIsNewExpenseOpen(false);
  };

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto max-w-5xl mx-auto w-full space-y-5 no-scrollbar animate-rise-in">
      {/* 📊 Top Real-Time Net Cash Flow Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-card rounded-lg border border-border/50">
          <p className="text-[13px] font-bold text-muted-foreground">
            {language === 'ne' ? 'आजको कुल बिक्री (Gross Sales):' : "Today's Gross Sales:"}
          </p>
          <p className="text-2xl font-extrabold text-foreground mt-1">
            {formatNPR(todayGrossSales, language === 'ne')}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            नगद: {formatNPR(todayCashCollected)} | उधारो: {formatNPR(todayUdharoIssued)}
          </p>
        </div>

        <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
          <p className="text-[13px] font-bold text-destructive">
            {language === 'ne' ? 'आजको कुल खर्च (Total Expense):' : "Today's Expenses:"}
          </p>
          <p className="text-2xl font-extrabold text-destructive mt-1">
            {formatNPR(todayTotalExpenses, language === 'ne')}
          </p>
          <p className="text-[11px] text-destructive/80 mt-0.5">
            {todayExpenses.length} {language === 'ne' ? 'वटा खर्च शीर्षक' : 'records logged'}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-green-bg border border-green-border">
          <p className="text-[13px] font-bold flex items-center gap-1 text-green-text">
            <TrendingUp className="w-4 h-4" />
            {language === 'ne' ? 'गल्लामा खुद नगद (Net Cash Flow):' : 'Net Cash in Drawer:'}
          </p>
          <p className="text-2xl font-extrabold mt-1 text-green-text">
            {formatNPR(netCashInDrawer, language === 'ne')}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">नगद बिक्री - दैनिक खर्च</p>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-foreground">
          {language === 'ne' ? 'दैनिक खर्च विवरण (Expense Records)' : 'Expense Records'}
        </h2>
        <button
          type="button"
          onClick={() => setIsNewExpenseOpen(true)}
          className="h-11 px-4 rounded-md bg-primary text-primary-foreground font-bold text-sm flex items-center gap-1.5 shadow-sm ios-press"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{language === 'ne' ? 'खर्च थप्नुहोस्' : 'Log Expense'}</span>
        </button>
      </div>

      {/* Expenses History List */}
      <div className="space-y-2.5">
        {expenses.length === 0 ? (
          <div className="p-12 text-center bg-card rounded-lg border border-border/50 text-muted-foreground">
            <Receipt className="w-12 h-12 mx-auto opacity-30 mb-2" />
            <p className="text-[15px] font-bold text-foreground">कुनै खर्च लेखिएको छैन</p>
            <p className="text-[13px] mt-0.5">माथिको "+ खर्च थप्नुहोस्" मा थिचेर खर्च लेख्नुहोस्।</p>
          </div>
        ) : (
          expenses.map((exp) => {
            const catObj = categories.find((c) => c.id === exp.category);
            const Icon = catObj?.icon || DollarSign;
            return (
              <div
                key={exp.id}
                className="p-3.5 bg-card rounded-lg border border-border/50 shadow-[var(--shadow)] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-sm bg-muted flex items-center justify-center text-foreground shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-foreground">
                      {language === 'ne' ? catObj?.labelNp : catObj?.labelEn}
                    </h3>
                    <p className="text-[12px] text-muted-foreground">
                      {exp.date_bs} {exp.notes ? `• ${exp.notes}` : ''}
                    </p>
                  </div>
                </div>
                <span className="text-[17px] font-extrabold text-destructive">
                  - {formatNPR(exp.amount, language === 'ne')}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* 🪟 BOTTOM SHEET: Add Expense */}
      <IosBottomSheet
        isOpen={isNewExpenseOpen}
        onClose={() => setIsNewExpenseOpen(false)}
        title={language === 'ne' ? 'नयाँ खर्च लेख्नुहोस्' : 'Log Daily Expense'}
      >
        <div className="flex flex-col gap-4">
          {/* Category Chips */}
          <div>
            <label className="text-[13px] font-bold text-muted-foreground block mb-2">
              खर्चको शीर्षक (Category):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((c) => {
                const Icon = c.icon;
                const isSelected = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      soundbox.playTap();
                      setCategory(c.id);
                    }}
                    className={`p-3 rounded-md border flex items-center gap-2 font-bold text-[13px] transition-all ios-press ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                        : 'bg-muted/40 hover:bg-muted text-foreground border-border/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{language === 'ne' ? c.labelNp : c.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Numpad */}
          <div className="p-4 bg-muted/40 rounded-lg border border-border/50 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-muted-foreground">खर्च रकम (Rupees):</span>
              <span className="text-[26px] font-extrabold text-destructive">
                {formatNPR(parseFloat(amount) || 0)}
              </span>
            </div>
            <IosNumpad value={amount} onChange={setAmount} />
          </div>

          {/* Notes */}
          <div>
            <label className="text-[13px] font-bold text-muted-foreground block mb-1">
              कैफियत (Details - Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. दिउसोको चिया नास्ता"
              className="w-full h-12 px-3 bg-muted/40 rounded-md border border-border/60 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <button
            type="button"
            onClick={handleAddExpense}
            className="w-full h-14 rounded-lg bg-primary text-primary-foreground font-extrabold text-[17px] shadow-lg ios-press"
          >
            खर्च सुरक्षित गर्नुहोस् (Save Expense)
          </button>
        </div>
      </IosBottomSheet>
    </div>
  );
}
