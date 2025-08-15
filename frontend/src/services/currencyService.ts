import api from '../lib/axios';

export interface CurrencyConfig {
  id: number;
  code: string;
  name: string;
  symbol: string;
  rate: number;
  isActive: boolean;
  isDefault: boolean;
  decimals: number;
  position: 'before' | 'after';
  createdAt: string;
  updatedAt: string;
}

export interface CurrencyConversion {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  convertedAmount: number;
  rate: number;
}

export interface FormattedCurrency {
  amount: number;
  currency: string;
  formatted: string;
  symbol: string;
  position: 'before' | 'after';
  decimals: number;
}

export class CurrencyService {
  /**
   * Get all active currencies
   */
  static async getAllCurrencies(): Promise<CurrencyConfig[]> {
    try {
      const response = await api.get('/api/currencies');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching currencies:', error);
      throw new Error('Failed to fetch currencies');
    }
  }

  /**
   * Get currency by code
   */
  static async getCurrencyByCode(code: string): Promise<CurrencyConfig | null> {
    try {
      const response = await api.get(`/api/currencies/${code}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching currency:', error);
      return null;
    }
  }

  /**
   * Get default currency
   */
  static async getDefaultCurrency(): Promise<CurrencyConfig | null> {
    try {
      const response = await api.get('/api/currencies/default');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching default currency:', error);
      return null;
    }
  }

  /**
   * Convert amount between currencies
   */
  static async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<CurrencyConversion> {
    try {
      const response = await api.post('/api/currencies/convert', {
        amount,
        fromCurrency,
        toCurrency
      });
      return response.data.data;
    } catch (error) {
      console.error('Error converting currency:', error);
      throw new Error('Failed to convert currency');
    }
  }

  /**
   * Get exchange rates for a base currency
   */
  static async getExchangeRates(baseCurrency: string = 'USD'): Promise<Record<string, number>> {
    try {
      const response = await api.get(`/api/currencies/exchange-rates?base=${baseCurrency}`);
      return response.data.data.rates;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      throw new Error('Failed to fetch exchange rates');
    }
  }

  /**
   * Format amount with currency symbol
   */
  static async formatCurrency(amount: number, currencyCode: string): Promise<FormattedCurrency> {
    try {
      const response = await api.post('/api/currencies/format', {
        amount,
        currencyCode
      });
      return response.data.data;
    } catch (error) {
      console.error('Error formatting currency:', error);
      throw new Error('Failed to format currency');
    }
  }

  /**
   * Get currencies supported by Stripe
   */
  static async getStripeSupportedCurrencies(): Promise<string[]> {
    try {
      const response = await api.get('/api/currencies/stripe-supported');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching Stripe supported currencies:', error);
      throw new Error('Failed to fetch Stripe supported currencies');
    }
  }

  /**
   * Format currency locally (fallback when API is not available)
   */
  static formatCurrencyLocal(amount: number, currency: CurrencyConfig): string {
    const formattedAmount = amount.toFixed(currency.decimals);
    
    if (currency.position === 'before') {
      return `${currency.symbol}${formattedAmount}`;
    } else {
      return `${formattedAmount}${currency.symbol}`;
    }
  }

  /**
   * Get fallback currencies for offline use
   */
  static getFallbackCurrencies(): CurrencyConfig[] {
    return [
      { id: 1, code: 'USD', name: 'US Dollar', symbol: '$', rate: 1, isActive: true, isDefault: true, decimals: 2, position: 'before', createdAt: '', updatedAt: '' },
      { id: 2, code: 'EUR', name: 'Euro', symbol: '€', rate: 0.85, isActive: true, isDefault: false, decimals: 2, position: 'before', createdAt: '', updatedAt: '' },
      { id: 3, code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.73, isActive: true, isDefault: false, decimals: 2, position: 'before', createdAt: '', updatedAt: '' },
      { id: 4, code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 110, isActive: true, isDefault: false, decimals: 0, position: 'before', createdAt: '', updatedAt: '' },
      { id: 5, code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 6.45, isActive: true, isDefault: false, decimals: 2, position: 'before', createdAt: '', updatedAt: '' },
      { id: 6, code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 74.5, isActive: true, isDefault: false, decimals: 2, position: 'before', createdAt: '', updatedAt: '' },
      { id: 7, code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', rate: 280, isActive: true, isDefault: false, decimals: 2, position: 'before', createdAt: '', updatedAt: '' }
    ];
  }
}

export default CurrencyService;
