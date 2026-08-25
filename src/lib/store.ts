import { create } from 'zustand';
import { Product, CartItem, Customer, KiranaUnit, ThemePreset, Language, DateMode } from '@/types';
import { soundbox } from '@/lib/audio';

interface AppState {
  // Navigation & View
  activeTab: 'pos' | 'khata' | 'supplier' | 'expenses' | 'inventory' | 'reports' | 'settings';
  setActiveTab: (tab: AppState['activeTab']) => void;

  // Language & Theme
  language: Language;
  setLanguage: (lang: Language) => void;
  themePreset: ThemePreset;
  setThemePreset: (theme: ThemePreset) => void;
  customAccentHsl: string | null;
  setCustomAccentHsl: (hsl: string | null) => void;
  dateMode: DateMode;
  setDateMode: (mode: DateMode) => void;

  // Sound & Haptics
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  toggleSound: () => void;
  toggleHaptics: () => void;

  // Staff Lock Mode
  isStaffMode: boolean;
  setIsStaffMode: (enabled: boolean) => void;

  // POS Live Cart
  cart: CartItem[];
  pricingTier: 'retail' | 'wholesale';
  discountAmount: number;
  selectedCustomer: Customer | null;
  searchQuery: string;
  selectedCategory: string | null;

  // Cart Actions
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (catId: string | null) => void;
  setSelectedCustomer: (customer: Customer | null) => void;
  setPricingTier: (tier: 'retail' | 'wholesale') => void;
  setDiscountAmount: (discount: number) => void;

  addToCart: (product: Product, quantity?: number, unit?: KiranaUnit) => void;
  updateCartItemQty: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  // Hold / Park Cart
  heldCarts: { id: string; customerName: string; items: CartItem[]; heldAt: number }[];
  holdCurrentCart: () => void;
  resumeHeldCart: (heldId: string) => void;
  deleteHeldCart: (heldId: string) => void;

  // Calculated totals
  getCartSubtotal: () => number;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

export const useAppStore = create<AppState>((set, get) => ({
  activeTab: 'pos',
  setActiveTab: (tab) => {
    soundbox.playTap();
    set({ activeTab: tab });
  },

  language: 'ne',
  setLanguage: (lang) => {
    soundbox.playTap();
    set({ language: lang });
  },

  themePreset: 'paper',
  setThemePreset: (theme) => {
    soundbox.playTap();
    set({ themePreset: theme });
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  },

  customAccentHsl: null,
  setCustomAccentHsl: (hsl) => {
    set({ customAccentHsl: hsl });
    if (typeof document !== 'undefined' && hsl) {
      document.documentElement.style.setProperty('--primary', hsl);
    }
  },

  dateMode: 'BS',
  setDateMode: (mode) => set({ dateMode: mode }),

  soundEnabled: true,
  hapticsEnabled: true,
  toggleSound: () => {
    const next = !get().soundEnabled;
    soundbox.setPreferences(next, get().hapticsEnabled);
    set({ soundEnabled: next });
  },
  toggleHaptics: () => {
    const next = !get().hapticsEnabled;
    soundbox.setPreferences(get().soundEnabled, next);
    set({ hapticsEnabled: next });
  },

  isStaffMode: false,
  setIsStaffMode: (enabled) => set({ isStaffMode: enabled }),

  cart: [],
  pricingTier: 'retail',
  discountAmount: 0,
  selectedCustomer: null,
  searchQuery: '',
  selectedCategory: null,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (catId) => set({ selectedCategory: catId }),
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),

  setPricingTier: (tier) => {
    soundbox.playTap();
    const currentCart = get().cart;
    const updatedCart = currentCart.map((item) => {
      const price =
        tier === 'wholesale' && item.product.wholesale_price
          ? item.product.wholesale_price
          : item.product.selling_price;
      return {
        ...item,
        unit_price: price,
        subtotal: price * item.quantity,
      };
    });
    set({ pricingTier: tier, cart: updatedCart });
  },

  setDiscountAmount: (discount) => set({ discountAmount: Math.max(0, discount) }),

  addToCart: (product, quantity = 1, unit) => {
    soundbox.playTap();
    const currentCart = get().cart;
    const pricingTier = get().pricingTier;
    const existingIndex = currentCart.findIndex((item) => item.product.id === product.id);

    const unitPrice =
      pricingTier === 'wholesale' && product.wholesale_price
        ? product.wholesale_price
        : product.selling_price;

    const selectedUnit = unit || product.unit;

    if (existingIndex > -1) {
      const updatedCart = [...currentCart];
      const newQty = updatedCart[existingIndex].quantity + quantity;
      updatedCart[existingIndex] = {
        ...updatedCart[existingIndex],
        quantity: Math.round(newQty * 1000) / 1000,
        subtotal: Math.round(newQty * unitPrice * 100) / 100,
      };
      set({ cart: updatedCart });
    } else {
      const newItem: CartItem = {
        product,
        quantity,
        unit_price: unitPrice,
        subtotal: Math.round(quantity * unitPrice * 100) / 100,
        selected_unit: selectedUnit,
      };
      set({ cart: [newItem, ...currentCart] });
    }
  },

  updateCartItemQty: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    const currentCart = get().cart;
    const updatedCart = currentCart.map((item) => {
      if (item.product.id === productId) {
        return {
          ...item,
          quantity: Math.round(quantity * 1000) / 1000,
          subtotal: Math.round(quantity * item.unit_price * 100) / 100,
        };
      }
      return item;
    });
    set({ cart: updatedCart });
  },

  removeFromCart: (productId) => {
    soundbox.playTap();
    const updatedCart = get().cart.filter((item) => item.product.id !== productId);
    set({ cart: updatedCart });
  },

  clearCart: () => {
    set({ cart: [], discountAmount: 0, selectedCustomer: null });
  },

  heldCarts: [],

  holdCurrentCart: () => {
    const currentCart = get().cart;
    if (currentCart.length === 0) return;
    soundbox.playTap();

    const customerName = get().selectedCustomer?.name || `बिल #${get().heldCarts.length + 1}`;
    const heldId = `held-${Date.now()}`;

    const newHeld = {
      id: heldId,
      customerName,
      items: currentCart,
      heldAt: Date.now(),
    };

    set({
      heldCarts: [...get().heldCarts, newHeld],
      cart: [],
      discountAmount: 0,
      selectedCustomer: null,
    });
  },

  resumeHeldCart: (heldId) => {
    const target = get().heldCarts.find((h) => h.id === heldId);
    if (!target) return;
    soundbox.playTap();

    set({
      cart: target.items,
      heldCarts: get().heldCarts.filter((h) => h.id !== heldId),
    });
  },

  deleteHeldCart: (heldId) => {
    soundbox.playTap();
    set({
      heldCarts: get().heldCarts.filter((h) => h.id !== heldId),
    });
  },

  getCartSubtotal: () => {
    return get().cart.reduce((sum, item) => sum + item.subtotal, 0);
  },

  getCartTotal: () => {
    const subtotal = get().getCartSubtotal();
    return Math.max(0, subtotal - get().discountAmount);
  },

  getCartItemCount: () => {
    return get().cart.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
