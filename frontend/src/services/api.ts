import axios from 'axios';
import { User, Product, AuthResponse, FlashSale, Category } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/users/register', { name, email, password });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/users/login', { email, password });
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/profile');
    return response.data;
  },
};

// Category services
export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Category> => {
    const response = await api.get(`/categories/${slug}`);
    return response.data;
  },

  getProducts: async (slug: string, limit: number = 50): Promise<Product[]> => {
    const response = await api.get(`/products?category=${slug}&limit=${limit}`);
    return response.data;
  },
};

// Product services
export const productService = {
  getAll: async (params?: {
    category?: string;
    search?: string;
    sort?: string;
    limit?: number;
    page?: number;
    size?: string;
    color?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    rating?: string;
  }): Promise<Product[]> => {
    const queryParams = new URLSearchParams();
    
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size);
    if (params?.color) queryParams.append('color', params.color);
    if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params?.inStock) queryParams.append('inStock', params.inStock.toString());
    if (params?.rating) queryParams.append('rating', params.rating);

    const response = await api.get(`/products?${queryParams.toString()}`);
    return response.data;
  },

  getFeatured: async (): Promise<Product[]> => {
    const response = await api.get('/products/featured');
    return response.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Product> => {
    const response = await api.get(`/products/slug/${slug}`);
    return response.data;
  },

  getRelated: async (id: number): Promise<Product[]> => {
    const response = await api.get(`/products/${id}/related`);
    return response.data;
  },

  // New method for lazy loading color-specific images
  getImagesByColor: async (productId: number, color: string): Promise<{
    images: any[];
    isColorSpecific: boolean;
    totalImages: number;
    colorImagesFound: number;
  }> => {
    const response = await api.get(`/products/${productId}/images/${encodeURIComponent(color)}`);
    return response.data;
  },

  create: async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    const response = await api.post('/products', product);
    return response.data;
  },

  update: async (id: string, product: Partial<Product>): Promise<Product> => {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

// Search services
export const searchService = {
  search: async (query: string): Promise<{ products: any[]; categories: any[] }> => {
    const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};

// Flash sale services
export const flashSaleService = {
  getActive: async (): Promise<FlashSale[]> => {
    const response = await api.get('/products/flash-sales/active');
    return response.data;
  },
};

export default api;
