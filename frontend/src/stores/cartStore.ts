import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { validateDiscountCode, DiscountCode } from '../services/discountService';
import { CurrencyService } from '../services/currencyService';
import { LanguageService } from '../services/languageService';
import { DeliveryScopeService, DeliveryScope, ShippingRate } from '../services/deliveryScopeService';
import { TaxService, TaxRate } from '../services/taxService';

// Fallback currencies (used when API is not available)
export const fallbackCurrencies: DynamicCurrency[] = [
  { id: 1, code: 'USD', symbol: '$', rate: 1, name: 'US Dollar', isActive: true, isDefault: true, decimals: 2, position: 'before' },
  { id: 2, code: 'EUR', symbol: '€', rate: 0.85, name: 'Euro', isActive: true, isDefault: false, decimals: 2, position: 'before' },
  { id: 3, code: 'GBP', symbol: '£', rate: 0.73, name: 'British Pound', isActive: true, isDefault: false, decimals: 2, position: 'before' },
  { id: 4, code: 'JPY', symbol: '¥', rate: 110, name: 'Japanese Yen', isActive: true, isDefault: false, decimals: 0, position: 'before' },
  { id: 5, code: 'CNY', symbol: '¥', rate: 6.45, name: 'Chinese Yuan', isActive: true, isDefault: false, decimals: 2, position: 'before' },
  { id: 6, code: 'INR', symbol: '₹', rate: 74.5, name: 'Indian Rupee', isActive: true, isDefault: false, decimals: 2, position: 'before' },
  { id: 7, code: 'PKR', symbol: '₨', rate: 280, name: 'Pakistani Rupee', isActive: true, isDefault: false, decimals: 2, position: 'before' }
];

