import { PrismaClient, NotificationType, NotificationCategory, NotificationPriority, NotificationStatus, NotificationTargetType } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateNotificationData {
  type: NotificationType;
  title: string;
  message: string;
  category: NotificationCategory;
  priority?: NotificationPriority;
  targetType?: NotificationTargetType;
  targetId?: number;
  recipientId?: number;
  isGlobal?: boolean;
  data?: any;
  expiresAt?: string | Date;
}

export interface NotificationFilters {
  recipientId?: number;
  category?: NotificationCategory;
  type?: NotificationType;
  status?: NotificationStatus;
  priority?: NotificationPriority;
  isGlobal?: boolean;
  dateFrom?: string | Date;
  dateTo?: string | Date;
}

export interface NotificationActionData {
  actionType: string;
  actionData?: any;
  performedBy: number;
}

export const notificationService = {
  // Create a new notification
  async createNotification(data: CreateNotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          type: data.type,
          title: data.title,
          message: data.message,
          category: data.category,
          priority: data.priority || 'MEDIUM',
          targetType: data.targetType || 'GENERAL',
          targetId: data.targetId,
          recipientId: data.recipientId,
          isGlobal: data.isGlobal || false,
          data: data.data || {},
          expiresAt: data.expiresAt instanceof Date ? data.expiresAt : data.expiresAt ? new Date(data.expiresAt) : undefined,
          status: 'UNREAD'
        }
      });

      return notification;
    } catch (error: any) {
      // Handle unique constraint violation (duplicate notification)
      if (error.code === 'P2002' && error.meta?.target?.includes('targetType')) {
        console.log('⚠️ Duplicate notification prevented by unique constraint:', {
          targetType: data.targetType,
          targetId: data.targetId,
          type: data.type
        });
        
        // Return the existing notification instead of throwing an error
        const existingNotification = await prisma.notification.findFirst({
          where: {
            targetType: data.targetType,
            targetId: data.targetId,
            type: data.type
          }
        });
        
        console.log('📋 Returning existing notification:', existingNotification?.id);
        return existingNotification;
      }
      
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Create notification from template
  async createNotificationFromTemplate(
    templateName: string, 
    variables: Record<string, any>, 
    recipientId?: number,
    isGlobal: boolean = false
  ) {
    try {
      const template = await prisma.notificationTemplate.findUnique({
        where: { name: templateName }
      });

      if (!template || !template.isActive) {
        throw new Error(`Template ${templateName} not found or inactive`);
      }

      // Replace variables in title and message
      let title = template.title;
      let message = template.message;

      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        title = title.replace(new RegExp(placeholder, 'g'), String(value));
        message = message.replace(new RegExp(placeholder, 'g'), String(value));
      });

      return await this.createNotification({
        type: template.type,
        title,
        message,
        category: template.category,
        targetType: 'GENERAL',
        recipientId,
        isGlobal,
        data: variables
      });
    } catch (error) {
      console.error('Error creating notification from template:', error);
      throw error;
    }
  },

  // Get notifications for a user
  async getNotifications(
    userId: number, 
    filters: NotificationFilters = {}, 
    page: number = 1, 
    limit: number = 50
  ) {
    try {
      const where: any = {
        OR: [
          { recipientId: userId },
          { isGlobal: true }
        ]
      };

      if (filters.category) where.category = filters.category;
      if (filters.type) where.type = filters.type;
      if (filters.status) where.status = filters.status;
      if (filters.priority) where.priority = filters.priority;
      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) where.createdAt.gte = filters.dateFrom instanceof Date ? filters.dateFrom : new Date(filters.dateFrom);
        if (filters.dateTo) where.createdAt.lte = filters.dateTo instanceof Date ? filters.dateTo : new Date(filters.dateTo);
      }

      const skip = (page - 1) * limit;

      const [notifications, totalCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          include: {
            actions: {
              orderBy: { performedAt: 'desc' },
              take: 5
            }
          },
          orderBy: [
            { priority: 'desc' },
            { createdAt: 'desc' }
          ],
          skip,
          take: limit
        }),
        prisma.notification.count({ where })
      ]);

      return {
        notifications,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Mark notification as read
  async markAsRead(notificationId: number, userId: number) {
    try {
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          OR: [
            { recipientId: userId },
            { isGlobal: true }
          ]
        }
      });

      if (!notification) {
        throw new Error('Notification not found or access denied');
      }

      return await prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: 'READ',
          readAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Mark multiple notifications as read
  async markMultipleAsRead(notificationIds: number[], userId: number) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          OR: [
            { recipientId: userId },
            { isGlobal: true }
          ]
        },
        data: {
          status: 'READ',
          readAt: new Date()
        }
      });

      return result;
    } catch (error) {
      console.error('Error marking multiple notifications as read:', error);
      throw error;
    }
  },

  // Archive notification
  async archiveNotification(notificationId: number, userId: number) {
    try {
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          OR: [
            { recipientId: userId },
            { isGlobal: true }
          ]
        }
      });

      if (!notification) {
        throw new Error('Notification not found or access denied');
      }

      return await prisma.notification.update({
        where: { id: notificationId },
        data: { status: 'ARCHIVED' }
      });
    } catch (error) {
      console.error('Error archiving notification:', error);
      throw error;
    }
  },

  // Dismiss notification
  async dismissNotification(notificationId: number, userId: number) {
    try {
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          OR: [
            { recipientId: userId },
            { isGlobal: true }
          ]
        }
      });

      if (!notification) {
        throw new Error('Notification not found or access denied');
      }

      return await prisma.notification.update({
        where: { id: notificationId },
        data: { status: 'DISMISSED' }
      });
    } catch (error) {
      console.error('Error dismissing notification:', error);
      throw error;
    }
  },

  // Add action to notification
  async addNotificationAction(notificationId: number, actionData: NotificationActionData) {
    try {
      return await prisma.notificationAction.create({
        data: {
          notificationId,
          actionType: actionData.actionType,
          actionData: actionData.actionData || {},
          performedBy: actionData.performedBy
        }
      });
    } catch (error) {
      console.error('Error adding notification action:', error);
      throw error;
    }
  },

  // Get unread count for user
  async getUnreadCount(userId: number) {
    try {
      const count = await prisma.notification.count({
        where: {
          OR: [
            { recipientId: userId },
            { isGlobal: true }
          ],
          status: 'UNREAD'
        }
      });

      console.log(`📊 Unread count for user ${userId}:`, count);
      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  },

  // Get notification statistics
  async getNotificationStats(userId: number) {
    try {
      const [total, unread, byCategory, byPriority] = await Promise.all([
        prisma.notification.count({
          where: {
            OR: [
              { recipientId: userId },
              { isGlobal: true }
            ]
          }
        }),
        prisma.notification.count({
          where: {
            OR: [
              { recipientId: userId },
              { isGlobal: true }
            ],
            status: 'UNREAD'
          }
        }),
        prisma.notification.groupBy({
          by: ['category'],
          where: {
            OR: [
              { recipientId: userId },
              { isGlobal: true }
            ]
          },
          _count: true
        }),
        prisma.notification.groupBy({
          by: ['priority'],
          where: {
            OR: [
              { recipientId: userId },
              { isGlobal: true }
            ]
          },
          _count: true
        })
      ]);

      return {
        total,
        unread,
        byCategory,
        byPriority
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw error;
    }
  },

  // Clean up expired notifications
  async cleanupExpiredNotifications() {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          expiresAt: {
            lt: new Date()
          },
          status: {
            notIn: ['ARCHIVED', 'DISMISSED']
          }
        },
        data: {
          status: 'ARCHIVED'
        }
      });

      return result;
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
      throw error;
    }
  },

  // Create system notification
  async createSystemNotification(
    title: string, 
    message: string, 
    priority: NotificationPriority = 'MEDIUM',
    data?: any
  ) {
    return await this.createNotification({
      type: 'SYSTEM_ALERT',
      title,
      message,
      category: 'SYSTEM',
      priority,
      targetType: 'SYSTEM',
      isGlobal: true,
      data
    });
  },

  // Create order notification
  async createOrderNotification(
    orderId: number,
    type: NotificationType,
    title: string,
    message: string,
    priority: NotificationPriority = 'MEDIUM',
    data?: any
  ) {
    return await this.createNotification({
      type,
      title,
      message,
      category: 'ORDERS',
      priority,
      targetType: 'ORDER',
      targetId: orderId,
      isGlobal: true,
      data
    });
  },

  // Create product notification
  async createProductNotification(
    productId: number,
    type: NotificationType,
    title: string,
    message: string,
    priority: NotificationPriority = 'MEDIUM',
    data?: any
  ) {
    return await this.createNotification({
      type,
      title,
      message,
      category: 'PRODUCTS',
      priority,
      targetType: 'PRODUCT',
      targetId: productId,
      isGlobal: true,
      data
    });
  }
};
