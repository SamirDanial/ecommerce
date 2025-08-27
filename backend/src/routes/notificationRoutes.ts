import express from 'express';
import { authenticateClerkToken } from '../middleware/clerkAuth';
import { notificationService } from '../services/notificationService';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const createNotificationSchema = z.object({
  type: z.enum([
    'ORDER_PLACED', 'ORDER_STATUS_CHANGED', 'PAYMENT_RECEIVED', 'PAYMENT_FAILED',
    'SHIPPING_UPDATE', 'ORDER_CANCELLED', 'REFUND_REQUESTED', 'PRODUCT_REVIEW',
    'PRODUCT_QUESTION', 'REVIEW_REPLY', 'LOW_STOCK_ALERT', 'NEW_USER_REGISTRATION',
    'CONTACT_FORM_SUBMISSION', 'SUPPORT_TICKET', 'SYSTEM_ALERT', 'SECURITY_ALERT',
    'INVENTORY_UPDATE', 'PRICE_CHANGE', 'DISCOUNT_EXPIRING', 'CUSTOMER_FEEDBACK',
    'EXPORT_COMPLETED', 'IMPORT_COMPLETED', 'BACKUP_COMPLETED', 'MAINTENANCE_SCHEDULED'
  ]),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message too long'),
  category: z.enum([
    'ORDERS', 'PRODUCTS', 'CUSTOMERS', 'INVENTORY', 'FINANCIAL',
    'SYSTEM', 'SECURITY', 'MARKETING', 'SUPPORT', 'GENERAL'
  ]),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL']).optional(),
  targetType: z.enum(['ORDER', 'PRODUCT', 'USER', 'CATEGORY', 'INVENTORY', 'SYSTEM', 'GENERAL']).optional(),
  targetId: z.number().optional(),
  recipientId: z.number().optional(),
  isGlobal: z.boolean().optional(),
  data: z.any().optional(),
  expiresAt: z.string().optional()
});

const notificationFiltersSchema = z.object({
  category: z.enum([
    'ORDERS', 'PRODUCTS', 'CUSTOMERS', 'INVENTORY', 'FINANCIAL',
    'SYSTEM', 'SECURITY', 'MARKETING', 'SUPPORT', 'GENERAL'
  ]).optional(),
  type: z.enum([
    'ORDER_PLACED', 'ORDER_STATUS_CHANGED', 'PAYMENT_RECEIVED', 'PAYMENT_FAILED',
    'SHIPPING_UPDATE', 'ORDER_CANCELLED', 'REFUND_REQUESTED', 'PRODUCT_REVIEW',
    'PRODUCT_QUESTION', 'REVIEW_REPLY', 'LOW_STOCK_ALERT', 'NEW_USER_REGISTRATION',
    'CONTACT_FORM_SUBMISSION', 'SUPPORT_TICKET', 'SYSTEM_ALERT', 'SECURITY_ALERT',
    'INVENTORY_UPDATE', 'PRICE_CHANGE', 'DISCOUNT_EXPIRING', 'CUSTOMER_FEEDBACK',
    'EXPORT_COMPLETED', 'IMPORT_COMPLETED', 'BACKUP_COMPLETED', 'MAINTENANCE_SCHEDULED'
  ]).optional(),
  status: z.enum(['UNREAD', 'READ', 'ARCHIVED', 'DISMISSED']).optional(),
  excludeStatus: z.string().optional(), // Accept comma-separated statuses
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional()
});

const notificationActionSchema = z.object({
  actionType: z.string().min(1, 'Action type is required'),
  actionData: z.any().optional()
});

const preferenceSchema = z.object({
  category: z.enum([
    'ORDERS', 'PRODUCTS', 'CUSTOMERS', 'INVENTORY', 'FINANCIAL',
    'SYSTEM', 'SECURITY', 'MARKETING', 'SUPPORT', 'GENERAL'
  ]),
  type: z.enum([
    'ORDER_PLACED', 'ORDER_STATUS_CHANGED', 'PAYMENT_RECEIVED', 'PAYMENT_FAILED',
    'SHIPPING_UPDATE', 'ORDER_CANCELLED', 'REFUND_REQUESTED', 'PRODUCT_REVIEW',
    'PRODUCT_QUESTION', 'REVIEW_REPLY', 'LOW_STOCK_ALERT', 'NEW_USER_REGISTRATION',
    'CONTACT_FORM_SUBMISSION', 'SUPPORT_TICKET', 'SYSTEM_ALERT', 'SECURITY_ALERT',
    'INVENTORY_UPDATE', 'PRICE_CHANGE', 'DISCOUNT_EXPIRING', 'CUSTOMER_FEEDBACK',
    'EXPORT_COMPLETED', 'IMPORT_COMPLETED', 'BACKUP_COMPLETED', 'MAINTENANCE_SCHEDULED'
  ]).optional(),
  enabled: z.boolean().optional(),
  email: z.boolean().optional(),
  push: z.boolean().optional(),
  sms: z.boolean().optional(),
  inApp: z.boolean().optional()
});

