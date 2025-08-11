import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Heart, Trash2 } from 'lucide-react';
import { useUserInteractionStore } from '../stores/userInteractionStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useClerkAuth } from '../hooks/useClerkAuth';
import { Separator } from '../components/ui/separator';
import { ImageWithPlaceholder } from '../components/ui/image-with-placeholder';
import { toast } from 'sonner';

const Wishlist: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { addInteraction } = useUserInteractionStore();
  const { 
    items, 
    isLoading, 
    error, 
    removeItem, 
    clearWishlist,
    syncWithDatabase 
  } = useWishlistStore();
  const { isAuthenticated, getToken } = useClerkAuth();

  // Memoize the load wishlist function to prevent infinite loops
  const loadWishlist = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const token = await getToken();
        if (token) {
          await syncWithDatabase(token);
        }
      } catch (error) {
        console.error('Error loading wishlist:', error);
      }
    }
  }, [isAuthenticated, syncWithDatabase, getToken]);

  // Load wishlist when component mounts and user is authenticated
  useEffect(() => {
    // Temporarily disabled to prevent infinite loops
    // loadWishlist();
  }, []);

  // Track page view
  useEffect(() => {
    addInteraction({
      type: 'page_view',
      targetType: 'page',
      data: { path: '/wishlist', name: 'Wishlist' }
    });
  }, [addInteraction]);

  const handleRemoveFromWishlist = async (productId: number) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to manage your wishlist');
      return;
    }

    try {
      const token = await getToken();
      if (token) {
        await removeItem(productId, token);
        toast.success('Item removed from wishlist');
      }
    } catch (error) {
      toast.error('Failed to remove item from wishlist');
    }
  };

  const handleClearAll = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to manage your wishlist');
      return;
    }

    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      try {
        const token = await getToken();
        if (token) {
          await clearWishlist(token);
          toast.success('Wishlist cleared');
        }
      } catch (error) {
        toast.error('Failed to clear wishlist');
      }
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
        <div className="text-center py-16">
          <Heart className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-4">Sign In to View Your Wishlist</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Create an account or sign in to save your favorite products and build your wishlist.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/login">
              <Button size="lg">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <Heart className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-4">Error Loading Wishlist</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {error}
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <Heart className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-4">Your Wishlist is Empty</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Start building your wishlist by browsing our products and clicking the heart icon on items you love.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/products">
              <Button size="lg">
                Browse Products
              </Button>
            </Link>
            <Link to="/categories">
              <Button variant="outline" size="lg">
                Explore Categories
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Wishlist</h1>
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          {/* View Mode Toggle */}
          <div className="flex border border-border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-3"
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-3"
            >
              List
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Wishlist Items */}
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
        : 'space-y-4'
      }>
        {items.map((item) => (
          <Card key={item.id} className="group cursor-pointer transition-all hover:shadow-lg">
            <div className="relative overflow-hidden">
              <ImageWithPlaceholder
                src={item.product.images && item.product.images.length > 0 ? item.product.images[0].url : ''}
                alt={item.product.name}
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              {item.product.comparePrice && item.product.comparePrice > item.product.price && (
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
              <Link to={`/products/${item.product.slug}`}>
                <h4 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                  {item.product.name}
                </h4>
              </Link>
              
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {item.product.comparePrice && item.product.comparePrice > item.product.price ? (
                    <>
                      <span className="font-semibold text-primary">
                        ${item.product.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        ${item.product.comparePrice.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="font-semibold text-primary">
                      ${item.product.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Added {formatDate(item.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
