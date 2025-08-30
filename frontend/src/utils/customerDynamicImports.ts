import { lazy, ComponentType } from "react";

// Simple dynamic import for customer pages
export const createCustomerDynamicImport = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => {
  return lazy(importFunc);
};

// Priority-based dynamic imports for customer pages (simplified)
export const criticalCustomerImport = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => createCustomerDynamicImport(importFunc);

export const highPriorityCustomerImport = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => createCustomerDynamicImport(importFunc);

export const mediumPriorityCustomerImport = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => createCustomerDynamicImport(importFunc);

export const lowPriorityCustomerImport = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => createCustomerDynamicImport(importFunc);
