import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useClerkAuth } from "../../hooks/useClerkAuth";
import { getApiBaseUrl } from "../../config/api";
import { toast } from "sonner";
import {
  format,
  subDays,
  subWeeks,
  subMonths,
  subQuarters,
  subYears,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
} from "date-fns";

// Import our new components
import AnalyticsHeader from "./analytics/AnalyticsHeader";
import AnalyticsControls, {
  TimePeriod,
  ChartType,
} from "./analytics/AnalyticsControls";
import KeyMetricsCards from "./analytics/KeyMetricsCards";
import AnalyticsCharts from "./analytics/AnalyticsCharts";
import TopProductsSection from "./analytics/TopProductsSection";
import TimeSeriesTable from "./analytics/TimeSeriesTable";

interface ChartData {
  date: string;
  revenue: number;
  orders: number;
  profit: number;
  cost: number;
  averageOrderValue: number;
}

interface AnalyticsData {
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
  timeSeriesData: ChartData[];
}

const OrderAnalytics: React.FC = () => {
  const { getToken } = useClerkAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("monthly");
  const [chartType, setChartType] = useState<ChartType>("all");
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });

  // Utility functions
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }, []);

  const formatPercentage = useCallback((amount: number) => {
    return `${amount.toFixed(1)}%`;
  }, []);

  // Calculate date range based on selected period
  const getDateRange = useCallback(
    (period: TimePeriod) => {
      const now = new Date();
      let from: Date;
      let to: Date = endOfDay(now);

      switch (period) {
        case "daily":
          from = startOfDay(subDays(now, 30));
          break;
        case "weekly":
          from = startOfWeek(subWeeks(now, 12));
          break;
        case "monthly":
          from = startOfMonth(subMonths(now, 12));
          break;
        case "quarterly":
          from = startOfQuarter(subQuarters(now, 8));
          break;
        case "semi-annually":
          from = startOfMonth(subMonths(now, 24));
          break;
        case "yearly":
          from = startOfYear(subYears(now, 5));
          break;
        case "custom":
          from = startOfDay(customDateRange.from);
          to = endOfDay(customDateRange.to);
          break;
        default:
          from = startOfMonth(subMonths(now, 12));
      }

      return { from, to };
    },
    [customDateRange]
  );

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { from, to } = getDateRange(selectedPeriod);

      const response = await fetch(
        `${getApiBaseUrl()}/admin/orders/analytics?period=${selectedPeriod}&dateFrom=${from.toISOString()}&dateTo=${to.toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const responseData = await response.json();
      setAnalyticsData(responseData.data);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast.error("Failed to fetch analytics data");
    } finally {
      setLoading(false);
    }
  }, [getToken, selectedPeriod, getDateRange]);

  // Export data to CSV
  const exportToCSV = useCallback(() => {
    if (!analyticsData) return;

    const csvContent = [
      ["Date", "Revenue", "Orders", "Profit", "Cost", "Average Order Value"],
      ...analyticsData.timeSeriesData.map((item) => [
        item.date,
        item.revenue.toString(),
        item.orders.toString(),
        item.profit.toString(),
        item.cost.toString(),
        item.averageOrderValue.toString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `order-analytics-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Analytics data exported successfully");
  }, [analyticsData]);

  // Calculate growth indicators
  const growthIndicators = useMemo(() => {
    if (
      !analyticsData?.timeSeriesData ||
      analyticsData.timeSeriesData.length < 2
    ) {
      return null;
    }

    const current =
      analyticsData.timeSeriesData[analyticsData.timeSeriesData.length - 1];
    const previous =
      analyticsData.timeSeriesData[analyticsData.timeSeriesData.length - 2];

    return {
      revenueGrowth:
        previous.revenue > 0
          ? ((current.revenue - previous.revenue) / previous.revenue) * 100
          : 0,
      orderGrowth:
        previous.orders > 0
          ? ((current.orders - previous.orders) / previous.orders) * 100
          : 0,
      profitGrowth:
        previous.profit > 0
          ? ((current.profit - previous.profit) / previous.profit) * 100
          : 0,
    };
  }, [analyticsData]);

  // Fetch data on component mount and when period changes
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  if (loading && !analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No analytics data available</p>
        <button
          onClick={fetchAnalyticsData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <AnalyticsHeader
        loading={loading}
        hasData={!!analyticsData}
        onRefresh={fetchAnalyticsData}
        onExport={exportToCSV}
      />

      {/* Controls */}
      <AnalyticsControls
        selectedPeriod={selectedPeriod}
        chartType={chartType}
        customDateRange={customDateRange}
        onPeriodChange={setSelectedPeriod}
        onChartTypeChange={setChartType}
        onCustomDateChange={setCustomDateRange}
      />

      {/* Key Metrics Cards */}
      <KeyMetricsCards
        analyticsData={analyticsData}
        growthIndicators={growthIndicators}
        formatCurrency={formatCurrency}
        formatPercentage={formatPercentage}
      />

      {/* Charts Section */}
      <AnalyticsCharts
        chartType={chartType}
        timeSeriesData={analyticsData.timeSeriesData}
        orderStatusDistribution={analyticsData.orderStatusDistribution}
      />

      {/* Top Products Performance */}
      <TopProductsSection
        topProducts={analyticsData.topProducts}
        formatCurrency={formatCurrency}
      />

      {/* Time Series Data Table */}
      <TimeSeriesTable
        timeSeriesData={analyticsData.timeSeriesData}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default OrderAnalytics;
