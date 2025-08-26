import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { JWTService } from '../services/jwtService';
import { notificationService } from '../services/notificationService';

export interface AuthenticatedSocket {
  userId: number;
  userRole: string;
  isAdmin: boolean;
}

export class SocketServer {
  private io: SocketIOServer;
  private adminRooms: Map<number, string[]> = new Map(); // userId -> roomIds
  private userConnections: Map<number, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    

    
    console.log('🚀 Socket.IO server initialized');
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Verify JWT token
        const decoded = await JWTService.verifyToken(token);
        if (!decoded) {
          return next(new Error('Invalid token'));
        }

        // Get user from database to determine role
        const { prisma } = await import('../lib/prisma');
        const user = await prisma.user.findUnique({
          where: { clerkId: decoded.sub },
          select: { id: true, role: true }
        });

        if (!user) {
          return next(new Error('User not found in database'));
        }

        // Attach user info to socket
        (socket as any).user = {
          userId: user.id,
          userRole: user.role || 'USER',
          isAdmin: user.role === 'ADMIN'
        };
        
        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    // Handle default namespace connections
    this.io.on('connection', (socket) => {
      const user = (socket as any).user as AuthenticatedSocket;
      
      if (!user) {
        socket.disconnect();
        return;
      }
      
      console.log(`🔌 User ${user.userId} connected (${user.isAdmin ? 'Admin' : 'User'})`);

      // Store connection mapping
      this.userConnections.set(user.userId, socket.id);

      // Join admin room if user is admin
      if (user.isAdmin) {
        console.log(`🔑 Admin user ${user.userId} joining admin room`);
        socket.join('admin-room');
        socket.join(`admin-${user.userId}`);
        this.adminRooms.set(user.userId, ['admin-room', `admin-${user.userId}`]);
        
        console.log(`📊 Admin rooms:`, Array.from(this.adminRooms.keys()));
        console.log(`📊 Total admin connections:`, this.adminRooms.size);
        
        // Send current unread count
        this.sendUnreadCount(user.userId);
      }

      // Handle notification actions
      socket.on('mark-notification-read', async (data: { notificationId: number }) => {
        try {
          await notificationService.markAsRead(data.notificationId, user.userId);
          this.sendUnreadCount(user.userId);
          socket.emit('notification-updated', { success: true });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          socket.emit('notification-updated', { success: false, error: errorMessage });
        }
      });

      socket.on('mark-notifications-read', async (data: { notificationIds: number[] }) => {
        try {
          await notificationService.markMultipleAsRead(data.notificationIds, user.userId);
          this.sendUnreadCount(user.userId);
          socket.emit('notifications-updated', { success: true });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          socket.emit('notifications-updated', { success: false, error: errorMessage });
        }
      });

      socket.on('archive-notification', async (data: { notificationId: number }) => {
        try {
          await notificationService.archiveNotification(data.notificationId, user.userId);
          this.sendUnreadCount(user.userId);
          socket.emit('notification-archived', { success: true });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          socket.emit('notification-archived', { success: false, error: errorMessage });
        }
      });

      socket.on('dismiss-notification', async (data: { notificationId: number }) => {
        try {
          await notificationService.dismissNotification(data.notificationId, user.userId);
          this.sendUnreadCount(user.userId);
          socket.emit('notification-dismissed', { success: true });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          socket.emit('notification-dismissed', { success: false, error: errorMessage });
        }
      });

      socket.on('notification-action', async (data: { 
        notificationId: number, 
        actionType: string, 
        actionData?: any 
      }) => {
        try {
          await notificationService.addNotificationAction(data.notificationId, {
            actionType: data.actionType,
            actionData: data.actionData,
            performedBy: user.userId
          });
          socket.emit('action-completed', { success: true });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          socket.emit('action-completed', { success: false, error: errorMessage });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.userConnections.delete(user.userId);
        this.adminRooms.delete(user.userId);
      });
    });
  }

  // Send notification to all admin users
  public async sendAdminNotification(notification: any) {
    try {
      console.log(`📡 Creating notification:`, {
        type: notification.type,
        targetType: notification.targetType,
        targetId: notification.targetId,
        title: notification.title
      });
      
      // Create notification in database
      const savedNotification = await notificationService.createNotification(notification);
      
      // Emit to admin room
      console.log(`📡 Sending notification to admin room:`, {
        notificationId: savedNotification?.id,
        title: savedNotification?.title,
        adminRoomSize: this.io.sockets.adapter.rooms.get('admin-room')?.size || 0
      });
      
      this.io.to('admin-room').emit('new-notification', {
        ...savedNotification,
        createdAt: savedNotification?.createdAt.toISOString()
      });

      // Update unread counts for all connected admins
      const adminRooms = Array.from(this.adminRooms.keys());
      for (const adminId of adminRooms) {
        this.sendUnreadCount(adminId);
      }

      return savedNotification;
    } catch (error) {
      console.error('Error sending admin notification:', error);
      throw error;
    }
  }

  // Send notification to specific user
  public async sendUserNotification(notification: any) {
    try {
      const savedNotification = await notificationService.createNotification(notification);
      
      if (notification.recipientId) {
        const socketId = this.userConnections.get(notification.recipientId);
        if (socketId) {
          this.io.to(socketId).emit('new-notification', {
            ...savedNotification,
            createdAt: savedNotification?.createdAt.toISOString()
          });
        }
      }

      return savedNotification;
    } catch (error) {
      console.error('Error sending user notification:', error);
      throw error;
    }
  }

  // Send unread count to specific user
  private async sendUnreadCount(userId: number) {
    try {
      const count = await notificationService.getUnreadCount(userId);
      const socketId = this.userConnections.get(userId);
      
      console.log(`📡 Sending unread count to user ${userId}:`, count, 'socketId:', socketId);
      
      if (socketId) {
        this.io.to(socketId).emit('unread-count', { count });
        console.log(`📡 Emitted unread-count event to socket ${socketId}`);
      } else {
        console.log(`⚠️ No socket connection found for user ${userId}`);
      }
    } catch (error) {
      console.error('Error sending unread count:', error);
    }
  }

  // Send notification from template
  public async sendTemplateNotification(
    templateName: string,
    variables: Record<string, any>,
    isGlobal: boolean = true
  ) {
    try {
      const notification = await notificationService.createNotificationFromTemplate(
        templateName,
        variables,
        undefined,
        isGlobal
      );

      if (isGlobal) {
        this.io.to('admin-room').emit('new-notification', {
          ...notification,
          createdAt: notification?.createdAt.toISOString()
        });

        // Update unread counts
        const adminRooms = Array.from(this.adminRooms.keys());
        for (const adminId of adminRooms) {
          this.sendUnreadCount(adminId);
        }
      }

      return notification;
    } catch (error) {
      console.error('Error sending template notification:', error);
      throw error;
    }
  }

  // Broadcast system message to all connected users
  public broadcastSystemMessage(message: string, type: 'info' | 'warning' | 'error' = 'info') {
    this.io.emit('system-message', { message, type, timestamp: new Date().toISOString() });
  }

  // Get connected admin count
  public getConnectedAdminCount(): number {
    return this.adminRooms.size;
  }

  // Get all connected users
  public getConnectedUsers(): number[] {
    return Array.from(this.userConnections.keys());
  }
}
