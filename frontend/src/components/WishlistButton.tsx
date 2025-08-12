import React, { useState, useEffect } from 'react';
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
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  
  const { isAuthenticated, getToken } = useClerkAuth();
  const { items, addItem, removeItem } = useWishlistStore();

  // Check if product is in wishlist
  useEffect(() => {
    if (isAuthenticated) {
      setIsInWishlist(items.some(item => item.productId === product.id));
    } else {
      setIsInWishlist(false);
    }
  }, [isAuthenticated, product.id, items]);

  // Reset state when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setIsInWishlist(false);
      setShowLoginPopup(false);
    }
  }, [isAuthenticated]);

  // Cleanup popup when component unmounts
  useEffect(() => {
    return () => {
      setShowLoginPopup(false);
    };
  }, []);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    // Prevent event from bubbling up to parent elements
    e.stopPropagation();
    e.preventDefault();
    
    if (!isAuthenticated) {
      setShowLoginPopup(true);
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      if (isInWishlist) {
        // Remove from wishlist (both database and local store)
        await removeItem(product.id, token);
        toast.success('Removed from wishlist');
      } else {
        // Add to wishlist (local + database)
        await addItem(product, token);
        toast.success('Added to wishlist');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update wishlist');
    }
  };

  const handleCloseLoginPopup = () => {
    setShowLoginPopup(false);
  };

  // Don't render login popup if not authenticated
  const shouldShowLoginPopup = showLoginPopup && !isAuthenticated;

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

      {/* Login popup rendered via portal at document body level */}
      {shouldShowLoginPopup && (
        <LoginPopup
          isOpen={showLoginPopup}
          onClose={handleCloseLoginPopup}
          message={`Sign in to add "${product.name}" to your wishlist`}
        />
      )}
    </>
  );
};

export default WishlistButton;
