import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  image?: string;
  addedAt: number;
}

interface WishlistState {
  wishlist: WishlistItem[];
  addToWishlist: (product: any) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => void;
  getWishlistCount: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlist: [],

      addToWishlist: (product) => {
        const { wishlist } = get();
        const existingItem = wishlist.find(item => item.id === product.id);

        if (!existingItem) {
          const newItem: WishlistItem = {
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            comparePrice: product.comparePrice,
            image: product.images?.[0]?.url,
            addedAt: Date.now()
          };
          set({ wishlist: [...wishlist, newItem] });
        }
      },

      removeFromWishlist: (productId) => {
        const { wishlist } = get();
        const filteredWishlist = wishlist.filter(item => item.id !== productId);
        set({ wishlist: filteredWishlist });
      },

      isInWishlist: (productId) => {
        const { wishlist } = get();
        return wishlist.some(item => item.id === productId);
      },

      clearWishlist: () => {
        set({ wishlist: [] });
      },

      getWishlistCount: () => {
        const { wishlist } = get();
        return wishlist.length;
      }
    }),
    {
      name: 'wishlist-store',
      partialize: (state) => ({ wishlist: state.wishlist })
    }
  )
);
