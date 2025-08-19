import express, { Request } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateClerkToken } from '../middleware/clerkAuth';

// Extend Express Request interface to include productId
declare global {
  namespace Express {
    interface Request {
      productId?: number;
    }
  }
}

const router = express.Router();

// Single route to handle all variant operations (create, update, delete)
router.put('/', authenticateClerkToken, async (req, res) => {
  try {
    const productId = req.productId;
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const { variants } = req.body;
    
    if (!variants || !Array.isArray(variants)) {
      return res.status(400).json({ error: 'Variants array is required' });
    }

    // Validate product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const results = [];
    const errors = [];

    // Process each variant operation
    for (const variant of variants) {
      try {
        if (variant.action === 'create') {
          // Create new variant
          const { action, ...variantData } = variant;
          const newVariant = await prisma.productVariant.create({
            data: {
              productId,
              size: variantData.size,
              color: variantData.color,
              colorCode: variantData.colorCode,
              stock: variantData.stock || 0,
              sku: variantData.sku,
              price: variantData.price ? parseFloat(variantData.price) : null,
              comparePrice: variantData.comparePrice ? parseFloat(variantData.comparePrice) : null,
              isActive: variantData.isActive !== false
            }
          });
          results.push({ action: 'created', variant: newVariant });
        } 
        else if (variant.action === 'update') {
          // Update existing variant
          const { action, id, ...variantData } = variant;
          if (!id) {
            errors.push({ action: 'update', error: 'Variant ID is required for updates' });
            continue;
          }
          
          const updatedVariant = await prisma.productVariant.update({
            where: { id: parseInt(id) },
            data: {
              size: variantData.size,
              color: variantData.color,
              colorCode: variantData.colorCode,
              stock: variantData.stock,
              sku: variantData.sku,
              price: variantData.price ? parseFloat(variantData.price) : null,
              comparePrice: variantData.comparePrice ? parseFloat(variantData.comparePrice) : null,
              isActive: variantData.isActive
            }
          });
          results.push({ action: 'updated', variant: updatedVariant });
        } 
        else if (variant.action === 'delete') {
          // Delete variant
          const { action, id } = variant;
          if (!id) {
            errors.push({ action: 'delete', error: 'Variant ID is required for deletions' });
            continue;
          }

          await prisma.productVariant.delete({
            where: { id: parseInt(id) }
          });
          results.push({ action: 'deleted', variantId: id });
        }
        else {
          errors.push({ action: variant.action, error: 'Invalid action. Must be create, update, or delete' });
        }
      } catch (variantError) {
        console.error(`Error processing variant ${variant.action}:`, variantError);
        errors.push({ 
          action: variant.action, 
          error: variantError instanceof Error ? variantError.message : 'Unknown error',
          variant: variant
        });
      }
    }

    // Return results and any errors
    if (errors.length > 0) {
      return res.status(207).json({ // 207 Multi-Status
        message: 'Variants processed with some errors',
        results,
        errors,
        successCount: results.length,
        errorCount: errors.length
      });
    }

    res.json({
      message: 'All variants processed successfully',
      results,
      successCount: results.length
    });

  } catch (error) {
    console.error('Error processing variants:', error);
    res.status(500).json({ message: 'Failed to process variants', error: error });
  }
});

// Get variants for a product
router.get('/', authenticateClerkToken, async (req, res) => {
  try {
    const productId = req.productId;
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const variants = await prisma.productVariant.findMany({
      where: { productId },
      orderBy: [
        { color: 'asc' },
        { size: 'asc' }
      ]
    });

    res.json(variants);
  } catch (error) {
    console.error('Error fetching variants:', error);
    res.status(500).json({ message: 'Failed to fetch variants', error: error });
  }
});

export default router;
