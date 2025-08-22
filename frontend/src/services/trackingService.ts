import api, { createAuthHeaders } from '../lib/axios';

export interface StatusHistoryEntry {
  status: string;
  timestamp: string;
  notes?: string;
  updatedBy?: string;
}

export interface OrderTracking {
  orderId: number;
  orderNumber: string;
  currentStatus: string;
  statusHistory: StatusHistoryEntry[];
  lastStatusUpdate: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  items: Array<{
    id: number;
    productName: string;
    quantity: number;
    price: number;
    total: number;
    product?: {
      id: number;
      name: string;
      images?: Array<{
        url: string;
        isPrimary: boolean;
      }>;
    };
  }>;
  customer?: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface StatusUpdateRequest {
  newStatus: string;
  notes?: string;
}

export const trackingService = {
  // Get order tracking information
  async getOrderTracking(orderId: number, token: string): Promise<OrderTracking> {
    const response = await api.get(`/tracking/order/${orderId}`, {
      headers: createAuthHeaders(token),
    });
    return response.data.tracking;
  },

  // Update order status (admin function)
  async updateOrderStatus(orderId: number, data: StatusUpdateRequest, token: string) {
    const response = await api.put(`/tracking/order/${orderId}/status`, data, {
      headers: createAuthHeaders(token),
    });
    return response.data;
  },

  // Get status information and styling
  getStatusInfo(status: string) {
    const statusInfo = {
      PENDING: {
        description: 'Order received, waiting for payment confirmation',
        estimatedTime: '1-2 hours',
        icon: '⏳',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      },
      CONFIRMED: {
        description: 'Payment confirmed, order being prepared',
        estimatedTime: '2-4 hours',
        icon: '✅',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      PROCESSING: {
        description: 'Items being picked, packed, and prepared for shipping',
        estimatedTime: '4-8 hours',
        icon: '📦',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      SHIPPED: {
        description: 'Package has left our facility and is in transit',
        estimatedTime: '2-7 days',
        icon: '🚚',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      },
      DELIVERED: {
        description: 'Package has been successfully delivered',
        estimatedTime: 'Delivered',
        icon: '🎉',
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      }
    };

    return statusInfo[status as keyof typeof statusInfo] || statusInfo.PENDING;
  },

  // Get next expected status
  getNextStatus(currentStatus: string): string | null {
    const statusFlow = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) {
      return null; // No next status
    }
    
    return statusFlow[currentIndex + 1];
  },

  // Format date for display
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Calculate progress percentage
  calculateProgress(currentStatus: string): number {
    const statusFlow = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    
    if (currentIndex === -1) return 0;
    
    return ((currentIndex + 1) / statusFlow.length) * 100;
  }
};

