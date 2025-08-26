import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  Filter, 
  RefreshCw, 
  Eye, 
  Edit, 
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Package,
  Truck,
  Calendar,
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  X,
  Activity,
  Info
} from 'lucide-react';
import { ImageWithPlaceholder } from '../ui/image-with-placeholder';
import { getFullImageUrl } from '../../utils/imageUtils';
import { useClerkAuth } from '../../hooks/useClerkAuth';
import { getApiBaseUrl } from '../../config/api';
import { toast } from 'sonner';
import { DatePicker } from '../ui/date-picker';


interface Order {
  id: number;
  orderNumber: string;
  orderStatus: string;      // Business decision status
  deliveryStatus: string;   // Fulfillment tracking status
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  paymentStatus: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  lastStatusUpdate: string;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
  actualDeliveryDate?: string;
  profitMargin?: number;
  costOfGoods?: number;
  totalItems: number;
  averageItemValue?: number;
  notes?: string;
  
  // Shipping Information
  shippingCompany?: string;
  shippingMethod?: string;
  shippingCost: number;
  shippingWeight?: number;
  shippingDimensions?: string;
  
  // Shipping Address Information
  shippingFirstName?: string;
  shippingLastName?: string;
  shippingAddress1?: string;
  shippingAddress2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  shippingPhone?: string;
  
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    id: number;
    productName: string;
    productSku?: string;
    size?: string;
    color?: string;
    quantity: number;
    price: number;
    total: number;
    costPrice?: number; // Product cost for profit calculation
    product?: {
      id: number;
      name: string;
      costPrice?: number;
                          images?: Array<{
                      url: string;
                      alt?: string;
                      color?: string;
                      isPrimary: boolean;
                      sortOrder: number;
                    }>;
    };
    variant?: {
      costPrice?: number;
      size?: string;
      color?: string;
      colorCode?: string;
    };
  }>;
  payments: Array<{
    id: number;
    amount: number;
    currency: string;
    status: string;
    method: string;
    transactionId?: string;
    createdAt: string;
  }>;
}

interface OrderFilters {
  status?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  customerEmail?: string;
  orderNumber?: string;
  minAmount?: string;
  maxAmount?: string;
}

interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalProfit: number;
  totalCost: number;
  profitMargin: number;
}

