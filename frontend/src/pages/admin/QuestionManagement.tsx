import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  HelpCircle, 
  User, 
  Package, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Eye,
  MessageSquare,
  Send,
  Search,
  Filter,
  MoreHorizontal,
  Clock
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { useClerkAuth } from '../../hooks/useClerkAuth';
import { useNotifications } from '../../contexts/NotificationContext';
import { toast } from 'sonner';
import axios from 'axios';
import { getFullImageUrl } from '../../utils/imageUtils';

interface Question {
  id: number;
  question: string;
  answer?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ANSWERED';
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
    replies: number;
  };
}

interface QuestionStats {
  pending: number;
  approved: number;
  rejected: number;
  answered: number;
  total: number;
}

const QuestionManagement: React.FC = () => {
  const { getToken } = useClerkAuth();
  const { isConnected, notifications } = useNotifications();
  const [searchParams, setSearchParams] = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState<QuestionStats>({ pending: 0, approved: 0, rejected: 0, answered: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const [highlightedQuestionId, setHighlightedQuestionId] = useState<number | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAnswerOpen, setIsAnswerOpen] = useState(false);
  const [answer, setAnswer] = useState('');
  

  
  const [filters, setFilters] = useState({
    status: 'PENDING',
    search: '',
    page: 1,
    limit: 20
  });

  // Handle search input with debouncing
  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    setFilters(prev => ({ ...prev, status: value, page: 1 }));
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filters.search !== undefined) {
        fetchQuestions(1, true);
        fetchStats();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters.search]);

  // Effect for status changes (immediate)
  useEffect(() => {
    if (filters.status !== undefined) {
      fetchQuestions(1, true);
      fetchStats();
    }
  }, [filters.status]);
  const [totalPages, setTotalPages] = useState(1);
  const [lastNotificationId, setLastNotificationId] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);



  // Handle URL parameters for highlighting specific questions
  useEffect(() => {
    const questionId = searchParams.get('questionId');
    if (questionId) {
      const id = parseInt(questionId);
      if (!isNaN(id)) {
        setHighlightedQuestionId(id);
        // Clear the URL parameter after setting the highlight
        setSearchParams({}, { replace: true });
        
        // Auto-clear highlight after 5 seconds
        const timer = setTimeout(() => {
          setHighlightedQuestionId(null);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [searchParams, setSearchParams]);

  // Listen for new question notifications and refresh data
  useEffect(() => {
    if (isConnected) {
      // Refresh questions and stats when socket connects
      fetchQuestions(1, true);
      fetchStats();
    }
  }, [isConnected]);

  // Watch for new question notifications and refresh data
  useEffect(() => {
    if (notifications.length === 0) return;

    // Find the latest question notification
    const latestQuestionNotification = notifications
      .filter(notification => notification.type === 'PRODUCT_QUESTION')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    if (latestQuestionNotification && latestQuestionNotification.id !== lastNotificationId) {
      console.log('🔄 New question notification detected, refreshing data...', latestQuestionNotification.id);
      setLastNotificationId(latestQuestionNotification.id);
      fetchQuestions(1, true);
      fetchStats();
    }
  }, [notifications, lastNotificationId]);

  // Intersection Observer for infinite scrolling
  const lastQuestionElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || isLoadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        const nextPage = Math.floor(questions.length / filters.limit) + 1;
        fetchQuestions(nextPage);
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [loading, isLoadingMore, hasMore, questions.length, filters.limit]);

  // Load more questions function
  const loadMoreQuestions = useCallback(() => {
    if (!loading && !isLoadingMore && hasMore) {
      const nextPage = Math.floor(questions.length / filters.limit) + 1;
      fetchQuestions(nextPage);
    }
  }, [loading, isLoadingMore, hasMore, questions.length, filters.limit]);

  // Load initial data
  useEffect(() => {
    fetchQuestions(1, true);
    fetchStats();
  }, []); // Only run once on mount

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

  const fetchQuestions = async (pageNum: number = 1, reset: boolean = false) => {
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

      const response = await api.get(`/admin/reviews/questions?${params}`);
      
      if (response.data.success) {
        const newQuestions = response.data.questions;
        
        if (reset || pageNum === 1) {
          setQuestions(newQuestions);
        } else {
          setQuestions(prev => [...prev, ...newQuestions]);
        }
        
        setTotalPages(response.data.totalPages);
        setHasMore(pageNum < response.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to fetch questions');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const fetchStats = async () => {
    try {
      const api = await createAuthenticatedApi();
      const response = await api.get('/admin/reviews/questions/stats');
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Remove this useEffect since we have a better one below

  const handleApprove = async (questionId: number) => {
    try {
      const api = await createAuthenticatedApi();
      const response = await api.put(`/admin/reviews/questions/${questionId}/approve`);
      
      if (response.data.success) {
        toast.success('Question approved successfully');
        fetchQuestions(1, true);
        fetchStats();
      }
    } catch (error) {
      console.error('Error approving question:', error);
      toast.error('Failed to approve question');
    }
  };

  const handleReject = async (questionId: number) => {
    try {
      const api = await createAuthenticatedApi();
      const response = await api.put(`/admin/reviews/questions/${questionId}/reject`, {
        reason: rejectReason || 'Rejected by admin'
      });
      
      if (response.data.success) {
        toast.success('Question rejected successfully');
        setIsRejectOpen(false);
        setRejectReason('');
        setSelectedQuestion(null);
        fetchQuestions(1, true);
        fetchStats();
      }
    } catch (error) {
      console.error('Error rejecting question:', error);
      toast.error('Failed to reject question');
    }
  };

  const handleAnswer = async (questionId: number) => {
    try {
      const api = await createAuthenticatedApi();
      const response = await api.put(`/admin/reviews/questions/${questionId}/answer`, {
        answer: answer.trim()
      });
      
      if (response.data.success) {
        toast.success('Question answered successfully');
        setIsAnswerOpen(false);
        setAnswer('');
        setSelectedQuestion(null);
        fetchQuestions(1, true);
        fetchStats();
      }
    } catch (error) {
      console.error('Error answering question:', error);
      toast.error('Failed to answer question');
    }
  };

  const handleSetPending = async (questionId: number) => {
    try {
      const api = await createAuthenticatedApi();
      const response = await api.put(`/admin/reviews/questions/${questionId}/pending`);
      
      if (response.data.success) {
        toast.success('Question status updated to pending');
        fetchQuestions(1, true);
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating question status:', error);
      toast.error('Failed to update question status');
    }
  };

  const handleDelete = async (questionId: number) => {
    try {
      const api = await createAuthenticatedApi();
      const response = await api.delete(`/admin/reviews/questions/${questionId}`);
      
      if (response.data.success) {
        toast.success('Question deleted successfully');
        setIsDeleteOpen(false);
        setSelectedQuestion(null);
        fetchQuestions(1, true);
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
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
      case 'ANSWERED':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Answered</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Question Management</h1>
          <p className="text-gray-600 mt-1">Manage customer questions and provide answers</p>
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <HelpCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Answered</p>
                <p className="text-2xl font-bold text-gray-900">{stats.answered}</p>
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
              <div className="p-2 bg-gray-100 rounded-lg">
                <HelpCircle className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
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
                  placeholder="Search questions..."
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filters.status}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="ANSWERED">Answered</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8">
              <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No questions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div 
                  key={question.id} 
                  ref={index === questions.length - 1 ? lastQuestionElementRef : null}
                  className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                    highlightedQuestionId === question.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-300' 
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                        {question.product.images?.[0]?.url ? (
                          <img
                            src={getFullImageUrl(question.product.images[0].url)}
                            alt={question.product.name}
                            className="w-full h-full object-contain object-center bg-gray-50"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center text-gray-400 ${question.product.images?.[0]?.url ? 'hidden' : ''}`}>
                          <Package className="w-8 h-8" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Question Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-gray-900 truncate">Q: {question.question}</span>
                        {getStatusBadge(question.status)}
                      </div>
                      
                      {question.answer && (
                        <div className="bg-blue-50 p-3 rounded-lg mb-3">
                          <p className="text-sm font-medium text-blue-900 mb-1">Answer:</p>
                          <p className="text-gray-700">{question.answer}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{question.user.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          <span className="truncate">{question.product.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(question.createdAt)}</span>
                        </div>
                        {question._count.replies > 0 && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{question._count.replies} replies</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <DropdownMenu 
                        open={openDropdownId === question.id} 
                        onOpenChange={(open) => setOpenDropdownId(open ? question.id : null)}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(null);
                              setSelectedQuestion(question);
                              setIsDetailOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          
                          {question.status !== 'ANSWERED' && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(null);
                                setSelectedQuestion(question);
                                setIsAnswerOpen(true);
                              }}
                              className="text-blue-600"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Answer
                            </DropdownMenuItem>
                          )}
                          
                          {question.status !== 'APPROVED' && (
                            <DropdownMenuItem
                              onClick={() => handleApprove(question.id)}
                              className="text-green-600"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                          )}
                          
                          {question.status !== 'REJECTED' && (
                                                                                        <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(null);
                                  setSelectedQuestion(question);
                                  setIsRejectOpen(true);
                                }}
                                className="text-red-600"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                          )}
                          
                          {question.status !== 'PENDING' && (
                            <DropdownMenuItem
                              onClick={() => handleSetPending(question.id)}
                              className="text-yellow-600"
                            >
                              <Clock className="w-4 h-4 mr-2" />
                              Set to Pending
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(null);
                              setSelectedQuestion(question);
                              setIsDeleteOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                <span className="text-gray-600">Loading more questions...</span>
              </div>
            </div>
          )}
          
          {!hasMore && questions.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No more questions to load</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Question Details</DialogTitle>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-lg">Q: {selectedQuestion.question}</span>
                {getStatusBadge(selectedQuestion.status)}
              </div>
              
              {selectedQuestion.answer && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">Answer:</p>
                  <p className="text-gray-700">{selectedQuestion.answer}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Customer:</span>
                  <p className="text-gray-900">{selectedQuestion.user.name}</p>
                  <p className="text-gray-500">{selectedQuestion.user.email}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Product:</span>
                  <p className="text-gray-900">{selectedQuestion.product.name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Submitted:</span>
                  <p className="text-gray-900">{formatDate(selectedQuestion.createdAt)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Last Updated:</span>
                  <p className="text-gray-900">{formatDate(selectedQuestion.updatedAt)}</p>
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
              Reject Question
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedQuestion && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Question by <span className="font-medium">{selectedQuestion.user.name}</span></p>
                <p className="text-sm text-gray-800">"{selectedQuestion.question}"</p>
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
                setSelectedQuestion(null);
              }}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedQuestion && handleReject(selectedQuestion.id)}
              >
                Reject Question
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
              Delete Question
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedQuestion && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-800 mb-2">
                  <strong>Warning:</strong> This action cannot be undone.
                </p>
                <p className="text-sm text-gray-600 mb-2">Question by <span className="font-medium">{selectedQuestion.user.name}</span></p>
                <p className="text-sm text-gray-800">"{selectedQuestion.question}"</p>
              </div>
            )}
            <p className="text-sm text-gray-600">
              Are you sure you want to permanently delete this question? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsDeleteOpen(false);
                setSelectedQuestion(null);
              }}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedQuestion && handleDelete(selectedQuestion.id)}
              >
                Delete Question
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Answer Dialog */}
      <Dialog open={isAnswerOpen} onOpenChange={setIsAnswerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              Answer Question
            </DialogTitle>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Question by {selectedQuestion.user.name}:</strong>
                </p>
                <p className="text-sm text-gray-800">"{selectedQuestion.question}"</p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="answer" className="text-sm font-medium text-gray-700">
                  Your Answer
                </label>
                <Textarea
                  id="answer"
                  placeholder="Provide a helpful answer to this question..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setIsAnswerOpen(false);
                  setAnswer('');
                  setSelectedQuestion(null);
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => selectedQuestion && handleAnswer(selectedQuestion.id)}
                  disabled={!answer.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Answer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default QuestionManagement;
