import api, { createAuthHeaders } from '../lib/axios';

export interface CreateVariantData {
  size: string;
  color: string;
  colorCode?: string;
  stock: number;
  sku?: string;
  price?: number;
  comparePrice?: number;
  isActive: boolean;
}

export interface UpdateVariantData extends Partial<CreateVariantData> {
  id: number;
}

export interface ProductVariant {
  id: number;
  productId: number;
  size: string;
  color: string;
  colorCode?: string;
  stock: number;
  sku?: string;
  price?: number;
  comparePrice?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VariantOperation {
  action: 'create' | 'update' | 'delete';
  id?: number;
  size?: string;
  color?: string;
  colorCode?: string;
  stock?: number;
  sku?: string;
  price?: number;
  comparePrice?: number;
  isActive?: boolean;
}

class VariantService {
  private static baseUrl = '/admin/products';

  // Single method to save all variant changes (create, update, delete)
  static async saveVariants(productId: number, variants: VariantOperation[], token: string): Promise<any> {
    const response = await api.put(`${this.baseUrl}/${productId}/variants`, { variants }, {
      headers: createAuthHeaders(token)
    });
    return response.data;
  }

  // Get variants for a product
  static async getVariants(productId: number, token: string): Promise<ProductVariant[]> {
    const response = await api.get(`${this.baseUrl}/${productId}/variants`, {
      headers: createAuthHeaders(token)
    });
    return response.data;
  }
}

export default VariantService;
