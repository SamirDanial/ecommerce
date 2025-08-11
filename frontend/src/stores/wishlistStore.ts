import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { wishlistService, WishlistItem } from '../services/wishlistService';

interface WishlistStore {
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addItem: (product: any, token: string) => Promise<void>;
  removeItem: (productId: number, token: string) => Promise<void>;
  clearWishlist: (token: string) => Promise<void>;
  loadWishlist: (token: string) => Promise<void>;
  checkWishlistStatus: (productId: number, token: string) => Promise<boolean>;
  syncWithDatabase: (token: string) => Promise<void>;
  
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      addItem: async (product, token) => {
        try {
          set({ isLoading: true, error: null });
          
          // Add to database
          const result = await wishlistService.addToWishlist(token, product.id);
          
          // Update local state
          set((state) => ({
            items: [...state.items, result.data],
            isLoading: false
          }));
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to add item to wishlist',
            isLoading: false 
          });
          throw error;
        }
      },

      removeItem: async (productId, token) => {
        try {
          set({ isLoading: true, error: null });
          
          // Remove from database
          await wishlistService.removeFromWishlist(token, productId);
          
          // Update local state
          set((state) => ({
            items: state.items.filter(item => item.productId !== productId),
            isLoading: false
          }));
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to remove item from wishlist',
            isLoading: false 
          });
          throw error;
        }
      },

      clearWishlist: async (token) => {
        try {
          set({ isLoading: true, error: null });
          
          // Clear from database
          await wishlistService.clearWishlist(token);
          
          // Update local state
          set({ items: [], isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to clear wishlist',
            isLoading: false 
          });
          throw error;
        }
      },

      loadWishlist: async (token) => {
        try {
          set({ isLoading: true, error: null });
          
          // Load from database
          const result = await wishlistService.getWishlist(token);
          
          set({ 
            items: result.data || [],
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to load wishlist',
            isLoading: false 
          });
        }
      },

      checkWishlistStatus: async (productId, token) => {
        try {
          // Check in database
          const result = await wishlistService.checkWishlistStatus(token, productId);
          return result.isInWishlist;
        } catch (error) {
          return false;
        }
      },

      syncWithDatabase: async (token) => {
        try {
          set({ isLoading: true, error: null });
          
          // Load from database
          const result = await wishlistService.getWishlist(token);
          
          set({ 
            items: result.data || [],
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to sync wishlist',
            isLoading: false 
          });
        }
      }
    }),
    {
      name: 'wishlist-store',
      partialize: (state) => ({ items: state.items }), // Only persist items
    }
  )
);
