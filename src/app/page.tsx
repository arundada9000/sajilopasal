'use client';

import React, { useEffect, useState } from 'react';
import { IosHeader } from '@/components/ui/IosHeader';
import { IosNavigation } from '@/components/ui/IosNavigation';
import { PosView } from '@/components/pos/PosView';
import { KhataView } from '@/components/khata/KhataView';
import { SupplierView } from '@/components/supplier/SupplierView';
import { ExpensesView } from '@/components/expenses/ExpensesView';
import { InventoryView } from '@/components/inventory/InventoryView';
import { ReportsView } from '@/components/reports/ReportsView';
import { SettingsView } from '@/components/settings/SettingsView';
import { useAppStore } from '@/lib/store';
import { seedInitialDataIfNeeded } from '@/lib/db';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { activeTab } = useAppStore();

  useEffect(() => {
    setMounted(true);
    seedInitialDataIfNeeded().catch(console.error);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      {/* Top iOS Frosted Glass Header */}
      <IosHeader />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Adaptive Desktop Left Sidebar & Mobile Bottom Bar */}
        <IosNavigation />

        {/* Dynamic Active Screen */}
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          {activeTab === 'pos' && <PosView />}
          {activeTab === 'khata' && <KhataView />}
          {activeTab === 'supplier' && <SupplierView />}
          {activeTab === 'expenses' && <ExpensesView />}
          {activeTab === 'inventory' && <InventoryView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
}
