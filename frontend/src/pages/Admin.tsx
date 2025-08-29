import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Activity,
  Zap,
} from "lucide-react";
import { DashboardStats } from "../components/admin/DashboardStats";
import { DashboardCharts } from "../components/admin/DashboardCharts";
import { DashboardActivity } from "../components/admin/DashboardActivity";
import { DashboardQuickActions } from "../components/admin/DashboardQuickActions";
import { dashboardService, DashboardData } from "../services/dashboardService";
import { useClerkAuth } from "../hooks/useClerkAuth";

const Admin: React.FC = () => {
  const { getToken } = useClerkAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();
        if (token) {
          const data = await dashboardService.getDashboardData(token);
          setDashboardData(data);
        } else {
          // Fallback to mock data if no token
          const data = await dashboardService.getDashboardData();
          setDashboardData(data);
        }
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error("Dashboard data fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [getToken]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">
              {error || "Failed to load dashboard data"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Welcome back! 👋
                </h1>
                <p className="text-xl text-gray-600 mb-4">
                  Here's what's happening with your e-commerce business today
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-green-500" />
                    <span>Last updated: {new Date().toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span>System Status: All Systems Operational</span>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="text-right">
                  <div className="text-6xl font-bold text-blue-600 mb-2">
                    {new Date().getDate()}
                  </div>
                  <div className="text-lg text-gray-600">
                    {new Date().toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <DashboardStats stats={dashboardData.stats} />

        {/* Charts Section */}
        <div className="mb-8">
          <DashboardCharts
            salesData={dashboardData.salesChart}
            topProducts={dashboardData.topProducts}
          />
        </div>

        {/* Activity Section */}
        <div className="mb-8">
          <DashboardActivity
            recentOrders={dashboardData.recentOrders}
            recentActivity={dashboardData.recentActivity}
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <DashboardQuickActions />
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">+12.5%</p>
              <p className="text-sm text-gray-600">Revenue Growth</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">+8.2%</p>
              <p className="text-sm text-gray-600">Customer Growth</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg">
              <ShoppingCart className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">+15.3%</p>
              <p className="text-sm text-gray-600">Order Growth</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
