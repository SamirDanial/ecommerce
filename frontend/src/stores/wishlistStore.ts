import { create } from 'zustand';
import { wishlistService } from '../services/wishlistService';

interface WishlistItem {
  id: number;
  productId: number;
  product: any;
  createdAt: string;
}

interface WishlistStore {
  items: WishlistItem[];
  isLoading: boolean;
  addItem: (product: any, token: string) => Promise<void>;
  removeItem: (productId: number, token?: string) => Promise<void>;
  clearWishlist: (token?: string) => Promise<void>;
  clearWishlistOnLogout: () => void;
  loadWishlistFromDatabase: (token: string) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  getWishlistCount: () => number;
  hasItems: () => boolean;
  getItemByProductId: (productId: number) => WishlistItem | undefined;
  validateProduct: (product: any) => boolean;
  getWishlistInfo: () => {
    itemCount: number;
    isLoading: boolean;
    items: Array<{
      id: number;
      productId: number;
      productName: string;
      createdAt: string;
    }>;
  };
  forceRefresh: (token: string) => Promise<void>;
}

export const useWishlistStore = create<WishlistStore>()(
  (set, get) => ({
    items: [],
    isLoading: false,

    addItem: async (product: any, token: string) => {
      try {
        // Validate product data first
        if (!get().validateProduct(product)) {
          console.error('Invalid product data:', product);
          throw new Error('Invalid product data provided');
        }
        
        // Check if item already exists in wishlist
        if (get().isInWishlist(product.id)) {
          return; // Don't add duplicate items
        }
        
        // Add to database first
        await wishlistService.addToWishlist(token, product.id);
        
        // If database save successful, add to local store
        const newItem: WishlistItem = {
          id: Date.now(), // Use timestamp as unique ID
          productId: product.id,
          product: product,
          createdAt: new Date().toISOString()
        };
        
        set((state) => ({
          items: [...state.items, newItem]
        }));
        
      } catch (error) {
        console.error('Failed to save wishlist item to database:', error);
        // Don't add to local store if database fails
        throw error; // Re-throw to let caller handle the error
      }
    },

    removeItem: async (productId: number, token?: string) => {
      try {
        // Remove from database if token is provided
        if (token) {
          // First check if item exists in wishlist
          if (get().isInWishlist(productId)) {
            await wishlistService.removeFromWishlist(token, productId);
          }
        }
        
        // Remove from local store
        set((state) => ({
          items: state.items.filter(item => item.productId !== productId)
        }));
        
      } catch (error) {
        console.error('Failed to remove item from database:', error);
        // Still remove from local store even if database fails
        set((state) => ({
          items: state.items.filter(item => item.productId !== productId)
        }));
      }
    },

    clearWishlist: async (token?: string) => {
      try {
        // Clear from database if token is provided and there are items
        if (token) {
          if (get().hasItems()) {
            await wishlistService.clearWishlist(token);
          }
        }
        
        // Clear from local store
        set({ items: [] });
        
      } catch (error) {
        console.error('Failed to clear wishlist from database:', error);
        // Still clear from local store even if database fails
        set({ items: [] });
      }
    },

    clearWishlistOnLogout: () => {
      set({ items: [] });
    },

    loadWishlistFromDatabase: async (token: string) => {
      try {
        // Prevent multiple simultaneous loads
        if (get().isLoading) {
          return;
        }
        
        set({ isLoading: true });
        
        // Simple timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 5000);
        });
        
        const result = await Promise.race([
          wishlistService.getWishlist(token),
          timeoutPromise
        ]);
        
        if (result.data && Array.isArray(result.data)) {
          // Transform to match our store structure
          const transformedItems = result.data.map((item: any) => ({
            id: item.id,
            productId: item.productId,
            product: item.product,
            createdAt: item.createdAt
          }));
          
          // Update store with new data
          set({ items: transformedItems, isLoading: false });
          
        } else {
          set({ items: [], isLoading: false });
        }
        
      } catch (error) {
        console.error('Failed to retrieve wishlist data from database:', error);
        set({ items: [], isLoading: false });
      }
    },

    isInWishlist: (productId: number) => {
      return get().items.some(item => item.productId === productId);
    },

    getWishlistCount: () => {
      return get().items.length;
    },

    // Helper method to check if wishlist has any items
    hasItems: () => {
      return get().items.length > 0;
    },

    // Helper method to get item by product ID
    getItemByProductId: (productId: number) => {
      return get().items.find(item => item.productId === productId);
    },

    // Helper method to validate product data
    validateProduct: (product: any): boolean => {
      return product && 
             typeof product === 'object' && 
             product.id && 
             typeof product.id === 'number' &&
             product.name && 
             typeof product.name === 'string';
    },

    // Debug method to get wishlist state information
    getWishlistInfo: () => {
      const state = get();
      return {
        itemCount: state.items.length,
        isLoading: state.isLoading,
        items: state.items.map(item => ({
          id: item.id,
          productId: item.productId,
          productName: item.product?.name || 'Unknown',
          createdAt: item.createdAt
        }))
      };
    },

    // Force refresh wishlist data (useful for manual refresh)
    forceRefresh: async (token: string) => {
      try {
        set({ isLoading: true });
        
        const result = await wishlistService.getWishlist(token);
        
        if (result.data && Array.isArray(result.data)) {
          const transformedItems = result.data.map((item: any) => ({
            id: item.id,
            productId: item.productId,
            product: item.product,
            createdAt: item.createdAt
          }));
          
          set({ items: transformedItems, isLoading: false });
        } else {
          set({ items: [], isLoading: false });
        }
        
      } catch (error) {
        console.error('Failed to force refresh wishlist:', error);
        set({ isLoading: false });
        throw error; // Re-throw to let caller handle
      }
    }
  })
);
