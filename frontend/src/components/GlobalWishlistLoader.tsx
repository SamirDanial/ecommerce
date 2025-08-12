import React, { useEffect, useRef } from 'react';
import { useClerkAuth } from '../hooks/useClerkAuth';
import { useWishlistStore } from '../stores/wishlistStore';

/**
 * GlobalWishlistLoader component that automatically loads wishlist data
 * when the user is authenticated, regardless of which page they're on.
 * This ensures wishlist data is always available for the header and other components.
 */
const GlobalWishlistLoader: React.FC = () => {
  const { isAuthenticated, getToken } = useClerkAuth();
  const { loadWishlistFromDatabase, isLoading } = useWishlistStore();
  const hasLoadedRef = useRef(false);
  const lastAuthStateRef = useRef(false);

  useEffect(() => {
    const loadWishlistData = async () => {
      // Only load if authenticated and haven't loaded yet, or if auth state changed
      if (isAuthenticated && !isLoading) {
        const authStateChanged = lastAuthStateRef.current !== isAuthenticated;
        const needsLoading = !hasLoadedRef.current || authStateChanged;
        
        if (needsLoading) {
          try {
            const token = await getToken();
            if (token) {
              hasLoadedRef.current = true;
              lastAuthStateRef.current = isAuthenticated;
              await loadWishlistFromDatabase(token);
            }
          } catch (error) {
            console.error('Global wishlist loader error:', error);
            // Reset the flag so we can try again
            hasLoadedRef.current = false;
          }
        }
      }
    };

    loadWishlistData();
  }, [isAuthenticated, getToken, loadWishlistFromDatabase, isLoading]);

  // Reset the loaded flag when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      hasLoadedRef.current = false;
      lastAuthStateRef.current = false;
    }
  }, [isAuthenticated]);

  // This component doesn't render anything visible
  return null;
};

export default GlobalWishlistLoader;
