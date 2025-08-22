import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineData {
  label: string;
  value: number;
  color?: string;
}

interface ChartJSLineChartProps {
  data: LineData[];
  width?: number;
  height?: number;
  title?: string;
  yAxisLabel?: string;
  showArea?: boolean;
}

const ChartJSLineChart: React.FC<ChartJSLineChartProps> = ({ 
  data, 
  width = 400, 
  height = 300, 
  title = "Line Chart",
  yAxisLabel = "Value",
  showArea = true
}) => {
  // Validate data
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ width, height }}>
        <div className="text-center text-gray-500">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  // Filter out invalid data
  const validData = data.filter(item => 
    item && 
    typeof item.value === 'number' && 
    !isNaN(item.value) && 
    isFinite(item.value) &&
    item.label
  );

  if (validData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ width, height }}>
        <div className="text-center text-gray-500">
          <p>No valid data available</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = {
    labels: validData.map(item => item.label),
    datasets: [
      {
        label: title,
        data: validData.map(item => item.value),
        borderColor: '#3b82f6',
        backgroundColor: showArea ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
        borderWidth: 3,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#1d4ed8',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
        fill: showArea,
        tension: 0.4,
        spanGaps: true,
      }
    ]
  };

  // Chart options
  const options: ChartOptions<'line'> = {
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
          weight: 'bold'
        },
        color: '#374151'
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#6b7280',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: '#f3f4f6',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12
          },
          callback: function(value) {
            return value;
          }
        },
        title: {
          display: true,
          text: yAxisLabel,
          color: '#6b7280',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart',
    },
    elements: {
      point: {
        hoverBackgroundColor: '#1d4ed8',
        hoverBorderColor: '#ffffff',
        hoverBorderWidth: 3,
        hoverRadius: 8,
      }
    }
  };

  return (
    <div className="w-full h-full">
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm" style={{ width, height }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ChartJSLineChart;
