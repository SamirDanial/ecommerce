import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, X } from 'lucide-react';
import { ImageWithPlaceholder } from './ui/image-with-placeholder';
import { useWishlistStore } from '../stores/wishlistStore';
import { useClerkAuth } from '../hooks/useClerkAuth';
import { useCurrency } from '../contexts/CurrencyContext';
import { getImageUrl } from '../utils/productUtils';

interface WishlistHoverOverlayProps {
  children: React.ReactNode;
  position?: 'top' | 'bottom';
  className?: string;
}

const WishlistHoverOverlay: React.FC<WishlistHoverOverlayProps> = ({ 
  children, 
  position = 'bottom',
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { items, removeItem } = useWishlistStore();
  const { isAuthenticated, getToken } = useClerkAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseEnter = () => {
    if (!isMobile && isAuthenticated && items.length > 0) {
      // Add a small delay to prevent accidental triggers
      const timeout = setTimeout(() => {
        setIsHovered(true);
      }, 300);
      setHoverTimeout(timeout);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsHovered(false);
  };

  const handleClick = () => {
    if (isMobile) {
      navigate('/wishlist');
    }
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  const handleRemoveItem = async (productId: number) => {
    try {
      const token = await getToken();
      if (token) {
        await removeItem(productId, token);
      }
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
      
      {/* Hover Overlay - Desktop Only */}
      {isHovered && !isMobile && (
        <div 
          className={`absolute ${
            position === 'top' 
              ? 'bottom-full mb-2' 
              : 'top-full mt-2'
          } right-0 z-50 min-w-80 max-w-96 animate-in fade-in-0 zoom-in-95 duration-200`}
        >
          {/* Arrow */}
          <div className={`absolute ${
            position === 'top' ? 'top-full' : 'bottom-full'
          } right-4 w-0 h-0 border-l-4 border-r-4 border-transparent ${
            position === 'top' 
              ? 'border-t-4 border-t-white dark:border-t-gray-900' 
              : 'border-b-4 border-b-white dark:border-b-gray-900'
          }`} />
          
          {/* Content */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-pink-500 to-red-500 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Your Wishlist</h3>
                    <div className="flex items-center space-x-2">
                      <div className="bg-white/20 px-2 py-1 rounded-full">
                        <span className="text-white text-sm font-medium">{items.length} items</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Link 
                  to="/wishlist" 
                  className="text-white/80 hover:text-white text-sm font-medium hover:underline transition-colors"
                  onClick={() => setIsHovered(false)}
                >
                  View All
                </Link>
              </div>
            </div>
            
            {/* Enhanced Wishlist Content */}
            <div className="max-h-64 overflow-y-auto">
              {items.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-red-100 dark:from-pink-900/30 dark:to-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-pink-500" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Your wishlist is empty</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Start adding products you love</p>
                  <Link to="/products">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105">
                      <span>Start Shopping</span>
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {items.slice(0, 4).map((item) => (
                    <div key={item.id} className="group p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        {/* Enhanced Product Image */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 shadow-sm flex items-center justify-center">
                          <ImageWithPlaceholder
                            src={item.product ? getImageUrl(item.product) : '/placeholder-product.jpg'}
                            alt={item.product?.name || 'Product'}
                            className="w-auto h-auto max-w-full max-h-[64px] object-contain object-center"
                          />
                        </div>
                        
                        {/* Enhanced Product Info */}
                        <div className="flex-1 min-w-0">
                          <Link 
                            to={`/products/${item.product?.slug || 'unknown'}`}
                            className="block"
                            onClick={() => setIsHovered(false)}
                          >
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                              {item.product?.name || 'Unknown Product'}
                            </h4>
                          </Link>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-pink-600 dark:text-pink-400">
                              {formatPrice(item.product?.price || 0)}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(item.createdAt)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Enhanced Remove Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(item.productId);
                          }}
                          className="flex-shrink-0 p-2 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 rounded-xl transition-all duration-300 group"
                          title="Remove from wishlist"
                        >
                          <X className="h-4 w-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {items.length > 4 && (
                    <div className="text-center py-4">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-50 to-red-50 dark:from-pink-950/20 dark:to-red-950/20 rounded-full border border-pink-200 dark:border-pink-800">
                        <span className="text-sm font-medium text-pink-600 dark:text-pink-400">
                          +{items.length - 4} more items
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Enhanced Footer */}
            {items.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-pink-50 dark:from-gray-800/50 dark:to-pink-950/20 border-t border-gray-200 dark:border-gray-700">
                <Link to="/wishlist" onClick={() => setIsHovered(false)}>
                  <div className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white py-3 px-4 rounded-xl font-semibold text-center transition-all duration-300 transform hover:scale-105">
                    View Full Wishlist
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistHoverOverlay;
