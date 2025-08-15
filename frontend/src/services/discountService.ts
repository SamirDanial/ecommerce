import api from '../lib/axios';

export interface DiscountCode {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  startsAt: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  calculatedAmount?: number;
}

export interface DiscountValidationResponse {
  isValid: boolean;
  discount?: DiscountCode;
  discountAmount?: number;
  message?: string;
}

// Validate a discount code
export const validateDiscountCode = async (code: string, subtotal: number, token?: string): Promise<DiscountValidationResponse> => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post('/api/discounts/validate', {
      code: code.trim().toUpperCase(),
      subtotal
    }, { headers });
    
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return {
        isValid: false,
        message: 'Discount code not found'
      };
    } else if (error.response?.status === 400) {
      return {
        isValid: false,
        message: error.response.data.message || 'Invalid discount code'
      };
    } else {
      console.error('Failed to validate discount code:', error);
      return {
        isValid: false,
        message: 'Failed to validate discount code'
      };
    }
  }
};

// Get discount code details
export const getDiscountCode = async (code: string, token?: string): Promise<DiscountCode | null> => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get(`/api/discounts/${code}`, { headers });
    return response.data;
  } catch (error) {
    console.error('Failed to get discount code:', error);
    return null;
  }
};
