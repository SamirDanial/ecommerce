import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Bell, X, Check, Filter, RefreshCw, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { useClerkAuth } from '../../hooks/useClerkAuth';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const { getToken } = useClerkAuth();
  const {
    notifications,
    unreadCount,
    stats,
    isLoading,
    isConnected,
    markAsRead,
    addNotificationAction,
    refreshNotifications,
    retryConnection,
    getPriorityColor,
    getCategoryColor
  } = useNotifications();

  // Debug unread count
  console.log('🔔 NotificationBell - unreadCount:', unreadCount);

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'archived' | 'dismissed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Infinite scroll state
  const [dropdownNotifications, setDropdownNotifications] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(false);

  // API base URL
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Fetch notifications for dropdown with pagination
  const fetchDropdownNotifications = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    try {
      if (pageNum === 1) {
        setIsInitialLoad(true);
      } else {
        setIsLoadingMore(true);
      }

      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '5', // Show 5 notifications at a time
        ...(filter !== 'all' && { status: filter.toUpperCase() }),
        ...(filter === 'all' && { excludeStatus: 'ARCHIVED,DISMISSED' }), // Exclude archived and dismissed by default
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
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
        setDropdownNotifications(newNotifications);
      } else {
        setDropdownNotifications(prev => [...prev, ...newNotifications]);
      }

      const hasMoreNotifications = newNotifications.length === 5;
      setHasMore(hasMoreNotifications);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching dropdown notifications:', error);
    } finally {
      setIsInitialLoad(false);
      setIsLoadingMore(false);
    }
  }, [filter, categoryFilter, typeFilter, API_BASE, getToken]);

  // Load more notifications when scrolling
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      fetchDropdownNotifications(page + 1, false);
    }
  }, [fetchDropdownNotifications, page, isLoadingMore, hasMore]);

  // Set up scroll event listener for infinite scroll
  useEffect(() => {
    const scrollContainer = dropdownRef.current?.querySelector('.max-h-96');
    
    if (!scrollContainer || !isOpen) {
      return;
    }

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50; // 50px threshold
      
      if (isNearBottom && hasMore && !isLoadingMore) {
        loadMore();
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen, hasMore, isLoadingMore, loadMore]);

  // Load notifications when dropdown opens or filters change
  useEffect(() => {
    if (isOpen) {
      fetchDropdownNotifications(1, true);
    }
  }, [isOpen, filter, categoryFilter, typeFilter, fetchDropdownNotifications]);



  // Calculate filtered unread count from dropdown notifications
  const filteredUnreadCount = useMemo(() => {
    return dropdownNotifications.filter(n => n.status === 'UNREAD').length;
  }, [dropdownNotifications]);



  // Handle notification action
  const handleNotificationAction = async (notificationId: number, actionType: string) => {
    try {
      await addNotificationAction(notificationId, actionType);
      
      // Handle specific actions
      switch (actionType) {
        case 'view':
          await markAsRead(notificationId);
          // Navigate to the target if applicable
          break;
        case 'approve':
          // Handle approval logic
          break;
        case 'reject':
          // Handle rejection logic
          break;
      }
    } catch (error) {
      console.error('Notification action failed:', error);
    }
  };

  // Handle notification click - navigate to appropriate management page
  const handleNotificationClick = async (notification: any) => {
    try {
      // Mark notification as read
      await markAsRead(notification.id);
      
      // Close the notification dropdown
      setIsOpen(false);
      
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
    }
  };

  // Get available categories for filter with useMemo
  const availableCategories = useMemo(() => {
    return Array.from(
      new Set(dropdownNotifications.map(n => n.category))
    ).sort();
  }, [dropdownNotifications]);

  // Main notification types for filtering
  const availableTypes = [
    'PRODUCT_REVIEW',
    'PRODUCT_QUESTION',
    'REVIEW_REPLY',
    'ORDER_PLACED'
  ];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className="w-[500px] p-0" 
        align="end"
        ref={dropdownRef}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">
              Notifications
              {filteredUnreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filteredUnreadCount} unread
                </Badge>
              )}
            </h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchDropdownNotifications(1, true)}
                disabled={isInitialLoad}
              >
                <RefreshCw className={`h-4 w-4 ${isInitialLoad ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-[120px] h-8 text-sm">
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
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[120px] h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {availableCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[120px] h-8 text-sm">
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

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
            {isInitialLoad ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading notifications...</span>
              </div>
            ) : dropdownNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No notifications</p>
                {filter !== 'all' && (
                  <p className="text-sm">Try adjusting your filters</p>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {dropdownNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      notification.status === 'UNREAD' ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="space-y-3">
                      {/* Header with title and badges */}
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-medium text-gray-900 flex-1 pr-2">
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <Badge
                            variant="outline"
                            className={`text-xs ${getPriorityColor(notification.priority)}`}
                          >
                            {notification.priority}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getCategoryColor(notification.category)}`}
                          >
                            {notification.category}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Message - full width, no truncation */}
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {notification.message}
                      </p>
                      
                      {/* Footer with timestamp and actions */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          {notification.status === 'UNREAD' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="h-7 px-3 text-xs"
                            >
                              <Check className="h-3 w-3 mr-1" />
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
                            className="h-7 px-3 text-xs"
                          >
                            {notification.targetType === 'ORDER' && 'View Order'}
                            {notification.targetType === 'PRODUCT' && notification.type === 'PRODUCT_REVIEW' && 'View Review'}
                            {notification.targetType === 'PRODUCT' && notification.type === 'PRODUCT_QUESTION' && 'View Question'}
                            {notification.targetType === 'PRODUCT' && notification.type === 'REVIEW_REPLY' && 'View Reply'}
                            {!['ORDER', 'PRODUCT'].includes(notification.targetType) && 'View Details'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Loading More Indicator */}
                {isLoadingMore && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600 text-sm">Loading more...</span>
                  </div>
                )}
                
                {!hasMore && dropdownNotifications.length > 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    <p>No more notifications to load</p>
                  </div>
                )}
              </div>
            )}
          </div>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {isConnected ? (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Connected
                </span>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Disconnected
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={retryConnection}
                    className="h-6 px-2 text-xs"
                  >
                    Retry
                  </Button>
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigate('/admin/notifications');
                setIsOpen(false);
              }}
            >
              View All
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
