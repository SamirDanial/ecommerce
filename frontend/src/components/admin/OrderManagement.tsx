import React, { useState, useEffect, useCallback } from 'react';
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
  Users
} from 'lucide-react';
import { useClerkAuth } from '../../hooks/useClerkAuth';
import { getApiBaseUrl } from '../../config/api';
import { toast } from 'sonner';


interface Order {
  id: number;
  orderNumber: string;
  status: string;
  currentStatus: string;
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
  profitMargin?: number;
  costOfGoods?: number;
  totalItems: number;
  averageItemValue?: number;
  notes?: string;
  
  // Shipping Address Information
  shippingFirstName?: string;
  shippingLastName?: string;
  shippingCompany?: string;
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<OrderFilters>({});
  const [salesMetrics, setSalesMetrics] = useState<SalesMetrics | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [bulkUpdateOpen, setBulkUpdateOpen] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusUpdateNotes, setStatusUpdateNotes] = useState('');
  const [bulkUpdateNotes, setBulkUpdateNotes] = useState('');
  const [bulkUpdateStatus, setBulkUpdateStatus] = useState('CONFIRMED');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });

  // Fetch orders
  const fetchOrders = useCallback(async () => {
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
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
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
  const updateOrderStatus = async (orderId: number, newStatus: string, notes?: string, shippingCompany?: string) => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`${getApiBaseUrl()}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newStatus, notes, shippingCompany })
      });

      if (response.ok) {
        toast.success('Order status updated successfully');
        fetchOrders();
        fetchSalesMetrics();
        setStatusUpdateOpen(false);
        setSelectedOrder(null);
        setStatusUpdateNotes('');
      } else {
        toast.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
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
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'CONFIRMED': 'bg-blue-100 text-blue-800',
      'PROCESSING': 'bg-purple-100 text-purple-800',
      'SHIPPED': 'bg-indigo-100 text-indigo-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
      'REFUNDED': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-2">Manage orders, track shipments, and monitor sales performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => fetchOrders()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {selectedOrders.length > 0 && (
            <Button
              onClick={() => setBulkUpdateOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Bulk Update ({selectedOrders.length})
            </Button>
          )}
        </div>
      </div>

      {/* Sales Overview Cards */}
      {salesMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(salesMetrics.totalRevenue)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {salesMetrics.totalOrders}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Order</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(salesMetrics.averageOrderValue)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profit Margin</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {salesMetrics.profitMargin.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-full">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Order Status</label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'all' ? undefined : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Payment Status</label>
              <Select
                value={filters.paymentStatus || 'all'}
                onValueChange={(value) => setFilters(prev => ({ ...prev, paymentStatus: value === 'all' ? undefined : value }))}
              >
                <SelectTrigger>
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
              <label className="text-sm font-medium text-gray-700">Customer Email</label>
              <Input
                placeholder="Search by email"
                value={filters.customerEmail || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, customerEmail: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Order Number</label>
              <Input
                placeholder="Search by order #"
                value={filters.orderNumber || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, orderNumber: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <Button
              onClick={() => {
                setFilters({});
                setCurrentPage(1);
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
            <Button
              onClick={() => {
                setCurrentPage(1);
                fetchOrders();
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">
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
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-medium">Order</th>
                    <th className="text-left py-3 px-4 font-medium">Customer</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Payment</th>
                    <th className="text-left py-3 px-4 font-medium">Shipping Company</th>
                    <th className="text-left py-3 px-4 font-medium">Total</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">{order.totalItems} items</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{order.user.name}</p>
                          <p className="text-sm text-gray-500">{order.user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(order.currentStatus)}>
                          {order.currentStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                          {order.paymentStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          {order.shippingCompany ? (
                            <p className="text-sm text-gray-900 font-medium">{order.shippingCompany}</p>
                          ) : (
                            <p className="text-sm text-gray-400 italic">Not set</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
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
                          <p className="text-sm text-gray-900">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setOrderDetailOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setStatusUpdateOpen(true);
                            }}
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
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-700">
                Showing page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Modal */}
      <Dialog open={orderDetailOpen} onOpenChange={setOrderDetailOpen}>
        <DialogContent className="max-w-4xl w-screen sm:w-[95vw] max-h-[90vh] overflow-y-auto p-3 sm:p-6">
          <DialogHeader className="mb-3 sm:mb-6">
            <DialogTitle className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3 text-center sm:text-left">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <span className="hidden sm:inline">Order Details - #{selectedOrder?.orderNumber}</span>
              <span className="sm:hidden">Order #{selectedOrder?.orderNumber}</span>
            </DialogTitle>
            <p className="text-xs sm:text-base text-gray-600 text-center sm:text-left">
              <span className="hidden sm:inline">Complete order information including items, costs, and financial summary</span>
              <span className="sm:hidden">Order details and financial summary</span>
            </p>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 sm:space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                <Card>
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 space-y-2 sm:space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className={getStatusColor(selectedOrder.currentStatus)}>
                        {selectedOrder.currentStatus}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment:</span>
                      <Badge className={getPaymentStatusColor(selectedOrder.paymentStatus)}>
                        {selectedOrder.paymentStatus}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span>{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span>{formatDate(selectedOrder.lastStatusUpdate)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 space-y-2 sm:space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>{formatCurrency(selectedOrder.subtotal, selectedOrder.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax:</span>
                      <span>{formatCurrency(selectedOrder.tax, selectedOrder.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping:</span>
                      <span>{formatCurrency(selectedOrder.shipping, selectedOrder.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <span>{formatCurrency(selectedOrder.discount, selectedOrder.currency)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>{formatCurrency(selectedOrder.total, selectedOrder.currency)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Order Items ({selectedOrder.items.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <div className="space-y-2 sm:space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 border rounded-lg gap-2 sm:gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm sm:text-base">{item.productName}</p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {item.quantity} × {formatCurrency(item.price, selectedOrder.currency)}
                            {item.size && ` • Size: ${item.size}`}
                            {item.color && ` • Color: ${item.color}`}
                          </p>
                          {item.productSku && (
                            <p className="text-xs text-gray-400">SKU: {item.productSku}</p>
                          )}
                        </div>
                        <div className="text-right sm:text-left sm:min-w-[120px]">
                          <p className="font-medium text-sm sm:text-base">
                            {formatCurrency(item.total, selectedOrder.currency)}
                          </p>
                          {item.costPrice && (
                            <div className="text-xs text-gray-500 mt-1">
                              <p>Cost: {formatCurrency(Number(item.costPrice) * item.quantity, selectedOrder.currency)}</p>
                              <p className="text-green-600">
                                Profit: {formatCurrency((Number(item.price) - Number(item.costPrice)) * item.quantity, selectedOrder.currency)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Enhanced Order Summary with Net Profit */}
                    {selectedOrder.items.some(item => item.costPrice) && (
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
                              selectedOrder.items.reduce((sum, item) => 
                                sum + (Number(item.costPrice) || 0) * item.quantity, 0
                              ), 
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
                                  selectedOrder.total - selectedOrder.items.reduce((sum, item) => 
                                    sum + (Number(item.costPrice) || 0) * item.quantity, 0
                                  ), 
                                  selectedOrder.currency
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Profit Margin:</p>
                              <p className="font-medium text-green-600">
                                {(() => {
                                  const totalCost = selectedOrder.items.reduce((sum, item) => 
                                    sum + (Number(item.costPrice) || 0) * item.quantity, 0
                                  );
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
                                                                      const totalCost = selectedOrder.items.reduce((sum, item) => 
                                    sum + (Number(item.costPrice) || 0) * item.quantity, 0
                                  );
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
                                  const totalCost = selectedOrder.items.reduce((sum, item) => 
                                    sum + (Number(item.costPrice) || 0) * item.quantity, 0
                                  );
                                  const grossProfit = selectedOrder.total - totalCost;
                                  const tax = selectedOrder.tax || 0;
                                  const shipping = selectedOrder.shipping || 0;
                                  const netProfit = grossProfit - tax - shipping;
                                  const netMargin = netProfit > 0 ? ((netProfit / selectedOrder.total) * 100).toFixed(1) : '0.0';
                                  return `${netMargin}% net margin`;
                                })()}
                              </p>
                            </div>
                          </div>
                          
                          {/* Deduction Breakdown */}
                          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-blue-200">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                              <div>
                                <p className="text-blue-600">Tax Deducted:</p>
                                <p className="font-medium text-blue-800">
                                  {formatCurrency(selectedOrder.tax || 0, selectedOrder.currency)}
                                </p>
                              </div>
                              <div>
                                <p className="text-blue-600">Shipping Deducted:</p>
                                <p className="font-medium text-blue-800">
                                  {formatCurrency(selectedOrder.shipping || 0, selectedOrder.currency)}
                                </p>
                              </div>
                              <div>
                                <p className="text-blue-600">Net Margin:</p>
                                <p className="font-medium text-blue-800">
                                  {(() => {
                                    const totalCost = selectedOrder.items.reduce((sum, item) => 
                                      sum + (Number(item.costPrice) || 0) * item.quantity, 0
                                    );
                                    const grossProfit = selectedOrder.total - totalCost;
                                    const tax = selectedOrder.tax || 0;
                                    const shipping = selectedOrder.shipping || 0;
                                    const netProfit = grossProfit - tax - shipping;
                                    return netProfit > 0 ? `${((netProfit / selectedOrder.total) * 100).toFixed(1)}%` : '0.0%';
                                  })()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span>{selectedOrder.user.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span>{selectedOrder.user.email}</span>
                    </div>
                    {selectedOrder.user.phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span>{selectedOrder.user.phone}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              {(selectedOrder.shippingFirstName || selectedOrder.shippingAddress1) && (
                <Card>
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6">
                    <div className="space-y-2">
                      {(selectedOrder.shippingFirstName || selectedOrder.shippingLastName) && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span>
                            {selectedOrder.shippingFirstName} {selectedOrder.shippingLastName}
                          </span>
                        </div>
                      )}
                      {selectedOrder.shippingCompany && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping Company:</span>
                          <span>{selectedOrder.shippingCompany}</span>
                        </div>
                      )}
                      {selectedOrder.shippingAddress1 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Address:</span>
                          <span className="text-right">
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
                        <div className="flex justify-between">
                          <span className="text-gray-600">City/State/ZIP:</span>
                          <span>
                            {selectedOrder.shippingCity}, {selectedOrder.shippingState} {selectedOrder.shippingPostalCode}
                          </span>
                        </div>
                      )}
                      {selectedOrder.shippingCountry && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Country:</span>
                          <span>{selectedOrder.shippingCountry}</span>
                        </div>
                      )}
                      {selectedOrder.shippingPhone && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span>{selectedOrder.shippingPhone}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}


            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Modal */}
      <Dialog open={statusUpdateOpen} onOpenChange={setStatusUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">New Status</label>
                <Select
                  onValueChange={(value) => {
                    if (selectedOrder) {
                      setSelectedOrder({ ...selectedOrder, currentStatus: value });
                    }
                  }}
                  value={selectedOrder.currentStatus}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Shipping Company (Optional)</label>
                <Input
                  placeholder="Enter shipping company (e.g., FedEx, UPS, DHL)"
                  value={selectedOrder.shippingCompany || ''}
                  onChange={(e) => {
                    if (selectedOrder) {
                      setSelectedOrder({ ...selectedOrder, shippingCompany: e.target.value });
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Set the shipping company that will deliver this order.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Notes (Optional)</label>
                <Input
                  placeholder="Add notes about this status change"
                  value={statusUpdateNotes}
                  onChange={(e) => setStatusUpdateNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStatusUpdateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => updateOrderStatus(
                    selectedOrder.id,
                    selectedOrder.currentStatus,
                    statusUpdateNotes,
                    selectedOrder.shippingCompany
                  )}
                  className="bg-blue-700 hover:bg-blue-800"
                >
                  Update Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Update Modal */}
      <Dialog open={bulkUpdateOpen} onOpenChange={setBulkUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Update Orders ({selectedOrders.length})</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">New Status</label>
              <Select
                value={bulkUpdateStatus}
                onValueChange={setBulkUpdateStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Notes (Optional)</label>
              <Input 
                placeholder="Add notes about this bulk update"
                value={bulkUpdateNotes}
                onChange={(e) => setBulkUpdateNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setBulkUpdateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => bulkUpdateOrders(bulkUpdateStatus, bulkUpdateNotes)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Update All Orders
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManagement;
