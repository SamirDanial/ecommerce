import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { validateDiscountCode, DiscountCode } from '../services/discountService';

// Default currencies
export const defaultCurrencies = [
  { code: 'USD', symbol: '$', rate: 1, name: 'US Dollar' },
  { code: 'EUR', symbol: '€', rate: 0.85, name: 'Euro' },
  { code: 'PKR', symbol: '₨', rate: 280, name: 'Pakistani Rupee' }
];

// Default languages
export const defaultLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' }
];

// Shipping costs
export const shippingCosts = {
  standard: 5.99,
  express: 12.99,
  overnight: 24.99
};

// Tax rate (8.25%)
export const TAX_RATE = 0.0825;

// Cart item interface
export interface CartItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  image?: string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  addedAt: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Currency {
  code: string;
  symbol: string;
  rate: number; // Exchange rate relative to USD
  name: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

interface CartState {
  // Cart Items
  items: CartItem[];
  addToCart: (product: any, quantity?: number, color?: string, size?: string) => void;
  removeFromCart: (productId: number, color?: string, size?: string) => void;
  updateQuantity: (productId: number, quantity: number, color?: string, size?: string) => void;
  clearCart: () => void;
  getItemQuantity: (productId: number, color?: string, size?: string) => number;
  getTotalItems: () => number;
  
  // Pricing & Currency
  selectedCurrency: Currency;
  setCurrency: (currency: Currency) => void;
  getSubtotal: () => number;
  getTotal: () => number;
  getSavings: () => number;
  getConvertedPrice: (price: number) => number;
  
  // Shipping & Taxes
  shippingAddress: ShippingAddress | null;
  setShippingAddress: (address: ShippingAddress | null) => void;
  shippingMethod: 'standard' | 'express' | 'overnight';
  setShippingMethod: (method: 'standard' | 'express' | 'overnight') => void;
  getShippingCost: () => number;
  getTaxAmount: () => number;
  
  // Discounts
  appliedDiscount: DiscountCode | null;
  applyDiscountCode: (code: string, token?: string) => Promise<boolean>;
  removeDiscountCode: () => void;
  getDiscountAmount: () => number;
  
  // Language
  selectedLanguage: Language;
  setLanguage: (language: Language) => void;
  
  // Utility
  isInCart: (productId: number, color?: string, size?: string) => boolean;
  isProductInCart: (productId: number) => boolean;
}



export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      selectedCurrency: defaultCurrencies[0] || { code: 'USD', symbol: '$', rate: 1, name: 'US Dollar' },
      shippingAddress: null,
      shippingMethod: 'standard',
      appliedDiscount: null,
      selectedLanguage: defaultLanguages[0] || { code: 'en', name: 'English', nativeName: 'English' },

      // Cart item methods
      addToCart: (product, quantity = 1, color, size) => {
        const { items } = get();
        const existingItemIndex = items.findIndex(
          item => 
            item.id === product.id && 
            item.selectedColor === color && 
            item.selectedSize === size
        );

        if (existingItemIndex !== -1) {
          // Update existing item quantity
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += quantity;
          set({ items: updatedItems });
        } else {
          // Add new item
          const newItem: CartItem = {
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            comparePrice: product.comparePrice,
            image: product.images?.[0]?.url,
            quantity,
            selectedColor: color,
            selectedSize: size,
            addedAt: Date.now()
          };
          set({ items: [...items, newItem] });
        }
      },

      removeFromCart: (productId, color, size) => {
        const { items } = get();
        const filteredItems = items.filter(
          item => 
            !(item.id === productId && 
              item.selectedColor === color && 
              item.selectedSize === size)
        );
        set({ items: filteredItems });
      },

