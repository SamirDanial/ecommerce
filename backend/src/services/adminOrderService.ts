import { PrismaClient, OrderStatus, PaymentStatus, Currency, PaymentMethodType } from '@prisma/client';

const prisma = new PrismaClient();

export interface OrderUpdateData {
  orderId: number;
  newStatus: OrderStatus;
  notes?: string;
  updatedBy: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  shippingCompany?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
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
  status: OrderStatus;
  currentStatus: OrderStatus;
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
      
      if (filters.status) where.status = filters.status;
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
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            },
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    costPrice: true
                  }
                },
                variant: {
                  select: {
                    costPrice: true
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
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.order.count({ where })
      ]);

      // Calculate sales metrics for each order
      const ordersWithMetrics = orders.map(order => {
        // Use stored totalItems from database, fallback to calculation if not available
        const totalItems = order.totalItems || order.items.reduce((sum, item) => sum + item.quantity, 0);
        const averageItemValue = totalItems > 0 ? Number(order.total) / totalItems : 0;
        
        // Calculate cost of goods and profit margin using stored cost at time of sale
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
          price: Number(item.price),
          total: Number(item.total),
          costPrice: item.costPrice ? Number(item.costPrice) : (item.product?.costPrice ? Number(item.product.costPrice) : undefined),
          product: item.product ? {
            ...item.product,
            costPrice: item.product.costPrice ? Number(item.product.costPrice) : null
          } : undefined
        })),
        payments: order.payments.map(payment => ({
          ...payment,
          amount: Number(payment.amount),
          currency: payment.currency,
          method: payment.method
        }))
      };
      });

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
                  costPrice: true
                }
              },
              variant: {
                select: {
                  costPrice: true
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
          price: Number(item.price),
          total: Number(item.total),
          costPrice: item.costPrice ? Number(item.costPrice) : (item.product?.costPrice ? Number(item.product.costPrice) : undefined),
          product: item.product ? {
            ...item.product,
            costPrice: item.product.costPrice ? Number(item.product.costPrice) : null
          } : undefined
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
        notes: data.notes,
        updatedBy: data.updatedBy
      };

      // Prepare update data
      const updateData: any = {
        currentStatus: data.newStatus,
        statusHistory: [...currentHistory, newStatusEntry],
        lastStatusUpdate: new Date()
      };

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
          status: true,
          paymentStatus: true,
          createdAt: true
        }
      });

      const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      const statusCounts = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
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
        statusCounts,
        paymentStatusCounts
      };
    } catch (error) {
      console.error('Error getting order stats:', error);
      throw error;
    }
  }
};