// Get all notifications for the authenticated user
router.get('/', authenticateClerkToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    const validationResult = notificationFiltersSchema.safeParse(req.query);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filter parameters',
        errors: validationResult.error.issues
      });
    }

    const filters = validationResult.data;
    const page = filters.page || 1;
    const limit = filters.limit || 50;

      // Convert date strings to Date objects for the service call
      const serviceFilters: any = { ...filters };
      if (serviceFilters.dateFrom) serviceFilters.dateFrom = new Date(serviceFilters.dateFrom);
      if (serviceFilters.dateTo) serviceFilters.dateTo = new Date(serviceFilters.dateTo);

      const result = await notificationService.getNotifications(userId, serviceFilters, page, limit);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

// Get notification statistics
router.get('/stats', authenticateClerkToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    const stats = await notificationService.getNotificationStats(userId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification statistics',
      error: error.message
    });
  }
});

// Get admin notification statistics (includes all statuses)
router.get('/admin/stats', authenticateClerkToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const stats = await notificationService.getAdminNotificationStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Error fetching admin notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin notification statistics',
      error: error.message
    });
  }
});

// Get unread count
router.get('/unread-count', authenticateClerkToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    const count = await notificationService.getUnreadCount(userId);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error: any) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message
    });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateClerkToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    const { id } = req.params;

    const notification = await notificationService.markAsRead(parseInt(id), userId);

    res.json({
      success: true,
      data: notification
    });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

// Mark multiple notifications as read
router.put('/mark-read', authenticateClerkToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Notification IDs array is required'
      });
    }

    const result = await notificationService.markMultipleAsRead(notificationIds, userId);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read',
      error: error.message
    });
  }
});

// Archive notification
router.put('/:id/archive', authenticateClerkToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    const { id } = req.params;

    const notification = await notificationService.archiveNotification(parseInt(id), userId);

    res.json({
      success: true,
      data: notification
    });
  } catch (error: any) {
    console.error('Error archiving notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive notification',
      error: error.message
    });
  }
});

// Dismiss notification
router.put('/:id/dismiss', authenticateClerkToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    const { id } = req.params;

    const notification = await notificationService.dismissNotification(parseInt(id), userId);

    res.json({
      success: true,
      data: notification
    });
  } catch (error: any) {
    console.error('Error dismissing notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to dismiss notification',
      error: error.message
    });
  }
});

// Add action to notification
router.post('/:id/action', authenticateClerkToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    const { id } = req.params;
    const validationResult = notificationActionSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action data',
        errors: validationResult.error.issues
      });
    }

    const action = await notificationService.addNotificationAction(parseInt(id), {
      ...validationResult.data,
      performedBy: userId
    });

    res.json({
      success: true,
      data: action
    });
  } catch (error: any) {
    console.error('Error adding notification action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add notification action',
      error: error.message
    });
  }
});

// Get notification preferences
router.get('/preferences', authenticateClerkToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    // This would need to be implemented in the notification service
    // For now, return default preferences
    const defaultPreferences = [
      { category: 'ORDERS', enabled: true, email: true, push: true, sms: false, inApp: true },
      { category: 'PRODUCTS', enabled: true, email: true, push: true, sms: false, inApp: true },
      { category: 'CUSTOMERS', enabled: true, email: true, push: true, sms: false, inApp: true },
      { category: 'SYSTEM', enabled: true, email: false, push: true, sms: false, inApp: true }
    ];

    res.json({
      success: true,
      data: defaultPreferences
    });
  } catch (error: any) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification preferences',
      error: error.message
    });
  }
});

// Update notification preferences
router.put('/preferences', authenticateClerkToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    const validationResult = preferenceSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid preference data',
        errors: validationResult.error.issues
      });
    }

    // This would need to be implemented in the notification service
    // For now, return success
    res.json({
      success: true,
      message: 'Preferences updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences',
      error: error.message
    });
  }
});

// Admin-only: Create notification
router.post('/', authenticateClerkToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const validationResult = createNotificationSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification data',
        errors: validationResult.error.issues
      });
    }

    const notificationData = validationResult.data;
    
    // Create a new object with converted dates for the service call
    const serviceData: any = { ...notificationData };
    if (serviceData.expiresAt) {
      serviceData.expiresAt = new Date(serviceData.expiresAt);
    }

    const notification = await notificationService.createNotification(serviceData);

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error: any) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
});

// Admin-only: Get all notifications (for admin dashboard)
router.get('/admin/all', authenticateClerkToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const validationResult = notificationFiltersSchema.safeParse(req.query);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filter parameters',
        errors: validationResult.error.issues
      });
    }

    const filters = validationResult.data;
    const page = filters.page || 1;
    const limit = filters.limit || 50;

      // Convert date strings to Date objects for the service call
      const serviceFilters: any = { ...filters };
      if (serviceFilters.dateFrom) serviceFilters.dateFrom = new Date(serviceFilters.dateFrom);
      if (serviceFilters.dateTo) serviceFilters.dateTo = new Date(serviceFilters.dateTo);

      // For admin, we can get all notifications
      const result = await notificationService.getNotifications(0, serviceFilters, page, limit);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error fetching admin notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin notifications',
      error: error.message
    });
  }
});

export default router;
