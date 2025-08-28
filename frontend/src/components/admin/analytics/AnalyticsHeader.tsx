import React from "react";
import { Button } from "../../ui/button";
import { Download, RefreshCw } from "lucide-react";

interface AnalyticsHeaderProps {
  loading: boolean;
  hasData: boolean;
  onRefresh: () => void;
  onExport: () => void;
}

const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  loading,
  hasData,
  onRefresh,
  onExport,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Order Analytics</h1>
        <p className="text-gray-600 mt-2">
          Comprehensive insights into your order performance and trends
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={onRefresh} disabled={loading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
        <Button
          onClick={onExport}
          disabled={!hasData}
          className="bg-green-600 hover:bg-green-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
    </div>
  );
};

export default AnalyticsHeader;
