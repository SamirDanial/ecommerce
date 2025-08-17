// API Configuration
export const API_CONFIG = {
  // Backend API base URL
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  
  // API endpoints
  ENDPOINTS: {
    ADMIN: {
      LOCALIZATION: {
        LANGUAGES: '/api/admin/localization/languages',
        CURRENCIES: '/api/admin/localization/currencies',
        COUNTRIES: '/api/admin/localization/countries',
      }
    }
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
