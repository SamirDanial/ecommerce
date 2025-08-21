import api from '../lib/axios';

export interface VariantStockInfo {
  id: number;
  size: string;
  color: string;
  colorCode?: string;
  stock: number;
  price?: number;
  comparePrice?: number;
  sku?: string;
  stockStatus: string;
  lowStockThreshold: number;
  allowBackorder: boolean;
  finalPrice: number;
  finalComparePrice?: number;
  isOnSale: boolean;
  salePrice?: number;
  saleEndDate?: string;
}

export interface ColorInfo {
  color: string;
  colorCode?: string;
  totalStock: number;
  hasStock: boolean;
  availableSizes: number;
}

export interface VariantsByColorResponse {
  product: {
    id: number;
    name: string;
    basePrice: number;
    isOnSale: boolean;
    salePrice?: number;
    saleEndDate?: string;
    comparePrice?: number;
  };
  color: string;
  variants: VariantStockInfo[];
  stockSummary: {
    totalVariants: number;
    inStock: number;
    outOfStock: number;
    lowStock: number;
    availableSizes: string[];
  };
  defaultVariant: VariantStockInfo;
}

export interface ProductColorsResponse {
  productId: number;
  colors: ColorInfo[];
  totalColors: number;
}

class ClientVariantService {
  private static baseUrl = '/products';

  // Get all available colors for a product
  static async getProductColors(productId: number): Promise<ProductColorsResponse> {
    const response = await api.get(`${this.baseUrl}/${productId}/colors`);
    return response.data;
  }

  // Get variants for a specific color with pricing and stock info
  static async getVariantsByColor(productId: number, color: string): Promise<VariantsByColorResponse> {
    const response = await api.get(`${this.baseUrl}/${productId}/variants/${encodeURIComponent(color)}`);
    return response.data;
  }

  // Get the best price for a color (lowest available price)
  static async getBestPriceForColor(productId: number, color: string): Promise<{
    price: number;
    comparePrice?: number;
    isOnSale: boolean;
    salePrice?: number;
  }> {
    try {
      const variants = await this.getVariantsByColor(productId, color);
      if (variants.variants.length === 0) {
        throw new Error('No variants found for this color');
      }

      // Find the variant with the lowest price
      const lowestPriceVariant = variants.variants.reduce((lowest, current) => {
        const currentPrice = current.finalPrice;
        const lowestPrice = lowest.finalPrice;
        return currentPrice < lowestPrice ? current : lowest;
      });

      return {
        price: lowestPriceVariant.finalPrice,
        comparePrice: lowestPriceVariant.finalComparePrice,
        isOnSale: variants.product.isOnSale,
        salePrice: variants.product.salePrice
      };
    } catch (error) {
      console.error('Error getting best price for color:', error);
      throw error;
    }
  }

  // Check if a specific size is available for a color
  static async isSizeAvailable(productId: number, color: string, size: string): Promise<boolean> {
    try {
      const variants = await this.getVariantsByColor(productId, color);
      return variants.variants.some(v => v.size === size && (v.stock > 0 || v.allowBackorder));
    } catch (error) {
      console.error('Error checking size availability:', error);
      return false;
    }
  }

  // Get available sizes for a color
  static async getAvailableSizes(productId: number, color: string): Promise<string[]> {
    try {
      const variants = await this.getVariantsByColor(productId, color);
      return variants.stockSummary.availableSizes;
    } catch (error) {
      console.error('Error getting available sizes:', error);
      return [];
    }
  }
}

export default ClientVariantService;
