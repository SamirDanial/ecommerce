import express from 'express';
import { adminOrderService } from '../services/adminOrderService';
import { adminSalesService } from '../services/adminSalesService';
import { AdminAnalyticsService } from '../services/adminAnalyticsService';
import { authenticateClerkToken } from '../middleware/clerkAuth';

/**
 * ADMIN ORDER ROUTES
 * ===================
 * 
 * This file contains ALL admin order-related routes.
 * Mounted at: /api/admin/orders
 * 
 * Routes:
 * - GET    /                     → Get all orders (with pagination & filters)
 * - GET    /:orderId             → Get single order details  
 * - PUT    /:orderId/status      → Update order status
 * - PUT    /:orderId/shipping-company → Update shipping company
 * - PUT    /bulk-status          → Bulk update order statuses
 * - GET    /sales/metrics        → Get sales metrics
 * - GET    /sales/analytics      → Get analytics data
 * - GET    /stats                → Get order statistics
 * 
 * Authentication: All routes require Clerk authentication
 */

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateClerkToken);

// Get all orders with filtering and pagination
router.get('/', async (req, res) => {
  try {
    
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      dateFrom,
      dateTo,
      customerEmail,
      orderNumber,
      minAmount,
      maxAmount
    } = req.query;

    const filters = {
      status: status as any,
      paymentStatus: paymentStatus as any,
      dateFrom: dateFrom ? new Date(dateFrom as string + 'T00:00:00.000Z') : undefined,
      dateTo: dateTo ? new Date(dateTo as string + 'T23:59:59.999Z') : undefined,
      customerEmail: customerEmail as string,
      orderNumber: orderNumber as string,
      minAmount: minAmount ? Number(minAmount) : undefined,
      maxAmount: maxAmount ? Number(maxAmount) : undefined
    };



    const result = await adminOrderService.getOrders(
      filters,
      Number(page),
      Number(limit)
    );

    // Match the format expected by frontend
    res.json({
      success: true,
      orders: result.orders.map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        deliveryStatus: order.deliveryStatus,
        total: Number(order.total),
        currency: order.currency,
        createdAt: order.createdAt,
        totalItems: order.totalItems || 0,
        customerName: order.user?.name || 'Unknown',
        customerEmail: order.user?.email || 'Unknown'
      })),
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// Get single order by ID
router.get('/:orderId', async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const order = await adminOrderService.getOrderById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
});

// Update order status
router.put('/:orderId/status', async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const { newStatus, statusType, notes, trackingNumber, estimatedDelivery, shippingCompany } = req.body;

    if (!newStatus || !statusType) {
      return res.status(400).json({
        success: false,
        message: 'New status and status type are required'
      });
    }

    if (!['order', 'delivery'].includes(statusType)) {
      return res.status(400).json({
        success: false,
        message: 'Status type must be either "order" or "delivery"'
      });
    }

    const updatedOrder = await adminOrderService.updateOrderStatus({
      orderId,
      newStatus,
      statusType,
      notes,
      updatedBy: req.user!.email || 'admin',
      trackingNumber,
      estimatedDelivery,
      shippingCompany
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
});

// Update shipping company
router.put('/:orderId/shipping-company', async (req, res) => {
  try {
    
    const { orderId } = req.params;
    const { shippingCompany } = req.body;

    if (!shippingCompany) {
      return res.status(400).json({
        success: false,
        message: 'Shipping company is required'
      });
    }

    const updatedOrder = await adminOrderService.updateShippingCompany(
      parseInt(orderId),
      shippingCompany
    );

    res.json({
      success: true,
      message: 'Shipping company updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating shipping company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update shipping company'
    });
  }
});

// Bulk update order statuses
router.put('/bulk-status', async (req, res) => {
  try {
    const { orderIds, newStatus, notes } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order IDs array is required'
      });
    }

    if (!newStatus) {
      return res.status(400).json({
        success: false,
        message: 'New status is required'
      });
    }

    const result = await adminOrderService.bulkUpdateOrderStatuses(
      orderIds,
      newStatus,
      notes || '',
      req.user!.email || 'admin'
    );

    res.json({
      success: true,
      message: `Successfully updated ${result.updatedCount} orders`,
      data: result
    });
  } catch (error) {
    console.error('Error bulk updating orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update orders'
    });
  }
});

// Get order statistics
router.get('/stats', async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const stats = await adminOrderService.getOrderStats(
      dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo ? new Date(dateTo as string) : undefined
    );

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics'
    });
  }
});

// ===== SALES ANALYTICS ENDPOINTS =====

// Get overall sales metrics
router.get('/sales/metrics', async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const metrics = await adminSalesService.getSalesMetrics(
      dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo ? new Date(dateTo as string) : undefined
    );

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching sales metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales metrics'
    });
  }
});

// Get sales data by period
router.get('/sales/period', async (req, res) => {
  try {
    const { period = 'daily', dateFrom, dateTo } = req.query;

    if (!['daily', 'weekly', 'monthly'].includes(period as string)) {
      return res.status(400).json({
        success: false,
        message: 'Period must be daily, weekly, or monthly'
      });
    }

    const salesData = await adminSalesService.getSalesByPeriod(
      period as 'daily' | 'weekly' | 'monthly',
      dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo ? new Date(dateTo as string) : undefined
    );

    res.json({
      success: true,
      data: salesData
    });
  } catch (error) {
    console.error('Error fetching sales by period:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales data'
    });
  }
});

// Get top performing products
router.get('/sales/top-products', async (req, res) => {
  try {
    const { limit = 10, dateFrom, dateTo } = req.query;

    const products = await adminSalesService.getTopProducts(
      Number(limit),
      dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo ? new Date(dateTo as string) : undefined
    );

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top products'
    });
  }
});

// Get top customers
router.get('/sales/top-customers', async (req, res) => {
  try {
    const { limit = 10, dateFrom, dateTo } = req.query;

    const customers = await adminSalesService.getTopCustomers(
      Number(limit),
      dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo ? new Date(dateTo as string) : undefined
    );

    res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    console.error('Error fetching top customers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top customers'
    });
  }
});

// Get sales comparison between periods
router.get('/sales/comparison', async (req, res) => {
  try {
    const { currentFrom, currentTo, previousFrom, previousTo } = req.query;

    if (!currentFrom || !currentTo || !previousFrom || !previousTo) {
      return res.status(400).json({
        success: false,
        message: 'All date parameters are required for comparison'
      });
    }

    const comparison = await adminSalesService.getSalesComparison(
      {
        from: new Date(currentFrom as string),
        to: new Date(currentTo as string)
      },
      {
        from: new Date(previousFrom as string),
        to: new Date(previousTo as string)
      }
    );

    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Error fetching sales comparison:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales comparison'
    });
  }
});

// ===== COMPREHENSIVE ANALYTICS ENDPOINT =====

// Get comprehensive analytics data
router.get('/analytics', async (req, res) => {
  try {
    const { period = 'monthly', dateFrom, dateTo } = req.query;

    if (!['daily', 'weekly', 'monthly', 'quarterly', 'semi-annually', 'yearly', 'custom'].includes(period as string)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid period parameter'
      });
    }

    const analytics = await AdminAnalyticsService.getAnalytics(
      period as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semi-annually' | 'yearly' | 'custom',
      dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo ? new Date(dateTo as string) : undefined
    );

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data'
    });
  }
});

export default router;
