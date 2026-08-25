'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle2,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  Calendar,
  DollarSign,
  Package,
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Customer, CustomerLedgerEntry, CustomerAssetLedgerEntry } from '@/types';
import { formatNPR, getNepaliDate } from '@/lib/nepali-calendar';
import { soundbox } from '@/lib/audio';
import { IosBottomSheet } from '@/components/ui/IosBottomSheet';
import { IosNumpad } from '@/components/ui/IosNumpad';
import { IosSwipeRow } from '@/components/ui/IosSwipeRow';
import { IosAlertDialog } from '@/components/ui/IosAlertDialog';
import { useAppStore } from '@/lib/store';

export function KhataView() {
  const { language } = useAppStore();
  const [search, setSearch] = useState('');
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sheets
  const [isNewCustOpen, setIsNewCustOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [isJarSettleOpen, setIsJarSettleOpen] = useState(false);

  // Settlement Form State
  const [settleAmount, setSettleAmount] = useState('0');
  const [settleNotes, setSettleNotes] = useState('');

  // New Customer Form State
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custLimit, setCustLimit] = useState('5000');
  const [custNotes, setCustNotes] = useState('');

  // Validation Alert
  const [validationAlert, setValidationAlert] = useState<{ title: string; message: string } | null>(null);

  // Queries
  const customers = useLiveQuery(() => db.customers.toArray()) || [];
  const settings = useLiveQuery(() => db.shop_settings.toCollection().first());

  const customerLedger =
    useLiveQuery(async () => {
      if (!selectedCust) return [] as CustomerLedgerEntry[];
      return db.customer_ledger.where('customer_id').equals(selectedCust.id).reverse().toArray();
    }, [selectedCust]) || [];

  const customerAssets =
    useLiveQuery(async () => {
      if (!selectedCust) return [] as CustomerAssetLedgerEntry[];
      return db.customer_asset_ledger.where('customer_id').equals(selectedCust.id).toArray();
    }, [selectedCust]) || [];

  // Computed Jar balance
  const totalJarsDue = customerAssets.reduce((sum, a) => {
    return a.type === 'issued' ? sum + a.quantity : sum - a.quantity;
  }, 0);

  // Total Shop Udharo
  const totalShopUdharo = customers.reduce((sum, c) => sum + Math.max(0, c.current_balance), 0);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
  );

  const handleAddCustomer = async () => {
    if (!custName.trim()) return;
    const now = new Date().toISOString();
    const newId = `cust-${Date.now()}`;
    await db.customers.add({
      id: newId,
      merchant_id: 'merchant-default-001',
      name: custName.trim(),
      phone: custPhone.trim() || undefined,
      address: custAddress.trim() || undefined,
      credit_limit: parseFloat(custLimit) || 5000,
      current_balance: 0,
      credit_frozen: false,
      notes: custNotes.trim() || undefined,
      created_at: now,
      updated_at: now,
    });
    setCustName('');
    setCustPhone('');
    setCustAddress('');
    setCustNotes('');
    setIsNewCustOpen(false);
  };

  const handleRecordRepayment = async () => {
    if (!selectedCust) return;
    const amount = parseFloat(settleAmount) || 0;
    if (amount <= 0) return;

    const now = new Date();
    const dateInfo = getNepaliDate(now);
    const newBal = Math.max(0, selectedCust.current_balance - amount);

    await db.customers.update(selectedCust.id, {
      current_balance: newBal,
      last_payment_date: now.toISOString(),
      updated_at: now.toISOString(),
    });

    await db.customer_ledger.add({
      id: `cleg-${Date.now()}`,
      merchant_id: 'merchant-default-001',
      customer_id: selectedCust.id,
      type: 'credit',
      amount: amount,
      payment_method: 'cash',
      balance_after: newBal,
      notes: settleNotes.trim() || 'नगद भुक्तानी (Cash Repayment)',
      date_bs: dateInfo.bsIso,
      created_at: now.toISOString(),
    });

    soundbox.playCashChime();
    setSelectedCust({ ...selectedCust, current_balance: newBal });
    setSettleAmount('0');
    setSettleNotes('');
    setIsSettleOpen(false);
  };

  const handleRecordJarReturn = async (qty: number) => {
    if (!selectedCust || qty <= 0) return;
    const now = new Date();
    const dateInfo = getNepaliDate(now);

    await db.customer_asset_ledger.add({
      id: `asset-${Date.now()}`,
      merchant_id: 'merchant-default-001',
      customer_id: selectedCust.id,
      product_id: 'prod-5',
      type: 'returned',
      quantity: qty,
      date_bs: dateInfo.bsIso,
      created_at: now.toISOString(),
    });

    soundbox.playTap();
    setIsJarSettleOpen(false);
  };

  const sendWhatsAppReminder = (cust: Customer) => {
    const phone = cust.phone ? cust.phone.replace(/\D/g, '') : '';
    if (!phone) {
      setValidationAlert({
        title: language === 'ne' ? 'फोन नम्बर छैन' : 'No Phone Number',
        message: language === 'ne' ? 'ग्राहकको फोन नम्बर छैन' : 'Customer has no phone number',
      });
      return;
    }
    const targetPhone = phone.length === 10 ? `977${phone}` : phone;

    const msg =
      `नमस्ते ${cust.name} ज्यू,\n` +
      `*${settings?.pasal_name || 'सजिलो किराना'}* मा यहाँको बाँकी रकम *Rs. ${cust.current_balance}* रहेको छ।\n` +
      (totalJarsDue > 0 ? `साथै फिर्ता गर्नुपर्ने जार संख्या: *${totalJarsDue} वटा*\n` : '') +
      `सहज भएमा कृपया भुक्तानी गरिदिनुहोला। धन्यवाद!`;

    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (!isMounted) return null;

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-background animate-rise-in">
      {/* 👈 LEFT: Customer List & Total Udharo Banner */}
      <div className="w-full md:w-[360px] lg:w-[390px] flex flex-col h-full border-r border-border/50 bg-card shrink-0">
        {/* Total Udharo Summary Card */}
        <div className="p-3.5 bg-gradient-to-br from-destructive/15 via-destructive/5 to-transparent border-b border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-destructive flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              {language === 'ne' ? 'कुल उठ्न बाँकी (Total Udharo):' : 'Total Udharo:'}
            </span>
            <span className="text-sm font-semibold text-muted-foreground">
              {customers.length} {language === 'ne' ? 'जना ग्राहक' : 'Customers'}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-destructive mt-0.5 tracking-tight font-sans">
            {formatNPR(totalShopUdharo, language === 'ne')}
          </h2>
        </div>

        {/* Search & Add Customer Bar */}
        <div className="p-3.5 border-b border-border/50 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === 'ne' ? 'ग्राहक खोज्नुहोस्...' : 'Search customer...'}
              className="w-full h-10 pl-9 pr-3 bg-muted/60 dark:bg-muted/30 rounded-sm text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 border border-border/40 font-sans"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsNewCustOpen(true)}
            className="h-12 px-4 rounded-sm bg-primary text-primary-foreground font-bold text-sm flex items-center gap-1 shadow-sm ios-press shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>{language === 'ne' ? 'नयाँ ग्राहक' : 'Add'}</span>
          </button>
        </div>

        {/* Customer List with Swipe Gestures */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 no-scrollbar">
          {filteredCustomers.map((cust) => {
            const isSelected = selectedCust?.id === cust.id;
            const hasUdharo = cust.current_balance > 0;

            return (
              <IosSwipeRow
                key={cust.id}
                rightAction={{
                  icon: <DollarSign className="w-4 h-4" />,
                  label: 'पैसा आयो',
                  bgColor: 'bg-emerald-600',
                  onClick: () => {
                    setSelectedCust(cust);
                    setSettleAmount(cust.current_balance.toString());
                    setIsSettleOpen(true);
                  },
                }}
                leftAction={{
                  icon: <MessageCircle className="w-4 h-4" />,
                  label: 'WhatsApp',
                  bgColor: 'bg-emerald-500',
                  onClick: () => sendWhatsAppReminder(cust),
                }}
              >
                <div
                  onClick={() => {
                    soundbox.playTap();
                    setSelectedCust(cust);
                  }}
                  className={`p-3 rounded-md border transition-all cursor-pointer ios-press flex items-center justify-between gap-3.5 ${
                    isSelected
                      ? 'bg-primary/10 border-primary shadow-[var(--shadow)]'
                      : 'bg-card hover:bg-muted/40 border-border/50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground truncate font-sans">
                        {cust.name}
                      </h3>
                      {cust.credit_frozen && (
                        <ShieldAlert className="w-3.5 h-3.5 text-destructive shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-0.5 font-sans">
                      {cust.phone || 'फोन छैन'} {cust.address ? `• ${cust.address}` : ''}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className="text-sm font-extrabold block font-sans"
                      style={{ color: hasUdharo ? 'var(--red-text)' : 'var(--green-text)' }}
                    >
                      {hasUdharo ? formatNPR(cust.current_balance, language === 'ne') : 'सफा'}
                    </span>
                    {hasUdharo && (
                      <span className="text-sm font-bold text-muted-foreground uppercase">
                        बाँकी
                      </span>
                    )}
                  </div>
                </div>
              </IosSwipeRow>
            );
          })}
        </div>
      </div>

      {/* 👉 RIGHT: Selected Customer Khata Statement & Actions */}
      <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
        {selectedCust ? (
          <>
            {/* Customer Detail Header */}
            <div className="p-3.5 bg-card border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-[var(--shadow)]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-foreground font-sans">{selectedCust.name}</h2>
                  {selectedCust.phone && (
                    <a
                      href={`tel:${selectedCust.phone}`}
                      className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 font-sans">
                  फोन: {selectedCust.phone || 'छैन'} | ठेगाना: {selectedCust.address || 'छैन'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => sendWhatsAppReminder(selectedCust)}
                  className="h-9 px-3 rounded-sm font-bold text-sm flex items-center gap-1 ios-press bg-green-bg text-green-text border border-green-border"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp ताकेता</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSettleAmount(selectedCust.current_balance.toString());
                    setIsSettleOpen(true);
                  }}
                  className="h-9 px-3.5 rounded-sm bg-primary text-primary-foreground font-extrabold text-sm flex items-center gap-1 shadow-sm ios-press"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>पैसा आयो</span>
                </button>
              </div>
            </div>

            {/* Asset Deposit Bar (20L Water Jars) */}
            {totalJarsDue > 0 && (
              <div
                className="px-3.5 py-2 flex items-center justify-between bg-blue-bg"
                style={{ borderBottom: '0.5px solid var(--blue-border)' }}
              >
                <span className="text-sm font-bold flex items-center gap-1 text-blue-text">
                  <Package className="w-3.5 h-3.5" /> जार धरौटी: <span className="underline">{totalJarsDue} वटा जार बाँकी</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsJarSettleOpen(true)}
                  className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  खाली जार फिर्ता लिनुहोस् →
                </button>
              </div>
            )}

            {/* Ledger Statement Timeline */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 no-scrollbar">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                खाता विवरण (Statement History)
              </h3>

              {customerLedger.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Clock className="w-7 h-7 mx-auto opacity-40 mb-1.5" />
                  <p className="text-sm">कुनै कारोबार छैन (No transactions yet)</p>
                </div>
              ) : (
                customerLedger.map((entry) => {
                  const isDebit = entry.type === 'debit';
                  return (
                    <div
                      key={entry.id}
                      className="p-3 bg-card rounded-md border border-border/50 shadow-[var(--shadow)] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className="w-11 h-11 rounded-sm flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: isDebit ? 'var(--red-bg)' : 'var(--green-bg)',
                            color: isDebit ? 'var(--red-text)' : 'var(--green-text)',
                          }}
                        >
                          {isDebit ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownLeft className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground font-sans">
                            {isDebit ? 'सामान लगेको (Udharo Bill)' : 'पैसा बुझाएको (Payment)'}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            <span>{entry.date_bs}</span>
                            {entry.notes && <span>• {entry.notes}</span>}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className="text-sm font-extrabold block font-sans"
                          style={{ color: isDebit ? 'var(--red-text)' : 'var(--green-text)' }}
                        >
                          {isDebit ? `+ ${formatNPR(entry.amount)}` : `- ${formatNPR(entry.amount)}`}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          बाँकी: {formatNPR(entry.balance_after)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
            <Clock className="w-10 h-10 opacity-30 mb-2" />
            <h3 className="text-sm font-bold text-foreground">ग्राहक छान्नुहोस्</h3>
            <p className="text-sm mt-0.5 max-w-xs">
              बायाँ सूचीबाट ग्राहक छानेर विस्तृत खाता र हिसाब विवरण हेर्नुहोस्।
            </p>
          </div>
        )}
      </div>

      {/* 🪟 COMPACT SETTLEMENT SHEET ("Paisa Aayo") */}
      <IosBottomSheet
        isOpen={isSettleOpen}
        onClose={() => setIsSettleOpen(false)}
        title="पैसा आयो (Payment)"
        subtitle={`${selectedCust?.name || ''} बाट प्राप्त रकम`}
        maxWidth="sm:max-w-[420px]"
      >
        <div className="flex flex-col gap-3.5">
          <div className="p-3 bg-muted/40 rounded-md border border-border/50 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-muted-foreground">प्राप्त रकम:</span>
              <span className="text-lg font-extrabold text-green-text">
                {formatNPR(parseFloat(settleAmount) || 0)}
              </span>
            </div>
            <IosNumpad value={settleAmount} onChange={setSettleAmount} />
          </div>

          <div>
            <label className="text-sm font-bold text-muted-foreground block mb-1">
              कैफियत (Notes - Optional)
            </label>
            <input
              type="text"
              value={settleNotes}
              onChange={(e) => setSettleNotes(e.target.value)}
              placeholder="e.g. Fonepay मार्फत / नगद"
              className="w-full h-11 px-3 bg-muted/40 rounded-sm border border-border/60 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 font-sans"
            />
          </div>

          <button
            type="button"
            onClick={handleRecordRepayment}
            className="w-full h-12 rounded-md text-white font-extrabold text-base shadow-md ios-press bg-green"
          >
            भुक्तानी सुरक्षित गर्नुहोस्
          </button>
        </div>
      </IosBottomSheet>

      {/* 🪟 EMPTY JAR RETURN */}
      <IosBottomSheet
        isOpen={isJarSettleOpen}
        onClose={() => setIsJarSettleOpen(false)}
        title="खाली जार फिर्ता"
        subtitle={`कुल बाँकी जार: ${totalJarsDue} वटा`}
        maxWidth="sm:max-w-[360px]"
      >
        <div className="flex flex-col gap-3.5">
          <p className="text-sm text-muted-foreground text-center">
            ग्राहकले कति वटा खाली जार फिर्ता ल्याउनुभयो?
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, totalJarsDue].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleRecordJarReturn(q)}
                className="py-3 bg-muted/60 hover:bg-primary/20 text-foreground font-extrabold text-base rounded-sm border border-border/60 ios-press"
              >
                {q} जार
              </button>
            ))}
          </div>
        </div>
      </IosBottomSheet>

      {/* 🪟 ADD CUSTOMER */}
      <IosBottomSheet
        isOpen={isNewCustOpen}
        onClose={() => setIsNewCustOpen(false)}
        title="नयाँ ग्राहक थप्नुहोस्"
        maxWidth="sm:max-w-[420px]"
      >
        <div className="flex flex-col gap-3.5">
          <div>
            <label className="text-sm font-bold text-muted-foreground block mb-1">
              ग्राहकको पूरा नाम *
            </label>
            <input
              type="text"
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
              placeholder="e.g. राम श्रेष्ठ"
              className="w-full h-11 px-3 bg-muted/40 rounded-sm border border-border/60 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-bold text-muted-foreground block mb-1">
                फोन नम्बर
              </label>
              <input
                type="tel"
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                placeholder="98XXXXXXXX"
                className="w-full h-11 px-3 bg-muted/40 rounded-sm border border-border/60 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-muted-foreground block mb-1">
                उधारो सीमा (Rs.)
              </label>
              <input
                type="number"
                value={custLimit}
                onChange={(e) => setCustLimit(e.target.value)}
                className="w-full h-11 px-3 bg-muted/40 rounded-sm border border-border/60 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-muted-foreground block mb-1">
              ठेगाना / टोल
            </label>
            <input
              type="text"
              value={custAddress}
              onChange={(e) => setCustAddress(e.target.value)}
              placeholder="e.g. मन्दिर नजिकै"
              className="w-full h-11 px-3 bg-muted/40 rounded-sm border border-border/60 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 font-sans"
            />
          </div>

          <button
            type="button"
            onClick={handleAddCustomer}
            className="w-full h-12 mt-1.5 rounded-md bg-primary text-primary-foreground font-extrabold text-sm shadow-md ios-press"
          >
            ग्राहक सुरक्षित गर्नुहोस्
          </button>
        </div>
      </IosBottomSheet>

      {/* Validation Alert */}
      <IosAlertDialog
        isOpen={!!validationAlert}
        title={validationAlert?.title || ''}
        message={validationAlert?.message || ''}
        confirmLabel="ठीक छ (OK)"
        cancelLabel=""
        onConfirm={() => setValidationAlert(null)}
        onCancel={() => setValidationAlert(null)}
      />
    </div>
  );
}
