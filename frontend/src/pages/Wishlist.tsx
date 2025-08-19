import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Heart, Trash2, RefreshCw } from 'lucide-react';
import { useUserInteractionStore } from '../stores/userInteractionStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useClerkAuth } from '../hooks/useClerkAuth';
import { useCurrency } from '../contexts/CurrencyContext';
import { ImageWithPlaceholder } from '../components/ui/image-with-placeholder';
import { toast } from 'sonner';
import { getImageUrl } from '../utils/productUtils';

const Wishlist: React.FC = () => {
  const [viewMode] = useState<'grid' | 'list'>('grid');
  
  const { addInteraction } = useUserInteractionStore();
  const { 
    items, 
    removeItem, 
    clearWishlist,
    forceRefresh,
    isLoading 
  } = useWishlistStore();
  const { isAuthenticated, getToken } = useClerkAuth();
  const { formatPrice } = useCurrency();

  // Track page view
  useEffect(() => {
    addInteraction({
      type: 'page_view',
      targetType: 'page',
      data: { path: '/wishlist', name: 'Wishlist' }
    });
  }, [addInteraction]);

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      const token = await getToken();
      if (token) {
        await removeItem(productId, token);
        toast.success('Item removed from wishlist');
      } else {
        toast.error('Authentication required');
      }
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
      toast.error('Failed to remove item from wishlist');
    }
  };

  const handleClearWishlist = async () => {
    if (!window.confirm('Are you sure you want to clear your entire wishlist? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = await getToken();
      if (token) {
        await clearWishlist(token);
        toast.success('Wishlist cleared successfully');
      } else {
        toast.error('Authentication required');
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error('Failed to clear wishlist');
    }
  };

  const handleRefreshWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to refresh your wishlist');
      return;
    }
    try {
      const token = await getToken();
      if (token) {
        // Force reload wishlist data
        await forceRefresh(token);
        toast.success('Wishlist refreshed successfully!');
      }
    } catch (error) {
      console.error('Error refreshing wishlist:', error);
      toast.error('Failed to refresh wishlist.');
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your wishlist</h1>
          <p className="text-gray-600">You need to be logged in to access your wishlist.</p>
        </div>
      </div>
    );
  }

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your Wishlist</h1>
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading your wishlist...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Your Wishlist</h1>
        <div className="flex gap-2">
          <Button 
            onClick={handleRefreshWishlist}
            variant="outline"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {items.length > 0 && (
            <Button onClick={handleClearWishlist} variant="destructive">
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Wishlist Items */}
      {items.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Your Wishlist is Empty</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Start building your wishlist by browsing our products and adding items you love.
          </p>
          <Link to="/products">
            <Button size="lg">
              Browse Products
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {items
              .map((item) => {
                // Skip items with malformed product data
                if (!item.product || typeof item.product !== 'object') {
                  console.warn('Skipping item with malformed product data:', item);
                  return null;
                }
                
                return (
                  <Card key={item.id} className="group cursor-pointer transition-all hover:shadow-lg">
                    <div className="relative overflow-hidden">
                      <ImageWithPlaceholder
                        src={item.product ? getImageUrl(item.product) : ''}
                        alt={item.product?.name || 'Product'}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {item.product?.comparePrice && 
                       typeof item.product.comparePrice === 'number' && 
                       typeof item.product.price === 'number' &&
                       item.product.comparePrice > item.product.price && (
                        <Badge variant="destructive" className="absolute top-2 left-2">
                          Sale
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0 bg-background/80 hover:bg-background"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromWishlist(item.productId);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    
                    <CardContent className="p-4">
                      <Link to={`/products/${item.product?.slug || 'unknown'}`}>
                        <h4 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                          {item.product?.name || 'Unknown Product'}
                        </h4>
                      </Link>
                      
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {item.product?.comparePrice && 
                           typeof item.product.comparePrice === 'number' && 
                           typeof item.product.price === 'number' &&
                           item.product.comparePrice > item.product.price ? (
                            <>
                              <span className="font-semibold text-primary">
                                {formatPrice(item.product.price)}
                              </span>
                              <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(item.product.comparePrice)}
                              </span>
                            </>
                          ) : (
                            <span className="font-semibold text-primary">
                              {formatPrice(item.product?.price || 0)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Added {formatDate(item.createdAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
              .filter(Boolean) // Remove null items
            }
          </div>
        </>
      )}
    </div>
  );
};

export default Wishlist;
