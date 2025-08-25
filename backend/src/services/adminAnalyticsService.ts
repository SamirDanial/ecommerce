import { PrismaClient } from '@prisma/client';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subDays, subWeeks, subMonths, subQuarters, subYears, format } from 'date-fns';

const prisma = new PrismaClient();

export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalProfit: number;
  totalCost: number;
  profitMargin: number;
  growthRate: number;
  topProducts: Array<{
    name: string;
    revenue: number;
    orders: number;
  }>;
  orderStatusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  paymentMethodDistribution: Array<{
    method: string;
    count: number;
    percentage: number;
  }>;
  timeSeriesData: Array<{
    date: string;
    revenue: number;
    orders: number;
    profit: number;
    cost: number;
    averageOrderValue: number;
  }>;
}

export interface ChartData {
  date: string;
  revenue: number;
  orders: number;
  profit: number;
  cost: number;
  averageOrderValue: number;
}

export class AdminAnalyticsService {
  /**
   * Get comprehensive analytics data for the admin dashboard
   */
  static async getAnalytics(
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semi-annually' | 'yearly' | 'custom',
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<AnalyticsData> {
    try {
      // Calculate date range based on period
      const { from, to } = this.calculateDateRange(period, dateFrom, dateTo);
      
      // Get all orders in the date range
      const orders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: from,
            lte: to
          }
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

      // Calculate basic metrics
      const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Calculate profit and cost using actual variant/product costs
      const totalCost = orders.reduce((sum, order) => {
        const orderCost = order.items.reduce((itemSum, item) => {
          // Use stored costPrice from time of sale, fallback to variant/product cost, then 60% estimation
          const itemCost = item.costPrice || item.variant?.costPrice || item.product?.costPrice || (Number(item.price) * 0.6);
          return itemSum + (Number(itemCost) * item.quantity);
        }, 0);
        return sum + orderCost;
      }, 0);
      
      const totalProfit = totalRevenue - totalCost;
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

      // Get order status distribution
      const orderStatusCounts = await prisma.order.groupBy({
        by: ['orderStatus'],
        where: {
          createdAt: {
            gte: from,
            lte: to
          }
        },
        _count: {
          orderStatus: true
        }
      });

      const orderStatusDistribution = orderStatusCounts.map(status => ({
        status: status.orderStatus,
        count: status._count.orderStatus,
        percentage: totalOrders > 0 ? (status._count.orderStatus / totalOrders) * 100 : 0
      }));

      // If no orders, provide default distribution
      if (totalOrders === 0) {
        orderStatusDistribution.push({
          status: 'PENDING_APPROVAL',
          count: 0,
          percentage: 0
        });
      }

      // Get payment method distribution
      const paymentCounts = await prisma.order.groupBy({
        by: ['paymentMethodId'],
        where: {
          createdAt: {
            gte: from,
            lte: to
          }
        },
        _count: {
          paymentMethodId: true
        }
      });

      // Get payment method details for each group
      const paymentMethodDistribution = await Promise.all(
        paymentCounts.map(async (payment) => {
          let methodName = 'Unknown';
          if (payment.paymentMethodId) {
            const paymentMethod = await prisma.paymentMethod.findUnique({
              where: { id: payment.paymentMethodId }
            });
            methodName = paymentMethod ? paymentMethod.type : 'Unknown';
          }
          
          return {
            method: methodName,
            count: payment._count.paymentMethodId,
            percentage: totalOrders > 0 ? (payment._count.paymentMethodId / totalOrders) * 100 : 0
          };
        })
      );

      // If no payment methods, provide default data
      if (paymentMethodDistribution.length === 0) {
        paymentMethodDistribution.push({
          method: 'No payments yet',
          count: 0,
          percentage: 0
        });
      }

      // Get top products
      const topProducts = await this.getTopProducts(from, to);

      // If no top products, provide default data
      if (topProducts.length === 0) {
        topProducts.push({
          name: 'No products yet',
          revenue: 0,
          orders: 0
        });
      }

      // Get time series data
      const timeSeriesData = await this.getTimeSeriesData(period, from, to);

      // Calculate growth rate (comparing with previous period)
      const previousPeriodData = await this.getPreviousPeriodData(period, from);
      const growthRate = this.calculateGrowthRate(totalRevenue, previousPeriodData.revenue);

      // If no time series data, create a default entry
      if (timeSeriesData.length === 0) {
        timeSeriesData.push({
          date: format(new Date(), 'MMM dd'),
          revenue: 0,
          orders: 0,
          profit: 0,
          cost: 0,
          averageOrderValue: 0
        });
      }

      return {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        totalProfit,
        totalCost,
        profitMargin,
        growthRate,
        topProducts,
        orderStatusDistribution,
        paymentMethodDistribution,
        timeSeriesData
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
      throw new Error('Failed to get analytics data');
    }
  }

  /**
   * Calculate date range based on period
   */
  private static calculateDateRange(
    period: string,
    dateFrom?: Date,
    dateTo?: Date
  ): { from: Date; to: Date } {
    const now = new Date();
    let from: Date;
    let to: Date = now;

    switch (period) {
      case 'daily':
        from = subDays(now, 30);
        break;
      case 'weekly':
        from = subWeeks(now, 12);
        break;
      case 'monthly':
        from = subMonths(now, 12);
        break;
      case 'quarterly':
        from = subQuarters(now, 8);
        break;
      case 'semi-annually':
        from = subMonths(now, 24);
        break;
      case 'yearly':
        from = subYears(now, 5);
        break;
      case 'custom':
        from = dateFrom || subMonths(now, 1);
        to = dateTo || now;
        break;
      default:
        from = subMonths(now, 12);
    }

    return { from, to };
  }

  /**
   * Get top performing products
   */
  private static async getTopProducts(from: Date, to: Date) {
    const productStats = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: {
            gte: from,
            lte: to
          }
        }
      },
      _sum: {
        price: true,
        quantity: true
      },
      _count: {
        orderId: true
      }
    });

    const topProducts = await Promise.all(
      productStats
        .sort((a, b) => Number(b._sum.price) - Number(a._sum.price))
        .slice(0, 10)
        .map(async (stat) => {
          const product = await prisma.product.findUnique({
            where: { id: stat.productId }
          });

          return {
            name: product?.name || 'Unknown Product',
            revenue: Number(stat._sum.price || 0),
            orders: stat._count.orderId
          };
        })
    );

    return topProducts;
  }

  /**
   * Get time series data for charts
   */
  private static async getTimeSeriesData(period: string, from: Date, to: Date) {
    const timeSeriesData: ChartData[] = [];
    let currentDate = new Date(from);
    const endDate = new Date(to);

    while (currentDate <= endDate) {
      let periodStart: Date;
      let periodEnd: Date;
      let dateLabel: string;

      switch (period) {
        case 'daily':
          periodStart = startOfDay(currentDate);
          periodEnd = endOfDay(currentDate);
          dateLabel = format(currentDate, 'MMM dd');
          currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
          break;
        case 'weekly':
          periodStart = startOfWeek(currentDate, { weekStartsOn: 1 });
          periodEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
          dateLabel = `Week ${format(periodStart, 'MMM dd')}`;
          currentDate = new Date(currentDate.setDate(currentDate.getDate() + 7));
          break;
        case 'monthly':
          periodStart = startOfMonth(currentDate);
          periodEnd = endOfMonth(currentDate);
          dateLabel = format(currentDate, 'MMM yyyy');
          currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
          break;
        case 'quarterly':
          periodStart = startOfQuarter(currentDate);
          periodEnd = endOfQuarter(currentDate);
          dateLabel = `Q${Math.ceil((currentDate.getMonth() + 1) / 3)} ${currentDate.getFullYear()}`;
          currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 3));
          break;
        default:
          periodStart = startOfMonth(currentDate);
          periodEnd = endOfMonth(currentDate);
          dateLabel = format(currentDate, 'MMM yyyy');
          currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
      }

      // Get orders for this period
      const periodOrders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: periodStart,
            lte: periodEnd
          }
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

      const periodRevenue = periodOrders.reduce((sum, order) => sum + Number(order.total), 0);
      const periodOrdersCount = periodOrders.length;
              const periodCost = periodOrders.reduce((sum, order) => {
          const orderCost = order.items.reduce((itemSum, item) => {
            // Use stored costPrice from time of sale, fallback to variant/product cost, then 60% estimation
            const itemCost = item.costPrice || item.variant?.costPrice || item.product?.costPrice || (Number(item.price) * 0.6);
            return itemSum + (Number(itemCost) * item.quantity);
          }, 0);
          return sum + orderCost;
        }, 0);
      const periodProfit = periodRevenue - periodCost;
      const periodAverageOrderValue = periodOrdersCount > 0 ? periodRevenue / periodOrdersCount : 0;

      timeSeriesData.push({
        date: dateLabel,
        revenue: periodRevenue,
        orders: periodOrdersCount,
        profit: periodProfit,
        cost: periodCost,
        averageOrderValue: periodAverageOrderValue
      });
    }

    return timeSeriesData;
  }

  /**
   * Get data from previous period for growth calculation
   */
  private static async getPreviousPeriodData(period: string, from: Date) {
    let previousFrom: Date;
    let previousTo: Date;

    switch (period) {
      case 'daily':
        previousTo = new Date(from);
        previousFrom = subDays(previousTo, 30);
        break;
      case 'weekly':
        previousTo = new Date(from);
        previousFrom = subWeeks(previousTo, 12);
        break;
      case 'monthly':
        previousTo = new Date(from);
        previousFrom = subMonths(previousTo, 12);
        break;
      default:
        previousTo = new Date(from);
        previousFrom = subMonths(previousTo, 12);
    }

    const previousOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: previousFrom,
          lte: previousTo
        }
      }
    });

    const previousRevenue = previousOrders.reduce((sum, order) => sum + Number(order.total), 0);

    return { revenue: previousRevenue };
  }

  /**
   * Calculate growth rate
   */
  private static calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }
}
