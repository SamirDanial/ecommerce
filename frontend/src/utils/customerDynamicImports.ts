import { lazy, ComponentType } from "react";

// Dynamic import with performance monitoring for customer pages
export const createCustomerDynamicImport = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  componentName: string,
  priority: "critical" | "high" | "medium" | "low" = "medium"
) => {
  const LazyComponent = lazy(() => {
    const startTime = performance.now();

    return importFunc().then((module) => {
      const loadTime = performance.now() - startTime;
      if (process.env.NODE_ENV === "development") {
        console.log(
          `🚀 Customer ${componentName} loaded in ${loadTime.toFixed(
            2
          )}ms (${priority})`
        );
      }
      return module;
    });
  });

  return LazyComponent;
};

// Priority-based dynamic imports for customer pages
export const criticalCustomerImport = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  componentName: string
) => createCustomerDynamicImport(importFunc, componentName, "critical");

export const highPriorityCustomerImport = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  componentName: string
) => createCustomerDynamicImport(importFunc, componentName, "high");

export const mediumPriorityCustomerImport = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  componentName: string
) => createCustomerDynamicImport(importFunc, componentName, "medium");

export const lowPriorityCustomerImport = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  componentName: string
) => createCustomerDynamicImport(importFunc, componentName, "low");
