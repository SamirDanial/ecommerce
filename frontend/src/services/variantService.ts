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

class VariantService {
  private static baseUrl = '/api/admin/products';

  static async createVariant(productId: number, variantData: CreateVariantData, token: string): Promise<ProductVariant> {
    const response = await api.post(`${this.baseUrl}/${productId}/variants`, variantData, {
      headers: createAuthHeaders(token)
    });

    return response.data;
  }

  static async updateVariant(productId: number, variantId: number, variantData: UpdateVariantData, token: string): Promise<ProductVariant> {
    const response = await api.put(`${this.baseUrl}/${productId}/variants/${variantId}`, variantData, {
      headers: createAuthHeaders(token)
    });

    return response.data;
  }

  static async deleteVariant(productId: number, variantId: number, token: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${productId}/variants/${variantId}`, {
      headers: createAuthHeaders(token)
    });
  }

  static async getVariants(productId: number, token: string): Promise<ProductVariant[]> {
    const response = await api.get(`${this.baseUrl}/${productId}/variants`, {
      headers: createAuthHeaders(token)
    });

    return response.data;
  }
}

export default VariantService;
