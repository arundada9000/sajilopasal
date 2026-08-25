'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Receipt,
  UserCheck,
  Pause,
  Play,
  RotateCcw,
  CheckCircle2,
  Scale,
  Minus,
  TrendingUp,
  Tag,
  Check,
  Banknote,
  Handshake,
  FileText,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Product, Customer, KiranaUnit } from '@/types';
import { formatNPR, getNepaliDate } from '@/lib/nepali-calendar';
import { soundbox } from '@/lib/audio';
import { IosBottomSheet } from '@/components/ui/IosBottomSheet';
import { IosNumpad } from '@/components/ui/IosNumpad';
import { IosSegmentedControl } from '@/components/ui/IosSegmentedControl';
import { IosAlertDialog } from '@/components/ui/IosAlertDialog';
import { IosSwipeRow } from '@/components/ui/IosSwipeRow';
import { IosActionSheet, ActionSheetOption } from '@/components/ui/IosActionSheet';

export function PosView() {
  const {
    language,
    cart,
    addToCart,
    updateCartItemQty,
    removeFromCart,
    clearCart,
    pricingTier,
    setPricingTier,
    discountAmount,
    setDiscountAmount,
    selectedCustomer,
    setSelectedCustomer,
    heldCarts,
    holdCurrentCart,
    resumeHeldCart,
    getCartSubtotal,
    getCartTotal,
    getCartItemCount,
  } = useAppStore();

  const [search, setSearch] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Modals & Sheets
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCustomItemOpen, setIsCustomItemOpen] = useState(false);
  const [isCustomerSelectOpen, setIsCustomerSelectOpen] = useState(false);
  const [isKgCalcOpen, setIsKgCalcOpen] = useState(false);
  const [selectedKgProduct, setSelectedKgProduct] = useState<Product | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastCompletedTxn, setLastCompletedTxn] = useState<any>(null);

  // Validation Alert State
  const [validationAlert, setValidationAlert] = useState<{ title: string; message: string } | null>(null);

  // Long-press Context Action Sheet State
  const [actionSheetProduct, setActionSheetProduct] = useState<Product | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // Custom Item Form State
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customUnit, setCustomUnit] = useState<KiranaUnit>('piece');

  // Checkout State
  const [checkoutMode, setCheckoutMode] = useState<'cash' | 'split' | 'udharo'>('cash');
  const [cashTendered, setCashTendered] = useState<string>('0');
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // Loose Item Calculator State
  const [calcMode, setCalcMode] = useState<'by_amount' | 'by_weight'>('by_amount');
  const [calcRupeeAmount, setCalcRupeeAmount] = useState<string>('50');
  const [calcWeightKg, setCalcWeightKg] = useState<string>('0.5');

  // Live queries from Dexie.js
  const categories = useLiveQuery(() => db.categories.orderBy('sort_order').toArray()) || [];
  const allProducts = useLiveQuery(() => db.products.toArray()) || [];
  const customers = useLiveQuery(() => db.customers.toArray()) || [];
  const settings = useLiveQuery(() => db.shop_settings.toCollection().first());
  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];

  // Today's summary computation
  const todayIso = getNepaliDate().bsIso;
  const todayTxns = transactions.filter((t) => t.date_bs === todayIso);
  const todayTotalSales = todayTxns.reduce((sum, t) => sum + (t.final_amount || 0), 0);
  const todayCashSales = todayTxns.reduce((sum, t) => sum + (t.cash_paid || 0), 0);
  const todayUdharoSales = todayTxns.reduce((sum, t) => sum + (t.udharo_amount || 0), 0);

  const filteredProducts = allProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search));
    const matchesCat = selectedCatId ? p.category_id === selectedCatId : true;
    return matchesSearch && matchesCat;
  });

  const cartTotal = getCartTotal();
  const cartSubtotal = getCartSubtotal();
  const tenderedNum = parseFloat(cashTendered) || 0;
  const changeAmount = Math.max(0, tenderedNum - cartTotal);
  const remainingUdharo = Math.max(0, cartTotal - tenderedNum);

  const cashPercent = cartTotal > 0 ? Math.min(100, Math.round((tenderedNum / cartTotal) * 100)) : 100;
  const udharoPercent = 100 - cashPercent;

  useEffect(() => {
    if (isCheckoutOpen) {
      setCashTendered(cartTotal.toString());
      setCheckoutMode('cash');
    }
  }, [isCheckoutOpen, cartTotal]);

  const getProductIcon = (p: Product) => {
    if (p.is_returnable_asset) return '🫙';
    if (p.name.toLowerCase().includes('wai') || p.name.toLowerCase().includes('noodle')) return '🍜';
    if (p.name.toLowerCase().includes('milk') || p.name.toLowerCase().includes('दूध')) return '🥛';
    if (p.name.toLowerCase().includes('sugar') || p.name.toLowerCase().includes('चिनी')) return '🍚';
    if (p.name.toLowerCase().includes('rice') || p.name.toLowerCase().includes('चामल')) return '🌾';
    if (p.name.toLowerCase().includes('oil') || p.name.toLowerCase().includes('तेल')) return '🛢️';
    if (p.name.toLowerCase().includes('soap') || p.name.toLowerCase().includes('साबुन')) return '🧼';
    return '📦';
  };

  const handleTouchStart = (product: Product) => {
    longPressTimer.current = setTimeout(() => {
      soundbox.playTap();
      setActionSheetProduct(product);
    }, 600);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleOpenKgCalc = (prod: Product) => {
    setSelectedKgProduct(prod);
    setCalcRupeeAmount(prod.selling_price.toString());
    setCalcWeightKg('1');
    setIsKgCalcOpen(true);
  };

  const handleAddKgToCart = () => {
    if (!selectedKgProduct) return;
    const rate =
      pricingTier === 'wholesale' && selectedKgProduct.wholesale_price
        ? selectedKgProduct.wholesale_price
        : selectedKgProduct.selling_price;

    let finalQty = 1;
    if (calcMode === 'by_amount') {
      const amount = parseFloat(calcRupeeAmount) || 0;
      finalQty = Math.round((amount / rate) * 1000) / 1000;
    } else {
      finalQty = parseFloat(calcWeightKg) || 1;
    }

    addToCart(selectedKgProduct, finalQty, 'kg');
    setIsKgCalcOpen(false);
  };

  const handleAddCustomItem = () => {
    if (!customName.trim() || !customPrice) return;
    const price = parseFloat(customPrice) || 0;
    const tempProd: Product = {
      id: `custom-${Date.now()}`,
      merchant_id: 'merchant-default-001',
      name: customName.trim(),
      selling_price: price,
      cost_price: price * 0.8,
      stock_quantity: 999,
      unit: customUnit,
      is_quick_grid: false,
      is_returnable_asset: false,
      low_stock_threshold: 0,
      updated_at: new Date().toISOString(),
    };
    addToCart(tempProd, 1, customUnit);
    setCustomName('');
    setCustomPrice('');
    setIsCustomItemOpen(false);
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0) return;

    let cashPaid = 0;
    let udharoAmt = 0;
    let paymentMode: any = 'full_cash';

    if (checkoutMode === 'cash') {
      cashPaid = cartTotal;
      udharoAmt = 0;
      paymentMode = 'full_cash';
    } else if (checkoutMode === 'udharo') {
      cashPaid = 0;
      udharoAmt = cartTotal;
      paymentMode = 'full_udharo';
      if (!selectedCustomer && !newCustName.trim()) {
        setValidationAlert({
          title: language === 'ne' ? 'ग्राहक आवश्यक' : 'Customer Required',
          message: language === 'ne' ? 'कृपया ग्राहक छान्नुहोस्' : 'Please select a customer',
        });
        return;
      }
    } else {
      cashPaid = Math.min(cartTotal, Math.max(0, tenderedNum));
      udharoAmt = Math.max(0, cartTotal - cashPaid);
      paymentMode = 'split';
      if (udharoAmt > 0 && !selectedCustomer && !newCustName.trim()) {
        setValidationAlert({
          title: language === 'ne' ? 'बाँकी रकमको लागि ग्राहक चाहिन्छ' : 'Customer Needed for Udharo',
          message: language === 'ne' ? 'बाँकी रकमको लागि ग्राहक छान्नुहोस्' : 'Please select a customer for Udharo',
        });
        return;
      }
    }

    const now = new Date();
    const dateInfo = getNepaliDate(now);
    let customerId = selectedCustomer?.id;
    let customerName = selectedCustomer?.name;

    if (!customerId && newCustName.trim()) {
      customerId = `cust-${Date.now()}`;
      customerName = newCustName.trim();
      await db.customers.add({
        id: customerId,
        merchant_id: 'merchant-default-001',
        name: customerName,
        phone: newCustPhone.trim() || undefined,
        credit_limit: 5000,
        current_balance: udharoAmt,
        credit_frozen: false,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      });
    }

    const txnId = `BILL-${Date.now().toString().slice(-6)}`;

    const txnRecord = {
      id: txnId,
      merchant_id: 'merchant-default-001',
      customer_id: customerId,
      customer_name: customerName,
      total_amount: cartSubtotal,
      discount_amount: discountAmount,
      final_amount: cartTotal,
      cash_paid: cashPaid,
      udharo_amount: udharoAmt,
      pricing_tier: pricingTier,
      payment_mode: paymentMode,
      is_pan_bill: false,
      date_bs: dateInfo.bsIso,
      created_at: now.toISOString(),
    };

    await db.transactions.add(txnRecord);

    for (const item of cart) {
      await db.transaction_items.add({
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        transaction_id: txnId,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit: item.selected_unit,
        unit_price: item.unit_price,
        total_price: item.subtotal,
      });

      if (!item.product.id.startsWith('custom-')) {
        await db.products
          .where('id')
          .equals(item.product.id)
          .modify((p) => {
            p.stock_quantity = Math.max(0, p.stock_quantity - item.quantity);
          });
      }

      if (item.product.is_returnable_asset && customerId) {
        await db.customer_asset_ledger.add({
          id: `asset-${Date.now()}`,
          merchant_id: 'merchant-default-001',
          customer_id: customerId,
          product_id: item.product.id,
          type: 'issued',
          quantity: item.quantity,
          date_bs: dateInfo.bsIso,
          created_at: now.toISOString(),
        });
      }
    }

    if (udharoAmt > 0 && customerId) {
      const cust = await db.customers.get(customerId);
      const newBal = (cust?.current_balance || 0) + udharoAmt;
      await db.customers.update(customerId, {
        current_balance: newBal,
        last_payment_date: now.toISOString(),
        updated_at: now.toISOString(),
      });

      await db.customer_ledger.add({
        id: `cleg-${Date.now()}`,
        merchant_id: 'merchant-default-001',
        customer_id: customerId,
        transaction_id: txnId,
        type: 'debit',
        amount: udharoAmt,
        payment_method: 'cash',
        balance_after: newBal,
        notes: `बिल #${txnId} बाट बाँकी`,
        date_bs: dateInfo.bsIso,
        created_at: now.toISOString(),
      });

      soundbox.playUdharoTone();
    } else {
      soundbox.playCashChime();
    }

    setLastCompletedTxn({
      ...txnRecord,
      items: [...cart],
      customerPhone: selectedCustomer?.phone || newCustPhone,
    });

    clearCart();
    setIsCheckoutOpen(false);
    setIsSuccessModalOpen(true);
  };

  const getWhatsAppLink = () => {
    if (!lastCompletedTxn) return '';
    const phone = lastCompletedTxn.customerPhone || '';
    const cleanPhone = phone.replace(/\D/g, '');
    const targetPhone = cleanPhone.length === 10 ? `977${cleanPhone}` : cleanPhone;

    const itemsSummary = lastCompletedTxn.items
      .map(
        (i: any) =>
          `• ${i.product.name} (${i.quantity} ${i.selected_unit}) = Rs. ${i.subtotal}`
      )
      .join('\n');

    const msg =
      `*${settings?.pasal_name || 'सजिलो किराना'}*\n` +
      `बिल नं: #${lastCompletedTxn.id}\n` +
      `मिति: ${lastCompletedTxn.date_bs}\n` +
      `---------------------------\n` +
      `${itemsSummary}\n` +
      `---------------------------\n` +
      `*कुल रकम (Total): Rs. ${lastCompletedTxn.final_amount}*\n` +
      `नगद भुक्तानी (Paid): Rs. ${lastCompletedTxn.cash_paid}\n` +
      (lastCompletedTxn.udharo_amount > 0
        ? `*बाँकी हिसाब (Udharo): Rs. ${lastCompletedTxn.udharo_amount}*\n`
        : '') +
      `\n${settings?.receipt_footer || 'धन्यवाद, फेरी आउनुहोला!'}`;

    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
  };

  const actionSheetOptions: ActionSheetOption[] = actionSheetProduct
    ? [
        {
          label: `+ ५ थान जोड्नुहोस् (+5 Qty)`,
          onClick: () => addToCart(actionSheetProduct, 5),
        },
        {
          label: `+ १० थान जोड्नुहोस् (+10 Qty)`,
          onClick: () => addToCart(actionSheetProduct, 10),
        },
        ...(actionSheetProduct.unit === 'kg' || actionSheetProduct.unit === 'gram'
          ? [
              {
                label: `तौल हिसाब क्यालकुलेटर (Kg Calc)`,
                onClick: () => handleOpenKgCalc(actionSheetProduct),
              },
            ]
          : []),
      ]
    : [];

  if (!isMounted) return null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background animate-rise-in">
      {/* 📊 Top Grouped Inset Snapshot Card (Loksewa Prep style) */}
      <div className="px-3 sm:px-6 pt-3 pb-2 max-w-7xl mx-auto w-full">
        <div className="ios-card p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-6 flex-wrap select-none">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-sm bg-primary-soft text-primary flex items-center justify-center text-lg font-extrabold shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">
                {language === 'ne' ? 'आजको कुल बिक्री' : "Today's Sales"}
              </span>
              <span className="text-[19px] sm:text-lg font-extrabold text-foreground tracking-tight font-sans">
                {formatNPR(todayTotalSales, language === 'ne')}
              </span>
            </div>
          </div>

          <div className="hidden sm:block w-[1px] h-8 bg-border/60" />

          <div className="flex items-center gap-6">
            <div>
              <span className="text-sm font-semibold flex items-center gap-1 block text-green-text">
                <Banknote className="w-3.5 h-3.5" />
                {language === 'ne' ? 'नगद' : 'Cash'}
              </span>
              <span className="text-sm font-bold text-foreground font-sans">
                {formatNPR(todayCashSales, language === 'ne')}
              </span>
            </div>

            <div>
              <span className="text-sm font-semibold text-destructive flex items-center gap-1 block">
                <Handshake className="w-3.5 h-3.5" />
                {language === 'ne' ? 'उधारो' : 'Udharo'}
              </span>
              <span className="text-sm font-bold text-foreground font-sans">
                {formatNPR(todayUdharoSales, language === 'ne')}
              </span>
            </div>

            <div className="hidden md:block">
              <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1 block">
                <FileText className="w-3.5 h-3.5" />
                {language === 'ne' ? 'बिल संख्या' : 'Bills'}
              </span>
              <span className="text-sm font-bold text-foreground">
                {todayTxns.length} {language === 'ne' ? 'वटा' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Viewport */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 pb-4 flex flex-col md:flex-row gap-3 sm:gap-4 overflow-hidden">
        {/* 👈 LEFT: Product Catalog & Category Tabs */}
        <div className="flex-1 flex flex-col h-full overflow-hidden ios-card p-3 gap-3.5">
          {/* Search and Custom Item Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  language === 'ne'
                    ? 'सामान वा बारकोड खोज्नुहोस्...'
                    : 'Search products or scan barcode...'
                }
                className="w-full h-10 pl-9 pr-3.5 bg-muted/60 dark:bg-muted/30 rounded-sm text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 border border-border/50 font-sans"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsCustomItemOpen(true)}
              className="h-12 px-4 rounded-sm bg-primary text-white font-bold text-sm flex items-center gap-2 shadow-xs ios-press shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">
                {language === 'ne' ? 'नयाँ सामान' : 'Custom Item'}
              </span>
            </button>
          </div>

          {/* Category Pills Switcher */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setSelectedCatId(null)}
              className={`px-3 py-1.5 rounded-sm text-sm font-bold whitespace-nowrap transition-all ios-press flex items-center gap-1 ${
                selectedCatId === null
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              <Tag className="w-3 h-3" />
              <span>{language === 'ne' ? 'सबै सामान' : 'All Items'}</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCatId(cat.id)}
                className={`px-3 py-1.5 rounded-sm text-sm font-bold whitespace-nowrap transition-all ios-press ${
                  selectedCatId === cat.id
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{language === 'ne' ? cat.name_np : cat.name_en}</span>
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 content-start no-scrollbar pr-0.5">
            {filteredProducts.map((product) => {
              const price =
                pricingTier === 'wholesale' && product.wholesale_price
                  ? product.wholesale_price
                  : product.selling_price;
              const isKg = product.unit === 'kg' || product.unit === 'gram';
              const iconEmoji = getProductIcon(product);

              return (
                <div
                  key={product.id}
                  onClick={() => (isKg ? handleOpenKgCalc(product) : addToCart(product, 1))}
                  onTouchStart={() => handleTouchStart(product)}
                  onTouchEnd={handleTouchEnd}
                  onMouseDown={() => handleTouchStart(product)}
                  onMouseUp={handleTouchEnd}
                  className="p-3 rounded-md bg-card hover:bg-muted/40 border border-border/60 flex flex-col justify-between gap-2 cursor-pointer ios-press transition-all group shadow-[var(--shadow)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-11 h-11 rounded-sm bg-muted/70 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                      {iconEmoji}
                    </div>
                    {product.is_returnable_asset && (
                      <span
                        className="px-1.5 py-0.5 font-extrabold text-[10px] rounded-full bg-blue-bg text-blue-text"
                      >
                        धरौटी
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-snug font-sans">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      प्रति {product.unit}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-border/40">
                    <span className="text-sm font-extrabold text-foreground font-sans">
                      {formatNPR(price, language === 'ne')}
                    </span>
                    <div className="w-6 h-6 rounded-xs bg-primary/10 text-primary flex items-center justify-center font-bold group-hover:bg-primary group-hover:text-white transition-all">
                      {isKg ? <Scale className="w-3 h-3" /> : <Plus className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 👉 RIGHT: Live Register / Cart Invoice */}
        <div className="w-full md:w-[350px] lg:w-[380px] ios-card flex flex-col h-auto md:h-full p-3 gap-3.5 shrink-0">
          {/* Header Tier & Actions */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/50">
            <IosSegmentedControl
              options={[
                { value: 'retail', label: language === 'ne' ? 'खुदरा' : 'Retail' },
                { value: 'wholesale', label: language === 'ne' ? 'थोक' : 'Wholesale' },
              ]}
              value={pricingTier}
              onChange={(val) => setPricingTier(val as any)}
              className="flex-1"
            />

            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                title="Clear Cart"
                className="w-8 h-8 rounded-sm bg-muted/60 hover:bg-destructive/15 text-muted-foreground hover:text-destructive flex items-center justify-center ios-press"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Customer Bar */}
          <div
            onClick={() => setIsCustomerSelectOpen(true)}
            className="p-3.5 bg-muted/40 hover:bg-muted/70 rounded-sm border border-border/50 flex items-center justify-between cursor-pointer ios-press transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              <UserCheck
                className={`w-4 h-4 ${selectedCustomer ? 'text-primary' : 'text-muted-foreground'}`}
              />
              <span className="text-sm font-bold text-foreground truncate font-sans">
                {selectedCustomer
                  ? `${selectedCustomer.name} (बाँकी: ${formatNPR(selectedCustomer.current_balance)})`
                  : language === 'ne'
                  ? '+ ग्राहक छान्नुहोस्'
                  : '+ Select Customer'}
              </span>
            </div>
            {selectedCustomer && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCustomer(null);
                }}
                className="text-sm font-bold text-destructive hover:underline ml-2"
              >
                हटाउनुहोस्
              </button>
            )}
          </div>

          {/* Running Cart Rows */}
          <div className="flex-1 overflow-y-auto space-y-1.5 no-scrollbar max-h-[260px] md:max-h-none">
            {cart.length === 0 ? (
              <div className="h-36 md:h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
                <Receipt className="w-8 h-8 opacity-30 mb-1.5" />
                <p className="text-sm font-bold text-foreground">
                  {language === 'ne' ? 'बिल खाली छ' : 'Cart is Empty'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'ne' ? 'सामान थिचेर बिल बनाउनुहोस्' : 'Tap items to start billing'}
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <IosSwipeRow
                  key={item.product.id}
                  rightAction={{
                    icon: <Trash2 className="w-4 h-4" />,
                    label: 'हटाउनुहोस्',
                    bgColor: 'bg-destructive',
                    onClick: () => removeFromCart(item.product.id),
                  }}
                >
                  <div className="p-3.5 bg-card rounded-sm border border-border/50 flex items-center justify-between gap-2 shadow-[var(--shadow)]">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-foreground truncate font-sans">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {formatNPR(item.unit_price, language === 'ne')} × {item.quantity}{' '}
                        {item.selected_unit}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateCartItemQty(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-xs bg-muted flex items-center justify-center text-foreground ios-press"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="w-5 text-center text-sm font-extrabold text-foreground font-sans">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => updateCartItemQty(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-xs bg-muted flex items-center justify-center text-foreground ios-press"
                      >
                        <Plus className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="w-6 h-6 rounded-xs text-muted-foreground hover:text-destructive flex items-center justify-center ios-press ml-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </IosSwipeRow>
              ))
            )}
          </div>

          {/* Cart Bottom Checkout */}
          {cart.length > 0 && (
            <div className="pt-2 border-t border-border/50 flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm font-bold px-1">
                <span>{language === 'ne' ? 'कुल रकम:' : 'Total:'}</span>
                <span className="text-primary text-xl font-extrabold tracking-tight font-sans">
                  {formatNPR(cartTotal, language === 'ne')}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full h-12 rounded-md text-white font-extrabold text-sm shadow-sm flex items-center justify-center gap-2 ios-press bg-green"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>
                  {language === 'ne' ? 'भुक्तानी (Checkout)' : 'Proceed to Checkout'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 🪟 CHECKOUT MODAL */}
      <IosBottomSheet
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title={language === 'ne' ? 'बिल भुक्तानी' : 'Payment'}
        subtitle={`कुल रकम: ${formatNPR(cartTotal, language === 'ne')}`}
        maxWidth="sm:max-w-[380px]"
      >
        <div className="flex flex-col gap-4">
          <IosSegmentedControl
            options={[
              { value: 'cash', label: language === 'ne' ? '💵 नगद' : 'Cash' },
              { value: 'split', label: language === 'ne' ? '⚖️ दुवै (Split)' : 'Split' },
              { value: 'udharo', label: language === 'ne' ? '🤝 उधारो' : 'Udharo' },
            ]}
            value={checkoutMode}
            onChange={(val) => setCheckoutMode(val as any)}
          />

          {checkoutMode === 'split' && (
            <div
              className="p-3 rounded-md flex flex-col gap-1.5 bg-numpad-key border border-border"
            >
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-green-text">नगद: {cashPercent}%</span>
                <span className="text-red-text">उधारो: {udharoPercent}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden flex" style={{ backgroundColor: 'var(--surface-3)' }}>
                <div className="transition-all duration-300" style={{ backgroundColor: 'var(--green-text)', width: `${cashPercent}%` }} />
                <div className="transition-all duration-300" style={{ backgroundColor: 'var(--red-text)', width: `${udharoPercent}%` }} />
              </div>
            </div>
          )}

          {checkoutMode !== 'udharo' && (
            <div className="flex flex-col gap-3">
            <div
              className="p-4 rounded-md flex flex-col gap-3 bg-numpad-key border border-border"
            >
              <span className="text-sm font-medium text-muted-foreground">
                {language === 'ne' ? 'ग्राहक विवरण:' : 'Customer Details:'}
              </span>
                  <span className="text-2xl font-bold text-foreground">
                    {formatNPR(tenderedNum, language === 'ne')}
                  </span>
                </div>

                {checkoutMode === 'cash' && changeAmount > 0 && (
                  <div className="px-3 py-2 rounded-md flex items-center justify-between bg-green-bg">
                    <span className="text-sm font-medium text-green-text">
                      {language === 'ne' ? 'फिर्ता रकम (Change):' : 'Change:'}
                    </span>
                    <span className="text-lg font-bold text-green-text">
                      {formatNPR(changeAmount, language === 'ne')}
                    </span>
                  </div>
                )}

                {checkoutMode === 'split' && (
                  <div className="px-3 py-2 rounded-md flex items-center justify-between bg-red-bg">
                    <span className="text-sm font-medium text-red-text">
                      {language === 'ne' ? 'बाँकी उधारो:' : 'Udharo:'}
                    </span>
                    <span className="text-lg font-bold text-red-text">
                      {formatNPR(remainingUdharo, language === 'ne')}
                    </span>
                  </div>
                )}

                <IosNumpad
                  value={cashTendered}
                  onChange={setCashTendered}
                  onQuickAdd={(amt) => setCashTendered((tenderedNum + amt).toString())}
                />
              </div>
          )}

          {(checkoutMode === 'udharo' || checkoutMode === 'split') && (
              <div
                className="p-4 rounded-md flex flex-col gap-2 bg-numpad-key border border-border"
              >
              <span className="text-sm font-medium text-muted-foreground">
                {language === 'ne' ? 'ग्राहक विवरण:' : 'Customer Details:'}
              </span>

              {selectedCustomer ? (
                <div className="p-3 bg-background rounded-xl border border-primary/20 flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-sm font-bold text-foreground">{selectedCustomer.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{selectedCustomer.phone || 'No phone'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCustomer(null)}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-sm text-red-text bg-red-bg"
                  >
                    हटाउनुहोस्
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder={language === 'ne' ? 'ग्राहकको नाम *' : 'Name *'}
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    className="h-12 px-3 bg-background rounded-xl border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <input
                    type="tel"
                    placeholder={language === 'ne' ? 'फोन नम्बर (Optional)' : 'Phone (Optional)'}
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    className="h-12 px-3 bg-background rounded-xl border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleCompleteSale}
            className="w-full h-12 rounded-md text-white font-extrabold text-sm shadow-sm flex items-center justify-center gap-2 ios-press bg-primary"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>
              {language === 'ne' ? `बिल सम्पन्न (Rs. ${cartTotal})` : `Confirm Sale (Rs. ${cartTotal})`}
            </span>
          </button>
        </div>
      </IosBottomSheet>

      {/* 🪟 LOOSE WEIGHT CALCULATOR */}
      <IosBottomSheet
        isOpen={isKgCalcOpen}
        onClose={() => setIsKgCalcOpen(false)}
        title={selectedKgProduct?.name || 'तौल हिसाब'}
        subtitle={`दर: ${formatNPR(selectedKgProduct?.selling_price || 0)}/kg`}
        maxWidth="sm:max-w-[380px]"
      >
        <div className="flex flex-col gap-4">
          <IosSegmentedControl
            options={[
              { value: 'by_amount', label: language === 'ne' ? 'रकमबाट (Rs.)' : 'By Amount' },
              { value: 'by_weight', label: language === 'ne' ? 'तौलबाट (Kg)' : 'By Weight' },
            ]}
            value={calcMode}
            onChange={(val) => setCalcMode(val as any)}
          />

          {calcMode === 'by_amount' ? (
            <div className="flex flex-col gap-3">
              <div
                className="p-4 rounded-md flex flex-col gap-2 bg-numpad-key border border-border"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">रकम:</span>
                  <span className="text-2xl font-bold text-foreground">
                    {formatNPR(parseFloat(calcRupeeAmount) || 0)}
                  </span>
                </div>
                <div className="p-3 bg-background rounded-xl border border-primary/20 text-center shadow-sm">
                  <span className="text-xs text-muted-foreground">दिने तौल: </span>
                  <span className="text-base font-bold text-primary">
                    {Math.round(
                      ((parseFloat(calcRupeeAmount) || 0) /
                        (selectedKgProduct?.selling_price || 1)) *
                        1000
                    ) / 1000}{' '}
                    Kg
                  </span>
                </div>
              </div>
              <IosNumpad value={calcRupeeAmount} onChange={setCalcRupeeAmount} />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div
                className="p-4 rounded-md flex flex-col gap-2 bg-numpad-key border border-border"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>तौल:</span>
                  <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{calcWeightKg} Kg</span>
                </div>
                <div className="p-3 bg-background rounded-xl border border-primary/20 text-center shadow-sm">
                  <span className="text-xs text-muted-foreground">पर्ने मूल्य: </span>
                  <span className="text-base font-bold text-primary">
                    {formatNPR(
                      (parseFloat(calcWeightKg) || 0) * (selectedKgProduct?.selling_price || 0)
                    )}
                  </span>
                </div>
              </div>
              <IosNumpad value={calcWeightKg} onChange={setCalcWeightKg} />
            </div>
          )}

          <button
            type="button"
            onClick={handleAddKgToCart}
            className="w-full h-14 mt-2 rounded-md text-white font-bold text-[17px] shadow-lg ios-press bg-primary"
          >
            {language === 'ne' ? 'बिलमा जोड्नुहोस्' : 'Add to Cart'}
          </button>
        </div>
      </IosBottomSheet>

      {/* 🪟 CUSTOM ITEM MODAL */}
      <IosBottomSheet
        isOpen={isCustomItemOpen}
        onClose={() => setIsCustomItemOpen(false)}
        title={language === 'ne' ? 'नयाँ सामान थप्नुहोस्' : 'Custom Item'}
        maxWidth="sm:max-w-[360px]"
      >
        <div className="flex flex-col gap-3.5">
          <div>
            <label className="text-sm font-bold text-muted-foreground block mb-1">
              सामानको नाम *
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. ताजा पाउरोटी"
              className="w-full h-12 px-4 bg-muted/40 rounded-sm border border-border/60 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 font-sans"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-muted-foreground block mb-1">
              बिक्री मूल्य (Rs.) *
            </label>
            <input
              type="number"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              placeholder="50"
              className="w-full h-12 px-4 bg-muted/40 rounded-sm border border-border/60 text-sm font-extrabold focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <button
            type="button"
            onClick={handleAddCustomItem}
            className="w-full h-11 mt-1 rounded-md text-white font-extrabold text-sm shadow-sm ios-press bg-primary"
          >
            {language === 'ne' ? 'बिलमा जोड्नुहोस्' : 'Add to Cart'}
          </button>
        </div>
      </IosBottomSheet>

      {/* 🪟 SELECT CUSTOMER MODAL */}
      <IosBottomSheet
        isOpen={isCustomerSelectOpen}
        onClose={() => setIsCustomerSelectOpen(false)}
        title={language === 'ne' ? 'ग्राहक छान्नुहोस्' : 'Select Customer'}
        maxWidth="sm:max-w-[380px]"
      >
        <div className="space-y-1 max-h-[280px] overflow-y-auto no-scrollbar">
          {customers.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                setSelectedCustomer(c);
                setIsCustomerSelectOpen(false);
              }}
              className="p-3.5 bg-card hover:bg-muted/50 rounded-sm border border-border/60 flex items-center justify-between cursor-pointer ios-press shadow-[var(--shadow)]"
            >
              <div>
                <p className="text-sm font-bold text-foreground font-sans">{c.name}</p>
                <p className="text-sm text-muted-foreground">{c.phone || 'फोन छैन'}</p>
              </div>
              <span
                className="text-sm font-extrabold font-sans"
                style={{ color: c.current_balance > 0 ? 'var(--red-text)' : 'var(--green-text)' }}
              >
                {c.current_balance > 0
                  ? `बाँकी: ${formatNPR(c.current_balance)}`
                  : 'सफा'}
              </span>
            </div>
          ))}
        </div>
      </IosBottomSheet>

      {/* 🪟 SUCCESS MODAL */}
      <IosAlertDialog
        isOpen={isSuccessModalOpen}
        title="बिक्री सफल भयो!"
        message={`बिल #${lastCompletedTxn?.id || ''} सुरक्षित भयो। WhatsApp मा रसिद पठाउनुहोस्:`}
        confirmLabel="WhatsApp बिल पठाउनुहोस्"
        cancelLabel="बन्द गर्नुहोस्"
        onConfirm={() => {
          setIsSuccessModalOpen(false);
          const link = getWhatsAppLink();
          if (link) {
            window.open(link, '_blank');
          }
        }}
        onCancel={() => setIsSuccessModalOpen(false)}
      />

      {/* 🪟 LONG-PRESS CONTEXT MENU */}
      <IosActionSheet
        isOpen={!!actionSheetProduct}
        onClose={() => setActionSheetProduct(null)}
        title={actionSheetProduct?.name}
        options={actionSheetOptions}
      />

      {/* 🪟 VALIDATION ALERT */}
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
