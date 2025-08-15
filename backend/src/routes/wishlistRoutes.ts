import express from 'express';
import { authenticateClerkToken } from '../middleware/clerkAuth';
import { prisma } from '../lib/prisma';

const router = express.Router();

// Test endpoint (no auth required)
router.get('/test', (req, res) => {
  res.json({ message: 'Wishlist test endpoint working', timestamp: new Date().toISOString() });
});

// Get user's wishlist
router.get('/', authenticateClerkToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: true,
            category: true,
            reviews: {
              where: {
                status: 'APPROVED',
                isActive: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ data: wishlistItems });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// Add item to wishlist
router.post('/', authenticateClerkToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if item already exists in wishlist
    const existingItem = await prisma.wishlistItem.findFirst({
      where: { userId, productId }
    });

    if (existingItem) {
      return res.status(400).json({ error: 'Item already in wishlist' });
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId,
        productId
      },
      include: {
        product: {
          include: {
            images: true,
            category: true,
            reviews: {
              where: {
                status: 'APPROVED',
                isActive: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({ data: wishlistItem });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ error: 'Failed to add item to wishlist' });
  }
});

// Remove item from wishlist
router.delete('/:productId', authenticateClerkToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const deletedItem = await prisma.wishlistItem.deleteMany({
      where: { userId, productId: parseInt(productId) }
    });

    if (deletedItem.count === 0) {
      return res.status(404).json({ error: 'Wishlist item not found' });
    }

    res.json({ message: 'Item removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ error: 'Failed to remove item from wishlist' });
  }
});

// Clear entire wishlist
router.delete('/', authenticateClerkToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    await prisma.wishlistItem.deleteMany({
      where: { userId }
    });

    res.json({ message: 'Wishlist cleared' });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({ error: 'Failed to clear wishlist' });
  }
});

// Check if product is in wishlist
router.get('/check/:productId', authenticateClerkToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const wishlistItem = await prisma.wishlistItem.findFirst({
      where: { userId, productId: parseInt(productId) }
    });

    res.json({ isInWishlist: !!wishlistItem });
  } catch (error) {
    console.error('Error checking wishlist status:', error);
    res.status(500).json({ error: 'Failed to check wishlist status' });
  }
});

export default router;
