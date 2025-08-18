import { Product } from '../types';

// Format price as currency
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

// Get stock status with label and variant
export const getStockStatus = (product: Product) => {
  if (product.hasOutOfStock) {
    return { label: 'Out of Stock', variant: 'destructive' as const };
  }
  if (product.hasLowStock) {
    return { label: 'Low Stock', variant: 'secondary' as const };
  }
  return { label: 'In Stock', variant: 'default' as const };
};

// Get variant display summary
export const getVariantDisplay = (product: Product): string => {
  if (!product.variants || product.variants.length === 0) {
    return 'No variants';
  }
  
  const sizes = Array.from(new Set(product.variants.map(v => v.size)));
  const colors = Array.from(new Set(product.variants.map(v => v.color)));
  
  const sizeText = sizes.length > 0 ? `${sizes.length} size${sizes.length > 1 ? 's' : ''}` : '';
  const colorText = colors.length > 0 ? `${colors.length} color${colors.length > 1 ? 's' : ''}` : '';
  
  if (sizeText && colorText) {
    return `${sizeText}, ${colorText}`;
  }
  return sizeText || colorText || 'No variants';
};

// Check if image URL is valid
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Allow SVG files and uploads directory
  if (url.endsWith('.svg') || url.startsWith('/uploads/')) {
    return true;
  }
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Get the best available image URL for a product
export const getImageUrl = (product: Product): string => {
  if (!product.images || product.images.length === 0) {
    return '';
  }
  
  // First try to find the primary image
  const primaryImage = product.images.find(img => img.isPrimary && isValidImageUrl(img.url));
  if (primaryImage) return primaryImage.url;
  
  // Then try to find any valid image
  const validImage = product.images.find(img => isValidImageUrl(img.url));
  if (validImage) return validImage.url;
  
  // Return empty string if no valid images
  return '';
};

// Generate placeholder SVG for missing images
export const generatePlaceholderSVG = (size: 'small' | 'medium' | 'large' = 'medium'): string => {
  const dimensions = {
    small: { width: 80, height: 80 },
    medium: { width: 200, height: 200 },
    large: { width: 400, height: 400 }
  };
  
  const { width, height } = dimensions[size];
  
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#f3f4f6"/>
      <g transform="translate(${width/2}, ${height/2}) scale(${Math.min(width, height) / 200})">
        <!-- T-shirt body -->
        <path d="M-60 -40 L-40 -40 L-40 -20 L-60 -20 Z M40 -40 L60 -40 L60 -20 L40 -20 Z M-60 -40 L-60 60 L60 60 L60 -40 L40 -40 L40 -20 L-40 -20 L-40 -40 Z" 
              fill="#d1d5db" stroke="#9ca3af" stroke-width="2"/>
        <!-- Sleeves -->
        <path d="M-60 -40 L-80 -30 L-80 0 L-60 -20 Z M60 -40 L80 -30 L80 0 L60 -20 Z" 
              fill="#d1d5db" stroke="#9ca3af" stroke-width="2"/>
        <!-- Neck -->
        <path d="M-10 -20 L10 -20 L10 0 L-10 0 Z" 
              fill="#9ca3af"/>
      </g>
      <text x="${width/2}" y="${height - 20}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#6b7280">
        T-Shirt
      </text>
    </svg>
  `;
};

// Format date for display
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format date and time for display
export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Calculate discount percentage
export const calculateDiscountPercentage = (originalPrice: number, salePrice: number): number => {
  if (!originalPrice || !salePrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

// Validate product data before submission
export const validateProductData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.name?.trim()) errors.push('Product name is required');
  if (!data.description?.trim()) errors.push('Product description is required');
  if (!data.price || data.price <= 0) errors.push('Valid price is required');
  if (!data.categoryId) errors.push('Category is required');
  
  if (data.salePrice && data.salePrice >= data.price) {
    errors.push('Sale price must be less than regular price');
  }
  
  if (data.saleEndDate && new Date(data.saleEndDate) <= new Date()) {
    errors.push('Sale end date must be in the future');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
