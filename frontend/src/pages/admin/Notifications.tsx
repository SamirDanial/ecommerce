import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  ArrowLeft, 
  Check, 
  Archive, 
  Trash2, 
  Filter, 
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useClerkAuth } from '../../hooks/useClerkAuth';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Separator } from '../../components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  targetType?: string;
  targetId?: number;
  isGlobal: boolean;
  recipientId?: number;
  createdAt: string;
  readAt?: string;
  data?: any;
}

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { getToken } = useClerkAuth();
  const {
    markAsRead,
    markMultipleAsRead,
    archiveNotification,
    dismissNotification,
    addNotificationAction,
    getPriorityColor,
    getCategoryColor
  } = useNotifications();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'archived' | 'dismissed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // API base URL
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Fetch notifications with pagination
  const fetchNotifications = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '15',
        ...(filter !== 'all' && { status: filter.toUpperCase() }),
        ...(filter === 'all' && { excludeStatus: 'ARCHIVED,DISMISSED' }), // Exclude archived and dismissed by default
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(priorityFilter !== 'all' && { priority: priorityFilter.toUpperCase() }),
        ...(typeFilter !== 'all' && { type: typeFilter })
      });

      const response = await fetch(`${API_BASE}/notifications?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`);
      }

      const data = await response.json();
      const newNotifications = data.data.notifications || [];

      if (reset || pageNum === 1) {
        setNotifications(newNotifications);
      } else {
        setNotifications(prev => [...prev, ...newNotifications]);
      }

      setHasMore(newNotifications.length === 15);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch notifications');
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [filter, categoryFilter, priorityFilter, typeFilter, API_BASE, getToken]);

  // Load more notifications when scrolling
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      fetchNotifications(page + 1, false);
    }
  }, [fetchNotifications, page, isLoadingMore, hasMore]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, hasMore, isLoadingMore]);

  // Initial load and filter changes
  useEffect(() => {
    fetchNotifications(1, true);
    setSelectedNotifications([]);
  }, [filter, categoryFilter, priorityFilter, typeFilter]);

  // Handle notification selection
  const toggleNotificationSelection = (notificationId: number) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  // Handle bulk actions
  const handleBulkAction = async (action: 'read' | 'archive' | 'dismiss') => {
    if (selectedNotifications.length === 0) return;

    try {
      switch (action) {
        case 'read':
          await markMultipleAsRead(selectedNotifications);
          break;
        case 'archive':
          await Promise.all(selectedNotifications.map(id => archiveNotification(id)));
          break;
        case 'dismiss':
          await Promise.all(selectedNotifications.map(id => dismissNotification(id)));
          break;
      }
      setSelectedNotifications([]);
      toast.success(`${action} action completed`);
      // Refresh the current page
      fetchNotifications(1, true);
    } catch (error) {
      console.error('Bulk action failed:', error);
      toast.error('Bulk action failed');
    }
  };

  // Handle notification action
  const handleNotificationAction = async (notificationId: number, actionType: string) => {
    try {
      await addNotificationAction(notificationId, actionType);
      
      switch (actionType) {
        case 'view':
          await markAsRead(notificationId);
          // Navigate to the target if applicable
          break;
        case 'approve':
        case 'reject':
          // Handle approval/rejection logic
          break;
      }
      toast.success('Action completed');
    } catch (error) {
      console.error('Notification action failed:', error);
      toast.error('Action failed');
    }
  };

  // Handle notification click - navigate to appropriate management page
  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark notification as read
      await markAsRead(notification.id);
      
      // Navigate based on notification type and target
      if (notification.targetType === 'ORDER' && notification.targetId) {
        // Navigate to order management with order ID for highlighting
        navigate(`/admin/orders?orderId=${notification.targetId}`);
      } else if (notification.targetType === 'PRODUCT') {
        if (notification.type === 'PRODUCT_REVIEW' && notification.data?.reviewId) {
          // Navigate to review management with review ID for highlighting
          navigate(`/admin/reviews?reviewId=${notification.data.reviewId}`);
        } else if (notification.type === 'PRODUCT_QUESTION' && notification.data?.questionId) {
          // Navigate to question management with question ID for highlighting
          navigate(`/admin/questions?questionId=${notification.data.questionId}`);
        } else if (notification.type === 'REVIEW_REPLY' && notification.data?.reviewId) {
          // Navigate to review management with review ID for highlighting the reply
          navigate(`/admin/reviews?reviewId=${notification.data.reviewId}&replyId=${notification.data.replyId}`);
        } else {
          // Fallback to general product management
          navigate('/admin/products');
        }
      } else {
        // Default fallback to notifications page
        navigate('/admin/notifications');
      }
    } catch (error) {
      console.error('Failed to handle notification click:', error);
      toast.error('Failed to open notification details');
    }
  };

  // Get available categories and priorities for filters
  const availableCategories = Array.from(
    new Set(notifications.map(n => n.category))
  ).sort();

  const availablePriorities = Array.from(
    new Set(notifications.map(n => n.priority))
  ).sort();

  // Main notification types for filtering
  const availableTypes = [
    'PRODUCT_REVIEW',
    'PRODUCT_QUESTION',
    'REVIEW_REPLY',
    'ORDER_PLACED'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Admin</span>
              </Button>
              <div className="flex items-center space-x-3">
                <Bell className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                  <p className="text-gray-600">Manage and view all notifications</p>
                </div>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={() => fetchNotifications(1, true)}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All (Excluding Archived & Dismissed)</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                      <SelectItem value="dismissed">Dismissed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {availableCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      {availablePriorities.map(priority => (
                        <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {availableTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedNotifications.length} notification{selectedNotifications.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('read')}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Mark Read
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('archive')}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('dismiss')}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Dismiss
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications List */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading notifications...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 mb-2">Failed to load notifications</p>
                  <p className="text-gray-600 text-sm mb-4">{error}</p>
                  <Button onClick={() => fetchNotifications(1, true)}>
                    Try Again
                  </Button>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No notifications found</p>
                  {filter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all' ? (
                    <p className="text-gray-500 text-sm">Try adjusting your filters</p>
                  ) : null}
                </div>
              </div>
            ) : (
              <ScrollArea className="h-[600px] w-full">
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                        notification.status === 'UNREAD' ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Selection Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleNotificationSelection(notification.id);
                          }}
                          className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />

                        {/* Notification Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {notification.title}
                              </h3>
                              <p className="text-gray-600 mb-3">
                                {notification.message}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <Badge
                                variant="outline"
                                className={`${getPriorityColor(notification.priority)}`}
                              >
                                {notification.priority}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`${getCategoryColor(notification.category)}`}
                              >
                                {notification.category}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </span>
                              {notification.isGlobal && (
                                <Badge variant="secondary" className="text-xs">
                                  Global
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {notification.status === 'UNREAD' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Mark Read
                                </Button>
                              )}
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNotificationClick(notification);
                                }}
                              >
                                {notification.targetType === 'ORDER' && 'View Order'}
                                {notification.targetType === 'PRODUCT' && notification.type === 'PRODUCT_REVIEW' && 'View Review'}
                                {notification.targetType === 'PRODUCT' && notification.type === 'PRODUCT_QUESTION' && 'View Question'}
                                {notification.targetType === 'PRODUCT' && notification.type === 'REVIEW_REPLY' && 'View Reply'}
                                {!['ORDER', 'PRODUCT'].includes(notification.targetType || '') && 'View Details'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Load More Trigger */}
                  <div ref={loadMoreRef} className="h-10">
                    {isLoadingMore && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <span className="ml-2 text-gray-600">Loading more notifications...</span>
                      </div>
                    )}
                  </div>
                  
                  {!hasMore && notifications.length > 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No more notifications to load</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationsPage;
