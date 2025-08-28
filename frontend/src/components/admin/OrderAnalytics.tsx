import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Download,
  RefreshCw,
} from "lucide-react";
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
import ChartJSBarChart from "./charts/ChartJSBarChart";
import ChartJSLineChart from "./charts/ChartJSLineChart";
import ChartJSPieChart from "./charts/ChartJSPieChart";

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

type TimePeriod =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "semi-annually"
  | "yearly"
  | "custom";

const OrderAnalytics: React.FC = () => {
  const { getToken } = useClerkAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("monthly");
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  const [chartType, setChartType] = useState<"bar" | "line" | "pie" | "all">(
    "all"
  );

  // Calculate date range based on selected period
  const getDateRange = useCallback(
    (period: TimePeriod) => {
      const now = new Date();
      let from: Date;
      let to: Date = now;

      switch (period) {
        case "daily":
          from = subDays(now, 30);
          break;
        case "weekly":
          from = subWeeks(now, 12);
          break;
        case "monthly":
          from = subMonths(now, 12);
          break;
        case "quarterly":
          from = subQuarters(now, 8);
          break;
        case "semi-annually":
          from = subMonths(now, 24);
          break;
        case "yearly":
          from = subYears(now, 5);
          break;
        case "custom":
          from = customDateRange.from;
          to = customDateRange.to;
          break;
        default:
          from = subMonths(now, 12);
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
      if (!token) return;

      const { from, to } = getDateRange(selectedPeriod);

      const queryParams = new URLSearchParams({
        period: selectedPeriod,
        dateFrom: from.toISOString(),
        dateTo: to.toISOString(),
      });

      const response = await fetch(
        `${getApiBaseUrl()}/admin/orders/analytics?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data.data);
      } else {
        toast.error("Failed to fetch analytics data");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to fetch analytics data");
    } finally {
      setLoading(false);
    }
  }, [getToken, selectedPeriod, getDateRange]);

  // Load data on component mount and period change
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Export analytics data
  const exportAnalytics = useCallback(() => {
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
    a.download = `order-analytics-${selectedPeriod}-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [analyticsData, selectedPeriod]);

  // Calculate growth indicators
  const growthIndicators = useMemo(() => {
    if (
      !analyticsData?.timeSeriesData ||
      analyticsData.timeSeriesData.length < 2
    )
      return null;

    const current =
      analyticsData.timeSeriesData[analyticsData.timeSeriesData.length - 1];
    const previous =
      analyticsData.timeSeriesData[analyticsData.timeSeriesData.length - 2];

    const revenueGrowth =
      previous.revenue > 0
        ? ((current.revenue - previous.revenue) / previous.revenue) * 100
        : 0;
    const orderGrowth =
      previous.orders > 0
        ? ((current.orders - previous.orders) / previous.orders) * 100
        : 0;
    const profitGrowth =
      previous.profit > 0
        ? ((current.profit - previous.profit) / previous.profit) * 100
        : 0;

    return { revenueGrowth, orderGrowth, profitGrowth };
  }, [analyticsData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Analytics</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive insights into your order performance and trends
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchAnalyticsData}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            onClick={exportAnalytics}
            disabled={!analyticsData}
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Time Period
              </label>
              <Select
                value={selectedPeriod}
                onValueChange={(value: TimePeriod) => setSelectedPeriod(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily (Last 30 days)</SelectItem>
                  <SelectItem value="weekly">Weekly (Last 12 weeks)</SelectItem>
                  <SelectItem value="monthly">
                    Monthly (Last 12 months)
                  </SelectItem>
                  <SelectItem value="quarterly">
                    Quarterly (Last 8 quarters)
                  </SelectItem>
                  <SelectItem value="semi-annually">
                    Semi-annually (Last 2 years)
                  </SelectItem>
                  <SelectItem value="yearly">Yearly (Last 5 years)</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Chart Type
              </label>
              <Select
                value={chartType}
                onValueChange={(value: any) => setChartType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Charts</SelectItem>
                  <SelectItem value="line">Line Charts</SelectItem>
                  <SelectItem value="pie">Pie Charts</SelectItem>
                  <SelectItem value="all">All Charts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedPeriod === "custom" && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Custom Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={customDateRange.from.toISOString().split("T")[0]}
                    onChange={(e) =>
                      setCustomDateRange((prev) => ({
                        ...prev,
                        from: new Date(e.target.value),
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="date"
                    value={customDateRange.to.toISOString().split("T")[0]}
                    onChange={(e) =>
                      setCustomDateRange((prev) => ({
                        ...prev,
                        to: new Date(e.target.value),
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Cards */}
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(analyticsData.totalRevenue)}
                  </p>
                  {growthIndicators && (
                    <p
                      className={`text-sm ${
                        growthIndicators.revenueGrowth >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {growthIndicators.revenueGrowth >= 0 ? "↗" : "↘"}{" "}
                      {formatPercentage(
                        Math.abs(growthIndicators.revenueGrowth)
                      )}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Orders
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.totalOrders.toLocaleString()}
                  </p>
                  {growthIndicators && (
                    <p
                      className={`text-sm ${
                        growthIndicators.orderGrowth >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {growthIndicators.orderGrowth >= 0 ? "↗" : "↘"}{" "}
                      {formatPercentage(Math.abs(growthIndicators.orderGrowth))}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Average Order
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(analyticsData.averageOrderValue)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Profit Margin
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPercentage(analyticsData.profitMargin)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(analyticsData.totalProfit)} profit
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-full">
                  <PieChart className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      {analyticsData && (
        <div className="space-y-6">
          {/* Single Chart View */}
          {chartType !== "all" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue Trend ({selectedPeriod})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {chartType === "bar" && (
                    <ChartJSBarChart
                      data={analyticsData.timeSeriesData.map((item, index) => ({
                        label: item.date,
                        value: item.revenue,
                        color: `hsl(${(index * 137.5) % 360}, 70%, 60%)`,
                      }))}
                      width={400}
                      height={300}
                      title="Revenue by Time Period"
                      yAxisLabel="Revenue ($)"
                    />
                  )}
                  {chartType === "line" && (
                    <ChartJSLineChart
                      data={analyticsData.timeSeriesData.map((item, index) => ({
                        label: item.date,
                        value: item.revenue,
                      }))}
                      width={400}
                      height={300}
                      title="Revenue Trend Line"
                      yAxisLabel="Revenue ($)"
                      showArea={true}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Order Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Order Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {chartType === "pie" ? (
                    <ChartJSPieChart
                      data={analyticsData.orderStatusDistribution.map(
                        (item, index) => ({
                          label: item.status,
                          value: item.count,
                          percentage: item.percentage,
                          color:
                            [
                              "#10b981", // green
                              "#3b82f6", // blue
                              "#f59e0b", // yellow
                              "#8b5cf6", // purple
                              "#6b7280", // gray
                            ][index] || "#6b7280",
                        })
                      )}
                      width={400}
                      height={300}
                      title="Order Status Distribution"
                      showLegend={true}
                    />
                  ) : (
                    <div className="space-y-3">
                      {analyticsData.orderStatusDistribution.map(
                        (item, index) => (
                          <div
                            key={item.status}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  index === 0
                                    ? "bg-green-500"
                                    : index === 1
                                    ? "bg-blue-500"
                                    : index === 2
                                    ? "bg-yellow-500"
                                    : index === 3
                                    ? "bg-purple-500"
                                    : "bg-gray-500"
                                }`}
                              />
                              <span className="text-sm font-medium text-gray-700">
                                {item.status}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">
                                {item.count}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatPercentage(item.percentage)}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* All Charts View */}
          {chartType === "all" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue by Time Period
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ChartJSBarChart
                    data={analyticsData.timeSeriesData.map((item, index) => ({
                      label: item.date
                        .replace("2024", "24")
                        .replace("2025", "25"),
                      value: item.revenue,
                      color: `hsl(${(index * 137.5) % 360}, 70%, 60%)`,
                    }))}
                    width={400}
                    height={250}
                    title=""
                    yAxisLabel="Revenue ($)"
                  />
                </CardContent>
              </Card>

              {/* Revenue Line Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue Trend Line
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ChartJSLineChart
                    data={analyticsData.timeSeriesData.map((item, index) => ({
                      label: item.date
                        .replace("2024", "24")
                        .replace("2025", "25"),
                      value: item.revenue,
                    }))}
                    width={400}
                    height={250}
                    title=""
                    yAxisLabel="Revenue ($)"
                    showArea={true}
                  />
                </CardContent>
              </Card>

              {/* Order Status Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Order Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ChartJSPieChart
                    data={analyticsData.orderStatusDistribution.map(
                      (item, index) => ({
                        label: item.status,
                        value: item.count,
                        percentage: item.percentage,
                        color:
                          [
                            "#10b981", // green
                            "#3b82f6", // blue
                            "#f59e0b", // yellow
                            "#8b5cf6", // purple
                            "#6b7280", // gray
                          ][index] || "#6b7280",
                      })
                    )}
                    width={400}
                    height={250}
                    title=""
                    showLegend={true}
                  />
                </CardContent>
              </Card>

              {/* Orders by Time Period */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Orders by Time Period
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ChartJSBarChart
                    data={analyticsData.timeSeriesData.map((item, index) => ({
                      label: item.date
                        .replace("2024", "24")
                        .replace("2025", "25"),
                      value: item.orders,
                      color: `hsl(${(index * 137.5 + 120) % 360}, 70%, 60%)`,
                    }))}
                    width={400}
                    height={250}
                    title=""
                    yAxisLabel="Number of Orders"
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Top Products Performance */}
      {analyticsData?.topProducts && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Top Performing Products
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analyticsData.topProducts.slice(0, 6).map((product, index) => (
                <div
                  key={product.name}
                  className="p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      #{index + 1}
                    </span>
                    <span className="text-xs text-gray-500">
                      {product.orders} orders
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2 truncate">
                    {product.name}
                  </h4>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Series Data Table */}
      {analyticsData?.timeSeriesData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Detailed Time Series Data
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Revenue
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Orders
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Profit
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Cost
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Avg Order
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.timeSeriesData
                    .slice(-10)
                    .map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {item.date}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                          {formatCurrency(item.revenue)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {item.orders}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-green-600">
                          {formatCurrency(item.profit)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {formatCurrency(item.cost)}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">
                          {formatCurrency(item.averageOrderValue)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderAnalytics;
