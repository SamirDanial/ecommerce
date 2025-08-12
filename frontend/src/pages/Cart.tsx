import React, { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Package, Truck, CreditCard, Lock } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { ImageWithPlaceholder } from '../components/ui/image-with-placeholder';
import { useCartStore } from '../stores/cartStore';
import { useUserInteractionStore } from '../stores/userInteractionStore';
import { useClerkAuth } from '../hooks/useClerkAuth';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import { Link, useNavigate } from 'react-router-dom';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    getTotalItems,
    getSubtotal,
    getTotal,
    getSavings
  } = useCartStore();
  
  const { addInteraction } = useUserInteractionStore();
  const { isAuthenticated } = useClerkAuth();
  const { navigateToLogin } = useAuthRedirect();
  const [isClearing, setIsClearing] = useState(false);

  // Use actual authentication state
  const isLoggedIn = isAuthenticated;

  // Track page view
  React.useEffect(() => {
    addInteraction({
      type: 'page_view',
      targetType: 'page',
      data: { path: '/cart', name: 'Cart' }
    });
  }, [addInteraction]);



  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <ShoppingCart className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <div className="space-y-4">
            <Button size="lg" onClick={() => navigate('/')} className="w-full">
              Continue Shopping
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/categories')} className="w-full">
              Browse Categories
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (item: any, newQuantity: number) => {
    updateQuantity(item.id, newQuantity, item.selectedColor, item.selectedSize);
    
    // Track interaction
    addInteraction({
      type: 'cart_add',
      targetId: item.id.toString(),
      targetType: 'product',
      data: { 
        productName: item.name, 
        quantity: newQuantity,
        action: newQuantity > item.quantity ? 'increase' : 'decrease'
      }
    });
  };

  const handleRemoveItem = (item: any) => {
    removeFromCart(item.id, item.selectedColor, item.selectedSize);
    
    // Track interaction
    addInteraction({
      type: 'cart_remove',
      targetId: item.id.toString(),
      targetType: 'product',
      data: { productName: item.name, quantity: item.quantity }
    });
  };

  const handleClearCart = () => {
    setIsClearing(true);
    clearCart();
    
    // Track interaction
    addInteraction({
      type: 'cart_remove',
      targetType: 'page',
      data: { action: 'clear_all', itemsCount: items.length }
    });
    
    setTimeout(() => setIsClearing(false), 1000);
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      // Track interaction for sign-in attempt
      addInteraction({
        type: 'page_view',
        targetType: 'page',
        data: { action: 'sign_in_required', itemsCount: items.length, total: getTotal() }
      });
      
      // Navigate to login page with return URL
      navigateToLogin('Please sign in to complete your checkout');
      return;
    }

    // Track interaction for checkout
    addInteraction({
      type: 'page_view',
      targetType: 'page',
      data: { action: 'checkout_initiated', itemsCount: items.length, total: getTotal() }
    });
    
    // Checkout functionality will be available once login is implemented
    // navigate('/checkout');
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground">
            {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <Button variant="outline" size="sm" onClick={handleClearCart} disabled={isClearing}>
            <Trash2 className="h-4 w-4 mr-2" />
            {isClearing ? 'Clearing...' : 'Clear Cart'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>
            Continue Shopping
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item, index) => (
              <Card key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <ImageWithPlaceholder 
                        src={item.image || ''} 
                        alt={item.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                      {item.comparePrice && item.comparePrice > item.price && (
                        <Badge variant="destructive" className="absolute -top-2 -right-2 text-xs">
                          {Math.round(((item.comparePrice - item.price) / item.comparePrice) * 100)}% OFF
                        </Badge>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <Link to={`/products/${item.slug}`} className="block">
                            <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors line-clamp-2">
                              {item.name}
                            </h3>
                          </Link>
                          
                          {/* Variants */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {item.selectedColor && (
                              <Badge variant="outline" className="text-xs">
                                Color: {item.selectedColor}
                              </Badge>
                            )}
                            {item.selectedSize && (
                              <Badge variant="outline" className="text-xs">
                                Size: {item.selectedSize}
                              </Badge>
                            )}
                          </div>

                          {/* Price */}
                          <div className="flex items-center gap-2 mb-3">
                            {item.comparePrice && item.comparePrice > item.price ? (
                              <>
                                <span className="font-bold text-primary text-lg">
                                  ${item.price.toFixed(2)}
                                </span>
                                <span className="text-muted-foreground line-through">
                                  ${item.comparePrice.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className="font-bold text-primary text-lg">
                                ${item.price.toFixed(2)}
                              </span>
                            )}
                          </div>

                          {/* Added Date */}
                          <p className="text-xs text-muted-foreground">
                            Added {formatDate(item.addedAt)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex flex-col items-end gap-3">
                          <div className="flex items-center border border-border rounded-lg">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-r-none"
                              onClick={() => handleQuantityChange(item, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="px-3 py-1 text-sm font-medium min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-l-none"
                              onClick={() => handleQuantityChange(item, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Remove Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
              
              {/* Summary Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({getTotalItems()} items)</span>
                  <span>${getSubtotal().toFixed(2)}</span>
                </div>
                
                {getSavings() > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Savings</span>
                    <span>-${getSavings().toFixed(2)}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${getTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button 
                size="lg" 
                className="w-full mb-4" 
                onClick={handleCheckout}
              >
                {isLoggedIn ? 'Proceed to Checkout' : 'Sign In to Checkout'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              {/* Sign In Button (when not logged in) */}
              {!isLoggedIn && (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full mb-4"
                  onClick={() => {
                    addInteraction({
                      type: 'page_view',
                      targetType: 'page',
                      data: { action: 'sign_in_navigation', from: 'cart' }
                    });
                    // Navigate to login page with return URL
                    navigateToLogin('Please sign in to access your account');
                  }}
                >
                  Sign In / Create Account
                </Button>
              )}

              {/* Checkout Guidance */}
              {!isLoggedIn && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800 text-center">
                    Sign in to your account to complete your purchase and save your cart for later.
                  </p>
                </div>
              )}

              {/* Security & Shipping Info */}
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Free shipping on orders over $50</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span>Estimated delivery: 3-5 business days</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mt-6 pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">We accept:</p>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Credit Cards, PayPal, Apple Pay, Google Pay
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Empty State (hidden when items exist) */}
      {items.length === 0 && (
        <div className="text-center py-16">
          <ShoppingCart className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">
            Start shopping to add items to your cart.
          </p>
          <Button size="lg" onClick={() => navigate('/')}>
            Continue Shopping
          </Button>
        </div>
      )}
    </div>
  );
};

export default Cart;
