'use client';

import React from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  Calendar,
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { formatNPR, getNepaliDate } from '@/lib/nepali-calendar';
import { useAppStore } from '@/lib/store';

export function ReportsView() {
  const { language } = useAppStore();

  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];
  const expenses = useLiveQuery(() => db.expenses.toArray()) || [];
  const customers = useLiveQuery(() => db.customers.toArray()) || [];
  const customerLedger = useLiveQuery(() => db.customer_ledger.toArray()) || [];
  const wastageLogs = useLiveQuery(() => db.wastage_logs.toArray()) || [];

  const totalGrossSales = transactions.reduce((sum, t) => sum + t.final_amount, 0);
  const totalCashCollected = transactions.reduce((sum, t) => sum + t.cash_paid, 0);
  const totalUdharoIssued = transactions.reduce((sum, t) => sum + t.udharo_amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalWastageLoss = wastageLogs.reduce((sum, w) => sum + w.total_loss, 0);

  // Udharo Recovered from ledger credits
  const totalUdharoRecovered = customerLedger
    .filter((l) => l.type === 'credit')
    .reduce((sum, l) => sum + l.amount, 0);

  // Total Outstanding Debt
  const totalActiveDebt = customers.reduce((sum, c) => sum + Math.max(0, c.current_balance), 0);

  // Estimated Net Profit (assuming 18% average gross margin - expenses - wastage)
  const estimatedGrossProfit = totalGrossSales * 0.18;
  const estimatedNetProfit = Math.max(0, estimatedGrossProfit - totalExpenses - totalWastageLoss);

  // Top Debtors
  const topDebtors = [...customers]
    .filter((c) => c.current_balance > 0)
    .sort((a, b) => b.current_balance - a.current_balance)
    .slice(0, 5);

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto max-w-5xl mx-auto w-full space-y-6 no-scrollbar animate-rise-in">
      {/* Top Banner */}
      <div className="p-5 bg-card rounded-lg border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[12px] font-extrabold text-primary uppercase tracking-wider">
            {language === 'ne' ? 'समग्र पसल हिसाब किताब' : 'Store Financial Overview'}
          </span>
          <h2 className="text-2xl font-extrabold text-foreground mt-0.5">
            {language === 'ne' ? 'नाफा तथा कारोबार विश्लेषण' : 'Profit & Sales Analytics'}
          </h2>
        </div>
        <div className="px-4 py-2 bg-primary/10 rounded-md border border-primary/20 text-right">
          <p className="text-[11px] font-bold text-muted-foreground">अनुमानित खुद नाफा (Net Profit):</p>
          <p className="text-xl font-extrabold text-green-text">
            {formatNPR(estimatedNetProfit, language === 'ne')}
          </p>
        </div>
      </div>

      {/* 4-Card Performance Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-card rounded-lg border border-border/50 shadow-[var(--shadow)]">
          <p className="text-[12px] font-bold text-muted-foreground">कुल बिक्री (Total Sales):</p>
          <p className="text-[22px] font-extrabold text-foreground mt-1">
            {formatNPR(totalGrossSales, language === 'ne')}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{transactions.length} वटा बिलहरू</p>
        </div>

        <div className="p-4 rounded-lg shadow-[var(--shadow)] bg-green-bg border border-green-border">
          <p className="text-[12px] font-bold text-green-text">
            उठेको उधारो (Recovered):
          </p>
          <p className="text-[22px] font-extrabold mt-1 text-green-text">
            {formatNPR(totalUdharoRecovered, language === 'ne')}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">नगद संकलन</p>
        </div>

        <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20 shadow-[var(--shadow)]">
          <p className="text-[12px] font-bold text-destructive">कुल उठ्न बाँकी (Market Debt):</p>
          <p className="text-[22px] font-extrabold text-destructive mt-1">
            {formatNPR(totalActiveDebt, language === 'ne')}
          </p>
          <p className="text-[11px] text-destructive/80 mt-0.5">बजारमा रहेको उधारो</p>
        </div>

        <div className="p-4 bg-card rounded-lg border border-border/50 shadow-[var(--shadow)]">
          <p className="text-[12px] font-bold text-muted-foreground">कुल खर्च (Expenses):</p>
          <p className="text-[22px] font-extrabold text-foreground mt-1">
            {formatNPR(totalExpenses, language === 'ne')}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{expenses.length} वटा शीर्षक</p>
        </div>
      </div>

      {/* Top Debtors Leaderboard */}
      <div className="bg-card rounded-lg border border-border/50 overflow-hidden shadow-[var(--shadow)] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span>{language === 'ne' ? 'सबैभन्दा धेरै उधारो भएका ग्राहकहरू (Top Debtors)' : 'Top Debtors'}</span>
          </h3>
          <span className="text-[12px] font-bold text-muted-foreground">शीर्ष ५ जना</span>
        </div>

        <div className="divide-y divide-border/40">
          {topDebtors.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              कुनै बाँकी उधारो छैन। सबै हिसाब सफा छ!
            </p>
          ) : (
            topDebtors.map((cust, idx) => (
              <div key={cust.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center font-extrabold text-[12px] text-muted-foreground">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-[15px] font-bold text-foreground">{cust.name}</h4>
                    <p className="text-[12px] text-muted-foreground">{cust.phone || 'फोन छैन'}</p>
                  </div>
                </div>
                <span className="text-base font-extrabold text-destructive">
                  {formatNPR(cust.current_balance, language === 'ne')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
