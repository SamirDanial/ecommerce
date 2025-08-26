import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Star, 
  User, 
  Package, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Eye,
  Filter,
  Search,
  MoreHorizontal,
  MessageSquare,
  ThumbsUp
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { useClerkAuth } from '../../hooks/useClerkAuth';
import { useNotifications } from '../../contexts/NotificationContext';
import { toast } from 'sonner';
import axios from 'axios';

interface Review {
  id: number;
  rating: number;
  title: string;
  comment: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  product: {
    id: number;
    name: string;
    slug: string;
    images: Array<{
      url: string;
      alt?: string;
    }>;
  };
  _count: {
    interactions: number;
    replies: number;
  };
}

interface ReviewStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

const ReviewManagement: React.FC = () => {
  const { getToken } = useClerkAuth();
  const { isConnected, notifications } = useNotifications();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'PENDING',
    search: '',
    page: 1,
    limit: 20
  });
  const [totalPages, setTotalPages] = useState(1);
  const [lastNotificationId, setLastNotificationId] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Listen for new review notifications and refresh data
  useEffect(() => {
    if (isConnected) {
      // Refresh reviews and stats when socket connects
      fetchReviews(1, true);
      fetchStats();
    }
  }, [isConnected]);

  // Watch for new review notifications and refresh data
  useEffect(() => {
    if (notifications.length === 0) return;

    // Find the latest review notification
    const latestReviewNotification = notifications
      .filter(notification => notification.type === 'PRODUCT_REVIEW')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    if (latestReviewNotification && latestReviewNotification.id !== lastNotificationId) {
      console.log('🔄 New review notification detected, refreshing data...', latestReviewNotification.id);
      setLastNotificationId(latestReviewNotification.id);
      fetchReviews(1, true);
      fetchStats();
    }
  }, [notifications, lastNotificationId]);

  // Intersection Observer for infinite scrolling
  const lastReviewElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || isLoadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        const nextPage = Math.floor(reviews.length / filters.limit) + 1;
        fetchReviews(nextPage);
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [loading, isLoadingMore, hasMore, reviews.length, filters.limit]);

  // Load more reviews function
  const loadMoreReviews = useCallback(() => {
    if (!loading && !isLoadingMore && hasMore) {
      const nextPage = Math.floor(reviews.length / filters.limit) + 1;
      fetchReviews(nextPage);
    }
  }, [loading, isLoadingMore, hasMore, reviews.length, filters.limit]);

  // Load initial data
  useEffect(() => {
    fetchReviews(1, true);
    fetchStats();
  }, [filters.status, filters.search]);

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

  const fetchReviews = async (pageNum: number = 1, reset: boolean = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      const api = await createAuthenticatedApi();
      
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      params.append('page', pageNum.toString());
      params.append('limit', filters.limit.toString());

      const response = await api.get(`/admin/reviews/pending?${params}`);
      
      if (response.data.success) {
        const newReviews = response.data.reviews;
        
        if (reset || pageNum === 1) {
          setReviews(newReviews);
        } else {
          setReviews(prev => [...prev, ...newReviews]);
        }
        
        setTotalPages(response.data.totalPages);
        setHasMore(pageNum < response.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const fetchStats = async () => {
    try {
      const api = await createAuthenticatedApi();
      const response = await api.get('/admin/reviews/stats');
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [filters]);

  const handleApprove = async (reviewId: number) => {
    try {
      const api = await createAuthenticatedApi();
      const response = await api.put(`/admin/reviews/${reviewId}/approve`);
      
      if (response.data.success) {
        toast.success('Review approved successfully');
        fetchReviews();
        fetchStats();
      }
    } catch (error) {
      console.error('Error approving review:', error);
      toast.error('Failed to approve review');
    }
  };

  const handleReject = async (reviewId: number) => {
    try {
      const api = await createAuthenticatedApi();
      const response = await api.put(`/admin/reviews/${reviewId}/reject`, {
        reason: rejectReason
      });
      
      if (response.data.success) {
        toast.success('Review rejected successfully');
        setIsRejectOpen(false);
        setRejectReason('');
        fetchReviews();
        fetchStats();
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
      toast.error('Failed to reject review');
    }
  };

  const handleDelete = async (reviewId: number) => {
    try {
      const api = await createAuthenticatedApi();
      const response = await api.delete(`/admin/reviews/${reviewId}`);
      
      if (response.data.success) {
        toast.success('Review deleted successfully');
        setIsDeleteOpen(false);
        fetchReviews();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Review Management</h1>
          <p className="text-gray-600 mt-1">Manage product reviews and customer feedback</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            isConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span>{isConnected ? 'Live Updates' : 'Offline'}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search reviews..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No reviews found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <div 
                  key={review.id} 
                  ref={index === reviews.length - 1 ? lastReviewElementRef : null}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                        </div>
                        <span className="font-semibold text-gray-900">{review.title}</span>
                        {getStatusBadge(review.status)}
                      </div>
                      
                      <p className="text-gray-700 mb-3 line-clamp-2">{review.comment}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{review.user.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          <span>{review.product.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(review.createdAt)}</span>
                        </div>
                        {review._count.interactions > 0 && (
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{review._count.interactions} helpful</span>
                          </div>
                        )}
                        {review._count.replies > 0 && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{review._count.replies} replies</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedReview(review);
                          setIsDetailOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {review.status === 'PENDING' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(review.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedReview(review);
                              setIsRejectOpen(true);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedReview(review);
                          setIsDeleteOpen(true);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Infinite Scroll Loading */}
          {isLoadingMore && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Loading more reviews...</span>
              </div>
            </div>
          )}
          
          {!hasMore && reviews.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No more reviews to load</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {renderStars(selectedReview.rating)}
                </div>
                <span className="font-semibold text-lg">{selectedReview.title}</span>
                {getStatusBadge(selectedReview.status)}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{selectedReview.comment}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Customer:</span>
                  <p className="text-gray-900">{selectedReview.user.name}</p>
                  <p className="text-gray-500">{selectedReview.user.email}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Product:</span>
                  <p className="text-gray-900">{selectedReview.product.name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Submitted:</span>
                  <p className="text-gray-900">{formatDate(selectedReview.createdAt)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Last Updated:</span>
                  <p className="text-gray-900">{formatDate(selectedReview.updatedAt)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Reject Review
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedReview && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Review by <span className="font-medium">{selectedReview.user.name}</span></p>
                <p className="text-sm text-gray-800">"{selectedReview.comment}"</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for rejection (optional)
              </label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsRejectOpen(false);
                setRejectReason('');
              }}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedReview && handleReject(selectedReview.id)}
              >
                Reject Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Delete Review
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedReview && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-800 mb-2">
                  <strong>Warning:</strong> This action cannot be undone.
                </p>
                <p className="text-sm text-gray-600 mb-2">Review by <span className="font-medium">{selectedReview.user.name}</span></p>
                <p className="text-sm text-gray-800">"{selectedReview.comment}"</p>
              </div>
            )}
            <p className="text-sm text-gray-600">
              Are you sure you want to permanently delete this review? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedReview && handleDelete(selectedReview.id)}
              >
                Delete Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewManagement;
