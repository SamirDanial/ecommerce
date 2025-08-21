import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { Card, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithPlaceholder } from './ui/image-with-placeholder';
import WishlistButton from './WishlistButton';
import { useUserInteractionStore } from '../stores/userInteractionStore';
import { useCurrency } from '../contexts/CurrencyContext';
import { Eye, Star } from 'lucide-react';
import RatingDisplay from './ui/rating-display';
import { getImageUrl } from '../utils/productUtils';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToRecentlyViewed } = useUserInteractionStore();
  const { formatPrice } = useCurrency();

  // Get the image URL using the utility function (returns full URL)
  const imageUrl = getImageUrl(product) || '/placeholder-product.jpg';

  const handleProductClick = () => {
    // Track product view
    addToRecentlyViewed(product);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer h-full relative">
      <div className="absolute top-2 right-2 z-10">
        <WishlistButton product={product} size="sm" />
      </div>
      
      <Link to={`/products/${product.slug}`} className="block" onClick={handleProductClick}>
        <div className="overflow-hidden relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl min-h-[200px] flex items-center justify-center">
          <ImageWithPlaceholder
            src={imageUrl}
            alt={product.name}
            className="w-auto h-auto max-w-full max-h-[200px] object-contain object-center hover:scale-105 transition-transform duration-300"
            placeholderClassName="w-auto h-auto max-w-full max-h-[200px]"
          />
          {product.isOnSale && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-xs">
              Sale
            </Badge>
          )}
        </div>
        
        <CardHeader className="pb-2 px-3 sm:px-4">
          <CardTitle className="text-sm sm:text-base line-clamp-2 leading-tight">{product.name}</CardTitle>
          
          {/* Rating Display - Mobile vs Desktop */}
          {/* Mobile: Single star + rating number */}
          <div className="sm:hidden">
            {product.averageRating && product.averageRating > 0 ? (
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-gray-600 font-medium">
                  {product.averageRating.toFixed(1)}
                </span>
                {product.reviewCount && product.reviewCount > 0 && (
                  <span className="text-xs text-gray-500">
                    ({product.reviewCount})
                  </span>
                )}
              </div>
            ) : null}
          </div>
          
          {/* Desktop: Full rating display */}
          <div className="hidden sm:block">
            <RatingDisplay
              rating={product.averageRating}
              reviewCount={product.reviewCount}
              size="md"
            />
          </div>
        </CardHeader>
        <CardFooter className="flex justify-between items-center pt-2 px-3 sm:px-4 pb-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-bold text-primary">
                {formatPrice(product.salePrice || product.price)}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-xs sm:text-sm text-muted-foreground line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>
          </div>
          
          {/* Action Button - Mobile vs Desktop */}
          {/* Mobile: Eye icon */}
          <Button variant="outline" size="sm" className="sm:hidden p-2 h-8 w-8">
            <Eye className="h-4 w-4" />
          </Button>
          
          {/* Desktop: View Details text */}
          <Button variant="outline" size="sm" className="hidden sm:inline-flex">
            View Details
          </Button>
        </CardFooter>
      </Link>
    </Card>
  );
};

export default ProductCard;
