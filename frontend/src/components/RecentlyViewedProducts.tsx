import React from 'react';
import { Clock, X } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithPlaceholder } from './ui/image-with-placeholder';
import { useUserInteractionStore } from '../stores/userInteractionStore';
import { useCurrency } from '../contexts/CurrencyContext';
import { Link } from 'react-router-dom';
import { getFullImageUrl } from '../utils/imageUtils';

export const RecentlyViewedProducts: React.FC = () => {
  const { recentlyViewed, clearRecentlyViewed } = useUserInteractionStore();
  const { formatPrice } = useCurrency();

  if (recentlyViewed.length === 0) {
    return null;
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  return (
    <div className="bg-muted/30 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Recently Viewed</h3>
          <Badge variant="secondary" className="ml-2">
            {recentlyViewed.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearRecentlyViewed}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {recentlyViewed.slice(0, 6).map((product) => (
          <Link
            key={`${product.id}-${product.viewedAt}`}
            to={`/products/${product.slug}`}
            className="group"
          >
            <Card className="overflow-hidden transition-all hover:shadow-lg hover:scale-105">
              <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl min-h-[120px] flex items-center justify-center">
                <ImageWithPlaceholder
                  src={product.image ? getFullImageUrl(product.image) : ''}
                  alt={product.name}
                  className="w-auto h-auto max-w-full max-h-[120px] object-contain object-center group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs bg-background/80">
                    {formatTimeAgo(product.viewedAt)}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-3">
                <h4 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {product.comparePrice && product.comparePrice > product.price ? (
                      <>
                        <span className="font-semibold text-primary text-sm">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(product.comparePrice)}
                        </span>
                      </>
                    ) : (
                      <span className="font-semibold text-primary text-sm">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {recentlyViewed.length > 6 && (
        <div className="text-center mt-4">
          <Button variant="outline" size="sm">
            View All ({recentlyViewed.length})
          </Button>
        </div>
      )}
    </div>
  );
};
