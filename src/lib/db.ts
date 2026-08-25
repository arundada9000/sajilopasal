import Dexie, { Table } from 'dexie';
import {
  ShopSettings,
  Category,
  Product,
  Customer,
  CustomerAssetLedgerEntry,
  Supplier,
  Transaction,
  TransactionItem,
  CustomerLedgerEntry,
  SupplierLedgerEntry,
  Expense,
  WastageLog,
  HeldCart,
  SyncQueueEntry,
} from '@/types';

export class SajiloPasalDB extends Dexie {
  shop_settings!: Table<ShopSettings, string>;
  categories!: Table<Category, string>;
  products!: Table<Product, string>;
  customers!: Table<Customer, string>;
  customer_asset_ledger!: Table<CustomerAssetLedgerEntry, string>;
  suppliers!: Table<Supplier, string>;
  transactions!: Table<Transaction, string>;
  transaction_items!: Table<TransactionItem, string>;
  customer_ledger!: Table<CustomerLedgerEntry, string>;
  supplier_ledger!: Table<SupplierLedgerEntry, string>;
  expenses!: Table<Expense, string>;
  wastage_logs!: Table<WastageLog, string>;
  held_carts!: Table<HeldCart, string>;
  sync_queue!: Table<SyncQueueEntry, number>;

  constructor() {
    super('SajiloPasalDB');
    this.version(1).stores({
      shop_settings: 'id, merchant_id, updated_at',
      categories: 'id, merchant_id, name_en, name_np, sort_order',
      products: 'id, merchant_id, category_id, name, barcode, is_quick_grid, is_returnable_asset, updated_at',
      customers: 'id, merchant_id, name, phone, current_balance, credit_frozen, updated_at',
      customer_asset_ledger: 'id, merchant_id, customer_id, product_id, created_at',
      suppliers: 'id, merchant_id, name, phone, current_balance, updated_at',
      transactions: 'id, merchant_id, customer_id, payment_mode, created_at, date_bs',
      transaction_items: 'id, transaction_id, product_id',
      customer_ledger: 'id, merchant_id, customer_id, transaction_id, type, created_at',
      supplier_ledger: 'id, merchant_id, supplier_id, type, created_at',
      expenses: 'id, merchant_id, category, created_at, date_bs',
      wastage_logs: 'id, merchant_id, product_id, created_at, date_bs',
      held_carts: 'id, held_at',
      sync_queue: '++id, table_name, record_id, synced_status, client_timestamp',
    });
  }
}

export const db = new SajiloPasalDB();

/**
 * Seed initial sample catalog, default settings, and test customers if database is empty
 */
