import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Heart, Trash2 } from 'lucide-react';
import { useUserInteractionStore } from '../stores/userInteractionStore';
import { Separator } from '../components/ui/separator';
import { ImageWithPlaceholder } from '../components/ui/image-with-placeholder';

const Wishlist: React.FC = () => {
  const { wishlist, removeFromWishlist } = useUserInteractionStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  if (wishlist.length === 0) {
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

  const handleRemoveFromWishlist = (productId: number) => {
    removeFromWishlist(productId);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      wishlist.forEach(item => removeFromWishlist(item.id));
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Wishlist</h1>
          <p className="text-muted-foreground">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
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
        {wishlist.map((item) => (
          <Card 
            key={item.id} 
            className={`group overflow-hidden transition-all hover:shadow-lg ${
              viewMode === 'list' ? 'flex' : ''
            }`}
          >
            <div className={`relative overflow-hidden ${
              viewMode === 'list' ? 'w-48 h-32' : 'h-48'
            }`}>
              <ImageWithPlaceholder
                src={item.image || ''}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-background/80">
                  Saved {formatDate(item.addedAt)}
                </Badge>
              </div>
            </div>

            <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
              <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {item.name}
              </h3>
              
              <div className="flex items-center gap-2 mb-3">
                {item.comparePrice && item.comparePrice > item.price ? (
                  <>
                    <span className="font-bold text-primary text-lg">
                      ${item.price.toFixed(2)}
                    </span>
                    <span className="text-muted-foreground line-through">
                      ${item.comparePrice.toFixed(2)}
                    </span>
                    <Badge variant="destructive" className="ml-auto">
                      {Math.round(((item.comparePrice - item.price) / item.comparePrice) * 100)}% OFF
                    </Badge>
                  </>
                ) : (
                  <span className="font-bold text-primary text-lg">
                    ${item.price.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Link to={`/products/${item.slug}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    {/* <Eye className="h-4 w-4 mr-2" /> */}
                    View Details
                  </Button>
                </Link>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFromWishlist(item.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Section */}
      <Separator className="my-12" />
      
      <div className="bg-muted/30 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Your Wishlist Insights</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-2">{wishlist.length}</div>
            <div className="text-sm text-muted-foreground">Total Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-2">
              ${wishlist.reduce((total, item) => total + item.price, 0).toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Total Value</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-2">
              {wishlist.filter(item => item.comparePrice && item.comparePrice > item.price).length}
            </div>
            <div className="text-sm text-muted-foreground">On Sale</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
