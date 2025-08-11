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
    const response = await api.get('/api/wishlist', {
      headers: createAuthHeaders(token),
    });
    return response.data;
  },

  // Add item to wishlist
  addToWishlist: async (token: string, productId: number) => {
    const response = await api.post('/api/wishlist', 
      { productId },
      { headers: createAuthHeaders(token) }
    );
    return response.data;
  },

  // Remove item from wishlist
  removeFromWishlist: async (token: string, productId: number) => {
    const response = await api.delete(`/api/wishlist/${productId}`, {
      headers: createAuthHeaders(token),
    });
    return response.data;
  },

  // Clear entire wishlist
  clearWishlist: async (token: string) => {
    const response = await api.delete('/api/wishlist', {
      headers: createAuthHeaders(token),
    });
    return response.data;
  },

  // Check if product is in wishlist
  checkWishlistStatus: async (token: string, productId: number) => {
    const response = await api.get(`/api/wishlist/check/${productId}`, {
      headers: createAuthHeaders(token),
    });
    return response.data;
  }
};
