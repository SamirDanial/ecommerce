import React from "react";
import { Card, CardContent } from "../../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

export type TimePeriod =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "semi-annually"
  | "yearly"
  | "custom";

export type ChartType = "bar" | "line" | "pie" | "all";

interface AnalyticsControlsProps {
  selectedPeriod: TimePeriod;
  chartType: ChartType;
  customDateRange: { from: Date; to: Date };
  onPeriodChange: (period: TimePeriod) => void;
  onChartTypeChange: (type: ChartType) => void;
  onCustomDateChange: (range: { from: Date; to: Date }) => void;
}

const AnalyticsControls: React.FC<AnalyticsControlsProps> = ({
  selectedPeriod,
  chartType,
  customDateRange,
  onPeriodChange,
  onChartTypeChange,
  onCustomDateChange,
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Time Period
            </label>
            <Select
              value={selectedPeriod}
              onValueChange={(value: TimePeriod) => onPeriodChange(value)}
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
              onValueChange={(value: ChartType) => onChartTypeChange(value)}
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
                    onCustomDateChange({
                      ...customDateRange,
                      from: new Date(e.target.value),
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="date"
                  value={customDateRange.to.toISOString().split("T")[0]}
                  onChange={(e) =>
                    onCustomDateChange({
                      ...customDateRange,
                      to: new Date(e.target.value),
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsControls;
