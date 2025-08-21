import api, { createAuthHeaders } from '../lib/axios';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedOrdersResponse {
  orders: Order[];
  pagination: PaginationMeta;
}

export interface Order {
  id: number;
  orderNumber: string;
  createdAt: string;
  status: string;
  currentStatus: string;
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    notes?: string;
    updatedBy?: string;
  }>;
  lastStatusUpdate: string;
  estimatedDelivery?: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  currency: string;
  trackingNumber?: string;
  
  // Address fields stored directly in Order
  shippingFirstName?: string;
  shippingLastName?: string;
  shippingCompany?: string;
  shippingAddress1?: string;
  shippingAddress2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  shippingPhone?: string;
  
  // User information
  user?: {
    id: number;
    name: string;
    email: string;
  };
  
  // Order items
  items: OrderItem[];
  
  // Payment information
  paymentStatus: string;
  paymentMethodId?: number;
  
  // Order notes
  notes?: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  variantId?: number;
  productName: string;
  productSku?: string;
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
  color?: string;
  quantity: number;
  price: number;
  total: number;
  createdAt: string;
  product?: {
    id: number;
    name: string;
    images?: Array<{
      id: number;
      url: string;
      alt?: string;
      isPrimary?: boolean;
    }>;
  };
}

export interface Address {
  id: number;
  type: 'SHIPPING' | 'BILLING';
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: number;
  type: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export interface UserPreferences {
  id?: number;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  marketingEmails?: boolean;
  orderUpdates?: boolean;
  promotionalOffers?: boolean;
  newsletter?: boolean;
  language?: string;
  currency?: string; // Updated to support all backend currencies
  timezone?: string;
}

export interface UserSession {
  id: number;
  deviceInfo: string;
  ipAddress: string;
  lastActivity: string;
  isActive: boolean;
  createdAt: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Profile API functions
export const profileService = {
  // Get user orders with pagination
  getOrders: async (token: string, page: number = 1, limit: number = 3): Promise<PaginatedOrdersResponse> => {
    const response = await api.get(`/profile/orders?page=${page}&limit=${limit}`, {
      headers: createAuthHeaders(token),
    });
    return response.data;
  },

  // Get user addresses
  getAddresses: async (token: string) => {
    const response = await api.get('/profile/addresses', {
      headers: createAuthHeaders(token),
    });
    return response.data;
  },

  // Get user payment methods
  getPaymentMethods: async (token: string) => {
    const response = await api.get('/profile/payment-methods', {
      headers: createAuthHeaders(token),
    });
    return response.data;
  },

  // Get user preferences
  getPreferences: async (token: string) => {
    const response = await api.get('/profile/preferences', {
      headers: createAuthHeaders(token),
    });
    return response.data;
  },

  // Update user preferences
  updatePreferences: async (token: string, preferences: UserPreferences) => {
    const response = await api.put('/profile/preferences', 
      preferences,
      { headers: createAuthHeaders(token) }
    );
    return response.data;
  },

  // Delete address
  deleteAddress: async (token: string, addressId: number) => {
    const response = await api.delete(`/profile/addresses/${addressId}`, {
      headers: createAuthHeaders(token),
    });
    return response.data;
  },

  // Delete payment method
  deletePaymentMethod: async (token: string, methodId: number) => {
    const response = await api.delete(`/profile/payment-methods/${methodId}`, {
      headers: createAuthHeaders(token),
    });
    return response.data;
  },

  // Add new address
  addAddress: async (token: string, address: Omit<Address, 'id'>) => {
    const response = await api.post('/profile/addresses', 
      address,
      { headers: createAuthHeaders(token) }
    );
    return response.data;
  },

  // Update address
  updateAddress: async (token: string, addressId: number, address: Partial<Address>) => {
    const response = await api.put(`/profile/addresses/${addressId}`, 
      address,
      { headers: createAuthHeaders(token) }
    );
    return response.data;
  },

  // Add new payment method
  addPaymentMethod: async (token: string, paymentMethod: Omit<PaymentMethod, 'id'>) => {
    const response = await api.post('/profile/payment-methods', 
      paymentMethod,
      { headers: createAuthHeaders(token) }
    );
    return response.data;
  },

  // Update payment method
  updatePaymentMethod: async (token: string, methodId: number, paymentMethod: Partial<PaymentMethod>) => {
    const response = await api.put(`/profile/payment-methods/${methodId}`, 
      paymentMethod,
      { headers: createAuthHeaders(token) }
    );
    return response.data;
  },

  // Change password
  changePassword: async (token: string, passwordData: ChangePasswordRequest) => {
    const response = await api.put('/profile/change-password', 
      passwordData,
      { headers: createAuthHeaders(token) }
    );
    return response.data;
  },

  // Get user sessions
  getSessions: async (token: string) => {
    const response = await api.get('/profile/sessions', {
      headers: createAuthHeaders(token),
    });
    return response.data;
  },

  // Revoke session
  revokeSession: async (token: string, sessionId: number) => {
    const response = await api.delete(`/profile/sessions/${sessionId}`, {
      headers: createAuthHeaders(token),
    });
    return response.data;
  },
};
