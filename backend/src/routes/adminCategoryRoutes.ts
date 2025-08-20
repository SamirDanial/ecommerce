import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticateClerkToken } from '../middleware/clerkAuth';

const router = express.Router();

// Export categories with optional products
router.post('/export', authenticateClerkToken, async (req, res) => {
  try {
    const { categoryIds, includeProducts } = req.body;
    
    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'categoryIds array is required and must not be empty' 
      });
    }

    if (includeProducts) {
      // Fetch categories with products
      const categories = await prisma.category.findMany({
        where: { 
          id: { in: categoryIds },
          isActive: true 
        },
        include: {
          products: {
            where: { isActive: true },
            include: {
              variants: true,
              images: true,
              _count: {
                select: {
                  variants: true,
                  images: true,
                  reviews: true
                }
              }
            }
          },
          _count: {
            select: { products: true }
          }
        }
      });

      res.json({
        success: true,
        categories,
        totalCategories: categories.length,
        includesProducts: true
      });
    } else {
      // Fetch categories without products
      const categories = await prisma.category.findMany({
        where: { 
          id: { in: categoryIds },
          isActive: true 
        },
        include: {
          _count: {
            select: { products: true }
          }
        }
      });

      res.json({
        success: true,
        categories,
        totalCategories: categories.length,
        includesProducts: false
      });
    }
  } catch (error) {
    console.error('Error exporting categories:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to export categories' 
    });
  }
});

export default router;
