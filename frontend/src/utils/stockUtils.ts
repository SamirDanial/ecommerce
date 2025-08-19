import { Product, ProductVariant } from '../types';

export interface StockStatus {
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'BACKORDER';
  message: string;
  color: string;
  canPurchase: boolean;
  severity: 'success' | 'warning' | 'error' | 'info';
}

export interface VariantStockInfo {
  variantId: number;
  size: string;
  color: string;
  stock: number;
  status: StockStatus;
  threshold: number;
}

export interface ProductStockInfo {
  productId: number;
  totalStock: number;
  overallStatus: StockStatus;
  variantStatuses: VariantStockInfo[];
  lowStockVariants: number;
  outOfStockVariants: number;
}

/**
 * Get stock status for a given stock level with custom threshold
 */
export const getStockStatus = (
  stock: number, 
  lowStockThreshold: number = 5,
  allowBackorder: boolean = false
): StockStatus => {
  if (stock <= 0) {
    if (allowBackorder) {
      return {
        status: 'BACKORDER',
        message: 'Backorder Available',
        color: 'text-orange-600',
        canPurchase: true,
        severity: 'info'
      };
    }
    return {
      status: 'OUT_OF_STOCK',
      message: 'Out of Stock',
      color: 'text-red-600',
      canPurchase: false,
      severity: 'error'
    };
  }
  
  if (stock <= lowStockThreshold) {
    return {
      status: 'LOW_STOCK',
      message: `Only ${stock} left`,
      color: 'text-yellow-600',
      canPurchase: true,
      severity: 'warning'
    };
  }
  
  return {
    status: 'IN_STOCK',
    message: `${stock} in stock`,
    color: 'text-green-600',
    canPurchase: true,
    severity: 'success'
  };
};

/**
 * Get stock status for a specific variant with its own threshold
 */
export const getVariantStockStatus = (variant: ProductVariant): StockStatus => {
  const threshold = variant.lowStockThreshold || 3; // Default to 3 if not set
  const allowBackorder = variant.allowBackorder || false;
  
  return getStockStatus(variant.stock, threshold, allowBackorder);
};

/**
 * Get overall product stock status based on all variants with product-level threshold
 */
export const getProductStockStatus = (
  product: Product,
  variants: ProductVariant[] = []
): ProductStockInfo => {
  if (!variants || variants.length === 0) {
    return {
      productId: product.id,
      totalStock: 0,
      overallStatus: {
        status: 'OUT_OF_STOCK',
        message: 'No variants available',
        color: 'text-red-600',
        canPurchase: false,
        severity: 'error'
      },
      variantStatuses: [],
      lowStockVariants: 0,
      outOfStockVariants: 0
    };
  }

  const productThreshold = product.lowStockThreshold || 5; // Default to 5 if not set
  const productAllowBackorder = product.allowBackorder || false;
  
  // Calculate variant statuses
  const variantStatuses: VariantStockInfo[] = variants.map(variant => ({
    variantId: variant.id,
    size: variant.size,
    color: variant.color,
    stock: variant.stock,
    status: getVariantStockStatus(variant),
    threshold: variant.lowStockThreshold || 3
  }));

  // Calculate totals
  const totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);
  const activeVariants = variants.filter(v => v.isActive);
  const hasActiveVariants = activeVariants.length > 0;
  
  // Count variants by status
  const lowStockVariants = variantStatuses.filter(v => v.status.status === 'LOW_STOCK').length;
  const outOfStockVariants = variantStatuses.filter(v => v.status.status === 'OUT_OF_STOCK').length;

  // Determine overall product status
  let overallStatus: StockStatus;
  
  if (totalStock <= 0 || !hasActiveVariants) {
    if (productAllowBackorder) {
      overallStatus = {
        status: 'BACKORDER',
        message: 'Backorder Available',
        color: 'text-orange-600',
        canPurchase: true,
        severity: 'info'
      };
    } else {
      overallStatus = {
        status: 'OUT_OF_STOCK',
        message: 'Out of Stock',
        color: 'text-red-600',
        canPurchase: false,
        severity: 'error'
      };
    }
  } else if (totalStock <= productThreshold) {
    overallStatus = {
      status: 'LOW_STOCK',
      message: `Low Stock - ${totalStock} total`,
      color: 'text-yellow-600',
      canPurchase: true,
      severity: 'warning'
    };
  } else {
    overallStatus = {
      status: 'IN_STOCK',
      message: `${totalStock} total in stock`,
      color: 'text-green-600',
      canPurchase: true,
      severity: 'success'
    };
  }

  return {
    productId: product.id,
    totalStock,
    overallStatus,
    variantStatuses,
    lowStockVariants,
    outOfStockVariants
  };
};

/**
 * Check if a product can be purchased
 */
export const canPurchaseProduct = (variants: ProductVariant[]): boolean => {
  return variants.some(variant => variant.isActive && variant.stock > 0);
};

/**
 * Get available stock for a specific variant
 */
export const getVariantStock = (variantId: number, variants: ProductVariant[]): number => {
  const variant = variants.find(v => v.id === variantId);
  return variant ? variant.stock : 0;
};

/**
 * Format stock message for display
 */
export const formatStockMessage = (stock: number, lowStockThreshold: number = 5): string => {
  if (stock <= 0) return 'Out of Stock';
  if (stock <= lowStockThreshold) return `Only ${stock} left!`;
  if (stock <= 20) return `${stock} in stock`;
  return 'In Stock';
};

/**
 * Get stock status badge variant for UI components
 */
export const getStockStatusBadgeVariant = (status: StockStatus['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'IN_STOCK':
      return 'default';
    case 'LOW_STOCK':
      return 'secondary';
    case 'OUT_OF_STOCK':
      return 'destructive';
    case 'BACKORDER':
      return 'outline';
    default:
      return 'default';
  }
};

/**
 * Get stock status color for CSS classes
 */
export const getStockStatusColor = (status: StockStatus['status']): string => {
  switch (status) {
    case 'IN_STOCK':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'LOW_STOCK':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'OUT_OF_STOCK':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'BACKORDER':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

/**
 * Check if a variant needs restocking (below threshold)
 */
export const needsRestocking = (variant: ProductVariant): boolean => {
  const threshold = variant.lowStockThreshold || 3;
  return variant.stock <= threshold;
};

/**
 * Get stock urgency level for notifications
 */
export const getStockUrgency = (stock: number, threshold: number): 'none' | 'low' | 'medium' | 'high' => {
  if (stock === 0) return 'high';
  if (stock <= threshold * 0.5) return 'high';
  if (stock <= threshold) return 'medium';
  if (stock <= threshold * 1.5) return 'low';
  return 'none';
};
