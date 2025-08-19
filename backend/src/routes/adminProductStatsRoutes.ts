import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticateClerkToken } from '../middleware/clerkAuth';

const router = express.Router();

// Helper function to convert Decimal to number
const convertDecimalToNumber = (obj: any): any => {
  if (obj && typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map((item: any) => convertDecimalToNumber(item));
    }
    
    const converted = { ...obj };
    for (const key in converted) {
      if (converted[key] && typeof converted[key] === 'object') {
        if (converted[key].constructor.name === 'Decimal') {
          converted[key] = Number(converted[key]);
        } else if ((converted[key] as any).d) {
          converted[key] = Number(converted[key]);
        } else if (converted[key] instanceof Date) {
          converted[key] = converted[key].toISOString();
        } else if (converted[key] && typeof converted[key] === 'object') {
          converted[key] = convertDecimalToNumber(converted[key]);
        }
      }
    }
    return converted;
  }
  return obj;
};

// Get product statistics
router.get('/', authenticateClerkToken, async (req, res) => {
  try {
    const productId = parseInt(req.params.id || req.body.productId);

    const [product, variants, images, reviews, orderItems, wishlistItems] = await Promise.all([
      prisma.product.findUnique({
        where: { id: productId },
        select: { 
          name: true, 
          price: true, 
          isActive: true,
          isFeatured: true,
          isOnSale: true
        }
      }),
      prisma.productVariant.findMany({
        where: { productId: productId },
        select: { stock: true, isActive: true }
      }),
      prisma.productImage.count({
        where: { productId: productId }
      }),
      prisma.review.count({
        where: { 
          productId: productId,
          status: 'APPROVED',
          isActive: true
        }
      }),
      prisma.orderItem.count({
        where: { productId: productId }
      }),
      prisma.wishlistItem.count({
        where: { productId: productId }
      })
    ]);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
    const activeVariants = variants.filter(v => v.isActive).length;
    const lowStockVariants = variants.filter(v => v.stock <= 10 && v.stock > 0).length;
    const outOfStockVariants = variants.filter(v => v.stock === 0).length;

    const stats = {
      product: convertDecimalToNumber(product),
      inventory: {
        totalStock,
        activeVariants,
        lowStockVariants,
        outOfStockVariants,
        totalVariants: variants.length
      },
      engagement: {
        totalImages: images,
        totalReviews: reviews,
        totalOrders: orderItems,
        totalWishlists: wishlistItems
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching product stats:', error);
    res.status(500).json({ message: 'Failed to fetch product stats', error: error });
  }
});

export default router;
