import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { 
  ShoppingCart, 
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useCurrency } from '../contexts/CurrencyContext';
import { ImageWithPlaceholder } from './ui/image-with-placeholder';
import { getFullImageUrl } from '../utils/imageUtils';

interface CartHoverSheetProps {
  children: React.ReactNode;
}

const CartHoverSheet: React.FC<CartHoverSheetProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const { 
    items, 
    getTotalItems, 
    getTotal, 
    updateQuantity,
    removeFromCart
  } = useCartStore();
  
  const { formatPrice, formatConvertedPrice } = useCurrency();
  


  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseEnter = () => {
    if (!isMobile) {
      clearTimeout(timeoutRef.current!);
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 300);
    }
  };

  const handleMobileClick = () => {
    if (isMobile) {
      navigate('/cart');
    }
  };

  const handleDesktopClick = () => {
    if (!isMobile) {
      navigate('/cart');
    }
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

  const handleClose = () => {
    setIsOpen(false);
  };



  const cartTotal = getTotalItems();
  const total = getTotal();
  


  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        if (isMobile) {
          handleMobileClick();
        } else {
          handleDesktopClick();
        }
      }}
    >
      <div>
        {children}
      </div>
      
      {/* Cart Sheet */}
      {isOpen && !isMobile && (
        <div 
          className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Your Cart</h3>
                  <div className="flex items-center space-x-2">
                    <div className="bg-white/20 px-2 py-1 rounded-full">
                      <span className="text-white text-sm font-medium">{cartTotal} items</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Cart Content */}
          <div className="flex-1 overflow-y-auto max-h-96 sm:max-h-64">
            {cartTotal === 0 ? (
              <div className="p-6 sm:p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Your cart is empty</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Start shopping to add items to your cart</p>
                <Link to="/products">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Start Shopping
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {items.slice(0, 3).map((item) => (
                  <div 
                    key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} 
                    className="group p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                  >
                    <div className="flex gap-3">
                      {/* Enhanced Product Image */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 shadow-sm flex items-center justify-center">
                        {item.image ? (
                          <ImageWithPlaceholder
                            src={getFullImageUrl(item.image)}
                            alt={item.name}
                            className="w-auto h-auto max-w-full max-h-[80px] sm:max-h-[80px] object-contain object-center"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                            <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                        )}
                      </div>

                      {/* Enhanced Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {item.selectedColor && (
                            <span className="mr-2 flex items-center gap-1">
                              <span 
                                className="w-3 h-3 rounded-full border border-gray-300" 
                                style={{ backgroundColor: item.selectedColor }}
                              ></span>
                              Color: {item.selectedColor}
                            </span>
                          )}
                          {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                        </p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      {/* Enhanced Quantity Controls */}
                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-700 rounded-xl p-1 border border-gray-200 dark:border-gray-600">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(item, item.quantity - 1);
                            }}
                            className="h-7 w-7 p-0 text-xs hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(item, item.quantity + 1);
                            }}
                            className="h-7 w-7 p-0 text-xs hover:bg-green-50 dark:hover:bg-green-950/20 hover:text-green-600"
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
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all duration-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {items.length > 3 && (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-full border border-blue-200 dark:border-blue-800">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        +{items.length - 3} more items
                      </span>
                      <ArrowRight className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Enhanced Total Section */}
          {cartTotal > 0 && (
            <>
              <Separator className="bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
              <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800/50 dark:to-blue-950/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Total:</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatConvertedPrice(total)}
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/cart" className="flex-1" onClick={handleClose}>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 rounded-xl font-semibold">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      View Full Cart
                    </Button>
                  </Link>
                  
                  <Link to="/checkout" className="flex-1" onClick={handleClose}>
                    <Button variant="outline" className="w-full border-2 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 h-12 rounded-xl font-semibold">
                      Checkout
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
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
