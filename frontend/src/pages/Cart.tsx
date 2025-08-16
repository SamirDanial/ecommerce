import React, { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Package, Truck, CreditCard, Lock, Heart, Share2, ArrowLeft, Star } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-2xl mx-auto">
            {/* Enhanced Empty Cart Icon */}
            <div className="relative mb-12">
              <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                <ShoppingCart className="h-16 w-16 sm:h-20 sm:w-20 text-white drop-shadow-lg" />
              </div>
              
              {/* Floating Elements - Hidden on very small screens */}
              <div className="hidden sm:block absolute -top-4 -right-4 w-8 h-8 sm:w-12 sm:h-12 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.5s' }}>
                <span className="text-sm sm:text-lg font-bold text-white">0</span>
              </div>
              <div className="hidden sm:block absolute -bottom-4 -left-4 w-6 h-6 sm:w-8 sm:h-8 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
              <div className="hidden sm:block absolute top-1/2 -right-8 sm:-right-12 w-4 h-4 sm:w-6 sm:h-6 bg-pink-400 rounded-full animate-pulse"></div>
              <div className="hidden sm:block absolute top-1/2 -left-8 sm:-left-12 w-3 h-3 sm:w-4 sm:h-4 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            </div>

            {/* Enhanced Text Content */}
            <div className="mb-12">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 px-4">
                Your cart is empty
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-6 leading-relaxed max-w-lg mx-auto px-4">
                Looks like you haven't added any items to your cart yet. 
                <span className="block mt-2 text-base sm:text-lg font-medium text-gray-700">
                  Start exploring our amazing products!
                </span>
              </p>
              
              {/* Decorative Line */}
              <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto rounded-full"></div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="space-y-4 sm:space-y-6 max-w-md mx-auto px-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/')} 
                className="w-full h-12 sm:h-14 text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border-0"
              >
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                Continue Shopping
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate('/categories')} 
                className="w-full h-12 sm:h-14 text-lg sm:text-xl font-semibold border-2 sm:border-3 border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-all duration-300 transform hover:scale-105 bg-white/80 backdrop-blur-sm"
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full"></div>
                </div>
                Browse Categories
              </Button>
            </div>

            {/* Additional Features Section */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="p-4 sm:p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Discover New Products</h3>
                <p className="text-xs sm:text-sm text-gray-600">Explore our latest arrivals and trending items</p>
              </div>
              
              <div className="p-4 sm:p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Save to Wishlist</h3>
                <p className="text-xs sm:text-sm text-gray-600">Save items you love for later purchase</p>
              </div>
              
              <div className="p-4 sm:p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 sm:col-span-2 lg:col-span-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Fast Shipping</h3>
                <p className="text-xs sm:text-sm text-gray-600">Free shipping on orders over $50</p>
              </div>
            </div>
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
    console.log('Checkout button clicked!');
    console.log('isLoggedIn:', isLoggedIn);
    console.log('items count:', items.length);
    
    if (!isLoggedIn) {
      console.log('User not logged in, redirecting to login...');
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

    console.log('User logged in, navigating to checkout...');
    // Track interaction for checkout
    addInteraction({
      type: 'page_view',
      targetType: 'page',
      data: { action: 'checkout_initiated', itemsCount: items.length, total: getTotal() }
    });
    
    // Navigate to checkout page
    navigate('/checkout');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shop
            </Button>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Shopping Cart</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-full">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
                  </span>
                </div>
                {getSavings() > 0 && (
                  <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-full">
                    <span className="text-sm font-medium text-green-800">
                      Save ${getSavings().toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearCart} 
                disabled={isClearing}
                className="h-10 px-4 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isClearing ? 'Clearing...' : 'Clear Cart'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/')}
                className="h-10 px-4 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 xl:gap-8">
          {/* Enhanced Cart Items */}
          <div className="xl:col-span-2">
            <div className="space-y-4">
              {items.map((item, index) => (
                                <Card key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                       {/* Enhanced Product Image - Larger for T-shirts */}
                       <div className="relative w-full sm:w-40 h-64 sm:h-48 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                         <ImageWithPlaceholder 
                           src={item.image || ''} 
                           alt={item.name}
                           className="w-full h-full object-contain sm:object-cover"
                         />
                         {item.comparePrice && item.comparePrice > item.price && (
                           <Badge variant="destructive" className="absolute top-2 left-2 text-xs font-semibold px-2 py-1">
                             {Math.round(((item.comparePrice - item.price) / item.comparePrice) * 100)}% OFF
                           </Badge>
                         )}
                       </div>

                      {/* Enhanced Product Details */}
                      <div className="flex-1 min-w-0">
                                                 <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                           <div className="flex-1 min-w-0 space-y-3">
                            <Link to={`/products/${item.slug}`} className="block group">
                              <h3 className="font-semibold text-lg sm:text-xl mb-3 text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                                {item.name}
                              </h3>
                            </Link>
                            
                            {/* Enhanced Variants */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {item.selectedColor && (
                                <Badge variant="outline" className="text-xs px-3 py-1 border-blue-200 text-blue-700 bg-blue-50">
                                  Color: {item.selectedColor}
                                </Badge>
                              )}
                              {item.selectedSize && (
                                <Badge variant="outline" className="text-xs px-3 py-1 border-green-200 text-green-700 bg-green-50">
                                  Size: {item.selectedSize}
                                </Badge>
                              )}
                            </div>

                            {/* Enhanced Price */}
                            <div className="flex items-center gap-3 mb-4">
                              {item.comparePrice && item.comparePrice > item.price ? (
                                <>
                                  <span className="font-bold text-2xl text-blue-600">
                                    ${item.price.toFixed(2)}
                                  </span>
                                  <span className="text-gray-500 line-through text-lg">
                                    ${item.comparePrice.toFixed(2)}
                                  </span>
                                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                    Save ${(item.comparePrice - item.price).toFixed(2)}
                                  </Badge>
                                </>
                              ) : (
                                <span className="font-bold text-2xl text-blue-600">
                                  ${item.price.toFixed(2)}
                                </span>
                              )}
                            </div>

                            {/* Enhanced Added Date */}
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                              Added {formatDate(item.addedAt)}
                            </p>
                          </div>

                                                     {/* Enhanced Quantity Controls */}
                           <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
                             <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 className="h-12 w-12 sm:h-10 sm:w-10 p-0 rounded-none hover:bg-gray-100 transition-colors"
                                 onClick={() => handleQuantityChange(item, item.quantity - 1)}
                                 disabled={item.quantity <= 1}
                               >
                                 <Minus className="h-5 w-5 sm:h-4 sm:w-4" />
                               </Button>
                               <span className="px-4 py-2 text-base sm:text-sm font-semibold min-w-[4rem] sm:min-w-[3rem] text-center bg-gray-50">
                                 {item.quantity}
                               </span>
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 className="h-12 w-12 sm:h-10 sm:w-10 p-0 rounded-none hover:bg-gray-100 transition-colors"
                                 onClick={() => handleQuantityChange(item, item.quantity + 1)}
                               >
                                 <Plus className="h-5 w-5 sm:h-4 sm:w-4" />
                               </Button>
                             </div>

                             {/* Enhanced Action Buttons */}
                             <div className="flex items-center gap-3 sm:gap-2">
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 className="h-12 w-12 sm:h-10 sm:w-10 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                                 onClick={() => handleRemoveItem(item)}
                               >
                                 <Trash2 className="h-5 w-5 sm:h-4 sm:w-4" />
                               </Button>
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 className="h-12 w-12 sm:h-10 sm:w-10 p-0 text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all duration-200"
                               >
                                 <Heart className="h-5 w-5 sm:h-4 sm:w-4" />
                               </Button>
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 className="h-12 w-12 sm:h-10 sm:w-10 p-0 text-gray-400 hover:text-green-500 hover:bg-green-50 transition-all duration-200"
                               >
                                 <Share2 className="h-5 w-5 sm:h-4 sm:w-4" />
                               </Button>
                             </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Enhanced Order Summary */}
          <div className="xl:col-span-1">
            <Card className="sticky top-8 border-0 shadow-lg bg-white">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                  Order Summary
                </h2>
                
                {/* Enhanced Summary Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Subtotal ({getTotalItems()} items)</span>
                    <span className="font-semibold text-gray-900">${getSubtotal().toFixed(2)}</span>
                  </div>
                  
                  {getSavings() > 0 && (
                    <div className="flex justify-between items-center py-2 bg-green-50 px-3 rounded-lg">
                      <span className="text-green-700 font-medium">Total Savings</span>
                      <span className="font-bold text-green-700">-${getSavings().toFixed(2)}</span>
                    </div>
                  )}
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between items-center py-3 bg-blue-50 px-4 rounded-lg">
                    <span className="text-xl font-bold text-blue-900">Total</span>
                    <span className="text-2xl font-bold text-blue-900">${getTotal().toFixed(2)}</span>
                  </div>
                </div>

                {/* Enhanced Checkout Button */}
                <Button 
                  size="lg" 
                  className="w-full h-14 text-lg font-semibold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300" 
                  onClick={handleCheckout}
                >
                  {isLoggedIn ? 'Proceed to Checkout' : 'Sign In to Checkout'}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>

                {/* Enhanced Guest Checkout */}
                {!isLoggedIn && (
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full h-12 text-base font-semibold mb-4 border-2 border-gray-300 hover:bg-gray-50 transition-all duration-200"
                    onClick={() => navigate('/checkout')}
                  >
                    Continue as Guest
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}

                {/* Enhanced Sign In Button */}
                {!isLoggedIn && (
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full h-12 text-base font-semibold mb-4 border-2 border-blue-300 text-blue-600 hover:bg-blue-50 transition-all duration-200"
                    onClick={() => {
                      addInteraction({
                        type: 'page_view',
                        targetType: 'page',
                        data: { action: 'sign_in_navigation', from: 'cart' }
                      });
                      navigateToLogin('Please sign in to access your account');
                    }}
                  >
                    Sign In / Create Account
                  </Button>
                )}

                {/* Enhanced Checkout Guidance */}
                {!isLoggedIn && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        Sign in to your account to complete your purchase and save your cart for later.
                      </p>
                    </div>
                  </div>
                )}

                {/* Enhanced Security & Shipping Info */}
                <div className="space-y-4 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Lock className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="font-medium">Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Package className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium">Free shipping on orders over $50</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Truck className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="font-medium">Estimated delivery: 3-5 business days</span>
                  </div>
                </div>

                {/* Enhanced Payment Methods */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">We accept:</p>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CreditCard className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="text-sm text-gray-600">
                      Credit Cards, PayPal, Apple Pay, Google Pay
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
