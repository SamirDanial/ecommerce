import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Heart } from 'lucide-react';
import { useClerkAuth } from '../hooks/useClerkAuth';
import { useWishlistStore } from '../stores/wishlistStore';
import LoginPopup from './LoginPopup';
import { toast } from 'sonner';

interface WishlistButtonProps {
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number;
    images?: { url: string; alt?: string }[];
  };
  size?: 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ 
  product, 
  size = 'icon', 
  variant = 'outline',
  className = ''
}) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  
  const { isAuthenticated, getToken } = useClerkAuth();
  const { 
    addItem, 
    removeItem, 
    checkWishlistStatus, 
    syncWithDatabase,
    items 
  } = useWishlistStore();

  // Memoize the check status function to prevent infinite loops
  const checkStatus = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const token = await getToken();
        if (token) {
          const status = await checkWishlistStatus(product.id, token);
          setIsInWishlist(status);
        }
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      }
    } else {
      // For unauthenticated users, check local state
      setIsInWishlist(items.some(item => item.productId === product.id));
    }
  }, [isAuthenticated, product.id, items, checkWishlistStatus, getToken]);

  // Memoize the sync function to prevent infinite loops
  const syncWishlist = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const token = await getToken();
        if (token) {
          await syncWithDatabase(token);
        }
      } catch (error) {
        console.error('Error syncing wishlist:', error);
      }
    }
  }, [isAuthenticated, syncWithDatabase, getToken]);

  // Check if product is in wishlist on mount and when items change
  useEffect(() => {
    // Temporarily disabled to prevent infinite loops
    // checkStatus();
    
    // Simple local state check for now
    if (!isAuthenticated) {
      setIsInWishlist(false);
    } else {
      setIsInWishlist(items.some(item => item.productId === product.id));
    }
  }, [isAuthenticated, product.id, items]);

  // Sync wishlist with database when user authenticates
  useEffect(() => {
    // Temporarily disabled to prevent infinite loops
    // syncWishlist();
  }, []);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      setShowLoginPopup(true);
      return;
    }

    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      if (isInWishlist) {
        await removeItem(product.id, token);
        toast.success('Removed from wishlist');
      } else {
        await addItem(product, token);
        toast.success('Added to wishlist');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={`transition-all duration-200 hover:scale-105 ${
          isInWishlist 
            ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' 
            : ''
        } ${className}`}
        onClick={handleWishlistToggle}
        disabled={isLoading}
        aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart 
          className={`h-4 w-4 transition-all duration-200 ${
            isInWishlist 
              ? 'fill-current' 
              : ''
          }`}
        />
      </Button>

      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        message={`Sign in to add "${product.name}" to your wishlist`}
      />
    </>
  );
};

export default WishlistButton;
