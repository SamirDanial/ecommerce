import { PrismaClient, DeliveryStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface StatusUpdateData {
  orderId: number;
  newStatus: DeliveryStatus;
  notes?: string;
  updatedBy?: string;
}

export interface StatusHistoryEntry {
  status: DeliveryStatus;
  timestamp: Date;
  notes?: string;
  updatedBy?: string;
}

export const trackingService = {
  // Update order status and maintain history
  async updateOrderStatus(data: StatusUpdateData) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: data.orderId }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Get current status history
      const currentHistory = (order.statusHistory as any) || [];
      
      // Add new status entry
      const newStatusEntry = {
        status: data.newStatus,
        timestamp: new Date(),
        notes: data.notes,
        updatedBy: data.updatedBy || 'system'
      };

      // Update order with new status and history
      const updatedOrder = await prisma.order.update({
        where: { id: data.orderId },
        data: {
          deliveryStatus: data.newStatus,
          statusHistory: [...currentHistory, newStatusEntry],
          lastStatusUpdate: new Date(),
          // Update specific timestamps based on status
          ...(data.newStatus === 'SHIPPED' && { shippedAt: new Date() }),
          ...(data.newStatus === 'DELIVERED' && { deliveredAt: new Date() })
        }
      });

      return updatedOrder;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Get order tracking information (optimized for frontend display)
  async getOrderTracking(orderId: number) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          orderNumber: true,
          deliveryStatus: true,
          statusHistory: true,
          estimatedDelivery: true,
          trackingNumber: true
        }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      const statusHistory = (order.statusHistory as any) || [];
      
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        currentStatus: order.deliveryStatus,
        statusHistory: statusHistory.sort((a: any, b: any) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ),
        estimatedDelivery: order.estimatedDelivery,
        trackingNumber: order.trackingNumber
      };
    } catch (error) {
      console.error('Error getting order tracking:', error);
      throw error;
    }
  },

  // Get status description and estimated timeline
  getStatusInfo(status: DeliveryStatus) {
    const statusInfo = {
      PENDING: {
        description: 'Order approved, waiting to start fulfillment',
        estimatedTime: '1-2 hours',
        icon: '⏳',
        color: 'text-yellow-600'
      },
      CONFIRMED: {
        description: 'Order confirmed for fulfillment',
        estimatedTime: '2-4 hours',
        icon: '✅',
        color: 'text-green-600'
      },
      PROCESSING: {
        description: 'Items being picked, packed, and prepared for shipping',
        estimatedTime: '4-8 hours',
        icon: '📦',
        color: 'text-blue-600'
      },
      SHIPPED: {
        description: 'Package has left our facility and is in transit',
        estimatedTime: '2-7 days',
        icon: '🚚',
        color: 'text-purple-600'
      },
      IN_TRANSIT: {
        description: 'Package is in transit to customer',
        estimatedTime: '3-5 days',
        icon: '🚛',
        color: 'text-blue-700'
      },
      OUT_FOR_DELIVERY: {
        description: 'Package out for final delivery',
        estimatedTime: 'Same day',
        icon: '🚚',
        color: 'text-purple-700'
      },
      DELIVERED: {
        description: 'Package has been successfully delivered',
        estimatedTime: 'Delivered',
        icon: '🎉',
        color: 'text-green-700'
      },
      DELIVERY_FAILED: {
        description: 'Delivery attempt failed',
        estimatedTime: 'Next business day',
        icon: '⚠️',
        color: 'text-red-600'
      },
      RETURNED: {
        description: 'Package has been returned',
        estimatedTime: 'Returned',
        icon: '↩️',
        color: 'text-orange-600'
      }
    };

    return statusInfo[status] || statusInfo.PENDING;
  },

  // Get next expected status
  getNextStatus(currentStatus: DeliveryStatus): DeliveryStatus | null {
    const statusFlow: DeliveryStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) {
      return null; // No next status
    }
    
    return statusFlow[currentIndex + 1];
  },

  // Calculate estimated delivery date
  calculateEstimatedDelivery(currentStatus: DeliveryStatus, orderDate: Date): Date {
    const baseDate = new Date(orderDate);
    
    switch (currentStatus) {
      case 'PENDING':
        return new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
      case 'CONFIRMED':
        return new Date(baseDate.getTime() + 6 * 24 * 60 * 60 * 1000); // +6 days
      case 'PROCESSING':
        return new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000); // +5 days
      case 'SHIPPED':
        return new Date(baseDate.getTime() + 4 * 24 * 60 * 60 * 1000); // +4 days
      case 'IN_TRANSIT':
        return new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000); // +2 days
      case 'OUT_FOR_DELIVERY':
        return new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000); // +1 day
      case 'DELIVERED':
        return baseDate; // Already delivered
      case 'DELIVERY_FAILED':
        return new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000); // +1 day (retry)
      case 'RETURNED':
        return baseDate; // Returned orders have no delivery
      default:
        return new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000); // Default +7 days
    }
  }
};
