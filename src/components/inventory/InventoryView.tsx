'use client';

import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Trash2,
  Scale,
  Edit2,
  Flame,
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Product, KiranaUnit } from '@/types';
import { formatNPR } from '@/lib/nepali-calendar';
import { soundbox } from '@/lib/audio';
import { IosBottomSheet } from '@/components/ui/IosBottomSheet';
import { useAppStore } from '@/lib/store';

export function InventoryView() {
  const { language } = useAppStore();
  const [search, setSearch] = useState('');
  const [isNewProdOpen, setIsNewProdOpen] = useState(false);
  const [isWastageOpen, setIsWastageOpen] = useState(false);
  const [selectedProd, setSelectedProd] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [unit, setUnit] = useState<KiranaUnit>('piece');
  const [isQuickGrid, setIsQuickGrid] = useState(true);
  const [isReturnable, setIsReturnable] = useState(false);
  const [lowThreshold, setLowThreshold] = useState('5');

  // Wastage Form State
  const [wasteQty, setWasteQty] = useState('1');
  const [wasteReason, setWasteReason] = useState<'expired' | 'damaged' | 'lost'>('expired');
  const [wasteNotes, setWasteNotes] = useState('');

  const products = useLiveQuery(() => db.products.toArray()) || [];
  const wastageLogs = useLiveQuery(() => db.wastage_logs.reverse().toArray()) || [];

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search))
  );

  const lowStockProducts = products.filter(
    (p) => p.stock_quantity <= p.low_stock_threshold
  );

  const handleSaveProduct = async () => {
    if (!name.trim() || !sellingPrice) return;
    const now = new Date().toISOString();
    const newId = `prod-${Date.now()}`;

    await db.products.add({
      id: newId,
      merchant_id: 'merchant-default-001',
      name: name.trim(),
      barcode: barcode.trim() || undefined,
      selling_price: parseFloat(sellingPrice) || 0,
      wholesale_price: wholesalePrice ? parseFloat(wholesalePrice) : undefined,
      cost_price: parseFloat(costPrice) || 0,
      stock_quantity: parseFloat(stockQty) || 0,
      unit,
      is_quick_grid: isQuickGrid,
      is_returnable_asset: isReturnable,
      low_stock_threshold: parseFloat(lowThreshold) || 5,
      updated_at: now,
    });

    soundbox.playTap();
    setName('');
    setBarcode('');
    setSellingPrice('');
    setWholesalePrice('');
    setCostPrice('');
    setStockQty('');
    setIsNewProdOpen(false);
  };

  const handleLogWastage = async () => {
    if (!selectedProd) return;
    const qty = parseFloat(wasteQty) || 1;
    const cost = selectedProd.cost_price || selectedProd.selling_price * 0.8;
    const totalLoss = qty * cost;

    const now = new Date();
    await db.wastage_logs.add({
      id: `waste-${Date.now()}`,
      merchant_id: 'merchant-default-001',
      product_id: selectedProd.id,
      product_name: selectedProd.name,
      quantity: qty,
      cost_at_loss: cost,
      total_loss: totalLoss,
      reason: wasteReason,
      notes: wasteNotes.trim() || undefined,
      date_bs: '2083-05-04',
      created_at: now.toISOString(),
    });

    // Deduct stock
    await db.products
      .where('id')
      .equals(selectedProd.id)
      .modify((p) => {
        p.stock_quantity = Math.max(0, p.stock_quantity - qty);
      });

    soundbox.playWarningThud();
    setIsWastageOpen(false);
  };

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto max-w-5xl mx-auto w-full space-y-5 no-scrollbar animate-rise-in">
      {/* Low Stock Alert Banner (If any) */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 rounded-lg flex items-center justify-between gap-3 bg-amber-bg border border-amber-border">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 shrink-0 text-amber-text" />
            <div>
              <h3 className="text-[15px] font-bold text-amber-text">
                {language === 'ne' ? 'स्टक सकिन लागेका सामानहरू' : 'Low Stock Warning'}
              </h3>
              <p className="text-[12px] text-muted-foreground">
                {lowStockProducts.length} {language === 'ne' ? 'सामानको स्टक न्यून छ।' : 'items need restocking.'}
              </p>
            </div>
          </div>
          <span
            className="px-3 py-1 font-extrabold text-[12px] rounded-full bg-amber-bg text-amber-text"
          >
            {lowStockProducts.length} सामान
          </span>
        </div>
      )}

      {/* Top Search & Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'ne' ? 'सामान खोज्नुहोस्...' : 'Search items...'}
            className="w-full h-11 pl-10 pr-4 bg-card rounded-md border border-border/60 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsNewProdOpen(true)}
          className="w-full sm:w-auto h-11 px-4 rounded-md bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-1.5 shadow-sm ios-press"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{language === 'ne' ? 'नयाँ सामान थप्नुहोस्' : 'Add New Product'}</span>
        </button>
      </div>

      {/* Products Table / List */}
      <div className="bg-card rounded-lg border border-border/50 overflow-hidden shadow-[var(--shadow)]">
        <div className="divide-y divide-border/40">
          {filteredProducts.map((p) => {
            const isLow = p.stock_quantity <= p.low_stock_threshold;
            return (
              <div
                key={p.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[15px] font-bold text-foreground">{p.name}</h4>
                    {p.is_quick_grid && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary font-bold text-[10px] rounded-full">
                        Quick Grid
                      </span>
                    )}
                    {p.is_returnable_asset && (
                      <span className="px-2 py-0.5 font-bold text-[10px] rounded-full bg-blue-bg text-blue-text">
                        धरौटी जार
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    बिक्री दर: {formatNPR(p.selling_price)} / {p.unit}
                    {p.wholesale_price ? ` • थोक दर: ${formatNPR(p.wholesale_price)}` : ''}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <span
                      className="text-[15px] font-extrabold"
                      style={{ color: isLow ? 'var(--amber-text)' : 'var(--foreground)' }}
                    >
                      {p.stock_quantity} {p.unit}
                    </span>
                    <span className="text-[11px] text-muted-foreground block">
                      {isLow ? '⚠️ न्यून स्टक' : 'उपलब्ध स्टक'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProd(p);
                      setIsWastageOpen(true);
                    }}
                    title="Log Damaged / Expired stock"
                    className="h-9 px-3 rounded-sm bg-muted hover:bg-red-bg text-muted-foreground hover:text-red-text font-bold text-[12px] flex items-center gap-1.5 border border-border/60 ios-press"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>बिग्रिएको (Loss)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🪟 BOTTOM SHEET: Log Wastage / Expiry */}
      <IosBottomSheet
        isOpen={isWastageOpen}
        onClose={() => setIsWastageOpen(false)}
        title="बिग्रिएको / म्याद नाघेको सामान (Wastage Log)"
        subtitle={selectedProd?.name || ''}
      >
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[13px] font-bold text-muted-foreground block mb-1">
              कारण (Reason)
            </label>
            <select
              value={wasteReason}
              onChange={(e) => setWasteReason(e.target.value as any)}
              className="w-full h-12 px-3 bg-muted/40 rounded-md border border-border/60 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="expired">म्याद नाघेको (Expired)</option>
              <option value="damaged">फुटेको / बिग्रिएको (Damaged / Broken)</option>
              <option value="lost">मुसाले खाएको / हराएको (Lost / Infested)</option>
            </select>
          </div>

          <div>
            <label className="text-[13px] font-bold text-muted-foreground block mb-1">
              बिग्रिएको संख्या (Wasted Qty in {selectedProd?.unit})
            </label>
            <input
              type="number"
              value={wasteQty}
              onChange={(e) => setWasteQty(e.target.value)}
              className="w-full h-12 px-3 bg-muted/40 rounded-md border border-border/60 text-lg font-extrabold focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <button
            type="button"
            onClick={handleLogWastage}
            className="w-full h-14 mt-2 rounded-lg bg-destructive text-white font-extrabold text-[17px] shadow-lg ios-press"
          >
            स्टकबाट घटाउनुहोस् र नोक्सानी लेख्नुहोस्
          </button>
        </div>
      </IosBottomSheet>

      {/* 🪟 BOTTOM SHEET: Add New Product */}
      <IosBottomSheet
        isOpen={isNewProdOpen}
        onClose={() => setIsNewProdOpen(false)}
        title="नयाँ सामान दर्ता गर्नुहोस्"
      >
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[13px] font-bold text-muted-foreground block mb-1">
              सामानको नाम (Product Name) *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. वाई वाई चाउचाउ"
              className="w-full h-12 px-3 bg-muted/40 rounded-md border border-border/60 text-[15px] font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[13px] font-bold text-muted-foreground block mb-1">
                खुदरा मूल्य (Retail Rs.) *
              </label>
              <input
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder="25"
                className="w-full h-12 px-3 bg-muted/40 rounded-md border border-border/60 text-base font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="text-[13px] font-bold text-muted-foreground block mb-1">
                थोक मूल्य (Wholesale Rs.)
              </label>
              <input
                type="number"
                value={wholesalePrice}
                onChange={(e) => setWholesalePrice(e.target.value)}
                placeholder="22"
                className="w-full h-12 px-3 bg-muted/40 rounded-md border border-border/60 text-base font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[13px] font-bold text-muted-foreground block mb-1">
                स्टक संख्या (Quantity)
              </label>
              <input
                type="number"
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                placeholder="50"
                className="w-full h-12 px-3 bg-muted/40 rounded-md border border-border/60 text-base font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="text-[13px] font-bold text-muted-foreground block mb-1">
                इकाइ (Unit)
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="w-full h-12 px-3 bg-muted/40 rounded-md border border-border/60 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="packet">प्याकेट (Packet)</option>
                <option value="piece">थान (Piece)</option>
                <option value="kg">किलोग्राम (Kg)</option>
                <option value="gram">ग्राम (Gram)</option>
                <option value="liter">लिटर (Liter)</option>
                <option value="bora">बोरा (Bora)</option>
                <option value="carton">कार्टुन (Carton)</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveProduct}
            className="w-full h-14 mt-2 rounded-lg bg-primary text-primary-foreground font-extrabold text-[17px] shadow-lg ios-press"
          >
            सामान सुरक्षित गर्नुहोस्
          </button>
        </div>
      </IosBottomSheet>
    </div>
  );
}
