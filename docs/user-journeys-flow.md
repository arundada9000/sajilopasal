# SajiloPasal: User Journeys & Workflow Diagrams

This document illustrates the end-to-end user journeys for the primary operational scenarios of **SajiloPasal**.

---

## 1. Journey 1: Rush-Hour Quick Cash POS Checkout

```mermaid
journey
    title Rush Hour Fast Cash Sale (Wai Wai + Milk)
    section Scan / Tap Items
      Tap Wai Wai from Quick Grid: 5: Cashier
      Tap Milk (1L): 5: Cashier
      Check Running Total (Rs. 130): 5: Cashier
    section Fast Checkout
      Tap "Cash Checkout": 5: Cashier
      Tap "+500" Rupee Chip: 5: Cashier
      App displays Change: Rs. 370: 5: App
      Cashier returns Rs. 370 cash: 5: Cashier
    section Completion
      App plays Soundbox Chime: 5: App
      Prints 58mm Receipt / Sends WhatsApp: 4: App
      Cart resets for next customer (< 50ms): 5: App
```

---

## 2. Journey 2: Split Payment & Udharo Debt Issuance

```mermaid
flowchart TD
    Start([Customer at Counter with 4 Items Total = Rs. 850]) --> TapItems[Cashier adds items to cart]
    TapItems --> TapCheckout[Tap 'Checkout' / 'बिल काट्नुहोस्']
    TapCheckout --> OpenSplitSheet[Open iOS Split Sheet]
    OpenSplitSheet --> SelectSplit[Select 'Split / बाँकी']
    SelectSplit --> EnterCash[Enter Cash Paid: Rs. 300]
    EnterCash --> CalcRemaining[App automatically computes Udharo: Rs. 550]
    CalcRemaining --> SelectCustomer[Search or Select Customer 'Hari Bahadur']
    SelectCustomer --> CheckLimit{Customer Balance + 550 > Credit Limit?}
    CheckLimit -- Yes --> AlertLimit[Show iOS Confirmation Modal: Credit Limit Warning]
    AlertLimit -- Approve --> CommitSale[Commit Sale to DB]
    CheckLimit -- No --> CommitSale
    CommitSale --> DeductStock[Decrement Stock in Products Table]
    CommitSale --> WriteLedger[Append Rs. 550 Debit to Hari's Khata]
    CommitSale --> RecordCash[Add Rs. 300 to Cash Drawer]
    CommitSale --> TriggerAudio[Play Soundbox Chime & Vibrate]
    CommitSale --> OfferShare[Display 1-Tap WhatsApp Receipt CTA]
```

---

## 3. Journey 3: 1-Tap WhatsApp Receipt & Remote Payment Collection

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    actor Merchant
    participant App as SajiloPasal
    participant WA as WhatsApp App
    participant Fonepay as Fonepay Network

    Merchant->>App: Completes Sale (Rs. 450 Udharo)
    App-->>Merchant: Displays "Share WhatsApp Bill" CTA
    Merchant->>App: Taps "Share Bill"
    App->>WA: Opens wa.me/9779841XXXXXX?text=BillSummary+FonepayLink
    Merchant->>WA: Taps Send
    WA-->>Customer: Receives Itemized Bill with Fonepay QR Link
    
    Note over Customer: Later in the evening at home
    Customer->>Customer: Clicks Fonepay QR Link in WhatsApp
    Customer->>Fonepay: Pays Rs. 450 via Mobile Banking
    Fonepay-->>Customer: Payment Successful
    Customer->>Merchant: Sends WhatsApp Screenshot
    Merchant->>App: Opens Hari's Profile -> Taps "Settle (Paisa Aayo)"
    App->>App: Balance updated from Rs. 450 to Rs. 0
    App-->>Merchant: Plays Cash Chime
```

---

## 4. Journey 4: Loose Item Price-to-Weight Calculator

```mermaid
flowchart LR
    CustomerRequest["Customer: 'Dai, Rs. 50 ko Chini dinus'"] --> CashierOpens["Cashier taps Sugar (Chini) on POS"]
    CashierOpens --> ToggleReverse["Cashier switches to 'By Amount (रु.)' mode"]
    ToggleReverse --> EnterAmount["Types '50' into Rupees box"]
    EnterAmount --> AutoCalc["App calculates: 50 / 95 (Rs/kg) = 0.526 kg (526 grams)"]
    AutoCalc --> AddCart["Taps 'Add to Cart'"]
    AddCart --> CartItem["Cart displays: Sugar (526g @ Rs. 95/kg) = Rs. 50"]
```

---

## 5. Journey 5: Daily Store Expense Logging & True Net Profit

```mermaid
flowchart TD
    OpenExpense[Cashier opens 'Expenses' Tab] --> SelectCategory[Taps 'चिया/खाजा (Tea/Snacks)']
    SelectCategory --> EnterAmt[Enters Amount: Rs. 120]
    EnterAmt --> SaveExpense[Taps 'खर्च सुरक्षित गर्नुहोस्']
    SaveExpense --> DBUpdate[Appends to expenses table]
    DBUpdate --> RecalcDashboard[Real-Time Net Profit Recalculated:]
    RecalcDashboard --> Math["Net Profit = Gross Sales (Rs. 12,500) - COGS (Rs. 8,200) - Expenses (Rs. 620) = Rs. 3,680"]
```
