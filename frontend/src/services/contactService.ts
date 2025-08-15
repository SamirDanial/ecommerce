import api from './api';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    submittedAt: string;
  };
  errors?: any[];
}

export interface ContactMessagesResponse {
  success: boolean;
  data: {
    messages: ContactMessage[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ContactStatsResponse {
  success: boolean;
  data: {
    total: number;
    byStatus: {
      pending: number;
      read: number;
      replied: number;
      archived: number;
    };
    recentActivity: number;
  };
}

export const contactService = {
  // Submit contact form (public)
  submitForm: async (formData: ContactFormData): Promise<ContactResponse> => {
    try {
      const response = await api.post('/contact/submit', formData);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error(error.message || 'Failed to submit contact form');
    }
  },

  // Get all contact messages (admin only)
  getMessages: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ContactMessagesResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const response = await api.get(`/contact/messages?${queryParams.toString()}`);
    return response.data;
  },

  // Get single contact message (admin only)
  getMessage: async (id: number): Promise<{ success: boolean; data: ContactMessage }> => {
    const response = await api.get(`/contact/messages/${id}`);
    return response.data;
  },

  // Update message status (admin only)
  updateMessageStatus: async (id: number, status: string): Promise<{ success: boolean; message: string; data: ContactMessage }> => {
    const response = await api.patch(`/contact/messages/${id}/status`, { status });
    return response.data;
  },

  // Delete contact message (admin only)
  deleteMessage: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/contact/messages/${id}`);
    return response.data;
  },

  // Get contact statistics (admin only)
  getStats: async (): Promise<ContactStatsResponse> => {
    const response = await api.get('/contact/stats');
    return response.data;
  },
};

export default contactService;

