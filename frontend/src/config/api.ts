// API Configuration using environment variables
export const API_CONFIG = {
  // Development
  development: {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
  },
  
  // Production
  production: {
    baseURL: process.env.REACT_APP_API_URL || window.location.origin + '/api',
    timeout: 15000, // Longer timeout for production
  },
  
  // Test
  test: {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 5000,
  }
};

// Get current environment
export const getCurrentEnvironment = () => {
  return process.env.REACT_APP_ENVIRONMENT || process.env.NODE_ENV || 'development';
};

// Get API config for current environment
export const getApiConfig = () => {
  const env = getCurrentEnvironment();
  return API_CONFIG[env as keyof typeof API_CONFIG] || API_CONFIG.development;
};

// Get base URL for current environment
export const getApiBaseUrl = () => {
  const config = getApiConfig();
  return config.baseURL;
};

// Log configuration for debugging (only in development)
export const logApiConfig = () => {
  if (process.env.NODE_ENV === 'development') {
    const env = getCurrentEnvironment();
    const config = getApiConfig();
    console.log('API Config:', { environment: env, baseURL: config.baseURL });
  }
};
