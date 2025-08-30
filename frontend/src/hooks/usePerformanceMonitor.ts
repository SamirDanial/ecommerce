import { useCallback, useRef } from "react";

interface PerformanceMetrics {
  loadTime: number;
  timestamp: number;
  componentName: string;
}

export const usePerformanceMonitor = () => {
  const metricsRef = useRef<PerformanceMetrics[]>([]);

  const startLoading = useCallback((componentName: string) => {
    const startTime = performance.now();
    return {
      componentName,
      startTime,
    };
  }, []);

  const endLoading = useCallback(
    (startData: { componentName: string; startTime: number }) => {
      const endTime = performance.now();
      const loadTime = endTime - startData.startTime;

      const metric: PerformanceMetrics = {
        loadTime,
        timestamp: Date.now(),
        componentName: startData.componentName,
      };

      metricsRef.current.push(metric);

      // Log to console in development
      if (process.env.NODE_ENV === "development") {
        console.log(
          `🚀 ${startData.componentName} loaded in ${loadTime.toFixed(2)}ms`
        );
      }

      return metric;
    },
    []
  );

  const getMetrics = useCallback(() => {
    return metricsRef.current;
  }, []);

  const getAverageLoadTime = useCallback(() => {
    if (metricsRef.current.length === 0) return 0;

    const totalTime = metricsRef.current.reduce(
      (sum, metric) => sum + metric.loadTime,
      0
    );
    return totalTime / metricsRef.current.length;
  }, []);

  const clearMetrics = useCallback(() => {
    metricsRef.current = [];
  }, []);

  return {
    startLoading,
    endLoading,
    getMetrics,
    getAverageLoadTime,
    clearMetrics,
  };
};
