import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from './ui/card';
import { Heart, X } from 'lucide-react';
import { ImageWithPlaceholder } from './ui/image-with-placeholder';
import { useWishlistStore } from '../stores/wishlistStore';
import { useClerkAuth } from '../hooks/useClerkAuth';

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
  const { items, removeItem } = useWishlistStore();
  const { isAuthenticated, getToken } = useClerkAuth();

  const handleMouseEnter = () => {
    if (isAuthenticated && items.length > 0) {
      // Add a small delay to prevent accidental triggers
      const timeout = setTimeout(() => {
        setIsHovered(true);
      }, 300);
      setHoverTimeout(timeout);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsHovered(false);
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
    >
      {children}
      
      {/* Hover Overlay */}
      {isHovered && (
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
              ? 'border-t-4 border-t-background' 
              : 'border-b-4 border-b-background'
          }`} />
          
          {/* Content */}
          <Card className="shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  Wishlist ({items.length})
                </h3>
                <Link 
                  to="/wishlist" 
                  className="text-xs text-primary hover:underline"
                  onClick={() => setIsHovered(false)}
                >
                  View All
                </Link>
              </div>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {items.slice(0, 4).map((item) => (
                <div key={item.id} className="p-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <ImageWithPlaceholder
                        src={item.product?.images && Array.isArray(item.product.images) && item.product.images.length > 0 
                          ? item.product.images[0].url 
                          : '/placeholder-product.jpg'
                        }
                        alt={item.product?.name || 'Product'}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/products/${item.product?.slug || 'unknown'}`}
                        className="block"
                        onClick={() => setIsHovered(false)}
                      >
                        <h4 className="text-sm font-medium line-clamp-2 hover:text-primary transition-colors">
                          {item.product?.name || 'Unknown Product'}
                        </h4>
                      </Link>
                      
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-semibold text-primary">
                          ${typeof item.product?.price === 'number' ? item.product.price.toFixed(2) : '0.00'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveItem(item.productId);
                      }}
                      className="flex-shrink-0 p-1 hover:bg-destructive/10 rounded-full transition-colors group"
                      title="Remove from wishlist"
                    >
                      <X className="h-3 w-3 text-muted-foreground group-hover:text-destructive transition-colors" />
                    </button>
                  </div>
                </div>
              ))}
              
              {items.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  <Heart className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm">Your wishlist is empty</p>
                </div>
              )}
            </div>
            
            {items.length > 4 && (
              <div className="p-3 border-t border-border bg-muted/30">
                <p className="text-xs text-muted-foreground text-center">
                  +{items.length - 4} more items
                </p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default WishlistHoverOverlay;
