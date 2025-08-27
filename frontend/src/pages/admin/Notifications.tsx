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
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useClerkAuth } from '../../hooks/useClerkAuth';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Separator } from '../../components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data: any;
  priority: string;
  status: 'UNREAD' | 'READ' | 'ARCHIVED' | 'DISMISSED';
  category: string;
  targetType: string;
  targetId: number;
  recipientId: number | null;
  isGlobal: boolean;
  createdAt: string;
  updatedAt: string;
  readAt: string | null;
  expiresAt: string | null;
  actions: any[];
}

interface NotificationResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  };
}

const NotificationsPage: React.FC = () => {
  const { getToken } = useClerkAuth();
  const { isConnected } = useNotifications();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'archived' | 'dismissed'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    archived: 0,
    dismissed: 0
  });
  
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Create authenticated API instance
  const createAuthenticatedApi = async () => {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    return axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
  };

  const fetchNotifications = useCallback(async (page: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      const api = await createAuthenticatedApi();

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      if (filter !== 'all') {
        params.append('status', filter.toUpperCase());
      }

      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }

      if (priorityFilter !== 'all') {
        params.append('priority', priorityFilter);
      }

      if (typeFilter !== 'all') {
        params.append('type', typeFilter);
      }

      if (filter === 'all') {
        params.append('excludeStatus', 'ARCHIVED,DISMISSED');
      }

      const response = await api.get(`/notifications/admin/all?${params}`);
      
      if (response.data.success) {
        if (reset) {
          setNotifications(response.data.data.notifications);
        } else {
          setNotifications(prev => [...prev, ...response.data.data.notifications]);
        }
        setHasMore(page < response.data.data.totalPages);
        setCurrentPage(page);
      } else {
        throw new Error('Failed to fetch notifications');
      }
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      setError(error.response?.data?.message || error.message);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [filter, categoryFilter, priorityFilter, typeFilter]);

  // Fetch notification statistics from server
  const fetchStats = useCallback(async () => {
    try {
      const api = await createAuthenticatedApi();
      const response = await api.get('/notifications/admin/stats');
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching notification stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1, true);
    fetchStats();
  }, [fetchNotifications, fetchStats]);

  const toggleNotificationSelection = (notificationId: number) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleBulkAction = async (action: 'read' | 'archive' | 'dismiss') => {
    if (selectedNotifications.length === 0) return;

    try {
      const api = await createAuthenticatedApi();

      const promises = selectedNotifications.map(id => {
        const endpoint = action === 'read' ? 'read' : action;
        return api.put(`/notifications/${id}/${endpoint}`);
      });

      await Promise.all(promises);
      
      setSelectedNotifications([]);
      fetchNotifications(1, true);
      fetchStats(); // Refresh stats after bulk action
      toast.success(`Notifications ${action === 'read' ? 'marked as read' : action + 'd'} successfully`);
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      toast.error(`Failed to ${action} notifications`);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    try {
      const { type, data, targetType } = notification;
      
      if (type === 'ORDER_PLACED' && data?.orderId) {
        navigate(`/admin/orders?orderId=${data.orderId}`);
      } else if (type === 'LOW_STOCK_ALERT' && data?.productId && data?.variantId) {
        // Navigate to product management with stock dialog and variant highlighting
        navigate(`/admin/products?productId=${data.productId}&variantId=${data.variantId}&openStockDialog=true`);
      } else if (type === 'PRODUCT_REVIEW' && data?.reviewId) {
        navigate(`/admin/reviews?reviewId=${data.reviewId}`);
      } else if (type === 'PRODUCT_QUESTION' && data?.questionId) {
        navigate(`/admin/questions?questionId=${data.questionId}`);
      } else if (type === 'REVIEW_REPLY' && data?.replyId) {
        navigate(`/admin/reviews?replyId=${data.replyId}`);
      } else {
        toast.info('No specific action available for this notification');
      }
    } catch (error) {
      console.error('Failed to handle notification click:', error);
      toast.error('Failed to open notification details');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      case 'URGENT': return 'bg-red-200 text-red-900 border-red-300';
      case 'CRITICAL': return 'bg-red-300 text-red-900 border-red-400';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ORDERS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PRODUCTS': return 'bg-green-100 text-green-800 border-green-200';
      case 'CUSTOMERS': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'SYSTEM': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-1 sm:p-3 md:p-6">
      <div className="w-full space-y-3 sm:space-y-6 md:space-y-8">
        {/* Enhanced Header with Better Glassmorphism */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-green-600/20 to-purple-600/20 rounded-xl sm:rounded-2xl md:rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-700"></div>
          <div className="relative bg-white/80 backdrop-blur-2xl rounded-xl sm:rounded-2xl md:rounded-3xl p-2 sm:p-4 md:p-8 border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin')}
                    className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Admin</span>
              </Button>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="p-3 bg-gradient-to-br from-blue-500 via-green-600 to-purple-600 rounded-2xl shadow-lg">
                      <Bell className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 bg-clip-text text-transparent">
                      Notification Center
                    </h1>
                    <p className="text-slate-600 text-sm sm:text-base font-medium">Manage and monitor all system notifications with style</p>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => fetchNotifications(1, true)}
                  disabled={loading}
                  className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm border-white/30 hover:bg-white/70"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 sm:gap-3 md:gap-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-white/80 backdrop-blur-xl rounded-xl p-4 sm:p-5 md:p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Notifications</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                </div>
              </div>
            </div>
            
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-white/80 backdrop-blur-xl rounded-xl p-4 sm:p-5 md:p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Unread</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.unread}</p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-white/80 backdrop-blur-xl rounded-xl p-4 sm:p-5 md:p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Read</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.read}</p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
            </div>
                </div>
                
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-white/80 backdrop-blur-xl rounded-xl p-4 sm:p-5 md:p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Archived</p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600">{stats.archived}</p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Archive className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-slate-600/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-white/80 backdrop-blur-xl rounded-xl p-4 sm:p-5 md:p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="h-5 w-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
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
                <label className="block text-sm font-medium text-slate-700 mb-2">
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
                <label className="block text-sm font-medium text-slate-700 mb-2">
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
                <label className="block text-sm font-medium text-slate-700 mb-2">
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
          </div>
        </div>

        {/* Enhanced Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-white/80 backdrop-blur-xl rounded-xl p-4 sm:p-5 md:p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  {selectedNotifications.length} notification{selectedNotifications.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('read')}
                    className="bg-white/50 backdrop-blur-sm border-white/30 hover:bg-white/70"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Mark Read
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('archive')}
                    className="bg-white/50 backdrop-blur-sm border-white/30 hover:bg-white/70"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('dismiss')}
                    className="bg-white/50 backdrop-blur-sm border-white/30 hover:bg-white/70"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Notifications List */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-500/5 to-slate-600/5 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-white/80 backdrop-blur-xl rounded-xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-slate-600">Loading notifications...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 mb-2">Failed to load notifications</p>
                  <p className="text-slate-600 text-sm mb-4">{error}</p>
                  <Button onClick={() => fetchNotifications(1, true)}>
                    Try Again
                  </Button>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex items-center justify-center py-12 p-6">
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl w-fit mx-auto mb-4">
                    <Bell className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No notifications found</h3>
                  <p className="text-slate-600 mb-2">Try adjusting your filters or check back later.</p>
                  {filter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all' || typeFilter !== 'all' ? (
                    <p className="text-slate-500 text-sm">Current filters may be hiding notifications</p>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                      className={`relative backdrop-blur-xl rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-6 border transition-all duration-300 overflow-hidden cursor-pointer border-l-4 hover:shadow-lg ${
                        notification.status === 'UNREAD' 
                          ? 'bg-gradient-to-r from-blue-50/90 to-blue-100/80 border-blue-200/60 border-l-blue-500 hover:from-blue-100/90 hover:to-blue-150/80 hover:border-blue-300/60' 
                          : 'bg-gradient-to-r from-white/80 to-white/60 border-white/40 border-l-transparent hover:from-slate-50/90 hover:to-slate-100/80 hover:border-slate-300/60 hover:border-l-slate-300'
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
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />

                      {/* Notification Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-start gap-2 mb-1">
                              {notification.status === 'UNREAD' && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              )}
                              <h3 className={`text-lg font-semibold mb-1 ${
                                notification.status === 'UNREAD' ? 'text-slate-900' : 'text-slate-700'
                              }`}>
                                {notification.title}
                              </h3>
                            </div>
                              <p className={`mb-3 ${
                                notification.status === 'UNREAD' ? 'text-slate-800 font-medium' : 'text-slate-600'
                              }`}>
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
                            <div className="flex items-center space-x-4 text-sm text-slate-500">
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
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNotificationClick(notification);
                                }}
                                className="bg-white/50 backdrop-blur-sm border-white/30 hover:bg-white/70"
                              >
                                {notification.targetType === 'ORDER' && 'View Order'}
                                {notification.targetType === 'PRODUCT' && notification.type === 'LOW_STOCK_ALERT' && 'View Stock'}
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
                        <span className="ml-2 text-slate-600">Loading more notifications...</span>
                    </div>
                  )}
                </div>
                
                {!hasMore && notifications.length > 0 && (
                    <div className="text-center py-8 text-slate-500">
                    <p>No more notifications to load</p>
                  </div>
                )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;