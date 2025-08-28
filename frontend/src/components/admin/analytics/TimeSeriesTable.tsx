import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Calendar } from "lucide-react";

interface ChartData {
  date: string;
  revenue: number;
  orders: number;
  profit: number;
  cost: number;
  averageOrderValue: number;
}

interface TimeSeriesTableProps {
  timeSeriesData: ChartData[];
  formatCurrency: (amount: number) => string;
}

const TimeSeriesTable: React.FC<TimeSeriesTableProps> = ({
  timeSeriesData,
  formatCurrency,
}) => {
  return (
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
              {timeSeriesData.slice(-10).map((item, index) => (
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
  );
};

export default TimeSeriesTable;
