import api from '../lib/axios';
import { createAuthHeaders } from '../lib/axios';

export interface ReviewSubmission {
  productId: number;
  rating: number;
  title: string;
  comment: string;
}

export interface QuestionSubmission {
  productId: number;
  question: string;
}

export interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  title?: string;
  comment?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
  };
}

export interface Question {
  id: number;
  userId: number;
  productId: number;
  question: string;
  answer?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ANSWERED';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
  };
}

export interface PendingItems {
  pendingReviews: Review[];
  pendingQuestions: Question[];
}

export const reviewService = {
  // Submit a review
  async submitReview(data: ReviewSubmission, token: string): Promise<{ success: boolean; message: string; review: Review }> {
    const response = await api.post('/api/reviews/reviews', data, {
      headers: createAuthHeaders(token)
    });
    return response.data;
  },

  // Submit a question
  async submitQuestion(data: QuestionSubmission, token: string): Promise<{ success: boolean; message: string; question: Question }> {
    const response = await api.post('/api/reviews/questions', data, {
      headers: createAuthHeaders(token)
    });
    return response.data;
  },

  // Get user's pending reviews and questions
  async getPendingItems(token: string): Promise<{ success: boolean; pendingReviews: Review[]; pendingQuestions: Question[] }> {
    const response = await api.get('/api/reviews/user/pending', {
      headers: createAuthHeaders(token)
    });
    return response.data;
  },

  // Get user's pending reviews and questions for a specific product
  async getProductPendingItems(productId: number, token: string): Promise<{ success: boolean; pendingReviews: Review[]; pendingQuestions: Question[] }> {
    const response = await api.get(`/api/reviews/product/${productId}/pending`, {
      headers: createAuthHeaders(token)
    });
    return response.data;
  },

  // Update a pending review
  async updateReview(reviewId: number, data: ReviewSubmission, token: string): Promise<{ 
    success: boolean; 
    message: string; 
    review: Review;
    statusChanged?: boolean;
  }> {
    const response = await api.put(`/api/reviews/reviews/${reviewId}`, data, {
      headers: createAuthHeaders(token)
    });
    return response.data;
  },

  // Delete a pending review
  async deleteReview(reviewId: number, token: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/api/reviews/reviews/${reviewId}`, {
      headers: createAuthHeaders(token)
    });
    return response.data;
  },

  // Update a pending question
  async updateQuestion(questionId: number, data: QuestionSubmission, token: string): Promise<{ success: boolean; message: string; question: Question }> {
    const response = await api.put(`/api/reviews/questions/${questionId}`, data, {
      headers: createAuthHeaders(token)
    });
    return response.data;
  },

  // Delete a question
  async deleteQuestion(questionId: number, token: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await api.delete(`/api/reviews/questions/${questionId}`, {
      headers: createAuthHeaders(token)
    });
    return response.data;
  },

  // Create a reply to a review
  async createReply(reviewId: number, reply: string, token: string): Promise<{
    success: boolean;
    message: string;
    reply: any;
  }> {
    const response = await api.post(`/api/reviews/reviews/${reviewId}/replies`, {
      reply
    }, {
      headers: createAuthHeaders(token)
    });
    return response.data;
  },

  // Update a reply
  async updateReply(replyId: number, reply: string, token: string): Promise<{
    success: boolean;
    message: string;
    reply: any;
  }> {
    const response = await api.put(`/api/reviews/replies/${replyId}`, {
      reply
    }, {
      headers: createAuthHeaders(token)
    });
    return response.data;
  },

  // Delete a reply
  async deleteReply(replyId: number, token: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await api.delete(`/api/reviews/replies/${replyId}`, {
      headers: createAuthHeaders(token)
    });
    return response.data;
  },

  // Get replies for a review
  async getReplies(reviewId: number): Promise<{
    success: boolean;
    replies: any[];
  }> {
    const response = await api.get(`/api/reviews/reviews/${reviewId}/replies`);
    return response.data;
  },

  // Get product reviews (approved only)
  async getProductReviews(productId: number, page: number = 1, limit: number = 10, rating?: number, sort?: string): Promise<{
    success: boolean;
    reviews: Review[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (rating) {
      params.append('rating', rating.toString());
    }

    if (sort) {
      params.append('sort', sort);
    }

    const response = await api.get(`/api/reviews/product/${productId}/reviews?${params}`);
    return response.data;
  },

  // Get product reviews with user's pending reviews (authenticated)
  async getProductReviewsWithPending(productId: number, token: string, page: number = 1, limit: number = 10, rating?: number, sort?: string): Promise<{
    success: boolean;
    reviews: Review[];
    total: number;
    page: number;
    totalPages: number;
    userPendingCount: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (rating) {
      params.append('rating', rating.toString());
    }

    if (sort) {
      params.append('sort', sort);
    }

    const response = await api.get(`/api/reviews/product/${productId}/reviews/with-pending?${params}`, {
      headers: createAuthHeaders(token)
    });
    return response.data;
  },

  // Get product questions (approved only)
  async getProductQuestions(productId: number, page: number = 1, limit: number = 10): Promise<{
    success: boolean;
    questions: Question[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await api.get(`/api/reviews/product/${productId}/questions?${params}`);
    return response.data;
  },

  // Get current user info (database ID)
  async getCurrentUser(token: string): Promise<{
    success: boolean;
    user: {
      id: number;
      name: string;
      email: string;
      avatar?: string;
      role: string;
    };
  }> {
    const response = await api.get('/api/reviews/user/me', {
      headers: createAuthHeaders(token)
    });
    return response.data;
  },

  // Mark review as helpful
  async markReviewHelpful(reviewId: number, token: string): Promise<{
    success: boolean;
    message: string;
    isHelpful: boolean;
  }> {
    const response = await api.post(`/api/reviews/reviews/${reviewId}/helpful`, {}, {
      headers: createAuthHeaders(token)
    });
    return response.data;
  },

  // Report a review
  async reportReview(reviewId: number, reason: string, token: string): Promise<{
    success: boolean;
    message: string;
    isReported: boolean;
  }> {
    const response = await api.post(`/api/reviews/reviews/${reviewId}/report`, { reason }, {
      headers: createAuthHeaders(token)
    });
    return response.data;
  },

  // Get review interactions (helpful count and user's interactions)
  async getReviewInteractions(reviewId: number, token: string): Promise<{
    success: boolean;
    helpfulCount: number;
    isHelpful: boolean;
    isReported: boolean;
  }> {
    const response = await api.get(`/api/reviews/reviews/${reviewId}/interactions`, {
      headers: createAuthHeaders(token)
    });
    return response.data;
  }
};
