import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Activity } from "lucide-react";

interface TopProduct {
  name: string;
  revenue: number;
  orders: number;
}

interface TopProductsSectionProps {
  topProducts: TopProduct[];
  formatCurrency: (amount: number) => string;
}

const TopProductsSection: React.FC<TopProductsSectionProps> = ({
  topProducts,
  formatCurrency,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Top Performing Products
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topProducts.slice(0, 6).map((product, index) => (
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
  );
};

export default TopProductsSection;
