import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useUserInteractionStore } from '../stores/userInteractionStore';
import { useThemeStore } from '../stores/themeStore';
import { useAuthStore } from '../stores/authStore';
import { useClerkAuthStore } from '../stores/clerkAuthStore';

/**
 * Utility function to reset all Zustand stores to their initial state
 * This is useful for testing, debugging, or when you want to clear all app state
 */
export const resetAllStores = () => {
  try {
    // Reset cart store
    useCartStore.getState().clearCart();
    
    // Reset wishlist store
    useWishlistStore.getState().clearWishlist();
    
    // Reset user interaction store
    useUserInteractionStore.getState().clearInteractions();
    
    // Reset theme store to default
    useThemeStore.getState().setTheme('light');
    
    // Reset auth stores
    useAuthStore.getState().logout();
    useClerkAuthStore.getState().logout();
    
    // Clear localStorage for persisted stores
    localStorage.removeItem('cart-store');
    localStorage.removeItem('wishlist-store');
    localStorage.removeItem('theme-store');
    localStorage.removeItem('user-interaction-store');
    localStorage.removeItem('auth-store');
    localStorage.removeItem('clerk-auth-store');
    
    console.log('✅ All stores have been reset successfully');
  } catch (error) {
    console.error('❌ Error resetting stores:', error);
  }
};

/**
 * Reset only data stores (cart, wishlist, interactions) without affecting auth/theme
 */
export const resetDataStores = () => {
  try {
    useCartStore.getState().clearCart();
    useWishlistStore.getState().clearWishlist();
    useUserInteractionStore.getState().clearInteractions();
    
    localStorage.removeItem('cart-store');
    localStorage.removeItem('wishlist-store');
    localStorage.removeItem('user-interaction-store');
    
    console.log('✅ Data stores have been reset successfully');
  } catch (error) {
    console.error('❌ Error resetting data stores:', error);
  }
};
