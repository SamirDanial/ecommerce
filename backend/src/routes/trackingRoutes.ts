import express from 'express';
import { trackingService } from '../services/trackingService';
import { authenticateClerkToken } from '../middleware/clerkAuth';
import { prisma } from '../lib/prisma';

const router = express.Router();

// Get order tracking information (customer view)
router.get('/order/:orderId', authenticateClerkToken, async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const userId = req.user!.id;

    // Verify the order belongs to the authenticated user
    const order = await trackingService.getOrderTracking(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify the order belongs to the authenticated user by checking the profile orders
    const userOrder = await prisma.order.findFirst({
      where: { 
        id: orderId,
        userId: userId 
      },
      select: { id: true }
    });
    
    if (!userOrder) {
      return res.status(404).json({ message: 'Order not found or access denied' });
    }

    res.json({
      success: true,
      tracking: order
    });
  } catch (error) {
    console.error('Error getting order tracking:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get tracking information' 
    });
  }
});

// Update order status (admin only - for now, we'll add admin middleware later)
router.put('/order/:orderId/status', authenticateClerkToken, async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const { newStatus, notes } = req.body;

    if (!newStatus) {
      return res.status(400).json({ 
        success: false, 
        message: 'New status is required' 
      });
    }

    // For now, allow any authenticated user to update status
    // In production, you'd want admin middleware here
    const updatedOrder = await trackingService.updateOrderStatus({
      orderId,
      newStatus,
      notes,
      updatedBy: req.user!.email || 'admin'
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update order status' 
    });
  }
});

// Get all orders with tracking info for a user
router.get('/orders', authenticateClerkToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // This would typically use the existing profile routes
    // For now, we'll return a simple response
    res.json({
      success: true,
      message: 'Use /profile/orders for order list with tracking info'
    });
  } catch (error) {
    console.error('Error getting user orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get orders' 
    });
  }
});

export default router;

