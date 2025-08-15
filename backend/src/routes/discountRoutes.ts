import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateClerkToken } from '../middleware/clerkAuth';

const router = express.Router();
const prisma = new PrismaClient();

// Validate discount code
router.post('/validate', authenticateClerkToken, async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ 
        isValid: false, 
        message: 'User not authenticated' 
      });
    }

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ 
        isValid: false, 
        message: 'Discount code is required' 
      });
    }

    if (typeof subtotal !== 'number' || subtotal < 0) {
      return res.status(400).json({ 
        isValid: false, 
        message: 'Valid subtotal is required' 
      });
    }

    // Find the discount code
    const discount = await prisma.discountCode.findFirst({
      where: {
        code: code.trim().toUpperCase(),
        isActive: true,
        startsAt: {
          lte: new Date()
        },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });

    if (!discount) {
      return res.status(404).json({ 
        isValid: false, 
        message: 'Discount code not found or expired' 
      });
    }

    // Check if minimum amount requirement is met
    if (discount.minAmount && subtotal < Number(discount.minAmount)) {
      return res.status(400).json({ 
        isValid: false, 
        message: `Minimum order amount of $${discount.minAmount} required` 
      });
    }

    // Check usage limit
    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
      return res.status(400).json({ 
        isValid: false, 
        message: 'Discount code usage limit reached' 
      });
    }

    // For now, skip user usage check since we don't have discountUsage table
    // TODO: Implement discount usage tracking when table is created

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.type === 'PERCENTAGE') {
      discountAmount = subtotal * (Number(discount.value) / 100);
    } else {
      discountAmount = Number(discount.value);
    }

    // Apply max discount limit if specified
    if (discount.maxDiscount) {
      discountAmount = Math.min(discountAmount, Number(discount.maxDiscount));
    }

    // Return validation success with discount details
    res.json({
      isValid: true,
      discount: {
        id: discount.id,
        code: discount.code,
        type: discount.type,
        value: Number(discount.value),
        minAmount: discount.minAmount ? Number(discount.minAmount) : undefined,
        maxDiscount: discount.maxDiscount ? Number(discount.maxDiscount) : undefined,
        usageLimit: discount.usageLimit,
        usedCount: discount.usedCount,
        isActive: discount.isActive,
        startsAt: discount.startsAt,
        expiresAt: discount.expiresAt,
        createdAt: discount.createdAt,
        updatedAt: discount.updatedAt
      },
      discountAmount,
      message: 'Discount code applied successfully'
    });

  } catch (error) {
    console.error('Error validating discount code:', error);
    res.status(500).json({ 
      isValid: false, 
      message: 'Internal server error' 
    });
  }
});

// Get discount code details
router.get('/:code', authenticateClerkToken, async (req, res) => {
  try {
    const { code } = req.params;

    const discount = await prisma.discountCode.findFirst({
      where: {
        code: code.trim().toUpperCase(),
        isActive: true
      }
    });

    if (!discount) {
      return res.status(404).json({ message: 'Discount code not found' });
    }

    res.json(discount);
  } catch (error) {
    console.error('Error getting discount code:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
