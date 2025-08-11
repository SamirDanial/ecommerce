import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

interface CartState {
  items: CartItem[];
  addToCart: (product: any, quantity?: number, color?: string, size?: string) => void;
  removeFromCart: (productId: number, color?: string, size?: string) => void;
  updateQuantity: (productId: number, quantity: number, color?: string, size?: string) => void;
  clearCart: () => void;
  getItemQuantity: (productId: number, color?: string, size?: string) => number;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
  getSavings: () => number;
  isInCart: (productId: number, color?: string, size?: string) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

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
        return item?.quantity || 0;
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      getTotal: () => {
        const { getSubtotal } = get();
        // For now, no tax or shipping calculation
        // This can be extended later when login functionality is implemented
        return getSubtotal();
      },

      getSavings: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          if (item.comparePrice && item.comparePrice > item.price) {
            return total + ((item.comparePrice - item.price) * item.quantity);
          }
          return total;
        }, 0);
      },

      isInCart: (productId, color, size) => {
        const { items } = get();
        return items.some(
          item => 
            item.id === productId && 
            item.selectedColor === color && 
            item.selectedSize === size
        );
      }
    }),
    {
      name: 'cart-store',
      partialize: (state) => ({ items: state.items })
    }
  )
);
