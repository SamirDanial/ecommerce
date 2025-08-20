import { 
  Product, 
  Category, 
  ProductFilters, 
  CreateProductData, 
  UpdateProductData,
  ProductStats,
  ProductVariant
} from '../types';
import { createAuthHeaders } from '../lib/axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export class ProductService {
  // Fetch all products with minimal data for list display
  static async getProducts(filters: ProductFilters, token: string): Promise<{
    products: Product[];
    totalProducts: number;
    totalPages: number;
  }> {
    const headers = createAuthHeaders(token);
    
    const params = new URLSearchParams({
      page: filters.page.toString(),
      limit: filters.limit.toString(),
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder
    });

    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.status) params.append('status', filters.status);
    if (filters.featured) params.append('featured', filters.featured);
    if (filters.onSale) params.append('onSale', filters.onSale);
    if (filters.stockStatus) params.append('stockStatus', filters.stockStatus);


    const response = await fetch(
      `${API_BASE_URL}/api/admin/products?${params.toString()}`,
      { headers }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch products');
    }

    return response.json();
  }

  // Fetch a single product with full details (for edit/view dialogs)
  static async getProduct(id: number, token: string): Promise<Product> {
    const headers = createAuthHeaders(token);
    
    const response = await fetch(
      `${API_BASE_URL}/api/admin/products/${id}`,
      { headers }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch product');
    }

    return response.json();
  }

  // Create a new product
  static async createProduct(data: CreateProductData, token: string): Promise<Product> {
    const headers = createAuthHeaders(token);
    
    const response = await fetch(
      `${API_BASE_URL}/api/admin/products`,
      {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create product');
    }

    return response.json();
  }

  // Update an existing product
  static async updateProduct(data: UpdateProductData, token: string): Promise<Product> {
    const headers = createAuthHeaders(token);
    
    const response = await fetch(
      `${API_BASE_URL}/api/admin/products/${data.id}`,
      {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update product');
    }

    return response.json();
  }

  // Delete a product
  static async deleteProduct(id: number, token: string): Promise<void> {
    const headers = createAuthHeaders(token);
    
    const response = await fetch(
      `${API_BASE_URL}/api/admin/products/${id}`,
      {
        method: 'DELETE',
        headers
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete product');
    }
  }

  // Toggle product status
  static async toggleProductStatus(id: number, token: string): Promise<Product> {
    const headers = createAuthHeaders(token);
    
    const response = await fetch(
      `${API_BASE_URL}/api/admin/products/${id}/toggle-status`,
      {
        method: 'PATCH',
        headers
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to toggle product status');
    }

    return response.json();
  }

  // Update stock management settings
  static async updateStockManagement(
    productId: number,
    data: {
      lowStockThreshold: number;
      allowBackorder: boolean;
      variants: Array<{
        id: number;
        lowStockThreshold: number;
        allowBackorder: boolean;
      }>;
    },
    token: string
  ): Promise<Product> {
    const headers = createAuthHeaders(token);
    
    const response = await fetch(
      `${API_BASE_URL}/api/admin/products/${productId}/stock-management`,
      {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update stock management');
    }

    return response.json();
  }

  // Update stock quantities and management settings
  static async updateStockAndSettings(
    productId: number,
    data: {
      lowStockThreshold: number;
      allowBackorder: boolean;
      variants: Array<{
        id: number;
        stock: number;
        lowStockThreshold: number;
        allowBackorder: boolean;
      }>;
    },
    token: string
  ): Promise<Product> {
    const headers = createAuthHeaders(token);
    
    const response = await fetch(
      `${API_BASE_URL}/api/admin/products/${productId}/stock-and-settings`,
      {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update stock and settings');
    }

    return response.json();
  }

  // Get product variants for stock management
  static async getProductVariants(productId: number, token: string): Promise<ProductVariant[]> {
    const headers = createAuthHeaders(token);
    
    const response = await fetch(
      `${API_BASE_URL}/api/admin/products/${productId}/variants`,
      { headers }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch product variants');
    }

    return response.json();
  }

  // Get product statistics
  static async getProductStats(token: string): Promise<ProductStats> {
    const headers = createAuthHeaders(token);
    
    const response = await fetch(
      `${API_BASE_URL}/api/admin/products/stats`,
      { headers }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch product stats');
    }

    return response.json();
  }

  // Get all products for export (complete data)
  static async getProductsForExport(token: string): Promise<{
    products: Product[];
    totalProducts: number;
  }> {
    const headers = createAuthHeaders(token);
    
    const response = await fetch(
      `${API_BASE_URL}/api/admin/products/export`,
      { headers }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch products for export');
    }

    return response.json();
  }
}

export class CategoryService {
  // Fetch all categories (public endpoint, no auth required)
  static async getCategories(token?: string): Promise<Category[]> {
    // Categories endpoint is public, no auth required
    const response = await fetch(`${API_BASE_URL}/api/categories`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch categories');
    }

    return response.json();
  }
}
