import React from "react";
import { Card, CardContent } from "../../ui/card";
import { TrendingUp, BarChart3, Activity, PieChart } from "lucide-react";

interface GrowthIndicators {
  revenueGrowth: number;
  orderGrowth: number;
  profitGrowth: number;
}

interface KeyMetricsCardsProps {
  analyticsData: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalProfit: number;
    profitMargin: number;
  };
  growthIndicators: GrowthIndicators | null;
  formatCurrency: (amount: number) => string;
  formatPercentage: (amount: number) => string;
}

const KeyMetricsCards: React.FC<KeyMetricsCardsProps> = ({
  analyticsData,
  growthIndicators,
  formatCurrency,
  formatPercentage,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Revenue */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
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
                  {formatPercentage(Math.abs(growthIndicators.revenueGrowth))}
                </p>
              )}
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Orders */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
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

      {/* Average Order */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Order</p>
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

      {/* Profit Margin */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Profit Margin</p>
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
  );
};

export default KeyMetricsCards;
