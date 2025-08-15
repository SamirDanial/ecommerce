import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ImageWithPlaceholder } from '../components/ui/image-with-placeholder';
import { 
  User, 
  Settings, 
  ShoppingBag, 
  MapPin, 
  CreditCard, 
  Shield, 
  CheckCircle, 
  Truck, 
  Package, 
  Edit, 
  Trash2, 
  Plus, 
  Star,
  Clock,
  Loader2
} from 'lucide-react';
import { useClerkAuth } from '../hooks/useClerkAuth';
import { useProfile } from '../hooks/useProfile';
import { toast } from 'sonner';
import { Address } from '../types';
import { Order, OrderItem, PaymentMethod, UserPreferences, UserSession } from '../services/profileService';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import OrderTrackingModal from '../components/OrderTrackingModal';
import { trackingService } from '../services/trackingService';
import AdminOrderManager from '../components/AdminOrderManager';

const UserProfile: React.FC = () => {
  const { isAuthenticated } = useClerkAuth();
  const [activeTab, setActiveTab] = useState<string>('orders');
  
  // Order detail view state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  
  // Tracking modal state
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<number | null>(null);
  const [trackingOrderNumber, setTrackingOrderNumber] = useState<string>('');
  
  // Utility function to safely convert Decimal values to numbers
  const toNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || 0;
    if (value && typeof value === 'object' && 'toNumber' in value) return value.toNumber();
    return 0;
  };
  
  // Address form state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    type: 'SHIPPING' as 'SHIPPING' | 'BILLING',
    isDefault: false,
    firstName: '',
    lastName: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    phone: ''
  });

  // Use React Query hooks
  const {
    useOrders,
    useAddresses,
    usePaymentMethods,
    usePreferences,
    useSessions,
    useUpdatePreferences,
    useDeleteAddress,
    useDeletePaymentMethod,
    useAddAddress,
    useUpdateAddress,
    useRevokeSession,
  } = useProfile();

  // Data queries
  const { data: orders = [], isLoading: ordersLoading, error: ordersError } = useOrders();
  const { data: addresses = [], isLoading: addressesLoading, error: addressesError } = useAddresses();
  const { data: paymentMethods = [], isLoading: paymentLoading, error: paymentError } = usePaymentMethods();
  const { data: preferences, isLoading: preferencesLoading, error: preferencesError } = usePreferences();
  const { data: sessions = [], isLoading: sessionsLoading, error: sessionsError } = useSessions();

  // Mutations
  const updatePreferencesMutation = useUpdatePreferences();
  const deleteAddressMutation = useDeleteAddress();
  const deletePaymentMethodMutation = useDeletePaymentMethod();
  const addAddressMutation = useAddAddress();
  const updateAddressMutation = useUpdateAddress();
  const revokeSessionMutation = useRevokeSession();

  // Local state for form inputs
  const [localPreferences, setLocalPreferences] = useState(preferences);

  // Update local preferences when data loads
  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
      // Show success message when preferences are loaded
      if (preferences.id) {
        toast.success('Preferences loaded successfully!');
      }
    }
  }, [preferences]);

  // Handle opening order detail view
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  };

  // Handle closing order detail view
  const handleCloseOrderDetails = () => {
    setIsOrderDetailOpen(false);
    setSelectedOrder(null);
  };

  const handleOpenTracking = (orderId: number, orderNumber: string) => {
    setTrackingOrderId(orderId);
    setTrackingOrderNumber(orderNumber);
    setIsTrackingModalOpen(true);
  };

  const handleCloseTracking = () => {
    setIsTrackingModalOpen(false);
    setTrackingOrderId(null);
    setTrackingOrderNumber('');
  };

  const resetAddressForm = () => {
    setAddressForm({
      type: 'SHIPPING',
      isDefault: false,
      firstName: '',
      lastName: '',
      company: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      phone: ''
    });
    setEditingAddress(null);
  };

  const openAddAddressModal = () => {
    resetAddressForm();
    setIsAddressModalOpen(true);
  };

  const openEditAddressModal = (address: Address) => {
    setAddressForm({
      type: address.type,
      isDefault: address.isDefault,
      firstName: address.firstName,
      lastName: address.lastName,
      company: address.company || '',
      address1: address.address1,
      address2: address.address2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone
    });
    setEditingAddress(address);
    setIsAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    setIsAddressModalOpen(false);
    resetAddressForm();
  };

  const handleAddressFormChange = (field: string, value: string | boolean) => {
    setAddressForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAddress) {
      // Update existing address
      updateAddressMutation.mutate({
        addressId: editingAddress.id,
        address: addressForm
      }, {
        onSuccess: () => {
          closeAddressModal();
        }
      });
    } else {
      // Add new address
      addAddressMutation.mutate(addressForm, {
        onSuccess: () => {
          closeAddressModal();
        }
      });
    }
  };

  const handleAddAddress = async () => {
    openAddAddressModal();
  };

  const handleEditAddress = async (addressId: number) => {
    const address = addresses.find((addr: Address) => addr.id === addressId);
    if (address) {
      openEditAddressModal(address);
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    deleteAddressMutation.mutate(addressId);
  };

  const handleAddPaymentMethod = async () => {
    toast.info('Add payment method functionality coming soon');
  };

  const handleEditPaymentMethod = async (methodId: number) => {
    toast.info(`Edit payment method ${methodId} functionality coming soon`);
  };

  const handleDeletePaymentMethod = async (methodId: number) => {
    deletePaymentMethodMutation.mutate(methodId);
  };

  const handleSavePreferences = async () => {
    if (!localPreferences) {
      toast.error('No preferences to save');
      return;
    }

    // Validate required fields
    if (!localPreferences.language || !localPreferences.currency) {
      toast.error('Please select both language and currency');
      return;
    }

    updatePreferencesMutation.mutate(localPreferences, {
      onSuccess: () => {
        toast.success('Preferences saved successfully!');
      },
      onError: (error) => {
        console.error('Error saving preferences:', error);
        toast.error('Failed to save preferences. Please try again.');
      }
    });
  };

  const handleRevokeSession = async (sessionId: number) => {
    try {
      await revokeSessionMutation.mutateAsync(sessionId);
      toast.success('Session revoked successfully');
    } catch (error) {
      toast.error('Failed to revoke session. Please try again.');
    }
  };

  const formatDeviceInfo = (deviceInfo: string) => {
    // Parse device info from backend and format it nicely
    try {
      const info = JSON.parse(deviceInfo);
      return `${info.browser || 'Unknown Browser'} on ${info.os || 'Unknown OS'}`;
    } catch {
      return deviceInfo || 'Unknown Device';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      delivered: { variant: 'default' as const, icon: CheckCircle, text: 'Delivered' },
      shipped: { variant: 'secondary' as const, icon: Truck, text: 'Shipped' },
      processing: { variant: 'secondary' as const, icon: Package, text: 'Processing' },
      cancelled: { variant: 'destructive' as const, icon: Clock, text: 'Cancelled' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.processing;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in</h1>
          <p className="text-muted-foreground">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (ordersLoading || addressesLoading || paymentLoading || preferencesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (ordersError || addressesError || paymentError || preferencesError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <p className="text-red-500">Failed to load user data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            My Account
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your orders, addresses, and preferences
          </p>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Addresses
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Admin
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No orders yet</p>
                    <p className="text-sm text-muted-foreground">Start shopping to see your order history</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order: Order) => (
                      <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-lg">{order.orderNumber}</h4>
                              {getStatusBadge(order.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-xl">${toNumber(order.total).toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">{order.currency}</p>
                          </div>
                        </div>
                        
                        {/* Quick Order Summary */}
                        <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Items</p>
                            <p className="font-medium">{order.items?.length || 0} products</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Shipping</p>
                            <p className="font-medium">${toNumber(order.shipping).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Payment</p>
                            <p className="font-medium">{order.paymentStatus}</p>
                          </div>
                        </div>
                        
                        {/* Order Items Preview */}
                        <div className="bg-gray-50 p-3 rounded-lg mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">Order Items</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {order.items?.slice(0, 3).map((item: OrderItem) => (
                              <div key={item.id} className="flex items-center gap-2 text-sm">
                                {item.product?.images?.[0]?.url ? (
                                  <ImageWithPlaceholder
                                    src={item.product.images[0].url}
                                    alt={item.productName}
                                    className="w-6 h-6 object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                                    <Package className="h-3 w-3 text-gray-400" />
                                  </div>
                                )}
                                <span className="text-xs">{item.productName} x{item.quantity}</span>
                              </div>
                            ))}
                            {order.items && order.items.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{order.items.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Shipping Address Preview */}
                        {order.shippingFirstName && (
                          <div className="bg-gray-50 p-3 rounded-lg mb-3">
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium text-muted-foreground">Shipping Address</span>
                            </div>
                            <p className="text-sm">
                              {order.shippingFirstName} {order.shippingLastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.shippingCity}, {order.shippingState} {order.shippingPostalCode}
                            </p>
                          </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2 border-t">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewOrderDetails(order)}
                            className="flex-1"
                          >
                            <Package className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenTracking(order.id, order.orderNumber)}
                            className="flex-1"
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            Track Order
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Order Detail Modal */}
          <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Details - {selectedOrder?.orderNumber}
                </DialogTitle>
              </DialogHeader>
              
              {selectedOrder && (
                <div className="space-y-6">
                  {/* Order Header */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Order Date</p>
                        <p className="font-medium">
                          {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Payment Status</p>
                        <p className="font-medium">{selectedOrder.paymentStatus}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tracking Number</p>
                        <p className="font-medium font-mono text-sm">
                          {selectedOrder.trackingNumber || 'Not available'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Price Breakdown</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${toNumber(selectedOrder.subtotal).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>${toNumber(selectedOrder.tax).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>${toNumber(selectedOrder.shipping).toFixed(2)}</span>
                      </div>
                      {toNumber(selectedOrder.discount) > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span>-${toNumber(selectedOrder.discount).toFixed(2)}</span>
                        </div>
                      )}
                      <hr className="my-2" />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>${toNumber(selectedOrder.total).toFixed(2)} {selectedOrder.currency}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Order Items</h3>
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item: OrderItem) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-lg overflow-hidden">
                              {item.product?.images?.[0]?.url ? (
                                <ImageWithPlaceholder
                                  src={item.product.images[0].url}
                                  alt={item.productName}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                                  <Package className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <div className="flex gap-2 text-sm text-muted-foreground">
                                {item.size && <span>Size: {item.size}</span>}
                                {item.color && <span>Color: {item.color}</span>}
                                {item.productSku && <span>SKU: {item.productSku}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${toNumber(item.price).toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            <p className="font-medium text-blue-600">
                              ${toNumber(item.total).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {selectedOrder.shippingFirstName && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Shipping Address
                      </h3>
                      <div className="bg-white p-3 rounded-lg border">
                        <p className="font-medium">
                          {selectedOrder.shippingFirstName} {selectedOrder.shippingLastName}
                          {selectedOrder.shippingCompany && (
                            <span className="text-muted-foreground"> ({selectedOrder.shippingCompany})</span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedOrder.shippingAddress1}
                          {selectedOrder.shippingAddress2 && `, ${selectedOrder.shippingAddress2}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedOrder.shippingCity}, {selectedOrder.shippingState} {selectedOrder.shippingPostalCode}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedOrder.shippingCountry}
                          {selectedOrder.shippingPhone && ` • ${selectedOrder.shippingPhone}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Order Notes */}
                  {selectedOrder.notes && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-3">Order Notes</h3>
                      <p className="text-muted-foreground">{selectedOrder.notes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={handleCloseOrderDetails}
                      className="flex-1"
                    >
                      Close
                    </Button>
                    {selectedOrder.trackingNumber && (
                      <Button className="flex-1">
                        <Truck className="h-4 w-4 mr-2" />
                        Track Order
                      </Button>
                    )}
                    <Button variant="outline" className="flex-1">
                      <Package className="h-4 w-4 mr-2" />
                      Reorder
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Addresses Tab */}
          <TabsContent value="addresses" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Saved Addresses</CardTitle>
                <Button size="sm" onClick={handleAddAddress}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Address
                </Button>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No addresses saved</p>
                    <p className="text-sm text-muted-foreground">Add an address to make checkout faster</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address: Address) => (
                      <div key={address.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={address.isDefault ? "default" : "secondary"}>
                                {address.type === 'SHIPPING' ? 'Shipping' : 'Billing'}
                              </Badge>
                              {address.isDefault && (
                                <Badge variant="outline">Default</Badge>
                              )}
                            </div>
                            <p className="font-medium">{address.firstName} {address.lastName}</p>
                            {address.company && (
                              <p className="text-sm text-muted-foreground">{address.company}</p>
                            )}
                            <p className="text-sm text-muted-foreground">{address.address1}</p>
                            {address.address2 && (
                              <p className="text-sm text-muted-foreground">{address.address2}</p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              {address.city}, {address.state} {address.postalCode}
                            </p>
                            <p className="text-sm text-muted-foreground">{address.country}</p>
                            <p className="text-sm text-muted-foreground">{address.phone}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditAddress(address.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive"
                              onClick={() => handleDeleteAddress(address.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Payment Methods</CardTitle>
                <Button size="sm" onClick={handleAddPaymentMethod}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </CardHeader>
              <CardContent>
                {paymentMethods.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No payment methods saved</p>
                    <p className="text-sm text-muted-foreground">Add a payment method for faster checkout</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentMethods.map((method: PaymentMethod) => (
                      <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">{method.brand} •••• {method.last4}</p>
                            <p className="text-sm text-muted-foreground">
                              Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {method.isDefault && (
                            <Badge variant="outline">Default</Badge>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditPaymentMethod(method.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive"
                            onClick={() => handleDeletePaymentMethod(method.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Notification Preferences
                  {localPreferences && preferences && JSON.stringify(localPreferences) !== JSON.stringify(preferences) && (
                    <Badge variant="secondary" className="text-xs">
                      Modified
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Choose how you want to receive notifications and updates from us.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifs">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive order updates and promotions via email</p>
                    </div>
                    <Checkbox 
                      id="emailNotifs" 
                      checked={localPreferences?.emailNotifications}
                      onCheckedChange={(checked: boolean) => setLocalPreferences((prev: UserPreferences | undefined) => ({ ...prev, emailNotifications: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="smsNotifs">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive order updates via text message</p>
                    </div>
                    <Checkbox 
                      id="smsNotifs" 
                      checked={localPreferences?.smsNotifications}
                      onCheckedChange={(checked: boolean) => setLocalPreferences((prev: UserPreferences | undefined) => ({ ...prev, smsNotifications: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketingEmails">Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">Receive promotional offers and newsletters</p>
                    </div>
                    <Checkbox 
                      id="marketingEmails" 
                      checked={localPreferences?.marketingEmails}
                      onCheckedChange={(checked: boolean) => setLocalPreferences((prev: UserPreferences | undefined) => ({ ...prev, marketingEmails: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="orderUpdates">Order Updates</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications about order status changes</p>
                    </div>
                    <Checkbox 
                      id="orderUpdates" 
                      checked={localPreferences?.orderUpdates}
                      onCheckedChange={(checked: boolean) => setLocalPreferences((prev: UserPreferences | undefined) => ({ ...prev, orderUpdates: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="promotionalOffers">Promotional Offers</Label>
                      <p className="text-sm text-muted-foreground">Receive special deals and discounts</p>
                    </div>
                    <Checkbox 
                      id="promotionalOffers" 
                      checked={localPreferences?.promotionalOffers}
                      onCheckedChange={(checked: boolean) => setLocalPreferences((prev: UserPreferences | undefined) => ({ ...prev, promotionalOffers: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="newsletter">Newsletter</Label>
                      <p className="text-sm text-muted-foreground">Receive our monthly newsletter</p>
                    </div>
                    <Checkbox 
                      id="newsletter" 
                      checked={localPreferences?.newsletter}
                      onCheckedChange={(checked: boolean) => setLocalPreferences((prev: UserPreferences | undefined) => ({ ...prev, newsletter: checked }))}
                    />
                  </div>
                </div>
                <hr className="my-2" />
                <div className="space-y-3">
                  <h4 className="font-medium">Language & Region</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Customize your language, currency, and timezone preferences for a personalized experience.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select onValueChange={(value: string) => setLocalPreferences((prev: UserPreferences | undefined) => ({ ...prev, language: value as 'ENGLISH' | 'URDU' | 'ARABIC' }))} value={localPreferences?.language}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ENGLISH">English</SelectItem>
                          <SelectItem value="URDU">Urdu</SelectItem>
                          <SelectItem value="ARABIC">Arabic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select onValueChange={(value: string) => setLocalPreferences((prev: UserPreferences | undefined) => ({ ...prev, currency: value as 'USD' | 'EUR' | 'PKR' }))} value={localPreferences?.currency}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="PKR">PKR (₨)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input
                        id="timezone"
                        value={localPreferences?.timezone || ''}
                        onChange={(e) => setLocalPreferences((prev: UserPreferences | undefined) => ({ ...prev, timezone: e.target.value }))}
                        placeholder="e.g., UTC, EST, PST"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => setLocalPreferences(preferences)}
                    disabled={updatePreferencesMutation.isPending}
                  >
                    Reset to Saved
                  </Button>
                  <Button 
                    onClick={handleSavePreferences}
                    disabled={updatePreferencesMutation.isPending}
                  >
                    {updatePreferencesMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Preferences'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            {/* Security Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">Email Verified</p>
                      <p className="text-sm text-muted-foreground">Your email is verified</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">Active Sessions</p>
                      <p className="text-sm text-muted-foreground">{sessions.length} session{sessions.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Password Change Section - Disabled in current version */}
                {/* canChangePassword() ? ( */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Change Password</h4>
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                          <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <p className="font-medium">Password Change Temporarily Unavailable</p>
                          <p className="text-sm text-muted-foreground">
                            Password change functionality is not available in the current version. 
                            To change your password, please use the password reset feature or contact support.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                {/* ) : ( */}
                  {/* OAuth Only Users - Show connected accounts info */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Connected Accounts</h4>
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium">OAuth Authentication</p>
                            <p className="text-sm text-muted-foreground">
                              You're signed in using a third-party service. 
                              Password changes are not applicable for OAuth accounts.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                {/* ) */}
                
                <hr className="my-2" />
                
                <div className="space-y-4">
                  <h4 className="font-medium">Login Sessions</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage your active login sessions across different devices and browsers.
                  </p>
                  
                  {sessionsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Loading sessions...</span>
                    </div>
                  ) : sessionsError ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="mb-2">Failed to load sessions</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.location.reload()}
                      >
                        Retry
                      </Button>
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground mb-2">No active sessions found</p>
                      <p className="text-sm text-muted-foreground">
                        This usually means you're only logged in on this device.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sessions.map((session: UserSession) => (
                        <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{formatDeviceInfo(session.deviceInfo)}</p>
                                <p className="text-sm text-muted-foreground">
                                  IP: {session.ipAddress}
                                </p>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <p>Last activity: {formatTimeAgo(session.lastActivity)}</p>
                              <p>Created: {new Date(session.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {session.isActive && (
                              <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                Current Session
                              </Badge>
                            )}
                            {!session.isActive && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRevokeSession(session.id)}
                                disabled={revokeSessionMutation.isPending}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                              >
                                {revokeSessionMutation.isPending ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  'Revoke'
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Session Management Tips */}
                  <div className="mt-6 p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Session Security Tips</h5>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Revoke sessions from devices you don't recognize</li>
                      <li>• Keep your current session active for convenience</li>
                      <li>• Sessions automatically expire after inactivity</li>
                      <li>• Contact support if you notice suspicious activity</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Tab */}
          <TabsContent value="admin" className="space-y-6">
            <AdminOrderManager />
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <Card>
            <CardContent className="p-4 text-center">
              <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{orders.length}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Wishlist Items</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">4.8</p>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{addresses.length}</p>
              <p className="text-sm text-muted-foreground">Saved Addresses</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Address Form Modal */}
      <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleAddressSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Address Type</Label>
                <Select 
                  value={addressForm.type} 
                  onValueChange={(value: string) => handleAddressFormChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SHIPPING">Shipping Address</SelectItem>
                    <SelectItem value="BILLING">Billing Address</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDefault"
                  checked={addressForm.isDefault}
                  onCheckedChange={(checked: boolean | 'indeterminate') => handleAddressFormChange('isDefault', checked === true)}
                />
                <Label htmlFor="isDefault">Set as default address</Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={addressForm.firstName}
                  onChange={(e) => handleAddressFormChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={addressForm.lastName}
                  onChange={(e) => handleAddressFormChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="company">Company (Optional)</Label>
              <Input
                id="company"
                value={addressForm.company}
                onChange={(e) => handleAddressFormChange('company', e.target.value)}
                placeholder="Enter company name"
              />
            </div>

            <div>
              <Label htmlFor="address1">Address Line 1 *</Label>
              <Input
                id="address1"
                value={addressForm.address1}
                onChange={(e) => handleAddressFormChange('address1', e.target.value)}
                placeholder="Street address, P.O. box, company name"
                required
              />
            </div>

            <div>
              <Label htmlFor="address2">Address Line 2</Label>
              <Input
                id="address2"
                value={addressForm.address2}
                onChange={(e) => handleAddressFormChange('address2', e.target.value)}
                placeholder="Apartment, suite, unit, building, floor, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={addressForm.city}
                  onChange={(e) => handleAddressFormChange('city', e.target.value)}
                  placeholder="Enter city"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="state">State/Province *</Label>
                <Input
                  id="state"
                  value={addressForm.state}
                  onChange={(e) => handleAddressFormChange('state', e.target.value)}
                  placeholder="Enter state"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  value={addressForm.postalCode}
                  onChange={(e) => handleAddressFormChange('postalCode', e.target.value)}
                  placeholder="Enter postal code"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">Country *</Label>
                <Select 
                  value={addressForm.country} 
                  onValueChange={(value: string) => handleAddressFormChange('country', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                    <SelectItem value="DE">Germany</SelectItem>
                    <SelectItem value="FR">France</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                    <SelectItem value="PK">Pakistan</SelectItem>
                    <SelectItem value="IN">India</SelectItem>
                    <SelectItem value="CN">China</SelectItem>
                    <SelectItem value="JP">Japan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={addressForm.phone}
                  onChange={(e) => handleAddressFormChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeAddressModal}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addAddressMutation.isPending || updateAddressMutation.isPending}
              >
                {addAddressMutation.isPending || updateAddressMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editingAddress ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  editingAddress ? 'Update Address' : 'Add Address'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Order Tracking Modal */}
      {trackingOrderId && (
        <OrderTrackingModal
          isOpen={isTrackingModalOpen}
          onClose={handleCloseTracking}
          orderId={trackingOrderId}
          orderNumber={trackingOrderNumber}
        />
      )}
    </div>
  );
};

export default UserProfile;
