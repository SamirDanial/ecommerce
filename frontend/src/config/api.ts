// API Configuration for different environments
export const API_CONFIG = {
  // Development
  development: {
    baseURL: 'http://localhost:5000',
    timeout: 10000,
  },
  
  // Production
  production: {
    baseURL: process.env.REACT_APP_API_URL || window.location.origin,
    timeout: 15000, // Longer timeout for production
  },
  
  // Test
  test: {
    baseURL: 'http://localhost:5000',
    timeout: 5000,
  }
};

// Get current environment
export const getCurrentEnvironment = () => {
  return process.env.NODE_ENV || 'development';
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

// Log configuration for debugging
export const logApiConfig = () => {
  const env = getCurrentEnvironment();
  const config = getApiConfig();
  
  console.log('🌐 API Configuration:');
  console.log('  Environment:', env);
  console.log('  Base URL:', config.baseURL);
  console.log('  Timeout:', config.timeout);
  console.log('  REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
};
