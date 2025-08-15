import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useClerkAuth } from '../hooks/useClerkAuth';
import { toast } from 'sonner';
import { RefreshCw, Package, User, Calendar, DollarSign } from 'lucide-react';

interface AdminOrder {
  id: number;
  orderNumber: string;
  currentStatus: string;
  status: string;
  customerName: string;
  customerEmail: string;
  total: number;
  createdAt: string;
  lastStatusUpdate: string;
  itemsCount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

const AdminOrderManager: React.FC = () => {
  const { getToken } = useClerkAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState<number | null>(null);
  const [statusUpdate, setStatusUpdate] = useState({
    orderId: 0,
    newStatus: '',
    notes: ''
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async () => {
    try {
      setUpdatingOrder(statusUpdate.orderId);
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`/api/admin/orders/${statusUpdate.orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newStatus: statusUpdate.newStatus,
          notes: statusUpdate.notes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const data = await response.json();
      toast.success('Order status updated successfully');
      
      // Reset form and refresh orders
      setStatusUpdate({ orderId: 0, newStatus: '', notes: '' });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800'
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Order Management</h2>
        <Button onClick={fetchOrders} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Status Update Form */}
      <Card>
        <CardHeader>
          <CardTitle>Update Order Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                type="number"
                value={statusUpdate.orderId || ''}
                onChange={(e) => setStatusUpdate(prev => ({ ...prev, orderId: parseInt(e.target.value) || 0 }))}
                placeholder="Enter order ID"
              />
            </div>
            <div>
              <Label htmlFor="newStatus">New Status</Label>
              <Select 
                value={statusUpdate.newStatus} 
                onValueChange={(value) => setStatusUpdate(prev => ({ ...prev, newStatus: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                  <SelectItem value="PROCESSING">PROCESSING</SelectItem>
                  <SelectItem value="SHIPPED">SHIPPED</SelectItem>
                  <SelectItem value="DELIVERED">DELIVERED</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={statusUpdate.notes}
                onChange={(e) => setStatusUpdate(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add notes..."
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={updateOrderStatus}
                disabled={!statusUpdate.orderId || !statusUpdate.newStatus || updatingOrder === statusUpdate.orderId}
                className="w-full"
              >
                {updatingOrder === statusUpdate.orderId ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-lg">{order.orderNumber}</h4>
                      {getStatusBadge(order.currentStatus)}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl">${order.total}</p>
                      <p className="text-sm text-muted-foreground">{order.itemsCount} items</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Customer:</span>
                      <span className="font-medium">{order.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Updated:</span>
                      <span className="font-medium">{formatDate(order.lastStatusUpdate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-medium">${order.total}</span>
                    </div>
                  </div>
                  
                  {/* Quick Items Preview */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Items</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <span key={index} className="text-xs bg-white px-2 py-1 rounded border">
                          {item.name} x{item.quantity}
                        </span>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{order.items.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrderManager;

