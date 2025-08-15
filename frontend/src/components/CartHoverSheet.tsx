import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  ShoppingCart, 
  ShoppingBag,
  Plus,
  Minus,
  Trash2
} from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { ImageWithPlaceholder } from './ui/image-with-placeholder';

interface CartHoverSheetProps {
  children: React.ReactNode;
}

const CartHoverSheet: React.FC<CartHoverSheetProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  
  const { 
    items, 
    getTotalItems, 
    getTotal, 
    selectedCurrency,
    updateQuantity,
    removeFromCart
  } = useCartStore();

  const handleMouseEnter = () => {
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    // Small delay to prevent accidental closing when moving to controls
    setTimeout(() => {
      setIsOpen(false);
    }, 100);
  };

  const handleQuantityChange = (item: any, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(item.id, newQuantity, item.selectedColor, item.selectedSize);
    } else {
      removeFromCart(item.id, item.selectedColor, item.selectedSize);
    }
  };

  const handleRemoveItem = (item: any) => {
    removeFromCart(item.id, item.selectedColor, item.selectedSize);
  };

  const handleClick = () => {
    // Navigate to cart page on click
    window.location.href = '/cart';
  };



  const formatPrice = (price: number) => {
    return `${selectedCurrency.symbol}${price.toFixed(2)}`;
  };

  const cartTotal = getTotalItems();
  const total = getTotal();

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div onClick={handleClick}>
        {children}
      </div>
      
      {/* Hover Cart Sheet */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-background border rounded-lg shadow-2xl z-50">
          {/* Header */}
          <div className="p-4 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Shopping Cart</h3>
                {cartTotal > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {cartTotal} {cartTotal === 1 ? 'item' : 'items'}
                  </Badge>
                )}
              </div>
              <Link 
                to="/cart"
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                View All
              </Link>
            </div>
          </div>

          {/* Cart Content - Brief Overview */}
          <div className="max-h-64 overflow-y-auto">
            {cartTotal === 0 ? (
              <div className="p-4 text-center">
                <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Your cart is empty</p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {items.slice(0, 3).map((item) => (
                  <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} className="flex gap-2 p-2 bg-muted/30 rounded">
                    {/* Product Image */}
                    <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <ImageWithPlaceholder
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted flex items-center justify-center">
                          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs truncate">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuantityChange(item, item.quantity - 1);
                          }}
                          className="h-5 w-5 p-0 text-xs"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-xs font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuantityChange(item, item.quantity + 1);
                          }}
                          className="h-5 w-5 p-0 text-xs"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(item);
                        }}
                        className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {items.length > 3 && (
                  <div className="text-center text-xs text-muted-foreground py-2">
                    +{items.length - 3} more items
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Simple Total */}
          {cartTotal > 0 && (
            <>
              <Separator />
              <div className="p-3 text-center">
                <p className="text-sm font-medium">
                  Total: {formatPrice(total)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Click cart icon to view full cart
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CartHoverSheet;
