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
  Loader2
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
}

const OrdersSection: React.FC<OrdersSectionProps> = ({
  orders,
  ordersLoading,
  pagination,
  currentPage,
  totalPages,
  onPageChange
}) => {
  const { formatPrice } = useCurrency();
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<number | null>(null);
  const [trackingOrderNumber, setTrackingOrderNumber] = useState<string>('');

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
            <div className="space-y-4">
              {orders.map((order: Order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
                  {/* Order Header - Date Prominent */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
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
                          {order.items?.length || 0} items • {formatPrice(toNumber(order.shipping))} shipping
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(order.status)}
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          {formatPrice(toNumber(order.total))}
                        </div>
                        <div className="text-sm text-gray-500">{order.currency}</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewOrderDetails(order)}
                      className="flex-1"
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenTracking(order.id, order.orderNumber)}
                      className="flex-1"
                    >
                      Track Order
                    </Button>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <DialogHeader className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="h-6 w-6 text-gray-600" />
                <div>
                  <DialogTitle className="text-xl font-semibold text-gray-900">
                    Order Details
                  </DialogTitle>
                  <p className="text-sm text-gray-500">#{selectedOrder?.orderNumber}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Order Date</div>
                <div className="font-medium text-sm">
                  {selectedOrder && new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Overview */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Status</div>
                  <div className="font-medium">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Payment</div>
                  <div className="font-medium">{selectedOrder.paymentStatus}</div>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Tracking</div>
                  <div className="font-medium text-sm">
                    {selectedOrder.trackingNumber || 'Not available'}
                  </div>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Items</div>
                  <div className="font-medium">{selectedOrder.items?.length || 0} items</div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Breakdown</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(toNumber(selectedOrder.subtotal))}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">{formatPrice(toNumber(selectedOrder.tax))}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">{formatPrice(toNumber(selectedOrder.shipping))}</span>
                  </div>
                  
                  {toNumber(selectedOrder.discount) > 0 && (
                    <div className="flex justify-between items-center py-2 bg-green-50 p-3 rounded-lg">
                      <span className="text-green-700 font-medium">Discount Applied</span>
                      <span className="text-green-700 font-bold">
                        -{formatPrice(toNumber(selectedOrder.discount))}
                      </span>
                    </div>
                  )}
                  
                  <hr className="my-4" />
                  
                  <div className="flex justify-between items-center py-3 bg-gray-50 p-4 rounded-lg">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatPrice(toNumber(selectedOrder.total))} {selectedOrder.currency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
                  <span className="text-sm text-gray-500">{selectedOrder.items?.length || 0} items</span>
                </div>
                
                <div className="space-y-4">
                  {selectedOrder.items?.map((item: OrderItem) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-4">
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
                          {(item.size || item.color || item.productSku) && (
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
                              {item.productSku && (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 font-mono">
                                  SKU: {item.productSku}
                                </span>
                              )}
                            </div>
                          )}
                          
                          {/* Price and Quantity */}
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              Qty: {item.quantity} × {formatPrice(toNumber(item.price))}
                            </div>
                            <div className="font-semibold text-gray-900">
                              {formatPrice(toNumber(item.total))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Information */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                
                <div className="grid grid-cols-1 gap-6">
                  {/* Contact Details */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">Contact Details</h4>
                    
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
                      <h4 className="font-medium text-gray-800 mb-3">Shipping Address</h4>
                      
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                          <div>
                            <p className="font-medium text-gray-900 mb-2">
                              {selectedOrder.shippingFirstName} {selectedOrder.shippingLastName}
                            </p>
                            
                            {selectedOrder.shippingCompany && (
                              <p className="text-gray-700 mb-2">{selectedOrder.shippingCompany}</p>
                            )}
                            
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
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Notes</h3>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
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
