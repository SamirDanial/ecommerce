import axios from 'axios';
import { getApiConfig, logApiConfig } from '../config/api';

// Log configuration for debugging
logApiConfig();

// Create axios instance with default config
const api = axios.create({
  baseURL: getApiConfig().baseURL,
  timeout: getApiConfig().timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Token will be added manually in each request for now
    // This gives us more control over when and how tokens are used
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.warn('Unauthorized request');
    }
    return Promise.reject(error);
  }
);

// Helper function to create authenticated requests
export const createAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

export default api;
