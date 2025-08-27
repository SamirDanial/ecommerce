import { PrismaClient } from '@prisma/client';
import { notificationService } from './notificationService';

const prisma = new PrismaClient();

export interface StockDeductionItem {
  productId: number;
  variantId?: number;
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
  color?: string;
  quantity: number;
}

export interface StockDeductionResult {
  success: boolean;
  deductedItems: Array<{
    productId: number;
    variantId?: number;
    size?: string;
    color?: string;
    originalStock: number;
    newStock: number;
    quantity: number;
  }>;
  errors: string[];
}

/**
 * Deduct stock for order items
 * This function handles both variant-based and product-based stock deduction
 */
export const deductStockForOrder = async (items: StockDeductionItem[]): Promise<StockDeductionResult> => {
  const result: StockDeductionResult = {
    success: true,
    deductedItems: [],
    errors: []
  };

  try {
    for (const item of items) {
      try {
        if (item.variantId) {
          // Deduct from specific variant
          await deductStockFromVariant(item.variantId, item.quantity, result);
        } else if (item.size && item.color) {
          // Deduct from variant by size and color
          await deductStockFromVariantByAttributes(item.productId, item.size, item.color, item.quantity, result);
        } else {
          // Cannot deduct stock without variant information
          const errorMsg = `Cannot deduct stock for product ${item.productId}: Missing variant information (size/color or variantId)`;
          result.errors.push(errorMsg);
          result.success = false;
        }
      } catch (error) {
        const errorMsg = `Failed to deduct stock for product ${item.productId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        result.errors.push(errorMsg);
        result.success = false;
        console.error(errorMsg, error);
      }
    }

    return result;
  } catch (error) {
    console.error('Error in stock deduction process:', error);
    result.success = false;
    result.errors.push(`Stock deduction process failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
};

/**
 * Deduct stock from a specific variant by ID
 */
const deductStockFromVariant = async (
  variantId: number, 
  quantity: number, 
  result: StockDeductionResult
): Promise<void> => {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { id: true, stock: true, productId: true, size: true, color: true, allowBackorder: true }
  });

  if (!variant) {
    throw new Error(`Variant ${variantId} not found`);
  }

  if (variant.stock < quantity && !variant.allowBackorder) {
    throw new Error(`Insufficient stock for variant ${variantId}. Available: ${variant.stock}, Requested: ${quantity}`);
  }

  const originalStock = variant.stock;
  const newStock = Math.max(0, variant.stock - quantity);

  await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock: newStock }
  });

  result.deductedItems.push({
    productId: variant.productId,
    variantId: variant.id,
    size: variant.size,
    color: variant.color,
    originalStock,
    newStock,
    quantity
  });

  console.log(`Stock deducted for variant ${variantId}: ${originalStock} → ${newStock} (deducted: ${quantity})`);
  
  // Check for low stock after deduction
  await checkAndNotifyLowStock(variantId, newStock);
};

/**
 * Deduct stock from variant by product ID, size, and color
 */
const deductStockFromVariantByAttributes = async (
  productId: number,
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL',
  color: string,
  quantity: number,
  result: StockDeductionResult
): Promise<void> => {
  const variant = await prisma.productVariant.findFirst({
    where: {
      productId,
      size,
      color
    },
    select: { id: true, stock: true, productId: true, size: true, color: true, allowBackorder: true }
  });

  if (!variant) {
    throw new Error(`Variant not found for product ${productId}, size ${size}, color ${color}`);
  }

  if (variant.stock < quantity && !variant.allowBackorder) {
    throw new Error(`Insufficient stock for variant. Available: ${variant.stock}, Requested: ${quantity}`);
  }

  const originalStock = variant.stock;
  const newStock = Math.max(0, variant.stock - quantity);

  await prisma.productVariant.update({
    where: { id: variant.id },
    data: { stock: newStock }
  });

  result.deductedItems.push({
    productId: variant.productId,
    variantId: variant.id,
    size: variant.size,
    color: variant.color,
    originalStock,
    newStock,
    quantity
  });

  console.log(`Stock deducted for variant ${variant.id}: ${originalStock} → ${newStock} (deducted: ${quantity})`);
  
  // Check for low stock after deduction
  await checkAndNotifyLowStock(variant.id, newStock);
};



