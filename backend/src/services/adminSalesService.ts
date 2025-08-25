import { PrismaClient, OrderStatus, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalProfit: number;
  totalCost: number;
  profitMargin: number;
  conversionRate?: number;
}

export interface SalesPeriod {
  date: string;
  revenue: number;
  orders: number;
  profit: number;
  cost: number;
}

export interface ProductPerformance {
  productId: number;
  productName: string;
  totalSold: number;
  revenue: number;
  profit: number;
  cost: number;
  profitMargin: number;
  orderCount: number;
}

export interface CustomerMetrics {
  customerId: number;
  customerName: string;
  customerEmail: string;
  totalSpent: number;
  orderCount: number;
  averageOrderValue: number;
  lastOrderDate: Date;
  customerLifetimeValue: number;
}

export const adminSalesService = {
  // Get overall sales metrics for a date range
  async getSalesMetrics(dateFrom?: Date, dateTo?: Date): Promise<SalesMetrics> {
    try {
      const where: any = {};
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = dateFrom;
        if (dateTo) where.createdAt.lte = dateTo;
      }

      const orders = await prisma.order.findMany({
        where: {
          ...where,
          orderStatus: { not: 'CANCELLED' },
          paymentStatus: 'PAID'
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  costPrice: true
                }
              },
              variant: {
                select: {
                  costPrice: true
                }
              }
            }
          }
        }
      });

      let totalRevenue = 0;
      let totalCost = 0;
      let totalProfit = 0;

      orders.forEach(order => {
        const orderTotal = Number(order.total);
        totalRevenue += orderTotal;

        // Calculate cost of goods using stored cost at time of sale
        let orderCost = 0;
        order.items.forEach(item => {
          // Use stored costPrice from time of sale, fallback to variant/product cost if not available
          const itemCost = item.costPrice || item.variant?.costPrice || item.product?.costPrice || 0;
          orderCost += Number(itemCost) * item.quantity;
        });
        totalCost += orderCost;
      });

      totalProfit = totalRevenue - totalCost;
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
      const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

      return {
        totalRevenue,
        totalOrders: orders.length,
        averageOrderValue,
        totalProfit,
        totalCost,
        profitMargin
      };
    } catch (error) {
      console.error('Error getting sales metrics:', error);
      throw error;
    }
  },

  // Get sales data by period (daily, weekly, monthly)
  async getSalesByPeriod(period: 'daily' | 'weekly' | 'monthly', dateFrom?: Date, dateTo?: Date): Promise<SalesPeriod[]> {
    try {
      const where: any = {};
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = dateFrom;
        if (dateTo) where.createdAt.lte = dateTo;
      }

      const orders = await prisma.order.findMany({
        where: {
          ...where,
          orderStatus: { not: 'CANCELLED' },
          paymentStatus: 'PAID'
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  costPrice: true
                }
              },
              variant: {
                select: {
                  costPrice: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      const salesMap = new Map<string, { revenue: number; orders: number; profit: number; cost: number }>();

      orders.forEach(order => {
        let periodKey = '';
        const orderDate = new Date(order.createdAt);
        const orderTotal = Number(order.total);

        if (period === 'daily') {
          periodKey = orderDate.toISOString().split('T')[0];
        } else if (period === 'weekly') {
          const weekStart = new Date(orderDate);
          weekStart.setDate(orderDate.getDate() - orderDate.getDay());
          periodKey = weekStart.toISOString().split('T')[0];
        } else if (period === 'monthly') {
          periodKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
        }

        if (!salesMap.has(periodKey)) {
          salesMap.set(periodKey, { revenue: 0, orders: 0, profit: 0, cost: 0 });
        }

        const current = salesMap.get(periodKey)!;
        current.revenue += orderTotal;
        current.orders += 1;

        // Calculate cost and profit using stored cost at time of sale
        let orderCost = 0;
        order.items.forEach(item => {
          // Use stored costPrice from time of sale, fallback to variant/product cost if not available
          const itemCost = item.costPrice || item.variant?.costPrice || item.product?.costPrice || 0;
          orderCost += Number(itemCost) * item.quantity;
        });
        current.cost += orderCost;
        current.profit += orderTotal - orderCost;
      });

      return Array.from(salesMap.entries()).map(([date, data]) => ({
        date,
        ...data
      }));
    } catch (error) {
      console.error('Error getting sales by period:', error);
      throw error;
    }
  },

  // Get top performing products
  async getTopProducts(limit: number = 10, dateFrom?: Date, dateTo?: Date): Promise<ProductPerformance[]> {
    try {
      const where: any = {};
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = dateFrom;
        if (dateTo) where.createdAt.lte = dateTo;
      }

      const orders = await prisma.order.findMany({
        where: {
          ...where,
          orderStatus: { not: 'CANCELLED' },
          paymentStatus: 'PAID'
        },
        include: {
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
          }
        }
      });

      const productMap = new Map<number, ProductPerformance>();

      orders.forEach(order => {
        order.items.forEach(item => {
          const productId = item.productId;
          const productName = item.productName;
          const quantity = item.quantity;
          const price = Number(item.price);
          const total = Number(item.total);
          // Use stored costPrice from time of sale, fallback to variant/product cost if not available
          const costPrice = item.costPrice || item.variant?.costPrice || item.product?.costPrice || 0;

          if (!productMap.has(productId)) {
            productMap.set(productId, {
              productId,
              productName,
              totalSold: 0,
              revenue: 0,
              profit: 0,
              cost: 0,
              profitMargin: 0,
              orderCount: 0
            });
          }

          const current = productMap.get(productId)!;
          current.totalSold += quantity;
          current.revenue += total;
          current.cost += Number(costPrice) * quantity;
          current.orderCount += 1;
        });
      });

      // Calculate profit margins
      productMap.forEach(product => {
        product.profit = product.revenue - product.cost;
        product.profitMargin = product.revenue > 0 ? (product.profit / product.revenue) * 100 : 0;
      });

      // Sort by revenue and return top products
      return Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting top products:', error);
      throw error;
    }
  },

  // Get top customers by spending
  async getTopCustomers(limit: number = 10, dateFrom?: Date, dateTo?: Date): Promise<CustomerMetrics[]> {
    try {
      const where: any = {};
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = dateFrom;
        if (dateTo) where.createdAt.lte = dateTo;
      }

      const orders = await prisma.order.findMany({
        where: {
          ...where,
          orderStatus: { not: 'CANCELLED' },
          paymentStatus: 'PAID'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const customerMap = new Map<number, CustomerMetrics>();

      orders.forEach(order => {
        const customerId = order.userId;
        const customerName = order.user.name;
        const customerEmail = order.user.email;
        const orderTotal = Number(order.total);
        const orderDate = order.createdAt;

        if (!customerMap.has(customerId)) {
          customerMap.set(customerId, {
            customerId,
            customerName,
            customerEmail,
            totalSpent: 0,
            orderCount: 0,
            averageOrderValue: 0,
            lastOrderDate: orderDate,
            customerLifetimeValue: 0
          });
        }

        const current = customerMap.get(customerId)!;
        current.totalSpent += orderTotal;
        current.orderCount += 1;
        current.lastOrderDate = orderDate > current.lastOrderDate ? orderDate : current.lastOrderDate;
      });

      // Calculate averages and lifetime value
      customerMap.forEach(customer => {
        customer.averageOrderValue = customer.orderCount > 0 ? customer.totalSpent / customer.orderCount : 0;
        customer.customerLifetimeValue = customer.totalSpent; // Simplified LTV calculation
      });

      // Sort by total spent and return top customers
      return Array.from(customerMap.values())
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting top customers:', error);
      throw error;
    }
  },

  // Get sales comparison between periods
  async getSalesComparison(currentPeriod: { from: Date; to: Date }, previousPeriod: { from: Date; to: Date }) {
    try {
      const [currentMetrics, previousMetrics] = await Promise.all([
        this.getSalesMetrics(currentPeriod.from, currentPeriod.to),
        this.getSalesMetrics(previousPeriod.from, previousPeriod.to)
      ]);

      const revenueChange = previousMetrics.totalRevenue > 0 
        ? ((currentMetrics.totalRevenue - previousMetrics.totalRevenue) / previousMetrics.totalRevenue) * 100 
        : 0;

      const orderChange = previousMetrics.totalOrders > 0 
        ? ((currentMetrics.totalOrders - previousMetrics.totalOrders) / previousMetrics.totalOrders) * 100 
        : 0;

      const aovChange = previousMetrics.averageOrderValue > 0 
        ? ((currentMetrics.averageOrderValue - previousMetrics.averageOrderValue) / previousMetrics.averageOrderValue) * 100 
        : 0;

      return {
        current: currentMetrics,
        previous: previousMetrics,
        changes: {
          revenue: revenueChange,
          orders: orderChange,
          averageOrderValue: aovChange
        }
      };
    } catch (error) {
      console.error('Error getting sales comparison:', error);
      throw error;
    }
  }
};
