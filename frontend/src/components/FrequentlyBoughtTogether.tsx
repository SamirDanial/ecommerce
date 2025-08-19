import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ImageWithPlaceholder } from './ui/image-with-placeholder';
import { ShoppingCart, Package, Check, Zap } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useUserInteractionStore } from '../stores/userInteractionStore';
import { useCurrency } from '../contexts/CurrencyContext';
import { Product } from '../types';
import RatingDisplay from './ui/rating-display';
import { getImageUrl } from '../utils/productUtils';

interface FrequentlyBoughtTogetherProps {
  currentProduct: Product;
  relatedProducts: Product[];
}

interface BundleItem {
  product: Product;
  quantity: number;
  isSelected: boolean;
}

const FrequentlyBoughtTogether: React.FC<FrequentlyBoughtTogetherProps> = ({
  currentProduct,
  relatedProducts
}) => {
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [bundleItems, setBundleItems] = useState<BundleItem[]>([]);
  
  const { addToCart } = useCartStore();
  const { addInteraction } = useUserInteractionStore();
  const { formatPrice } = useCurrency();

  // Generate frequently bought together items
  React.useEffect(() => {
    if (relatedProducts.length > 0) {
      // Create bundle items with quantities and selection state
      const bundle = relatedProducts.slice(0, 4).map(product => ({
        product,
        quantity: 1,
        isSelected: false
      }));
      setBundleItems(bundle);
    }
  }, [relatedProducts]);

  const handleItemToggle = (productId: number) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });

    setBundleItems(prev => 
      prev.map(item => 
        item.product.id === productId 
          ? { ...item, isSelected: !item.isSelected }
          : item
      )
    );
  };

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setBundleItems(prev => 
      prev.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const calculateBundlePrice = () => {
    let total = 0;
    bundleItems.forEach(item => {
      if (selectedItems.has(item.product.id)) {
        total += (item.product.price * item.quantity);
      }
    });
    return total;
  };

  const calculateSavings = () => {
    const bundlePrice = calculateBundlePrice();
    const originalPrice = bundleItems.reduce((total, item) => {
      if (selectedItems.has(item.product.id)) {
        return total + (item.product.comparePrice || item.product.price);
      }
      return total;
    }, 0);
    
    return Math.max(0, originalPrice - bundlePrice);
  };

  const handleAddBundleToCart = () => {
    const selectedBundle = bundleItems.filter(item => selectedItems.has(item.product.id));
    
    // Add each selected item to cart
    selectedBundle.forEach(item => {
      const quantity = 1; // itemQuantities[item.product.id] || 1; // This line was removed
      addToCart(item.product, quantity, undefined, undefined, item.product.images?.[0]?.url);
      
      // Track interaction
      addInteraction({
        type: 'cart_add',
        targetId: item.product.id.toString(),
        targetType: 'product',
        data: { 
          productName: item.product.name, 
          quantity,
          context: 'bundle_purchase'
        }
      });
    });
    
    // Success indication (no alert)
    // You could add a toast notification here later
  };

  const getRandomDiscount = () => {
    const discounts = [5, 10, 15, 20];
    return discounts[Math.floor(Math.random() * discounts.length)];
  };

  if (bundleItems.length === 0) {
    return null;
  }

  const selectedCount = selectedItems.size;
  const bundlePrice = calculateBundlePrice();
  const savings = calculateSavings();
  const discount = getRandomDiscount();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-lg text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <span>Frequently Bought Together</span>
          </div>
          {selectedCount > 0 && (
            <Badge variant="secondary" className="w-fit mx-auto sm:mx-0 sm:ml-2">
              {selectedCount} selected
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground text-center sm:text-left">
          Customers who bought this also purchased these items
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bundle Items */}
        <div className="space-y-3">
          {bundleItems.map((item) => (
            <Card 
              key={item.product.id} 
              className={`relative cursor-pointer transition-all hover:shadow-md ${
                selectedItems.has(item.product.id) 
                  ? 'ring-2 ring-primary ring-offset-2' 
                  : ''
              }`}
              onClick={() => handleItemToggle(item.product.id)}
            >
              <div className="flex flex-col sm:flex-row">
                <div className="relative flex-shrink-0 mb-3 sm:mb-0">
                  <ImageWithPlaceholder
                    src={getImageUrl(item.product)}
                    alt={item.product.name}
                    className="w-full h-48 sm:w-24 sm:h-24 lg:w-32 lg:h-32 object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-t-none"
                    placeholderClassName="w-full h-48 sm:w-24 sm:h-24 lg:w-32 lg:h-32"
                  />
                  {selectedItems.has(item.product.id) && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                  {item.product.comparePrice && item.product.comparePrice > item.product.price && (
                    <Badge variant="destructive" className="absolute top-2 left-2">
                      -{Math.round(((item.product.comparePrice - item.product.price) / item.product.comparePrice) * 100)}%
                    </Badge>
                  )}
                </div>
                
                <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
                  <div>
                    <h4 className="font-medium text-base sm:text-lg line-clamp-2 mb-2">
                      {item.product.name}
                    </h4>
                    
                    <RatingDisplay
                      rating={item.product.averageRating}
                      reviewCount={item.product.reviewCount}
                      size="sm"
                      className="mb-2"
                    />

                    <div className="flex items-center gap-2 mb-2">
                      {item.product.comparePrice && item.product.comparePrice > item.product.price ? (
                        <>
                          <span className="font-semibold text-primary text-base sm:text-lg">
                            {formatPrice(item.product.price)}
                          </span>
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(item.product.comparePrice)}
                          </span>
                        </>
                      ) : (
                        <span className="font-semibold text-primary text-base sm:text-lg">
                          {formatPrice(item.product.price)}
                        </span>
                      )}
                    </div>
                  </div>

                  {selectedItems.has(item.product.id) && (
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuantityChange(item.product.id, item.quantity - 1);
                        }}
                      >
                        -
                      </Button>
                      <span className="text-sm font-medium min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuantityChange(item.product.id, item.quantity + 1);
                        }}
                      >
                        +
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Bundle Summary */}
        {selectedCount > 0 && (
          <>
            <Separator />
            <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <h4 className="font-semibold text-center sm:text-left">Bundle Summary</h4>
                <Badge variant="outline" className="text-green-600 border-green-600 w-fit mx-auto sm:mx-0">
                  Save {formatPrice(savings)}
                </Badge>
              </div>
              
              <div className="space-y-2 mb-4">
                {bundleItems
                  .filter(item => selectedItems.has(item.product.id))
                  .map(item => (
                    <div key={item.product.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm gap-1 sm:gap-0">
                      <span className="flex items-center gap-2">
                        <span className="truncate">{item.product.name}</span>
                        {item.quantity > 1 && (
                          <Badge variant="secondary" className="text-xs">
                            x{item.quantity}
                          </Badge>
                        )}
                      </span>
                      <span className="font-medium text-right sm:text-left">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))
                }
              </div>

              <div className="border-t pt-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <span className="font-semibold text-center sm:text-left">Bundle Total:</span>
                  <span className="font-semibold text-lg text-primary text-center sm:text-right">
                    {formatPrice(bundlePrice)}
                  </span>
                </div>
                
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                  <Zap className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium text-center sm:text-left">
                    Get {discount}% off when you buy together!
                  </span>
                </div>

                <Button 
                  onClick={handleAddBundleToCart}
                  className="w-full h-12 sm:h-10"
                  size="lg"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                                          <span className="hidden sm:inline">Add Bundle to Cart - Save {formatPrice(savings)}</span>
                        <span className="sm:hidden">Add Bundle - Save {formatPrice(savings)}</span>
                </Button>
              </div>
            </div>
          </>
        )}


      </CardContent>
    </Card>
  );
};

export default FrequentlyBoughtTogether;
