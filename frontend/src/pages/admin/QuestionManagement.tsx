import React, { useState, useEffect } from 'react';
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
  Filter
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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState<QuestionStats>({ pending: 0, approved: 0, rejected: 0, answered: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAnswerOpen, setIsAnswerOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [answer, setAnswer] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [filters, setFilters] = useState({
    status: 'PENDING',
    search: '',
    page: 1,
    limit: 20
  });
  const [totalPages, setTotalPages] = useState(1);
  const [lastNotificationId, setLastNotificationId] = useState<number | null>(null);

  // Listen for new question notifications and refresh data
  useEffect(() => {
    if (isConnected) {
      // Refresh questions and stats when socket connects
      fetchQuestions();
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
      fetchQuestions();
      fetchStats();
    }
  }, [notifications, lastNotificationId]);

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

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const api = await createAuthenticatedApi();
      
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());

      const response = await api.get(`/admin/questions/pending?${params}`);
      
      if (response.data.success) {
        setQuestions(response.data.questions);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const api = await createAuthenticatedApi();
      const response = await api.get('/admin/questions/stats');
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchStats();
  }, [filters]);

  const handleApprove = async (questionId: number) => {
    try {
      const api = await createAuthenticatedApi();
      const response = await api.put(`/admin/questions/${questionId}/approve`);
      
      if (response.data.success) {
        toast.success('Question approved successfully');
        fetchQuestions();
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
      const response = await api.put(`/admin/questions/${questionId}/reject`, {
        reason: rejectReason
      });
      
      if (response.data.success) {
        toast.success('Question rejected successfully');
        setIsRejectOpen(false);
        setRejectReason('');
        fetchQuestions();
        fetchStats();
      }
    } catch (error) {
      console.error('Error rejecting question:', error);
      toast.error('Failed to reject question');
    }
  };

  const handleAnswer = async (questionId: number) => {
    if (!answer.trim()) {
      toast.error('Please enter an answer');
      return;
    }

    try {
      const api = await createAuthenticatedApi();
      const response = await api.put(`/admin/questions/${questionId}/answer`, {
        answer: answer.trim()
      });
      
      if (response.data.success) {
        toast.success('Question answered successfully');
        setIsAnswerOpen(false);
        setAnswer('');
        fetchQuestions();
        fetchStats();
      }
    } catch (error) {
      console.error('Error answering question:', error);
      toast.error('Failed to answer question');
    }
  };

  const handleDelete = async (questionId: number) => {
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    try {
      const api = await createAuthenticatedApi();
      const response = await api.delete(`/admin/questions/${questionId}`);
      
      if (response.data.success) {
        toast.success('Question deleted successfully');
        fetchQuestions();
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
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value, page: 1 })}
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
              {questions.map((question) => (
                <div key={question.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-gray-900">Q: {question.question}</span>
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
                          <span>{question.product.name}</span>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedQuestion(question);
                          setIsDetailOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {question.status === 'PENDING' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedQuestion(question);
                              setIsAnswerOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(question.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedQuestion(question);
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
                        onClick={() => handleDelete(question.id)}
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
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                disabled={filters.page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {filters.page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ ...filters, page: Math.min(totalPages, filters.page + 1) })}
                disabled={filters.page === totalPages}
              >
                Next
              </Button>
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

      {/* Answer Dialog */}
      <Dialog open={isAnswerOpen} onOpenChange={setIsAnswerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Answer Question</DialogTitle>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-2">Question:</p>
                <p className="text-gray-900">{selectedQuestion.question}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer
                </label>
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter your answer to this question..."
                  rows={6}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAnswerOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => selectedQuestion && handleAnswer(selectedQuestion.id)}
                  disabled={!answer.trim()}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Answer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
              <Button variant="outline" onClick={() => setIsRejectOpen(false)}>
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
    </div>
  );
};

export default QuestionManagement;
