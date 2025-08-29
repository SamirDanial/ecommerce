import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  totalCategories: number;
  pendingOrders: number;
  lowStockProducts: number;
  activeUsers: number;
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProducts {
  id: number;
  name: string;
  sales: number;
  revenue: number;
  image?: string;
}

export interface RecentOrders {
  id: number;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: Date;
}

export interface RecentActivity {
  id: number;
  type: "order" | "product" | "user" | "review";
  message: string;
  timestamp: string;
  status: "success" | "warning" | "error" | "info";
}

export interface DashboardData {
  stats: DashboardStats;
  salesChart: SalesData[];
  topProducts: TopProducts[];
  recentOrders: RecentOrders[];
  recentActivity: RecentActivity[];
}

class DashboardService {
  async getDashboardData(): Promise<DashboardData> {
    try {
      // Get basic stats
      const [
        totalProducts,
        totalOrders,
        totalUsers,
        totalCategories,
        pendingOrders,
        lowStockProducts,
        totalRevenue,
        activeUsers,
      ] = await Promise.all([
        prisma.product.count(),
        prisma.order.count(),
        prisma.user.count({ where: { role: "USER" } }),
        prisma.category.count(),
        prisma.order.count({ where: { orderStatus: "PENDING_APPROVAL" } }),
        prisma.product.count({
          where: {
            variants: {
              some: {
                stock: { lt: 10 },
              },
            },
          },
        }),
        prisma.order.aggregate({
          _sum: { total: true },
          where: { orderStatus: { not: "CANCELLED" } },
        }),
        prisma.user.count({
          where: {
            role: "USER",
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
        }),
      ]);

      // Get sales data for last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const salesData = await prisma.order.groupBy({
        by: ["createdAt"],
        _sum: { total: true },
        _count: { id: true },
        where: {
          createdAt: { gte: thirtyDaysAgo },
          orderStatus: { not: "CANCELLED" },
        },
        orderBy: { createdAt: "asc" },
      });

      // Get top products by sales
      const topProducts = await prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        _count: { id: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      });

      // Get product details for top products
      const topProductsWithDetails = await Promise.all(
        topProducts.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: { name: true, price: true, images: true },
          });

          if (!product) return null;

          return {
            id: item.productId,
            name: product.name,
            sales: Number(item._sum?.quantity || 0),
            revenue: Number(product.price) * Number(item._sum?.quantity || 0),
            image: product.images[0]?.url || null,
          };
        })
      );

      // Get recent orders
      const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true } },
        },
      });

      // Get recent activity (simulated for now)
      const recentActivity: RecentActivity[] = [
        {
          id: 1,
          type: "order",
          message: `New order #${
            recentOrders[0]?.orderNumber || "ORD-001"
          } received`,
          timestamp: "2 minutes ago",
          status: "success",
        },
        {
          id: 2,
          type: "product",
          message: "Product inventory updated",
          timestamp: "15 minutes ago",
          status: "info",
        },
        {
          id: 3,
          type: "user",
          message: "New user registration",
          timestamp: "1 hour ago",
          status: "success",
        },
        {
          id: 4,
          type: "review",
          message: "New product review received",
          timestamp: "2 hours ago",
          status: "success",
        },
        {
          id: 5,
          type: "product",
          message: `Low stock alert: ${lowStockProducts} products need attention`,
          timestamp: "3 hours ago",
          status: "warning",
        },
      ];

      // Process sales chart data
      const salesChart: SalesData[] = salesData.map((item) => ({
        date: item.createdAt.toISOString().split("T")[0],
        revenue: Number(item._sum.total) || 0,
        orders: item._count.id,
      }));

      // Fill in missing dates with zero values
      const filledSalesChart: SalesData[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const existingData = salesChart.find((item) => item.date === dateStr);

        filledSalesChart.push({
          date: dateStr,
          revenue: existingData?.revenue || 0,
          orders: existingData?.orders || 0,
        });
      }

      return {
        stats: {
          totalProducts,
          totalOrders,
          totalUsers,
          totalRevenue: Number(totalRevenue._sum.total) || 0,
          totalCategories,
          pendingOrders,
          lowStockProducts,
          activeUsers,
        },
        salesChart: filledSalesChart,
        topProducts: topProductsWithDetails.filter(Boolean) as TopProducts[],
        recentOrders: recentOrders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.user?.name || "Unknown",
          total: Number(order.total),
          status: order.orderStatus,
          createdAt: order.createdAt,
        })),
        recentActivity,
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw new Error("Failed to fetch dashboard data");
    }
  }
}

export const dashboardService = new DashboardService();
