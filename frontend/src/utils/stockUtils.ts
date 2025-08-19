import { ProductVariant } from '../types';

export interface StockStatus {
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'BACKORDER';
  message: string;
  color: string;
  canPurchase: boolean;
}

export interface VariantStockInfo {
  variantId: number;
  size: string;
  color: string;
  stock: number;
  status: StockStatus;
}

/**
 * Get stock status for a given stock level
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
        canPurchase: true
      };
    }
    return {
      status: 'OUT_OF_STOCK',
      message: 'Out of Stock',
      color: 'text-red-600',
      canPurchase: false
    };
  }
  
  if (stock <= lowStockThreshold) {
    return {
      status: 'LOW_STOCK',
      message: `Only ${stock} left`,
      color: 'text-yellow-600',
      canPurchase: true
    };
  }
  
  return {
    status: 'IN_STOCK',
    message: `${stock} in stock`,
    color: 'text-green-600',
    canPurchase: true
  };
};

/**
 * Get overall product stock status based on all variants
 */
export const getProductStockStatus = (variants: ProductVariant[]): StockStatus => {
  if (!variants || variants.length === 0) {
    return {
      status: 'OUT_OF_STOCK',
      message: 'No variants available',
      color: 'text-red-600',
      canPurchase: false
    };
  }

  const totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);
  const hasActiveVariants = variants.some(variant => variant.isActive && variant.stock > 0);

  if (totalStock <= 0 || !hasActiveVariants) {
    return {
      status: 'OUT_OF_STOCK',
      message: 'Out of Stock',
      color: 'text-red-600',
      canPurchase: false
    };
  }

  if (totalStock <= 10) {
    return {
      status: 'LOW_STOCK',
      message: `Low Stock - ${totalStock} total`,
      color: 'text-yellow-600',
      canPurchase: true
    };
  }

  return {
    status: 'IN_STOCK',
    message: `${totalStock} total in stock`,
    color: 'text-green-600',
    canPurchase: true
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
