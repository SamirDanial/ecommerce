import express from 'express';
import { prisma } from '../lib/prisma';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

// Get categories for export (with optional products)
router.get('/export', async (req, res) => {
  try {
    const { includeProducts } = req.query;
    const shouldIncludeProducts = includeProducts === 'true';

    if (shouldIncludeProducts) {
      // Fetch categories with products for comprehensive export
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        include: {
          products: {
            where: { isActive: true },
            include: {
              variants: {
                select: {
                  id: true,
                  size: true,
                  color: true,
                  colorCode: true,
                  stock: true,
                  isActive: true,
                  lowStockThreshold: true,
                  allowBackorder: true,
                  stockStatus: true,
                  price: true,
                  comparePrice: true,
                  sku: true
                }
              },
              images: {
                select: {
                  id: true,
                  url: true,
                  alt: true,
                  isPrimary: true,
                  sortOrder: true
                },
                orderBy: [
                  { isPrimary: 'desc' },
                  { sortOrder: 'asc' }
                ]
              },
              _count: {
                select: {
                  variants: true,
                  images: true,
                  reviews: true,
                  orderItems: true
                }
              }
            }
          },
          _count: {
            select: {
              products: true
            }
          }
        },
        orderBy: { sortOrder: 'asc' }
      });

      // Transform the data for export
      const transformedCategories = categories.map(category => ({
        ...category,
        products: category.products.map((product: any) => ({
          ...product,
          // Convert Decimal to number for JSON serialization
          price: Number(product.price),
          comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
          costPrice: product.costPrice ? Number(product.costPrice) : null,
          variants: product.variants.map((variant: any) => ({
            ...variant,
            price: Number(variant.price),
            comparePrice: variant.comparePrice ? Number(variant.comparePrice) : null
          }))
        }))
      }));

      res.json({
        success: true,
        categories: transformedCategories,
        totalCategories: transformedCategories.length,
        includesProducts: true
      });
    } else {
      // Fetch categories without products for basic export
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: {
              products: true
            }
          }
        },
        orderBy: { sortOrder: 'asc' }
      });

      // Transform the data for export
      const transformedCategories = categories.map(category => ({
        ...category,
        // Convert Decimal to number for JSON serialization
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString()
      }));

      res.json({
        success: true,
        categories: transformedCategories,
        totalCategories: transformedCategories.length,
        includesProducts: false
      });
    }
  } catch (error) {
    console.error('Error fetching categories for export:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch categories for export', 
      error: errorMessage 
    });
  }
});

// Get category by slug
router.get('/:slug', async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug },
      include: {
        products: {
          where: { isActive: true },
          include: {
            variants: true,
            images: true,
            reviews: {
              where: {
                status: 'APPROVED',
                isActive: true
              }
            },
            _count: {
              select: { 
                reviews: {
                  where: {
                    status: 'APPROVED',
                    isActive: true
                  }
                }
              }
            }
          }
        }
      }
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Calculate average ratings for products
    const productsWithRatings = category.products.map((product: any) => {
      const avgRating = product.reviews && product.reviews.length > 0 
        ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length 
        : 0;
      
      return {
        ...product,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: product._count?.reviews || 0
      };
    });
    
    res.json({
      ...category,
      products: productsWithRatings
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

// Create category
router.post('/', async (req, res) => {
  try {
    const category = await prisma.category.create({
      data: req.body
    });
    res.status(201).json(category);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

// Update category
router.put('/:id', async (req, res) => {
  try {
    const category = await prisma.category.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    res.json(category);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return res.status(404).json({ message: 'Category not found' });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    await prisma.category.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return res.status(404).json({ message: 'Category not found' });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

export default router;


