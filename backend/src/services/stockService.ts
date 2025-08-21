import { PrismaClient } from '@prisma/client';

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
