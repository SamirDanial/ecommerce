import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useClerkAuth } from '../hooks/useClerkAuth';
import { toast } from 'sonner';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'CRITICAL';
  status: 'UNREAD' | 'READ' | 'ARCHIVED' | 'DISMISSED';
  targetType: string;
  targetId?: number;
  recipientId?: number;
  isGlobal: boolean;
  data?: any;
  createdAt: string;
  updatedAt: string;
  readAt?: string;
  expiresAt?: string;
  actions?: Array<{
    id: number;
    actionType: string;
    actionData?: any;
    performedBy?: number;
    performedAt: string;
  }>;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byCategory: Array<{ category: string; _count: number }>;
  byPriority: Array<{ priority: string; _count: number }>;
}

interface NotificationContextType {
  // State
  notifications: Notification[];
  unreadCount: number;
  stats: NotificationStats | null;
  isLoading: boolean;
  isConnected: boolean;
  
  // Actions
  markAsRead: (notificationId: number) => Promise<void>;
  markMultipleAsRead: (notificationIds: number[]) => Promise<void>;
  archiveNotification: (notificationId: number) => Promise<void>;
  dismissNotification: (notificationId: number) => Promise<void>;
  addNotificationAction: (notificationId: number, actionType: string, actionData?: any) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  
  // Socket actions
  connect: () => void;
  disconnect: () => void;
  retryConnection: () => void;
  
  // Utility
  getPriorityColor: (priority: string) => string;
  getCategoryIcon: (category: string) => ReactNode;
  getCategoryColor: (category: string) => string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { getToken, isAuthenticated } = useClerkAuth();
  
  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Socket
  const [socket, setSocket] = useState<Socket | null>(null);

