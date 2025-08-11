import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserInteraction {
  id: string;
  type: 'product_view' | 'category_view' | 'wishlist_add' | 'wishlist_remove' | 'cart_add' | 'cart_remove' | 'page_view';
  targetId?: string;
  targetType?: 'product' | 'category' | 'page';
  data?: any;
  timestamp: number;
  sessionId: string;
}

export interface WishlistItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  image?: string;
  addedAt: number;
}

export interface RecentlyViewedProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  image?: string;
  viewedAt: number;
}



interface UserInteractionState {
  // Wishlist
  wishlist: WishlistItem[];
  addToWishlist: (product: any) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  
  // Recently Viewed
  recentlyViewed: RecentlyViewedProduct[];
  addToRecentlyViewed: (product: any) => void;
  clearRecentlyViewed: () => void;
  

  
  // User Interactions
  interactions: UserInteraction[];
  addInteraction: (interaction: Omit<UserInteraction, 'id' | 'timestamp' | 'sessionId'>) => void;
  clearInteractions: () => void;
  
  // Session Management
  sessionId: string;
  generateNewSession: () => void;
  
  // Analytics
  getPopularProducts: () => { id: number; count: number }[];
  getPopularCategories: () => { id: string; count: number }[];

  getUserBehaviorPatterns: () => any;
}

const generateSessionId = () => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export const useUserInteractionStore = create<UserInteractionState>()(
  persist(
    (set, get) => ({
      // Initial state
      wishlist: [],
      recentlyViewed: [],
      interactions: [],
      sessionId: generateSessionId(),
      
      // Wishlist methods
      addToWishlist: (product) => {
        const { wishlist, addInteraction } = get();
        const existingIndex = wishlist.findIndex(item => item.id === product.id);
        
        if (existingIndex === -1) {
          const wishlistItem: WishlistItem = {
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            comparePrice: product.comparePrice,
            image: product.images?.[0]?.url,
            addedAt: Date.now()
          };
          
          set({ wishlist: [...wishlist, wishlistItem] });
          
          // Track interaction
          addInteraction({
            type: 'wishlist_add',
            targetId: product.id.toString(),
            targetType: 'product',
            data: { productName: product.name }
          });
        }
      },
      
      removeFromWishlist: (productId) => {
        const { wishlist, addInteraction } = get();
        const product = wishlist.find(item => item.id === productId);
        
        if (product) {
          set({ wishlist: wishlist.filter(item => item.id !== productId) });
          
          // Track interaction
          addInteraction({
            type: 'wishlist_remove',
            targetId: productId.toString(),
            targetType: 'product',
            data: { productName: product.name }
          });
        }
      },
      
      isInWishlist: (productId) => {
        const { wishlist } = get();
        return wishlist.some(item => item.id === productId);
      },
      
      // Recently viewed methods
      addToRecentlyViewed: (product) => {
        const { recentlyViewed } = get();
        const existingIndex = recentlyViewed.findIndex(item => item.id === product.id);
        
        const recentlyViewedItem: RecentlyViewedProduct = {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          comparePrice: product.comparePrice,
          image: product.images?.[0]?.url,
          viewedAt: Date.now()
        };
        
        let newRecentlyViewed;
        if (existingIndex !== -1) {
          // Remove existing and add to front
          newRecentlyViewed = [
            recentlyViewedItem,
            ...recentlyViewed.filter(item => item.id !== product.id)
          ];
        } else {
          // Add to front
          newRecentlyViewed = [recentlyViewedItem, ...recentlyViewed];
        }
        
        // Keep only last 20 items
        set({ recentlyViewed: newRecentlyViewed.slice(0, 20) });
      },
      
      clearRecentlyViewed: () => {
        set({ recentlyViewed: [] });
      },
      

      
      // User interaction methods
      addInteraction: (interaction) => {
        const { interactions, sessionId } = get();
        const newInteraction: UserInteraction = {
          ...interaction,
          id: 'interaction_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          sessionId
        };
        
        set({ interactions: [...interactions, newInteraction] });
      },
      
      clearInteractions: () => {
        set({ interactions: [] });
      },
      
      // Session management
      generateNewSession: () => {
        set({ sessionId: generateSessionId() });
      },
      
      // Analytics methods
      getPopularProducts: () => {
        const { interactions } = get();
        const productViews = interactions
          .filter(i => i.type === 'product_view' && i.targetId)
          .reduce((acc, interaction) => {
            const id = interaction.targetId!;
            acc[id] = (acc[id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
        
        return Object.entries(productViews)
          .map(([id, count]) => ({ id: parseInt(id), count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
      },
      
      getPopularCategories: () => {
        const { interactions } = get();
        const categoryViews = interactions
          .filter(i => i.type === 'category_view' && i.targetId)
          .reduce((acc, interaction) => {
            const id = interaction.targetId!;
            acc[id] = (acc[id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
        
        return Object.entries(categoryViews)
          .map(([id, count]) => ({ id, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
      },
      

      
      getUserBehaviorPatterns: () => {
        const { interactions, wishlist, recentlyViewed } = get();
        
        return {
          totalInteractions: interactions.length,
          wishlistSize: wishlist.length,
          recentlyViewedCount: recentlyViewed.length,
          mostActiveHours: getMostActiveHours(interactions),
          preferredCategories: getPreferredCategories(interactions)
        };
      }
    }),
    {
      name: 'user-interactions',
      partialize: (state) => ({
        wishlist: state.wishlist,
        recentlyViewed: state.recentlyViewed,
        interactions: state.interactions.slice(-1000), // Keep last 1000 interactions
        sessionId: state.sessionId
      })
    }
  )
);

// Helper functions
function getMostActiveHours(interactions: UserInteraction[]) {
  const hourCounts = new Array(24).fill(0);
  interactions.forEach(interaction => {
    const hour = new Date(interaction.timestamp).getHours();
    hourCounts[hour]++;
  });
  
  return hourCounts.map((count, hour) => ({ hour, count }));
}

function getPreferredCategories(interactions: UserInteraction[]) {
  const categoryCounts = interactions
    .filter(i => i.type === 'category_view' && i.targetId)
    .reduce((acc, interaction) => {
      const categoryId = interaction.targetId!;
      acc[categoryId] = (acc[categoryId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
  return Object.entries(categoryCounts)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count);
}


