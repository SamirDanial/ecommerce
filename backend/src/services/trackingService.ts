import { PrismaClient, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface StatusUpdateData {
  orderId: number;
  newStatus: OrderStatus;
  notes?: string;
  updatedBy?: string;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
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
          currentStatus: data.newStatus,
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

  // Get order tracking information
  async getOrderTracking(orderId: number) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: {
                    select: { url: true, isPrimary: true },
                    take: 1,
                    orderBy: { isPrimary: 'desc' }
                  }
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      const statusHistory = (order.statusHistory as any) || [];
      
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        currentStatus: order.currentStatus,
        statusHistory: statusHistory.sort((a: any, b: any) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ),
        lastStatusUpdate: order.lastStatusUpdate,
        estimatedDelivery: order.estimatedDelivery,
        trackingNumber: order.trackingNumber,
        items: order.items,
        customer: order.user,
        createdAt: order.createdAt,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt
      };
    } catch (error) {
      console.error('Error getting order tracking:', error);
      throw error;
    }
  },

  // Get status description and estimated timeline
  getStatusInfo(status: OrderStatus) {
    const statusInfo = {
      PENDING: {
        description: 'Order received, waiting for payment confirmation',
        estimatedTime: '1-2 hours',
        icon: '⏳',
        color: 'text-yellow-600'
      },
      CONFIRMED: {
        description: 'Payment confirmed, order being prepared',
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
      DELIVERED: {
        description: 'Package has been successfully delivered',
        estimatedTime: 'Delivered',
        icon: '🎉',
        color: 'text-green-700'
      },
      CANCELLED: {
        description: 'Order has been cancelled',
        estimatedTime: 'Cancelled',
        icon: '❌',
        color: 'text-red-600'
      },
      REFUNDED: {
        description: 'Order has been refunded',
        estimatedTime: 'Refunded',
        icon: '💰',
        color: 'text-orange-600'
      }
    };

    return statusInfo[status] || statusInfo.PENDING;
  },

  // Get next expected status
  getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
    const statusFlow: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) {
      return null; // No next status
    }
    
    return statusFlow[currentIndex + 1];
  },

  // Calculate estimated delivery date
  calculateEstimatedDelivery(currentStatus: OrderStatus, orderDate: Date): Date {
    const baseDate = new Date(orderDate);
    
    switch (currentStatus) {
      case 'PENDING':
        return new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
      case 'CONFIRMED':
        return new Date(baseDate.getTime() + 6 * 24 * 60 * 60 * 1000); // +6 days
      case 'PROCESSING':
        return new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000); // +5 days
      case 'SHIPPED':
        return new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000); // +2 days
      case 'DELIVERED':
        return baseDate; // Already delivered
      case 'CANCELLED':
        return baseDate; // Cancelled orders have no delivery
      case 'REFUNDED':
        return baseDate; // Refunded orders have no delivery
      default:
        return new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000); // Default +7 days
    }
  }
};