  // API base URL
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Connect to Socket.IO
  const connect = useCallback(async () => {
    if (!isAuthenticated || socket?.connected || isConnecting) {
      return;
    }

    try {
      setIsConnecting(true);
      const token = await getToken();
      if (!token) {
        setIsConnecting(false);
        return;
      }

      // Disconnect existing socket if any
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }

      const socketUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const baseUrl = socketUrl.replace('/api', ''); // Remove /api if present
      
      console.log('🔌 Attempting to connect to socket server:', baseUrl);
      console.log('🔌 Using token:', token ? 'Present' : 'Missing');
      
      const newSocket = io(baseUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        timeout: 10000,
        forceNew: true
      });

      newSocket.on('connect', () => {
        console.log('🔌 Connected to notification server');
        console.log('🔌 Socket ID:', newSocket.id);
        setIsConnected(true);
        setIsConnecting(false);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        setIsConnecting(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('🔌 Socket connection error:', error);
        console.error('🔌 Error details:', {
          message: error.message,
          description: (error as any).description,
          context: (error as any).context,
          type: (error as any).type
        });
        setIsConnected(false);
        setIsConnecting(false);
      });

      newSocket.on('new-notification', (notification: Notification) => {
        console.log('📢 New notification received:', notification);
        
        // Add to notifications list (prevent duplicates)
        setNotifications(prev => {
          // Check if notification already exists
          const exists = prev.some(n => n.id === notification.id);
          if (exists) {
            console.log('📢 Duplicate notification ignored:', notification.id);
            return prev;
          }
          return [notification, ...prev];
        });
        
        // Update unread count from API to ensure accuracy
        fetchUnreadCount();
        
        // Show toast notification
        const priorityColors = {
          LOW: 'bg-blue-500',
          MEDIUM: 'bg-yellow-500',
          HIGH: 'bg-orange-500',
          URGENT: 'bg-red-500',
          CRITICAL: 'bg-red-600'
        };
        
        toast(notification.title, {
          description: notification.message,
          className: `${priorityColors[notification.priority] || 'bg-blue-500'} text-white`,
          duration: notification.priority === 'CRITICAL' ? 10000 : 5000,
          action: {
            label: 'View',
            onClick: () => {
              // Handle view action
              console.log('View notification:', notification);
            }
          }
        });
      });

      newSocket.on('unread-count', (data: { count: number }) => {
        console.log('📊 Received unread count from socket:', data.count);
        setUnreadCount(data.count);
      });

      newSocket.on('notification-updated', (data: { success: boolean; error?: string }) => {
        if (!data.success) {
          toast.error('Failed to update notification', { description: data.error });
        }
      });

      newSocket.on('notifications-updated', (data: { success: boolean; error?: string }) => {
        if (!data.success) {
          toast.error('Failed to update notifications', { description: data.error });
        }
      });

      newSocket.on('notification-archived', (data: { success: boolean; error?: string }) => {
        if (!data.success) {
          toast.error('Failed to archive notification', { description: data.error });
        }
      });

      newSocket.on('notification-dismissed', (data: { success: boolean; error?: string }) => {
        if (!data.success) {
          toast.error('Failed to dismiss notification', { description: data.error });
        }
      });

      newSocket.on('action-completed', (data: { success: boolean; error?: string }) => {
        if (!data.success) {
          toast.error('Failed to complete action', { description: data.error });
        }
      });

      newSocket.on('system-message', (data: { message: string; type: string; timestamp: string }) => {
        const toastType = data.type === 'error' ? 'error' : data.type === 'warning' ? 'warning' : 'info';
        toast[toastType](data.message);
      });

      setSocket(newSocket);
    } catch (error) {
      console.error('Failed to connect to notification server:', error);
      setIsConnecting(false);
    }
  }, [isAuthenticated, getToken, socket, isConnecting]);

  // Disconnect from Socket.IO
  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  // Retry connection
  const retryConnection = useCallback(() => {
    disconnect();
    setTimeout(() => {
      connect();
    }, 1000);
  }, [disconnect, connect]);

  // Fetch unread count from API
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE}/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Fetched unread count from API:', data.data.count || 0);
        setUnreadCount(data.data.count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, [isAuthenticated, getToken, API_BASE]);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || isLoading) return; // Prevent concurrent calls

    try {
      setIsLoading(true);
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data.notifications || []);
        // Don't calculate unread count locally, use the API endpoint instead
        await fetchUnreadCount();
      } else {
        console.error('Failed to fetch notifications:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, getToken, API_BASE, isLoading, fetchUnreadCount]);

  // Fetch notification statistics
  const fetchStats = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE}/notifications/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch notification stats:', error);
    }
  }, [isAuthenticated, getToken, API_BASE]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: number) => {
    if (!isAuthenticated || !socket) return;

    try {
      socket.emit('mark-notification-read', { notificationId });
      
      // Optimistically update UI
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, status: 'READ' as const, readAt: new Date().toISOString() }
            : n
        )
      );
      // Update unread count from API to ensure accuracy
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  }, [isAuthenticated, socket, fetchUnreadCount]);

  // Mark multiple notifications as read
  const markMultipleAsRead = useCallback(async (notificationIds: number[]) => {
    if (!isAuthenticated || !socket) return;

    try {
      socket.emit('mark-notifications-read', { notificationIds });
      
      // Optimistically update UI
      setNotifications(prev => 
        prev.map(n => 
          notificationIds.includes(n.id)
            ? { ...n, status: 'READ' as const, readAt: new Date().toISOString() }
            : n
        )
      );
      
      // Update unread count from API to ensure accuracy
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  }, [isAuthenticated, socket, fetchUnreadCount]);

  // Archive notification
  const archiveNotification = useCallback(async (notificationId: number) => {
    if (!isAuthenticated || !socket) return;

    try {
      socket.emit('archive-notification', { notificationId });
      
      // Optimistically update UI
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, status: 'ARCHIVED' as const }
            : n
        )
      );
    } catch (error) {
      console.error('Failed to archive notification:', error);
      toast.error('Failed to archive notification');
    }
  }, [isAuthenticated, socket]);

  // Dismiss notification
  const dismissNotification = useCallback(async (notificationId: number) => {
    if (!isAuthenticated || !socket) return;

    try {
      socket.emit('dismiss-notification', { notificationId });
      
      // Optimistically update UI
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, status: 'DISMISSED' as const }
            : n
        )
      );
    } catch (error) {
      console.error('Failed to dismiss notification:', error);
      toast.error('Failed to dismiss notification');
    }
  }, [isAuthenticated, socket]);

  // Add notification action
  const addNotificationAction = useCallback(async (notificationId: number, actionType: string, actionData?: any) => {
    if (!isAuthenticated || !socket) return;

    try {
      socket.emit('notification-action', { notificationId, actionType, actionData });
    } catch (error) {
      console.error('Failed to add notification action:', error);
      toast.error('Failed to complete action');
    }
  }, [isAuthenticated, socket]);

  // Refresh notifications with debouncing
  const refreshNotifications = useCallback(async () => {
    if (isLoading) return; // Prevent multiple simultaneous refreshes
    
    try {
      await Promise.all([fetchNotifications(), fetchStats()]);
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    }
  }, [fetchNotifications, fetchStats, isLoading]);

  // Utility functions
  const getPriorityColor = useCallback((priority: string) => {
    const colors = {
      LOW: 'text-blue-600 bg-blue-50 border-blue-200',
      MEDIUM: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      HIGH: 'text-orange-600 bg-orange-50 border-orange-200',
      URGENT: 'text-red-600 bg-red-50 border-red-200',
      CRITICAL: 'text-red-700 bg-red-100 border-red-300'
    };
    return colors[priority as keyof typeof colors] || colors.MEDIUM;
  }, []);

  const getCategoryIcon = useCallback((category: string) => {
    // This would return appropriate icons based on category
    // For now, return a simple span
    return <span className="w-2 h-2 rounded-full bg-gray-400" />;
  }, []);

  const getCategoryColor = useCallback((category: string) => {
    const colors = {
      ORDERS: 'text-blue-600',
      PRODUCTS: 'text-green-600',
      CUSTOMERS: 'text-purple-600',
      INVENTORY: 'text-orange-600',
      FINANCIAL: 'text-emerald-600',
      SYSTEM: 'text-gray-600',
      SECURITY: 'text-red-600',
      MARKETING: 'text-pink-600',
      SUPPORT: 'text-indigo-600',
      GENERAL: 'text-gray-600'
    };
    return colors[category as keyof typeof colors] || colors.GENERAL;
  }, []);

  // Effects
  useEffect(() => {
    if (isAuthenticated) {
      connect();
      fetchNotifications();
      fetchStats();
      fetchUnreadCount(); // Explicitly fetch unread count on initialization
    } else {
      disconnect();
      setNotifications([]);
      setUnreadCount(0);
      setStats(null);
    }
  }, [isAuthenticated]); // Remove function dependencies to prevent infinite loops

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    stats,
    isLoading,
    isConnected,
    markAsRead,
    markMultipleAsRead,
    archiveNotification,
    dismissNotification,
    addNotificationAction,
    refreshNotifications,
    connect,
    disconnect,
    retryConnection,
    getPriorityColor,
    getCategoryIcon,
    getCategoryColor
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
