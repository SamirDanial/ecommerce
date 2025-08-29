import React from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  FolderOpen,
  AlertTriangle,
  Activity,
  Star,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease";
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
  color,
  bgColor,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {changeType === "increase" ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span
                className={`text-sm font-medium ${
                  changeType === "increase" ? "text-green-600" : "text-red-600"
                }`}
              >
                {change > 0 ? "+" : ""}
                {change}%
              </span>
              <span className="text-sm text-gray-500 ml-1">
                from last month
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <div className={`w-8 h-8 ${color}`}>{icon}</div>
        </div>
      </div>
    </div>
  );
};

interface DashboardStatsProps {
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalUsers: number;
    totalRevenue: number;
    totalCategories: number;
    pendingOrders: number;
    lowStockProducts: number;
    activeUsers: number;
  };
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          change={12.5}
          changeType="increase"
          icon={<DollarSign className="w-8 h-8" />}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          change={8.2}
          changeType="increase"
          icon={<ShoppingCart className="w-8 h-8" />}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change={15.3}
          changeType="increase"
          icon={<Users className="w-8 h-8" />}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts.toLocaleString()}
          change={5.7}
          changeType="increase"
          icon={<Package className="w-8 h-8" />}
          color="text-orange-600"
          bgColor="bg-orange-100"
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Categories"
          value={stats.totalCategories}
          icon={<FolderOpen className="w-8 h-8" />}
          color="text-indigo-600"
          bgColor="bg-indigo-100"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={<Activity className="w-8 h-8" />}
          color="text-yellow-600"
          bgColor="bg-yellow-100"
        />
        <StatCard
          title="Low Stock Alert"
          value={stats.lowStockProducts}
          icon={<AlertTriangle className="w-8 h-8" />}
          color="text-red-600"
          bgColor="bg-red-100"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={<Star className="w-8 h-8" />}
          color="text-emerald-600"
          bgColor="bg-emerald-100"
        />
      </div>
    </div>
  );
};
