# SajiloPasal (सजिलो पसल)

> **The Modern, Offline-First Mobile POS & Digital Ledger for Nepali Merchants**

[![Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20React%20%7C%20TailwindCSS%20%7C%20Capacitor-007AFF)](https://nextjs.org/)
[![Database](https://img.shields.io/badge/Local%20DB-Dexie.js%20(IndexedDB)-10B981)](https://dexie.org/)
[![Cloud](https://img.shields.io/badge/Cloud%20Sync-Supabase%20(PostgreSQL)-3ECF8E)](https://supabase.com/)
[![Design](https://img.shields.io/badge/Design%20System-Apple%20iOS%20HIG-black)](rules/ios-design-system.md)
[![Localization](https://img.shields.io/badge/Calendar-Bikram%20Sambat%20(B.S.)-EA580C)](fds/06-localization-bs-calendar.md)

---

## 📖 Overview

**SajiloPasal** is an ultra-fast, intuitive Point of Sale (POS) and credit ledger (*Digital Khata*) crafted specifically for small retail, Kirana shops, and wholesale distributors in Nepal. 

It replaces clumsy paper notebooks (*Khata diaries*) and slow traditional cash registers with a beautiful, tactile, Apple iOS HIG-inspired interface that runs seamlessly on **mobile phones, tablets, countertop PC registers, and as an installed Android app**.

---

## 🚀 Key Highlights

* **⚡ Sub-Second Checkout:** Visual quick-grid for daily fast-movers (Wai Wai, Milk, Cigarettes, Pan Masala) + manual custom entry without barcodes.
* **🌾 Kirana Units & Loose Items:** Fractional units (*Kg, Gram, Liter, Pau, Dharni, Bora*) + Price-to-Weight reverse calculator (*"Rs. 50 ko Chini"* $\rightarrow$ auto weight).
* **📒 Smart Udharo Ledger:** Instant party-wise debt tracking, partial settlement logging, and overdue debt aging badges.
* **💬 Zero-Cost WhatsApp Receipts:** 1-tap itemized bill sharing and payment reminders via `wa.me` deep links with embedded Fonepay/eSewa QR.
* **📴 100% Offline-First:** Full POS checkouts and ledger entries commit locally to IndexedDB in $<30$ms and auto-sync with Supabase in the background.
* **📅 Native Bikram Sambat (B.S.):** Dual B.S. / A.D. date engine, *Baisakh to Chaitra* fiscal reporting, and *Mahina Marne* credit cycles.
* **🖨️ Wireless Hardware Support:** Direct Web Bluetooth printing to 58mm/80mm ESC/POS thermal printers and camera barcode scanning.
* **🔊 Soundbox Audio & Haptics:** Auditory chimes on cash checkout and debt recording for counter clarity.
* **🎨 5 Curated Themes + Custom Theme Studio:** Classic iOS Blue, Kirana Emerald, Himalayan Slate, Terracotta, and Royal Saffron with OLED dark mode.
* **🔒 Staff PIN Protection:** Owner Mode (full margins/supplier debt) vs Counter Helper Mode (billing & cash collection only).

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js (App Router) + React 19 + TypeScript** | High-speed reactive UI, SSR landing pages, and clean routing. |
| **Mobile Shell** | **PWA + Capacitor / TWA** | Installable via browser home screen or as a native Android APK. |
| **Styling & Design** | **Tailwind CSS + shadcn/ui primitives** | Authentic Apple iOS HIG components with zero browser defaults. |
| **Local Offline DB** | **Dexie.js (IndexedDB wrapper)** | Sub-millisecond local ACID storage and reactive query subscriptions. |
| **Cloud & Auth** | **Supabase (PostgreSQL + Phone Auth)** | Cloud sync, encrypted backups, and OTP authentication. |
| **State Management** | **Zustand** | Lightweight cart state, active checkout session, and UI preferences. |
| **Localization** | `nepali-date-converter` | Accurate A.D. to B.S. calendar conversion & Nepali number formatting. |
| **Hardware APIs** | Web Bluetooth API + WebRTC Camera + Web Audio API | ESC/POS thermal printer, camera barcode scanner, soundbox chimes. |

---

## 📁 Repository Structure

```
sajilopasal/
├── README.md                      # Master Project Overview
├── TRACKER.md                     # Comprehensive Task & Progress Tracker
├── initial-thinking.md            # Foundational Product Requirements
├── rules/
│   ├── ios-design-system.md       # Apple HIG Design Tokens, Components & Colors
│   └── ios-transformation-prompt.md # Master UI Transformation Prompt
├── docs/
│   ├── system-architecture.md     # System Architecture & Sync State Machines
│   ├── database-schema.md         # Full PostgreSQL / IndexedDB Table Schemas
│   ├── user-journeys-flow.md      # End-to-End User Journeys & Mermaid Diagrams
│   └── security-data-integrity.md # Accounting Integrity & Access Control Specs
└── fds/                           # Modular Feature Design Specifications
    ├── 01-core-pos-checkout.md
    ├── 02-udharo-ledger.md
    ├── 03-whatsapp-collections.md
    ├── 04-supplier-ledger-inventory.md
    ├── 05-financials-expenses-tax.md
    ├── 06-localization-bs-calendar.md
    ├── 07-hardware-printing-audio.md
    ├── 08-offline-persistence-cloud-sync.md
    ├── 09-ui-ux-accessibility.md
    ├── 10-theming-responsive-gestures.md
    ├── 11-admin-analytics-reporting.md
    ├── 12-customer-relationship-notes.md
    ├── 13-backup-cloud-export.md
    ├── 14-settings-shop-config.md
    └── 15-advanced-kirana-workflows.md
```

---

## 📚 Specification Index

Explore the detailed architecture and specifications:
* [System Architecture Specification](docs/system-architecture.md)
* [Database Schema Specification](docs/database-schema.md)
* [User Journeys & Workflow Diagrams](docs/user-journeys-flow.md)
* [Security & Accounting Integrity](docs/security-data-integrity.md)
* [Task Progress Tracker](TRACKER.md)
