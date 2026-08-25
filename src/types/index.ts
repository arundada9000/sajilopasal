export type KiranaUnit =
  | 'piece'
  | 'packet'
  | 'kg'
  | 'gram'
  | 'liter'
  | 'pau'
  | 'dharni'
  | 'bora'
  | 'carton'
  | 'box';

export type PaymentMode = 'full_cash' | 'full_udharo' | 'split' | 'qr_online';
export type DateMode = 'BS' | 'AD' | 'DUAL';
export type Language = 'ne' | 'en';
export type ThemePreset =
  | 'paper'
  | 'slate'
  | 'midnight'
  | 'sepia'
  | 'mist'
  | 'ocean'
  | 'grape'
  | 'emerald'
  | 'saffron'
  | 'terracotta';

export interface ShopSettings {
  id: string;
  merchant_id: string;
  pasal_name: string;
  owner_name: string;
  phone: string;
  address?: string;
  pan_number?: string;
  qr_image_url?: string;
  fonepay_link?: string;
  receipt_header?: string;
  receipt_footer?: string;
  paper_width: '58mm' | '80mm';
  sound_enabled: boolean;
  haptics_enabled: boolean;
  default_date_mode: DateMode;
  default_language: Language;
  owner_pin_hash?: string;
  theme_preset: ThemePreset;
  custom_accent_hsl?: string;
  updated_at: string;
}

export interface Category {
  id: string;
  merchant_id: string;
  name_en: string;
  name_np: string;
  icon?: string;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  merchant_id: string;
  category_id?: string;
  name: string;
  barcode?: string;
  selling_price: number;
  wholesale_price?: number;
  cost_price: number;
  stock_quantity: number;
  unit: KiranaUnit;
  is_quick_grid: boolean;
  is_returnable_asset: boolean; // For 20L water jars, LPG cylinders, bottles
  low_stock_threshold: number;
  image_url?: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  merchant_id: string;
  name: string;
  phone?: string;
  address?: string;
  credit_limit: number;
  current_balance: number; // Positive = customer owes money (Udharo)
  credit_frozen: boolean;
  notes?: string;
  last_payment_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerAssetLedgerEntry {
  id: string;
  merchant_id: string;
  customer_id: string;
  product_id: string;
  type: 'issued' | 'returned';
  quantity: number;
  date_bs: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  merchant_id: string;
  name: string;
  phone?: string;
  company_name?: string;
  current_balance: number; // Positive = merchant owes money to supplier
  created_at: string;
  updated_at: string;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id?: string;
  product_name: string;
  quantity: number;
  unit: KiranaUnit;
  unit_price: number;
  total_price: number;
}

export interface Transaction {
  id: string;
  merchant_id: string;
  customer_id?: string;
  customer_name?: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  cash_paid: number;
  udharo_amount: number;
  pricing_tier: 'retail' | 'wholesale';
  payment_mode: PaymentMode;
  is_pan_bill: boolean;
  date_bs: string;
  created_at: string;
  items?: TransactionItem[];
}

export interface CustomerLedgerEntry {
  id: string;
  merchant_id: string;
  customer_id: string;
  transaction_id?: string;
  type: 'debit' | 'credit'; // debit = goods taken on credit, credit = debt payment received
  amount: number;
  payment_method: 'cash' | 'fonepay_qr' | 'esewa' | 'bank';
  balance_after: number;
  notes?: string;
  date_bs: string;
  created_at: string;
}

export interface SupplierLedgerEntry {
  id: string;
  merchant_id: string;
  supplier_id: string;
  type: 'purchase_credit' | 'payment_made';
  amount: number;
  payment_method: 'cash' | 'fonepay_qr' | 'bank';
  balance_after: number;
  notes?: string;
  date_bs: string;
  created_at: string;
}

export interface Expense {
  id: string;
  merchant_id: string;
  category: 'tea_snacks' | 'electricity' | 'rent' | 'transport' | 'staff' | 'maintenance' | 'other';
  amount: number;
  payment_mode: 'cash' | 'online';
  notes?: string;
  date_bs: string;
  created_at: string;
}

export interface WastageLog {
  id: string;
  merchant_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  cost_at_loss: number;
  total_loss: number;
  reason: 'expired' | 'damaged' | 'lost';
  notes?: string;
  date_bs: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
  subtotal: number;
  selected_unit: KiranaUnit;
}

export interface HeldCart {
  id: string;
  customer_id?: string;
  customer_name?: string;
  items_json: string;
  discount: number;
  pricing_tier: 'retail' | 'wholesale';
  held_at: number;
}

export interface SyncQueueEntry {
  id?: number;
  table_name: string;
  record_id: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: any;
  client_timestamp: number;
  synced_status: 'pending' | 'syncing' | 'synced' | 'error';
}
