// Performance monitoring utilities
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();

  static startTimer(componentName: string): string {
    const startTime = performance.now();
    const timerId = `${componentName}_${Date.now()}`;

    if (!this.metrics.has(componentName)) {
      this.metrics.set(componentName, []);
    }

    return timerId;
  }

  static endTimer(componentName: string, timerId: string): number {
    const endTime = performance.now();
    const loadTime = endTime - performance.now();

    const metrics = this.metrics.get(componentName);
    if (metrics) {
      metrics.push(loadTime);
    }

    return loadTime;
  }

  static getAverageLoadTime(componentName: string): number {
    const metrics = this.metrics.get(componentName);
    if (!metrics || metrics.length === 0) return 0;

    return metrics.reduce((sum, time) => sum + time, 0) / metrics.length;
  }

  static getSlowestComponents(
    limit: number = 5
  ): Array<{ name: string; avgTime: number }> {
    const components = Array.from(this.metrics.entries()).map(
      ([name, times]) => ({
        name,
        avgTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      })
    );

    return components.sort((a, b) => b.avgTime - a.avgTime).slice(0, limit);
  }

  static clearMetrics(): void {
    this.metrics.clear();
  }
}

// Bundle size optimization
export const optimizeBundle = {
  // Preload critical components
  preloadCritical: (components: string[]) => {
    components.forEach((component) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "script";
      link.href = `/static/js/${component}.chunk.js`;
      document.head.appendChild(link);
    });
  },

  // Prefetch non-critical components
  prefetchNonCritical: (components: string[]) => {
    components.forEach((component) => {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = "script";
      link.href = `/static/js/${component}.chunk.js`;
      document.head.appendChild(link);
    });
  },
};

// Network optimization
export const networkOptimizer = {
  // Check if user is on a slow connection
  isSlowConnection: (): boolean => {
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      return (
        connection.effectiveType === "slow-2g" ||
        connection.effectiveType === "2g" ||
        connection.effectiveType === "3g"
      );
    }
    return false;
  },

  // Adjust preloading strategy based on connection
  getPreloadStrategy: () => {
    const isSlow = networkOptimizer.isSlowConnection();
    return {
      preloadHighPriority: !isSlow,
      preloadMediumPriority: !isSlow,
      preloadLowPriority: false,
      delay: isSlow ? 5000 : 2000,
    };
  },
};

// Memory management
export const memoryManager = {
  // Clear unused components from memory
  clearUnusedComponents: () => {
    if ("gc" in window) {
      (window as any).gc();
    }
  },

  // Monitor memory usage
  getMemoryUsage: () => {
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  },
};
