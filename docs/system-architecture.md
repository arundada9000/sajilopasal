# SajiloPasal: System Architecture Specification

This document details the high-level architecture, offline-first data flow, component interactions, and state synchronization lifecycles for **SajiloPasal**.

---

## 1. High-Level Architecture Diagram

```mermaid
graph TB
    subgraph Client Layer ["📱 Client Runtime (Web / PWA / Android APK)"]
        UI["React 19 + Next.js App Router<br/>(Tailwind CSS + Apple iOS HIG)"]
        State["Zustand State Stores<br/>(Cart, Session, Theme, Numpad)"]
        DexieDB[("Dexie.js (IndexedDB)<br/>Offline-First Local Database")]
        ServiceWorker["Service Worker<br/>Offline Asset Caching"]
        
        UI <--> State
        State <--> DexieDB
        UI <--> ServiceWorker
    end

    subgraph Hardware Layer ["🔌 Hardware & Device APIs"]
        BT["Web Bluetooth API<br/>(58mm/80mm ESC/POS Thermal Printers)"]
        Camera["WebRTC getUserMedia<br/>(Camera Barcode Scanner)"]
        Audio["Web Audio API<br/>(Soundbox Cash Chimes)"]
        Haptics["Navigator Vibration API<br/>(Tactile Press Feedback)"]
        
        UI --> BT
        UI --> Camera
        UI --> Audio
        UI --> Haptics
    end

    subgraph Intent Layer ["💬 External Messaging & Payments"]
        WA["WhatsApp Client Intent<br/>(wa.me Zero-Cost Receipts)"]
        SMS["Native SMS Intent<br/>(Feature Phone Fallback)"]
        QR["Fonepay / eSewa / Khalti<br/>(Embedded Remote QR)"]
        
        UI --> WA
        UI --> SMS
        UI --> QR
    end

    subgraph Sync Layer ["🔄 Offline Sync Engine"]
        Queue[("Local sync_queue Table<br/>(Append-Only Change Events)")]
        SyncWorker["Background Sync Worker<br/>(Online/Offline Event Listener)"]
        
        DexieDB --> Queue
        Queue --> SyncWorker
    end

    subgraph Cloud Layer ["☁️ Supabase Cloud (PostgreSQL)"]
        SupaAuth["Supabase Auth<br/>(Phone OTP / Google OAuth)"]
        Postgres[("PostgreSQL Cloud Database<br/>(Row-Level Security)")]
        Storage["Supabase Storage<br/>(Product Images & QR Backups)"]
        
        SyncWorker <--> Postgres
        UI <--> SupaAuth
        UI <--> Storage
    end
```

---

## 2. Offline-First Data Flow & Sync Lifecycle

### Principles:
1. **Zero-Latency Billing:** The cashier interface **never waits for a network request**. Every cart action, sale completion, expense log, and customer settlement writes synchronously to local IndexedDB.
2. **Deterministic Mutation Queue:** Every local write logs an event record in `sync_queue` with monotonic timestamps and operation types (`INSERT`, `UPDATE`, `DELETE`).
3. **Optimistic UI Updates:** The UI reflects database state instantaneously via Dexie live queries (`useLiveQuery`).

```mermaid
sequenceDiagram
    autonumber
    actor Cashier
    participant UI as POS User Interface
    participant DB as Local IndexedDB (Dexie)
    participant Queue as sync_queue
    participant Worker as Background Sync Worker
    participant Cloud as Supabase (PostgreSQL)

    Cashier->>UI: Selects Items & Taps "Checkout (Cash)"
    UI->>DB: Commit POS Transaction (ACID Transaction)
    DB->>Queue: Push Mutation Event (status = 'pending')
    DB-->>UI: Live Query Updates UI (< 15ms)
    UI->>Cashier: Plays Soundbox Chime & Shows Success

    Note over Worker: Background Sync Evaluation
    Worker->>Worker: Check Network (navigator.onLine)
    alt Network is Online
        Worker->>Queue: Read 'pending' mutations batch
        Worker->>Cloud: POST /rpc/sync_mutations_batch
        Cloud-->>Worker: HTTP 200 (Committed)
        Worker->>Queue: Mark batch as 'synced'
        Worker->>UI: Update Status Indicator to "🟢 Online Synced"
    else Network is Offline
        Worker->>UI: Update Status Indicator to "🟡 Offline (1 Pending)"
    end
```

---

## 3. Conflict Resolution Strategy

1. **Transactions & Ledgers:** All financial debit/credit ledger records are **append-only**. Because records are immutable inserts rather than updates, merge conflicts are virtually eliminated.
2. **Master Entities (Products, Customers, Suppliers):** Evaluated using **Last-Write-Wins (LWW)** based on client-side UTC timestamps (`updated_at`).
3. **Inventory Count Reconciliation:** Inventory deductions on sale are computed using delta offsets (`stock_delta = -qty`) rather than absolute balance overwrites.

---

## 4. Multi-Device Responsive Layout Strategy

```
📱 MOBILE VIEW (< 768px)
- Fixed Frosted Top Bar with Search & B.S. Date
- 2-Column Product Quick Grid with Image Thumbnails
- Sticky Bottom Action Bar with Running Item Count & Total
- Slide-Up Bottom Sheet for Split Payment & Cash Chips
- Fixed Bottom Navigation Bar (POS, Khata, Supplier, Expenses, More)

💻 TABLET / DESKTOP POS (>= 768px / >= 1024px)
- Left Fixed Sidebar (220px): Category Pills, Ledgers, Reports, Settings
- Center Catalog Section (Flexible): 4-to-6 column Quick Grid, Search Bar, Kirana Unit Calculator
- Right Pinned Register (380px): Live Itemized Bill, Discount Bar, Rupee Note Chips, Split Checkout CTAs
```