const OrderManagement: React.FC = () => {
  const { getToken } = useClerkAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);

  // Helper function to get variant-specific image
  // const getVariantImage = (item: any) => {
  //   if (!item.product?.images || item.product.images.length === 0) {
  //     return null;
  //   }

  //   // First, try to find an image that matches the variant's color
  //   if (item.variant?.color) {
  //     const colorSpecificImage = item.product.images.find((img: any) => 
  //       img.color && img.color.toLowerCase() === item.variant.color.toLowerCase()
  //     );
  //     if (colorSpecificImage) {
  //       return colorSpecificImage;
  //     }
  //   }

  //   // If no color-specific image found, try to find the primary image
  //   const primaryImage = item.product.images.find((img: any) => img.isPrimary);
  //   if (primaryImage) {
  //     return colorSpecificImage;
  //   }

  //   // Fallback to the first image
  //   return item.product.images[0];
  // };
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<OrderFilters>({});
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [salesMetrics, setSalesMetrics] = useState<SalesMetrics | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [deliveryUpdateOpen, setDeliveryUpdateOpen] = useState(false);
  const [bulkUpdateOpen, setBulkUpdateOpen] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [deliveryFormData, setDeliveryFormData] = useState({
    deliveryStatus: 'PENDING',
    trackingNumber: '', // Keep for display only
    estimatedDelivery: ''
  });
  const [bulkUpdateNotes, setBulkUpdateNotes] = useState('');
  const [bulkUpdateStatus, setBulkUpdateStatus] = useState('APPROVED');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });

  // Mobile filter state
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Handle search input (no automatic filtering)
  const handleSearchChange = (field: keyof OrderFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Handle filter changes (no automatic filtering)
  const handleFilterChange = (field: keyof OrderFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value === 'all' ? undefined : value }));
  };

  // Handle date changes (no automatic filtering)
  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date);
  };

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date);
  };

  // No automatic filtering - all filters work only when Apply Filters is clicked

  // Debug: Log form data changes
  useEffect(() => {
    console.log('Delivery form data changed:', deliveryFormData);
  }, [deliveryFormData]);

  // Debug: Log selected order changes
  useEffect(() => {
    console.log('Selected order changed:', selectedOrder);
  }, [selectedOrder]);

  // Debug: Log status update dialog state
  useEffect(() => {
    console.log('Status update dialog state:', { statusUpdateOpen, selectedOrder: selectedOrder?.orderStatus });
  }, [statusUpdateOpen, selectedOrder?.orderStatus]);

  // Close status update dialog if selectedOrder becomes null
  useEffect(() => {
    if (statusUpdateOpen && !selectedOrder) {
      setStatusUpdateOpen(false);
    }
  }, [statusUpdateOpen, selectedOrder]);

  // Handle URL parameter for auto-opening order details
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId && orders.length > 0) {
      const orderIdNum = parseInt(orderId);
      const order = orders.find(o => o.id === orderIdNum);
      if (order) {
        console.log('🔍 Auto-opening order details for order ID:', orderId);
        
        // Fetch complete order details before opening dialog (same logic as View Details button)
        const fetchAndOpenOrderDetails = async () => {
          try {
            const token = await getToken();
            if (!token) return;
            
            const response = await fetch(`${getApiBaseUrl()}/admin/orders/${orderIdNum}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              setSelectedOrder(data.data);
              setOrderDetailOpen(true);
            } else {
              console.error('Failed to fetch order details:', response.status);
              toast.error('Failed to fetch order details');
            }
          } catch (error) {
            console.error('Error fetching order details:', error);
            toast.error('Failed to fetch order details');
          }
        };
        
        fetchAndOpenOrderDetails();
        
        // Remove the orderId parameter from URL
        setSearchParams(prev => {
          const newParams = new URLSearchParams(prev);
          newParams.delete('orderId');
          return newParams;
        });
      }
    }
  }, [orders, searchParams, setSearchParams, getToken]);

  // Fetch orders
  const fetchOrders = useCallback(async (overrideFilters?: Partial<OrderFilters>) => {
    try {
      setLoading(true);
      const token = await getToken();
      console.log('Fetching orders with token:', token ? 'Token exists' : 'No token');
      if (!token) {
        console.error('No authentication token available');
        toast.error('Authentication required');
        return;
      }

      const queryParams = new URLSearchParams();
      queryParams.append('page', currentPage.toString());
      queryParams.append('limit', '20');
      
      // Use override filters if provided, otherwise use current filters
      const filtersToUse = overrideFilters ? { ...filters, ...overrideFilters } : filters;
      
      Object.entries(filtersToUse).forEach(([key, value]) => {
        if (value && key !== 'page') queryParams.append(key, value);
      });

      const apiUrl = `${getApiBaseUrl()}/admin/orders?${queryParams}`;
      console.log('Calling orders API:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Orders API response:', data); // Debug log
        
        // Handle the actual response structure
        if (data.orders) {
          // Transform the orders to match expected format
          const transformedOrders = data.orders.map((order: any) => ({
            ...order,
            // Handle different field names
            totalItems: order.totalItems || order.itemsCount || 0,
            paymentStatus: order.paymentStatus || 'PAID',
            currency: order.currency || 'USD',
            // Handle user object vs direct fields
            user: order.user || {
              id: order.userId || 0,
              name: order.customerName || 'Unknown',
              email: order.customerEmail || 'unknown@example.com',
              phone: order.customerPhone
            },
            // Ensure numeric fields
            total: typeof order.total === 'string' ? parseFloat(order.total) : order.total,
            subtotal: typeof order.subtotal === 'string' ? parseFloat(order.subtotal) : (order.subtotal || 0),
            tax: typeof order.tax === 'string' ? parseFloat(order.tax) : (order.tax || 0),
            shipping: typeof order.shipping === 'string' ? parseFloat(order.shipping) : (order.shipping || 0),
            discount: typeof order.discount === 'string' ? parseFloat(order.discount) : (order.discount || 0)
          }));
          
          setOrders(transformedOrders);
          // Set default pagination if not provided
          const defaultPagination = {
            page: currentPage,
            limit: 20,
            total: data.orders.length,
            totalPages: 1
          };
          setPagination(data.pagination || defaultPagination);
          setTotalPages(data.pagination?.totalPages || 1);
        } else if (data.data?.orders) {
          // Fallback to nested structure if it exists
          setOrders(data.data.orders);
          setPagination(data.data.pagination);
          setTotalPages(data.data.pagination.totalPages);
        } else {
          console.error('Unexpected response structure:', data);
          toast.error('Unexpected response format');
        }
      } else {
        // Handle non-OK responses
        const errorText = await response.text();
        console.error('Orders API error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        if (response.status === 304) {
          // 304 Not Modified - this is actually OK, just use cached data
          console.log('Orders API returned 304 - using cached data');
        } else {
          toast.error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [getToken, currentPage, filters]);

  // Fetch sales metrics
  const fetchSalesMetrics = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`${getApiBaseUrl()}/admin/orders/sales/metrics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSalesMetrics(data.data);
      }
    } catch (error) {
      console.error('Error fetching sales metrics:', error);
    }
  }, [getToken]);

  // Update order status
  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const token = await getToken();
      if (!token) return;

      // Update the order status (business logic)
      const response = await fetch(`${getApiBaseUrl()}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          newStatus,
          statusType: 'order' // Specify we're updating the order status
        })
      });

      if (response.ok) {
        toast.success('Order status updated successfully');
        fetchOrders();
        fetchSalesMetrics();
        setStatusUpdateOpen(false);
        setSelectedOrder(null);
      } else {
        toast.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  // Refresh order details for the currently selected order
  const refreshOrderDetails = async (orderId: number) => {
    try {
      console.log('🔍 Starting refreshOrderDetails for orderId:', orderId);
      
      const token = await getToken();
      if (!token) return;
      
      const response = await fetch(`${getApiBaseUrl()}/admin/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Received refreshed order data:', data.data);
        setSelectedOrder(data.data);
        console.log('🔍 selectedOrder state updated');
      } else {
        console.error('Failed to refresh order details');
      }
    } catch (error) {
      console.error('Error refreshing order details:', error);
    }
  };

  // Update delivery information
  const updateDeliveryStatus = async (orderId: number, deliveryData: {
    deliveryStatus: string;
    estimatedDelivery?: string;
  }) => {
    try {
      const token = await getToken();
      if (!token) return;

      // Update order status and delivery information in a single call
      const updateData: any = {
        newStatus: deliveryData.deliveryStatus,
        statusType: 'delivery' // Required field for delivery updates
      };

      // Add estimated delivery date if provided
      if (deliveryData.estimatedDelivery) {
        // Convert the ISO string to a Date object for the backend
        updateData.estimatedDelivery = new Date(deliveryData.estimatedDelivery);
      }



      const statusResponse = await fetch(`${getApiBaseUrl()}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (statusResponse.ok) {
        toast.success('Delivery information updated successfully');
        
        console.log('🔍 Delivery update successful, refreshing data...');
        console.log('🔍 Current selectedOrder before refresh:', selectedOrder);
        
        // Refresh the order management list
        fetchOrders();
        fetchSalesMetrics();
        
        // Refresh the current order details to show updated data
        await refreshOrderDetails(orderId);
        
        console.log('🔍 Order details refreshed, selectedOrder after refresh:', selectedOrder);
        
        // Close only the delivery dialog, keep parent dialog open
        setDeliveryUpdateOpen(false);
        resetDeliveryForm();
        
        console.log('🔍 Delivery dialog closed, parent dialog should remain open');
      } else {
        const errorData = await statusResponse.json();
        toast.error(`Failed to update delivery information: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating delivery information:', error);
      toast.error('Failed to update delivery information');
    }
  };

  // Update shipping company
  const updateShippingCompany = async (orderId: number, shippingCompany: string) => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`${getApiBaseUrl()}/admin/orders/${orderId}/shipping-company`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ shippingCompany })
      });

      if (response.ok) {
        toast.success('Shipping company updated successfully');
        fetchOrders();
        fetchSalesMetrics();
      } else {
        toast.error('Failed to update shipping company');
      }
    } catch (error) {
      console.error('Error updating shipping company:', error);
      toast.error('Failed to update shipping company');
    }
  };

  // Bulk update orders
  const bulkUpdateOrders = async (newStatus: string, notes?: string) => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`${getApiBaseUrl()}/admin/orders/bulk-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderIds: selectedOrders, newStatus, notes })
      });

      if (response.ok) {
        toast.success(`Successfully updated ${selectedOrders.length} orders`);
        setSelectedOrders([]);
        setBulkUpdateOpen(false);
        setBulkUpdateNotes('');
        setBulkUpdateStatus('CONFIRMED');
        fetchOrders();
        fetchSalesMetrics();
      } else {
        toast.error('Failed to bulk update orders');
      }
    } catch (error) {
      console.error('Error bulk updating orders:', error);
      toast.error('Failed to bulk update orders');
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchOrders();
    fetchSalesMetrics();
  }, [fetchOrders, fetchSalesMetrics]);

  // Get status color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PENDING_APPROVAL': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-blue-100 text-blue-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'CANCELLED': 'bg-red-100 text-red-800',
      'ON_HOLD': 'bg-orange-100 text-orange-800',
      'READY_TO_PROCESS': 'bg-purple-100 text-purple-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'PARTIALLY_REFUNDED': 'bg-orange-100 text-orange-800',
      'FULLY_REFUNDED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Get delivery status color
  const getDeliveryStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PENDING': 'bg-gray-100 text-gray-800',
      'PREPARING': 'bg-blue-100 text-blue-800',
      'SHIPPED': 'bg-indigo-100 text-indigo-800',
      'IN_TRANSIT': 'bg-purple-100 text-purple-800',
      'OUT_FOR_DELIVERY': 'bg-orange-100 text-orange-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'DELIVERY_FAILED': 'bg-red-100 text-red-800',
      'RETURNED': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Reset delivery form
  const resetDeliveryForm = () => {
    setDeliveryFormData({
      deliveryStatus: 'PENDING',
      trackingNumber: '', // Keep for display only
      estimatedDelivery: ''
    });
  };

  // Get payment status color
  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PAID': 'bg-green-100 text-green-800',
      'FAILED': 'bg-red-100 text-red-800',
      'REFUNDED': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Format currency without trailing zeros
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-1 sm:p-3 md:p-6">
      <div className="w-full space-y-3 sm:space-y-6 md:space-y-8">
        {/* Enhanced Header with Better Glassmorphism */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-green-600/20 to-purple-600/20 rounded-xl sm:rounded-2xl md:rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-700"></div>
          <div className="relative bg-white/80 backdrop-blur-2xl rounded-xl sm:rounded-2xl md:rounded-3xl p-2 sm:p-4 md:p-8 border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="p-3 bg-gradient-to-br from-blue-500 via-green-600 to-purple-600 rounded-2xl shadow-lg">
                      <Package className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 bg-clip-text text-transparent">
                      Order Management
                    </h1>
                    <p className="text-slate-600 text-sm sm:text-base font-medium">Manage orders, track shipments, and monitor sales performance</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => fetchOrders()}
                  disabled={loading}
                  className="bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80 transition-all duration-300"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                {selectedOrders.length > 0 && (
                  <Button
                    onClick={() => setBulkUpdateOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Bulk Update ({selectedOrders.length})
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        {salesMetrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total Revenue</p>
                  <p className="text-lg font-bold text-slate-800">{formatCurrency(salesMetrics.totalRevenue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total Orders</p>
                  <p className="text-lg font-bold text-slate-800">{salesMetrics.totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Average Order</p>
                  <p className="text-lg font-bold text-slate-800">{formatCurrency(salesMetrics.averageOrderValue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Profit Margin</p>
                  <p className="text-lg font-bold text-slate-800">{salesMetrics.profitMargin.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Filters - Collapsible on Mobile */}
        <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
          <CardHeader 
            className="cursor-pointer"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 hidden sm:inline">Click to toggle</span>
                {isFiltersOpen ? (
                  <ChevronUp className="h-5 w-5 text-slate-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-600" />
                )}
              </div>
            </div>
          </CardHeader>
          {isFiltersOpen && (
            <CardContent>
              {/* Filter Section */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-4">Filter Orders</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Order Status</label>
                  <Select
                    value={filters.status || 'all'}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/30 focus:border-blue-500">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      <SelectItem value="ON_HOLD">On Hold</SelectItem>
                      <SelectItem value="READY_TO_PROCESS">Ready to Process</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="PARTIALLY_REFUNDED">Partially Refunded</SelectItem>
                      <SelectItem value="FULLY_REFUNDED">Fully Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Payment Status</label>
                  <Select
                    value={filters.paymentStatus || 'all'}
                    onValueChange={(value) => handleFilterChange('paymentStatus', value)}
                  >
                    <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/30 focus:border-blue-500">
                      <SelectValue placeholder="All Payment Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payment Statuses</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                      <SelectItem value="REFUNDED">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Date From</label>
                  <DatePicker
                    value={dateFrom}
                    onChange={handleDateFromChange}
                    placeholder="Select start date"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Date To</label>
                  <DatePicker
                    value={dateTo}
                    onChange={handleDateToChange}
                    placeholder="Select end date"
                  />
                </div>
              </div>
              </div>

              {/* Search Fields - Clean Layout */}
              <div className="mt-6 pt-4 border-t border-white/20">
                <h4 className="text-sm font-semibold text-slate-700 mb-4">Search Orders</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Customer Email</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search by customer email"
                        value={filters.customerEmail || ''}
                        onChange={(e) => handleSearchChange('customerEmail', e.target.value)}
                        className="pl-10 bg-white/60 backdrop-blur-sm border-white/30 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">Order Number</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search by order number"
                        value={filters.orderNumber || ''}
                        onChange={(e) => handleSearchChange('orderNumber', e.target.value)}
                        className="pl-10 bg-white/60 backdrop-blur-sm border-white/30 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-6">
                <Button
                  onClick={() => {
                    setFilters({});
                    setDateFrom(undefined);
                    setDateTo(undefined);
                    setCurrentPage(1);
                    fetchOrders({});
                  }}
                  variant="outline"
                  className="bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80 transition-all duration-300"
                >
                  Clear Filters
                </Button>
                <Button
                  onClick={() => {
                    const newDateFrom = dateFrom ? `${dateFrom.getFullYear()}-${String(dateFrom.getMonth() + 1).padStart(2, '0')}-${String(dateFrom.getDate()).padStart(2, '0')}` : undefined;
                    const newDateTo = dateTo ? `${dateTo.getFullYear()}-${String(dateTo.getMonth() + 1).padStart(2, '0')}-${String(dateTo.getDate()).padStart(2, '0')}` : undefined;
                    
                    const allFilters = {
                      ...filters,
                      dateFrom: newDateFrom,
                      dateTo: newDateTo
                    };
                    
                    setFilters(prev => ({
                      ...prev,
                      dateFrom: newDateFrom,
                      dateTo: newDateTo,
                      page: 1
                    }));
                    setCurrentPage(1);
                    fetchOrders(allFilters);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Enhanced Orders Display - Responsive Divs instead of Table */}
        <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-800">Orders ({pagination.total})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-slate-600">Loading orders...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Desktop Table View */}
                <div className="hidden lg:block">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/20 bg-slate-50/50">
                          <th className="text-left py-4 px-4">
                            <input
                              type="checkbox"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedOrders(orders.map(o => o.id));
                                } else {
                                  setSelectedOrders([]);
                                }
                              }}
                              checked={selectedOrders.length === orders.length && orders.length > 0}
                              className="rounded border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                            />
                          </th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700 text-sm uppercase tracking-wide">Order</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700 text-sm uppercase tracking-wide">Customer</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700 text-sm uppercase tracking-wide">Status</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700 text-sm uppercase tracking-wide">Payment</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700 text-sm uppercase tracking-wide">Delivery Status</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700 text-sm uppercase tracking-wide">Total</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700 text-sm uppercase tracking-wide">Date</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700 text-sm uppercase tracking-wide">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order, index) => (
                          <tr key={order.id} className={`border-b border-white/10 hover:bg-white/20 transition-all duration-200 ${
                            index % 2 === 0 ? 'bg-white/40' : 'bg-slate-50/40'
                          }`}>
                            <td className="py-3 px-4">
                              <input
                                type="checkbox"
                                checked={selectedOrders.includes(order.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedOrders(prev => [...prev, order.id]);
                                  } else {
                                    setSelectedOrders(prev => prev.filter(id => id !== order.id));
                                  }
                                }}
                                className="rounded border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-slate-800">#{order.orderNumber}</p>
                                  <Badge variant="outline" className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200">
                                    {order.totalItems} items
                                  </Badge>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium text-slate-800">{order.user.name}</p>
                                <p className="text-sm text-slate-600">{order.user.email}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={getStatusColor(order.orderStatus)}>
                                {order.orderStatus}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                                {order.paymentStatus}
                              </Badge>
                            </td>
                                                        <td className="py-3 px-4">
                              <Badge className={getDeliveryStatusColor(order.deliveryStatus)}>
                                {order.deliveryStatus}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium text-slate-800">
                                  {formatCurrency(order.total, order.currency)}
                                </p>
                                {order.profitMargin && (
                                  <p className="text-sm text-green-600">
                                    {order.profitMargin.toFixed(1)}% margin
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="text-sm text-slate-800">
                                  {formatDate(order.createdAt)}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      // Fetch full order details before opening dialog
                                      const token = await getToken();
                                      if (!token) return;
                                      
                                      const response = await fetch(`${getApiBaseUrl()}/admin/orders/${order.id}`, {
                                        headers: {
                                          'Authorization': `Bearer ${token}`
                                        }
                                      });
                                      
                                      if (response.ok) {
                                        const data = await response.json();
                                        setSelectedOrder(data.data);
                                        setOrderDetailOpen(true);
                                      } else {
                                        toast.error('Failed to fetch order details');
                                      }
                                    } catch (error) {
                                      console.error('Error fetching order details:', error);
                                      toast.error('Failed to fetch order details');
                                    }
                                  }}
                                  className="hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    console.log('Opening status update dialog for order:', order);
                                    setSelectedOrder(order);
                                    // Use setTimeout to ensure selectedOrder is set before opening dialog
                                    setTimeout(() => {
                                      setStatusUpdateOpen(true);
                                    }, 0);
                                  }}
                                  className="hover:bg-green-50 hover:text-green-600 transition-all duration-200"
                                  title="Update Status"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>

                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                                 {/* Mobile Card View */}
                 <div className="lg:hidden space-y-4">
                   {orders.map((order, index) => (
                     <div 
                       key={order.id} 
                       className={`${
                         index % 2 === 0 
                           ? 'bg-white/80 backdrop-blur-xl' 
                           : 'bg-slate-50/80 backdrop-blur-xl'
                       } rounded-xl p-4 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300`}
                     >
                                             {/* Header with checkbox and order info */}
                       <div className="flex items-start justify-between mb-4 p-3 bg-slate-50/50 rounded-lg border border-white/20">
                         <div className="flex items-center gap-3">
                           <input
                             type="checkbox"
                             checked={selectedOrders.includes(order.id)}
                             onChange={(e) => {
                               if (e.target.checked) {
                                 setSelectedOrders(prev => [...prev, order.id]);
                               } else {
                                 setSelectedOrders(prev => prev.filter(id => id !== order.id));
                               }
                             }}
                             className="rounded border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 mt-1"
                           />
                           <div>
                             <div className="flex items-center gap-2">
                               <p className="text-sm text-slate-600 font-medium">Order #{order.orderNumber}</p>
                               <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
                                 {order.totalItems}
                               </Badge>
                             </div>
                           </div>
                         </div>
                         <div className="text-right">
                           <p className="font-bold text-lg text-slate-800">
                             {formatCurrency(order.total, order.currency)}
                           </p>
                           {order.profitMargin && (
                             <p className="text-sm text-green-600">
                               {order.profitMargin.toFixed(1)}% margin
                             </p>
                           )}
                         </div>
                       </div>

                                             {/* Customer and Status Info */}
                       <div className="grid grid-cols-1 gap-3 mb-4">
                         <div className="flex items-center justify-between p-2 bg-slate-50/50 rounded-lg">
                           <span className="text-sm text-slate-600">Customer:</span>
                           <div className="text-right">
                             <p className="font-medium text-slate-800">{order.user.name}</p>
                             <p className="text-xs text-slate-600">{order.user.email}</p>
                           </div>
                         </div>
                         
                         {/* Status and Payment in single row */}
                         <div className="grid grid-cols-2 gap-2">
                           <div className="p-2 bg-slate-50/50 rounded-lg text-center">
                             <Badge className={getStatusColor(order.orderStatus)}>
                               {order.orderStatus}
                             </Badge>
                           </div>
                           
                           <div className="p-2 bg-slate-50/50 rounded-lg text-center">
                             <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                               {order.paymentStatus}
                             </Badge>
                           </div>
                         </div>
                         
                         {/* Shipping Information */}
                         {order.shippingCompany && (
                           <div className="flex items-center justify-between p-2 bg-slate-50/50 rounded-lg">
                             <span className="text-sm text-slate-600">Shipping:</span>
                             <div className="text-right">
                               <p className="text-sm text-slate-800 font-medium">{order.shippingCompany}</p>
                               {order.trackingNumber && (
                                 <p className="text-xs text-slate-500">#{order.trackingNumber}</p>
                               )}
                             </div>
                           </div>
                         )}
                         
                         <div className="flex items-center justify-between p-2 bg-slate-50/50 rounded-lg">
                           <span className="text-sm text-slate-600">Date:</span>
                           <span className="text-sm text-slate-800">{formatDate(order.createdAt)}</span>
                         </div>
                         
                         {order.estimatedDelivery && (
                           <div className="flex items-center justify-between p-2 bg-blue-50/50 rounded-lg border border-blue-200/50">
                             <span className="text-sm text-blue-700 font-medium">Est. Delivery:</span>
                             <span className="text-sm text-blue-800 font-medium">{formatDate(order.estimatedDelivery)}</span>
                           </div>
                         )}
                       </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/20">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              // Fetch full order details before opening dialog
                              const token = await getToken();
                              if (!token) return;
                              
                              const response = await fetch(`${getApiBaseUrl()}/admin/orders/${order.id}`, {
                                headers: {
                                  'Authorization': `Bearer ${token}`
                                }
                              });
                              
                              if (response.ok) {
                                const data = await response.json();
                                setSelectedOrder(data.data);
                                setOrderDetailOpen(true);
                              } else {
                                toast.error('Failed to fetch order details');
                              }
                            } catch (error) {
                              console.error('Error fetching order details:', error);
                              toast.error('Failed to fetch order details');
                            }
                          }}
                          className="bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80 transition-all duration-300 text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            console.log('Opening status update dialog for order (mobile):', order);
                            setSelectedOrder(order);
                            // Use setTimeout to ensure selectedOrder is set before opening dialog
                            setTimeout(() => {
                              setStatusUpdateOpen(true);
                            }, 0);
                          }}
                          className="bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80 transition-all duration-300 text-xs"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Status
                        </Button>

                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/20">
                <p className="text-sm text-slate-600">
                  Showing page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80 transition-all duration-300"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80 transition-all duration-300"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Order Detail Modal */}
      <Dialog 
        open={orderDetailOpen} 
        onOpenChange={(open) => {
          console.log('🔍 Order details dialog onOpenChange:', open);
          console.log('🔍 selectedOrder when dialog state changes:', selectedOrder);
          setOrderDetailOpen(open);
        }}
      >
        <DialogContent className="max-w-4xl w-screen sm:w-[95vw] max-h-[90vh] overflow-y-auto p-3 sm:p-6 bg-white/95 backdrop-blur-xl border border-white/30">
          <DialogHeader className="mb-3 sm:mb-6">
            <DialogTitle className="text-lg sm:text-2xl font-bold text-slate-800 flex items-center gap-2 sm:gap-3 text-center sm:text-left">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <span className="hidden sm:inline">Order Details - #{selectedOrder?.orderNumber}</span>
              <span className="sm:hidden">Order #{selectedOrder?.orderNumber}</span>
            </DialogTitle>
            <p className="text-xs sm:text-base text-slate-600 text-center sm:text-left">
              <span className="hidden sm:inline">Complete order information including items, costs, and financial summary</span>
              <span className="sm:hidden">Order details and financial summary</span>
            </p>
          </DialogHeader>
          {selectedOrder && selectedOrder.items ? (
            <div className="space-y-4 sm:space-y-6">
              {/* Enhanced Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="text-base sm:text-lg text-slate-800">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 space-y-2 sm:space-y-3">
                    <div className="flex justify-between p-2 bg-slate-50/50 rounded-lg">
                      <span className="text-slate-600 font-medium">Order Status:</span>
                      <Badge className={getStatusColor(selectedOrder.orderStatus)}>
                        {selectedOrder.orderStatus}
                      </Badge>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-50/50 rounded-lg">
                      <span className="text-slate-600 font-medium">Payment:</span>
                      <Badge className={getPaymentStatusColor(selectedOrder.paymentStatus)}>
                        {selectedOrder.paymentStatus}
                      </Badge>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-50/50 rounded-lg">
                      <span className="text-slate-600 font-medium">Created:</span>
                      <span className="text-slate-800 font-medium">{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-50/50 rounded-lg">
                      <span className="text-slate-600 font-medium">Last Updated:</span>
                      <span className="text-slate-800 font-medium">{selectedOrder.lastStatusUpdate ? formatDate(selectedOrder.lastStatusUpdate) : 'N/A'}</span>
                    </div>
                    
                    <div className="flex justify-between p-2 bg-slate-50/50 rounded-lg">
                      <span className="text-slate-600 font-medium">Actual Delivery:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-800 font-medium">
                          {selectedOrder.actualDeliveryDate 
                            ? formatDate(selectedOrder.actualDeliveryDate)
                            : 'Not delivered yet'
                          }
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder({ ...selectedOrder, actualDeliveryDate: new Date().toISOString() });
                          }}
                          className="h-6 px-2 text-xs bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80 transition-all duration-300"
                        >
                          Set Today
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="text-base sm:text-lg text-slate-800">Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 space-y-2 sm:space-y-3">
                    <div className="flex justify-between p-2 bg-slate-50/50 rounded-lg">
                      <span className="text-slate-600 font-medium">Subtotal:</span>
                      <span className="text-slate-800 font-medium">{formatCurrency(selectedOrder.subtotal, selectedOrder.currency)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-50/50 rounded-lg">
                      <span className="text-slate-600 font-medium">Tax:</span>
                      <span className="text-slate-800 font-medium">{formatCurrency(selectedOrder.tax, selectedOrder.currency)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-50/50 rounded-lg">
                      <span className="text-slate-600 font-medium">Shipping:</span>
                      <span className="text-slate-800 font-medium">{formatCurrency(selectedOrder.shipping, selectedOrder.currency)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-50/50 rounded-lg">
                      <span className="text-gray-600 font-medium">Discount:</span>
                      <span className="text-slate-800 font-medium">{formatCurrency(selectedOrder.discount, selectedOrder.currency)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200/50">
                      <span className="text-slate-800">Total:</span>
                      <span className="text-blue-800">{formatCurrency(selectedOrder.total, selectedOrder.currency)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Order Items */}
              <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-base sm:text-lg text-slate-800">Order Items ({selectedOrder.items?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <div className="space-y-2 sm:space-y-3">
                    {selectedOrder.items?.map((item) => {
                      return (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm hover:shadow-md transition-all duration-200 gap-2 sm:gap-3">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-100">
                              {item.product?.images?.[0]?.url ? (
                                <ImageWithPlaceholder
                                  src={getFullImageUrl(item.product.images[0].url)}
                                  alt={item.productName}
                                  className="w-auto h-auto max-w-full max-h-[60px] sm:max-h-[80px] object-contain object-center"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm sm:text-base text-slate-800">{item.productName}</p>
                            <p className="text-xs sm:text-sm text-slate-600">
                              {item.quantity} × {formatCurrency(item.price, selectedOrder.currency)}
                              {item.size && ` • Size: ${item.size}`}
                              {item.color && ` • Color: ${item.color}`}
                            </p>
                            {item.productSku && (
                              <p className="text-xs text-slate-500">SKU: {item.productSku}</p>
                            )}
                          </div>
                          
                          {/* Price and Profit Information */}
                          <div className="text-right sm:text-left sm:min-w-[120px]">
                            <p className="font-medium text-sm sm:text-base text-slate-800">
                              {formatCurrency(item.total, selectedOrder.currency)}
                            </p>
                            {item.costPrice && (
                              <div className="text-xs text-slate-600 mt-1">
                                <p>Cost: {formatCurrency(Number(item.costPrice) * item.quantity, selectedOrder.currency)}</p>
                                <p className="text-green-600 font-medium">
                                  Profit: {formatCurrency((Number(item.price) - Number(item.costPrice)) * item.quantity, selectedOrder.currency)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Enhanced Order Summary with Net Profit */}
                    {selectedOrder.items?.some(item => item.costPrice) && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-4 sm:mb-6 text-base sm:text-lg">Financial Summary</h4>
                        
                        {/* Basic Metrics */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm mb-4 sm:mb-6">
                          <div>
                            <p className="text-gray-600">Total Revenue:</p>
                            <p className="font-medium">{formatCurrency(selectedOrder.total, selectedOrder.currency)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Product Costs:</p>
                            <p className="font-medium">
                              {formatCurrency(
                                selectedOrder.items?.reduce((sum, item) => 
                                  sum + (Number(item.costPrice) || 0) * item.quantity, 0
                                ) || 0, 
                                selectedOrder.currency
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Profit Calculations */}
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                          <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                            <div>
                              <p className="text-gray-600">Gross Profit:</p>
                              <p className="font-medium text-green-600">
                                {formatCurrency(
                                  selectedOrder.total - (selectedOrder.items?.reduce((sum, item) => 
                                    sum + (Number(item.costPrice) || 0) * item.quantity, 0
                                  ) || 0), 
                                  selectedOrder.currency
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Profit Margin:</p>
                              <p className="font-medium text-green-600">
                                {(() => {
                                  const totalCost = selectedOrder.items?.reduce((sum, item) => 
                                    sum + (Number(item.costPrice) || 0) * item.quantity, 0
                                  ) || 0;
                                  const profit = selectedOrder.total - totalCost;
                                  return totalCost > 0 ? `${((profit / selectedOrder.total) * 100).toFixed(1)}%` : 'N/A';
                                })()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Net Profit Section */}
                        <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                            <div>
                              <p className="text-blue-800 font-semibold text-sm sm:text-base">Net Profit (Your Money)</p>
                              <p className="text-xs text-blue-600">After immediate deductions</p>
                            </div>
                            <div className="text-right sm:text-left">
                              <p className="text-xl sm:text-2xl font-bold text-blue-800">
                                {formatCurrency(
                                  (() => {
                                    const totalCost = selectedOrder.items?.reduce((sum, item) => 
                                      sum + (Number(item.costPrice) || 0) * item.quantity, 0
                                    ) || 0;
                                    const grossProfit = selectedOrder.total - totalCost;
                                    
                                    // Calculate immediate deductions (tax + shipping)
                                    const tax = selectedOrder.tax || 0;
                                    const shipping = selectedOrder.shipping || 0;
                                    
                                    // Net profit = Gross profit - Tax - Shipping
                                    return grossProfit - tax - shipping;
                                  })(),
                                  selectedOrder.currency
                                )}
                              </p>
                              <p className="text-xs text-blue-600">
                                {(() => {
                                  const totalCost = selectedOrder.items?.reduce((sum, item) => 
                                    sum + (Number(item.costPrice) || 0) * item.quantity, 0
                                  ) || 0;
                                  const grossProfit = selectedOrder.total - totalCost;
                                  
                                  // Calculate immediate deductions (tax + shipping)
                                  const tax = selectedOrder.tax || 0;
                                  const shipping = selectedOrder.shipping || 0;
                                  
                                  // Net profit = Gross profit - Tax - Shipping
                                  const netProfit = grossProfit - tax - shipping;
                                  
                                  return totalCost > 0 ? `${((netProfit / selectedOrder.total) * 100).toFixed(1)}% of revenue` : 'N/A';
                                })()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Customer Information */}
              <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-base sm:text-lg text-slate-800">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between p-2 bg-slate-50/50 rounded-lg">
                      <span className="text-slate-600 font-medium">Name:</span>
                      <span className="text-slate-800 font-medium">{selectedOrder.user?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-50/50 rounded-lg">
                      <span className="text-slate-600 font-medium">Email:</span>
                      <span className="text-slate-800 font-medium">{selectedOrder.user?.email || 'N/A'}</span>
                    </div>
                    {selectedOrder.user?.phone && (
                      <div className="flex justify-between p-2 bg-slate-50/50 rounded-lg">
                        <span className="text-slate-600 font-medium">Phone:</span>
                        <span className="text-slate-800 font-medium">{selectedOrder.user?.phone}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Management Section */}
              <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
                <CardHeader className="p-3 sm:p-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg text-slate-800">Delivery Management</CardTitle>
                    <Button
                      onClick={() => {
                                                                           console.log('Opening delivery modal with order data:', {
                          estimatedDelivery: selectedOrder.estimatedDelivery,
                          orderStatus: selectedOrder.orderStatus,
                          trackingNumber: selectedOrder.trackingNumber,
                          fullOrder: selectedOrder
                        });
                        
                        const formData = {
                          deliveryStatus: selectedOrder.deliveryStatus || 'PENDING',
                          trackingNumber: selectedOrder.trackingNumber || '', // Keep for display only
                          shippingCompany: selectedOrder.shippingCompany || '',
                          estimatedDelivery: selectedOrder.estimatedDelivery || ''
                        };
                        
                        console.log('Setting form data:', formData);
                        setDeliveryFormData(formData);
                        setDeliveryUpdateOpen(true);
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      Manage Delivery
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between p-2 bg-slate-50/50 rounded-lg">
                        <span className="text-slate-600 font-medium">Delivery Status:</span>
                        <Badge className={getDeliveryStatusColor(selectedOrder.deliveryStatus || 'PENDING')}>
                          {selectedOrder.deliveryStatus || 'PENDING'}
                        </Badge>
                      </div>
                      <div className="flex justify-between p-2 bg-slate-50/50 rounded-lg">
                        <span className="text-slate-600 font-medium">Tracking Number:</span>
                        <span className="text-slate-800 font-medium">
                          {selectedOrder.trackingNumber || 'Not set'}
                        </span>
                      </div>
                      <div className="flex justify-between p-2 bg-slate-50/50 rounded-lg">
                        <span className="text-slate-600 font-medium">Shipping Company:</span>
                        <span className="text-slate-800 font-medium">
                          {selectedOrder.shippingCompany || 'Not set'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between p-2 bg-slate-50/50 rounded-lg">
                        <span className="text-slate-600 font-medium">Estimated Delivery:</span>
                        <span className="text-slate-800 font-medium">
                          {selectedOrder.estimatedDelivery ? formatDate(selectedOrder.estimatedDelivery) : 'Not set'}
                        </span>
                      </div>
                      <div className="flex justify-between p-2 bg-slate-50/50 rounded-lg">
                        <span className="text-slate-600 font-medium">Actual Delivery:</span>
                        <span className="text-slate-800 font-medium">
                          {selectedOrder.actualDeliveryDate ? formatDate(selectedOrder.actualDeliveryDate) : 'Not delivered'}
                        </span>
                      </div>

                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* Enhanced Shipping Address */}
              {(selectedOrder.shippingFirstName || selectedOrder.shippingAddress1) && (
                <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="text-base sm:text-lg text-slate-800">Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6">
                    <div className="space-y-2">
                      {(selectedOrder.shippingFirstName || selectedOrder.shippingLastName) && (
                        <div className="flex justify-between p-2 bg-slate-50/50 rounded-lg">
                          <span className="text-slate-600 font-medium">Name:</span>
                          <span className="text-slate-800 font-medium">
                            {selectedOrder.shippingFirstName} {selectedOrder.shippingLastName}
                          </span>
                        </div>
                      )}
                      {selectedOrder.shippingCompany && (
                        <div className="flex justify-between p-2 bg-slate-50/50 rounded-lg">
                          <span className="text-slate-600 font-medium">Shipping Company:</span>
                          <span className="text-slate-800 font-medium">{selectedOrder.shippingCompany}</span>
                        </div>
                      )}
                      {selectedOrder.shippingAddress1 && (
                        <div className="flex justify-between p-2 bg-slate-50/50 rounded-lg">
                          <span className="text-slate-600 font-medium">Address:</span>
                          <span className="text-right text-slate-800 font-medium">
                            {selectedOrder.shippingAddress1}
                            {selectedOrder.shippingAddress2 && (
                              <>
                                <br />
                                {selectedOrder.shippingAddress2}
                              </>
                            )}
                          </span>
                        </div>
                      )}
                      {(selectedOrder.shippingCity || selectedOrder.shippingState || selectedOrder.shippingPostalCode) && (
                        <div className="flex justify-between p-2 bg-slate-50/50 rounded-lg">
                          <span className="text-slate-600 font-medium">City/State/ZIP:</span>
                          <span className="text-slate-800 font-medium">
                            {selectedOrder.shippingCity}, {selectedOrder.shippingState} {selectedOrder.shippingPostalCode}
                          </span>
                        </div>
                      )}
                      {selectedOrder.shippingCountry && (
                        <div className="flex justify-between p-2 bg-slate-50/50 rounded-lg">
                          <span className="text-slate-600 font-medium">Country:</span>
                          <span className="text-slate-800 font-medium">{selectedOrder.shippingCountry}</span>
                        </div>
                      )}
                      {selectedOrder.shippingPhone && (
                        <div className="flex justify-between p-2 bg-slate-50/50 rounded-lg">
                          <span className="text-gray-600 font-medium">Phone:</span>
                          <span className="text-slate-800 font-medium">{selectedOrder.shippingPhone}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-600">Loading order details...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Enhanced Status Update Modal */}
      <Dialog open={statusUpdateOpen && !!selectedOrder} onOpenChange={setStatusUpdateOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-xl border border-white/30">
          <DialogHeader>
            <DialogTitle className="text-slate-800 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                <Edit className="h-5 w-5 text-white" />
              </div>
              Update Order Status
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Order Status</label>
                <Select
                  key={`status-select-${selectedOrder?.id}-${selectedOrder?.orderStatus}`}
                  onValueChange={(value) => {
                    if (selectedOrder) {
                      setSelectedOrder({ ...selectedOrder, orderStatus: value });
                    }
                  }}
                  value={selectedOrder?.orderStatus || ''}
                  defaultValue={selectedOrder?.orderStatus}
                >
                  <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/30 focus:border-blue-500">
                    <SelectValue placeholder="Select status">
                      {selectedOrder?.orderStatus || "Select status"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    <SelectItem value="READY_TO_PROCESS">Ready to Process</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="PARTIALLY_REFUNDED">Partially Refunded</SelectItem>
                    <SelectItem value="FULLY_REFUNDED">Fully Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>



              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStatusUpdateOpen(false)}
                  className="bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80 transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => updateOrderStatus(
                    selectedOrder.id,
                    selectedOrder.orderStatus || 'PENDING_APPROVAL'
                  )}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Update Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

            {/* Enhanced Bulk Update Modal */}
      <Dialog open={bulkUpdateOpen} onOpenChange={setBulkUpdateOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-xl border border-white/30">
          <DialogHeader>
            <DialogTitle className="text-slate-800 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              Bulk Update Orders ({selectedOrders.length})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">New Status</label>
              <Select
                value={bulkUpdateStatus}
                onValueChange={setBulkUpdateStatus}
              >
                <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/30 focus:border-blue-500">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="READY_TO_PROCESS">Ready to Process</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Notes (Optional)</label>
              <Input 
                placeholder="Add notes about this bulk update"
                value={bulkUpdateNotes}
                onChange={(e) => setBulkUpdateNotes(e.target.value)}
                className="bg-white/60 backdrop-blur-sm border-white/30 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setBulkUpdateOpen(false)}
                className="bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80 transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                onClick={() => bulkUpdateOrders(bulkUpdateStatus, bulkUpdateNotes)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Update All Orders
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comprehensive Delivery Management Modal */}
      <Dialog 
        open={deliveryUpdateOpen} 
        onOpenChange={(open) => {
          console.log('🔍 Delivery dialog onOpenChange:', open);
          console.log('🔍 Current selectedOrder:', selectedOrder);
          
          // Only close delivery dialog, don't affect parent dialog
          if (!open) {
            setDeliveryUpdateOpen(false);
            resetDeliveryForm();
            console.log('🔍 Delivery dialog closed, selectedOrder still exists:', !!selectedOrder);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border border-white/30">
          <DialogHeader>
            <DialogTitle className="text-slate-800 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Truck className="h-5 w-5 text-white" />
              </div>
              Delivery Management - Order #{selectedOrder?.orderNumber}
            </DialogTitle>
            <p className="text-sm text-slate-600">Update delivery information and tracking details</p>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Tracking Number - Moved to top */}
            <div>
              <label className="text-sm font-medium text-slate-700">Tracking Number</label>
              <Input
                placeholder="Tracking number (read-only)"
                value={deliveryFormData.trackingNumber}
                disabled
                className="bg-slate-100/60 backdrop-blur-sm border-slate-200 text-slate-600 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 mt-1">
                Tracking number cannot be modified once set
              </p>
            </div>

            {/* Delivery Status */}
            <div>
              <label className="text-sm font-medium text-slate-700">Delivery Status *</label>
              <Select
                value={deliveryFormData.deliveryStatus || selectedOrder?.deliveryStatus || 'PENDING'}
                onValueChange={(value) => setDeliveryFormData(prev => ({ ...prev, deliveryStatus: value }))}
              >
                <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/30 focus:border-blue-500">
                  <SelectValue placeholder="Select delivery status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                  <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="DELIVERY_FAILED">Delivery Failed</SelectItem>
                  <SelectItem value="RETURNED">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estimated Delivery Date */}
            <div>
              <label className="text-sm font-medium text-slate-700">Estimated Delivery Date *</label>
              <Input
                type="date"
                value={(() => {
                  if (!deliveryFormData.estimatedDelivery) return '';
                  try {
                    const date = new Date(deliveryFormData.estimatedDelivery);
                    if (isNaN(date.getTime())) return '';
                    return date.toISOString().split('T')[0];
                  } catch (error) {
                    console.error('Error parsing estimated delivery date:', error);
                    return '';
                  }
                })()}
                onChange={(e) => {
                  const date = e.target.value;
                  if (date) {
                    const dateTime = new Date(date + 'T00:00:00').toISOString();
                    console.log('Setting estimated delivery:', { date, dateTime });
                    setDeliveryFormData(prev => ({ ...prev, estimatedDelivery: dateTime }));
                  } else {
                    setDeliveryFormData(prev => ({ ...prev, estimatedDelivery: '' }));
                  }
                }}
                className="bg-white/60 backdrop-blur-sm border-white/30 focus:border-blue-500"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                Set when the customer can expect to receive their order
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-white/20">
              <Button
                variant="outline"
                onClick={() => {
                  setDeliveryUpdateOpen(false);
                  resetDeliveryForm();
                }}
                className="bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80 transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedOrder) {
                    updateDeliveryStatus(selectedOrder.id, deliveryFormData);
                  }
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Update Delivery
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManagement;
