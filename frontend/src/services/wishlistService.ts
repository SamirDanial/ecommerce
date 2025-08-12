import api, { createAuthHeaders } from '../lib/axios';
import { Product } from '../types';

export interface WishlistItem {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
  product: Product;
}

export const wishlistService = {
  // Get user's wishlist
  getWishlist: async (token: string) => {
    try {
      if (!token) {
        throw new Error('Authentication token is required');
      }

      const response = await api.get('/api/wishlist', {
        headers: createAuthHeaders(token),
      });
      
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please sign in again.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error(error.message || 'Failed to fetch wishlist');
      }
    }
  },

  // Add item to wishlist
  addToWishlist: async (token: string, productId: number) => {
    try {
      if (!token) {
        throw new Error('Authentication token is required');
      }

      const response = await api.post('/api/wishlist', 
        { productId },
        { headers: createAuthHeaders(token) }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please sign in again.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data?.error || 'Invalid request');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(error.message || 'Failed to add item to wishlist');
      }
    }
  },

  // Remove item from wishlist
  removeFromWishlist: async (token: string, productId: number) => {
    try {
      if (!token) {
        throw new Error('Authentication token is required');
      }

      const response = await api.delete(`/api/wishlist/${productId}`, {
        headers: createAuthHeaders(token),
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please sign in again.');
      } else if (error.response?.status === 404) {
        throw new Error('Wishlist item not found');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(error.message || 'Failed to remove item from wishlist');
      }
    }
  },

  // Clear entire wishlist
  clearWishlist: async (token: string) => {
    try {
      if (!token) {
        throw new Error('Authentication token is required');
      }

      const response = await api.delete('/api/wishlist', {
        headers: createAuthHeaders(token),
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please sign in again.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(error.message || 'Failed to clear wishlist');
      }
    }
  },

  // Check if product is in wishlist
  checkWishlistStatus: async (token: string, productId: number) => {
    try {
      if (!token) {
        throw new Error('Authentication token is required');
      }

      const response = await api.get(`/api/wishlist/check/${productId}`, {
        headers: createAuthHeaders(token),
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please sign in again.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(error.message || 'Failed to check wishlist status');
      }
    }
  }
};
