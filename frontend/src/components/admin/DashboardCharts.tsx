import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { format } from "date-fns";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardChartsProps {
  salesData: Array<{ date: string; revenue: number; orders: number }>;
  topProducts: Array<{ name: string; sales: number; revenue: number }>;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  salesData,
  topProducts,
}) => {
  // Sales Trend Chart
  const salesChartData = {
    labels: salesData.map((item) => format(new Date(item.date), "MMM dd")),
    datasets: [
      {
        label: "Revenue ($)",
        data: salesData.map((item) => item.revenue),
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.4,
        fill: true,
        yAxisID: "y",
      },
      {
        label: "Orders",
        data: salesData.map((item) => item.orders),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
        fill: false,
        yAxisID: "y1",
      },
    ],
  };

  const salesChartOptions = {
    responsive: true,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Sales & Orders Trend (Last 30 Days)",
        font: {
          size: 16,
          weight: "bold" as const,
        },
      },
    },
    scales: {
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: {
          display: true,
          text: "Revenue ($)",
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        title: {
          display: true,
          text: "Orders",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  };

  // Top Products Chart
  const topProductsData = {
    labels: topProducts.map((product) => product.name.substring(0, 20) + "..."),
    datasets: [
      {
        label: "Sales",
        data: topProducts.map((product) => product.sales),
        backgroundColor: [
          "rgba(99, 102, 241, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(251, 146, 60, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(168, 85, 247, 0.8)",
        ],
        borderColor: [
          "rgb(99, 102, 241)",
          "rgb(34, 197, 94)",
          "rgb(251, 146, 60)",
          "rgb(236, 72, 153)",
          "rgb(168, 85, 247)",
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const topProductsOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Top Products by Sales",
        font: {
          size: 16,
          weight: "bold" as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Revenue Distribution Chart
  const revenueData = {
    labels: ["Products", "Services", "Subscriptions", "Other"],
    datasets: [
      {
        data: [65, 20, 10, 5],
        backgroundColor: [
          "rgba(99, 102, 241, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(251, 146, 60, 0.8)",
          "rgba(236, 72, 153, 0.8)",
        ],
        borderColor: [
          "rgb(99, 102, 241)",
          "rgb(34, 197, 94)",
          "rgb(251, 146, 60)",
          "rgb(236, 72, 153)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const revenueOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      title: {
        display: true,
        text: "Revenue Distribution",
        font: {
          size: 16,
          weight: "bold" as const,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Sales Trend Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <Line data={salesChartData} options={salesChartOptions} height={80} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <Bar
            data={topProductsData}
            options={topProductsOptions}
            height={60}
          />
        </div>

        {/* Revenue Distribution Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <Doughnut data={revenueData} options={revenueOptions} height={60} />
        </div>
      </div>
    </div>
  );
};