      updateQuantity: (productId, quantity, color, size) => {
        const { items } = get();
        if (quantity <= 0) {
          get().removeFromCart(productId, color, size);
          return;
        }

        const updatedItems = items.map(item => {
          if (item.id === productId && 
              item.selectedColor === color && 
              item.selectedSize === size) {
            return { ...item, quantity };
          }
          return item;
        });
        set({ items: updatedItems });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getItemQuantity: (productId, color, size) => {
        const { items } = get();
        const item = items.find(
          item => 
            item.id === productId && 
            item.selectedColor === color && 
            item.selectedSize === size
        );
        return item ? item.quantity : 0;
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      // Currency methods
      setCurrency: (currency) => {
        set({ selectedCurrency: currency });
      },

      getConvertedPrice: (price) => {
        const { selectedCurrency } = get();
        if (!selectedCurrency) return price;
        return price * selectedCurrency.rate;
      },

      getSubtotal: () => {
        const { items, selectedCurrency } = get();
        const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
        return subtotal * selectedCurrency.rate;
      },

      getTotal: () => {
        const { getSubtotal, getShippingCost, getTaxAmount, getDiscountAmount } = get();
        const subtotal = getSubtotal();
        const shipping = getShippingCost();
        const tax = getTaxAmount();
        const discount = getDiscountAmount();
        
        return Math.max(0, subtotal + shipping + tax - discount);
      },

      getSavings: () => {
        const { items, selectedCurrency } = get();
        const savings = items.reduce((total, item) => {
          if (item.comparePrice && item.comparePrice > item.price) {
            return total + ((item.comparePrice - item.price) * item.quantity);
          }
          return total;
        }, 0);
        return savings * selectedCurrency.rate;
      },

      // Shipping methods
      setShippingAddress: (address) => {
        set({ shippingAddress: address });
      },

      setShippingMethod: (method) => {
        set({ shippingMethod: method });
      },

      getShippingCost: () => {
        const { shippingMethod, selectedCurrency } = get();
        const baseCost = shippingCosts[shippingMethod];
        return baseCost * selectedCurrency.rate;
      },

      getTaxAmount: () => {
        const { getSubtotal, getShippingCost, getDiscountAmount } = get();
        const subtotal = getSubtotal();
        const shipping = getShippingCost();
        const discount = getDiscountAmount();
        
        // Tax is calculated on subtotal + shipping - discount
        const taxableAmount = Math.max(0, subtotal + shipping - discount);
        return taxableAmount * TAX_RATE;
      },

      // Discount methods
      applyDiscountCode: async (code, token?: string) => {
        try {
          const subtotal = get().getSubtotal();
          const validation = await validateDiscountCode(code, subtotal, token);
          
          if (validation.isValid && validation.discount) {
            set({ appliedDiscount: validation.discount });
            return true;
          } else {
            console.error('Invalid discount code:', validation.message);
            return false;
          }
        } catch (error) {
          console.error('Failed to apply discount code:', error);
          return false;
        }
      },

      removeDiscountCode: () => {
        set({ appliedDiscount: null });
      },

      getDiscountAmount: () => {
        const { appliedDiscount, getSubtotal, selectedCurrency } = get();
        if (!appliedDiscount) return 0;
        
        const subtotal = getSubtotal();
        if (appliedDiscount.minAmount && subtotal < appliedDiscount.minAmount) return 0;
        
        let discountAmount = 0;
        if (appliedDiscount.type === 'PERCENTAGE') {
          discountAmount = subtotal * (appliedDiscount.value / 100);
        } else {
          discountAmount = appliedDiscount.value * selectedCurrency.rate;
        }
        
        // Apply max discount limit if specified
        if (appliedDiscount.maxDiscount) {
          discountAmount = Math.min(discountAmount, appliedDiscount.maxDiscount * selectedCurrency.rate);
        }
        
        return discountAmount;
      },

      // Language methods
      setLanguage: (language) => {
        set({ selectedLanguage: language });
      },

      // Utility methods
      isInCart: (productId, color, size) => {
        const { items } = get();
        return items.some(
          item => 
            item.id === productId && 
            item.selectedColor === color && 
            item.selectedSize === size
        );
      },

      // Check if product exists in cart regardless of variants
      isProductInCart: (productId) => {
        const { items } = get();
        return items.some(item => item.id === productId);
      },
    }),
    {
      name: 'cart-store',
      partialize: (state) => ({
        items: state.items,
        selectedCurrency: state.selectedCurrency,
        shippingAddress: state.shippingAddress,
        shippingMethod: state.shippingMethod,
        selectedLanguage: state.selectedLanguage,
      }),
    }
  )
);
