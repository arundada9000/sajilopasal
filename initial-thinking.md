# SajiloPasal: Mobile-First POS & Digital Ledger for Nepali Merchants

A mobile-first Point of Sale (POS) and credit ledger (*Digital Khata*) designed specifically for small retail, Kirana shops, and wholesale merchants in Nepal. It combines rapid billing during peak rush hours with foolproof credit tracking, supplier management, and localized payment channels.

---

## 1. Core POS & Quick Checkout

* **Custom & Fast Product Entry:** Add items manually on the fly with name, price, image, and category without requiring a barcode.
* **Visual Quick-Grid:** Pin daily fast-movers (e.g., Wai Wai, Milk, Cigarettes, Pan Masala, Sugar) as quick-tap buttons on the main sales screen for instant checkout during rush hours.
* **Loose / Bulk Items & Fractional Units:** Full support for Kirana unit measurements:
  * Units: *Piece, Packet, Kg, Gram, Liter, Pau, Dharni, Bora/Carton*.
  * **Price-to-Weight Reverse Calculator:** Enter amount (e.g., "Rs. 50 ko Chini") and the app automatically calculates the exact fractional weight (e.g., 0.526 kg) based on the unit price.
* **Camera Barcode Scanner:** Use the phone's built-in camera to scan packaged goods for stores that utilize standard barcodes.
* **Flexible Payment Splits:** Complete transactions as **Full Cash**, **Full Udharo**, or **Partial Cash + Udharo** in a single tap right at checkout.
* **Cart & Item Discounts:** Quick application of percentage or flat-rate discounts (e.g., "Rs. 50 off") during live checkout.
* **Returns & Item Exchanges:** A 2-tap refund/exchange workflow that automatically updates stock levels and adjusts customer Khata balances.

---

## 2. Udharo Ledger (Customer Digital Khata)

* **Customer Contact Profiles:** Store customer names, phone numbers, credit limits, photo IDs, and historical transaction logs.
* **Real-Time Debt Tracking:** Automatically calculate party-wise balance and total shop credit outstanding at any given moment.
* **Partial Settlement Logging:** Record cash / QR repayments directly against customer balances with accurate timestamps.
* **Overdue Badges & Aging Analysis:** Highlight inactive, overdue, or late-paying accounts in amber/red for instant follow-up.
* **Top Debtors Ranking:** 1-screen summary list ranking customers with the highest outstanding Udharo to prioritize collections.

---

## 3. WhatsApp Integration & Digital Collections

* **1-Tap WhatsApp Receipts (Zero-Cost `wa.me` Deep Linking):**
  * Generate and share clean, itemized digital bills or image slips via direct client-side WhatsApp intent (`wa.me`) without needing costly WhatsApp Business API credits.
* **1-Tap Payment Reminders:** Send polite, pre-formatted Nepali/English text reminders requesting overdue balance settlements.
* **SMS Fallback:** Send pre-formatted SMS balance reminders to customers who don't use smartphones or WhatsApp.
* **Dynamic Digital QR & Links:** Embed the shop's Fonepay/eSewa/Khalti payment QR or direct payment link in WhatsApp receipts and reminders so customers can settle debt remotely.

---

## 4. Supplier Ledger (Purchase Khata) & Inventory

* **Supplier Udharo Tracking:** Dedicated ledger to track debts owed to wholesalers and distributors when stocking up on credit.
* **Purchase & Stock Inflow Log:** Fast entry for newly arrived inventory stock to automatically update item counts, purchase costs, and supplier balance.
* **Basic Stock & Low-Stock Alerts:** Automatically deduct inventory on sales and notify the merchant when key items fall below chosen thresholds (e.g., under 5 units).
* **Dead Stock & Best-Seller Analytics:** Identify top revenue drivers and slow-moving products to optimize cash flow.

---

## 5. Financials, Daily Operations & Tax

* **Daily Expense Ledger:** Log daily store operational costs (tea/snacks, electricity, rent, transportation, staff advances) so the app calculates **True Net Profit**, not just gross sales turnover.
* **Daily Sales & Udharo Summary Card:** Instant dashboard card showing *Today's Total Sales*, *Cash Collected*, *Udharo Issued*, and *Udharo Collected*.
* **PAN / Non-VAT Receipt Toggle:** Instant switch to generate either a simple cash memo or a formal PAN-compliant tax bill depending on the shop's tax registration status.
* **Staff / Helper Mode (PIN-Protected Role Access):**
  * **Owner Mode:** Full access to profit margins, supplier debts, reports, and transaction deletion/editing.
  * **Staff/Helper Mode:** Restricted counter mode for shop boys/relatives to scan, sell, and record cash without exposing sensitive business margins or ledger histories.

---

## 6. Localized System Features & Hardware Integration

* **Bikram Sambat (B.S.) Calendar & Fiscal Year Support:**
  * Native B.S. (Baisakh – Chaitra) dates for all bills, reports, statements, and monthly settlement cycles (*Mahina Marne*).
  * Dual B.S. / A.D. toggle according to merchant preference.
* **Bluetooth Thermal Printer Integration (58mm / 80mm ESC/POS):**
  * Wirelessly print receipts, customer statements, and Fonepay QR codes on affordable mini Bluetooth thermal printers.
  * Custom header/footer with shop name, address, phone number, and greeting message.
* **Audio / Sound Chime Confirmations:**
  * Voice/audio chime confirmations upon cash received, udharo logged, or payment settled (inspired by soundbox chimes) for counter clarity.
* **Offline-First Architecture:**
  * Complete full POS checkouts, inventory updates, and Khata entries without internet.
  * Auto-sync in the background when Wi-Fi or mobile data becomes available.
* **Bilingual UI Switch:** Instant 1-tap toggle between English and Nepali (नेपाली).
* **Cloud Backup & Instant Restore:** Automatic encrypted cloud backups to protect data against damaged, lost, or upgraded mobile devices.

---

## 7. Recommended Implementation Roadmap

### Phase 1: Core MVP (Fast POS + Customer Khata)
1. Offline-first local database (SQLite) setup.
2. Quick-Grid & manual item entry POS screen with split payments (Cash / Udharo).
3. Customer Udharo Ledger with balance history and settlement logging.
4. Zero-cost WhatsApp receipt & reminder generation via `wa.me` deep linking.
5. Basic Nepali B.S. date display & bilingual (EN/NP) text support.

### Phase 2: Store Operations & Peripherals
1. Supplier Khata (Wholesaler Purchase & Credit tracking).
2. Daily Expense Ledger & Net Profit calculation.
3. Bluetooth ESC/POS thermal printer support (58mm / 80mm).
4. Audio confirmation chimes.
5. Cloud sync and backup engine (Supabase/Firebase).

### Phase 3: Advanced Retail & Controls
1. Staff / Helper PIN-protected permission mode.
2. Bulk / loose item price-to-weight reverse calculator.
3. PAN-compliant invoicing & exportable accounting reports (PDF/Excel).
4. Analytics: Top debtors, fast/slow-moving inventory, and sales trends.