/**
 * Get current stock levels for a product variant
 */
export const getVariantStock = async (variantId: number): Promise<number> => {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { stock: true }
  });

  return variant?.stock || 0;
};

/**
 * Get current stock levels for a product variant by attributes
 */
export const getVariantStockByAttributes = async (
  productId: number,
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL',
  color: string
): Promise<number> => {
  const variant = await prisma.productVariant.findFirst({
    where: {
      productId,
      size,
      color
    },
    select: { stock: true }
  });

  return variant?.stock || 0;
};

/**
 * Check if a variant has sufficient stock
 */
export const hasSufficientStock = async (
  productId: number,
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL',
  color: string,
  quantity: number
): Promise<boolean> => {
  const variant = await prisma.productVariant.findFirst({
    where: {
      productId,
      size,
      color
    },
    select: { stock: true, allowBackorder: true }
  });

  if (!variant) return false;
  if (variant.allowBackorder) return true;
  return variant.stock >= quantity;
};

/**
 * Check if stock is low and create notification if needed
 */
const checkAndNotifyLowStock = async (variantId: number, currentStock: number): Promise<void> => {
  try {
    // Get variant details including low stock threshold
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: {
        id: true,
        stock: true,
        lowStockThreshold: true,
        size: true,
        color: true,
        product: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    if (!variant) {
      console.error(`Variant ${variantId} not found for low stock check`);
      return;
    }

    // Check if current stock is at or below the low stock threshold
    if (currentStock <= variant.lowStockThreshold) {
      console.log(`🚨 Low stock alert for variant ${variantId}: ${currentStock} <= ${variant.lowStockThreshold}`);
      
      // Create low stock notification
      await notificationService.createNotification({
        type: 'LOW_STOCK_ALERT',
        title: 'Low Stock Alert',
        message: `Product "${variant.product.name}" (${variant.size}, ${variant.color}) is running low on stock. Current stock: ${currentStock}, Threshold: ${variant.lowStockThreshold}`,
        category: 'INVENTORY',
        priority: currentStock === 0 ? 'URGENT' : 'HIGH',
        targetType: 'PRODUCT',
        targetId: variant.product.id,
        isGlobal: true,
        data: {
          variantId: variant.id,
          productId: variant.product.id,
          productName: variant.product.name,
          productSlug: variant.product.slug,
          size: variant.size,
          color: variant.color,
          currentStock,
          lowStockThreshold: variant.lowStockThreshold,
          isOutOfStock: currentStock === 0
        }
      });

      // Send real-time notification to admins via socket
      try {
        const globalSocketServer = (global as any).socketServer;
        if (globalSocketServer) {
          await globalSocketServer.sendAdminNotification({
            type: 'LOW_STOCK_ALERT',
            title: 'Low Stock Alert',
            message: `Product "${variant.product.name}" (${variant.size}, ${variant.color}) is running low on stock. Current stock: ${currentStock}`,
            category: 'INVENTORY',
            priority: currentStock === 0 ? 'URGENT' : 'HIGH',
            targetType: 'PRODUCT',
            targetId: variant.product.id,
            isGlobal: true,
            data: {
              variantId: variant.id,
              productId: variant.product.id,
              productName: variant.product.name,
              productSlug: variant.product.slug,
              size: variant.size,
              color: variant.color,
              currentStock,
              lowStockThreshold: variant.lowStockThreshold,
              isOutOfStock: currentStock === 0
            }
          });
          console.log('📡 Low stock real-time notification sent to admins');
        }
      } catch (socketError) {
        console.error('❌ Error sending low stock real-time notification:', socketError);
      }
    }
  } catch (error) {
    console.error('Error checking low stock:', error);
    // Don't throw error to avoid breaking the order process
  }
};
