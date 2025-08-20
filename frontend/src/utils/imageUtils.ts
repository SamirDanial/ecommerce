import { debugEnvironment } from './debugEnv';

/**
 * Get the correct base URL for images
 * Images are served from the main server, not from the API endpoint
 */
export const getImageBaseUrl = (): string => {
  // Debug environment variables
  debugEnvironment();
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  
  console.log('getImageBaseUrl debug:', {
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    apiUrl,
    result: apiUrl.endsWith('/api') ? apiUrl.replace('/api', '') : apiUrl
  });
  
  // If the API URL ends with /api, remove it to get the base server URL
  if (apiUrl.endsWith('/api')) {
    return apiUrl.replace('/api', '');
  }
  
  // If it's already the base server URL, use it as is
  return apiUrl;
};

/**
 * Convert a relative image URL to a full URL
 * @param imageUrl - The relative image URL (e.g., /uploads/products/image.jpg)
 * @returns Full image URL
 */
export const getFullImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return '';
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // If it's a relative URL, prepend the image base URL
  const baseUrl = getImageBaseUrl();
  const fullUrl = `${baseUrl}${imageUrl}`;
  
  console.log('getFullImageUrl debug:', {
    imageUrl,
    baseUrl,
    fullUrl
  });
  
  return fullUrl;
};

/**
 * Check if an image URL is valid
 * @param imageUrl - The image URL to check
 * @returns boolean
 */
export const isValidImageUrl = (imageUrl: string): boolean => {
  if (!imageUrl) return false;
  
  // Check if it's a valid image file extension
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const hasValidExtension = validExtensions.some(ext => 
    imageUrl.toLowerCase().includes(ext)
  );
  
  return hasValidExtension;
};
