import { PrismaClient, OrderStatus, DeliveryStatus, PaymentStatus, Currency, PaymentMethodType } from '@prisma/client';

const prisma = new PrismaClient();

export interface OrderUpdateData {
  orderId: number;
  newStatus: OrderStatus | DeliveryStatus;
  statusType: 'order' | 'delivery'; // Specify which status to update
  notes?: string;
  updatedBy: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  shippingCompany?: string;
}

export interface OrderFilters {
  orderStatus?: OrderStatus;
  deliveryStatus?: DeliveryStatus;
  paymentStatus?: PaymentStatus;
  dateFrom?: Date;
  dateTo?: Date;
  customerEmail?: string;
  orderNumber?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface OrderWithDetails {
  id: number;
  orderNumber: string;
  orderStatus: OrderStatus;      // Business decision status
  deliveryStatus: DeliveryStatus; // Fulfillment tracking status
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  paymentStatus: PaymentStatus;
  trackingNumber?: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastStatusUpdate: Date;
  estimatedDelivery?: Date | null;
  shippedAt?: Date | null;
  deliveredAt?: Date | null;
  profitMargin?: number;
  costOfGoods?: number;
  totalItems: number;
  averageItemValue?: number;
  
  // Shipping Address Information
  shippingFirstName?: string | null;
  shippingLastName?: string | null;
  shippingCompany?: string | null;
  shippingAddress1?: string | null;
  shippingAddress2?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingPostalCode?: string | null;
  shippingCountry?: string | null;
  shippingPhone?: string | null;
  
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
  };
  items: Array<{
    id: number;
    productName: string;
    productSku?: string | null;
    size?: string | null;
    color?: string | null;
    quantity: number;
    price: number;
    total: number;
    costPrice?: number; // Include cost price for profit calculation
    product?: {
      id: number;
      name: string;
      costPrice?: number | null;
    };
  }>;
  payments: Array<{
    id: number;
    amount: number;
    currency: Currency;
    status: PaymentStatus;
    method: PaymentMethodType;
    transactionId?: string | null;
    createdAt: Date;
  }>;
}

