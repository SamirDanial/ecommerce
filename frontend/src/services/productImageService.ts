import api, { createAuthHeaders, createFileUploadHeaders } from '../lib/axios';
import { ProductImage } from '../types';

export interface UploadImageData {
  color?: string;
  alt?: string;
  sortOrder?: number;
}

export interface UpdateImageData {
  sortOrder?: number;
  isPrimary?: boolean;
  color?: string;
  alt?: string;
}

class ProductImageService {
  private static baseUrl = '/api/admin/products';

  static async getProductImages(productId: number, token: string): Promise<ProductImage[]> {
    const response = await api.get(`${this.baseUrl}/${productId}/images`, {
      headers: createAuthHeaders(token)
    });
    return response.data;
  }

  static async uploadImage(
    productId: number, 
    file: File, 
    data: UploadImageData, 
    token: string
  ): Promise<any> {
    const formData = new FormData();
    
    // Debug: Log what we're adding to FormData
    console.log('Creating FormData with:', { productId, file: file.name, data });
    
    // Add single image with key 'image' (not 'images')
    console.log('Adding file:', { name: file.name, size: file.size, type: file.type });
    formData.append('image', file);
    
    if (data.color) {
      console.log('Adding color:', data.color);
      formData.append('color', data.color);
    }
    if (data.alt) {
      console.log('Adding alt:', data.alt);
      formData.append('alt', data.alt);
    }
    if (data.sortOrder) {
      console.log('Adding sortOrder:', data.sortOrder);
      formData.append('sortOrder', data.sortOrder.toString());
    }

    // Debug: Log FormData contents
    console.log('FormData created, sending request...');
    
    // Debug: Check FormData contents
    for (let [key, value] of Array.from(formData.entries())) {
      console.log('FormData entry:', key, value);
    }
    
    // Debug: Check if file is actually in FormData
    const imageFile = formData.get('image');
    console.log('Image file from FormData:', imageFile);
    console.log('Image file type:', imageFile instanceof File ? 'File' : typeof imageFile);
    if (imageFile instanceof File) {
      console.log('File details:', { name: imageFile.name, size: imageFile.size, type: imageFile.type });
    }
    
    // Debug: Log the headers being sent
    const headers = createFileUploadHeaders(token);
    console.log('Request headers:', headers);
    
    const response = await api.post(`${this.baseUrl}/${productId}/images`, formData, {
      headers: headers
    });
    return response.data;
  }

  static async updateImage(
    productId: number, 
    imageId: number, 
    data: UpdateImageData, 
    token: string
  ): Promise<ProductImage> {
    const response = await api.patch(`${this.baseUrl}/${productId}/images/${imageId}`, data, {
      headers: createAuthHeaders(token)
    });
    return response.data;
  }

  static async deleteImage(
    productId: number, 
    imageId: number, 
    token: string
  ): Promise<any> {
    const response = await api.delete(`${this.baseUrl}/${productId}/images/${imageId}`, {
      headers: createAuthHeaders(token)
    });
    return response.data;
  }
}

export default ProductImageService;
