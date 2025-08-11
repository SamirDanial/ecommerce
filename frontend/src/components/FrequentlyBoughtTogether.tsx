import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { ImageWithPlaceholder } from './ui/image-with-placeholder';
import { Star, Package, ShoppingCart, Check, Zap } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useUserInteractionStore } from '../stores/userInteractionStore';
import { Product } from '../types';

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
  const [itemQuantities, setItemQuantities] = useState<Record<number, number>>({});
  
  const { addToCart } = useCartStore();
  const { addInteraction } = useUserInteractionStore();

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
      const quantity = itemQuantities[item.product.id] || 1;
      addToCart(item.product, quantity);
      
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
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5 text-blue-600" />
          Frequently Bought Together
          {selectedCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selectedCount} selected
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Customers who bought this also purchased these items
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bundle Items */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <div className="relative">
                <ImageWithPlaceholder
                  src={item.product.images && item.product.images.length > 0 ? item.product.images[0].url : ''}
                  alt={item.product.name}
                  className="w-full h-32 object-cover rounded-t-lg"
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
              
              <CardContent className="p-3">
                <h4 className="font-medium text-sm line-clamp-2 mb-2">
                  {item.product.name}
                </h4>
                
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(item.product.averageRating || 0) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({item.product.reviewCount || 0})
                  </span>
                </div>

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

                {selectedItems.has(item.product.id) && (
                  <div className="flex items-center gap-2">
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
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bundle Summary */}
        {selectedCount > 0 && (
          <>
            <Separator />
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Bundle Summary</h4>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Save ${savings.toFixed(2)}
                </Badge>
              </div>
              
              <div className="space-y-2 mb-4">
                {bundleItems
                  .filter(item => selectedItems.has(item.product.id))
                  .map(item => (
                    <div key={item.product.id} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span>{item.product.name}</span>
                        {item.quantity > 1 && (
                          <Badge variant="secondary" className="text-xs">
                            x{item.quantity}
                          </Badge>
                        )}
                      </span>
                      <span className="font-medium">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))
                }
              </div>

              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold">Bundle Total:</span>
                  <span className="font-semibold text-lg text-primary">
                    ${bundlePrice.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">
                    Get {discount}% off when you buy together!
                  </span>
                </div>

                <Button 
                  onClick={handleAddBundleToCart}
                  className="w-full"
                  size="lg"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add Bundle to Cart - Save ${savings.toFixed(2)}
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
