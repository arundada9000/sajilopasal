'use client';

import React, { useState, useEffect } from 'react';
import {
  Store,
  Palette,
  Volume2,
  Download,
  Upload,
  Shield,
  Check,
  QrCode,
  Printer,
  Moon,
  Sun,
  Smartphone,
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { ThemePreset, DateMode, Language } from '@/types';
import { useAppStore } from '@/lib/store';
import { soundbox } from '@/lib/audio';
import { IosSwitch } from '@/components/ui/IosSwitch';
import { IosSegmentedControl } from '@/components/ui/IosSegmentedControl';
import { PrivacyPolicyModal } from '@/components/legal/PrivacyPolicyModal';

export function SettingsView() {
  const {
    language,
    themePreset,
    setThemePreset,
    soundEnabled,
    toggleSound,
    hapticsEnabled,
    toggleHaptics,
    dateMode,
    setDateMode,
  } = useAppStore();

  const settings = useLiveQuery(() => db.shop_settings.toCollection().first());

  // Form State
  const [pasalName, setPasalName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [receiptFooter, setReceiptFooter] = useState('');
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>('58mm');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (settings) {
      setPasalName(settings.pasal_name || '');
      setOwnerName(settings.owner_name || '');
      setPhone(settings.phone || '');
      setAddress(settings.address || '');
      setPanNumber(settings.pan_number || '');
      setReceiptFooter(settings.receipt_footer || '');
      setPaperWidth(settings.paper_width || '58mm');
    }
  }, [settings]);

  const themes: { id: ThemePreset; nameNp: string; nameEn: string; swatchClass: string }[] = [
    { id: 'paper', nameNp: 'क्लासिक पेपर (iOS Light)', nameEn: 'Paper Light', swatchClass: 'sw-paper' },
    { id: 'slate', nameNp: 'डार्क स्लेट (iOS Dark)', nameEn: 'Slate Dark', swatchClass: 'sw-slate' },
    { id: 'midnight', nameNp: 'मिडनाइट (Deep OLED)', nameEn: 'Midnight OLED', swatchClass: 'sw-midnight' },
    { id: 'sepia', nameNp: 'सेपिया (Warm Comfort)', nameEn: 'Sepia Warm', swatchClass: 'sw-sepia' },
    { id: 'mist', nameNp: 'मिस्ट (Cool Sky)', nameEn: 'Mist Sky', swatchClass: 'sw-mist' },
    { id: 'ocean', nameNp: 'ओसन (Deep Blue)', nameEn: 'Ocean Dark', swatchClass: 'sw-ocean' },
    { id: 'grape', nameNp: 'ग्रेप (Deep Purple)', nameEn: 'Grape Purple', swatchClass: 'sw-grape' },
    { id: 'emerald', nameNp: 'किराना हरियो (Emerald)', nameEn: 'Kirana Emerald', swatchClass: 'sw-emerald' },
    { id: 'saffron', nameNp: 'केसरी सुनौलो (Saffron)', nameEn: 'Royal Saffron', swatchClass: 'sw-saffron' },
    { id: 'terracotta', nameNp: 'माटो रातो (Terracotta)', nameEn: 'Terracotta Dhindo', swatchClass: 'sw-terracotta' },
  ];

  const handleSaveSettings = async () => {
    if (!settings) return;
    const now = new Date().toISOString();
    await db.shop_settings.update(settings.id, {
      pasal_name: pasalName.trim() || 'सजिलो किराना',
      owner_name: ownerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      pan_number: panNumber.trim(),
      receipt_footer: receiptFooter.trim(),
      paper_width: paperWidth,
      updated_at: now,
    });

    soundbox.playCashChime();
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2500);
  };

  // 1-Click JSON Backup Export
  const handleExportBackup = async () => {
    const products = await db.products.toArray();
    const customers = await db.customers.toArray();
    const suppliers = await db.suppliers.toArray();
    const transactions = await db.transactions.toArray();
    const customerLedger = await db.customer_ledger.toArray();
    const supplierLedger = await db.supplier_ledger.toArray();
    const expenses = await db.expenses.toArray();
    const settingsData = await db.shop_settings.toArray();

    const backupPayload = {
      app: 'SajiloPasal',
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      data: {
        products,
        customers,
        suppliers,
        transactions,
        customer_ledger: customerLedger,
        supplier_ledger: supplierLedger,
        expenses,
        settings: settingsData,
      },
    };

    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sajilopasal_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    soundbox.playTap();
  };

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    setThemePreset(next ? 'slate' : 'paper');
  };

  if (!isMounted) return null;

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto max-w-4xl mx-auto w-full space-y-6 no-scrollbar pb-24 md:pb-8 animate-rise-in">
      {/* Save Toast Notification */}
      {isSavedToast && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 text-white font-bold text-sm rounded-md shadow-[var(--shadow-lg)] flex items-center gap-2 animate-in fade-in duration-200 bg-green">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>सेटिङ सुरक्षित भयो! (Saved)</span>
        </div>
      )}

      {/* 🏪 Section 1: Shop Profile */}
      <div className="bg-card rounded-lg border border-border/50 p-5 space-y-4 shadow-[var(--shadow)]">
        <div className="flex items-center gap-2 pb-3 border-b border-border/40">
          <Store className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            {language === 'ne' ? 'पसल तथा साहुजीको विवरण (Shop Profile)' : 'Shop Profile'}
          </h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[13px] font-bold text-muted-foreground block mb-1">
              पसलको नाम (Store / Pasal Name) *
            </label>
            <input
              type="text"
              value={pasalName}
              onChange={(e) => setPasalName(e.target.value)}
              placeholder="e.g. न्यू कालिका किराना स्टोर"
              className="w-full h-12 px-3.5 bg-muted/40 rounded-md border border-border/60 text-[15px] font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[13px] font-bold text-muted-foreground block mb-1">
                साहुजीको नाम (Owner Name)
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. कृष्ण बहादुर"
                className="w-full h-12 px-3.5 bg-muted/40 rounded-md border border-border/60 text-[15px] font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                className="w-full h-12 px-3.5 bg-muted/40 rounded-md border border-border/60 text-[15px] font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[13px] font-bold text-muted-foreground block mb-1">
                ठेगाना / टोल (Store Address)
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. नयाँ बानेश्वर, काठमाडौं"
                className="w-full h-12 px-3.5 bg-muted/40 rounded-md border border-border/60 text-[15px] font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="text-[13px] font-bold text-muted-foreground block mb-1">
                ९-अंकको प्यान नम्बर (PAN No. - Optional)
              </label>
              <input
                type="text"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value)}
                placeholder="60XXXXXXXX"
                maxLength={9}
                className="w-full h-12 px-3.5 bg-muted/40 rounded-md border border-border/60 text-[15px] font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 🎨 Section 2: Themes & Visual Personalization */}
      <div className="bg-card rounded-lg border border-border/50 p-5 space-y-4 shadow-[var(--shadow)]">
        <div className="flex items-center gap-2 pb-3 border-b border-border/40">
          <Palette className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            {language === 'ne' ? 'रङ तथा थिम छनोट (Theme Presets)' : 'Theme Presets'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {themes.map((t) => {
            const isSelected = themePreset === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setThemePreset(t.id)}
                className={`p-3.5 rounded-md border flex items-center justify-between transition-all ios-press ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-xs'
                    : 'border-border/60 bg-muted/30 hover:bg-muted/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-xs border border-black/10 dark:border-white/20 shadow-2xs shrink-0 ${t.swatchClass}`}
                  />
                  <span className="text-[13px] font-bold text-foreground">
                    {language === 'ne' ? t.nameNp : t.nameEn}
                  </span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-primary stroke-[3]" />}
              </button>
            );
          })}
        </div>

        {/* Dark Mode Toggle */}
        <div className="pt-3 border-t border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDarkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-amber-text" />}
            <div>
              <p className="text-sm font-bold text-foreground">
                {language === 'ne' ? 'डार्क मोड (Dark Mode - OLED Pure Black)' : 'Dark Mode (OLED Black)'}
              </p>
              <p className="text-[12px] text-muted-foreground">रातिको समयमा आँखालाई सहज</p>
            </div>
          </div>
          <IosSwitch checked={isDarkMode} onChange={toggleDarkMode} />
        </div>
      </div>

      {/* 🖨️ Section 3: Receipt & Soundbox Preferences */}
      <div className="bg-card rounded-lg border border-border/50 p-5 space-y-4 shadow-[var(--shadow)]">
        <div className="flex items-center gap-2 pb-3 border-b border-border/40">
          <Printer className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            {language === 'ne' ? 'रसिद तथा साउन्डबक्स (Receipt & Sound)' : 'Receipt & Audio'}
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[13px] font-bold text-muted-foreground block mb-1">
              रसिदको पुछारमा सन्देश (Receipt Footer Greeting)
            </label>
            <input
              type="text"
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
              placeholder="e.g. धन्यवाद, फेरी आउनुहोला! (Visit Again)"
              className="w-full h-12 px-3.5 bg-muted/40 rounded-md border border-border/60 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-sm font-bold text-foreground">साउन्डबक्स आवाज (Audio Chimes)</p>
              <p className="text-[12px] text-muted-foreground">नगद र उधारो कारोबारमा आवाज आउने</p>
            </div>
            <IosSwitch checked={soundEnabled} onChange={toggleSound} />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <div>
              <p className="text-sm font-bold text-foreground">भाइब्रेसन (Tactile Haptics)</p>
              <p className="text-[12px] text-muted-foreground">बटन थिच्दा कम्पन्न हुने</p>
            </div>
            <IosSwitch checked={hapticsEnabled} onChange={toggleHaptics} />
          </div>
        </div>
      </div>

      {/* 💾 Section 4: Data Backup & Platform Integrity */}
      <div className="bg-card rounded-lg border border-border/50 p-5 space-y-4 shadow-[var(--shadow)]">
        <div className="flex items-center gap-2 pb-3 border-b border-border/40">
          <Download className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            {language === 'ne' ? 'डाटा ब्याकअप (Data Backup)' : 'Backup & Cloud'}
          </h3>
        </div>

        <p className="text-[13px] text-muted-foreground">
          तपाईंको फोन हराएमा वा बिग्रिएमा नयाँ फोनमा सजिलै डाटा सार्नको लागि ब्याकअप फाइल डाउनलोड गर्नुहोस्।
        </p>

        <button
          type="button"
          onClick={handleExportBackup}
          className="h-12 px-5 rounded-md bg-muted hover:bg-muted/80 text-foreground font-bold text-sm flex items-center gap-2 border border-border/60 ios-press"
        >
          <Download className="w-4 h-4 text-primary" />
          <span>१-क्लिक ब्याकअप फाइल डाउनलोड (Download Backup JSON)</span>
        </button>
      </div>

      {/* 🛡️ Section 5: Legal Terms & Privacy */}
      <div className="bg-card rounded-lg border border-border/50 p-5 space-y-3 shadow-[var(--shadow)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-green-text" />
            <div>
              <h4 className="text-[15px] font-bold text-foreground">गोपनीयता तथा कानुनी सर्तहरू</h4>
              <p className="text-[12px] text-muted-foreground">Privacy Policy & Tax Compliance</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsPrivacyOpen(true)}
            className="px-3.5 py-1.5 rounded-sm bg-muted hover:bg-muted/80 text-foreground font-bold text-[12px] border border-border/60 ios-press"
          >
            हेर्नुहोस् →
          </button>
        </div>
      </div>

      {/* Save Settings CTA */}
      <button
        type="button"
        onClick={handleSaveSettings}
        className="w-full h-14 rounded-lg bg-primary text-primary-foreground font-extrabold text-lg shadow-xl flex items-center justify-center gap-2 ios-press"
      >
        <Check className="w-6 h-6 stroke-[3]" />
        <span>सेटिङ सेभ गर्नुहोस् (Save Settings)</span>
      </button>

      {/* 🔒 Immutable Platform Brand Footer */}
      <div className="pt-6 pb-4 text-center text-muted-foreground border-t border-border/40 select-none">
        <p className="text-[13px] font-bold text-foreground">
          सजिलो पसल (SajiloPasal) v1.0.0
        </p>
        <p className="text-[11px] mt-0.5">
          Crafted for Nepali Retail & Kirana Merchants • Offline-First Technology
        </p>
      </div>

      {/* 🛡️ Privacy Policy Modal */}
      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </div>
  );
}
