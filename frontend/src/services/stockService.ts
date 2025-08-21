import api from '../lib/axios';

export interface StockCheckItem {
  productId: number;
  size: string;
  color: string;
  quantity: number;
}

export interface StockCheckResult {
  productId: number;
  size: string;
  color: string;
  quantity: number;
  available: boolean;
  currentStock: number;
  allowBackorder: boolean;
  isLowStock: boolean;
  error: string | null;
}

export interface StockCheckResponse {
  success: boolean;
  allAvailable: boolean;
  results: StockCheckResult[];
}

class StockService {
  private static baseUrl = '/products';

  /**
   * Check stock availability for multiple items before placing an order
   */
  static async checkStockAvailability(items: StockCheckItem[]): Promise<StockCheckResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/check-stock`, { items });
      return response.data;
    } catch (error) {
      console.error('Error checking stock availability:', error);
      throw new Error('Failed to check stock availability');
    }
  }

  /**
   * Check if a single variant has sufficient stock
   */
  static async checkVariantStock(
    productId: number, 
    size: string, 
    color: string, 
    quantity: number
  ): Promise<StockCheckResult> {
    const items = [{ productId, size, color, quantity }];
    const response = await this.checkStockAvailability(items);
    return response.results[0];
  }

  /**
   * Validate cart items for stock availability
   */
  static async validateCartStock(cartItems: any[]): Promise<{
    valid: boolean;
    results: StockCheckResult[];
    errors: string[];
  }> {
    try {
      const stockCheckItems: StockCheckItem[] = cartItems.map(item => ({
        productId: item.id,
        size: item.selectedSize || item.size,
        color: item.selectedColor || item.color,
        quantity: item.quantity
      }));

      const response = await this.checkStockAvailability(stockCheckItems);
      
      const errors = response.results
        .filter(result => !result.available)
        .map(result => 
          `${result.color} ${result.size}: ${result.error || 'Insufficient stock'}`
        );

      return {
        valid: response.allAvailable,
        results: response.results,
        errors
      };
    } catch (error) {
      console.error('Error validating cart stock:', error);
      return {
        valid: false,
        results: [],
        errors: ['Failed to check stock availability']
      };
    }
  }
}

export default StockService;
