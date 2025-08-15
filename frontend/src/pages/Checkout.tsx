import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore, defaultCurrencies, defaultLanguages, shippingCosts } from '../stores/cartStore';
import { useClerkAuth } from '../hooks/useClerkAuth';
import { getSavedAddresses, SavedAddress, createAddress, updateAddress, deleteAddress, CreateAddressRequest } from '../services/addressService';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '../components/StripePaymentForm';
import AddressSelector from '../components/AddressSelector';
import AddressFormSidebar from '../components/AddressFormSidebar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { ShoppingCart, CreditCard, MapPin, ArrowLeft, Globe, Truck, AlertCircle, CheckCircle } from 'lucide-react';

// Load Stripe (you'll need to add your publishable key to environment variables)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_test_key_here');

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, getToken } = useClerkAuth();
  const [currentStep, setCurrentStep] = useState<'address' | 'payment'>('address');
  const [discountCode, setDiscountCode] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cod'>('stripe');
  
  // Address management state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null);
  const [showAddressSidebar, setShowAddressSidebar] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [hasInitializedAddresses, setHasInitializedAddresses] = useState(false);
  const [addressLoadError, setAddressLoadError] = useState<string | null>(null);
  
  // Use ref to prevent infinite loops
  const hasLoadedAddresses = useRef(false);

  const {
    items,
    selectedCurrency,
    setCurrency,
    shippingAddress,
    setShippingAddress,
    shippingMethod,
    setShippingMethod,
    appliedDiscount,
    applyDiscountCode,
    removeDiscountCode,
    getSubtotal,
    getShippingCost,
    getTaxAmount,
    getDiscountAmount,
    getTotal,
    getTotalItems,
    selectedLanguage,
    setLanguage,
    clearCart
  } = useCartStore();

  // Load saved addresses only once when component mounts and user is authenticated
  useEffect(() => {
    // Prevent multiple loads
    if (hasLoadedAddresses.current || !isAuthenticated) {
      return;
    }

    const loadAddresses = async () => {
      try {
        setIsLoadingAddresses(true);
        setAddressLoadError(null);
        const token = await getToken();
        if (!token) {
          setAddressLoadError('Authentication token not available');
          toast.error('Authentication token not available');
          setIsLoadingAddresses(false);
          return;
        }
        
        const addresses = await getSavedAddresses(token);
        
        // Addresses are already transformed by getSavedAddresses
        setSavedAddresses(addresses);
        
        // Set default address only on initial load
        if (!hasInitializedAddresses) {
          const defaultAddress = addresses.find(addr => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddress(defaultAddress);
            // Also set it in the cart store
            setShippingAddress(defaultAddress);
          }
          setHasInitializedAddresses(true);
        }
        
        // Mark as loaded to prevent future calls
        hasLoadedAddresses.current = true;
      } catch (error) {
        console.error('Error loading addresses:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load saved addresses';
        setAddressLoadError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    loadAddresses();
  }, [isAuthenticated, getToken, hasInitializedAddresses, setShippingAddress]);

  // Manual refresh function for addresses (only called when explicitly needed)
  const handleRefreshAddresses = async () => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication token not available');
        return;
      }
      
      const addresses = await getSavedAddresses(token);
      setSavedAddresses(addresses);
      
      // Reset the loaded flag to allow future loads
      hasLoadedAddresses.current = false;
      setHasInitializedAddresses(false);
      
      toast.success('Addresses refreshed successfully');
    } catch (error) {
      console.error('Error refreshing addresses:', error);
      toast.error('Failed to refresh addresses');
    }
  };

  // Sync selected address with cart store when it changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (selectedAddress) {
      setShippingAddress(selectedAddress);
    }
  }, [selectedAddress, setShippingAddress]);

  // Address management functions
  const handleSelectAddress = (address: SavedAddress) => {
    setSelectedAddress(address);
    setShippingAddress(address);
    toast.success('Address selected successfully');
  };

  const handleAddNewAddress = () => {
    setShowAddressSidebar(true);
    setEditingAddress(null);
  };

  const handleEditAddress = (address: SavedAddress) => {
    setEditingAddress(address);
    setShowAddressSidebar(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication token not available');
        return;
      }
      
      await deleteAddress(addressId, token);
      
      // Refresh addresses to get updated list
      await handleRefreshAddresses();
      
      toast.success('Address deleted successfully');
    } catch (error) {
      console.error('Failed to delete address:', error);
      toast.error('Failed to delete address');
    }
  };

  const handleSaveAddress = async (addressData: CreateAddressRequest) => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication token not available');
        return;
      }
      
      let savedAddress: SavedAddress | null = null;
      
      if (editingAddress) {
        // Update existing address
        savedAddress = await updateAddress({ ...addressData, id: editingAddress.id }, token);
        if (savedAddress) {
          toast.success('Address updated successfully');
        }
      } else {
        // Create new address
        savedAddress = await createAddress(addressData, token);
        if (savedAddress) {
          toast.success('Address saved successfully');
        }
      }
      
      // Refresh addresses to get updated list
      await handleRefreshAddresses();
      
      // Select the newly saved/updated address
      if (savedAddress) {
        setSelectedAddress(savedAddress);
        setShippingAddress(savedAddress);
      }
      
      setShowAddressSidebar(false);
      setEditingAddress(null);
    } catch (error) {
      console.error('Failed to save address:', error);
      toast.error('Failed to save address');
    }
  };

  const handleCancelAddressForm = () => {
    setShowAddressSidebar(false);
    setEditingAddress(null);
  };

  // Redirect if cart is empty
  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }



  const handleDiscountCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountCode.trim()) return;

    setIsApplyingDiscount(true);
    setDiscountError(null); // Clear previous errors
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication token not available');
        return;
      }

      const success = await applyDiscountCode(discountCode.trim(), token);
      if (success) {
        toast.success('Discount code applied successfully!');
        setDiscountCode('');
      } else {
        setDiscountError('Invalid discount code. Please try again.');
        toast.error('Invalid discount code');
      }
    } catch (error) {
      setDiscountError('Failed to apply discount code. Please try again.');
      toast.error('Failed to apply discount code');
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const formatPrice = (price: number) => {
    return `${selectedCurrency.symbol}${price.toFixed(2)}`;
  };

  const handlePaymentMethodChange = (value: string) => {
    if (value === 'stripe' || value === 'cod') {
      setPaymentMethod(value);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/cart')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">
            Complete your purchase ({getTotalItems()} items)
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div className={`flex items-center space-x-2 ${currentStep === 'address' ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep === 'address' ? 'border-primary bg-primary text-white' : 'border-gray-300'
              }`}>
                1
              </div>
              <span className="font-medium">Shipping Address</span>
            </div>
            
            <div className={`w-16 h-0.5 ${currentStep === 'payment' ? 'bg-primary' : 'bg-gray-300'}`}></div>
            
            <div className={`flex items-center space-x-2 ${currentStep === 'payment' ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep === 'payment' ? 'border-primary bg-primary text-white' : 'border-gray-300'
              }`}>
                2
              </div>
              <span className="font-medium">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Currency & Language Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <select
                      id="currency"
                      value={selectedCurrency.code}
                      onChange={(e) => {
                        const currency = defaultCurrencies.find(c => c.code === e.target.value);
                        if (currency) setCurrency(currency);
                      }}
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    >
                      {defaultCurrencies.map(currency => (
                        <option key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <select
                      id="language"
                      value={selectedLanguage.code}
                      onChange={(e) => {
                        const language = defaultLanguages.find(l => l.code === e.target.value);
                        if (language) setLanguage(language);
                      }}
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    >
                      {defaultLanguages.map(language => (
                        <option key={language.code} value={language.code}>
                          {language.nativeName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 1: Shipping Address */}
            {currentStep === 'address' && (
              <div className="space-y-6">
                {/* Address Selector */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Select Shipping Address
                    </CardTitle>
                    <div className="ml-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefreshAddresses}
                        disabled={isLoadingAddresses}
                      >
                        {isLoadingAddresses ? 'Loading...' : 'Refresh'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingAddresses ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-muted-foreground">Loading addresses...</p>
                      </div>
                    ) : addressLoadError ? (
                      <div className="text-center py-8 text-red-500">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                        <p>{addressLoadError}</p>
                        <Button onClick={handleRefreshAddresses} className="mt-4">
                          Retry
                        </Button>
                      </div>
                    ) : savedAddresses.length === 0 ? (
                      <div className="text-center py-8">
                        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No saved addresses</h3>
                        <p className="text-gray-600 mb-4">You don't have any saved addresses yet.</p>
                        <Button onClick={handleAddNewAddress} className="w-full">
                          Add New Address
                        </Button>
                      </div>
                    ) : (
                      <AddressSelector
                        savedAddresses={savedAddresses}
                        selectedAddress={selectedAddress}
                        onSelectAddress={handleSelectAddress}
                        onAddNewAddress={handleAddNewAddress}
                        onEditAddress={handleEditAddress}
                        onDeleteAddress={handleDeleteAddress}
                        isSidebarOpen={showAddressSidebar}
                        isEditing={false}
                      />
                    )}
                    
                    {/* Continue to Payment Button - Always visible */}
                    <div className="mt-6 pt-6 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          {selectedAddress ? (
                            <>
                              <h4 className="font-medium">Selected Address:</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {selectedAddress.firstName} {selectedAddress.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {selectedAddress.address}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}, {selectedAddress.country}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Please select a shipping address to continue
                            </p>
                          )}
                        </div>
                        <Button 
                          onClick={() => setCurrentStep('payment')} 
                          disabled={!selectedAddress}
                          className="min-w-[140px]"
                        >
                          Continue to Payment
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Address Form Sidebar */}
                <AddressFormSidebar
                  isOpen={showAddressSidebar}
                  onClose={handleCancelAddressForm}
                  onSave={handleSaveAddress}
                  address={editingAddress}
                  isEditing={!!editingAddress}
                />
              </div>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 'payment' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Payment Method Selection */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Payment Method</h3>
                      
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="stripe"
                            checked={paymentMethod === 'stripe'}
                            onChange={(e) => handlePaymentMethodChange(e.target.value)}
                            className="text-blue-600"
                          />
                          <span>Credit/Debit Card (Embedded Form)</span>
                        </label>
                        
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cod"
                            checked={paymentMethod === 'cod'}
                            onChange={(e) => handlePaymentMethodChange(e.target.value)}
                            className="text-blue-600"
                          />
                          <span>Cash on Delivery</span>
                        </label>
                      </div>
                    </div>

                    {/* Stripe Payment Form */}
                    {paymentMethod === 'stripe' && (
                      <Elements stripe={stripePromise}>
                        <StripePaymentForm
                          amount={getTotal() * 100} // Convert to cents
                          currency={selectedCurrency.code.toLowerCase()} // Use currency code (e.g., 'usd') not symbol (e.g., '$')
                          customerName={shippingAddress ? `${shippingAddress.firstName} ${shippingAddress.lastName}` : 'Customer'}
                          shippingAddress={{
                            firstName: shippingAddress?.firstName || '',
                            lastName: shippingAddress?.lastName || '',
                            phone: shippingAddress?.phone || '',
                            address: shippingAddress?.address || '',
                            city: shippingAddress?.city || '',
                            state: shippingAddress?.state || '',
                            postalCode: shippingAddress?.postalCode || '',
                            country: shippingAddress?.country || ''
                          }}
                          orderDetails={{
                            items: items.map(item => ({
                              id: item.id,
                              name: item.name,
                              quantity: item.quantity,
                              price: item.price,
                              image: item.image || undefined
                            }))
                          }}
                          onPaymentSuccess={(paymentIntent) => {
                            // Payment completed successfully - clear cart and redirect to success
                            clearCart();
                            toast.success('Payment completed successfully!');
                            navigate('/success', { 
                              state: { 
                                paymentIntentId: paymentIntent.id,
                                amount: getTotal(),
                                currency: selectedCurrency.code
                              }
                            });
                          }}
                          onPaymentError={(error) => {
                            console.error('Payment failed:', error);
                            toast.error(error);
                          }}
                          isLoading={false} // isProcessing removed
                        />
                      </Elements>
                    )}

                    {/* Cash on Delivery Notice */}
                    {paymentMethod === 'cod' && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <Truck className="h-4 w-4" />
                          <span className="font-medium">Cash on Delivery</span>
                        </div>
                        <p className="text-yellow-700 text-sm mt-1">
                          Pay with cash when your order is delivered. No additional fees.
                        </p>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={() => setCurrentStep('address')}
                        className="flex-1"
                      >
                        ← Back to Address
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <img
                        src={item.image || '/placeholder.png'}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-gray-500 text-xs">
                          Qty: {item.quantity}
                          {item.selectedColor && ` • ${item.selectedColor}`}
                          {item.selectedSize && ` • ${item.selectedSize}`}
                        </p>
                      </div>
                      <p className="font-medium text-sm">
                        {formatPrice(item.price * item.quantity * selectedCurrency.rate)}
                      </p>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                {/* Shipping Method */}
                <div className="space-y-2">
                  <Label>Shipping Method</Label>
                  <div className="space-y-2">
                    {Object.entries(shippingCosts).map(([method, cost]) => (
                      <div key={method} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id={method}
                          name="shippingMethod"
                          value={method}
                          checked={shippingMethod === method}
                          onChange={(e) => setShippingMethod(e.target.value as any)}
                          className="h-4 w-4 text-blue-600"
                        />
                        <Label htmlFor={method} className="flex items-center justify-between w-full cursor-pointer">
                          <span className="capitalize">{method}</span>
                          <span className="font-medium">{formatPrice(cost * selectedCurrency.rate)}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* Discount Code */}
                <div className="space-y-2">
                  <Label>Discount Code</Label>
                  <form onSubmit={handleDiscountCode} className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={discountCode}
                      onChange={(e) => {
                        setDiscountCode(e.target.value);
                        if (discountError) setDiscountError(null);
                      }}
                      disabled={isApplyingDiscount}
                      className={`${discountError ? 'border-red-500' : ''}`}
                    />
                    {discountError && (
                      <p className="text-red-500 text-xs mt-1">{discountError}</p>
                    )}
                    <Button 
                      type="submit" 
                      size="sm"
                      disabled={isApplyingDiscount || !discountCode.trim()}
                    >
                      {isApplyingDiscount ? '...' : 'Apply'}
                    </Button>
                  </form>
                  
                  {appliedDiscount && (
                    <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          {appliedDiscount.code}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeDiscountCode}
                        className="text-green-600 hover:text-green-700"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(getSubtotal())}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{formatPrice(getShippingCost())}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>{formatPrice(getTaxAmount())}</span>
                  </div>
                  
                  {appliedDiscount && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(getDiscountAmount())}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(getTotal())}</span>
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

export default Checkout;
