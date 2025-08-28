import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  ChartOptions,
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface PieData {
  label: string;
  value: number;
  percentage: number;
  color?: string;
}

interface ChartJSPieChartProps {
  data: PieData[];
  width?: number;
  height?: number;
  title?: string;
  showLegend?: boolean;
}

const ChartJSPieChart: React.FC<ChartJSPieChartProps> = ({
  data,
  width = 400,
  height = 300,
  title = "Pie Chart",
  showLegend = true,
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
      item.value > 0 && // Pie charts should have positive values
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

  // Generate colors if not provided
  const chartColors = validData.map(
    (item, index) => item.color || `hsl(${(index * 137.5) % 360}, 70%, 60%)`
  );

  // Prepare chart data
  const chartData = {
    labels: validData.map((item) => item.label),
    datasets: [
      {
        data: validData.map((item) => item.value),
        backgroundColor: chartColors,
        borderColor: chartColors.map((color) => color.replace("0.6", "0.8")),
        borderWidth: 3,
        borderAlign: "inner" as const,
        hoverBackgroundColor: chartColors.map((color) =>
          color.replace("0.6", "0.8")
        ),
        hoverBorderColor: "#ffffff",
        hoverBorderWidth: 4,
        cutout: "30%",
        radius: "90%",
      },
    ],
  };

  // Chart options
  const options: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
          font: {
            size: 12,
            weight: "normal",
          },
          color: "#374151",
          generateLabels: function (chart) {
            const data = chart.data;
            if (data.labels && data.datasets) {
              return data.labels.map((label, index) => {
                const dataset = data.datasets[0];
                const value = dataset.data[index] as number;
                const total = (dataset.data as number[]).reduce(
                  (a, b) => a + b,
                  0
                );
                const percentage =
                  total > 0 ? ((value / total) * 100).toFixed(1) : "0";

                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: Array.isArray(dataset.backgroundColor)
                    ? (dataset.backgroundColor[index] as string)
                    : (dataset.backgroundColor as string),
                  strokeStyle: Array.isArray(dataset.borderColor)
                    ? (dataset.borderColor[index] as string)
                    : (dataset.borderColor as string),
                  lineWidth: 2,
                  hidden: false,
                  index: index,
                };
              });
            }
            return [];
          },
        },
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: "bold",
        },
        color: "#374151",
        padding: {
          top: 10,
          bottom: 20,
        },
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
            const label = context.label || "";
            const value = context.parsed;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage =
              total > 0 ? ((value / total) * 100).toFixed(1) : "0";
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      duration: 1500,
      easing: "easeInOutQuart",
      animateRotate: true,
      animateScale: true,
    },
    elements: {
      arc: {
        borderJoinStyle: "round",
        borderWidth: 2,
      },
    },
  };

  return (
    <div className="w-full h-full min-h-[300px]">
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default ChartJSPieChart;