// Fallback languages (used when API is not available)
export const fallbackLanguages: DynamicLanguage[] = [
  { id: 1, code: 'en', name: 'English', nativeName: 'English', isActive: true, isDefault: true, isRTL: false },
  { id: 2, code: 'es', name: 'Spanish', nativeName: 'Español', isActive: true, isDefault: false, isRTL: false },
  { id: 3, code: 'fr', name: 'French', nativeName: 'Français', isActive: true, isDefault: false, isRTL: false },
  { id: 4, code: 'de', name: 'German', nativeName: 'Deutsch', isActive: true, isDefault: false, isRTL: false },
  { id: 5, code: 'it', name: 'Italian', nativeName: 'Italiano', isActive: true, isDefault: false, isRTL: false },
  { id: 6, code: 'pt', name: 'Portuguese', nativeName: 'Português', isActive: true, isDefault: false, isRTL: false },
  { id: 7, code: 'ru', name: 'Russian', nativeName: 'Русский', isActive: true, isDefault: false, isRTL: false },
  { id: 8, code: 'zh', name: 'Chinese', nativeName: '中文', isActive: true, isDefault: false, isRTL: false },
  { id: 9, code: 'ja', name: 'Japanese', nativeName: '日本語', isActive: true, isDefault: false, isRTL: false },
  { id: 10, code: 'ko', name: 'Korean', nativeName: '한국어', isActive: true, isDefault: false, isRTL: false },
  { id: 11, code: 'ar', name: 'Arabic', nativeName: 'العربية', isActive: true, isDefault: false, isRTL: true },
  { id: 12, code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', isActive: true, isDefault: false, isRTL: false },
  { id: 13, code: 'ur', name: 'Urdu', nativeName: 'اردو', isActive: true, isDefault: false, isRTL: true },
  { id: 14, code: 'bn', name: 'Bengali', nativeName: 'বাংলা', isActive: true, isDefault: false, isRTL: false },
  { id: 15, code: 'th', name: 'Thai', nativeName: 'ไทย', isActive: true, isDefault: false, isRTL: false }
];



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
  id?: string;
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

// Extended interfaces for dynamic data
export interface DynamicCurrency extends Currency {
  id: number;
  isActive: boolean;
  isDefault: boolean;
  decimals: number;
  position: 'before' | 'after';
}

export interface DynamicLanguage extends Language {
  id: number;
  isActive: boolean;
  isDefault: boolean;
  isRTL: boolean;
}

interface CartState {
  // Cart Items
  items: CartItem[];
  addToCart: (product: any, quantity?: number, color?: string, size?: string, imageUrl?: string, variantPrice?: number, variantComparePrice?: number) => void;
  removeFromCart: (productId: number, color?: string, size?: string) => void;
  updateQuantity: (productId: number, quantity: number, color?: string, size?: string) => void;
  clearCart: () => void;
  getItemQuantity: (productId: number, color?: string, size?: string) => number;
  getTotalItems: () => number;
  
  // Pricing & Currency
  selectedCurrency: DynamicCurrency;
      setCurrency: (currency: DynamicCurrency) => void;
  getSubtotal: () => number;
  getTotal: () => number;
  getSavings: () => number;
  getConvertedPrice: (price: number) => number;
  
  // Dynamic Currency & Language Data
  availableCurrencies: DynamicCurrency[];
  availableLanguages: DynamicLanguage[];
  isLoadingCurrencies: boolean;
  isLoadingLanguages: boolean;
  fetchCurrencies: () => Promise<void>;
  fetchLanguages: () => Promise<void>;
  
  // Shipping & Taxes
  shippingAddress: ShippingAddress | null;
  setShippingAddress: (address: ShippingAddress | null) => void;
  currentShippingRate: ShippingRate | null;
  isLoadingShippingRate: boolean;
  fetchShippingRate: (countryCode: string, stateCode?: string, token?: string) => Promise<void>;
  currentTaxRate: TaxRate | null;
  isLoadingTaxRate: boolean;
  fetchTaxRate: (countryCode: string, stateCode?: string, cityCode?: string, token?: string) => Promise<void>;

  getShippingCost: () => number;
  getTaxAmount: () => number;
  
  // Delivery Availability
  isDeliveryAvailable: () => boolean;
  getDeliveryUnavailableMessage: () => string;
  
  // Delivery Scope & International Delivery
  deliveryScope: DeliveryScope | null;
  isLoadingDeliveryScope: boolean;
  fetchDeliveryScope: () => Promise<void>;
  
  // Discounts
  appliedDiscount: DiscountCode | null;
  applyDiscountCode: (code: string, token?: string) => Promise<boolean>;
  removeDiscountCode: () => void;
  getDiscountAmount: () => number;
  
  // Language
  selectedLanguage: DynamicLanguage;
      setLanguage: (language: DynamicLanguage) => void;
  
  // Utility
  isInCart: (productId: number, color?: string, size?: string) => boolean;
  isProductInCart: (productId: number) => boolean;
  isVariantInCart: (productId: number, color?: string, size?: string) => boolean;
  getProductVariants: (productId: number) => CartItem[];
}



export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      selectedCurrency: fallbackCurrencies[0],
      shippingAddress: null,
      
      appliedDiscount: null,
      selectedLanguage: fallbackLanguages[0],
      
      // Dynamic data state
      availableCurrencies: fallbackCurrencies,
      availableLanguages: fallbackLanguages,
      isLoadingCurrencies: false,
      isLoadingLanguages: false,
      
      // Delivery scope state
      deliveryScope: null,
      isLoadingDeliveryScope: false,
      
      // Shipping rate state
      currentShippingRate: null,
      isLoadingShippingRate: false,
      
      // Tax rate state
      currentTaxRate: null,
      isLoadingTaxRate: false,

      // Cart item methods
      addToCart: (product, quantity = 1, color, size, imageUrl?: string, variantPrice?: number, variantComparePrice?: number) => {
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
          // Get the appropriate image for the selected color
          let productImage = imageUrl || product.images?.[0]?.url;
          
          // If we have color-specific images, try to find one for the selected color
          if (color && product.images && product.images.length > 0 && !imageUrl) {
            // For now, we'll use the first image as a fallback
            // In a real implementation, you'd have a mapping of colors to specific images
            productImage = product.images[0]?.url;
          }
          
          // Use variant price if available, otherwise fall back to product price
          const finalPrice = variantPrice || product.price;
          const finalComparePrice = variantComparePrice || product.comparePrice;
          
          const newItem: CartItem = {
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: finalPrice,
            comparePrice: finalComparePrice,
            image: productImage,
            quantity,
            selectedColor: color,
            selectedSize: size,
            addedAt: Date.now()
          };
          set({ items: [...items, newItem] });
        }
      },

      // New method to check if a specific variant is in cart
      isVariantInCart: (productId: number, color?: string, size?: string) => {
        const { items } = get();
        return items.some(item => 
          item.id === productId && 
          item.selectedColor === color && 
          item.selectedSize === size
        );
      },

      // New method to get all variants of a product in cart
      getProductVariants: (productId: number) => {
        const { items } = get();
        return items.filter(item => item.id === productId);
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
        console.log('🧹 Clearing cart and resetting currency-related data');
        set({ 
          items: [],
          shippingAddress: null,
          currentShippingRate: null,
          currentTaxRate: null,
          appliedDiscount: null
        });
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
      setCurrency: (currency: DynamicCurrency) => {
        const { selectedCurrency: currentCurrency } = get();
        
        // If currency is actually changing, clear cart and reset currency-related data
        if (currentCurrency.code !== currency.code) {
          console.log(`🔄 Currency changed from ${currentCurrency.code} to ${currency.code}, clearing cart data`);
          
          // Clear all cart and currency-related data
          set({
            selectedCurrency: currency,
            items: [],
            shippingAddress: null,
            currentShippingRate: null,
            currentTaxRate: null,
            appliedDiscount: null
          });
          
          console.log('🧹 Cart cleared due to currency change');
        } else {
          // Same currency, just update
          set({ selectedCurrency: currency });
        }
      },

      getConvertedPrice: (price) => {
        const { selectedCurrency } = get();
        if (!selectedCurrency) return price;
        return price * selectedCurrency.rate;
      },

      getSubtotal: () => {
        const { items, selectedCurrency } = get();
        const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
        // Convert to user's selected currency
        return subtotal * selectedCurrency.rate;
      },

      getTotal: () => {
        const { getSubtotal, getDiscountAmount, getShippingCost, getTaxAmount, shippingAddress, selectedCurrency } = get();
        const subtotal = getSubtotal();
        const discount = getDiscountAmount();
        
        // If no shipping address is selected, total should just be subtotal
        if (!shippingAddress) {
          return Math.max(0, subtotal - discount);
        }
        
        // Get amounts in their respective currencies
        const baseShippingCost = getShippingCost(); // Base currency (PKR)
        const taxAmount = getTaxAmount(); // User's selected currency
        
        // Convert shipping cost from base currency to user currency
        const shippingCost = baseShippingCost * selectedCurrency.rate;
        
        // Total = subtotal + shipping + tax - discount
        // All amounts are now in the same currency (user's selected currency)
        const total = Math.max(0, subtotal + shippingCost + taxAmount - discount);
        
        // Debug logging
        console.log('🔍 Total Calculation Debug:', {
          subtotal,
          baseShippingCost,
          taxAmount,
          shippingCost,
          discount,
          total,
          hasAddress: !!shippingAddress
        });
        
        return total;
      },

      getSavings: () => {
        const { items } = get();
        const savings = items.reduce((total, item) => {
          if (item.comparePrice && item.comparePrice > item.price) {
            return total + ((item.comparePrice - item.price) * item.quantity);
          }
          return total;
        }, 0);
        return savings;
      },

      // Shipping methods
      setShippingAddress: (address) => {
        set({ shippingAddress: address });
      },

      

              getShippingCost: () => {
          const { currentShippingRate, shippingAddress } = get();
          
          // If no shipping address is selected, return 0
          if (!shippingAddress) {
            return 0;
          }
          
          // Use dynamic shipping rate if available, otherwise fallback to standard
          // Return shipping cost in base currency (PKR) - frontend will convert for display
          return currentShippingRate?.shippingCost || 5.99;
        },

      getTaxAmount: () => {
        const { getSubtotal, getDiscountAmount, currentTaxRate, shippingAddress, selectedCurrency } = get();
        
        // If no shipping address is selected, return 0
        if (!shippingAddress) {
          return 0;
        }
        
        const subtotal = getSubtotal();
        const discount = getDiscountAmount();
        
        // Use dynamic tax rate if available, otherwise fallback to default
        // The taxRate from backend is a percentage (e.g., "15" for 15%)
        const taxRatePercentage = currentTaxRate?.taxRate || TAX_RATE;
        
        // Convert percentage to decimal (e.g., "15" → 0.15)
        const taxRate = typeof taxRatePercentage === 'string' 
          ? parseFloat(taxRatePercentage) / 100 
          : taxRatePercentage / 100;
        
        // Tax is calculated ONLY on subtotal - discount (not on shipping)
        // Both subtotal and discount are in user's selected currency
        const taxableAmount = Math.max(0, subtotal - discount);
        const taxAmount = taxableAmount * taxRate;
        
        // Debug logging for tax calculation
        console.log('🔍 Tax Calculation Debug:', {
          subtotal,
          discount,
          taxableAmount,
          taxRatePercentage,
          taxRate,
          taxAmount,
          currency: selectedCurrency.code
        });
        
        // Return tax amount in user's selected currency (no conversion needed)
        return taxAmount;
      },

      // Delivery availability methods
      isDeliveryAvailable: () => {
        const { currentShippingRate, currentTaxRate, shippingAddress } = get();
        
        // If no address selected, delivery is not available
        if (!shippingAddress) {
          return false;
        }
        
        // Check if both shipping and tax rates are available AND active
        return !!(currentShippingRate?.isActive && currentTaxRate);
      },

      getDeliveryUnavailableMessage: () => {
        const { shippingAddress, currentShippingRate, currentTaxRate } = get();
        
        if (!shippingAddress) {
          return "Please select a shipping address to continue";
        }
        
        const countryName = shippingAddress.country;
        
        // Check if shipping rate exists but is inactive
        if (currentShippingRate && !currentShippingRate.isActive) {
          return `Sorry, we currently don't have delivery in ${currentShippingRate.countryName || countryName} yet. Please contact support for more information.`;
        }
        
        if (!currentShippingRate && !currentTaxRate) {
          return `Sorry, we currently don't have delivery in ${countryName} yet. Please contact support for more information.`;
        } else if (!currentShippingRate) {
          return `Sorry, we currently don't have shipping rates for ${countryName} yet. Please contact support for more information.`;
        } else if (!currentTaxRate) {
          return `Sorry, we currently don't have tax rates for ${countryName} yet. Please contact support for more information.`;
        }
        
        return "Delivery is available for this location";
      },

      // Discount methods
      applyDiscountCode: async (code, token?: string) => {
        try {
          // Get subtotal in base currency for backend validation
          const { items, selectedCurrency } = get();
          const baseSubtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
          
          const validation = await validateDiscountCode(code, baseSubtotal, token);
          
          if (validation.isValid && validation.discount) {
            // Store both the discount code and the calculated amount
            const discountWithAmount = {
              ...validation.discount,
              calculatedAmount: validation.discountAmount || 0
            };
            set({ appliedDiscount: discountWithAmount });
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
        
        // Use the pre-calculated amount from the backend if available
        if (appliedDiscount.calculatedAmount !== undefined) {
          // Convert backend amount to user's currency
          return appliedDiscount.calculatedAmount * selectedCurrency.rate;
        }
        
        // Fallback to local calculation if needed
        const subtotal = getSubtotal();
        if (appliedDiscount.minAmount && subtotal < appliedDiscount.minAmount) return 0;
        
        let discountAmount = 0;
        if (appliedDiscount.type === 'PERCENTAGE') {
          discountAmount = subtotal * (appliedDiscount.value / 100);
        } else {
          // Convert fixed amount to user's currency
          discountAmount = appliedDiscount.value * selectedCurrency.rate;
        }
        
        // Apply max discount limit if specified
        if (appliedDiscount.maxDiscount) {
          discountAmount = Math.min(discountAmount, appliedDiscount.maxDiscount * selectedCurrency.rate);
        }
        
        return discountAmount;
      },

      // Language methods
      setLanguage: (language: DynamicLanguage) => {
        set({ selectedLanguage: language });
      },

      // Dynamic data methods
      fetchCurrencies: async () => {
        try {
          set({ isLoadingCurrencies: true });
          const currencies = await CurrencyService.getAllCurrencies();
          set({ 
            availableCurrencies: currencies,
            isLoadingCurrencies: false 
          });
        } catch (error) {
          console.error('Failed to fetch currencies, using fallback:', error);
          set({ 
            availableCurrencies: fallbackCurrencies,
            isLoadingCurrencies: false 
          });
        }
      },

      fetchLanguages: async () => {
        try {
          set({ isLoadingLanguages: true });
          const languages = await LanguageService.getAllLanguages();
          set({ 
            availableLanguages: languages,
            isLoadingLanguages: false 
          });
        } catch (error) {
          console.error('Failed to fetch languages, using fallback:', error);
          set({ 
            availableLanguages: fallbackLanguages,
            isLoadingLanguages: false 
          });
        }
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

      // Delivery scope methods
      fetchDeliveryScope: async () => {
        try {
          set({ isLoadingDeliveryScope: true });
          const scope = await DeliveryScopeService.getDeliveryScope();
          set({ 
            deliveryScope: scope,
            isLoadingDeliveryScope: false 
          });
        } catch (error) {
          console.error('Failed to fetch delivery scope:', error);
          set({ isLoadingDeliveryScope: false });
        }
      },
      
      // Shipping rate methods
      fetchShippingRate: async (countryCode: string, stateCode?: string, token?: string) => {
        try {
          set({ isLoadingShippingRate: true });
          const rates = await DeliveryScopeService.getShippingRates(countryCode, stateCode, token);
          // Use the first matching rate or null if none found
          const rate = rates.length > 0 ? rates[0] : null;
          set({ 
            currentShippingRate: rate,
            isLoadingShippingRate: false 
          });
        } catch (error) {
          console.error('Failed to fetch shipping rate:', error);
          set({ isLoadingShippingRate: false });
        }
      },
      
      // Tax rate methods
      fetchTaxRate: async (countryCode: string, stateCode?: string, cityCode?: string, token?: string) => {
        try {
          set({ isLoadingTaxRate: true });
          const taxRate = await TaxService.getTaxRate(countryCode, stateCode, cityCode, token);
          set({ 
            currentTaxRate: taxRate,
            isLoadingTaxRate: false 
          });
        } catch (error) {
          console.error('Failed to fetch tax rate:', error);
          set({ isLoadingTaxRate: false });
        }
      },
    }),
    {
      name: 'cart-store',
      partialize: (state) => ({
        items: state.items,
        selectedCurrency: state.selectedCurrency,
        shippingAddress: state.shippingAddress,

        selectedLanguage: state.selectedLanguage,
      }),
    }
  )
);
