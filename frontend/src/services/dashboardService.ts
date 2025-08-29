import { getApiBaseUrl } from "../config/api";

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
  createdAt: string;
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
  private baseURL: string;

  constructor() {
    this.baseURL = getApiBaseUrl();
  }

  async getDashboardData(token?: string): Promise<DashboardData> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}/admin/dashboard`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Return mock data for now until backend is ready
      return this.getMockDashboardData();
    }
  }

  private getMockDashboardData(): DashboardData {
    // Generate realistic mock data
    const now = new Date();
    const salesChart: SalesData[] = [];

    // Generate last 30 days of sales data
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      salesChart.push({
        date: date.toISOString().split("T")[0],
        revenue: Math.floor(Math.random() * 5000) + 1000,
        orders: Math.floor(Math.random() * 50) + 10,
      });
    }

    return {
      stats: {
        totalProducts: 1247,
        totalOrders: 892,
        totalUsers: 1243,
        totalRevenue: 45678,
        totalCategories: 28,
        pendingOrders: 23,
        lowStockProducts: 15,
        activeUsers: 892,
      },
      salesChart,
      topProducts: [
        {
          id: 1,
          name: "Premium Wireless Headphones",
          sales: 156,
          revenue: 23400,
          image: "/uploads/products/headphones.jpg",
        },
        {
          id: 2,
          name: "Smart Fitness Watch",
          sales: 134,
          revenue: 20100,
          image: "/uploads/products/watch.jpg",
        },
        {
          id: 3,
          name: "Organic Cotton T-Shirt",
          sales: 289,
          revenue: 8670,
          image: "/uploads/products/tshirt.jpg",
        },
        {
          id: 4,
          name: "Wireless Charging Pad",
          sales: 98,
          revenue: 14700,
          image: "/uploads/products/charger.jpg",
        },
        {
          id: 5,
          name: "Bluetooth Speaker",
          sales: 167,
          revenue: 16700,
          image: "/uploads/products/speaker.jpg",
        },
      ],
      recentOrders: [
        {
          id: 1,
          orderNumber: "ORD-2024-001",
          customerName: "John Smith",
          total: 299.99,
          status: "Processing",
          createdAt: "2024-01-15T10:30:00Z",
        },
        {
          id: 2,
          orderNumber: "ORD-2024-002",
          customerName: "Sarah Johnson",
          total: 149.5,
          status: "Shipped",
          createdAt: "2024-01-15T09:15:00Z",
        },
        {
          id: 3,
          orderNumber: "ORD-2024-003",
          customerName: "Mike Davis",
          total: 89.99,
          status: "Delivered",
          createdAt: "2024-01-14T16:45:00Z",
        },
        {
          id: 4,
          orderNumber: "ORD-2024-004",
          customerName: "Emily Wilson",
          total: 199.99,
          status: "Processing",
          createdAt: "2024-01-14T14:20:00Z",
        },
        {
          id: 5,
          orderNumber: "ORD-2024-005",
          customerName: "David Brown",
          total: 79.99,
          status: "Shipped",
          createdAt: "2024-01-14T11:30:00Z",
        },
      ],
      recentActivity: [
        {
          id: 1,
          type: "order",
          message: "New order #ORD-2024-001 received",
          timestamp: "2 minutes ago",
          status: "success",
        },
        {
          id: 2,
          type: "product",
          message: "Product 'Premium Headphones' stock updated",
          timestamp: "15 minutes ago",
          status: "info",
        },
        {
          id: 3,
          type: "user",
          message: "New user registration: john.doe@email.com",
          timestamp: "1 hour ago",
          status: "success",
        },
        {
          id: 4,
          type: "review",
          message: "5-star review received for 'Smart Watch'",
          timestamp: "2 hours ago",
          status: "success",
        },
        {
          id: 5,
          type: "product",
          message: "Low stock alert: 'Wireless Charger' (5 remaining)",
          timestamp: "3 hours ago",
          status: "warning",
        },
      ],
    };
  }
}

export const dashboardService = new DashboardService();
