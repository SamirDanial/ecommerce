import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { TrendingUp, BarChart3, PieChart } from "lucide-react";
import ChartJSBarChart from "../charts/ChartJSBarChart";
import ChartJSLineChart from "../charts/ChartJSLineChart";
import ChartJSPieChart from "../charts/ChartJSPieChart";
import { ChartType } from "./AnalyticsControls";

interface ChartData {
  date: string;
  revenue: number;
  orders: number;
  profit: number;
  cost: number;
  averageOrderValue: number;
}

interface OrderStatusItem {
  status: string;
  count: number;
  percentage: number;
}

interface AnalyticsChartsProps {
  chartType: ChartType;
  timeSeriesData: ChartData[];
  orderStatusDistribution: OrderStatusItem[];
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  chartType,
  timeSeriesData,
  orderStatusDistribution,
}) => {
  // Format date labels to show abbreviated years
  const formatDateLabel = (date: string) => {
    return date.replace("2024", "24").replace("2025", "25");
  };

  if (chartType === "all") {
    return (
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
              data={timeSeriesData.map((item, index) => ({
                label: formatDateLabel(item.date),
                value: item.revenue,
                color: `hsl(${(index * 137.5) % 360}, 70%, 60%)`,
              }))}
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
              data={timeSeriesData.map((item, index) => ({
                label: formatDateLabel(item.date),
                value: item.revenue,
              }))}
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
              data={orderStatusDistribution.map((item, index) => ({
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
              }))}
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
              data={timeSeriesData.map((item, index) => ({
                label: formatDateLabel(item.date),
                value: item.orders,
                color: `hsl(${(index * 137.5 + 120) % 360}, 70%, 60%)`,
              }))}
              title=""
              yAxisLabel="Number of Orders"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (chartType === "bar") {
    return (
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
              data={timeSeriesData.map((item, index) => ({
                label: item.date,
                value: item.revenue,
                color: `hsl(${(index * 137.5) % 360}, 70%, 60%)`,
              }))}
              title="Revenue by Time Period"
              yAxisLabel="Revenue ($)"
            />
          </CardContent>
        </Card>

        {/* Orders Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Orders by Time Period
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ChartJSBarChart
              data={timeSeriesData.map((item, index) => ({
                label: item.date,
                value: item.orders,
                color: `hsl(${(index * 137.5 + 120) % 360}, 70%, 60%)`,
              }))}
              title="Orders by Time Period"
              yAxisLabel="Number of Orders"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (chartType === "line") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              data={timeSeriesData.map((item, index) => ({
                label: item.date,
                value: item.revenue,
              }))}
              title="Revenue Trend Line"
              yAxisLabel="Revenue ($)"
              showArea={true}
            />
          </CardContent>
        </Card>

        {/* Orders Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Orders Trend Line
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ChartJSLineChart
              data={timeSeriesData.map((item, index) => ({
                label: item.date,
                value: item.orders,
              }))}
              title="Orders Trend Line"
              yAxisLabel="Number of Orders"
              showArea={true}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (chartType === "pie") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              data={orderStatusDistribution.map((item, index) => ({
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
              }))}
              title="Order Status Distribution"
              showLegend={true}
            />
          </CardContent>
        </Card>

        {/* Alternative View for Order Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Order Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {orderStatusDistribution.map((item, index) => (
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
                      {item.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default AnalyticsCharts;
