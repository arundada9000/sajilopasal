'use client';

import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Phone,
  CheckCircle2,
  PackagePlus,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Building2,
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Supplier, Product, SupplierLedgerEntry } from '@/types';
import { formatNPR, getNepaliDate } from '@/lib/nepali-calendar';
import { soundbox } from '@/lib/audio';
import { IosBottomSheet } from '@/components/ui/IosBottomSheet';
import { IosNumpad } from '@/components/ui/IosNumpad';
import { useAppStore } from '@/lib/store';

export function SupplierView() {
  const { language } = useAppStore();
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Sheets
  const [isNewSupplierOpen, setIsNewSupplierOpen] = useState(false);
  const [isPaySupplierOpen, setIsPaySupplierOpen] = useState(false);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);

  // Pay Form
  const [payAmount, setPayAmount] = useState('0');
  const [payNotes, setPayNotes] = useState('');

  // New Supplier Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');

  // Purchase Form
  const [selectedProdId, setSelectedProdId] = useState<string>('');
  const [purchaseQty, setPurchaseQty] = useState('10');
  const [purchaseCost, setPurchaseCost] = useState('0');
  const [paidNow, setPaidNow] = useState('0');

  // Queries
  const suppliers = useLiveQuery(() => db.suppliers.toArray()) || [];
  const products = useLiveQuery(() => db.products.toArray()) || [];
  const supplierLedger =
    useLiveQuery(async () => {
      if (!selectedSupplier) return [];
      return db.supplier_ledger.where('supplier_id').equals(selectedSupplier.id).reverse().toArray();
    }, [selectedSupplier]) || [];

  const totalSupplierPayable = suppliers.reduce(
    (sum, s) => sum + Math.max(0, s.current_balance),
    0
  );

  const handleAddSupplier = async () => {
    if (!name.trim()) return;
    const now = new Date().toISOString();
    await db.suppliers.add({
      id: `supp-${Date.now()}`,
      merchant_id: 'merchant-default-001',
      name: name.trim(),
      phone: phone.trim() || undefined,
      company_name: company.trim() || undefined,
      current_balance: 0,
      created_at: now,
      updated_at: now,
    });
    setName('');
    setPhone('');
    setCompany('');
    setIsNewSupplierOpen(false);
    soundbox.playTap();
  };

  const handlePaySupplier = async () => {
    if (!selectedSupplier) return;
    const amount = parseFloat(payAmount) || 0;
    if (amount <= 0) return;

    const now = new Date();
    const dateInfo = getNepaliDate(now);
    const newBal = Math.max(0, selectedSupplier.current_balance - amount);

    await db.suppliers.update(selectedSupplier.id, {
      current_balance: newBal,
      updated_at: now.toISOString(),
    });

    await db.supplier_ledger.add({
      id: `sleg-${Date.now()}`,
      merchant_id: 'merchant-default-001',
      supplier_id: selectedSupplier.id,
      type: 'payment_made',
      amount,
      payment_method: 'cash',
      balance_after: newBal,
      notes: payNotes.trim() || 'साहुलाई भुक्तानी (Payment to Wholesaler)',
      date_bs: dateInfo.bsIso,
      created_at: now.toISOString(),
    });

    soundbox.playCashChime();
    setSelectedSupplier({ ...selectedSupplier, current_balance: newBal });
    setPayAmount('0');
    setPayNotes('');
    setIsPaySupplierOpen(false);
  };

  const handleRecordPurchase = async () => {
    if (!selectedSupplier || !selectedProdId) return;
    const qty = parseFloat(purchaseQty) || 0;
    const cost = parseFloat(purchaseCost) || 0;
    const paid = parseFloat(paidNow) || 0;
    const totalBill = qty * cost;
    const creditAmount = Math.max(0, totalBill - paid);

    const now = new Date();
    const dateInfo = getNepaliDate(now);

    // Increment Product Stock
    await db.products
      .where('id')
      .equals(selectedProdId)
      .modify((p) => {
        p.stock_quantity += qty;
        p.cost_price = cost;
      });

    // Update Supplier Balance if credit > 0
    if (creditAmount > 0) {
      const newBal = (selectedSupplier.current_balance || 0) + creditAmount;
      await db.suppliers.update(selectedSupplier.id, {
        current_balance: newBal,
        updated_at: now.toISOString(),
      });

      await db.supplier_ledger.add({
        id: `sleg-${Date.now()}`,
        merchant_id: 'merchant-default-001',
        supplier_id: selectedSupplier.id,
        type: 'purchase_credit',
        amount: creditAmount,
        payment_method: 'cash',
        balance_after: newBal,
        notes: `सामान खरिद (${qty} थान @ रु. ${cost})`,
        date_bs: dateInfo.bsIso,
        created_at: now.toISOString(),
      });

      setSelectedSupplier({ ...selectedSupplier, current_balance: newBal });
    }

    soundbox.playTap();
    setIsPurchaseOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-background animate-rise-in">
      {/* 👈 LEFT: Suppliers List */}
      <div className="w-full md:w-[380px] lg:w-[420px] flex flex-col h-full border-r border-border/50 bg-card shrink-0">
        {/* Payable Banner */}
        <div className="p-4 bg-muted/40 border-b border-border/50">
          <span className="text-[13px] font-bold text-muted-foreground flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-primary" />
            {language === 'ne' ? 'साहुलाई तिर्न बाँकी रकम (Payable):' : 'Total Supplier Debt:'}
          </span>
          <h2 className="text-[28px] font-extrabold text-foreground mt-1 tracking-tight">
            {formatNPR(totalSupplierPayable, language === 'ne')}
          </h2>
        </div>

        {/* Action Header */}
        <div className="p-3 border-b border-border/50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">
            {language === 'ne' ? 'डिस्ट्रीयुटर / साहु सूची' : 'Distributors'}
          </h3>
          <button
            type="button"
            onClick={() => setIsNewSupplierOpen(true)}
            className="h-10 px-3.5 rounded-sm bg-primary text-primary-foreground font-bold text-[13px] flex items-center gap-1.5 shadow-sm ios-press"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{language === 'ne' ? 'नयाँ साहु' : 'Add'}</span>
          </button>
        </div>

        {/* Suppliers List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2 no-scrollbar">
          {suppliers.map((s) => {
            const isSelected = selectedSupplier?.id === s.id;
            return (
              <div
                key={s.id}
                onClick={() => {
                  soundbox.playTap();
                  setSelectedSupplier(s);
                }}
                className={`p-3.5 rounded-md border transition-all cursor-pointer ios-press flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-primary/10 border-primary'
                    : 'bg-card hover:bg-muted/40 border-border/50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-primary shrink-0" />
                    <h4 className="text-[15px] font-bold text-foreground truncate">{s.name}</h4>
                  </div>
                  <p className="text-[12px] text-muted-foreground truncate mt-0.5">
                    {s.company_name || s.phone || 'विवरण छैन'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-base font-extrabold text-destructive block">
                    {formatNPR(s.current_balance, language === 'ne')}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    तिर्न बाँकी
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 👉 RIGHT: Selected Supplier Statement & Actions */}
      <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
        {selectedSupplier ? (
          <>
            {/* Header */}
            <div className="p-4 bg-card border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-foreground">{selectedSupplier.name}</h2>
                <p className="text-[13px] text-muted-foreground">
                  {selectedSupplier.company_name} {selectedSupplier.phone ? `• ${selectedSupplier.phone}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPurchaseOpen(true)}
                  className="h-10 px-3.5 rounded-sm bg-muted hover:bg-muted/80 text-foreground font-bold text-[13px] flex items-center gap-1.5 border border-border/60 ios-press"
                >
                  <PackagePlus className="w-4 h-4 text-primary" />
                  <span>सामान भित्रियो (Stock In)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPayAmount(selectedSupplier.current_balance.toString());
                    setIsPaySupplierOpen(true);
                  }}
                  className="h-10 px-4 rounded-sm bg-primary text-primary-foreground font-extrabold text-[13px] flex items-center gap-1.5 shadow-sm ios-press"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>साहुलाई पैसा दियो (Pay)</span>
                </button>
              </div>
            </div>

            {/* Statement Timeline */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                खरिद तथा भुक्तानी विवरण (Purchase History)
              </h3>

              {supplierLedger.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Clock className="w-8 h-8 mx-auto opacity-40 mb-2" />
                  <p className="text-sm">कुनै खरिद कारोबार छैन</p>
                </div>
              ) : (
                supplierLedger.map((entry) => {
                  const isPurchase = entry.type === 'purchase_credit';
                  return (
                    <div
                      key={entry.id}
                      className="p-3.5 bg-card rounded-md border border-border/50 shadow-[var(--shadow)] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-sm flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: isPurchase ? 'var(--red-bg)' : 'var(--green-bg)',
                            color: isPurchase ? 'var(--red-text)' : 'var(--green-text)',
                          }}
                        >
                          {isPurchase ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {isPurchase ? 'सामान खरिद (Purchase)' : 'भुक्तानी गरेको (Payment)'}
                          </p>
                          <p className="text-[12px] text-muted-foreground">
                            {entry.date_bs} {entry.notes ? `• ${entry.notes}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className="text-base font-extrabold block"
                          style={{ color: isPurchase ? 'var(--red-text)' : 'var(--green-text)' }}
                        >
                          {isPurchase ? `+ ${formatNPR(entry.amount)}` : `- ${formatNPR(entry.amount)}`}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
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
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
            <Truck className="w-12 h-12 opacity-30 mb-2" />
            <h3 className="text-base font-bold text-foreground">साहु छान्नुहोस्</h3>
            <p className="text-[13px] mt-1 max-w-xs">
              बायाँबाट डिस्ट्रीयुटर छानेर खरिद बिल र तिर्न बाँकी हिसाब हेर्नुहोस्।
            </p>
          </div>
        )}
      </div>

      {/* 🪟 BOTTOM SHEET: Stock In / Purchase Inflow */}
      <IosBottomSheet
        isOpen={isPurchaseOpen}
        onClose={() => setIsPurchaseOpen(false)}
        title="नयाँ सामान खरिद (Stock In)"
        subtitle={selectedSupplier?.name || ''}
      >
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[13px] font-bold text-muted-foreground block mb-1">
              कुन सामान भित्रियो? (Select Product)
            </label>
            <select
              value={selectedProdId}
              onChange={(e) => {
                setSelectedProdId(e.target.value);
                const p = products.find((x) => x.id === e.target.value);
                if (p) setPurchaseCost(p.cost_price.toString());
              }}
              className="w-full h-12 px-3 bg-muted/40 rounded-md border border-border/60 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">-- सामान छान्नुहोस् --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (हालको स्टक: {p.stock_quantity})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[13px] font-bold text-muted-foreground block mb-1">
                आएको संख्या (Qty)
              </label>
              <input
                type="number"
                value={purchaseQty}
                onChange={(e) => setPurchaseQty(e.target.value)}
                className="w-full h-12 px-3 bg-muted/40 rounded-md border border-border/60 text-base font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="text-[13px] font-bold text-muted-foreground block mb-1">
                खरिद मूल्य दर (Cost/Unit)
              </label>
              <input
                type="number"
                value={purchaseCost}
                onChange={(e) => setPurchaseCost(e.target.value)}
                className="w-full h-12 px-3 bg-muted/40 rounded-md border border-border/60 text-base font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div className="p-3 bg-card rounded-md border border-border/50 flex items-center justify-between">
            <span className="text-sm font-bold text-muted-foreground">कुल खरिद रकम:</span>
            <span className="text-lg font-extrabold text-foreground">
              {formatNPR((parseFloat(purchaseQty) || 0) * (parseFloat(purchaseCost) || 0))}
            </span>
          </div>

          <div>
            <label className="text-[13px] font-bold text-muted-foreground block mb-1">
              तुरुन्तै नगद भुक्तानी (Paid Now - optional)
            </label>
            <input
              type="number"
              value={paidNow}
              onChange={(e) => setPaidNow(e.target.value)}
              placeholder="0"
              className="w-full h-12 px-3 bg-muted/40 rounded-md border border-border/60 text-base font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <button
            type="button"
            onClick={handleRecordPurchase}
            className="w-full h-14 mt-2 rounded-lg bg-primary text-primary-foreground font-extrabold text-[17px] shadow-lg ios-press"
          >
            स्टक तथा हिसाब सुरक्षित गर्नुहोस्
          </button>
        </div>
      </IosBottomSheet>

      {/* 🪟 BOTTOM SHEET: Pay Supplier */}
      <IosBottomSheet
        isOpen={isPaySupplierOpen}
        onClose={() => setIsPaySupplierOpen(false)}
        title="साहुलाई भुक्तानी (Pay Supplier)"
        subtitle={selectedSupplier?.name || ''}
      >
        <div className="flex flex-col gap-4">
          <div className="p-4 bg-muted/40 rounded-lg border border-border/50 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-muted-foreground">दिने रकम (Amount):</span>
              <span className="text-[26px] font-extrabold text-foreground">
                {formatNPR(parseFloat(payAmount) || 0)}
              </span>
            </div>
            <IosNumpad value={payAmount} onChange={setPayAmount} />
          </div>

          <button
            type="button"
            onClick={handlePaySupplier}
            className="w-full h-14 rounded-md text-white font-extrabold text-lg shadow-lg ios-press bg-green"
          >
            भुक्तानी सुरक्षित गर्नुहोस् (Confirm Payment)
          </button>
        </div>
      </IosBottomSheet>

      {/* 🪟 BOTTOM SHEET: Add Supplier */}
      <IosBottomSheet
        isOpen={isNewSupplierOpen}
        onClose={() => setIsNewSupplierOpen(false)}
        title="नयाँ साहु / डिस्ट्रीयुटर थप्नुहोस्"
      >
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[13px] font-bold text-muted-foreground block mb-1">
              साहु / कम्पनीको नाम (Name) *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. काठमाडौं होलसेल"
              className="w-full h-12 px-3 bg-muted/40 rounded-md border border-border/60 text-[15px] font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="text-[13px] font-bold text-muted-foreground block mb-1">
              सम्पर्क फोन नम्बर (Phone)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="98XXXXXXXX"
              className="w-full h-12 px-3 bg-muted/40 rounded-md border border-border/60 text-[15px] font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="text-[13px] font-bold text-muted-foreground block mb-1">
              डिस्ट्रीयुटर फर्म / कम्पनी (Company)
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Kathmandu Distributors Pvt. Ltd."
              className="w-full h-12 px-3 bg-muted/40 rounded-md border border-border/60 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <button
            type="button"
            onClick={handleAddSupplier}
            className="w-full h-14 mt-2 rounded-lg bg-primary text-primary-foreground font-extrabold text-[17px] shadow-lg ios-press"
          >
            साहु सुरक्षित गर्नुहोस्
          </button>
        </div>
      </IosBottomSheet>
    </div>
  );
}