export async function seedInitialDataIfNeeded() {
  const settingsCount = await db.shop_settings.count();
  if (settingsCount > 0) return;

  const now = new Date().toISOString();
  const merchantId = 'merchant-default-001';

  // 1. Seed Shop Settings
  await db.shop_settings.add({
    id: 'settings-001',
    merchant_id: merchantId,
    pasal_name: 'सजिलो किराना तथा खाद्यान्न स्टोर',
    owner_name: 'राम श्रेष्ठ',
    phone: '9841234567',
    address: 'बानेश्वर, काठमाडौं',
    pan_number: '601234567',
    receipt_header: 'सजिलो पसल - बानेश्वर, काठमाडौं',
    receipt_footer: 'धन्यवाद, फेरी आउनुहोला! (Visit Again)',
    paper_width: '58mm',
    sound_enabled: true,
    haptics_enabled: true,
    default_date_mode: 'BS',
    default_language: 'ne',
    theme_preset: 'paper',
    updated_at: now,
  });

  // 2. Seed Categories
  const categories: Category[] = [
    { id: 'cat-1', merchant_id: merchantId, name_en: 'Snacks & Noodles', name_np: 'चाउचाउ / खाजा', icon: 'Utensils', sort_order: 1, created_at: now },
    { id: 'cat-2', merchant_id: merchantId, name_en: 'Dairy & Beverages', name_np: 'दूध / चिसो', icon: 'Milk', sort_order: 2, created_at: now },
    { id: 'cat-3', merchant_id: merchantId, name_en: 'Grains & Spices', name_np: 'चामल / दाल / तेल', icon: 'Wheat', sort_order: 3, created_at: now },
    { id: 'cat-4', merchant_id: merchantId, name_en: 'Water & Gas (Jars)', name_np: 'जार / सिलिन्डर', icon: 'Flame', sort_order: 4, created_at: now },
    { id: 'cat-5', merchant_id: merchantId, name_en: 'Daily Essentials', name_np: 'दैनिक उपभोग्य', icon: 'ShoppingBag', sort_order: 5, created_at: now },
  ];
  await db.categories.bulkAdd(categories);

  // 3. Seed Products (Fast movers on Quick Grid)
  const products: Product[] = [
    {
      id: 'prod-1',
      merchant_id: merchantId,
      category_id: 'cat-1',
      name: 'Wai Wai Noodles (75g)',
      barcode: '8901234567890',
      selling_price: 25,
      wholesale_price: 22,
      cost_price: 20,
      stock_quantity: 120,
      unit: 'packet',
      is_quick_grid: true,
      is_returnable_asset: false,
      low_stock_threshold: 15,
      updated_at: now,
    },
    {
      id: 'prod-2',
      merchant_id: merchantId,
      category_id: 'cat-2',
      name: 'DDC Milk (दूध आधा लिटर)',
      selling_price: 50,
      wholesale_price: 48,
      cost_price: 45,
      stock_quantity: 40,
      unit: 'packet',
      is_quick_grid: true,
      is_returnable_asset: false,
      low_stock_threshold: 10,
      updated_at: now,
    },
    {
      id: 'prod-3',
      merchant_id: merchantId,
      category_id: 'cat-3',
      name: 'Sugar (चिनी - प्रति के.जी.)',
      selling_price: 95,
      wholesale_price: 88,
      cost_price: 82,
      stock_quantity: 250,
      unit: 'kg',
      is_quick_grid: true,
      is_returnable_asset: false,
      low_stock_threshold: 20,
      updated_at: now,
    },
    {
      id: 'prod-4',
      merchant_id: merchantId,
      category_id: 'cat-3',
      name: 'Jeera Masino Rice (जीरा मसिनो चामल)',
      selling_price: 2400,
      wholesale_price: 2250,
      cost_price: 2100,
      stock_quantity: 25,
      unit: 'bora',
      is_quick_grid: true,
      is_returnable_asset: false,
      low_stock_threshold: 5,
      updated_at: now,
    },
    {
      id: 'prod-5',
      merchant_id: merchantId,
      category_id: 'cat-4',
      name: '20L Drinking Water Jar (जार पानी)',
      selling_price: 50,
      wholesale_price: 45,
      cost_price: 35,
      stock_quantity: 30,
      unit: 'piece',
      is_quick_grid: true,
      is_returnable_asset: true, // Tracks empty jar deposit
      low_stock_threshold: 5,
      updated_at: now,
    },
    {
      id: 'prod-6',
      merchant_id: merchantId,
      category_id: 'cat-1',
      name: 'Current Hot Noodles',
      selling_price: 50,
      wholesale_price: 45,
      cost_price: 40,
      stock_quantity: 60,
      unit: 'packet',
      is_quick_grid: true,
      is_returnable_asset: false,
      low_stock_threshold: 10,
      updated_at: now,
    },
    {
      id: 'prod-7',
      merchant_id: merchantId,
      category_id: 'cat-3',
      name: 'Mustard Oil (तोरीको तेल १ लिटर)',
      selling_price: 260,
      wholesale_price: 245,
      cost_price: 230,
      stock_quantity: 45,
      unit: 'liter',
      is_quick_grid: true,
      is_returnable_asset: false,
      low_stock_threshold: 8,
      updated_at: now,
    },
    {
      id: 'prod-8',
      merchant_id: merchantId,
      category_id: 'cat-5',
      name: 'Dettol Soap (साबुन)',
      selling_price: 60,
      wholesale_price: 55,
      cost_price: 50,
      stock_quantity: 35,
      unit: 'piece',
      is_quick_grid: false,
      is_returnable_asset: false,
      low_stock_threshold: 5,
      updated_at: now,
    },
  ];
  await db.products.bulkAdd(products);

  // 4. Seed Customers with test Udharo
  const customers: Customer[] = [
    {
      id: 'cust-1',
      merchant_id: merchantId,
      name: 'हरि बहादुर थापा (Hari Bahadur)',
      phone: '9851023456',
      address: 'मन्दिर नजिकै',
      credit_limit: 10000,
      current_balance: 1450, // Rs. 1,450 Udharo
      credit_frozen: false,
      notes: 'दैनिक दूध र चामल लग्ने छिमेकी',
      last_payment_date: '2026-08-10T10:00:00Z',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'cust-2',
      merchant_id: merchantId,
      name: 'सिता देवी शर्मा (Sita Sharma)',
      phone: '9841987654',
      address: 'स्कुल पछाडि',
      credit_limit: 5000,
      current_balance: 320,
      credit_frozen: false,
      notes: 'समयमा भुक्तानी गर्ने',
      last_payment_date: '2026-08-18T14:30:00Z',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'cust-3',
      merchant_id: merchantId,
      name: 'श्याम लामा (Shyam Lama)',
      phone: '9813112233',
      address: 'चौक, किराना अगाडि',
      credit_limit: 4000,
      current_balance: 4200, // Exceeded limit
      credit_frozen: true,
      notes: 'ताकेता गर्नुपर्ने (Overdue)',
      last_payment_date: '2026-06-25T09:00:00Z',
      created_at: now,
      updated_at: now,
    },
  ];
  await db.customers.bulkAdd(customers);

  // 5. Seed Customer Asset Ledger (2 Jars with Hari)
  await db.customer_asset_ledger.add({
    id: 'asset-1',
    merchant_id: merchantId,
    customer_id: 'cust-1',
    product_id: 'prod-5',
    type: 'issued',
    quantity: 2, // 2 Jars due
    date_bs: '2083-05-01',
    created_at: now,
  });

  // 6. Seed Suppliers
  const suppliers: Supplier[] = [
    {
      id: 'supp-1',
      merchant_id: merchantId,
      name: 'काठमाडौं होलसेल डिस्ट्रीयुटर',
      phone: '9801234567',
      company_name: 'Kathmandu Wholesalers Pvt. Ltd.',
      current_balance: 18500, // We owe Rs. 18,500
      created_at: now,
      updated_at: now,
    },
    {
      id: 'supp-2',
      merchant_id: merchantId,
      name: 'ललितपुर डेरी सप्लायर्स',
      phone: '9807654321',
      company_name: 'Lalitpur Dairy Suppliers',
      current_balance: 3200,
      created_at: now,
      updated_at: now,
    },
  ];
  await db.suppliers.bulkAdd(suppliers);
}
