import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Star } from 'lucide-react';
import { ImageWithPlaceholder } from './ui/image-with-placeholder';
import { WishlistButton } from './WishlistButton';
import { useUserInteractionStore } from '../stores/userInteractionStore';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToRecentlyViewed } = useUserInteractionStore();
  
  // Get the primary image or first image - handle cases where images might not be an array
  const images = Array.isArray(product.images) ? product.images : [];
  const primaryImage = images.find(img => img.isPrimary) || images[0];
  const imageUrl = primaryImage?.url || '/placeholder-product.jpg';

  const handleProductClick = () => {
    // Track product view
    addToRecentlyViewed(product);
  };

  return (
    <Link to={`/products/${product.slug}`} className="block" onClick={handleProductClick}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
        <div className="aspect-square overflow-hidden relative">
          <ImageWithPlaceholder
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            placeholderClassName="w-full h-full"
          />
          {product.isOnSale && (
            <Badge className="absolute top-2 left-2 bg-red-500">
              Sale
            </Badge>
          )}
          <div className="absolute top-2 right-2">
            <WishlistButton product={product} size="sm" />
          </div>
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.averageRating || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({product.reviewCount || 0})
            </span>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-muted-foreground text-sm line-clamp-2">
            {product.shortDescription || product.description}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between items-center pt-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">
                ${product.salePrice || product.price}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-sm text-muted-foreground line-through">
                  ${product.comparePrice}
                </span>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProductCard;
