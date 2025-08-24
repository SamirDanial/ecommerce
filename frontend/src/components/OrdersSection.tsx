import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithPlaceholder } from './ui/image-with-placeholder';
import { 
  ShoppingBag, 
  Package, 
  Truck, 
  Mail,
  Phone,
  User,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Order, OrderItem } from '../services/profileService';
import { useCurrency } from '../contexts/CurrencyContext';
import OrderTrackingModal from './OrderTrackingModal';
import { getFullImageUrl } from '../utils/imageUtils';

interface OrdersSectionProps {
  orders: Order[];
  ordersLoading: boolean;
  pagination: any;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  useOrderDetails: (orderId: number | null) => any;
}

const OrdersSection: React.FC<OrdersSectionProps> = ({
  orders,
  ordersLoading,
  pagination,
  currentPage,
  totalPages,
  onPageChange,
  useOrderDetails
}) => {
  const { formatPrice, formatConvertedPrice, formatPriceWithCurrency } = useCurrency();
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<number | null>(null);
  const [trackingOrderNumber, setTrackingOrderNumber] = useState<string>('');

  // Fetch order details when selectedOrderId changes
  const { data: selectedOrder, isLoading: orderDetailsLoading } = useOrderDetails(selectedOrderId);

  // Helper function to convert string to number
  const toNumber = (value: string | number | null | undefined): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || 0;
    return 0;
  };

  // Get status badge with appropriate styling
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", text: string }> = {
      'PENDING': { variant: 'outline', text: 'Pending' },
      'CONFIRMED': { variant: 'secondary', text: 'Confirmed' },
      'PROCESSING': { variant: 'secondary', text: 'Processing' },
      'SHIPPED': { variant: 'default', text: 'Shipped' },
      'DELIVERED': { variant: 'default', text: 'Delivered' },
      'CANCELLED': { variant: 'destructive', text: 'Cancelled' },
      'REFUNDED': { variant: 'destructive', text: 'Refunded' }
    };

    const config = statusConfig[status] || { variant: 'outline', text: status };
    
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.text}
      </Badge>
    );
  };

  // Handle opening order detail view
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrderId(order.id);
    setIsOrderDetailOpen(true);
  };

  // Handle closing order detail view
  const handleCloseOrderDetails = () => {
    setIsOrderDetailOpen(false);
    setSelectedOrderId(null);
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

  const startIndex = (currentPage - 1) * (pagination?.perPage || 10);
  const endIndex = startIndex + orders.length;

  return (
    <>
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4 border-b border-gray-200">
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 text-gray-600" />
            Order History
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {ordersLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500">Start shopping to see your order history</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {orders.map((order: Order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:border-gray-300 transition-colors">
                  {/* Order Header - Date Prominent */}
                  <div className="flex flex-col gap-3 sm:gap-4 mb-3 sm:mb-4">
                    {/* Desktop Layout */}
                    <div className="hidden sm:flex sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {new Date(order.createdAt).getDate()}
                          </div>
                          <div className="text-sm font-medium text-gray-600 uppercase">
                            {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(order.createdAt).getFullYear()}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-lg font-semibold text-gray-900 mb-1">
                            {new Date(order.createdAt).toLocaleDateString('en-US', { 
                              weekday: 'long',
                              month: 'long', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                                                  <div className="text-sm text-gray-500">
                          {order.itemCount} items • {formatPriceWithCurrency(toNumber(order.shipping), order.currency)} shipping
                        </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(order.status)}
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900">
                            {formatPriceWithCurrency(toNumber(order.total), order.currency)}
                          </div>
                          <div className="text-sm text-gray-500">{order.currency}</div>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="sm:hidden">
                      {/* Date and Amount Row */}
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <div>
                          <div className="text-sm text-gray-500 mb-0.5 leading-tight">Order Date</div>
                          <div className="text-base font-semibold text-gray-900 leading-tight">
                            {new Date(order.createdAt).toLocaleDateString('en-US', { 
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500 mb-0.5 leading-tight">Total Amount</div>
                          <div className="text-lg font-bold text-gray-900 leading-tight">
                            {formatPriceWithCurrency(toNumber(order.total), order.currency)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Items and Shipping Info */}
                      <div className="text-sm text-gray-500 mb-0 sm:mb-2 leading-tight">
                        {order.itemCount} items • {formatPriceWithCurrency(toNumber(order.shipping), order.currency)} shipping
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-0 sm:pt-4">
                    <div className="flex gap-4">
                      <button 
                        onClick={() => handleViewOrderDetails(order)}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleOpenTracking(order.id, order.orderNumber)}
                        className="text-sm text-green-600 hover:text-green-800 hover:underline font-medium transition-colors"
                      >
                        Track Order
                      </button>
                    </div>
                    
                    {/* Status Badge - Mobile Only */}
                    <div className="sm:hidden">
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      Showing {startIndex + 1} to {endIndex} of {pagination?.total || 0} orders
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1 || ordersLoading}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, index) => {
                          const pageNumber = index + 1;
                          if (
                            pageNumber === 1 ||
                            pageNumber === totalPages ||
                            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                          ) {
                            return (
                              <Button
                                key={pageNumber}
                                variant={currentPage === pageNumber ? "default" : "outline"}
                                size="sm"
                                onClick={() => onPageChange(pageNumber)}
                                disabled={ordersLoading}
                                className="w-10 h-10 p-0"
                              >
                                {pageNumber}
                              </Button>
                            );
                          } else if (
                            pageNumber === currentPage - 2 ||
                            pageNumber === currentPage + 2
                          ) {
                            return (
                              <span key={pageNumber} className="px-2 text-gray-400">
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages || ordersLoading}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          {/* Header */}
          <DialogHeader className="mb-4 sm:mb-6">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              Order Details
              {selectedOrder && (
                <span className="text-sm sm:text-base font-normal text-gray-500">#{selectedOrder.orderNumber}</span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {/* Loading State */}
          {orderDetailsLoading && (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading order details...</p>
            </div>
          )}
          
          {/* Order Details Content */}
          {selectedOrder && !orderDetailsLoading && (
            <div className="space-y-4 sm:space-y-6">
              {/* Order Overview */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="text-center p-3 sm:p-4 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Status</div>
                  <div className="font-medium">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div className="text-center p-3 sm:p-4 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Payment</div>
                  <div className="font-medium">{selectedOrder.paymentStatus}</div>
                </div>
                <div className="text-center p-3 sm:p-4 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Tracking</div>
                  <div className="font-medium text-sm">
                    {selectedOrder.trackingNumber || 'Not available'}
                  </div>
                </div>
                <div className="text-center p-3 sm:p-4 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Items</div>
                  <div className="font-medium">{selectedOrder.itemCount || selectedOrder.items?.length || 0} items</div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border border-gray-200 rounded-lg p-3 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  Price Breakdown
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPriceWithCurrency(toNumber(selectedOrder.subtotal), selectedOrder.currency)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">{formatPriceWithCurrency(toNumber(selectedOrder.tax), selectedOrder.currency)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">{formatPriceWithCurrency(toNumber(selectedOrder.shipping), selectedOrder.currency)}</span>
                  </div>
                  
                  {toNumber(selectedOrder.discount) > 0 && (
                    <div className="flex justify-between items-center py-2 bg-green-50 p-3 rounded-lg">
                      <span className="text-green-700 font-medium">Discount Applied</span>
                      <span className="text-green-700 font-bold">
                        -{formatPriceWithCurrency(toNumber(selectedOrder.discount), selectedOrder.currency)}
                      </span>
                    </div>
                  )}
                  
                  <hr className="my-3 sm:my-4" />
                  
                  <div className="flex justify-between items-center py-3 bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <span className="text-lg sm:text-xl font-semibold text-gray-900">Total</span>
                    <span className="text-xl sm:text-2xl font-bold text-gray-900">
                      {formatPriceWithCurrency(toNumber(selectedOrder.total), selectedOrder.currency)}
                    </span>
                  </div>
                </div>
              </div>

                                {/* Order Items */}
                  <div className="border border-gray-200 rounded-lg p-3 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                          <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        </div>
                        Order Items
                      </h3>
                      <span className="text-sm text-gray-500">{selectedOrder.itemCount || selectedOrder.items?.length || 0} items</span>
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4">
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item: OrderItem) => (
                          <div key={item.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                              {/* Product Image */}
                              <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-100">
                                {item.product?.images?.[0]?.url ? (
                                  <ImageWithPlaceholder
                                    src={getFullImageUrl(item.product.images[0].url)}
                                    alt={item.productName}
                                    className="w-auto h-auto max-w-full max-h-[60px] object-contain object-center"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                    <Package className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              
                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 mb-1 truncate">
                                  {item.productName}
                                </h4>
                                
                                                            {/* Product Attributes */}
                            {(item.size || item.color) && (
                              <div className="flex flex-wrap gap-2 mb-2">
                                {item.size && (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                    Size: {item.size}
                                  </span>
                                )}
                                {item.color && (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                    Color: {item.color}
                                  </span>
                                )}
                              </div>
                            )}
                                
                                {/* Price and Quantity */}
                                <div className="flex items-center justify-between">
                                  <div className="text-sm text-gray-600">
                                    Qty: {item.quantity} × {formatPriceWithCurrency(toNumber(item.price), selectedOrder.currency)}
                                  </div>
                                  <div className="font-semibold text-gray-900">
                                    {formatPriceWithCurrency(toNumber(item.total), selectedOrder.currency)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                          <p>No items available for this order</p>
                        </div>
                      )}
                    </div>
              </div>

              {/* Customer Information */}
              <div className="border border-gray-200 rounded-lg p-3 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-1.5 sm:p-2 bg-indigo-100 rounded-lg">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                  </div>
                  Customer Information
                </h3>
                
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  {/* Contact Details */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3 text-base sm:text-lg">Contact Details</h4>
                    
                    <div className="space-y-3">
                      {selectedOrder.user?.email && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Email Address</p>
                            <p className="font-medium text-gray-900">{selectedOrder.user.email}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedOrder.shippingPhone && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Phone Number</p>
                            <p className="font-medium text-gray-900">{selectedOrder.shippingPhone}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedOrder.user?.name && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <User className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Customer Name</p>
                            <p className="font-medium text-gray-900">{selectedOrder.user.name}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {selectedOrder.shippingFirstName && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3 text-base sm:text-lg">Shipping Address</h4>
                      
                      <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                          <div>
                            <p className="font-medium text-gray-900 mb-2">
                              {selectedOrder.shippingFirstName} {selectedOrder.shippingLastName}
                            </p>
                            
                            <div className="space-y-1 text-gray-600">
                              <p>{selectedOrder.shippingAddress1}</p>
                              {selectedOrder.shippingAddress2 && (
                                <p>{selectedOrder.shippingAddress2}</p>
                              )}
                              <p>
                                {selectedOrder.shippingCity}, {selectedOrder.shippingState} {selectedOrder.shippingPostalCode}
                              </p>
                              <p className="font-medium">{selectedOrder.shippingCountry}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Notes */}
              {selectedOrder.notes && (
                <div className="border border-gray-200 rounded-lg p-3 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="p-1.5 sm:p-2 bg-yellow-100 rounded-lg">
                      <Package className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                    </div>
                    Order Notes
                  </h3>
                  <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-gray-800">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={handleCloseOrderDetails}
                  className="flex-1"
                >
                  Close
                </Button>
                
                {selectedOrder.trackingNumber && (
                  <Button 
                    onClick={() => handleOpenTracking(selectedOrder.id, selectedOrder.orderNumber)}
                    className="flex-1"
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Track Order
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {/* Error State - if order details failed to load */}
          {!orderDetailsLoading && !selectedOrder && selectedOrderId && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load order details</h3>
              <p className="text-gray-500">Please try again or contact support if the problem persists.</p>
              <Button 
                variant="outline" 
                onClick={handleCloseOrderDetails}
                className="mt-4"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Tracking Modal */}
      {trackingOrderId && (
        <OrderTrackingModal
          isOpen={isTrackingModalOpen}
          onClose={handleCloseTracking}
          orderId={trackingOrderId!}
          orderNumber={trackingOrderNumber}
        />
      )}
    </>
  );
};

export default OrdersSection;