export const adminOrderService = {
  // Get all orders with comprehensive details and filtering
  async getOrders(filters: OrderFilters = {}, page: number = 1, limit: number = 20) {
    try {
      const where: any = {};
      
      if (filters.orderStatus) where.orderStatus = filters.orderStatus;
      if (filters.deliveryStatus) where.deliveryStatus = filters.deliveryStatus;
      if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;
      if (filters.customerEmail) {
        where.user = { email: { contains: filters.customerEmail, mode: 'insensitive' } };
      }
      if (filters.orderNumber) where.orderNumber = { contains: filters.orderNumber, mode: 'insensitive' };
      if (filters.minAmount) where.total = { gte: filters.minAmount };
      if (filters.maxAmount) where.total = { ...where.total, lte: filters.maxAmount };
      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
        if (filters.dateTo) where.createdAt.lte = filters.dateTo;
      }

      const skip = (page - 1) * limit;
      
      const [orders, totalCount] = await Promise.all([
        prisma.order.findMany({
          where,
          select: {
            id: true,
            orderNumber: true,
            orderStatus: true,
            paymentStatus: true,
            deliveryStatus: true,
            total: true,
            currency: true,
            createdAt: true,
            totalItems: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.order.count({ where })
      ]);

      // Transform orders for frontend consumption
      const ordersWithMetrics = orders.map(order => ({
        ...order,
        total: Number(order.total),
        totalItems: order.totalItems || 0
      }));

      return {
        orders: ordersWithMetrics,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Get single order with full details
  async getOrderById(orderId: number): Promise<OrderWithDetails | null> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  costPrice: true,
                  images: {
                    select: {
                      url: true,
                      alt: true,
                      color: true,
                      isPrimary: true,
                      sortOrder: true
                    },
                    orderBy: {
                      sortOrder: 'asc'
                    }
                  }
                }
              },
              variant: {
                select: {
                  costPrice: true,
                  size: true,
                  color: true,
                  colorCode: true
                }
              }
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              currency: true,
              status: true,
              method: true,
              transactionId: true,
              createdAt: true
            }
          }
        }
      });

      if (!order) return null;

      // Calculate metrics - use stored totalItems from database, fallback to calculation if not available
      const totalItems = order.totalItems || order.items.reduce((sum, item) => sum + item.quantity, 0);
      const averageItemValue = totalItems > 0 ? Number(order.total) / totalItems : 0;
      
      let costOfGoods = 0;
      order.items.forEach(item => {
        // Use stored costPrice from time of sale, fallback to variant/product cost if not available
        const itemCost = item.costPrice || item.variant?.costPrice || item.product?.costPrice || 0;
        costOfGoods += Number(itemCost) * item.quantity;
      });
      
      const profitMargin = costOfGoods > 0 ? ((Number(order.total) - costOfGoods) / Number(order.total)) * 100 : 0;

      return {
        ...order,
        subtotal: Number(order.subtotal),
        tax: Number(order.tax),
        shipping: Number(order.shipping),
        discount: Number(order.discount),
        total: Number(order.total),
        totalItems,
        averageItemValue,
        costOfGoods,
        profitMargin,
        // Explicitly include shipping fields
        shippingFirstName: order.shippingFirstName || undefined,
        shippingLastName: order.shippingLastName || undefined,
        shippingCompany: order.shippingCompany || undefined,
        shippingAddress1: order.shippingAddress1 || undefined,
        shippingAddress2: order.shippingAddress2 || undefined,
        shippingCity: order.shippingCity || undefined,
        shippingState: order.shippingState || undefined,
        shippingPostalCode: order.shippingPostalCode || undefined,
        shippingCountry: order.shippingCountry || undefined,
        shippingPhone: order.shippingPhone || undefined,
        items: order.items.map(item => ({
          ...item,
          productSku: item.productSku || undefined,
          size: item.size || undefined,
          color: item.color || undefined,
          // Filter images by item color for variant-specific display
          product: item.product ? {
            ...item.product,
            costPrice: item.product.costPrice ? Number(item.product.costPrice) : null,
            // Use the same logic as user profile page: match by item.color
            images: item.product.images ? (() => {
              
              // If item has a color, find matching color image first
              if (item.color) {
                const colorImage = item.product.images.find(img => 
                  img.color && img.color.toLowerCase() === item.color!.toLowerCase()
                );
                
                if (colorImage) {
                  return [colorImage];
                }
              }
              
              // Fallback to primary image or first available image
              const primaryImage = item.product.images.find(img => img.isPrimary);
              if (primaryImage) {
                return [primaryImage];
              }
              
              // Return first image if no primary found
              if (item.product.images.length > 0) {
                return [item.product.images[0]];
              }
              
              console.log(`❌ No images available`);
              return [];
            })() : []
          } : undefined,
          price: Number(item.price),
          total: Number(item.total),
          costPrice: item.costPrice ? Number(item.costPrice) : (item.product?.costPrice ? Number(item.product.costPrice) : undefined)
        })),
        payments: order.payments.map(payment => ({
          ...payment,
          amount: Number(payment.amount),
          currency: payment.currency,
          method: payment.method
        }))
      };
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  // Update order status and maintain history
  async updateOrderStatus(data: OrderUpdateData) {
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
        notes: data.notes || null, // Ensure notes is never undefined
        updatedBy: data.updatedBy
      };

      // Prepare update data based on status type
      const updateData: any = {
        statusHistory: [...currentHistory, newStatusEntry],
        lastStatusUpdate: new Date()
      };

      // Update the appropriate status field based on statusType
      if (data.statusType === 'order') {
        updateData.orderStatus = data.newStatus as OrderStatus;
      } else if (data.statusType === 'delivery') {
        updateData.deliveryStatus = data.newStatus as DeliveryStatus;
      }

      // Update specific timestamps based on status
      if (data.newStatus === 'SHIPPED') {
        updateData.shippedAt = new Date();
      } else if (data.newStatus === 'DELIVERED') {
        updateData.deliveredAt = new Date();
      }

      // Update tracking and delivery info if provided
      if (data.trackingNumber) {
        updateData.trackingNumber = data.trackingNumber;
      }
      if (data.estimatedDelivery) {
        updateData.estimatedDelivery = data.estimatedDelivery;
      }
      if (data.shippingCompany) {
        updateData.shippingCompany = data.shippingCompany;
        console.log('Adding shipping company to update:', data.shippingCompany);
      }

      console.log('Final update data:', updateData);
      console.log('About to update order ID:', data.orderId);

      try {
        const updatedOrder = await prisma.order.update({
          where: { id: data.orderId },
          data: updateData,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            items: true,
            payments: true
          }
        });

        console.log('Order updated successfully. Shipping company in result:', updatedOrder.shippingCompany);
        return updatedOrder;
      } catch (prismaError) {
        console.error('Prisma update failed:', prismaError);
        console.error('Update data that failed:', updateData);
        throw prismaError;
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Update shipping company
  async updateShippingCompany(orderId: number, shippingCompany: string) {
    try {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { shippingCompany },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          items: true,
          payments: true
        }
      });

      return updatedOrder;
    } catch (error) {
      console.error('Error updating shipping company:', error);
      throw error;
    }
  },

  // Bulk update order statuses
  async bulkUpdateOrderStatuses(orderIds: number[], newStatus: OrderStatus, notes: string, updatedBy: string) {
    try {
      const results = await Promise.all(
        orderIds.map(orderId => 
          this.updateOrderStatus({
            orderId,
            newStatus,
            statusType: 'order',
            notes,
            updatedBy
          })
        )
      );

      return {
        success: true,
        updatedCount: results.length,
        orders: results
      };
    } catch (error) {
      console.error('Error bulk updating orders:', error);
      throw error;
    }
  },

  // Get order statistics
  async getOrderStats(dateFrom?: Date, dateTo?: Date) {
    try {
      const where: any = {};
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = dateFrom;
        if (dateTo) where.createdAt.lte = dateTo;
      }

      const orders = await prisma.order.findMany({
        where,
        select: {
          total: true,
          orderStatus: true,
          deliveryStatus: true,
          paymentStatus: true,
          createdAt: true
        }
      });

      const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      const orderStatusCounts = orders.reduce((acc, order) => {
        acc[order.orderStatus] = (acc[order.orderStatus] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const deliveryStatusCounts = orders.reduce((acc, order) => {
        acc[order.deliveryStatus] = (acc[order.deliveryStatus] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const paymentStatusCounts = orders.reduce((acc, order) => {
        acc[order.paymentStatus] = (acc[order.paymentStatus] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        orderStatusCounts,
        deliveryStatusCounts,
        paymentStatusCounts
      };
    } catch (error) {
      console.error('Error getting order stats:', error);
      throw error;
    }
  }
};
