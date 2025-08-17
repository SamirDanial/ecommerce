import express from 'express';
import { trackingService } from '../services/trackingService';
import { authenticateClerkToken } from '../middleware/clerkAuth';
import { PrismaClient } from '@prisma/client';

const router = express.Router();

// Check if user has admin role
router.get('/check-role', authenticateClerkToken, async (req, res) => {
  try {
    
    if (!req.user || !req.user.email) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const prisma = new PrismaClient();
    
    try {
      // Find user in database by email
      const user = await prisma.user.findUnique({
        where: {
          email: req.user.email
        },
        select: {
          id: true,
          email: true,
          role: true,
          name: true
        }
      });

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found in database' 
        });
      }

      // Check if user has admin role
      const isAdmin = user.role === 'ADMIN';

      res.json({
        success: true,
        isAdmin: isAdmin,
        role: user.role,
        userId: user.id,
        email: user.email
      });
    } finally {
      await prisma.$disconnect();
    }

  } catch (error) {
    console.error('Error checking admin role:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check admin role' 
    });
  }
});

// Get all orders with tracking info (for admin dashboard)
router.get('/orders', authenticateClerkToken, async (req, res) => {
  try {
    // For now, allow any authenticated user to view orders
    // In production, you'd want proper admin middleware here
    
    const prisma = new PrismaClient();
    
    try {
      const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

      res.json({
        success: true,
        orders: orders.map((order: any) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          currentStatus: order.currentStatus,
          status: order.status,
          customerName: order.user?.name || 'Unknown',
          customerEmail: order.user?.email || 'Unknown',
          total: order.total,
          createdAt: order.createdAt,
          lastStatusUpdate: order.lastStatusUpdate,
          itemsCount: order.items.length,
          items: order.items.map((item: any) => ({
            name: item.product?.name || item.productName,
            quantity: item.quantity,
            price: item.price
          }))
        }))
      });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get orders' 
    });
  }
});

// Update order status (admin function)
router.put('/orders/:orderId/status', authenticateClerkToken, async (req, res) => {
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

// Get order tracking info (admin view)
router.get('/orders/:orderId/tracking', authenticateClerkToken, async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    
    const trackingData = await trackingService.getOrderTracking(orderId);
    
    res.json({
      success: true,
      tracking: trackingData
    });
  } catch (error) {
    console.error('Error getting order tracking:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get tracking information' 
    });
  }
});

export default router;
