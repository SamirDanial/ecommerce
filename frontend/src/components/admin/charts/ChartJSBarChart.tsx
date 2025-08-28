import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface ChartJSBarChartProps {
  data: BarData[];
  width?: number;
  height?: number;
  title?: string;
  yAxisLabel?: string;
}

const ChartJSBarChart: React.FC<ChartJSBarChartProps> = ({
  data,
  width = 400,
  height = 300,
  title = "Bar Chart",
  yAxisLabel = "Value",
}) => {
  // Validate data
  if (!data || data.length === 0) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ width, height }}
      >
        <div className="text-center text-gray-500">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  // Filter out invalid data
  const validData = data.filter(
    (item) =>
      item &&
      typeof item.value === "number" &&
      !isNaN(item.value) &&
      isFinite(item.value) &&
      item.label
  );

  if (validData.length === 0) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ width, height }}
      >
        <div className="text-center text-gray-500">
          <p>No valid data available</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = {
    labels: validData.map((item) => item.label),
    datasets: [
      {
        label: title,
        data: validData.map((item) => item.value),
        backgroundColor: validData.map(
          (item, index) =>
            item.color || `hsl(${(index * 137.5) % 360}, 70%, 60%)`
        ),
        borderColor: validData.map(
          (item, index) =>
            item.color || `hsl(${(index * 137.5) % 360}, 70%, 60%)`
        ),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: validData.map(
          (item, index) =>
            item.color || `hsl(${(index * 137.5) % 360}, 70%, 75%)`
        ),
        hoverBorderColor: validData.map(
          (item, index) =>
            item.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)`
        ),
        hoverBorderWidth: 3,
      },
    ],
  };

  // Chart options
  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: "bold",
        },
        color: "#374151",
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#6b7280",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "#e5e7eb",
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 12,
          },
          callback: function (value) {
            return value;
          },
        },
        title: {
          display: true,
          text: yAxisLabel,
          color: "#6b7280",
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuart",
    },
  };

  return (
    <div className="w-full h-full min-h-[300px]">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ChartJSBarChart;
