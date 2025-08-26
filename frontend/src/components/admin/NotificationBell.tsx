import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Bell, X, Check, Filter, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

import { ScrollArea } from '../ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
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

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter notifications with useMemo to prevent unnecessary recalculations
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      if (filter === 'unread' && notification.status !== 'UNREAD') return false;
      if (filter === 'read' && notification.status !== 'READ') return false;
      if (categoryFilter !== 'all' && notification.category !== categoryFilter) return false;
      return true;
    });
  }, [notifications, filter, categoryFilter]);

  // Calculate filtered unread count
  const filteredUnreadCount = useMemo(() => {
    return filteredNotifications.filter(n => n.status === 'UNREAD').length;
  }, [filteredNotifications]);



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

  // Handle notification click - navigate to order management with order ID
  const handleNotificationClick = async (notification: any) => {
    try {
      // Mark notification as read
      await markAsRead(notification.id);
      
      // If it's an order notification, navigate to order management
      if (notification.targetType === 'ORDER' && notification.targetId) {
        navigate(`/admin/orders?orderId=${notification.targetId}`);
        setIsOpen(false); // Close the notification dropdown
      }
    } catch (error) {
      console.error('Failed to handle notification click:', error);
    }
  };

  // Get available categories for filter with useMemo
  const availableCategories = useMemo(() => {
    return Array.from(
      new Set(notifications.map(n => n.category))
    ).sort();
  }, [notifications]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2"
        onClick={() => setIsOpen(!isOpen)}
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

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[500px] bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
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
                  onClick={refreshNotifications}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2 mb-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All Categories</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>


          </div>

          {/* Notifications List */}
          <ScrollArea className="max-h-96">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No notifications</p>
                {filter !== 'all' && (
                  <p className="text-sm">Try adjusting your filters</p>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => (
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
                          
                          {notification.targetType === 'ORDER' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationClick(notification);
                              }}
                              className="h-7 px-3 text-xs"
                            >
                              View Order
                            </Button>
                          )}
                          
                          {notification.targetType === 'PRODUCT' && notification.type === 'PRODUCT_REVIEW' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/admin/reviews');
                                setIsOpen(false);
                              }}
                              className="h-7 px-3 text-xs"
                            >
                              View Review
                            </Button>
                          )}
                          
                          {notification.targetType === 'PRODUCT' && notification.type === 'PRODUCT_QUESTION' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/admin/questions');
                                setIsOpen(false);
                              }}
                              className="h-7 px-3 text-xs"
                            >
                              View Question
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
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
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
